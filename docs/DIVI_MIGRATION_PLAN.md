# DIVI to Gutenberg Migration Plan

## Overview

This plan provides a structured approach to migrate DIVI-based WordPress content to standard Gutenberg blocks.

**To get started:**
1. Run `just divi-inventory` to scan your site and identify DIVI content
2. Review the generated inventory to understand the scope
3. Follow the phased approach below

## Goals

1. **Preserve content and layout** - Not pixel-perfect, but structurally equivalent
2. **Remove DIVI dependency** - Clean Gutenberg HTML, no DIVI shortcodes
3. **Standard Gutenberg first** - Only use GenerateBlocks if absolutely necessary
4. **Incremental migration** - Start simple, scale up, handle edge cases
5. **Full reversibility** - Original content preserved, easy rollback

---

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
│       ├── metadata.json         # Structured metadata (old + new)
│       ├── screenshot-before.png # Screenshot before conversion
│       ├── screenshot-after.png  # Screenshot after conversion
│       └── notes.md              # Conversion notes (optional)
│
├── posts/                        # Posts by slug (same structure)
│   └── {slug}/...
│
├── custom-post-type/                         # Custom Post Type by slug (same structure)
│   └── {slug}/...
│
└── removed-image-list.md         # Images replaced by pdfjs-viewer
```

---

## Metadata Structure

### metadata.json

```json
{
  "id": 123,
  "post_type": "page",
  "title": "O škole",
  "slug": "o-skole",
  "url": "/o-skole/",
  "status": "pending",
  "complexity": "simple",
  "complexity_score": 12,
  "shortcodes_found": ["et_pb_section", "et_pb_row", "et_pb_column", "et_pb_text"],
  "original": {
    "exported_at": "2025-12-01T10:00:00Z",
    "meta": {
      "_et_pb_use_builder": "on",
      "_et_pb_page_layout": "et_full_width_page"
    }
  },
  "screenshots": {
    "before": { "url": "http://...", "taken_at": "2025-12-01T10:00:00Z" },
    "after": { "url": "http://...", "taken_at": "2025-12-01T12:00:00Z" }
  },
  "converted": {
    "converted_at": null,
    "converter_version": null,
    "notes": [],
    "removed_images": []
  },
  "published": {
    "published_at": null,
    "duplicate_id": null,
    "duplicate_slug": null
  }
}
```

**Note on Published Status**: When a conversion is published:
- `duplicate_id`: WordPress post ID of the new `-gut` page
- `duplicate_slug`: Slug of the duplicate (e.g., `o-skole-gut`)
- Original page remains untouched at original slug

### Status Flow

```
pending → converted → reviewed → published
    ↓         ↓
 too-hard   skipped
```

---

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
| et_pb_tabs | 5 | Requires tabs block |
| et_pb_tab | 2 | Tab content |
| et_pb_blog | 8 | Dynamic query block |

### Complexity Levels

- **Simple** (score 1-20): Only basic shortcodes, straightforward conversion
- **Moderate** (score 21-50): Mix of shortcodes, some layout complexity
- **Complex** (score 51+): Advanced features, tabs, blogs, custom layouts

---

## Scripts (Justfile Commands)

### Phase 1: Inventory & Export

```bash
# Generate inventory of all DIVI content
just divi-inventory

# Export single item to content folder
just divi-export {post_type} {slug}

# Export all content of a type
just divi-export-all pages
just divi-export-all posts
just divi-export-all custom-post-type
```

### Phase 2: Conversion

```bash
# Convert single item (creates .html from .txt)
just divi-convert {post_type} {slug}

# Batch convert by complexity
just divi-convert-batch simple
just divi-convert-batch moderate

# Mark as too-hard with note
just divi-mark-hard {post_type} {slug} "Reason for marking"
```

### Phase 3: Review & Publish

**IMPORTANT**: Publishing creates a **NEW page/post** with `-gut` suffix (e.g., `uvod-gut`), leaving the original DIVI content untouched. This allows side-by-side comparison before finalizing the migration.

```bash
# Take before screenshot
just divi-screenshot-before {post_type} {slug}

