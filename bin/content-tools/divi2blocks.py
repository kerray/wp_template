#!/usr/bin/env python3
"""divi2blocks — DIVI shortcode tree -> normalized core Gutenberg block markup.

Python 3 stdlib only. Distilled from the waldorf GB-2 / GB-6 batch converters
and the divi-to-gutenberg skill's normalization-rules.md. Policy:
**preserve structure, drop cosmetics.** Layout (columns, accordions, tables,
galleries) survives; per-element fonts/sizes/colors/spacing are dropped — the
design system supplies them.

Handled modules: section, row/row_inner, column/column_inner, text (-> heading/
paragraph/list/image/table/quote), image, gallery, button, blurb (link-grid
policy §8a), toggle/accordion (-> core/details), tabs (-> stacked closed
core/details, or shortcode passthrough when bodies are purely functional), cta,
divider, code. Body <h1> is demoted to <h2>. Functional shortcodes on the config
allowlist pass through verbatim as core/shortcode.

Unknown DIVI modules are NOT silently dropped: their text is salvaged as
paragraphs, a `<!-- TODO: unhandled DIVI module ... -->` marker is emitted, and
the process exits non-zero so a reviewing agent notices.

Chrome (global modules, disabled_on, breadcrumbs, footer, spacer/wave sections)
is stripped per content-conversion.config.json. Palette callout colors map to a
brand slug ONLY when a close shade; otherwise dropped.

Usage:
  divi2blocks.py [FILE] [--config CFG] [--gallery-map map.json] [--keep-h1]
  cat page.html | divi2blocks.py --config /path/content-conversion.config.json
Exit code: 0 clean, 1 if any unknown module was encountered.
"""
from __future__ import annotations
import argparse
import html as htmlmod
import json
import re
import sys
from html.parser import HTMLParser

try:
    import ct_common
except ImportError:
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import ct_common

WIDTHS = {"1_2": "50%", "1_3": "33.33%", "2_3": "66.67%", "1_4": "25%",
          "3_4": "75%", "1_5": "20%", "2_5": "40%", "3_5": "60%", "4_5": "80%",
          "1_6": "16.67%", "4_4": None}

VOID = {"img", "br", "hr", "input", "meta", "link", "source", "col", "wbr"}
KEEP_INLINE = {"strong", "em", "b", "i", "a", "br", "sub", "sup", "u", "code", "mark"}


# --------------------------------------------------------------------------
# HTML DOM (stdlib) for et_pb_text inner content
# --------------------------------------------------------------------------
class H:
    __slots__ = ("tag", "attrs", "kids")

    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.kids = []  # ('t',str) | ('e',H)


class DOMBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = H("#root")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        el = H(tag, dict(attrs))
        self.stack[-1].kids.append(("e", el))
        if tag not in VOID:
            self.stack.append(el)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].kids.append(("e", H(tag, dict(attrs))))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].kids.append(("t", data))

    def handle_entityref(self, name):
        self.stack[-1].kids.append(("t", "&%s;" % name))

    def handle_charref(self, name):
        self.stack[-1].kids.append(("t", "&#%s;" % name))


def parse_html(frag):
    b = DOMBuilder()
    b.feed(frag)
    b.close()
    return b.root


# --------------------------------------------------------------------------
# inline serialization
# --------------------------------------------------------------------------
def serialize_inline(el):
    return "".join(c if k == "t" else serialize_inline_el(c) for k, c in el.kids)


def serialize_inline_el(el):
    t = el.tag
    if t == "br":
        return "<br>"
    if t == "img":
        return ""  # imgs handled at block level
    inner = serialize_inline(el)
    if t in ("span", "font"):
        return inner
    if t == "b":
        t = "strong"
    if t == "i":
        t = "em"
    if t not in KEEP_INLINE:
        return inner
    if inner.replace("&nbsp;", " ").strip() == "" and t != "br":
        return ""
    if t == "a":
        href = el.attrs.get("href")
        if not href:
            return inner
        a = ['href="%s"' % href]
        if el.attrs.get("target"):
            a.append('target="%s"' % el.attrs["target"])
        rel = el.attrs.get("rel")
        if rel and "attachment" not in rel:
            a.append('rel="%s"' % rel)
        return "<a %s>%s</a>" % (" ".join(a), inner)
    return "<%s>%s</%s>" % (t, inner, t)


