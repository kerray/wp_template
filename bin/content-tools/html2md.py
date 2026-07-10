#!/usr/bin/env python3
"""html2md — HTML -> GitHub-Flavored Markdown, tuned for WP body content.

Python 3 stdlib only. This is the emphasis-pairing converter distilled from the
waldorf POSTS-A / POSTS-B / AKCE batch agents, with their hard-won fixes:

  * emphasis pairing that survives <br> and fragmented <strong>/<em>: open
    markers are CLOSED before a hard break and RE-OPENED after, so every output
    line is independently balanced (Parsedown/GFM requirement).
  * whitespace moved OUT of ** / * runs ( "** x **" -> " **x** ").
  * ordinal escaping on date lines: a paragraph starting "2. 4. 2026" becomes
    "2\\. 4. 2026" so it is not parsed as an ordered list.
  * empty-alt images preserved: <img alt=""> -> ![](url) (not dropped).
  * tables -> GFM pipe tables; a single-column table is a layout wrapper and is
    unwrapped into plain blocks.
  * <blockquote> -> "> " quotes; <ul>/<ol> with nested lists; <sub>/<sup> kept
    as inline HTML.
  * chrome/cosmetic strip: &nbsp; -> space, <big> removed, <span>/<font>
    unwrapped, style/class dropped, empty emphasis removed.
  * body <h1> demoted to <h2> (frontend owns the page h1); --keep-h1 to disable.

Functional shortcodes present in the HTML (per the config allowlist) are emitted
verbatim on their own line. Image/link URLs are kept EXACTLY as-is (no rewrite).

Usage:
  html2md.py [FILE] [--config CFG] [--keep-h1] [--no-repair-shortcodes]
  cat body.html | html2md.py
"""
from __future__ import annotations
import argparse
import re
import sys
from html.parser import HTMLParser

try:
    import ct_common
except ImportError:  # allow running from another cwd
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import ct_common

BR = "\x02"   # hard-break sentinel (survives whitespace collapse)


