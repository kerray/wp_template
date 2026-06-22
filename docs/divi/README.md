# DIVI Shortcodes Documentation

Comprehensive documentation for all DIVI shortcodes used in the Example Site WordPress site.

## Overview

This documentation package provides complete reference material for converting DIVI shortcode-based content to Gutenberg blocks or other formats. The site uses **3,861 DIVI shortcode instances** across 60+ pages, organized in a nested hierarchical structure.

## DIVI Module Hierarchy

```
[et_pb_section] ← Page section/container (485 instances)
  └─ [et_pb_row] ← Horizontal row with columns (712 instances)
      └─ [et_pb_column] ← Vertical column container (1,203 instances)
          ├─ [et_pb_text] ← Text content (891 instances)
          ├─ [et_pb_image] ← Image display (67 instances)
          ├─ [et_pb_button] ← Call-to-action buttons (89 instances)
          ├─ [et_pb_blurb] ← Icon + text boxes (156 instances)
          ├─ [et_pb_tabs] ← Tabbed content sections (12 instances)
          │   └─ [et_pb_tab] ← Individual tab (24+ instances)
          └─ [et_pb_blog] ← Dynamic blog post lists (8 instances)
```

## Documentation Index

### Structural Elements
1. **[et_pb_section.md](et_pb_section.md)** - Page section/container
   - Purpose: Top-level layout container
   - Instances: 485
   - Complexity: **HIGH**
   - Key Features: Backgrounds, dividers, parallax, custom spacing

2. **[et_pb_row.md](et_pb_row.md)** - Horizontal row with columns
   - Purpose: Define column layout structure
   - Instances: 712
   - Complexity: **MEDIUM**
   - Key Features: Column structure, gutter width, equal heights

3. **[et_pb_column.md](et_pb_column.md)** - Vertical column container
   - Purpose: Content column within rows
   - Instances: 1,203
   - Complexity: **MEDIUM**
   - Key Features: Width fractions, backgrounds, padding

### Content Modules
4. **[et_pb_text.md](et_pb_text.md)** - Text content
   - Purpose: Display formatted text and HTML content
   - Instances: 891
   - Complexity: **LOW**
   - Key Features: Font styling, text shadow, alignment

5. **[et_pb_blurb.md](et_pb_blurb.md)** - Icon + text boxes
   - Purpose: Feature boxes with icon/image and text
   - Instances: 156
   - Complexity: **MEDIUM**
   - Key Features: Icons/images, titles, descriptions, links

6. **[et_pb_button.md](et_pb_button.md)** - Call-to-action buttons
   - Purpose: Styled clickable buttons
   - Instances: 89
   - Complexity: **LOW**
   - Key Features: Colors, sizing, hover states, links

7. **[et_pb_image.md](et_pb_image.md)** - Image display
   - Purpose: Responsive image display
   - Instances: 67
   - Complexity: **LOW**
   - Key Features: Links, lightbox, sizing, shadows

### Advanced Modules
8. **[et_pb_tabs.md](et_pb_tabs.md)** - Tabbed content sections
   - Purpose: Organize content into tabs
   - Instances: 12
   - Complexity: **MEDIUM**
   - Key Features: Tab navigation, multiple content sections

9. **[et_pb_tab.md](et_pb_tab.md)** - Individual tab
   - Purpose: Content within a tab container
   - Instances: 24+ (within tabs)
   - Complexity: **LOW**
   - Key Features: Tab title, content

10. **[et_pb_blog.md](et_pb_blog.md)** - Dynamic blog post lists
    - Purpose: Display posts automatically from database
    - Instances: 8
    - Complexity: **HIGH**
    - Key Features: Post queries, pagination, metadata display

## Module Statistics

