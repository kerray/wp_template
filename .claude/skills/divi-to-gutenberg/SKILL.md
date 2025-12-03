---
name: divi-to-gutenberg
description: Complete DIVI to Gutenberg/GenerateBlocks migration workflow. Use when migrating a WordPress site from DIVI Builder to standard Gutenberg blocks or GenerateBlocks. Handles inventory, export, conversion, review, and publishing.
---

# DIVI to Gutenberg Migration

Complete workflow for migrating WordPress sites from DIVI Builder to Gutenberg blocks (with optional GenerateBlocks support for advanced layouts).

## Quick Start

```bash
# 1. Generate inventory of all DIVI content
just divi-inventory

# 2. Export content for conversion
just divi-export page my-page-slug

# 3. Convert to Gutenberg
just divi-convert page my-page-slug

# 4. Review and publish
just divi-screenshot-before page my-page-slug
just divi-publish page my-page-slug
just divi-screenshot-after page my-page-slug
```

## Migration Philosophy

### Goals
1. **Preserve content and layout** - Structurally equivalent, not pixel-perfect
2. **Remove DIVI dependency** - Clean Gutenberg HTML, no DIVI shortcodes
3. **Standard Gutenberg first** - Only use GenerateBlocks when necessary
4. **Incremental migration** - Start simple, scale up, handle edge cases
5. **Full reversibility** - Original content preserved, easy rollback

### Non-Destructive Workflow
- Original DIVI content backed up to `content/{type}/{slug}/original.txt`
- Publishing creates NEW page with `-gut` suffix (e.g., `my-page-gut`)
- Original page untouched until manual swap
- Screenshots for visual comparison before/after

## Directory Structure

```
content/
├── inventory/                    # Migration tracking
│   ├── simple.md                 # Checklist: simple content
│   ├── moderate.md               # Checklist: moderate complexity
│   ├── complex.md                # Checklist: complex content
│   └── too-hard.md               # Flagged for manual handling
│
├── pages/                        # Page content by slug
│   └── {slug}/
│       ├── original.txt          # Raw DIVI content (backup)
│       ├── converted.html        # Gutenberg HTML (working file)
│       ├── metadata.json         # Structured metadata
│       ├── screenshot-before.png # Screenshot before conversion
│       └── screenshot-after.png  # Screenshot after conversion
│
├── posts/                        # Posts by slug (same structure)
└── akce/                         # Custom post types (same structure)
```

## Justfile Commands

### Phase 1: Inventory & Export
```bash
just divi-inventory              # Generate inventory with complexity scoring
just divi-export {type} {slug}   # Export single item
just divi-export-all {type}      # Export all of a post type
```

### Phase 2: Conversion
```bash
just divi-convert {type} {slug}           # Convert single item
just divi-convert-batch {complexity}      # Batch convert by complexity
just divi-convert-batch-dry {complexity}  # Preview batch conversion
```

### Phase 3: Review & Publish
```bash
just divi-screenshot-before {type} {slug} # Screenshot original
just divi-publish {type} {slug}           # Publish as new page with -gut suffix
just divi-screenshot-after {type} {slug}  # Screenshot converted
just divi-restore {type} {slug}           # Rollback if needed
```

### Utility Commands
```bash
just divi-status                 # Show migration progress
just divi-list {status}          # List content by status
just divi-help                   # Show all DIVI commands
```

## Complexity Scoring

### Shortcode Weights
| Shortcode | Weight | Reason |
|-----------|--------|--------|
| et_pb_text | 1 | Direct → paragraph/heading |
| et_pb_button | 1 | Direct → button block |
| et_pb_image | 1 | Direct → image block |
| et_pb_column | 2 | → Gutenberg column |
| et_pb_row | 2 | → Gutenberg columns |
| et_pb_blurb | 3 | → Group + image + text |
| et_pb_section | 3 | Container with backgrounds |
| et_pb_tabs | 5 | Requires tabs block/plugin |
| et_pb_tab | 2 | Tab content |
| et_pb_blog | 8 | Dynamic query block |

### Complexity Levels
- **Simple** (score 1-20): Basic shortcodes, straightforward conversion
- **Moderate** (score 21-50): Mix of shortcodes, some layout complexity
- **Complex** (score 51+): Advanced features, tabs, blogs, custom layouts

## Conversion Rules

### Basic Conversions

**Section → Group**
```
DIVI: [et_pb_section background_color="#ffffff"]
Gutenberg: <!-- wp:group {"backgroundColor":"background"} -->
```

**Row + Columns → Columns Block**
```
DIVI: [et_pb_row][et_pb_column type="1_2"]...[/et_pb_column][/et_pb_row]
Gutenberg: <!-- wp:columns --><!-- wp:column {"width":"50%"} -->...<!-- /wp:column --><!-- /wp:columns -->
```