class Html2Md(HTMLParser):
    def __init__(self, demote_h1=True):
        super().__init__(convert_charrefs=True)
        self.demote_h1 = demote_h1
        self.out = []
        self.buf = []
        self.list_stack = []
        self.ol_index = []
        self._href = None
        self._a = []
        self._in_a = False
        self._img_in_a = None
        self._h = None
        self.emph = []          # stack of currently-open '**'/'*'
        # table state
        self._in_table = False
        self.table_rows = []
        self._row = None
        self._cell = None
        self._in_bq = False

    # -- helpers ----------------------------------------------------------
    def _target_buf(self):
        return self._a if self._in_a else self.buf

    def _flush_paragraph(self):
        t = "".join(self.buf)
        self.buf = []
        t = re.sub(r"[ \t\xa0]+", " ", t)
        t = re.sub(r" *%s *" % BR, BR, t).strip().strip(BR).strip()
        if not t:
            return
        # escape a leading "N." so it is not parsed as an ordered list
        # (date lines like "2. 4. 2026" / "28. - 29. 6. 2023")
        t = re.sub(r"^(\d+)\.(?=\s)", r"\1\\.", t)
        self.out.append(("p", t))

    # -- tags -------------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("strong", "b"):
            self.emph.append("**")
            self._target_buf().append("**")
        elif tag in ("em", "i"):
            self.emph.append("*")
            self._target_buf().append("*")
        elif tag in ("sub", "sup"):
            self._target_buf().append("<%s>" % tag)
        elif tag == "br":
            # close open emphasis, break, reopen — keeps each line balanced
            for mk in reversed(self.emph):
                self.buf.append(mk)
            self.buf.append(BR)
            for mk in self.emph:
                self.buf.append(mk)
        elif tag == "a":
            self._in_a = True
            self._href = (a.get("href") or "").strip()
            self._a = []
            self._img_in_a = None
        elif tag == "img":
            src = (a.get("src") or "").strip()
            alt = (a.get("alt") or "").strip()
            if self._in_a:
                self._img_in_a = (alt, src)
            elif src:
                if self._in_table and self._cell is not None:
                    self._cell.append("![%s](%s)" % (alt, src))
                else:
                    self._flush_paragraph()
                    self.out.append(("img", "![%s](%s)" % (alt, src)))
        elif tag in ("ul", "ol"):
            self._flush_paragraph()
            self.list_stack.append(tag)
            self.ol_index.append(0)
        elif tag == "li":
            self.buf = []
        elif tag == "table":
            self._flush_paragraph()
            self._in_table = True
            self.table_rows = []
        elif tag == "tr":
            self._row = []
        elif tag in ("td", "th"):
            self._cell = []
        elif tag == "blockquote":
            self._flush_paragraph()
            self._in_bq = True
        elif re.fullmatch(r"h[1-6]", tag):
            self._flush_paragraph()
            self._h = int(tag[1])
        # p, div, span, font, u: block-neutral; div/p flushed on close

    def handle_endtag(self, tag):
        if tag in ("strong", "b"):
            if self.emph and self.emph[-1] == "**":
                self.emph.pop()
            self._target_buf().append("**")
        elif tag in ("em", "i"):
            if self.emph and self.emph[-1] == "*":
                self.emph.pop()
            self._target_buf().append("*")
        elif tag in ("sub", "sup"):
            self._target_buf().append("</%s>" % tag)
        elif tag == "a":
            self._in_a = False
            label = "".join(self._a).strip()
            href = self._href or ""
            if self._img_in_a:
                alt, src = self._img_in_a
                img = "![%s](%s)" % (alt, src)
                self._flush_paragraph()
                self.out.append(("img", "[%s](%s)" % (img, href) if href else img))
            elif label:
                self.buf.append("[%s](%s)" % (label, href) if href else label)
            self._href = None
            self._img_in_a = None
        elif tag == "li":
            marker = "-"
            depth = max(0, len(self.list_stack) - 1)
            if self.list_stack and self.list_stack[-1] == "ol":
                self.ol_index[-1] += 1
                marker = "%d." % self.ol_index[-1]
            t = "".join(self.buf).replace(BR, " ")
            t = re.sub(r"[ \t\xa0]+", " ", t).strip()
            t = re.sub(r"^[•·▪‣◦●\-–\s]+", "", t)  # strip literal bullet chars
            self.buf = []
            if t:
                self.out.append(("li", ("  " * depth) + marker + " " + t))
        elif tag in ("ul", "ol"):
            if self.list_stack:
                self.list_stack.pop()
                self.ol_index.pop()
        elif tag == "p":
            if self._in_bq:
                t = re.sub(r"[ \t\xa0]+", " ", "".join(self.buf).replace(BR, " ")).strip()
                self.buf = []
                if t:
                    self.out.append(("bq", "> " + t))
            else:
                self._flush_paragraph()
        elif tag == "div":
            if not self._in_table:
                self._flush_paragraph()
        elif tag == "blockquote":
            self._in_bq = False
        elif tag in ("td", "th"):
            if self._cell is not None and self._row is not None:
                self._row.append(re.sub(r"[ \t\xa0]+", " ", "".join(self._cell)).strip())
            self._cell = None
        elif tag == "tr":
            if self._row is not None:
                self.table_rows.append(self._row)
            self._row = None
        elif tag == "table":
            self._in_table = False
            self._emit_table()
        elif re.fullmatch(r"h[1-6]", tag):
            lvl = self._h or 2
            if lvl == 1 and self.demote_h1:
                lvl = 2
            t = re.sub(r"[ \t\xa0]+", " ", "".join(self.buf).replace(BR, " ")).strip()
            self.buf = []
            self._h = None
            for _ in range(3):
                t = re.sub(r"\*\*\s*\*\*", "", t)
                t = re.sub(r"(?<!\*)\*\s*\*(?!\*)", "", t)
            core = t.strip()
            mono = re.fullmatch(r"\*\*(.+?)\*\*", core)
            if mono and "**" not in mono.group(1):
                t = mono.group(1).strip()
            if t:
                self.out.append(("h", "#" * lvl + " " + t))

    def handle_data(self, data):
        if self._in_a:
            self._a.append(data)
        elif self._in_table and self._cell is not None:
            self._cell.append(data)
        elif self._in_table:
            pass
        else:
            self.buf.append(data)

    def _emit_table(self):
        rows = [r for r in self.table_rows if any(c.strip() for c in r)]
        if not rows:
            return
        ncol = max(len(r) for r in rows)
        if ncol == 1:  # single-column table = layout wrapper -> unwrap
            for r in rows:
                if r and r[0].strip():
                    self.out.append(("p", r[0].strip()))
            return
        rows = [r + [""] * (ncol - len(r)) for r in rows]
        lines = ["| " + " | ".join(rows[0]) + " |",
                 "| " + " | ".join(["---"] * ncol) + " |"]
        for r in rows[1:]:
            lines.append("| " + " | ".join(r) + " |")
        self.out.append(("table", "\n".join(lines)))

    def result(self):
        self._flush_paragraph()
        # join blocks; list items stay contiguous (single newline within a list run)
        parts = []
        prev_kind = None
        for kind, text in self.out:
            if not text.strip():
                continue
            if kind == "li" and prev_kind == "li":
                parts.append("\n" + text)
            elif kind == "bq" and prev_kind == "bq":
                parts.append("\n" + text)
            else:
                parts.append("\n\n" + text)
            prev_kind = kind
        body = "".join(parts).lstrip("\n")
        return body