def is_empty_inline(s):
    x = s.replace("&nbsp;", " ").replace("<br>", " ")
    x = re.sub(r"<[^>]+>", "", x)
    return htmlmod.unescape(x).strip() == ""


def collect_imgs(el, acc):
    for k, c in el.kids:
        if k == "e":
            if c.tag == "img":
                acc.append(c)
            else:
                collect_imgs(c, acc)


# --------------------------------------------------------------------------
# block emitters
# --------------------------------------------------------------------------
def _json(d):
    return json.dumps(d, ensure_ascii=False, separators=(",", ":"))


def image_block(img, ctx):
    src = img.attrs.get("src", "")
    if not src:
        return None
    alt = img.attrs.get("alt", "")
    cls = img.attrs.get("class", "")
    mid = re.search(r"wp-image-(\d+)", cls)
    size = "full"
    ms = re.search(r"size-(\w+)", cls)
    if ms:
        size = ms.group(1)
    attrs = {}
    if mid:
        attrs["id"] = int(mid.group(1))
    elif src in ctx.get("src2id", {}):
        attrs["id"] = ctx["src2id"][src]
    attrs["sizeSlug"] = size
    imgcls = (" class=\"wp-image-%s\"" % attrs["id"]) if "id" in attrs else ""
    return ('<!-- wp:image %s -->\n<figure class="wp-block-image size-%s">'
            '<img src="%s" alt="%s"%s/></figure>\n<!-- /wp:image -->'
            % (_json(attrs), size, src, alt, imgcls))


def emit_heading(el, ctx, keep_h1):
    level = int(el.tag[1])
    if level == 1 and not keep_h1:
        level = 2
    align = "center" if "text-align: center" in el.attrs.get("style", "") else ""
    inner = re.sub(r"\s+", " ", serialize_inline(el)).strip()
    if is_empty_inline(inner):
        return []
    attrs = {}
    if align:
        attrs["textAlign"] = align
    if level != 2:
        attrs["level"] = level
    aj = (" " + _json(attrs)) if attrs else ""
    cls = "wp-block-heading" + (" has-text-align-%s" % align if align else "")
    return ["<!-- wp:heading%s -->\n<h%d class=\"%s\">%s</h%d>\n<!-- /wp:heading -->"
            % (aj, level, cls, inner, level)]


def emit_paragraph(inner, align=""):
    inner = re.sub(r"\s+", " ", inner).strip()
    inner = re.sub(r"^(?:<br>)+", "", inner)
    inner = re.sub(r"(?:<br>)+$", "", inner).strip()
    if is_empty_inline(inner):
        return []
    attrs = {"align": align} if align else {}
    aj = (" " + _json(attrs)) if attrs else ""
    cls = (' class="has-text-align-%s"' % align) if align else ""
    return ["<!-- wp:paragraph%s -->\n<p%s>%s</p>\n<!-- /wp:paragraph -->" % (aj, cls, inner)]


def emit_shortcode(code):
    return ["<!-- wp:shortcode -->\n%s\n<!-- /wp:shortcode -->" % code.strip()]


def emit_html_raw(raw):
    raw = raw.strip()
    return ["<!-- wp:html -->\n%s\n<!-- /wp:html -->" % raw] if raw else []


def emit_list(el):
    ordered = el.tag == "ol"
    items = []
    for k, c in el.kids:
        if k == "e" and c.tag == "li":
            it = emit_list_item(c)
            if it:
                items.append(it)
    if not items:
        return []
    aj = " {\"ordered\":true}" if ordered else ""
    tag = "ol" if ordered else "ul"
    return ["<!-- wp:list%s -->\n<%s class=\"wp-block-list\">\n%s\n</%s>\n<!-- /wp:list -->"
            % (aj, tag, "\n".join(items), tag)]


