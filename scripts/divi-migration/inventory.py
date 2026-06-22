#!/usr/bin/env python3
"""
DIVI Migration: Generate inventory of all DIVI-based content
Usage: python inventory.py [output_dir]
"""

import subprocess
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

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


def calculate_complexity(content):
    """Calculate complexity score from content based on shortcode usage."""
    score = 0
    for shortcode, weight in WEIGHTS.items():
        # Count occurrences of [shortcode_name
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
    """Extract unique shortcode types from content."""
    pattern = r'\[et_pb_([a-z_]+)'
    matches = re.findall(pattern, content)
    return sorted(set(f'et_pb_{m}' for m in matches))


def get_divi_content(post_type):
    """Get list of DIVI-enabled content of a specific type."""
    output = wp_cli(
        'post', 'list',
        f'--post_type={post_type}',
        '--meta_key=_et_pb_use_builder',
        '--meta_value=on',
        '--fields=ID,post_name,post_title',
        '--format=json'
    )
    if not output:
        return []
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print(f"  Warning: Could not parse JSON for {post_type}")
        return []


def get_post_content(post_id):
    """Get post content by ID."""
    return wp_cli('post', 'get', str(post_id), '--field=post_content')


def main():
    output_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('content/inventory')
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=== DIVI Migration Inventory Generator ===")
    print(f"Output directory: {output_dir}")
    print()

    # Initialize inventory data
    inventory = {
        'simple': {'pages': [], 'posts': [], 'akce': []},
        'moderate': {'pages': [], 'posts': [], 'akce': []},
        'complex': {'pages': [], 'posts': [], 'akce': []},
    }

    # Counters
    counts = defaultdict(int)

    # Process each post type
    for post_type in ['page', 'post', 'akce']:
        print(f"Processing {post_type}...")

        items = get_divi_content(post_type)
        if not items:
            print(f"  No DIVI content found for {post_type}")
            continue

        type_key = 'pages' if post_type == 'page' else ('posts' if post_type == 'post' else 'akce')

        for item in items:
            post_id = item.get('ID')
            slug = item.get('post_name', '')
            title = item.get('post_title', '')

            if not post_id:
                continue

            # Get content
            content = get_post_content(post_id)
            if not content:
                print(f"  Warning: Could not get content for {post_type} {slug} (ID: {post_id})")
                continue

            # Calculate complexity
            score = calculate_complexity(content)
            level = classify_complexity(score)
            shortcodes = extract_shortcodes(content)

            # Add to inventory
            inventory[level][type_key].append({
                'id': post_id,
                'slug': slug,
                'title': title,
                'score': score,
                'shortcodes': shortcodes,
            })

            counts[f'{level}_{type_key}'] += 1
            print(f"  [{level}] {slug} (score: {score})")

    # Write inventory files
    for level, data in inventory.items():
        filepath = output_dir / f"{level}.md"

        with open(filepath, 'w') as f:
            f.write(f"# DIVI Content Inventory - {level.title()}\n\n")

            if level == 'simple':
                f.write("Content with complexity score 1-20 (easiest to convert).\n\n")
            elif level == 'moderate':
                f.write("Content with complexity score 21-50 (moderate effort).\n\n")
            else:
                f.write("Content with complexity score 51+ (most challenging).\n\n")

            for section, items in [('Pages', data['pages']), ('Posts', data['posts']), ('Akce', data['akce'])]:
                f.write(f"## {section}\n\n")

                for item in items:
                    shortcodes_str = ', '.join(item['shortcodes']) if item['shortcodes'] else 'none'
                    f.write(f"- [ ] **{item['title']}** (ID: {item['id']}, slug: `{item['slug']}`, score: {item['score']})\n")
                    f.write(f"  - Shortcodes: {shortcodes_str}\n\n")

            # Summary
            total = len(data['pages']) + len(data['posts']) + len(data['akce'])
            f.write("---\n\n")
            f.write("## Summary\n\n")
            f.write(f"- Pages: {len(data['pages'])}\n")
            f.write(f"- Posts: {len(data['posts'])}\n")
            f.write(f"- Akce: {len(data['akce'])}\n")
            f.write(f"- **Total: {total}**\n")

    # Write too-hard template
    too_hard_path = output_dir / "too-hard.md"
    with open(too_hard_path, 'w') as f:
        f.write("# DIVI Content - Too Hard\n\n")
        f.write("Content flagged as too complex for automated conversion.\n\n")
        f.write("<!-- Add entries during conversion process -->\n\n")

    # Print summary
    print()
    print("=== Inventory Complete ===")
    print()
    print("Results:")
    print(f"  Simple:   {counts['simple_pages']} pages, {counts['simple_posts']} posts, {counts['simple_akce']} akce")
    print(f"  Moderate: {counts['moderate_pages']} pages, {counts['moderate_posts']} posts, {counts['moderate_akce']} akce")
    print(f"  Complex:  {counts['complex_pages']} pages, {counts['complex_posts']} posts, {counts['complex_akce']} akce")
    print()
    print(f"Files created in {output_dir}:")
    print("  - simple.md")
    print("  - moderate.md")
    print("  - complex.md")
    print("  - too-hard.md")


if __name__ == '__main__':
    main()
