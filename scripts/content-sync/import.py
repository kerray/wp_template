#!/usr/bin/env python3
"""
Generic flat files -> WordPress content import (raw content + metadata).

Reads the flat files produced by export.py and creates or updates the matching
WordPress posts with full fidelity: post fields, raw content, all post meta, and
taxonomy terms. Posts are matched by post_name (slug) + post_type, so re-imports
update in place instead of duplicating.

Usage:
    python import.py <post_type> <slug>      # one item
    python import.py --all <post_type>       # every exported item of a type
    python import.py --all-types             # everything under ./content/

Reads from ./content/<post_type>/<slug>/{bundle.json, content.html}.
content.html is authoritative for post_content (so hand edits win).
Round-trips with export.py. Container-name agnostic (uses the compose service).
"""

import json
import subprocess
import sys
from pathlib import Path

SERVICE = "wordpress"
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"
CONTAINER_TMP = "/tmp/wp_content_import.json"

# PHP that reads a bundle from CONTAINER_TMP and creates/updates the post.
IMPORT_PHP = r'''
$data = json_decode(file_get_contents("%s"), true);
if (!$data || empty($data['post'])) { echo "ERROR: bad bundle"; return; }
$post = $data['post'];

$author_id = 0;
if (!empty($post['post_author'])) {
    $u = get_user_by('login', $post['post_author']);
    if ($u) { $author_id = $u->ID; }
}
$parent_id = 0;
if (!empty($post['post_parent'])) {
    $pp = get_posts(array('name' => $post['post_parent'], 'post_type' => $post['post_type'],
                          'post_status' => 'any', 'numberposts' => 1));
    if ($pp) { $parent_id = $pp[0]->ID; }
}
// Only match an existing post when we have a real slug. Matching on an empty
// post_name would let get_posts() pick an arbitrary post and update the wrong row.
$existing = array();
if (!empty($post['post_name'])) {
    $existing = get_posts(array('name' => $post['post_name'], 'post_type' => $post['post_type'],
                                'post_status' => 'any', 'numberposts' => 1));
}

$arr = array(
    'post_title'     => $post['post_title'],
    'post_name'      => $post['post_name'],
    'post_type'      => $post['post_type'],
    'post_status'    => $post['post_status'],
    'post_content'   => $post['post_content'],
    'post_excerpt'   => $post['post_excerpt'],
    'post_date'      => $post['post_date'],
    'menu_order'     => (int) $post['menu_order'],
    'comment_status' => $post['comment_status'],
    'ping_status'    => $post['ping_status'],
);
if ($author_id) { $arr['post_author'] = $author_id; }
if ($parent_id) { $arr['post_parent'] = $parent_id; }

if ($existing) {
    $arr['ID'] = $existing[0]->ID;
    $id = wp_update_post($arr, true);
    $action = 'updated';
} else {
    $id = wp_insert_post($arr, true);
    $action = 'created';
}
if (is_wp_error($id)) { echo "ERROR: " . $id->get_error_message(); return; }

if (!empty($data['meta'])) {
    foreach ($data['meta'] as $key => $values) {
        delete_post_meta($id, $key);
        foreach ((array) $values as $v) { add_post_meta($id, $key, $v); }
    }
}
if (!empty($data['terms'])) {
    foreach ($data['terms'] as $tax => $terms) {
        $ids = array();
        foreach ($terms as $t) {
            $ex = term_exists($t['slug'], $tax);
            if (!$ex) { $ex = wp_insert_term($t['name'], $tax, array('slug' => $t['slug'])); }
            if (!is_wp_error($ex)) { $ids[] = (int) (is_array($ex) ? $ex['term_id'] : $ex); }
        }
        if ($ids) { wp_set_object_terms($id, $ids, $tax, false); }
    }
}
echo "OK: {$action} {$id}";
'''


def wp_eval(php):
    cmd = ["docker", "compose", "exec", "-T", SERVICE, "wp", "eval", php, "--allow-root"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode, result.stderr


def push_bundle(bundle_text):
    """Copy the bundle JSON into the container without a hardcoded container name."""
    subprocess.run(
        ["docker", "compose", "exec", "-T", SERVICE, "sh", "-c", f"cat > {CONTAINER_TMP}"],
        input=bundle_text, text=True, capture_output=True, check=True,
    )


def import_item(item_dir):
    bundle_path = item_dir / "bundle.json"
    content_path = item_dir / "content.html"
    if not bundle_path.exists():
        print(f"  ! skip {item_dir}: no bundle.json")
        return False
    bundle = json.loads(bundle_path.read_text())
    # content.html holds the body: export.py always writes it and strips post_content
    # from bundle.json. If it's missing, refuse rather than silently wipe the body.
    if content_path.exists():
        bundle["post"]["post_content"] = content_path.read_text()
    elif "post_content" not in bundle["post"]:
        print(f"  ! {item_dir.name}: missing content.html — refusing to import "
              f"(would wipe post_content). Restore the file or re-export.")
        return False

    push_bundle(json.dumps(bundle, ensure_ascii=False))
    out, code, err = wp_eval(IMPORT_PHP % CONTAINER_TMP)
    if code != 0 or out.startswith("ERROR"):
        print(f"  ! {item_dir.name}: {out or err.strip()}")
        return False
    print(f"  {out}  ({item_dir.relative_to(CONTENT_DIR)})")
    return True


def iter_item_dirs(args):
    if args[0] == "--all-types":
        return sorted(p.parent for p in CONTENT_DIR.glob("*/*/bundle.json"))
    if args[0] == "--all":
        if len(args) < 2:
            print("Usage: python import.py --all <post_type>")
            sys.exit(1)
        return sorted((CONTENT_DIR / args[1]).glob("*/"))
    if len(args) < 2:
        print("Usage: python import.py <post_type> <slug>")
        sys.exit(1)
    d = CONTENT_DIR / args[0] / args[1]
    if not d.exists():
        print(f"No exported content at {d}")
        sys.exit(1)
    return [d]


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    if not CONTENT_DIR.exists():
        print(f"No content directory at {CONTENT_DIR}. Run export.py first.")
        sys.exit(1)

    items = [d for d in iter_item_dirs(args) if (d / "bundle.json").exists()]
    if not items:
        print("Nothing to import.")
        sys.exit(1)

    print(f"Importing {len(items)} item(s) from {CONTENT_DIR}/ ...")
    failures = 0
    for d in items:
        if not import_item(d):
            failures += 1
    # Clean up the in-container temp file
    subprocess.run(
        ["docker", "compose", "exec", "-T", SERVICE, "rm", "-f", CONTAINER_TMP],
        capture_output=True,
    )
    if failures:
        print(f"Done with {failures} failure(s).")
        sys.exit(1)
    print("Done.")


if __name__ == "__main__":
    main()
