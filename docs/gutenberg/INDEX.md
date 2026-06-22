# Gutenberg Blocks Quick Reference Index

## Block Directory

### Core Structural Blocks

| Block | DIVI Equivalent | Status | Complexity | File |
|-------|-----------------|--------|------------|------|
| `core/group` | `et_pb_section` | Direct | MEDIUM | [core_group.md](core_group.md) |
| `core/columns` | `et_pb_row` | Direct | MEDIUM | [core_columns.md](core_columns.md) |
| `core/column` | `et_pb_column` | Direct | MEDIUM | [core_column.md](core_column.md) |

### Core Content Blocks

| Block | DIVI Equivalent | Status | Complexity | File |
|-------|-----------------|--------|------------|------|
| `core/paragraph` | `et_pb_text` | Direct | LOW | [core_paragraph.md](core_paragraph.md) |
| `core/heading` | Part of `et_pb_text` | Direct | LOW | [core_heading.md](core_heading.md) |
| `core/image` | `et_pb_image` | Direct | LOW | [core_image.md](core_image.md) |
| `core/buttons` + `core/button` | `et_pb_button` | Direct | LOW | [core_buttons.md](core_buttons.md) |
| `core/media-text` | Part of `et_pb_blurb` | Partial | MEDIUM | [core_media_text.md](core_media_text.md) |

### Core Advanced Blocks

| Block | DIVI Equivalent | Status | Complexity | File |
|-------|-----------------|--------|------------|------|
| `core/query` | `et_pb_blog` | Partial | HIGH | [core_query.md](core_query.md) |

### No Native Equivalent

| DIVI Module | Status | Notes | File |
|------------|--------|-------|------|
| `et_pb_tabs` | No native | Requires plugin | [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md) |
| `et_pb_blurb` (with icon) | Partial | Use media-text + custom styling | [core_media_text.md](core_media_text.md) |

---

## By Complexity Level

### Low Complexity (Easiest - Direct 1:1 Mapping)

Best starting point for conversion. Simple parameter mapping, straightforward implementation.

- **[core/paragraph.md](core_paragraph.md)** - Text blocks (891 DIVI instances)
- **[core/image.md](core_image.md)** - Images (67 DIVI instances)
- **[core/buttons.md](core_buttons.md)** - Buttons (89 DIVI instances)
- **[core/heading.md](core_heading.md)** - Headings (part of text modules)

**Total Volume:** 1,047+ instances - **HIGH PRIORITY** for conversion

---

### Medium Complexity (Moderate - Some Custom CSS Needed)

Layout and container blocks requiring CSS custom properties for advanced features.

- **[core/group.md](core_group.md)** - Sections/containers (485 DIVI instances)
- **[core/columns.md](core_columns.md)** - Row layouts (712 DIVI instances)
- **[core/column.md](core_column.md)** - Column containers (1,203 DIVI instances)
- **[core/media-text.md](core_media_text.md)** - Image + text (156 DIVI instances)

**Total Volume:** 2,556 instances - **CRITICAL FOR STRUCTURE**

---

### High Complexity (Challenging - Custom Development May Be Needed)

Advanced features requiring careful planning and possible custom solutions.

- **[core/query.md](core_query.md)** - Dynamic post lists (8 DIVI instances)
- **[TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md)** - Tabbed content (12 DIVI instances)

**Total Volume:** 20 instances - **SPECIALIZED USE CASES**

---

## By DIVI Module

Quick lookup: Find equivalent Gutenberg block by DIVI shortcode name

| DIVI Module | Gutenberg Block | Mapping Type | Complexity |
|-------------|-----------------|--------------|-----------|
| `et_pb_section` | `core/group` | Direct | MEDIUM |
| `et_pb_row` | `core/columns` | Direct | MEDIUM |
| `et_pb_row_inner` | `core/columns` (nested) | Direct | MEDIUM |
| `et_pb_column` | `core/column` | Direct | MEDIUM |
| `et_pb_text` | `core/paragraph` + `core/heading` | Direct | LOW |
| `et_pb_image` | `core/image` | Direct | LOW |
| `et_pb_button` | `core/buttons` + `core/button` | Direct | LOW |
| `et_pb_blurb` (text only) | `core/paragraph` | Direct | LOW |
| `et_pb_blurb` (with image) | `core/media-text` | Partial | MEDIUM |
| `et_pb_blurb` (with icon) | Custom block + image | Partial | HIGH |
| `et_pb_blog` | `core/query` | Partial | HIGH |
| `et_pb_tabs` | Third-party plugin | None (Gap) | HIGH |
| `et_pb_tab` | Third-party plugin child | None (Gap) | HIGH |

