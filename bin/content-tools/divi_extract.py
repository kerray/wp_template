#!/usr/bin/env python3
"""divi_extract — DIVI shortcode-tree parser + chrome stripper.

Python 3 stdlib only. Reads a raw WP post body (DIVI shortcodes, or Gutenberg /
plain HTML which is passed through) and emits either:

  --format html  (default): CLEANED HTML with all DIVI chrome removed and the
                  content modules flattened to plain HTML in document order —
                  ready to pipe into html2md.py for the markdown target.
  --format json : the DIVI shortcode tree as JSON (tag/attrs/children), for
                  inspection or a custom block converter.

Chrome stripping and corruption repair are config-driven (see
content-conversion.config.json): global-module ids, disabled_on values,
breadcrumb shortcodes, footer text signatures, spacer/wave-only sections.

Corruption repaired before flattening:
  * span-corrupted shortcode attrs: [akce <span>x</span>=""]  -> [akce x=""]
  * texturized (curly) quotes inside shortcodes -> straight quotes
  * content_tablet="..." duplicate module bodies dropped (responsive dupes)
  * &nbsp; / <big> filler removed downstream by html2md

Functional shortcodes on the allowlist are preserved verbatim (wrapped in a
<p> so html2md emits them on their own line). Image URLs are kept as-is.

Usage:
  divi_extract.py [FILE] [--config CFG] [--format html|json] [--list-dropped]
  cat post.html | divi_extract.py --format html
"""
from __future__ import annotations
import argparse
import json
import re
import sys

try:
    import ct_common
except ImportError:
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import ct_common


def _attr(node, name, default=None):
    return node.attrs.get(name, default)


def _flatten_module_html(node, cfg, dropped):
    """Return a list of HTML fragments for one leaf module, in document order."""
    tag = node.tag
    name = tag[len("et_pb_"):] if tag.startswith("et_pb_") else tag

    if ct_common.is_disabled(node, cfg):
        dropped.append("disabled:%s" % name)
        return []
    gm = ct_common.module_global_id(node)
    gms = set(str(x) for x in cfg["chrome"]["global_modules"])
    if gm is not None and (not gms or str(gm) in gms):
        dropped.append("global_module:%s" % gm)
        return []

    if name == "text":
        inner = ct_common.raw_text_of(node)
        # drop responsive duplicate bodies (content_tablet/_phone attrs)
        if _attr(node, "content_tablet") or _attr(node, "content_phone"):
            dropped.append("content_tablet_dup")
        for sc in cfg["chrome"]["breadcrumb_shortcodes"]:
            if "[" + sc in inner:
                dropped.append("breadcrumb")
                return []
        return [inner]
    if name == "image":
        src = _attr(node, "src")
        if not src:
            return []
        alt = _attr(node, "alt", "") or ""
        href = _attr(node, "url")
        img = '<img src="%s" alt="%s">' % (src, alt)
        if href:
            img = '<a href="%s">%s</a>' % (href, img)
        return ["<p>%s</p>" % img]
    if name == "button":
        txt = _attr(node, "button_text") or ct_common.raw_text_of(node).strip() or "Odkaz"
        txt = re.sub(r"<[^>]+>", "", txt)
        url = _attr(node, "button_url") or _attr(node, "url") or "#"
        return ['<p><a href="%s">%s</a></p>' % (url, txt)]
    if name in ("toggle", "accordion_item"):
        title = re.sub(r"<[^>]+>", "", _attr(node, "title", "") or "").strip()
        inner = ct_common.raw_text_of(node)
        head = "<p><strong>%s</strong></p>" % title if title else ""
        return [head + inner]
    if name == "accordion":
        out = []
        for it in ct_common.child_nodes(node):
            out.extend(_flatten_module_html(it, cfg, dropped))
        return out
    if name in ("tabs",):
        out = []
        for tab in ct_common.child_nodes(node):
            title = re.sub(r"<[^>]+>", "", _attr(tab, "title", "") or "").strip()
            if title:
                out.append("<p><strong>%s</strong></p>" % title)
            out.append(ct_common.raw_text_of(tab))
        return out
    if name == "cta":
        title = re.sub(r"<[^>]+>", "", _attr(node, "title", "") or "").strip()
        out = []
        if title:
            out.append("<h2>%s</h2>" % title)
        out.append(ct_common.raw_text_of(node))
        url = _attr(node, "button_url")
        if url:
            btn = _attr(node, "button_text") or "Odkaz"
            out.append('<p><a href="%s">%s</a></p>' % (url, btn))
        return out
    if name == "code":
        return [ct_common.raw_text_of(node)]
    if name == "blurb":
        title = re.sub(r"<[^>]+>", "", _attr(node, "title", "") or "").strip()
        url = _attr(node, "url")
        if url and title:
            return ['<p><a href="%s">%s</a></p>' % (url, title)]
        dropped.append("blurb(no-url)")
        return []
    if name == "gallery":
        dropped.append("gallery(ids=%s, resolve separately)" % (_attr(node, "gallery_ids") or ""))
        return []
    if name == "divider":
        dropped.append("divider(decorative)")
        return []
    # container-ish or unknown leaf: try its raw text
    inner = ct_common.raw_text_of(node)
    return [inner] if inner.strip() else []


