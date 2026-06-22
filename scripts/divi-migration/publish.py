#!/usr/bin/env python3
"""
DIVI Migration: Publish converted content to WordPress

Usage:
  python publish.py <post_type> <slug>              # Create -gut duplicate (default)
  python publish.py <post_type> <slug> --replace    # Replace original content
  python publish.py --batch [--dry-run] [--replace] # Batch publish

Modes:
  --replace    Replace the original post content (destructive!)
  (default)    Create a duplicate post with '-gut' suffix for comparison
"""

import subprocess
import json
import sys
from pathlib import Path
from datetime import datetime


def wp_cli(*args, input_text=None):
    """Run WP-CLI command and return output."""
    cmd = ['docker-compose', 'exec', '-T', 'wordpress', 'wp', *args, '--allow-root']
    result = subprocess.run(cmd, capture_output=True, text=True, input=input_text)
    if result.returncode != 0 and result.stderr:
        # Filter out common warnings
        stderr_lines = [l for l in result.stderr.split('\n')
                       if 'Notice:' not in l and 'Deprecated:' not in l and l.strip()]
        if stderr_lines:
            print(f"WP-CLI error: {chr(10).join(stderr_lines)}", file=sys.stderr)
    return result.stdout.strip(), result.returncode


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


def backup_original_content(metadata, content_dir):
    """Backup original DIVI content before replacing."""
    original_id = metadata.get('id')
    if not original_id:
        return False

    # Get current content from WordPress
    content, returncode = wp_cli('post', 'get', str(original_id), '--field=post_content')
    if returncode != 0:
        return False

    # Save backup
    backup_file = content_dir / 'original_backup.html'
    backup_file.write_text(content)

    # Update metadata with backup info
    if 'backup' not in metadata:
        metadata['backup'] = {}
    metadata['backup']['backed_up_at'] = datetime.now().isoformat()
    metadata['backup']['backup_file'] = 'original_backup.html'

    return True


