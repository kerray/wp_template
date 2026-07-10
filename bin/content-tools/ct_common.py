#!/usr/bin/env python3
"""ct_common — shared helpers for the WP->headless content-conversion toolkit.

Python 3 stdlib only. Imported by divi_extract.py, html2md.py, divi2blocks.py
and content_inventory.py. Holds:

  * config loading (content-conversion.config.json) + sane defaults
  * the DIVI shortcode-tree parser (tolerant of unbalanced tags)
  * chrome detection (global modules, disabled_on, spacer/wave sections,
    footer signatures, breadcrumb shortcodes) driven by the config
  * shortcode-corruption repair (span-wrapped attrs, texturized quotes)
  * the functional-shortcode allowlist matcher
  * palette hex->slug nearest-match

None of these touch the database or the network.
"""
from __future__ import annotations
import json
import os
import re

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------

# Built-in fallback so the tools still run with no config file. These are
# GENERIC placeholders; a real site supplies content-conversion.config.json.
DEFAULT_CONFIG = {
    "site": "unknown",
    "table_prefix": "wp_",
    "chrome": {
        "global_modules": [],
        "disabled_on_values": ["on|on|on"],
        "breadcrumb_shortcodes": ["wpseo_breadcrumb", "yoast-breadcrumb"],
        "footer_text_signatures": [],
        "wave_divider_attrs": ["top_divider_style", "bottom_divider_style"],
        "content_modules": [
            "text", "image", "blurb", "accordion", "toggle", "gallery",
            "button", "code", "cta", "tabs", "video", "audio", "slider",
        ],
    },
    "functional_shortcode_allowlist": [
        "akce", "kalendar", "pdfjs-viewer", "pdf-embedder",
        "contact-form-7", "wpforms", "gallery", "rml_file_list",
    ],
    "allowed_block_namespaces": [],
    "palette": {},
    "inventory": {
        "post_types": ["page", "post"],
        "statuses": ["publish", "draft", "private", "pending", "future"],
        "curated_slugs": [],
        "expected_skips": [],
        "layout_modules": [
            "tabs", "toggle", "accordion", "slider", "gallery", "blurb",
            "counter", "number_counter", "circle_counter", "pricing_tables",
            "portfolio", "filterable_portfolio", "shop", "testimonial",
            "team_member", "video_slider", "post_slider", "fullwidth_slider",
            "map", "contact_form", "signup",
        ],
    },
}


def _deep_merge(base, over):
    out = dict(base)
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def find_config(explicit=None):
    """Resolve a config path: explicit arg, $CONTENT_CONVERSION_CONFIG, or
    content-conversion.config.json in cwd / repo parents. Returns None if none."""
    if explicit:
        return explicit
    env = os.environ.get("CONTENT_CONVERSION_CONFIG")
    if env:
        return env
    name = "content-conversion.config.json"
    here = os.getcwd()
    while True:
        cand = os.path.join(here, name)
        if os.path.isfile(cand):
            return cand
        parent = os.path.dirname(here)
        if parent == here:
            return None
        here = parent


def load_config(explicit=None):
    """Load config merged over DEFAULT_CONFIG. Missing file -> defaults only."""
    path = find_config(explicit)
    if not path or not os.path.isfile(path):
        return dict(DEFAULT_CONFIG)
    with open(path, encoding="utf-8") as fh:
        user = json.load(fh)
    return _deep_merge(DEFAULT_CONFIG, user)


# --------------------------------------------------------------------------
# DIVI shortcode-tree parser (tolerant, stdlib-only)
# --------------------------------------------------------------------------

# Match [et_pb_xxx ...], [/et_pb_xxx], with attrs that may contain ] inside
# quotes. Self-closing handled via trailing /.
DTAG = re.compile(r'\[(/?)(et_pb_[a-z0-9_]+)((?:"[^"]*"|[^\]])*?)(/?)\]', re.I)
ATTR = re.compile(r'(\w+)="([^"]*)"')


class DNode:
    __slots__ = ("tag", "attrs", "children")

    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or {}
        # children: list of ("text", str) | ("node", DNode)
        self.children = []

    def __repr__(self):
        return "<DNode %s %s>" % (self.tag, list(self.attrs))


def parse_divi(s):
    """Parse a DIVI shortcode string into a DNode tree. Tolerates mismatched
    and self-closing tags. Non-shortcode gaps become ('text', ...) children."""
    root = DNode("root")
    stack = [root]
    pos = 0
    for m in DTAG.finditer(s):
        pre = s[pos:m.start()]
        if pre:
            stack[-1].children.append(("text", pre))
        closing, tag, raw, selfclose = m.group(1), m.group(2).lower(), m.group(3), m.group(4)
        pos = m.end()
        if closing:
            # pop to the matching open tag
            for i in range(len(stack) - 1, 0, -1):
                if stack[i].tag == tag:
                    del stack[i:]
                    break
            continue
        node = DNode(tag, dict(ATTR.findall(raw)))
        stack[-1].children.append(("node", node))
        if not selfclose:
            stack.append(node)
    tail = s[pos:]
    if tail:
        root.children.append(("text", tail))
    return root


def child_nodes(node):
    return [c for k, c in node.children if k == "node"]


def raw_text_of(node):
    """Concatenate all text descendants of a node in document order."""
    out = []

    def walk(n):
        for k, c in n.children:
            if k == "text":
                out.append(c)
            else:
                walk(c)

    walk(node)
    return "".join(out)