def emit_list_item(li):
    inline_parts, nested = [], []
    for k, c in li.kids:
        if k == "t":
            inline_parts.append(c)
        elif c.tag in ("ul", "ol"):
            nested.append(c)
        else:
            inline_parts.append(serialize_inline_el(c))
    inner = re.sub(r"\s+", " ", "".join(inline_parts)).strip()
    inner = re.sub(r"(?:<br>)+$", "", inner).strip()
    body = inner
    for nl in nested:
        sub = emit_list(nl)
        if sub:
            body += "\n" + sub[0]
    if is_empty_inline(inner) and not nested:
        return ""
    return "<!-- wp:list-item -->\n<li>%s</li>\n<!-- /wp:list-item -->" % body


def emit_table(el):
    rows = []

    def find_rows(n):
        for k, c in n.kids:
            if k == "e":
                if c.tag == "tr":
                    rows.append(c)
                else:
                    find_rows(c)

    find_rows(el)
    trs = []
    for r in rows:
        cells = []
        for k, c in r.kids:
            if k == "e" and c.tag in ("td", "th"):
                cells.append((c.tag, re.sub(r"\s+", " ", serialize_inline(c)).strip()))
        if cells:
            trs.append(cells)
    if not trs:
        return []

    def render_row(cells):
        return "<tr>%s</tr>" % "".join(
            "<%s>%s</%s>" % (tg, v, tg) for tg, v in cells)

    body = "<tbody>%s</tbody>" % "".join(render_row(r) for r in trs)
    return ["<!-- wp:table -->\n<figure class=\"wp-block-table\"><table>%s</table>"
            "</figure>\n<!-- /wp:table -->" % body]


def emit_quote(inner_blocks):
    if not inner_blocks:
        return []
    return ["<!-- wp:quote -->\n<blockquote class=\"wp-block-quote\">\n%s\n"
            "</blockquote>\n<!-- /wp:quote -->" % "\n".join(inner_blocks)]


def emit_buttons(pairs):
    """pairs: list of (text, url). -> one core/buttons with core/button each."""
    btns = []
    for txt, url in pairs:
        btns.append('<!-- wp:button -->\n<div class="wp-block-button">'
                    '<a class="wp-block-button__link wp-element-button" href="%s">%s</a>'
                    '</div>\n<!-- /wp:button -->' % (url, htmlmod.escape(txt)))
    return ['<!-- wp:buttons -->\n<div class="wp-block-buttons">\n%s\n</div>\n<!-- /wp:buttons -->'
            % "\n".join(btns)]


def emit_links_list(pairs):
    lis = "\n".join(
        '<!-- wp:list-item -->\n<li><a href="%s">%s</a></li>\n<!-- /wp:list-item -->'
        % (u, htmlmod.escape(t)) for t, u in pairs)
    return ['<!-- wp:list -->\n<ul class="wp-block-list">\n%s\n</ul>\n<!-- /wp:list -->' % lis]


# --------------------------------------------------------------------------
# fragment normalization (et_pb_text inner HTML -> blocks)
# --------------------------------------------------------------------------
SHORTCODE_RE = re.compile(r"\[[a-zA-Z][\w:-]*(?:\s[^\]]*)?\]")


def flatten_wrappers(nodes):
    out = []
    for k, c in nodes:
        if k == "e" and c.tag in ("div", "section", "article"):
            out.extend(flatten_wrappers(c.kids))
        else:
            out.append((k, c))
    return out


