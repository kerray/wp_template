# Gutenberg Blocks Documentation

## Overview

This documentation package provides a comprehensive guide to Gutenberg blocks that serve as equivalents to the DIVI shortcodes used in the Example Site WordPress site. The site currently uses **3,861 DIVI shortcode instances** across 60+ pages that need to be converted to Gutenberg blocks.

## Why This Matters

DIVI shortcodes are a proprietary system tied to the DIVI theme. By converting to Gutenberg blocks, we:

1. **Reduce Theme Dependency** - Move away from DIVI-specific features
2. **Improve Portability** - Content remains readable in any WordPress theme
3. **Enable Modern Workflows** - Use WordPress's standard block editor
4. **Future-Proof Content** - Gutenberg is WordPress's official direction
5. **Improve Performance** - Lighter weight than DIVI framework
6. **Enhance Accessibility** - Gutenberg blocks have built-in accessibility features

## Gutenberg Block Hierarchy

WordPress's native Gutenberg blocks follow a similar structure to DIVI:

```
[core/group] ← Page section/container (equivalent to et_pb_section)
  └─ [core/columns] ← Horizontal layout with columns (equivalent to et_pb_row)
      └─ [core/column] ← Vertical column container (equivalent to et_pb_column)
          ├─ [core/paragraph] ← Text content (equivalent to et_pb_text)
          ├─ [core/image] ← Image display (equivalent to et_pb_image)
          ├─ [core/buttons] ← Button group (equivalent to et_pb_button)
          ├─ [core/media-text] ← Image + text (partial equivalent to et_pb_blurb)
          ├─ [??] ← Tabbed content (NO native equivalent to et_pb_tabs)
          └─ [core/query] ← Dynamic post lists (equivalent to et_pb_blog)
```

## Available Gutenberg Block Documentation

### Structural Blocks

1. **[core/group](core_group.md)** - Page sections and containers
   - DIVI Equivalent: `et_pb_section`
   - Status: DIRECT MAPPING
   - Complexity: MEDIUM
   - Key Features: Full-width containers, background colors/images, padding/margins

2. **[core/columns](core_columns.md)** - Multi-column layouts
   - DIVI Equivalent: `et_pb_row`
   - Status: DIRECT MAPPING
   - Complexity: MEDIUM
   - Key Features: Flexible column layouts, gap control, alignment

3. **[core/column](core_column.md)** - Single column container
   - DIVI Equivalent: `et_pb_column`
   - Status: DIRECT MAPPING
   - Complexity: MEDIUM
   - Key Features: Width control, background, padding

### Content Blocks

4. **[core/paragraph](core_paragraph.md)** - Text content
   - DIVI Equivalent: `et_pb_text`
   - Status: DIRECT MAPPING
   - Complexity: LOW
   - Key Features: Font sizing, colors, alignment, rich text

5. **[core/heading](core_heading.md)** - Headings
   - DIVI Equivalent: Part of `et_pb_text`
   - Status: DIRECT MAPPING
   - Complexity: LOW
   - Key Features: Heading levels (h1-h6), sizes, colors, alignment

6. **[core/image](core_image.md)** - Image display
   - DIVI Equivalent: `et_pb_image`
   - Status: DIRECT MAPPING
   - Complexity: LOW
   - Key Features: Responsive images, links, lightbox, sizing

7. **[core/buttons + core/button](core_buttons.md)** - Call-to-action buttons
   - DIVI Equivalent: `et_pb_button`
   - Status: DIRECT MAPPING
   - Complexity: LOW
   - Key Features: Button styling, links, multiple buttons

8. **[core/media-text](core_media_text.md)** - Image + text combination
   - DIVI Equivalent: Partial equivalent to `et_pb_blurb`
   - Status: PARTIAL MAPPING
   - Complexity: MEDIUM
   - Key Features: Side-by-side images and text, alignment

### Advanced Blocks