def publish_content(post_type, slug, batch_mode=False, replace_mode=False):
    """Publish converted content to WordPress.

    Args:
        post_type: 'page', 'post', or 'akce'
        slug: The post slug
        batch_mode: If True, skip interactive prompts
        replace_mode: If True, replace original; if False, create -gut duplicate
    """
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    content_dir = project_root / 'content' / get_type_dir(post_type) / slug

    mode_str = "REPLACE" if replace_mode else "duplicate"
    if not batch_mode:
        print(f"Publishing {post_type}: {slug} ({mode_str})")

    # Check if converted content exists
    converted_file = content_dir / 'converted.html'
    if not converted_file.exists():
        print(f"  Error: No converted content found")
        if not batch_mode:
            print(f"Run conversion first: just divi-convert {post_type} {slug}")
            sys.exit(1)
        return False

    metadata_file = content_dir / 'metadata.json'
    if not metadata_file.exists():
        print(f"  Error: No metadata found")
        if not batch_mode:
            sys.exit(1)
        return False

    # Load metadata
    with open(metadata_file) as f:
        metadata = json.load(f)

    status = metadata.get('status', 'pending')

    if status == 'pending':
        print(f"  Warning: Content not converted (status: pending)")
        if not batch_mode:
            print(f"Run conversion first: just divi-convert {post_type} {slug}")
            sys.exit(1)
        return False

    # Get original post data
    original_id = metadata.get('id')
    if not original_id:
        print("Error: Could not get original post ID from metadata")
        sys.exit(1)

    # Get original post metadata
    post_data_json, _ = wp_cli(
        'post', 'get', str(original_id),
        '--fields=post_title,post_status,post_author,post_excerpt,post_parent,menu_order,post_type',
        '--format=json'
    )

    try:
        post_data = json.loads(post_data_json)
    except json.JSONDecodeError:
        print(f"Error: Could not get original post data")
        sys.exit(1)

    title = post_data.get('post_title', metadata.get('title', 'Untitled'))
    post_status = post_data.get('post_status', 'draft')
    author = post_data.get('post_author', '1')
    parent = post_data.get('post_parent', '0')
    menu_order = post_data.get('menu_order', '0')

    # Read converted content
    converted_content = converted_file.read_text()

    # Write content to a temp file inside the container
    temp_file = content_dir / '.temp_content.html'
    temp_file.write_text(converted_content)

    container_temp = f'/tmp/converted_{slug}.html'

    # Copy content into the container via the compose service (no hardcoded container name)
    with open(temp_file, 'r') as f:
        subprocess.run(
            ['docker-compose', 'exec', '-T', 'wordpress', 'sh', '-c', f'cat > {container_temp}'],
            stdin=f, capture_output=True,
        )

    now = datetime.now().isoformat()

    if replace_mode:
        # === REPLACE MODE: Update original post ===
        print(f"  Original ID: {original_id}")
        print(f"  Mode: REPLACING original content")

        # Backup original content first
        if not metadata.get('backup', {}).get('backed_up_at'):
            print(f"  Backing up original content...")
            if backup_original_content(metadata, content_dir):
                print(f"  Backup saved to original_backup.html")
            else:
                print(f"  Warning: Could not backup original content")
                if not batch_mode:
                    response = input("  Continue without backup? [y/N] ").strip().lower()
                    if response != 'y':
                        temp_file.unlink(missing_ok=True)
                        sys.exit(0)

        # Update the original post
        php_code = f'''
        $content = file_get_contents("{container_temp}");
        $result = wp_update_post(array(
            "ID" => {original_id},
            "post_content" => $content
        ), true);
        if (is_wp_error($result)) {{
            echo "Error: " . $result->get_error_message();
        }} else {{
            echo "Updated post {original_id}";
        }}
        '''
        output, returncode = wp_cli('eval', php_code)

        if returncode != 0 or output.startswith('Error:'):
            print(f"Error: Failed to update original: {output}")
            temp_file.unlink(missing_ok=True)
            sys.exit(1)

        # Add migration tracking meta
        wp_cli('post', 'meta', 'update', str(original_id), '_migrated_from_divi', '1')
        wp_cli('post', 'meta', 'update', str(original_id), '_divi_migration_date', now)

        # Update metadata
        metadata['status'] = 'replaced'
        if 'replaced' not in metadata:
            metadata['replaced'] = {}
        metadata['replaced']['replaced_at'] = now

        # Clean up any duplicate info if switching from duplicate mode
        if metadata.get('published', {}).get('duplicate_id'):
            metadata['replaced']['previous_duplicate_id'] = metadata['published']['duplicate_id']

        print(f"  Original post updated successfully")
        print(f"  Status: replaced")
        print()
        print(f"  View: http://localhost:8080/{slug}/")

    else:
        # === DUPLICATE MODE: Create -gut suffixed copy ===
        new_slug = f"{slug}-gut"
        duplicate_id = metadata.get('published', {}).get('duplicate_id')

        if duplicate_id:
            if batch_mode:
                print(f"  Skipping: Already published (ID: {duplicate_id})")
                return True
            print(f"  Duplicate already exists (ID: {duplicate_id})")
            response = input("  Update existing duplicate? [y/N] ").strip().lower()
            if response != 'y':
                temp_file.unlink(missing_ok=True)
                sys.exit(0)

        print(f"  Original ID: {original_id}")
        print(f"  New slug: {new_slug}")

        if duplicate_id:
            # Update existing duplicate
            php_code = f'''
            $content = file_get_contents("{container_temp}");
            $result = wp_update_post(array(
                "ID" => {duplicate_id},
                "post_content" => $content
            ), true);
            if (is_wp_error($result)) {{
                echo "Error: " . $result->get_error_message();
            }} else {{
                echo "Updated duplicate post {duplicate_id}";
            }}
            '''
            output, returncode = wp_cli('eval', php_code)
            new_id = duplicate_id
        else:
            # Create new duplicate post
            # Escape title for PHP
            escaped_title = title.replace('\\', '\\\\').replace('"', '\\"')
            php_code = f'''
            $content = file_get_contents("{container_temp}");
            $new_post = array(
                "post_title" => "{escaped_title} (Gutenberg)",
                "post_content" => $content,
                "post_status" => "{post_status}",
                "post_author" => {author},
                "post_name" => "{new_slug}",
                "post_type" => "{post_type}",
                "post_excerpt" => "",
                "post_parent" => {parent},
                "menu_order" => {menu_order}
            );
            $new_id = wp_insert_post($new_post, true);
            if (is_wp_error($new_id)) {{
                echo "Error: " . $new_id->get_error_message();
            }} else {{
                echo $new_id;
            }}
            '''
            output, returncode = wp_cli('eval', php_code)

            if returncode != 0 or output.startswith('Error:'):
                print(f"Error: Failed to create duplicate: {output}")
                temp_file.unlink(missing_ok=True)
                sys.exit(1)

            try:
                new_id = int(output)
            except ValueError:
                print(f"Error: Unexpected response: {output}")
                temp_file.unlink(missing_ok=True)
                sys.exit(1)

            print(f"  Created duplicate post ID: {new_id}")

        # Copy relevant meta from original (featured image, categories, etc.)
        if not duplicate_id:
            # Copy featured image
            thumbnail_id, _ = wp_cli('post', 'meta', 'get', str(original_id), '_thumbnail_id')
            if thumbnail_id:
                wp_cli('post', 'meta', 'update', str(new_id), '_thumbnail_id', thumbnail_id)
                print(f"  Copied featured image")

            # Copy categories (for posts)
            if post_type == 'post':
                categories, _ = wp_cli('post', 'term', 'list', str(original_id), 'category', '--field=term_id', '--format=csv')
                if categories:
                    cat_ids = [c.strip() for c in categories.strip().split('\n')[1:] if c.strip()]
                    if cat_ids:
                        wp_cli('post', 'term', 'set', str(new_id), 'category', *cat_ids, '--by=id')
                        print(f"  Copied categories")

            # Copy tags (for posts)
            if post_type == 'post':
                tags, _ = wp_cli('post', 'term', 'list', str(original_id), 'post_tag', '--field=term_id', '--format=csv')
                if tags:
                    tag_ids = [t.strip() for t in tags.strip().split('\n')[1:] if t.strip()]
                    if tag_ids:
                        wp_cli('post', 'term', 'set', str(new_id), 'post_tag', *tag_ids, '--by=id')
                        print(f"  Copied tags")

            # For akce, copy zv_* meta fields
            if post_type == 'akce':
                akce_meta = metadata.get('original', {}).get('akce_meta', {})
                for key, value in akce_meta.items():
                    if value:
                        wp_cli('post', 'meta', 'update', str(new_id), key, str(value))
                if akce_meta:
                    print(f"  Copied akce meta fields")

        # Add migration tracking meta to the new post
        wp_cli('post', 'meta', 'update', str(new_id), '_migrated_from_divi', '1')
        wp_cli('post', 'meta', 'update', str(new_id), '_divi_migration_date', now)
        wp_cli('post', 'meta', 'update', str(new_id), '_divi_original_id', str(original_id))

        # Update metadata
        metadata['status'] = 'published'
        if 'published' not in metadata:
            metadata['published'] = {}
        metadata['published']['published_at'] = now
        metadata['published']['duplicate_id'] = new_id
        metadata['published']['duplicate_slug'] = new_slug

        print(f"  Content published successfully")
        print(f"  Status: published")
        print()
        print(f"  Compare:")
        print(f"    Original: http://localhost:8080/{slug}/")
        print(f"    Gutenberg: http://localhost:8080/{new_slug}/")

    # Clean up temp files
    temp_file.unlink(missing_ok=True)
    subprocess.run(['docker-compose', 'exec', '-T', 'wordpress', 'rm', '-f', container_temp], capture_output=True)

    # Save metadata
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    return True