def node_to_dict(node):
    """Serialize a DNode tree to plain dicts (for --format json)."""
    kids = []
    for k, c in node.children:
        if k == "text":
            if c.strip():
                kids.append({"type": "text", "value": c})
        else:
            kids.append(node_to_dict(c))
    return {"type": "node", "tag": node.tag, "attrs": node.attrs, "children": kids}


# --------------------------------------------------------------------------
# Chrome / disabled / global detection (config-driven)
# --------------------------------------------------------------------------

def is_disabled(node, cfg):
    a = node.attrs
    if a.get("disabled") == "on":
        return True
    dv = a.get("disabled_on")
    if dv and dv in cfg["chrome"]["disabled_on_values"]:
        return True
    # generic: all-devices disabled written as any "on|on|on"-shaped value
    if dv and re.fullmatch(r"(on\|){1,}on", dv):
        return True
    return False


def module_global_id(node):
    return node.attrs.get("global_module")


def has_global_module(node, cfg):
    gms = set(str(x) for x in cfg["chrome"]["global_modules"])

    def walk(n):
        gm = n.attrs.get("global_module")
        if gm is not None and (not gms or str(gm) in gms):
            return True
        return any(walk(c) for c in child_nodes(n))

    return walk(node)


def contains_breadcrumb(node, cfg):
    raw = raw_text_of(node)
    for sc in cfg["chrome"]["breadcrumb_shortcodes"]:
        if "[" + sc in raw:
            return True
    return False


def contains_footer_signature(node, cfg):
    raw = raw_text_of(node)
    for sig in cfg["chrome"]["footer_text_signatures"]:
        if sig and sig in raw:
            return True
    return False


def section_is_chrome(sec, cfg):
    """A whole [et_pb_section] that should be dropped before conversion."""
    if has_global_module(sec, cfg):
        return True, "global_module"
    if is_disabled(sec, cfg):
        return True, "disabled"
    if contains_breadcrumb(sec, cfg):
        return True, "breadcrumb"
    if contains_footer_signature(sec, cfg):
        return True, "footer_signature"
    # spacer / wave-only: no non-disabled content modules anywhere inside
    content_mods = set(cfg["chrome"]["content_modules"])
    found = []

    def walk(n):
        for ch in child_nodes(n):
            name = ch.tag[len("et_pb_"):] if ch.tag.startswith("et_pb_") else ch.tag
            if name in content_mods and not is_disabled(ch, cfg):
                found.append(ch)
            walk(ch)

    walk(sec)
    if not found:
        return True, "spacer/empty"
    return False, None


# --------------------------------------------------------------------------
# Shortcode repair + functional allowlist
# --------------------------------------------------------------------------

_CURLY = {
    "“": '"', "”": '"', "″": '"', "′": "'",
    "‘": "'", "’": "'",
    "&#8220;": '"', "&#8221;": '"', "&#8243;": '"',
    "&#8216;": "'", "&#8217;": "'",
}


def repair_shortcodes(text):
    """Repair DIVI editor corruption of functional shortcodes:
      [akce <span>category</span>="" pocet="5"] -> [akce category="" pocet="5"]
    plus texturized (curly) quotes inside brackets -> straight quotes so the
    shortcode parses. Only touches text inside [...] tokens."""
    def fix_one(m):
        s = m.group(0)
        s = re.sub(r"</?span[^>]*>", "", s)
        for a, b in _CURLY.items():
            s = s.replace(a, b)
        return s

    # brackets that look like shortcodes (opening token with a name)
    return re.sub(r"\[[a-zA-Z][\w:-]*(?:[^\]]*)\]", fix_one, text)


def functional_regex(cfg):
    """Build a regex matching any allowlisted functional shortcode opening tag.
    Allowlist entries match as a name PREFIX at a word boundary, so 'cmplz'
    matches [cmplz-document] and 'pdf' matches [pdf-embedder]."""
    names = [re.escape(n) for n in cfg["functional_shortcode_allowlist"]]
    if not names:
        names = [r"(?!x)x"]  # match nothing
    return re.compile(r"\[/?(?:" + "|".join(names) + r")[\w:-]*(?:\s[^\]]*)?\]", re.I)


def is_functional_shortcode(token, cfg):
    return bool(functional_regex(cfg).match(token.strip()))


# --------------------------------------------------------------------------
# Palette hex -> slug
# --------------------------------------------------------------------------

def _hex_to_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    except ValueError:
        return None


def hex_to_slug(hexval, cfg, tolerance=48):
    """Map a color hex to the nearest configured palette slug, but only if it
    is within `tolerance` (euclidean RGB distance). Returns slug or None.
    Per normalization rules: colors map to a slug ONLY when clearly a brand
    color or a close shade; otherwise they are dropped (None)."""
    rgb = _hex_to_rgb(hexval or "")
    if not rgb:
        return None
    best, best_d = None, None
    for slug, ph in cfg.get("palette", {}).items():
        prgb = _hex_to_rgb(ph)
        if not prgb:
            continue
        d = sum((a - b) ** 2 for a, b in zip(rgb, prgb)) ** 0.5
        if best_d is None or d < best_d:
            best, best_d = slug, d
    if best is not None and best_d is not None and best_d <= tolerance:
        return best
    return None