9. **[core/query](core_query.md)** - Dynamic post listings
   - DIVI Equivalent: `et_pb_blog`
   - Status: PARTIAL MAPPING (different parameter structure)
   - Complexity: HIGH
   - Key Features: Post queries, filtering, pagination, templates

### Blocks with No Native Equivalent

10. **[??] - Tabs/Tabbed Content**
    - DIVI Equivalent: `et_pb_tabs` + `et_pb_tab`
    - Status: **NO NATIVE GUTENBERG BLOCK**
    - Complexity: HIGH
    - Solution: Use third-party plugin (e.g., Advanced Blocks, Kadence, CoBlocks)
    - See: [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md)

## Conversion Strategy

### Phase 1: Simple Content (1-2 weeks)
Focus on low-complexity, high-volume conversions:
- `et_pb_text` → `core/paragraph` + `core/heading` (891 instances)
- `et_pb_image` → `core/image` (67 instances)
- `et_pb_button` → `core/buttons` (89 instances)

**Effort:** Straightforward; minimal custom CSS needed

### Phase 2: Layout Structure (2-3 weeks)
Convert layout containers:
- `et_pb_section` → `core/group` (485 instances)
- `et_pb_row` → `core/columns` (712 instances)
- `et_pb_column` → `core/column` (1,203 instances)

**Effort:** Moderate; requires careful CSS custom property mapping

### Phase 3: Intermediate Features (1-2 weeks)
Convert more complex modules:
- `et_pb_blurb` → `core/media-text` or custom group (156 instances)
- `et_pb_blog` → `core/query` block (8 instances)

**Effort:** Higher; may require custom styling or plugins

### Phase 4: Advanced Features (1-2 weeks)
Handle edge cases and advanced features:
- `et_pb_tabs` → Third-party tabs plugin (12 instances)
- Custom styling and animations
- Performance optimization

**Effort:** Case-by-case; may need custom development

## Key Differences Between DIVI and Gutenberg

### What's Easier in Gutenberg

1. **Native WordPress Integration** - No theme-specific code
2. **Simpler Parameter Structure** - Fewer parameters, clearer mapping
3. **Better Performance** - Lighter markup, no framework overhead
4. **Accessibility** - Built-in ARIA attributes and semantic HTML
5. **Mobile-First Design** - Responsive by default
6. **REST API** - Standard WordPress API for all blocks

### What's Harder in Gutenberg

1. **Limited Background Effects** - No parallax, no video backgrounds (requires custom CSS/JS)
2. **No Icon Font Support** - Must use plugins or images for icons
3. **No Dividers** - Wave/zigzag dividers need CSS custom properties or SVG
4. **No Tabs Native** - Requires third-party plugin
5. **Limited Gradients** - Simpler gradient support than DIVI
6. **Spacing Control** - Less granular than DIVI's custom padding syntax

## CSS Custom Properties for DIVI Features

Many DIVI features not directly supported by Gutenberg can be replicated with CSS custom properties:

```css
/* Parallax effect simulation */
.wp-block-group {
  background-attachment: fixed;
  background-size: cover;
}

/* Wave divider using SVG background */
.wp-block-group::after {
  content: '';
  background-image: url('data:image/svg+xml,...');
  height: 40px;
}

/* Text shadow preset */
.has-text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Gutter width control */
.wp-block-columns {
  gap: var(--wp--style--block-gap, 2rem);
}
```

## Plugin Requirements

To fully replicate DIVI functionality, you'll need:

### Essential

