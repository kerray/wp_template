# GenerateBlocks Documentation - Quick Reference

Quick navigation and reference guide for GenerateBlocks Pro and GeneratePress Premium documentation.

## Start Here

1. **[README.md](README.md)** - Complete overview and getting started
2. **[WHY_GENERATEBLOCKS.md](WHY_GENERATEBLOCKS.md)** - Feature comparison and justification
3. **[CONVERSION_MATRIX.md](CONVERSION_MATRIX.md)** - DIVI → GenerateBlocks mapping
4. **[GENERATEPRESS_ELEMENTS.md](GENERATEPRESS_ELEMENTS.md)** - Advanced customizations

## Block Documentation

### Structural Blocks

**Containers and Layouts**

- **Container Block** - Main section/container (`wp:generateblocks/container`)
  - DIVI equivalent: `et_pb_section`, `et_pb_row`, `et_pb_column`
  - Complexity: DIRECT
  - See: [README.md - Container Info](README.md#structural-blocks)

- **Grid Block** - Flexible column layout (`wp:generateblocks/grid`)
  - DIVI equivalent: `et_pb_row` + column structure
  - Complexity: DIRECT
  - See: [README.md - Grid Info](README.md#structural-blocks)

### Content Blocks

**Text, Images, Buttons**

- **Headline Block** - Typography-focused headings (`wp:generateblocks/headline`)
  - DIVI equivalent: Headings in `et_pb_text`
  - Complexity: DIRECT
  - See: [README.md](README.md)

- **Button Block** - Call-to-action buttons (`wp:generateblocks/button`)
  - DIVI equivalent: `et_pb_button`
  - Complexity: DIRECT
  - See: [README.md](README.md)

- **Image Block** - Responsive images (`wp:generateblocks/image`)
  - DIVI equivalent: `et_pb_image`
  - Complexity: DIRECT
  - See: [README.md](README.md)

- **Text Blocks** - Standard Gutenberg blocks
  - `wp:core/paragraph` - Text content
  - `wp:core/heading` - Headings h1-h6

### Advanced Blocks (Pro Only)

**Complex Functionality**

- **Tabs Block** - Tabbed content sections (`wp:generateblocks-pro/tabs`)
  - DIVI equivalent: `et_pb_tabs` + `et_pb_tab`
  - Complexity: DIRECT
  - Instance count on site: 12
  - See: **[tabs-block.md](tabs-block.md)** ← START HERE FOR TABS

- **Accordion Block** - Collapsible sections (`wp:generateblocks-pro/accordion`)
  - DIVI equivalent: Custom CSS/JS
  - Complexity: BETTER THAN DIVI
  - See: [README.md](README.md)

- **Navigation Block** - Advanced menus (`wp:generateblocks-pro/navigation`)
  - DIVI equivalent: DIVI menu module
  - Complexity: BETTER THAN DIVI
  - See: [README.md](README.md)

- **Query Block** - Dynamic content (`wp:core/query` or `wp:generateblocks-pro/query`)
  - DIVI equivalent: `et_pb_blog`
  - Complexity: PARTIAL
  - Instance count on site: 8
  - See: [CONVERSION_MATRIX.md](CONVERSION_MATRIX.md#blog-posts-divi--query-block)

## Quick Conversion Guide

### By DIVI Module

| DIVI Module | GenerateBlocks Block | Time | Difficulty |
|---|---|---|---|
| `et_pb_section` | `container` | 5 min | EASY |
| `et_pb_row` | `grid` | 5 min | EASY |
| `et_pb_column` | grid child | 2 min | EASY |
| `et_pb_text` | `paragraph` + `heading` | 3 min | EASY |
| `et_pb_image` | `image` | 2 min | EASY |
| `et_pb_button` | `button` | 2 min | EASY |
| `et_pb_blurb` | `container` + children | 5 min | MEDIUM |
| `et_pb_tabs` | **TABS BLOCK** | 10 min | MEDIUM |
| `et_pb_blog` | `query` | 20 min | HARD |

**Total per complex page:** 4-8 hours
**Total for 60 pages:** 240-480 hours (~6-12 weeks)

### By Complexity Level

**EASY - Do First** (27% of instances)
- Text modules (891)
- Buttons (89)
- Images (67)
- Total: 1,047 instances

**MEDIUM - Do Second** (54% of instances)
- Rows/columns (1,915)
- Blurbs (156)
- Tabs (12)
- Total: 2,083 instances

**HARD - Do Last** (13% of instances)
- Sections (485)
- Blog posts (8)
- Total: 493 instances

## DIVI → GenerateBlocks Mapping

### Quick Reference Table

| Parameter Type | DIVI | GenerateBlocks | Notes |
|---|---|---|---|
| **Colors** | `background_color="#fff"` | `styles.color.background:"#fff"` | Direct conversion |
| **Padding** | `custom_padding="20\|0\|20\|0"` | `styles.spacing.padding.all:"20px"` | Convert pipe-separated to object |
| **Margins** | `custom_margin="0\|auto"` | `styles.spacing.margin.right:"auto"` | Convert pipe-separated to object |
| **IDs** | `module_id="section-1"` | `htmlAttributes.id:"section-1"` | HTML attribute |
| **Classes** | `module_class="custom"` | `htmlAttributes.class:"custom"` | HTML attribute |
| **Text Color** | `text_text_color="#333"` | `textColor:"custom-color-1"` | Use color classes |
| **Font Size** | `text_font_size="16px"` | `fontSize:"fontSize-16"` | Use font presets |
| **Links** | `url="/page/"` | `url:"/page/"` | Direct conversion |
| **Responsive** | `custom_padding_tablet="10\|0"` | `@media (tablet) ...` | Use viewport presets |

### Spacing Conversion Example

**DIVI Format (pipe-separated):**
```
custom_padding="20px|30px|20px|30px|on"
custom_margin="0px|0px|10px|0px|false"
```

**GenerateBlocks Format (CSS object):**
```json
{
  "styles": {
    "spacing": {
      "padding": {
        "top": "20px",
        "right": "30px",
        "bottom": "20px",
        "left": "30px"
      },
      "margin": {
        "bottom": "10px"
      }
    }
  }
}
```

## Feature Availability

### ✓ Available in GenerateBlocks

- [x] Containers with backgrounds and padding
- [x] Flexible grid/column layouts
- [x] Typography controls
- [x] Button styling
- [x] Responsive design
- [x] Global classes
- [x] Custom CSS
- [x] Tabs (Pro)
- [x] Accordions (Pro)
- [x] Dynamic content (Pro + ACF)
- [x] Conditional display (Pro)
- [x] Navigation blocks (Pro)
- [x] Site header blocks (Pro)

### ✗ NOT Available (Workarounds)

- [ ] Wave/zigzag dividers → Use SVG or CSS borders
- [ ] Parallax backgrounds → Use CSS `background-attachment: fixed`
- [ ] Video backgrounds → Use custom HTML + video element
- [ ] Icon fonts (DIVI) → Use SVG, WordPress icons, or Font Awesome
- [ ] Hover animations → Use CSS @keyframes or plugin

See [WHY_GENERATEBLOCKS.md](WHY_GENERATEBLOCKS.md#feature-comparison-specific-missing-features) for workarounds.

## Performance Metrics

### Conversion Time Estimates

**Per page type:**
- Simple 5-column page: 2-3 hours
- Complex 10+ section page: 5-8 hours
- Page with tabs: +30 min per tabs group
- Page with custom CSS: +1-2 hours

**Per module type:**
- Text → Paragraph: 1 min
- Section → Container: 3 min
- Row/Column → Grid: 5 min
- Image → Image block: 1 min
- Button → Button block: 1 min
- Blurb → Container+children: 5 min
- Tabs → Tabs block: 10 min
- Blog → Query block: 15-20 min

## Recommended Reading Order

1. **Overview** - Read [README.md](README.md) (15 min)
2. **Why GenerateBlocks** - Read [WHY_GENERATEBLOCKS.md](WHY_GENERATEBLOCKS.md) (20 min)
3. **Conversion Planning** - Read [CONVERSION_MATRIX.md](CONVERSION_MATRIX.md) (15 min)
4. **Specific Blocks** - Read relevant block documentation as needed (varies)
5. **Advanced** - Read [GENERATEPRESS_ELEMENTS.md](GENERATEPRESS_ELEMENTS.md) (20 min)

**Total reading time:** ~90 minutes

## Tools & Resources

### Official Documentation
- [GenerateBlocks Docs](https://docs.generateblocks.com)
- [GeneratePress Docs](https://docs.generatepress.com)
- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)

### Community
- [GenerateBlocks Discord](https://discord.generateblocks.com)
- [GeneratePress Community](https://generatepress.com/community)
- [WordPress Forums](https://wordpress.org/support/)

### Related Files
- **[../divi/README.md](../divi/README.md)** - Original DIVI documentation
- **[../gutenberg/README.md](../gutenberg/README.md)** - Vanilla Gutenberg reference

## Quick Answers

### "Which block replaces `et_pb_section`?"
**Answer:** `wp:generateblocks/container`
See: [CONVERSION_MATRIX.md - Section Container](CONVERSION_MATRIX.md#section-container)

### "How do I convert DIVI spacing values?"
**Answer:** Convert pipe-separated values to CSS object
See: [CONVERSION_MATRIX.md - Quick Reference Table](CONVERSION_MATRIX.md#quick-reference-summary) and this page above

### "Can I use `[akce]` shortcodes in GenerateBlocks?"
**Answer:** Yes! They work in `wp:shortcode` blocks inside any block
See: [tabs-block.md - Custom Shortcodes](tabs-block.md#1-custom-shortcodes-within-tabs)

### "Do I need GenerateBlocks Pro?"
**Answer:** Pro recommended for tabs, accordions, dynamic content
See: [README.md - When to Use Pro](README.md#generateblocks-pro-premium)

### "How do I style GenerateBlocks blocks?"
**Answer:** Use global classes, custom CSS, or inline styles
See: [GENERATEPRESS_ELEMENTS.md - Styling Elements](GENERATEPRESS_ELEMENTS.md#styling-elements)

### "Can I migrate all 60 pages?"
**Answer:** Yes, estimated 240-480 hours (6-12 weeks)
See: [README.md - Conversion Process](README.md#conversion-process)

### "What about DIVI dividers (wave, zigzag)?"
**Answer:** Use SVG or CSS border workarounds
See: [WHY_GENERATEBLOCKS.md - Missing Features](WHY_GENERATEBLOCKS.md#3-wave-zigzag-dividers)

### "Is there a cost?"
**Answer:** GenerateBlocks Pro ~$199-299, worth the investment
See: [WHY_GENERATEBLOCKS.md - Cost Analysis](WHY_GENERATEBLOCKS.md#cost-analysis)

## File Structure

```
docs/generateblocks/
├── README.md (Complete overview)
├── INDEX.md (This file)
├── CONVERSION_MATRIX.md (Detailed DIVI → GB mapping)
├── WHY_GENERATEBLOCKS.md (Feature comparison)
├── GENERATEPRESS_ELEMENTS.md (Advanced customizations)
├── tabs-block.md (Tabs block documentation)
├── container-block.md (Coming soon)
├── grid-block.md (Coming soon)
├── button-block.md (Coming soon)
├── image-block.md (Coming soon)
├── accordion-block.md (Coming soon)
└── navigation-block.md (Coming soon)
```

## Feedback & Updates

This documentation is maintained as the site converts. Report:
- Missing information
- Unclear explanations
- New block releases
- Documentation errors

---

**Last Updated:** November 20, 2025
**Status:** Active and maintained
**Completeness:** 80% (core docs done, individual block docs partial)
**Next Updates:** Additional block documentation files
