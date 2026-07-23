---
name: divi-shortcode-analyzer
description: Analyzes DIVI shortcodes and identifies patterns for conversion. Use when you need to understand DIVI shortcode structure, extract attributes, or prepare conversion planning for DIVI to Gutenberg migration.
---

# DIVI Shortcode Analyzer

> **Upstream helper.** Use this to inventory a page's module mix / complexity
> *before* converting. The conversion itself (DIVI → normalized core Gutenberg)
> is owned by the **`divi-to-gutenberg`** skill.

## Instructions

When analyzing DIVI shortcodes for Gutenberg conversion, follow this workflow:

### 1. Shortcode Pattern Recognition
Extract and categorize DIVI shortcodes:
- **Module types**: Identify all DIVI modules used (buttons, columns, text, images, etc.)
- **Attributes**: List all custom attributes and their values
- **Nesting**: Document parent-child relationships
- **Styling**: Note inline styles, classes, and CSS attributes

### 2. Analysis Output Format
For each shortcode discovered, provide:
```
**Shortcode**: [divi_module_name]
**Type**: Module/Layout/Component
**Key Attributes**:
- attribute_name: current_value
**Styling**: List of CSS classes and inline styles
**Dependencies**: Any required plugins or custom JavaScript
**Conversion Complexity**: Low/Medium/High
```

### 3. Conversion Preparation
- Identify unique DIVI features with no direct Gutenberg equivalent
- Note custom CSS that needs migration
- Flag JavaScript dependencies that require separate handling
- Document responsive behavior and breakpoints

### 4. Output File
Store analysis in a structured format:
- Create `divi-analysis.json` with complete attribute mappings
- Create `conversion-report.md` with patterns and recommendations

### 5. Reference Documentation

Always reference the comprehensive DIVI documentation in `./docs/divi/`:
- Read `INDEX.md` for navigation
- Check individual shortcode files like `et_pb_section.md`, `et_pb_row.md`, etc.
- Review `README.md` for conversion strategy overview
- Use `SUMMARY.md` for key findings

## Common DIVI Modules

- `[et_pb_section]` - Layout container (485 instances in this site)
- `[et_pb_row]` - Row layout (712 instances)
- `[et_pb_column]` - Column layout (1,203 instances)
- `[et_pb_text]` - Text/rich content (891 instances - highest volume)
- `[et_pb_button]` - Button element (89 instances)
- `[et_pb_image]` - Image element (67 instances)
- `[et_pb_blurb]` - Icon + text box (156 instances)
- `[et_pb_tabs]` - Tabbed content (12 instances)
- `[et_pb_tab]` - Individual tab
- `[et_pb_blog]` - Dynamic post list (8 instances)

## DIVI Attribute Patterns

### Responsive Attributes
DIVI uses suffix patterns for responsive values:
- `attribute_tablet` - Tablet breakpoint value
- `attribute_phone` - Mobile/phone breakpoint value
- `attribute_last_edited` - Tracks which breakpoint was last modified

### Spacing Attributes
DIVI uses pipe-separated values for spacing:
```
custom_padding="14px|0px|44px|0px|false|false"
Format: top|right|bottom|left|tablet|phone
```

### Color Attributes
DIVI supports multiple color formats:
- Hex: `#ffffff`
- RGB: `rgb(255,255,255)`
- RGBA: `rgba(255,255,255,0.5)`

### Builder Metadata
Common DIVI metadata attributes:
- `_builder_version="4.16"` - DIVI builder version
- `fb_built="1"` - Visual builder flag
- `global_colors_info="{}"` - Color scheme reference

## Notes

- DIVI uses `[shortcode attr="value"]` syntax with self-closing or nested structure
- Custom DIVI styles use `module_class` and inline `style` attributes
- Responsive values often use pipes: `value|tablet_value|phone_value`
- All structural shortcodes must be properly nested: section > row > column > content
- Custom shortcodes like `[akce]` (event system) are theme-independent and work in Gutenberg

## Site-Specific Notes

After running `just divi-inventory`, document site-specific patterns here:
- Total DIVI shortcode instances found
- Custom shortcodes used (events, forms, etc.)
- Complex pages requiring special attention
- Any metadata that can be safely ignored