# Publish converted content as NEW page with -gut suffix
just divi-publish {post_type} {slug}
# Creates: {slug}-gut (e.g., uvod-gut, o-skole-gut)
# Original {slug} page remains unchanged

# Take after screenshot for comparison
just divi-screenshot-after {post_type} {slug}

# Compare URLs:
#   Original: http://localhost:8080/{slug}/
#   Gutenberg: http://localhost:8080/{slug}-gut/

# Compare screenshots side by side
just divi-compare {post_type} {slug}

# If satisfied, swap the pages (TBD - manual step for now)
# If not satisfied, delete the -gut version

# Rollback to original (only needed if original was modified)
just divi-rollback {post_type} {slug}
```

### Screenshot Commands

```bash
# Take screenshot before conversion (while DIVI is active)
just divi-screenshot-before {post_type} {slug}

# Take screenshot after conversion (after publishing Gutenberg)
just divi-screenshot-after {post_type} {slug}
```

**Note**: Screenshots require BrowserMCP Chrome extension to be connected.

### Utility Commands

```bash
# Show migration status summary
just divi-status

# List content by status
just divi-list pending
just divi-list converted
just divi-list too-hard

# Validate converted HTML
just divi-validate {post_type} {slug}
```

---

## Subagent Architecture

### 1. Analyzer Subagent

**Purpose**: Analyze DIVI content, score complexity, extract metadata

**Input**: Raw DIVI shortcode content

**Output**:
- Complexity score
- List of shortcodes found
- Identified patterns (PDF previews, custom shortcodes)
- Conversion recommendations

### 2. Converter Subagent

**Purpose**: Transform DIVI shortcodes to Gutenberg HTML

**Input**:
- Raw DIVI content
- Conversion rules (from docs/divi/ and docs/generateblocks/)
- Special handling rules (PDF viewer replacement)

**Output**:
- Gutenberg HTML
- List of removed images (for PDF replacements)
- Conversion notes
- Confidence score

### 3. Validator Subagent

**Purpose**: Verify converted content is valid

**Input**: Converted Gutenberg HTML

**Output**:
- Valid/Invalid status
- List of issues found
- Suggestions for fixes

---

## Special Handling Rules

### PDF Preview Images

**Detection**: (TBD - need to identify pattern)

**Transformation**:
```
BEFORE: <img src="/wp-content/.../document-preview.jpg">
        <a href="/wp-content/.../document.pdf">Download</a>