---

## By DIVI Feature

Map specific DIVI features to Gutenberg solutions

### Backgrounds & Visual Effects

| DIVI Feature | Gutenberg Support | Solution |
|-------------|------------------|----------|
| Solid background color | Yes | `core/group` background attribute |
| Background image | Yes | `core/group` background image |
| Background video | No | Custom CSS with `video` element |
| Parallax scrolling | No | CSS `background-attachment: fixed;` |
| Wave/zigzag dividers | No | SVG-based CSS or divider block plugin |
| Text shadows | Partial | CSS `text-shadow` property |
| Box shadows | Yes | CSS `box-shadow` property |

### Layout & Spacing

| DIVI Feature | Gutenberg Support | Solution |
|-------------|------------------|----------|
| Column widths (fractions) | Yes | `core/column` width attribute (%) |
| Gutter/gap control | Yes | `core/columns` gap attribute |
| Custom padding | Yes | CSS `padding` properties |
| Custom margins | Yes | CSS `margin` properties |
| Equal column heights | Yes | CSS flexbox `align-items: stretch;` |
| Responsive padding (_tablet, _phone) | Yes | CSS media queries |

### Typography

| DIVI Feature | Gutenberg Support | Solution |
|-------------|------------------|----------|
| Font sizes | Yes | `core/paragraph` fontSize attribute |
| Font families | Yes | CSS font stack |
| Font weights | Yes | CSS font-weight |
| Letter spacing | Yes | CSS letter-spacing |
| Line height | Yes | CSS line-height |
| Text alignment | Yes | Block alignment attribute |
| Text color | Yes | Block color attribute |

### Interactive Features

| DIVI Feature | Gutenberg Support | Solution |
|-------------|------------------|----------|
| Links | Yes | `core/button` + `href` attribute |
| Open in new window | Yes | `rel="noopener noreferrer"` attribute |
| Lightbox image gallery | Partial | WordPress native lightbox or plugin |
| Hover effects | No | Custom CSS animations |
| Icon fonts | No | Image replacement or plugin |

### Content Modules

| DIVI Feature | Gutenberg Support | Solution |
|-------------|------------------|----------|
| Rich text (HTML) | Yes | `core/paragraph` allows inner HTML |
| Lists | Yes | `core/list` block |
| Blockquotes | Yes | `core/quote` block |
| Tables | Yes | `core/table` block |
| Icon boxes | No | `core/media-text` + custom styling |
| Tabs | No | Third-party tabs plugin required |
| Blog query | Partial | `core/query` block with adjustments |

---

## Usage Workflow

### Step 1: Identify DIVI Shortcode
Look at your page content and find the DIVI shortcodes being used.

```
[et_pb_section] → Find in "By DIVI Module" table above
```

### Step 2: Find Gutenberg Equivalent
Look up the DIVI module name in the table to find the Gutenberg block.

```
et_pb_section → core/group
```

### Step 3: Check Mapping Complexity
Review the complexity level to understand effort required.

```
core/group → MEDIUM Complexity
```

### Step 4: Read Block Documentation
Click the documentation file link to learn specific parameters and attributes.

```
[core_group.md](core_group.md)
```

### Step 5: Implement Conversion
Use the parameter mapping table and examples to convert the shortcode to block.

### Step 6: Test & Validate
Compare visual appearance and test all functionality.

---

## Parameter Mapping Quick Reference

### Color Parameters

**DIVI Format:**
```
background_color="#ffffff"
text_text_color="#333333"
button_bg_color="#2c3e50"
```

**Gutenberg Format:**
```html
<!-- wp:group {"backgroundColor":"white"} -->
<div class="wp-block-group has-white-background-color">...</div>
<!-- /wp:group -->
```

