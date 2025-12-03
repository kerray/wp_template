#!/usr/bin/env python3
"""
DIVI Migration: Export content to files
Usage: python export.py <post_type> <slug>
   or: python export.py --all <post_type>
"""

import subprocess
import json
import re
import sys
from pathlib import Path
from datetime import datetime

# Shortcode weights for complexity scoring
WEIGHTS = {
    'et_pb_text': 1,
    'et_pb_button': 1,
    'et_pb_image': 1,
    'et_pb_column': 2,
    'et_pb_row': 2,
    'et_pb_blurb': 3,
    'et_pb_section': 3,
    'et_pb_tabs': 5,
    'et_pb_tab': 2,
    'et_pb_blog': 8,
}


def wp_cli(*args):
    """Run WP-CLI command and return output."""
    cmd = ['docker-compose', 'exec', '-T', 'wordpress', 'wp', *args, '--allow-root']
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()


def get_type_dir(post_type):
    """Get directory name for post type."""
    mapping = {
        'page': 'pages',
        'post': 'posts',
        'akce': 'akce',
    }
    if post_type not in mapping:
        raise ValueError(f"Unknown post type: {post_type}")
    return mapping[post_type]


def calculate_complexity(content):
    """Calculate complexity score from content based on shortcode usage."""
    score = 0
    for shortcode, weight in WEIGHTS.items():
        pattern = rf'\[{shortcode}\s'
        count = len(re.findall(pattern, content))
        score += count * weight
    return score


def classify_complexity(score):
    """Classify complexity level based on score."""
    if score <= 20:
        return 'simple'
    elif score <= 50:
        return 'moderate'
    else:
        return 'complex'


def extract_shortcodes(content):
    """Extract unique DIVI shortcodes from content."""
    pattern = r'\[et_pb_([a-z_]+)'
    matches = re.findall(pattern, content)
    return sorted(set(f'et_pb_{m}' for m in matches))


def export_single(post_type, slug):
    """Export a single content item."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    content_dir = project_root / 'content' / get_type_dir(post_type) / slug

    print(f"Exporting {post_type}: {slug}")

    # Create output directory
    content_dir.mkdir(parents=True, exist_ok=True)

    # Get post data using wp eval (handles drafts correctly)
    php_code = f'''
    global $wpdb;
    $post = $wpdb->get_row($wpdb->prepare(
        "SELECT ID, post_title, post_name, guid FROM {{$wpdb->posts}} WHERE post_name = %s AND post_type = %s LIMIT 1",
        "{slug}", "{post_type}"
    ));
    if ($post) {{
        echo json_encode(array(
            "ID" => $post->ID,
            "post_title" => $post->post_title,
            "post_name" => $post->post_name,
            "guid" => $post->guid
        ));
    }} else {{
        echo "null";
    }}
    '''
    post_data_json = wp_cli('eval', php_code)

    try:
        post_data = json.loads(post_data_json) if post_data_json != 'null' else None
    except json.JSONDecodeError:
        print(f"Error: Could not parse post data for {post_type} {slug}")
        sys.exit(1)

    if not post_data:
        print(f"Error: No {post_type} found with slug: {slug}")
        sys.exit(1)

    post_id = post_data['ID']
    title = post_data['post_title']
    url = re.sub(r'http://[^/]*/', '/', post_data['guid'])

    print(f"  Post ID: {post_id}")

    # Get content
    content = wp_cli('post', 'get', str(post_id), '--field=post_content')

    if not content:
        print(f"Error: Could not get content for {post_type} {slug} (ID: {post_id})")
        sys.exit(1)

    # Save original content
    (content_dir / 'original.txt').write_text(content)
    print("  Saved: original.txt")

    # Get all meta
    meta_json = wp_cli('post', 'meta', 'list', str(post_id), '--format=json')
    try:
        all_meta = json.loads(meta_json) if meta_json else []
    except json.JSONDecodeError:
        all_meta = []

    # Filter DIVI-related meta
    divi_meta = [
        m for m in all_meta
        if m.get('meta_key', '').startswith('_et_pb_') or m.get('meta_key', '').startswith('_global_colors')
    ]

    # For akce, also get zv_* fields
    akce_meta = {}
    if post_type == 'akce':
        akce_meta = {
            m['meta_key']: m['meta_value']
            for m in all_meta
            if m.get('meta_key', '').startswith('zv_')
        }

    # Calculate complexity
    score = calculate_complexity(content)
    level = classify_complexity(score)
    shortcodes = extract_shortcodes(content)

    # Build metadata
    now = datetime.now().isoformat()

    metadata = {
        'id': int(post_id),
        'post_type': post_type,
        'title': title,
        'slug': slug,
        'url': url,
        'status': 'pending',
        'complexity': level,
        'complexity_score': score,
        'shortcodes_found': shortcodes,
        'original': {
            'exported_at': now,
            'divi_meta': divi_meta,
            'akce_meta': akce_meta,
        },
        'screenshots': {
            'before': None,
            'after': None,
        },
        'converted': {
            'converted_at': None,
            'converter_version': None,
            'notes': [],
            'removed_images': [],
            'pdf_previews_detected': [],
        },
        'published': {
            'published_at': None,
            'gutenberg_meta': {},
        },
    }

    with open(content_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print("  Saved: metadata.json")

    print(f"  Complexity: {level} (score: {score})")
    print(f"  Done: {content_dir}")


def export_all(post_type):
    """Export all DIVI content of a given type."""
    print(f"=== Exporting all {post_type} with DIVI ===")

    # Get list of DIVI-enabled content (include all statuses)
    items_csv = wp_cli(
        'post', 'list',
        f'--post_type={post_type}',
        '--meta_key=_et_pb_use_builder',
        '--meta_value=on',
        '--post_status=any',
        '--fields=post_name',
        '--format=csv'
    )

    # Parse CSV (skip header)
    lines = items_csv.strip().split('\n')
    if len(lines) <= 1:
        print(f"No DIVI content found for {post_type}")
        return

    slugs = [line.strip() for line in lines[1:] if line.strip()]

    count = 0
    for slug in slugs:
        try:
            export_single(post_type, slug)
            count += 1
        except Exception as e:
            print(f"  Error exporting {slug}: {e}")

    print()
    print(f"Exported {count} {post_type}s")


def main():
    if len(sys.argv) < 2:
        print("Usage: python export.py <post_type> <slug>")
        print("       python export.py --all <post_type>")
        print()
        print("post_type: page, post, or akce")
        sys.exit(1)

    if sys.argv[1] == '--all':
        if len(sys.argv) < 3:
            print("Usage: python export.py --all <post_type>")
            sys.exit(1)
        export_all(sys.argv[2])
    else:
        if len(sys.argv) < 3:
            print("Usage: python export.py <post_type> <slug>")
            sys.exit(1)
        export_single(sys.argv[1], sys.argv[2])


if __name__ == '__main__':
    main()