AFTER:  [pdfjs-viewer url="/wp-content/.../document.pdf"]
```

**Tracking**: Add removed image slug to `content/removed-image-list.md`

### Custom Shortcodes

Preserve these unchanged:
- `[custom-post-type]` - Event listing shortcode
- `[rml_file_list]` - File listing shortcode
- Other custom shortcodes found during analysis

---

## Known Issues & Agent Requirements

### Missing Images from Production

**Problem**: Local development environment may be missing images that exist on production `example.com`. Featured images and content images may show as broken.

**Detection**: Check for 404 errors on image URLs or broken image indicators in screenshots.

**Resolution**:
1. Download missing image from production: `curl -sL "https://example.com/wp-content/uploads/..." -o ./uploads/...`
2. If thumbnails needed, use ImageMagick: `convert image.jpg -resize 1080x675^ -gravity center -extent 1080x675 image-1080x675.jpg`
3. Or sync the entire uploads folder from production backup

### Browser Automation Requirements

**Tool**: BrowserMCP (Chrome extension) is required for screenshots.

**Setup**:
1. Install BrowserMCP Chrome extension
2. Connect the extension before taking screenshots
3. Screenshots are saved to content/{type}/{slug}/screenshot-{before|after}.png

**Agent Instructions**:
- Use `mcp__browsermcp__browser_navigate` to load page
- Use `mcp__browsermcp__browser_screenshot` to capture
- Save output image to content folder manually (BrowserMCP returns image data)
- Update metadata.json with screenshot timestamp

### Stdin Issues in Bash Scripts

**Problem**: Docker-compose exec consumes stdin in while loops, causing only first item to process.

**Solution**: Add `</dev/null` redirect to wp_cli functions in bash scripts, or use Python scripts instead.

---

## Testing Strategy

### Phase 0: Metadata Testing (NEW CONTENT ONLY)

1. Create a new test page in WordPress
2. Add DIVI content via builder
3. Export and examine metadata structure
4. Convert to Gutenberg manually
5. Re-import and examine new metadata
6. Document differences
7. Delete test page

### Phase 1: Pipeline Testing

1. Select 3-5 **simple** content items
2. Run full pipeline manually (export → convert → review → publish)
3. Verify screenshots match expectations
4. Test rollback works
5. Fix any issues found

### Phase 2: Batch Testing

1. Run batch conversion on all **simple** items
2. Manual review of converted HTML (spot check)
3. Publish in small batches (10 at a time)
4. Visual review of live pages

### Phase 3: Full Migration

1. Work through **moderate** complexity items
2. Handle **complex** items with extra care
3. Review **too-hard** items manually
4. Final cleanup and verification

---

## Implementation Order

### Week 1: Foundation

- [ ] Create directory structure
- [ ] Implement inventory script
- [ ] Implement export script
- [ ] Test on new content (metadata exploration)
- [ ] Document DIVI vs Gutenberg metadata differences

### Week 2: Conversion Pipeline

- [ ] Implement converter subagent prompt
- [ ] Implement convert script
- [ ] Implement validator
- [ ] Test on 5 simple items
- [ ] Implement screenshot comparison

### Week 3: Publish Pipeline

- [ ] Implement publish script
- [ ] Implement rollback script
- [ ] Test full pipeline end-to-end
- [ ] Fix issues, iterate

### Week 4+: Migration

- [ ] Batch convert simple items
- [ ] Review and publish simple items
- [ ] Work through moderate items
- [ ] Handle complex items
- [ ] Clean up too-hard items manually

---

## Resolved Questions

### 1. PDF Preview Detection

**Pattern identified** from actual site content:
- PDF link followed by multiple sequential images
- Images often numbered (`1.jpg`, `2.jpg`) or named (`obrazek1.jpg`, `obrazek2.jpg`)
- Images have page-like dimensions (~756x800+)

**Example**:
```html
<a href=".../document.pdf">Document Title</a>
<img src=".../1.jpg" width="756" height="866"/>
<img src=".../2.jpg" width="756" height="743"/>
...
```

**Strategy**: Semi-automated detection with manual confirmation
- Converter flags suspected PDF previews
- Human reviewer confirms before replacement with `[pdfjs-viewer url="..."]`

### 2. Custom Post Type Meta Fields to Preserve

```
zv_datum        - Human-readable date ("1. 9. 2026", "29. - 30. 6. 2026")
zv_misto        - Location/place
zv_pryc         - Unix timestamp (event end?)
zv_datum_sort   - Unix timestamp for sorting
zv_datum_from   - Unix timestamp (event start)
_cdp_*          - Content duplication plugin fields
```

### 3. Test Content

Create test content to verify the migration pipeline:
- Create a test page with DIVI content
- Create a test post with DIVI content
- Create test custom post type entries if applicable

### 4. Screenshot Tool

Use Playwright via MCP server (browser automation already available)

---

## Notes

- All original content preserved in `.txt` files
- Conversion is non-destructive until publish step
- Can always rollback from original
- Screenshots provide visual verification
- Incremental approach minimizes risk

---

*Created: 2025-12-01*
*Status: Draft - awaiting feedback*
