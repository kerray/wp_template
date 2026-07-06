#!/usr/bin/env python3
"""Convert one DIVI WordPress page/post into a clean Astro Markdown file.

This is the helper for the `divi-to-astro-content` skill. It pulls a page's raw
DIVI body from the local WordPress (via WP-CLI over docker compose), flattens the
`[et_pb_*]` layout wrappers down to the meaningful content (headings, paragraphs,
lists, links, images, buttons) and emits Markdown with Astro content-collection
frontmatter.

Design notes
------------
* DIVI stores bodies as `[et_pb_section]…[et_pb_text]…` shortcodes whose CSS is
  generated dynamically by the theme, so they never render headlessly. We keep
  only the inner HTML of the text/image/button modules and drop the layout
  chrome (sections, rows, columns). Multi-column DIVI layout is intentionally
  flattened to a clean single-column article — that is the whole point.
* `strip_shortcodes()` on the WP side does NOT remove `[et_pb_*]` in the REST
  context (they aren't registered there), and the same caveat applies to any
  naive text pass here: a regex fallback that eats any leftover `[...]` token is
  required. See `strip_divi()` below.
* No third-party deps: HTML→Markdown uses the stdlib `html.parser`.

Usage
-----
    python3 divi_to_markdown.py page historie-skoly
    python3 divi_to_markdown.py page historie-skoly --out ../astro/src/content/pages
    python3 divi_to_markdown.py --id 639 --stdout
    python3 divi_to_markdown.py page o-skole --image-base https://waldorf-brno.cz

By default the file is written to
`site_waldorf_astro/astro/src/content/pages/<slug>.md` and printed to stderr.
Use `--stdout` to preview without writing.

Image handling (see SKILL.md → "Images"):
  Uploads referenced as `…/wp-content/uploads/…` are rewritten so their host is
  `--image-base` (default https://waldorf-brno.cz). That keeps a static build
  working by pointing at the live WP origin. To instead vendor images into the
  Astro repo, pass `--image-base ''` to get root-relative `/wp-content/uploads/…`
  paths and copy the files under `astro/public/wp-content/uploads/`.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

# Docker compose project dir that runs the local WordPress (DIVI). WP-CLI is
# invoked read-only from here; nothing is written back to WordPress.
WP_PROJECT_DIR = "/home/kerray/site_waldorf"

# Default output: the Astro `pages` content collection.
DEFAULT_OUT_DIR = "/home/kerray/site_waldorf_astro/astro/src/content/pages"

# WP origin(s) seen in the DB content (production host is stored even locally).
WP_HOSTS = (
    "http://waldorf-brno.cz",
    "https://waldorf-brno.cz",
    "http://localhost:8080",
    "http://localhost",
)


# --------------------------------------------------------------------------- #
# WordPress access (read-only)
# --------------------------------------------------------------------------- #
def wp_cli(args: list[str]) -> str:
    """Run a WP-CLI command in the local WP container and return stdout.

    PHP notices/warnings on stderr are ignored; only a non-zero exit with real
    stderr aborts.
    """
    cmd = [
        "docker", "compose",
        "--project-directory", WP_PROJECT_DIR,
        "exec", "-T", "wordpress",
        "wp", *args, "--allow-root",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if res.returncode != 0:
        noise = ("Notice:", "Deprecated:", "Warning:", "PHP message:")
        real = [
            ln for ln in res.stderr.strip().splitlines()
            if ln and not any(n in ln for n in noise)
        ]
        if real:
            sys.exit(f"WP-CLI error: {' '.join(real)}")
    return res.stdout.strip()


def resolve_post(post_type: str | None, slug: str | None, post_id: str | None):
    """Return (id, slug, title) for the target post."""
    if post_id:
        title = wp_cli(["post", "get", post_id, "--field=post_title"])
        slug = slug or wp_cli(["post", "get", post_id, "--field=post_name"])
        return post_id, slug, title
    ids = wp_cli([
        "post", "list", f"--post_type={post_type}", f"--name={slug}",
        "--post_status=any", "--field=ID",
    ])
    first = ids.split()[0] if ids.split() else ""
    if not first:
        sys.exit(f"No {post_type} found with slug '{slug}'")
    title = wp_cli(["post", "get", first, "--field=post_title"])
    return first, slug, title


# --------------------------------------------------------------------------- #
# DIVI stripping (shortcodes -> plain HTML)
# --------------------------------------------------------------------------- #
def _attr(blob: str, name: str) -> str | None:
    m = re.search(rf'\b{name}="([^"]*)"', blob)
    return m.group(1) if m else None


def strip_divi(content: str) -> str:
    """Flatten DIVI shortcodes to plain HTML, keeping module inner content.

    Order matters: content-bearing modules (image, button) are converted to HTML
    BEFORE the generic wrapper removal, otherwise their attributes are lost.
    """
    html = content

    # [et_pb_image src="…"] -> <img>
    def image_sub(m: re.Match[str]) -> str:
        src = _attr(m.group(1), "src")
        alt = _attr(m.group(1), "alt") or ""
        return f'<img src="{src}" alt="{alt}">' if src else ""

    html = re.sub(r"\[et_pb_image\b([^\]]*)\]", image_sub, html)

    # [et_pb_button button_text="…" button_url="…"] -> <a>
    def button_sub(m: re.Match[str]) -> str:
        text = _attr(m.group(1), "button_text") or "Odkaz"
        url = _attr(m.group(1), "button_url") or "#"
        return f'<p><a href="{url}">{text}</a></p>'

    html = re.sub(r"\[et_pb_button\b([^\]]*)\]", button_sub, html)

    # Remove all remaining DIVI wrappers (opening + closing).
    html = re.sub(r"\[et_pb_\w+\b[^\]]*\]", "", html)
    html = re.sub(r"\[/et_pb_\w+\]", "", html)

    # Regex fallback: eat ANY leftover bracketed shortcode token
    # (e.g. [wpseo_breadcrumb], [kalendar]) — strip_shortcodes()/registered
    # shortcodes are NOT reliable in a headless/text context.
    html = re.sub(r"\[/?[^\]]*\]", "", html)

    return html.strip()


# --------------------------------------------------------------------------- #
# HTML -> Markdown (stdlib parser, limited tag set)
# --------------------------------------------------------------------------- #
class _MarkdownWriter(HTMLParser):
    """Minimal HTML→Markdown for the tags DIVI text modules actually emit."""

    INLINE = {"a", "strong", "b", "em", "i", "span", "br", "img"}

    def __init__(self, image_base: str) -> None:
        super().__init__(convert_charrefs=True)
        self.image_base = image_base
        self.out: list[str] = []
        self.buf: list[str] = []       # current block's inline text
        self.list_stack: list[str] = []  # 'ul' | 'ol'
        self.ol_index: list[int] = []
        self._href: str | None = None
        self._a_text: list[str] = []
        self._in_a = False
        self._heading: int | None = None

    # -- helpers ----------------------------------------------------------- #
    def _flush_block(self, prefix: str = "") -> None:
        text = "".join(self.buf).strip()
        text = re.sub(r"[ \t]+", " ", text)
        self.buf = []
        if text:
            self.out.append(prefix + text)

    def _rewrite(self, url: str) -> str:
        if not url:
            return url
        # uploads -> configured image base (or root-relative when base == '')
        for host in WP_HOSTS:
            if url.startswith(host + "/wp-content/"):
                path = url[len(host):]
                return self.image_base + path
        # internal links: strip WP host -> root-relative
        for host in WP_HOSTS:
            if url.startswith(host + "/"):
                return url[len(host):]
        return url

    # -- tag handlers ------------------------------------------------------ #
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if tag in ("strong", "b"):
            self.buf.append("**")
        elif tag in ("em", "i"):
            self.buf.append("*")
        elif tag == "br":
            self.buf.append("  \n")
        elif tag == "a":
            self._in_a = True
            self._href = self._rewrite(a.get("href") or "")
            self._a_text = []
        elif tag == "img":
            src = self._rewrite(a.get("src") or "")
            alt = a.get("alt") or ""
            if src:
                self.out.append(f"![{alt}]({src})")
        elif tag in ("ul", "ol"):
            self._flush_block()
            self.list_stack.append(tag)
            self.ol_index.append(0)
        elif tag == "li":
            self.buf = []
        elif re.fullmatch(r"h[1-6]", tag):
            self._flush_block()
            self._heading = int(tag[1])

    def handle_endtag(self, tag: str) -> None:
        if tag in ("strong", "b"):
            self.buf.append("**")
        elif tag in ("em", "i"):
            self.buf.append("*")
        elif tag == "a":
            self._in_a = False
            label = "".join(self._a_text).strip()
            if label:
                self.buf.append(f"[{label}]({self._href})")
            self._href = None
        elif tag == "li":
            marker = "-"
            if self.list_stack and self.list_stack[-1] == "ol":
                self.ol_index[-1] += 1
                marker = f"{self.ol_index[-1]}."
            text = re.sub(r"[ \t]+", " ", "".join(self.buf).strip())
            self.buf = []
            if text:
                self.out.append(f"{marker} {text}")
        elif tag in ("ul", "ol"):
            if self.list_stack:
                self.list_stack.pop()
                self.ol_index.pop()
        elif tag == "p":
            self._flush_block()
        elif re.fullmatch(r"h[1-6]", tag):
            level = self._heading or 2
            text = re.sub(r"[ \t]+", " ", "".join(self.buf).strip())
            self.buf = []
            self._heading = None
            if text:  # drop DIVI's empty <h3></h3> spacers
                self.out.append("#" * level + " " + text)

    def handle_data(self, data: str) -> None:
        # Inside <a>, text belongs to the link label only; it is re-emitted as
        # Markdown `[label](href)` on the closing tag. Appending to `buf` too
        # would duplicate it.
        if self._in_a:
            self._a_text.append(data)
        else:
            self.buf.append(data)

    def result(self) -> str:
        self._flush_block()
        # collapse 3+ blank lines, join blocks with a blank line
        body = "\n\n".join(b for b in self.out if b.strip())
        body = re.sub(r"\n{3,}", "\n\n", body)
        return body.strip() + "\n"


def html_to_markdown(html: str, image_base: str) -> str:
    w = _MarkdownWriter(image_base)
    w.feed(html)  # HTMLParser(convert_charrefs=True) unescapes entities itself
    return w.result()


# --------------------------------------------------------------------------- #
# Frontmatter + file emit
# --------------------------------------------------------------------------- #
def yaml_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def build_markdown(post_id: str, slug: str, title: str, body: str) -> str:
    fm = (
        "---\n"
        f'title: "{yaml_escape(title)}"\n'
        f"wpId: {post_id}\n"
        f'wpSlug: "{slug}"\n'
        "source: divi\n"
        "draft: false\n"
        "---\n\n"
    )
    return fm + body


def main() -> None:
    ap = argparse.ArgumentParser(description="Convert one DIVI page to Astro Markdown")
    ap.add_argument("post_type", nargs="?", default="page", help="page | post (default page)")
    ap.add_argument("slug", nargs="?", help="post slug")
    ap.add_argument("--id", dest="post_id", help="post ID (alternative to slug)")
    ap.add_argument("--out", default=DEFAULT_OUT_DIR, help="output directory")
    ap.add_argument("--stdout", action="store_true", help="print instead of writing a file")
    ap.add_argument(
        "--image-base", default="https://waldorf-brno.cz",
        help="host prefix for /wp-content/uploads (empty => root-relative)",
    )
    args = ap.parse_args()

    if not args.slug and not args.post_id:
        ap.error("provide a slug or --id")

    post_id, slug, title = resolve_post(args.post_type, args.slug, args.post_id)
    raw = wp_cli(["post", "get", post_id, "--field=content"])
    html = strip_divi(raw)
    body = html_to_markdown(html, args.image_base.rstrip("/"))
    md = build_markdown(post_id, slug, title, body)

    if args.stdout:
        sys.stdout.write(md)
        return

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    dest = out_dir / f"{slug}.md"
    dest.write_text(md, encoding="utf-8")
    print(f"Wrote {dest} ({len(body)} chars of body)", file=sys.stderr)
    print("REVIEW the Markdown by hand before build — DIVI flattening is lossy.",
          file=sys.stderr)


if __name__ == "__main__":
    main()