def _emph_pair(marker, s):
    m = re.escape(marker)

    def repl(mo):
        lead, core, trail = mo.group(1), mo.group(2), mo.group(3)
        if not core.strip():
            return lead + trail  # empty emphasis -> just the whitespace
        return lead + marker + core + marker + trail

    return re.sub(r"%s([ \t]*)(.*?)([ \t]*)%s" % (m, m), repl, s)


def fix_emphasis(s):
    """Move whitespace out of **bold** then *italic* runs and drop empties."""
    s = _emph_pair("**", s)
    s = s.replace("**", "\x00\x00")       # protect bold while fixing italic
    s = _emph_pair("*", s)
    s = s.replace("\x00\x00", "**")
    s = s.replace("****", "")             # empty bold leftovers
    return s


def preclean_html(html, repair=True):
    if repair:
        html = ct_common.repair_shortcodes(html)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    html = html.replace("&nbsp;", " ").replace("\xa0", " ").replace("​", "")
    html = re.sub(r"</?big>", "", html, flags=re.I)
    html = re.sub(r"</?(span|font)\b[^>]*>", "", html, flags=re.I)
    # unwrap empty inline emphasis that only wraps whitespace/<br>
    prev = None
    while prev != html:
        prev = html
        html = re.sub(r"<(strong|b|em|i|u)>((?:\s|<br\s*/?>)*)</\1>", r"\2", html, flags=re.I)
    return html


def convert(html, cfg=None, demote_h1=True, repair=True):
    if cfg is None:
        cfg = ct_common.DEFAULT_CONFIG
    if not html or not html.strip():
        return ""
    html = preclean_html(html, repair=repair)
    w = Html2Md(demote_h1=demote_h1)
    w.feed(html)
    body = w.result()
    body = fix_emphasis(body)
    body = body.replace("\xa0", " ")
    body = re.sub(r"[ \t]{2,}", " ", body)
    body = re.sub(r" *%s *" % BR, "\x03", body)
    lines = [ln.strip() for ln in body.split("\n")]
    body = "\n".join(lines)
    body = re.sub(r"\x03+(?=\n)", "", body)   # bare hard-break before newline
    body = re.sub(r"(?<=\n)\x03+", "", body)
    body = re.sub(r"^\x03+", "", body)
    body = re.sub(r"\x03+$", "", body)
    body = body.replace("\x03", "  \n")        # remaining -> markdown hard break
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip()


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Convert HTML body content to GitHub-Flavored Markdown.")
    ap.add_argument("file", nargs="?", help="HTML file (default: stdin)")
    ap.add_argument("--config", help="content-conversion.config.json (for shortcode allowlist)")
    ap.add_argument("--keep-h1", action="store_true", help="do NOT demote body <h1> to <h2>")
    ap.add_argument("--no-repair-shortcodes", action="store_true",
                    help="skip span/curly-quote shortcode repair")
    args = ap.parse_args(argv)
    cfg = ct_common.load_config(args.config)
    html = open(args.file, encoding="utf-8").read() if args.file else sys.stdin.read()
    md = convert(html, cfg, demote_h1=not args.keep_h1, repair=not args.no_repair_shortcodes)
    sys.stdout.write(md + ("\n" if md else ""))


if __name__ == "__main__":
    main()