def normalize_fragment(frag, ctx, keep_h1):
    root = parse_html(frag)
    nodes = flatten_wrappers(root.kids)
    blocks = []
    inline_buf = []

    def flush():
        if not inline_buf:
            return
        s = "".join(inline_buf)
        inline_buf.clear()
        for p in re.split(r"\n\s*\n", s):
            hp = re.sub(r"\n", "<br>", p).strip()
            hp = re.sub(r"(?:<br>\s*)+$", "", hp).strip()
            hp = re.sub(r"^(?:\s*<br>)+", "", hp).strip()
            if is_empty_inline(hp):
                continue
            st = htmlmod.unescape(re.sub(r"<[^>]+>", "", hp)).strip()
            if SHORTCODE_RE.fullmatch(st):
                _emit_shortcode_or_para(st, blocks, ctx)
            else:
                blocks.extend(emit_paragraph(hp))

    for k, c in nodes:
        if k == "t":
            inline_buf.append(c)
            continue
        t = c.tag
        if t in ("script", "style"):
            continue
        if t == "img":
            flush()
            ib = image_block(c, ctx)
            if ib:
                blocks.append(ib)
        elif re.fullmatch(r"h[1-6]", t):
            flush()
            blocks.extend(emit_heading(c, ctx, keep_h1))
        elif t == "p":
            flush()
            blocks.extend(emit_p(c, ctx, keep_h1))
        elif t in ("ul", "ol"):
            flush()
            blocks.extend(emit_list(c))
        elif t == "table":
            flush()
            blocks.extend(emit_table(c))
        elif t == "blockquote":
            flush()
            inner = normalize_fragment(reserialize_kids(c), ctx, keep_h1)
            blocks.extend(emit_quote(inner))
        elif t == "iframe":
            flush()
            blocks.extend(emit_html_raw(reserialize(c)))
        elif t == "figure":
            flush()
            imgs = []
            collect_imgs(c, imgs)
            for im in imgs:
                ib = image_block(im, ctx)
                if ib:
                    blocks.append(ib)
        elif t == "hr":
            flush()  # decorative -> drop
        elif t == "br":
            inline_buf.append("\n")
        else:
            inline_buf.append(serialize_inline_el(c))
    flush()
    return blocks


def _emit_shortcode_or_para(st, blocks, ctx):
    st = ct_common.repair_shortcodes(st)
    if ct_common.is_functional_shortcode(st, ctx["cfg"]):
        blocks.extend(emit_shortcode(st))
    else:
        # unknown bracket token that is not DIVI and not allowlisted:
        # keep it verbatim as a shortcode block (harmless if unregistered)
        blocks.extend(emit_shortcode(st))


def emit_p(p, ctx, keep_h1):
    align = "center" if "text-align: center" in p.attrs.get("style", "") else ""
    imgs = []
    collect_imgs(p, imgs)
    out = []
    residual = serialize_inline(p)
    st = htmlmod.unescape(re.sub(r"<[^>]+>", "", residual)).strip()
    if SHORTCODE_RE.fullmatch(st):
        _emit_shortcode_or_para(st, out, ctx)
    else:
        out.extend(emit_paragraph(residual, align))
    for im in imgs:
        ib = image_block(im, ctx)
        if ib:
            out.append(ib)
    return out


def reserialize(el):
    a = "".join(' %s="%s"' % (k, v) for k, v in el.attrs.items())
    if el.tag in VOID:
        return "<%s%s>" % (el.tag, a)
    return "<%s%s>%s</%s>" % (el.tag, a, reserialize_kids(el), el.tag)


def reserialize_kids(el):
    return "".join(c if k == "t" else reserialize(c) for k, c in el.kids)


# --------------------------------------------------------------------------
# module conversion
# --------------------------------------------------------------------------
HANDLED = {
    "et_pb_section", "et_pb_row", "et_pb_row_inner", "et_pb_column",
    "et_pb_column_inner", "et_pb_text", "et_pb_image", "et_pb_gallery",
    "et_pb_button", "et_pb_blurb", "et_pb_toggle", "et_pb_accordion",
    "et_pb_accordion_item", "et_pb_tabs", "et_pb_tab", "et_pb_cta",
    "et_pb_divider", "et_pb_code",
}


