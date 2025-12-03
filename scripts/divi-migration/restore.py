#!/usr/bin/env python3
"""
DIVI Migration: Restore original DIVI content from backup
Usage: python restore.py <post_type> <slug>
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
    if result.returncode != 0:
        print(f"WP-CLI error: {result.stderr}", file=sys.stderr)
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


def restore_content(post_type, slug):
    """Restore original DIVI content from backup."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    content_dir = project_root / 'content' / get_type_dir(post_type) / slug

    print(f"Restoring {post_type}: {slug}")

    # Check if original content exists
    original_file = content_dir / 'original.txt'
    if not original_file.exists():
        print(f"Error: No original content found at {original_file}")
        print("Cannot restore - no backup available")
        sys.exit(1)

    metadata_file = content_dir / 'metadata.json'
    if not metadata_file.exists():
        print(f"Error: No metadata found at {metadata_file}")
        sys.exit(1)

    # Load metadata
    with open(metadata_file) as f:
        metadata = json.load(f)

    # Get post ID
    post_id = metadata.get('id')
    if not post_id:
        print("Error: Could not get post ID from metadata")
        sys.exit(1)

    print(f"  Post ID: {post_id}")

    # Read original content
    original_content = original_file.read_text()

    # Write content to a temp file inside the container
    temp_file = content_dir / '.temp_restore.html'
    temp_file.write_text(original_content)

    # Copy file to container
    container_temp = f'/tmp/restore_{slug}.html'
    copy_cmd = ['docker', 'cp', str(temp_file), f'site_waldorf-wordpress-1:{container_temp}']
    subprocess.run(copy_cmd, capture_output=True)

    # Update post using wp eval to read the file
    php_code = f'''
    $content = file_get_contents("{container_temp}");
    wp_update_post(array("ID" => {post_id}, "post_content" => $content));
    echo "Updated post {post_id}";
    '''
    output, returncode = wp_cli('eval', php_code)

    # Clean up temp files
    temp_file.unlink(missing_ok=True)
    subprocess.run(['docker-compose', 'exec', '-T', 'wordpress', 'rm', '-f', container_temp], capture_output=True)

    if returncode != 0:
        print(f"Error: Failed to restore content: {output}")
        sys.exit(1)

    print(f"  {output}")

    # Restore DIVI builder flag
    output, _ = wp_cli('post', 'meta', 'update', str(post_id), '_et_pb_use_builder', 'on')
    print("  DIVI builder flag restored")

    # Restore other DIVI meta from backup if available
    divi_meta = metadata.get('original', {}).get('divi_meta', [])
    for meta in divi_meta:
        key = meta.get('meta_key')
        value = meta.get('meta_value', '')
        if key and key != '_et_pb_use_builder':  # Already restored above
            wp_cli('post', 'meta', 'update', str(post_id), key, value)

    # Remove migration markers
    wp_cli('post', 'meta', 'delete', str(post_id), '_migrated_from_divi')
    wp_cli('post', 'meta', 'delete', str(post_id), '_divi_migration_date')

    # Update metadata status back to converted (not pending, since we still have the conversion)
    metadata['status'] = 'converted'
    metadata['published']['published_at'] = None

    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print("  Original DIVI content restored")
    print("  Status: converted (rollback complete)")


def main():
    if len(sys.argv) < 3:
        print("Usage: python restore.py <post_type> <slug>")
        print()
        print("Restores original DIVI content from backup.")
        print("Use this to rollback a conversion that didn't work as expected.")
        print()
        print("post_type: page, post, or akce")
        print("slug: the post slug")
        print()
        print("Prerequisites:")
        print("  - Content must have been exported (original.txt exists)")
        sys.exit(1)

    post_type = sys.argv[1]
    slug = sys.argv[2]

    restore_content(post_type, slug)


if __name__ == '__main__':
    main()