def publish_batch(dry_run=False, replace_mode=False):
    """Publish all converted content."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    content_dir = project_root / 'content'

    mode_str = "REPLACING originals" if replace_mode else "creating duplicates"
    print(f"=== Batch Publishing Converted Content ({mode_str}) ===")
    if dry_run:
        print("*** DRY RUN MODE - No posts will be modified ***")
    if replace_mode:
        print("*** WARNING: This will replace original content! ***")
    print()

    success = 0
    skipped = 0
    failed = 0

    # Process each content type
    for type_dir in ['pages', 'posts', 'akce']:
        type_path = content_dir / type_dir
        if not type_path.exists():
            continue

        post_type = 'page' if type_dir == 'pages' else ('post' if type_dir == 'posts' else 'akce')

        for item_dir in sorted(type_path.iterdir()):
            if not item_dir.is_dir():
                continue

            metadata_file = item_dir / 'metadata.json'
            converted_file = item_dir / 'converted.html'

            if not metadata_file.exists():
                continue

            with open(metadata_file) as f:
                metadata = json.load(f)

            status = metadata.get('status', 'pending')
            slug = item_dir.name

            # Skip if not converted
            if status == 'pending':
                continue
            if not converted_file.exists():
                continue

            # In duplicate mode, skip already published
            if not replace_mode and status == 'published':
                continue

            # In replace mode, skip already replaced
            if replace_mode and status == 'replaced':
                skipped += 1
                continue

            print(f"Publishing {post_type}: {slug}")

            if dry_run:
                action = "replace original" if replace_mode else "create duplicate"
                print(f"  [DRY RUN] Would {action}")
                success += 1
                continue

            try:
                publish_content(post_type, slug, batch_mode=True, replace_mode=replace_mode)
                success += 1
            except SystemExit:
                failed += 1
            except Exception as e:
                print(f"  Error: {e}")
                failed += 1

            print()

    print("=" * 50)
    print(f"Results: {success} published, {skipped} skipped, {failed} failed")

    if dry_run:
        print("\nThis was a DRY RUN. Run without --dry-run to publish.")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print()
        print("Examples:")
        print("  python publish.py page uvod              # Create uvod-gut duplicate")
        print("  python publish.py page uvod --replace    # Replace uvod with Gutenberg content")
        print("  python publish.py --batch                # Batch create all duplicates")
        print("  python publish.py --batch --replace      # Batch replace all originals")
        print("  python publish.py --batch --dry-run      # Preview batch operation")
        sys.exit(1)

    # Check for --replace flag
    replace_mode = '--replace' in sys.argv
    if replace_mode:
        sys.argv.remove('--replace')

    if sys.argv[1] == '--batch':
        dry_run = '--dry-run' in sys.argv
        publish_batch(dry_run, replace_mode)
    else:
        if len(sys.argv) < 3:
            print("Usage: python publish.py <post_type> <slug> [--replace]")
            sys.exit(1)
        post_type = sys.argv[1]
        slug = sys.argv[2]
        publish_content(post_type, slug, replace_mode=replace_mode)


if __name__ == '__main__':
    main()