def convert_details(item, ctx, keep_h1):
    title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", item.attrs.get("title", ""))).strip()
    open_on = item.attrs.get("open") == "on"
    inner = normalize_fragment(ct_common.raw_text_of(item), ctx, keep_h1)
    attrs = " {\"showContent\":true}" if open_on else ""
    opentag = " open" if open_on else ""
    return ("<!-- wp:details%s -->\n<details class=\"wp-block-details\"%s>"
            "<summary>%s</summary>\n%s\n</details>\n<!-- /wp:details -->"
            % (attrs, opentag, htmlmod.escape(title), "\n".join(inner)))


def convert_tabs(node, ctx, keep_h1):
    """Tabs -> stacked closed core/details. If every tab body is purely a
    functional shortcode, drop the tab chrome and pass the shortcodes through."""
    tabs = [t for t in ct_common.child_nodes(node) if t.tag == "et_pb_tab"]
    only_func = True
    for t in tabs:
        body = ct_common.raw_text_of(t).strip()
        body = re.sub(r"<[^>]+>", "", body).strip()
        if not (ct_common.is_functional_shortcode(body, ctx["cfg"]) or body == ""):
            only_func = False
            break
    out = []
    if only_func:
        for t in tabs:
            body = re.sub(r"<[^>]+>", "", ct_common.raw_text_of(t)).strip()
            body = ct_common.repair_shortcodes(body)
            if body:
                out.extend(emit_shortcode(body))
        return out
    for t in tabs:
        out.append(convert_details(t, ctx, keep_h1))
    return out


def convert_gallery(node, ctx):
    ids = [x for x in re.split(r"[,\s]+", node.attrs.get("gallery_ids", "")) if x]
    gmap = ctx.get("gallery_map", {})
    imgs = []
    unresolved = []
    for i in ids:
        info = gmap.get(str(i)) or gmap.get(i) or {}
        url = info.get("url", "")
        alt = info.get("alt", "")
        if not url:
            unresolved.append(i)
        imgs.append('<!-- wp:image {"id":%s,"sizeSlug":"large","linkDestination":"none"} -->\n'
                    '<figure class="wp-block-image size-large"><img src="%s" alt="%s" '
                    'class="wp-image-%s"/></figure>\n<!-- /wp:image -->' % (i, url, alt, i))
    inner = "\n".join(imgs)
    note = ""
    if unresolved:
        ctx["notes"].append("gallery ids unresolved (no --gallery-map): %s" % ",".join(unresolved))
        note = "<!-- TODO: resolve gallery image URLs for ids %s -->\n" % ",".join(unresolved)
    if not imgs:
        return []
    return ['%s<!-- wp:gallery {"linkTo":"none"} -->\n<figure class="wp-block-gallery '
            'has-nested-images columns-default is-cropped">\n%s\n</figure>\n'
            '<!-- /wp:gallery -->' % (note, inner)]


def convert_blurb(node):
    title = re.sub(r"<[^>]+>", "", node.attrs.get("title", "")).strip()
    url = node.attrs.get("url") or node.attrs.get("link_option_url")
    if url and title:
        return ("link", (title, url))
    return None


def convert_cta(node, ctx, keep_h1):
    out = []
    title = node.attrs.get("title", "").strip()
    slug = ct_common.hex_to_slug(node.attrs.get("background_color", ""), ctx["cfg"])
    if title:
        out.append("<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">%s</h2>\n<!-- /wp:heading -->"
                   % htmlmod.escape(title))
    out.extend(normalize_fragment(ct_common.raw_text_of(node), ctx, keep_h1))
    url = node.attrs.get("button_url")
    if url:
        out.extend(emit_buttons([(node.attrs.get("button_text", "Odkaz"), url)]))
    if slug and out:
        body = "\n".join(out)
        return ['<!-- wp:group {"backgroundColor":"%s"} -->\n<div class="wp-block-group '
                'has-%s-background-color has-background">\n%s\n</div>\n<!-- /wp:group -->'
                % (slug, slug, body)]
    return out


