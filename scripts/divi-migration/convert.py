#!/usr/bin/env python3
"""
DIVI Migration: Convert DIVI shortcodes to Gutenberg blocks
Usage: python convert.py <post_type> <slug>
   or: python convert.py --batch <complexity> [--dry-run]

Complexity levels: simple, moderate, complex
"""

import re
import json
import sys
from pathlib import Path
from datetime import datetime
from html.parser import HTMLParser


class HTMLContentParser(HTMLParser):
    """Parse HTML content from et_pb_text and convert to Gutenberg blocks."""

    def __init__(self):
        super().__init__()
        self.blocks = []
        self.current_text = ""
        self.current_tag = None
        self.current_attrs = {}
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self._flush_text()
            self.current_tag = tag
            self.current_attrs = attrs_dict
        elif tag == 'p':
            self._flush_text()
            self.current_tag = 'p'
            self.current_attrs = attrs_dict
        elif tag == 'br':
            self.current_text += "<br>"
        elif tag == 'img':
            # Flush any pending text and add image block
            self._flush_text()
            self._add_image_block(attrs_dict)
        elif tag in ['strong', 'b']:
            self.current_text += "<strong>"
            self.tag_stack.append('strong')
        elif tag in ['em', 'i']:
            self.current_text += "<em>"
            self.tag_stack.append('em')
        elif tag == 'u':
            self.current_text += "<u>"
            self.tag_stack.append('u')
        elif tag == 'a':
            href = attrs_dict.get('href', '')
            self.current_text += f'<a href="{href}">'
            self.tag_stack.append('a')
        elif tag == 'span':
            # Usually just styling, pass through
            self.tag_stack.append('span')
        elif tag == 'o:p':
            # Microsoft Office tag, ignore
            pass

    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self._add_heading_block(tag)
            self.current_tag = None
        elif tag == 'p':
            self._add_paragraph_block()
            self.current_tag = None
        elif tag in ['strong', 'b'] and 'strong' in self.tag_stack:
            self.current_text += "</strong>"
            self.tag_stack.remove('strong')
        elif tag in ['em', 'i'] and 'em' in self.tag_stack:
            self.current_text += "</em>"
            self.tag_stack.remove('em')
        elif tag == 'u' and 'u' in self.tag_stack:
            self.current_text += "</u>"
            self.tag_stack.remove('u')
        elif tag == 'a' and 'a' in self.tag_stack:
            self.current_text += "</a>"
            self.tag_stack.remove('a')
        elif tag == 'span' and 'span' in self.tag_stack:
            self.tag_stack.remove('span')

    def handle_data(self, data):
        self.current_text += data

    def _flush_text(self):
        text = self.current_text.strip()
        if text and text != '&nbsp;':
            # If we have loose text without a tag, wrap in paragraph
            if self.current_tag is None and text:
                self._add_paragraph_block_raw(text, {})
        self.current_text = ""

    def _get_alignment(self, attrs):
        """Extract alignment from style attribute."""
        style = attrs.get('style', '')
        if 'text-align: center' in style or 'text-align:center' in style:
            return 'center'
        elif 'text-align: right' in style or 'text-align:right' in style:
            return 'right'
        return None

    def _add_heading_block(self, tag):
        text = self.current_text.strip()
        if not text:
            self.current_text = ""
            return

        level = int(tag[1])
        align = self._get_alignment(self.current_attrs)

        attrs = {'level': level}
        classes = ['wp-block-heading']

        if align:
            attrs['textAlign'] = align
            classes.append(f'has-text-align-{align}')

        attrs_json = json.dumps(attrs)
        class_str = ' '.join(classes)

        block = f'<!-- wp:heading {attrs_json} -->\n'
        block += f'<{tag} class="{class_str}">{text}</{tag}>\n'
        block += f'<!-- /wp:heading -->'

        self.blocks.append(block)
        self.current_text = ""

    def _add_paragraph_block(self):
        text = self.current_text.strip()
        if not text or text == '&nbsp;':
            self.current_text = ""
            return

        self._add_paragraph_block_raw(text, self.current_attrs)
        self.current_text = ""

    def _add_paragraph_block_raw(self, text, attrs):
        align = self._get_alignment(attrs)

        block_attrs = {}
        classes = []

        if align:
            block_attrs['align'] = align
            classes.append(f'has-text-align-{align}')

        if block_attrs:
            attrs_json = ' ' + json.dumps(block_attrs)
        else:
            attrs_json = ''

        if classes:
            class_str = f' class="{" ".join(classes)}"'
        else:
            class_str = ''

        block = f'<!-- wp:paragraph{attrs_json} -->\n'
        block += f'<p{class_str}>{text}</p>\n'
        block += f'<!-- /wp:paragraph -->'

        self.blocks.append(block)

    def _add_image_block(self, attrs):
        """Convert img tag to Gutenberg image block."""
        src = attrs.get('src', '')
        alt = attrs.get('alt', '')
        width = attrs.get('width', '')
        height = attrs.get('height', '')

        if not src:
            return

        # Build block attributes
        block_attrs = {}
        if width:
            try:
                block_attrs['width'] = int(width)
            except ValueError:
                pass
        if height:
            try:
                block_attrs['height'] = int(height)
            except ValueError:
                pass

        # Determine size slug based on dimensions or URL patterns
        if '-150x150' in src:
            block_attrs['sizeSlug'] = 'thumbnail'
        elif '-300x' in src or 'x300' in src:
            block_attrs['sizeSlug'] = 'medium'
        elif '-1024x' in src or 'x1024' in src:
            block_attrs['sizeSlug'] = 'large'
        else:
            block_attrs['sizeSlug'] = 'full'

        # Build the block
        if block_attrs:
            attrs_json = ' ' + json.dumps(block_attrs)
        else:
            attrs_json = ''

        size_class = f"size-{block_attrs.get('sizeSlug', 'full')}"

        # Build img tag attributes
        img_attrs = f'src="{src}"'
        if alt:
            img_attrs += f' alt="{alt}"'
        if width:
            img_attrs += f' width="{width}"'
        if height:
            img_attrs += f' height="{height}"'

        block = f'<!-- wp:image{attrs_json} -->\n'
        block += f'<figure class="wp-block-image {size_class}"><img {img_attrs}/></figure>\n'
        block += f'<!-- /wp:image -->'

        self.blocks.append(block)

    def get_blocks(self):
        self._flush_text()
        return self.blocks