| Module | Count | Complexity | Conversion Priority |
|--------|-------|-----------|---------------------|
| et_pb_section | 485 | HIGH | High |
| et_pb_row | 712 | MEDIUM | High |
| et_pb_column | 1,203 | MEDIUM | High |
| et_pb_text | 891 | LOW | High (volume) |
| et_pb_blurb | 156 | MEDIUM | Medium |
| et_pb_button | 89 | LOW | Medium |
| et_pb_image | 67 | LOW | Medium |
| et_pb_tabs | 12 | MEDIUM | Low |
| et_pb_tab | 24+ | LOW | Low |
| et_pb_blog | 8 | HIGH | Low |
| **TOTAL** | **3,861** | **—** | **—** |

## Complexity Summary

### Low Complexity Modules (Easiest Conversion)
- `et_pb_text` - Direct HTML mapping
- `et_pb_button` - Simple CSS styling
- `et_pb_image` - Native WordPress image handling
- `et_pb_tab` - Simple wrapper

**Conversion Approach:** Direct Gutenberg block mapping with CSS styling

**Estimated Effort:** 1-2 hours per page

### Medium Complexity Modules (Moderate Effort)
- `et_pb_row` - Column layout mapping
- `et_pb_column` - Width fraction conversion
- `et_pb_blurb` - Group + image + text combination
- `et_pb_tabs` - Tab block plugin or custom implementation

**Conversion Approach:** Requires Gutenberg columns block and possible custom blocks

**Estimated Effort:** 3-4 hours per page

### High Complexity Modules (Most Challenging)
- `et_pb_section` - Background, dividers, parallax effects
- `et_pb_blog` - Dynamic post queries, pagination

**Conversion Approach:** Custom Gutenberg blocks, CSS custom properties, possible plugins

**Estimated Effort:** 6-8 hours per custom module type

## Key Parameters by Category

### Background & Visual
Used extensively across sections, rows, and columns:
- `background_color` - Solid color backgrounds
- `background_image` - Image backgrounds (with size, position, repeat)
- `background_video` - Video backgrounds
- `parallax` - Parallax scrolling effect
- `top_divider_*` / `bottom_divider_*` - Section dividers (wave, zigzag, triangle)

### Spacing & Layout
Critical for responsive design:
- `custom_padding` - Internal spacing (top|right|bottom|left|mobile)
- `custom_margin` - External spacing
- `column_structure` - Row column layout (1_2,1_2 / 1_3,1_3,1_3 / etc.)
- `gutter_width` - Space between columns
- `make_equal` - Equal column heights

### Text & Font
Used primarily in text and blurb modules:
- `text_text_color` - Body text color
- `header_text_color` - Heading color
- `text_font_size` - Body font size
- `header_font_size` - Heading size
- `text_text_shadow_style` - Text shadow effects
- `text_text_align` - Text alignment

### Interactive Features
- `button_url` - Link destination
- `url_new_window` - Open in new tab
- `show_in_lightbox` - Image lightbox
- Link parameters on blurbs and images

## Responsive Design Patterns

### Parameter Suffixes for Responsive Variants
Most parameters support mobile variants using suffixes:
- `_tablet` - Tablet-specific value (768px and below)
- `_phone` - Phone-specific value (480px and below)
- `_last_edited` - Last edit timestamp (metadata)

**Example:**
```
button_text_size="18px"
button_text_size_tablet="16px"
button_text_size_phone="14px"
```

### Custom Padding Syntax
Padding values use pipe-separated format:
```
custom_padding="top|right|bottom|left|on_mobile|important_flag"
```

Examples:
- `"14px|0px|44px|0px|false|false"` - Different top/bottom, no sides
- `"20px|20px|20px|20px|on"` - Equal padding, maintained on mobile
- `"0|0px|0|0px|false|false"` - No padding

## Metadata & Special Attributes

### Global Attributes
- `_builder_version="4.16"` - DIVI version (present on all modules)
- `module_id` - CSS ID for custom styling
- `module_class` - CSS classes (space-separated)
- `admin_label` - Label in builder (non-frontend)