def convert_module(node, ctx, keep_h1):
    if ct_common.is_disabled(node, ctx["cfg"]):
        ctx["dropped"].append("disabled:%s" % node.tag)
        return []
    gm = ct_common.module_global_id(node)
    gms = set(str(x) for x in ctx["cfg"]["chrome"]["global_modules"])
    if gm is not None and (not gms or str(gm) in gms):
        ctx["dropped"].append("global_module:%s" % gm)
        return []
    t = node.tag
    if t == "et_pb_text":
        return normalize_fragment(ct_common.raw_text_of(node), ctx, keep_h1)
    if t == "et_pb_image":
        src = node.attrs.get("src", "")
        if not src:
            return []
        img = H("img", {"src": src, "alt": node.attrs.get("alt", "")})
        href = node.attrs.get("url")
        ib = image_block(img, ctx)
        if ib and href:
            ib = ib.replace("<img", '<a href="%s"><img' % href, 1).replace("/></figure>", "/></a></figure>", 1)
            ib = ib.replace('"sizeSlug"', '"linkDestination":"custom","sizeSlug"', 1)
        return [ib] if ib else []
    if t == "et_pb_gallery":
        return convert_gallery(node, ctx)
    if t == "et_pb_button":
        txt = re.sub(r"<[^>]+>", "", node.attrs.get("button_text") or ct_common.raw_text_of(node)).strip() or "Odkaz"
        url = node.attrs.get("button_url") or node.attrs.get("url") or "#"
        return emit_buttons([(txt, url)])
    if t == "et_pb_accordion":
        return [convert_details(it, ctx, keep_h1)
                for it in ct_common.child_nodes(node)
                if it.tag == "et_pb_accordion_item" and not ct_common.is_disabled(it, ctx["cfg"])]
    if t == "et_pb_toggle":
        return [convert_details(node, ctx, keep_h1)]
    if t == "et_pb_tabs":
        return convert_tabs(node, ctx, keep_h1)
    if t == "et_pb_cta":
        return convert_cta(node, ctx, keep_h1)
    if t == "et_pb_divider":
        ctx["dropped"].append("divider")
        return []
    if t == "et_pb_code":
        return emit_html_raw(ct_common.raw_text_of(node))
    if t == "et_pb_blurb":
        return []  # handled at column level via link-grid policy
    # ---- unknown module ----
    ctx["unknown"].append(t)
    salvage = normalize_fragment(ct_common.raw_text_of(node), ctx, keep_h1)
    marker = "<!-- wp:html -->\n<!-- TODO: unhandled DIVI module %s — review conversion -->\n<!-- /wp:html -->" % t
    return [marker] + salvage


def convert_column(col, ctx, keep_h1):
    blocks = []
    blurbs = []
    for ch in ct_common.child_nodes(col):
        if ct_common.is_disabled(ch, ctx["cfg"]):
            continue
        if ch.tag == "et_pb_blurb":
            b = convert_blurb(ch)
            if b:
                blurbs.append(b[1])
            else:
                ctx["dropped"].append("blurb(no-url)")
        else:
            blocks.extend(convert_module(ch, ctx, keep_h1))
    return blocks, blurbs