def _walk_columns_and_rows(node, cfg, dropped):
    out = []
    for ch in ct_common.child_nodes(node):
        if ct_common.is_disabled(ch, cfg):
            dropped.append("disabled:%s" % ch.tag)
            continue
        if ch.tag in ("et_pb_row", "et_pb_row_inner", "et_pb_column", "et_pb_column_inner"):
            out.extend(_walk_columns_and_rows(ch, cfg, dropped))
        else:
            out.extend(_flatten_module_html(ch, cfg, dropped))
    return out


def extract_html(raw, cfg):
    """DIVI -> cleaned HTML (chrome stripped, modules flattened). Non-DIVI input
    (Gutenberg / plain HTML) is returned mostly as-is (comments stripped)."""
    dropped = []
    raw = ct_common.repair_shortcodes(raw)
    if "[et_pb_" not in raw:
        # Gutenberg or plain HTML: strip wp comments, keep the rest
        html = re.sub(r"<!--\s*/?wp:.*?-->", "", raw, flags=re.S)
        return html.strip(), dropped

    root = ct_common.parse_divi(raw)
    frags = []
    for sec in ct_common.child_nodes(root):
        if sec.tag != "et_pb_section":
            # stray top-level module/row
            frags.extend(_walk_columns_and_rows(sec, cfg, dropped)
                         if sec.tag.startswith("et_pb_") else [])
            continue
        is_chrome, why = ct_common.section_is_chrome(sec, cfg)
        if is_chrome:
            dropped.append("section:%s" % why)
            continue
        frags.extend(_walk_columns_and_rows(sec, cfg, dropped))

    # protect functional shortcodes: keep verbatim, on their own paragraph
    func = ct_common.functional_regex(cfg)
    html = "\n".join(f for f in frags if f and f.strip())

    def protect(m):
        return "\n<p>%s</p>\n" % m.group(0)

    html = func.sub(protect, html)
    return html.strip(), dropped


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Parse DIVI, strip chrome, flatten to cleaned HTML or a JSON tree.")
    ap.add_argument("file", nargs="?", help="post body file (default: stdin)")
    ap.add_argument("--config", help="content-conversion.config.json")
    ap.add_argument("--format", choices=["html", "json"], default="html")
    ap.add_argument("--list-dropped", action="store_true",
                    help="print dropped-chrome notes to stderr")
    args = ap.parse_args(argv)
    cfg = ct_common.load_config(args.config)
    raw = open(args.file, encoding="utf-8").read() if args.file else sys.stdin.read()

    if args.format == "json":
        raw2 = ct_common.repair_shortcodes(raw)
        tree = ct_common.parse_divi(raw2)
        sys.stdout.write(json.dumps(ct_common.node_to_dict(tree),
                                    ensure_ascii=False, indent=1) + "\n")
        return

    html, dropped = extract_html(raw, cfg)
    sys.stdout.write(html + ("\n" if html else ""))
    if args.list_dropped and dropped:
        sys.stderr.write("DROPPED: " + ", ".join(dropped) + "\n")


if __name__ == "__main__":
    main()