1. **Tabs Plugin** - One of:
   - [Advanced Blocks](https://www.advancedblocks.com/)
   - [Kadence Blocks](https://www.kadenceblocks.com/)
   - [CoBlocks](https://www.coblocks.com/)

### Recommended

2. **Icon Plugin** - Display icons without fonts:
   - [Icon Picker](https://www.wpzoom.com/plugins/icon-picker/)
   - Part of most premium Gutenberg block plugins

3. **Advanced Styling** - Enhanced CSS controls:
   - [GenerateBlocks](https://www.generateblocks.com/)
   - [Stackable](https://www.wpstackable.com/)

## Migration Workflow

### For Each Page

1. **Analyze** - Identify all DIVI shortcodes
2. **Plan** - Map each shortcode to equivalent Gutenberg block
3. **Convert** - Replace shortcodes with blocks
4. **Test** - Visual comparison with old version
5. **Publish** - Deploy updated content

### Automation Tools

- **WordPress to Gutenberg Converters** - Check WordPress.org plugin directory
- **Manual Conversion** - For complex layouts, manual editing in Gutenberg editor
- **Batch Processing** - Use WP-CLI with custom scripts for bulk conversions

## Testing Checklist

After conversion, verify:

- [ ] Visual appearance matches original
- [ ] All links are functional
- [ ] Images load correctly
- [ ] Responsive design works on mobile/tablet
- [ ] Forms and interactive elements function
- [ ] Custom shortcodes still work (`[akce]`, `[rml_file_list]`)
- [ ] SEO metadata preserved
- [ ] Performance is acceptable
- [ ] Accessibility standards met

## Common Pitfalls to Avoid

1. **Losing Responsive Padding** - DIVI's `_tablet` and `_phone` suffixes need CSS media queries
2. **Forgetting Custom Classes** - Preserve `module_class` attributes in block classes
3. **Breaking Custom Shortcodes** - Test custom shortcodes like `[akce]` within blocks
4. **Image Sizing** - Ensure responsive images work without max-width constraints
5. **Icon Fonts** - Icons won't transfer automatically; plan replacement strategy
6. **Background Effects** - Parallax/video backgrounds need custom CSS
7. **Typography** - Font sizes and line heights may differ; test carefully
8. **Spacing** - DIVI's padding syntax differs; convert to CSS margin/padding
9. **Global Colors** - DIVI's global color system needs mapping to CSS variables
10. **Nested Layouts** - Complex nested structures may need reorganization

## File Organization

```
docs/gutenberg/
├── README.md (this file)
├── INDEX.md (quick reference)
├── CONVERSION_MATRIX.md (side-by-side mapping)
├── TABS_ALTERNATIVES.md (tabs block solutions)
├── core_group.md
├── core_columns.md
├── core_column.md
├── core_paragraph.md
├── core_heading.md
├── core_image.md
├── core_buttons.md
├── core_media_text.md
├── core_query.md
└── migration_examples/ (coming soon)
    ├── example_1_simple_page.md
    ├── example_2_complex_layout.md
    └── example_3_custom_styling.md
```

## Resources

### Official Documentation

- [WordPress Gutenberg Editor](https://wordpress.org/gutenberg/)
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

### Migration Tools

- [WordPress to Gutenberg](https://wordpress.org/plugins/wp-classic-editor-blocks/)
- [Block Converter](https://wordpress.org/plugins/block-converter/)

### Third-Party Block Libraries

- [Kadence Blocks](https://www.kadenceblocks.com/)
- [GenerateBlocks](https://www.generateblocks.com/)
- [CoBlocks](https://www.coblocks.com/)
- [Stackable](https://www.wpstackable.com/)

## Support & Next Steps

### Questions?

- Review the specific block documentation (e.g., `core_group.md`)
- Check `CONVERSION_MATRIX.md` for parameter mapping
- Consult `TABS_ALTERNATIVES.md` for tab solutions

### Ready to Start Converting?

1. Start with Phase 1 (text and images)
2. Test on a staging environment
3. Use the conversion matrix as a reference
4. Document any custom solutions

### Reporting Issues

During conversion, note:

- Which DIVI shortcode was problematic
- What block was used as replacement
- What doesn't match the original appearance
- Suggest alternative approach

---

**Last Updated:** November 20, 2025
**Documentation Version:** 1.0
**Target Audience:** WordPress developers, content managers, site administrators
**Status:** Comprehensive mapping of 8 core Gutenberg blocks + gap analysis