def convert_row(row, ctx, keep_h1):
    cols = [c for c in ct_common.child_nodes(row)
            if c.tag in ("et_pb_column", "et_pb_column_inner")
            and not ct_common.is_disabled(c, ctx["cfg"])]
    col_data = []
    all_blurbs = []
    for c in cols:
        blocks, blurbs = convert_column(c, ctx, keep_h1)
        col_data.append((c.attrs.get("type", "4_4"), blocks))
        all_blurbs.extend(blurbs)
    nonempty = [(t, b) for t, b in col_data if b]
    out = []
    # §8a blurb link-grid -> list of links (or buttons for 1-3)
    if all_blurbs:
        if len(all_blurbs) <= 3:
            out.extend(emit_buttons(all_blurbs))
        else:
            out.extend(emit_links_list(all_blurbs))
        ctx["blurbs_listed"] += len(all_blurbs)
    if not nonempty:
        return out
    if len(nonempty) == 1:
        out.extend(nonempty[0][1])
        return out
    types = [t for t, _ in nonempty]
    uniform = len(set(types)) == 1 and types[0] != "4_4"
    col_str = []
    for t, b in nonempty:
        w = WIDTHS.get(t)
        if uniform or w is None:
            col_str.append("<!-- wp:column -->\n<div class=\"wp-block-column\">\n%s\n"
                           "</div>\n<!-- /wp:column -->" % "\n".join(b))
        else:
            col_str.append("<!-- wp:column {\"width\":\"%s\"} -->\n<div class=\"wp-block-column\" "
                           "style=\"flex-basis:%s\">\n%s\n</div>\n<!-- /wp:column -->"
                           % (w, w, "\n".join(b)))
    out.append("<!-- wp:columns -->\n<div class=\"wp-block-columns\">\n%s\n</div>\n<!-- /wp:columns -->"
               % "\n".join(col_str))
    return out


def convert_section(sec, ctx, keep_h1):
    out = []
    for row in ct_common.child_nodes(sec):
        if row.tag in ("et_pb_row", "et_pb_row_inner") and not ct_common.is_disabled(row, ctx["cfg"]):
            out.extend(convert_row(row, ctx, keep_h1))
        elif row.tag == "et_pb_column":
            blocks, blurbs = convert_column(row, ctx, keep_h1)
            out.extend(blocks)
            if blurbs:
                out.extend(emit_links_list(blurbs))
    return out


def convert_page(raw, cfg, gallery_map=None, keep_h1=False):
    raw = ct_common.repair_shortcodes(raw)
    raw = re.sub(r"<!--\s*/?wp:.*?-->", "", raw, flags=re.S)  # drop any wp comments
    root = ct_common.parse_divi(raw)
    ctx = {"cfg": cfg, "dropped": [], "unknown": [], "notes": [],
           "blurbs_listed": 0, "gallery_map": gallery_map or {}, "src2id": {}}
    blocks = []
    for sec in ct_common.child_nodes(root):
        if sec.tag == "et_pb_section":
            is_chrome, why = ct_common.section_is_chrome(sec, cfg)
            if is_chrome:
                ctx["dropped"].append("section:%s" % why)
                continue
            blocks.extend(convert_section(sec, ctx, keep_h1))
        elif sec.tag in ("et_pb_row", "et_pb_row_inner"):
            blocks.extend(convert_row(sec, ctx, keep_h1))
    body = "\n\n".join(b for b in blocks if b and b.strip())
    return body, ctx


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Convert DIVI shortcode markup to normalized core Gutenberg blocks.")
    ap.add_argument("file", nargs="?", help="page body file (default: stdin)")
    ap.add_argument("--config", help="content-conversion.config.json")
    ap.add_argument("--gallery-map", help="JSON file: {\"<attachment_id>\": {\"url\":..,\"alt\":..}}")
    ap.add_argument("--keep-h1", action="store_true", help="do NOT demote body <h1> to <h2>")
    args = ap.parse_args(argv)
    cfg = ct_common.load_config(args.config)
    gmap = {}
    if args.gallery_map:
        gmap = json.load(open(args.gallery_map, encoding="utf-8"))
    raw = open(args.file, encoding="utf-8").read() if args.file else sys.stdin.read()
    body, ctx = convert_page(raw, cfg, gallery_map=gmap, keep_h1=args.keep_h1)
    sys.stdout.write(body + "\n")
    if ctx["dropped"]:
        sys.stderr.write("DROPPED: " + ", ".join(sorted(set(ctx["dropped"]))) + "\n")
    if ctx["notes"]:
        sys.stderr.write("NOTES: " + "; ".join(ctx["notes"]) + "\n")
    if ctx["unknown"]:
        sys.stderr.write("UNKNOWN MODULES (TODO markers emitted): "
                         + ", ".join(sorted(set(ctx["unknown"]))) + "\n")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