def extract_text_content(shortcode_content):
    """Extract the inner HTML from et_pb_text shortcode."""
    # The content is between [et_pb_text ...] and [/et_pb_text]
    # Remove the shortcode wrapper and get raw HTML
    return shortcode_content


def parse_divi_content(content):
    """Parse DIVI shortcode content and extract text blocks."""
    blocks = []
    notes = []

    # Remove the wp:divi/placeholder wrapper if present
    content = re.sub(r'<!-- wp:divi/placeholder -->\s*', '', content)
    content = re.sub(r'\s*<!-- /wp:divi/placeholder -->', '', content)

    # Find all et_pb_text blocks
    text_pattern = r'\[et_pb_text[^\]]*\](.*?)\[/et_pb_text\]'
    text_matches = re.findall(text_pattern, content, re.DOTALL)

    if not text_matches:
        # No text blocks found, might be empty or different structure
        notes.append("No et_pb_text blocks found in content")
        return blocks, notes

    for text_content in text_matches:
        text_content = text_content.strip()
        if not text_content:
            continue

        # Parse the HTML content
        parser = HTMLContentParser()
        try:
            parser.feed(text_content)
            parsed_blocks = parser.get_blocks()
            blocks.extend(parsed_blocks)
        except Exception as e:
            notes.append(f"Error parsing HTML: {e}")
            # Fallback: wrap entire content in paragraph
            blocks.append(f'<!-- wp:paragraph -->\n<p>{text_content}</p>\n<!-- /wp:paragraph -->')

    return blocks, notes


def convert_simple_content(content):
    """Convert simple DIVI content (section/row/column/text only) to Gutenberg."""
    blocks, notes = parse_divi_content(content)

    if not blocks:
        notes.append("No content blocks generated")
        return None, notes

    # Join blocks with blank lines
    gutenberg_html = '\n\n'.join(blocks)

    notes.insert(0, "Converted simple text-only DIVI content")
    notes.append(f"Generated {len(blocks)} Gutenberg blocks")

    return gutenberg_html, notes


def is_simple_content(shortcodes):
    """Check if content only has simple shortcodes."""
    simple_shortcodes = {'et_pb_section', 'et_pb_row', 'et_pb_column', 'et_pb_text'}
    return all(sc in simple_shortcodes for sc in shortcodes)


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