**CSS Fallback:**
```css
.wp-block-group {
  background-color: #ffffff;
  color: #333333;
}
```

### Spacing Parameters

**DIVI Format:**
```
custom_padding="20px|20px|20px|20px|false|false"
custom_margin="||20px||"
```

**Gutenberg Format:**
```html
<!-- wp:group {"spacing":{"padding":{"top":"20px","right":"20px","bottom":"20px","left":"20px"}}} -->
<div class="wp-block-group" style="...">...</div>
<!-- /wp:group -->
```

**CSS Fallback:**
```css
.wp-block-group {
  padding: 20px;
  margin: 0 20px 20px 0;
}
```

### Width/Column Parameters

**DIVI Format:**
```
column_structure="1_3,1_3,1_3"
type="1_2"
```

**Gutenberg Format:**
```html
<!-- wp:columns -->
  <!-- wp:column {"width":"33.33%"} -->
    ...
  <!-- /wp:column -->
  <!-- wp:column {"width":"33.33%"} -->
    ...
  <!-- /wp:column -->
  <!-- wp:column {"width":"33.33%"} -->
    ...
  <!-- /wp:column -->
<!-- /wp:columns -->
```

---

## Conversion Priority Matrix

Prioritize conversions based on volume and complexity:

| Priority | Count | Modules | Complexity | Time |
|----------|-------|---------|-----------|------|
| **🔴 CRITICAL** | 1,203 | Column (core layout) | MEDIUM | 3 weeks |
| **🔴 CRITICAL** | 891 | Text (content volume) | LOW | 1 week |
| **🟠 HIGH** | 712 | Rows (layout structure) | MEDIUM | 2 weeks |
| **🟠 HIGH** | 485 | Sections (top containers) | MEDIUM | 2 weeks |
| **🟡 MEDIUM** | 156 | Blurbs (feature boxes) | MEDIUM | 1.5 weeks |
| **🟡 MEDIUM** | 89 | Buttons (CTAs) | LOW | 3 days |
| **🟡 MEDIUM** | 67 | Images (content) | LOW | 2 days |
| **🟢 LOW** | 12 | Tabs (edge cases) | HIGH | 1 week |
| **🟢 LOW** | 8 | Blog (advanced) | HIGH | 1 week |

**Total Estimated Effort:** 11-13 weeks for complete conversion

---

## Common Questions

### Q: Can I convert DIVI to Gutenberg automatically?
**A:** Partially. Some automated tools exist, but manual review is recommended for quality. See README.md for converter options.

### Q: Will my site break during conversion?
**A:** Not if done properly. Keep DIVI theme active until all content is converted. Test on staging environment first.

### Q: What about SEO and performance?
**A:** Both should improve. Gutenberg generates cleaner markup and loads faster. Follow best practices during conversion.

### Q: How do I handle tabs?
**A:** See [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md) for plugin recommendations and implementation guide.

### Q: Will custom shortcodes still work?
**A:** Yes! Custom shortcodes like `[akce]` work inside Gutenberg blocks. Test to confirm.

### Q: What if I can't get it perfect?
**A:** That's okay. Close visual match is sufficient. Use CSS for minor adjustments. Document any differences.

---

## Related Documents

- **[README.md](README.md)** - Full overview and strategy
- **[CONVERSION_MATRIX.md](CONVERSION_MATRIX.md)** - Detailed parameter mapping
- **[TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md)** - Solutions for tabs
- **[core_group.md](core_group.md)** - Sections/containers
- **[core_columns.md](core_columns.md)** - Row layouts
- **[core_column.md](core_column.md)** - Column containers
- **[core_paragraph.md](core_paragraph.md)** - Text content
- **[core_heading.md](core_heading.md)** - Headings
- **[core_image.md](core_image.md)** - Image display
- **[core_buttons.md](core_buttons.md)** - Buttons
- **[core_media_text.md](core_media_text.md)** - Image + text
- **[core_query.md](core_query.md)** - Dynamic posts

---

**Last Updated:** November 20, 2025
**Status:** Complete reference for all mapped blocks