**Text → Paragraph/Heading**
```
DIVI: [et_pb_text]<h2>Title</h2><p>Content</p>[/et_pb_text]
Gutenberg: <!-- wp:heading --><h2>Title</h2><!-- /wp:heading -->
           <!-- wp:paragraph --><p>Content</p><!-- /wp:paragraph -->
```

**Button → Button Block**
```
DIVI: [et_pb_button button_text="Click" button_url="/link"]
Gutenberg: <!-- wp:buttons --><!-- wp:button --><a href="/link">Click</a><!-- /wp:button --><!-- /wp:buttons -->
```

**Image → Image Block**
```
DIVI: [et_pb_image src="image.jpg" align="center"]
Gutenberg: <!-- wp:image {"align":"center"} --><figure><img src="image.jpg"/></figure><!-- /wp:image -->
```

### Column Width Mapping

| DIVI `type` | Gutenberg `width` |
|-------------|-------------------|
| `4_4` | `100%` |
| `1_2` | `50%` |
| `1_3` | `33.33%` |
| `2_3` | `66.66%` |
| `1_4` | `25%` |
| `3_4` | `75%` |

### GenerateBlocks (When Needed)

Use GenerateBlocks for:
- Complex responsive layouts (Grid block)
- Advanced spacing control (Container block)
- Tabs functionality (GenerateBlocks Pro)
- Better column control than core Gutenberg

```
GenerateBlocks Grid:
<!-- wp:generateblocks/grid {"columns":3,"gap":20} -->
  <!-- wp:generateblocks/container -->Content 1<!-- /wp:generateblocks/container -->
  <!-- wp:generateblocks/container -->Content 2<!-- /wp:generateblocks/container -->
  <!-- wp:generateblocks/container -->Content 3<!-- /wp:generateblocks/container -->
<!-- /wp:generateblocks/grid -->
```

## Special Handling

### Custom Shortcodes
Preserve theme-independent shortcodes exactly as-is:
```
[akce category="" pocet="5"]  → Keep unchanged
[contact-form-7 id="123"]     → Keep unchanged
[gallery ids="1,2,3"]         → Keep unchanged
```

### PDF Preview Images
Pattern: PDF link followed by numbered images
```
Before: <img src="1.jpg"/><img src="2.jpg"/>
After:  [pdfjs-viewer url="document.pdf"]
```
Flag for manual confirmation before replacing.

### Tabs
- Use GenerateBlocks Pro tabs if available
- Otherwise use Kadence Blocks tabs
- Or convert to accordion/expandable sections

## Metadata Structure

```json
{
  "id": 123,
  "post_type": "page",
  "title": "Page Title",
  "slug": "page-slug",
  "status": "pending",
  "complexity": "simple",
  "complexity_score": 12,
  "shortcodes_found": ["et_pb_section", "et_pb_row", "et_pb_text"],
  "original": {
    "exported_at": "2025-12-01T10:00:00Z"
  },
  "converted": {
    "converted_at": null,
    "notes": []
  },
  "published": {
    "published_at": null,
    "duplicate_slug": null
  }
}
```

### Status Flow
```
pending → converted → reviewed → published
    ↓         ↓
 too-hard   skipped
```

## Related Skills

This skill orchestrates:
- **divi-shortcode-analyzer** - Analyze DIVI content structure
- **gutenberg-block-converter** - Convert to standard Gutenberg
- **generateblocks-converter** - Convert to GenerateBlocks format

## Documentation References

- `docs/DIVI_MIGRATION_PLAN.md` - Detailed migration plan
- `docs/divi/` - DIVI shortcode documentation
- `docs/gutenberg/` - Gutenberg block reference
- `docs/generateblocks/` - GenerateBlocks conversion guide

## Best Practices

1. **Start with simple content** - Build confidence before complex pages
2. **Use batch operations carefully** - Preview with `--dry-run` first
3. **Compare screenshots** - Visual verification catches issues
4. **Keep originals** - Never modify original DIVI content until final swap
5. **Test custom shortcodes** - Ensure they work in Gutenberg context
6. **Document edge cases** - Notes in metadata help future conversions

## Troubleshooting

### Missing Images
Images may be missing in local dev environment:
```bash
curl -sL "https://production-site.com/wp-content/uploads/..." -o ./uploads/...
```

### Conversion Errors
Check `content/{type}/{slug}/notes.md` for conversion issues.

### Screenshot Requirements
Screenshots require Playwright MCP server to be connected.

### Database Issues
DIVI stores content in `post_content` with shortcode format.
Use WP-CLI for reliable export: `wp post get {id} --field=content`