def convert_single(post_type, slug, dry_run=False):
    """Convert a single content item."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    content_dir = project_root / 'content' / get_type_dir(post_type) / slug

    print(f"Converting {post_type}: {slug}")

    # Check files exist
    original_file = content_dir / 'original.txt'
    metadata_file = content_dir / 'metadata.json'

    if not original_file.exists():
        print(f"  Error: No original.txt found. Run export first.")
        return False

    if not metadata_file.exists():
        print(f"  Error: No metadata.json found. Run export first.")
        return False

    # Load metadata
    with open(metadata_file) as f:
        metadata = json.load(f)

    # Check if already converted
    if metadata.get('status') in ['converted', 'published']:
        print(f"  Skipping: Already {metadata['status']}")
        return True

    # Check complexity
    shortcodes = metadata.get('shortcodes_found', [])
    if not is_simple_content(shortcodes):
        print(f"  Skipping: Not simple content (has: {shortcodes})")
        return False

    # Read original content
    original_content = original_file.read_text()

    # Check if it's actually DIVI content
    if '[et_pb_' not in original_content:
        print(f"  Skipping: No DIVI shortcodes in content")
        return False

    # Convert
    converted, notes = convert_simple_content(original_content)

    if not converted:
        print(f"  Error: Conversion failed - {notes}")
        return False

    print(f"  Notes: {notes}")

    if dry_run:
        print(f"  [DRY RUN] Would write converted.html")
        print(f"  Preview (first 500 chars):")
        print(f"  {converted[:500]}...")
        return True

    # Write converted content
    converted_file = content_dir / 'converted.html'
    converted_file.write_text(converted)
    print(f"  Saved: converted.html")

    # Update metadata
    now = datetime.now().isoformat()
    metadata['status'] = 'converted'
    metadata['converted']['converted_at'] = now
    metadata['converted']['converter_version'] = 'auto-simple-v1'
    metadata['converted']['notes'] = notes

    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"  Updated: metadata.json")

    return True


def convert_batch(complexity, dry_run=False):
    """Convert all content of a given complexity level."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    inventory_file = project_root / 'content' / 'inventory' / f'{complexity}.md'

    if not inventory_file.exists():
        print(f"Error: Inventory file not found: {inventory_file}")
        print("Run 'just divi-inventory' first")
        sys.exit(1)

    print(f"=== Batch Converting {complexity.upper()} Content ===")
    if dry_run:
        print("*** DRY RUN MODE - No files will be modified ***")
    print()

    # Parse inventory to get items
    inventory_content = inventory_file.read_text()

    # Parse markdown checkboxes: - [ ] **Title** (ID: 123, slug: `slug-name`, score: N)
    pattern = r'- \[ \] \*\*[^*]+\*\* \(ID: \d+, slug: `([^`]+)`, score: \d+\)'

    # Also need to identify the section (Pages, Posts, Akce)
    current_type = None
    items = []

    for line in inventory_content.split('\n'):
        if line.startswith('## Pages'):
            current_type = 'page'
        elif line.startswith('## Posts'):
            current_type = 'post'
        elif line.startswith('## Akce'):
            current_type = 'akce'
        elif current_type:
            match = re.search(pattern, line)
            if match:
                items.append((current_type, match.group(1)))

    print(f"Found {len(items)} items to process")
    print()

    success = 0
    skipped = 0
    failed = 0

    for post_type, slug in items:
        try:
            result = convert_single(post_type, slug, dry_run)
            if result:
                success += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  Error: {e}")
            failed += 1
        print()

    print("=" * 50)
    print(f"Results: {success} converted, {skipped} skipped, {failed} failed")

    if dry_run:
        print("\nThis was a DRY RUN. Run without --dry-run to apply changes.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python convert.py <post_type> <slug>")
        print("       python convert.py --batch <complexity> [--dry-run]")
        print()
        print("post_type: page, post, or akce")
        print("complexity: simple, moderate, or complex")
        print()
        print("Examples:")
        print("  python convert.py post my-post-slug")
        print("  python convert.py --batch simple --dry-run")
        print("  python convert.py --batch simple")
        sys.exit(1)

    if sys.argv[1] == '--batch':
        if len(sys.argv) < 3:
            print("Usage: python convert.py --batch <complexity> [--dry-run]")
            sys.exit(1)
        complexity = sys.argv[2]
        dry_run = '--dry-run' in sys.argv
        convert_batch(complexity, dry_run)
    else:
        if len(sys.argv) < 3:
            print("Usage: python convert.py <post_type> <slug>")
            sys.exit(1)
        convert_single(sys.argv[1], sys.argv[2])


if __name__ == '__main__':
    main()