### A/B Testing
- `_et_pb_ab_*` - A/B test metadata (stored in postmeta, not shortcodes)
- `[et_pb_split_track id="X"]` - A/B test references (rare, not core content)

## Color Format Support

All color parameters accept multiple formats:
- Hex: `#ffffff`, `#fff`
- RGB: `rgb(255, 255, 255)`
- RGBA: `rgba(255, 255, 255, 0.5)`
- Named: `white`, `black`, `red`, etc.

## Icon Font System

- Default Icon Library: "divi" (Divi's native icons)
- Font Format: `||font-name||weight`
- Example: `||divi||400` (Divi font, regular weight)
- Icon placement: Top or left side of blurb content

## Custom Shortcodes Integration

The site uses custom shortcodes **within** DIVI modules:
- `[akce]` - Event listing (custom post type)
- `[rml_file_list]` - Real Media Library integration

These shortcodes work in DIVI's text modules and maintain functionality in Gutenberg.

## Conversion Strategy Overview

### Phase 1: Prepare (Completed)
- Analyze DIVI structure ✓
- Document all modules ✓
- Identify dependencies ✓
- Create conversion reference ✓

### Phase 2: Develop Custom Blocks
1. Create Gutenberg section block (backgrounds, dividers)
2. Create Gutenberg row/columns block (layout structure)
3. Create feature box block (replaces blurb)
4. Create tab block (or integrate plugin)
5. Handle blog posts (use core/query block)

### Phase 3: Conversion
1. Test custom blocks with sample content
2. Convert high-traffic pages first
3. Run QA and visual regression tests
4. Convert remaining pages in batches
5. Handle edge cases and custom styling

### Phase 4: Validation
1. Check all links and media
2. Validate responsive design
3. Test custom functionality
4. SEO verification (meta tags, structured data)
5. Performance testing

## Files & References

**Source Code Locations:**
- DIVI Module Definitions: `/src/wp-content/themes/Divi/includes/builder/module/`
- Child Theme Customizations: `/src/wp-content/themes/Divi-child-wplama/`
- Custom Modules: `/includes/builder/la-custom-modules.php`
- Theme Functions: `functions.php`

**Database References:**
- Post Content: `ge_posts.post_content` (contains shortcodes)
- Post Metadata: `ge_postmeta` (contains `_et_pb_*` settings)
- A/B Test Data: `_et_pb_ab_*` meta keys

**Analysis Documents:**
- `/DIVI_ANALYSIS.md` - Detailed technical analysis of site structure

## Notes for Developers

### Important Considerations
1. **Content Preservation** - Always preserve exact HTML content inside text modules
2. **Link Validation** - Check all URLs are correct during conversion
3. **Image Handling** - Ensure responsive image sizing works
4. **Custom CSS** - Don't lose custom CSS classes and IDs
5. **Performance** - Test performance with full content volume
6. **Accessibility** - Preserve alt text, semantic HTML, accessibility features

### Testing Checklist
- [ ] Visual regression testing (compare old vs. new)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form submissions and interactive elements
- [ ] Link integrity (internal and external)
- [ ] Media loading and display
- [ ] Search functionality
- [ ] Custom shortcodes functionality
- [ ] Performance metrics

### Common Pitfalls
1. Losing responsive breakpoint values (_tablet, _phone)
2. Not preserving custom CSS classes
3. Incorrect color format conversion
4. Forgetting link targets (url_new_window)
5. Image alt text not transferred
6. Complex nested layouts not converting properly
7. Icon fonts not resolving correctly

## Additional Resources

- [Divi Official Documentation](https://www.elegantthemes.com/documentation/)
- [Gutenberg Block Documentation](https://developer.wordpress.org/block-editor/)
- [WordPress Custom Blocks Guide](https://developer.wordpress.org/plugins/block-editor/)

---

**Last Updated:** November 20, 2025
**Documentation Version:** 1.0
**DIVI Version:** 4.16
**Total Instances Documented:** 3,861
