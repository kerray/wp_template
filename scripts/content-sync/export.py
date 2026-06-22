#!/usr/bin/env python3
"""
Generic WordPress content export -> flat files (raw content + metadata).

Exports posts of any type to editable flat files so they can be version
controlled, diffed, and re-imported with full fidelity (content, post fields,
post meta, and taxonomy terms).

Usage:
    python export.py <post_type> <slug>      # one item
    python export.py --all <post_type>       # every item of a type
    python export.py --all-types             # every public post type

Output (under ./content/<post_type>/<slug>/):
    content.html   raw post_content (human-editable, the source of truth on import)
    bundle.json    post fields + all post meta + taxonomy terms

Round-trips with import.py. Container-name agnostic (uses the compose service).
"""

import json
import subprocess
import sys
from pathlib import Path

SERVICE = "wordpress"
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"


def wp(*args, capture=True):
    """Run a wp-cli command inside the compose 'wordpress' service."""
    cmd = ["docker", "compose", "exec", "-T", SERVICE, "wp", *args, "--allow-root"]
    result = subprocess.run(cmd, capture_output=capture, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise RuntimeError(f"wp {' '.join(args)} failed (exit {result.returncode})")
    return result.stdout.strip()


# PHP that dumps one post (by ID) as a JSON bundle on stdout.
EXPORT_PHP = r'''
$id = %d;
$p = get_post($id);
if (!$p) { echo '{"__error__":"not_found"}'; return; }
$author = get_userdata($p->post_author);
$parent_slug = $p->post_parent ? get_post_field('post_name', $p->post_parent) : '';
$terms = array();
foreach (get_object_taxonomies($p->post_type) as $tax) {
    $tt = wp_get_object_terms($id, $tax);
    if (!is_wp_error($tt) && $tt) {
        $list = array();
        foreach ($tt as $t) { $list[] = array('slug' => $t->slug, 'name' => $t->name); }
        $terms[$tax] = $list;
    }
}
echo json_encode(array(
    'post' => array(
        'post_title'     => $p->post_title,
        'post_name'      => $p->post_name,
        'post_type'      => $p->post_type,
        'post_status'    => $p->post_status,
        'post_date'      => $p->post_date,
        'post_excerpt'   => $p->post_excerpt,
        'post_author'    => $author ? $author->user_login : '',
        'post_parent'    => $parent_slug,
        'menu_order'     => (int) $p->menu_order,
        'comment_status' => $p->comment_status,
        'ping_status'    => $p->ping_status,
        'post_content'   => $p->post_content,
    ),
    'meta'  => get_post_meta($id),
    'terms' => $terms,
), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
'''


def list_ids(post_type):
    out = wp("post", "list", f"--post_type={post_type}",
             "--post_status=any", "--format=ids")
    return out.split() if out else []


def public_post_types():
    out = wp("post-type", "list", "--public=1", "--field=name")
    return [t for t in out.splitlines() if t.strip()]


def export_id(post_id):
    raw = wp("eval", EXPORT_PHP % int(post_id))
    bundle = json.loads(raw)
    if bundle.get("__error__"):
        print(f"  ! post {post_id}: {bundle['__error__']}")
        return
    post = bundle["post"]
    slug = post["post_name"] or f"id-{post_id}"
    out_dir = CONTENT_DIR / post["post_type"] / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    # content.html is the editable source of truth; keep it out of bundle.json
    content = post.pop("post_content")
    (out_dir / "content.html").write_text(content)
    (out_dir / "bundle.json").write_text(
        json.dumps(bundle, indent=2, ensure_ascii=False) + "\n"
    )
    print(f"  exported {post['post_type']}/{slug}  ({len(bundle['meta'])} meta keys)")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    if args[0] == "--all-types":
        targets = []
        for pt in public_post_types():
            targets += list_ids(pt)
    elif args[0] == "--all":
        if len(args) < 2:
            print("Usage: python export.py --all <post_type>")
            sys.exit(1)
        targets = list_ids(args[1])
    else:
        if len(args) < 2:
            print("Usage: python export.py <post_type> <slug>")
            sys.exit(1)
        post_type, slug = args[0], args[1]
        ids = wp("post", "list", f"--post_type={post_type}",
                 f"--name={slug}", "--post_status=any", "--format=ids")
        targets = ids.split() if ids else []
        if not targets:
            print(f"No {post_type} found with slug '{slug}'")
            sys.exit(1)

    print(f"Exporting {len(targets)} item(s) to {CONTENT_DIR}/ ...")
    for pid in targets:
        export_id(pid)
    print("Done.")


if __name__ == "__main__":
    main()
