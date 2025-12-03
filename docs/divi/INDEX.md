# DIVI Shortcodes Documentation Index

Quick reference guide to all DIVI shortcode documentation files.

## Files Created

### Master Documentation
- **README.md** (314 lines) - Complete overview, statistics, and conversion strategy

### Structural Modules (Section, Row, Column)
- **et_pb_section.md** (151 lines) - Top-level page container [485 instances]
- **et_pb_row.md** (179 lines) - Horizontal row with columns [712 instances]
- **et_pb_column.md** (173 lines) - Vertical column container [1,203 instances]

### Content Modules
- **et_pb_text.md** (187 lines) - Text and HTML content [891 instances]
- **et_pb_image.md** (174 lines) - Responsive images [67 instances]
- **et_pb_button.md** (171 lines) - Call-to-action buttons [89 instances]
- **et_pb_blurb.md** (171 lines) - Icon + text feature boxes [156 instances]

### Advanced Modules
- **et_pb_tabs.md** (190 lines) - Tabbed content container [12 instances]
- **et_pb_tab.md** (119 lines) - Individual tab content [24+ instances]
- **et_pb_blog.md** (182 lines) - Dynamic blog post lists [8 instances]

**Total Documentation:** 2,011 lines across 11 files

---

## Quick Navigation

### By Complexity Level

**🟢 LOW COMPLEXITY** (Easiest to Convert)
- [et_pb_text.md](et_pb_text.md) - Direct Gutenberg paragraph/heading blocks
- [et_pb_button.md](et_pb_button.md) - Direct Gutenberg button block
- [et_pb_image.md](et_pb_image.md) - Direct Gutenberg image block
- [et_pb_tab.md](et_pb_tab.md) - Tab content wrapper

**🟡 MEDIUM COMPLEXITY** (Moderate Effort)
- [et_pb_row.md](et_pb_row.md) - Maps to Gutenberg columns block
- [et_pb_column.md](et_pb_column.md) - Maps to Gutenberg column block
- [et_pb_blurb.md](et_pb_blurb.md) - Group + image + text combination
- [et_pb_tabs.md](et_pb_tabs.md) - Requires tab block plugin or custom implementation

**🔴 HIGH COMPLEXITY** (Most Challenging)
- [et_pb_section.md](et_pb_section.md) - Complex backgrounds, dividers, parallax
- [et_pb_blog.md](et_pb_blog.md) - Dynamic post queries, pagination

---

### By Frequency (Most to Least Used)

1. **et_pb_column** (1,203) - [et_pb_column.md](et_pb_column.md)
2. **et_pb_row** (712) - [et_pb_row.md](et_pb_row.md)
3. **et_pb_text** (891) - [et_pb_text.md](et_pb_text.md)
4. **et_pb_section** (485) - [et_pb_section.md](et_pb_section.md)
5. **et_pb_blurb** (156) - [et_pb_blurb.md](et_pb_blurb.md)
6. **et_pb_button** (89) - [et_pb_button.md](et_pb_button.md)
7. **et_pb_image** (67) - [et_pb_image.md](et_pb_image.md)
8. **et_pb_tabs** (12) - [et_pb_tabs.md](et_pb_tabs.md)
9. **et_pb_blog** (8) - [et_pb_blog.md](et_pb_blog.md)
10. **et_pb_tab** (24+) - [et_pb_tab.md](et_pb_tab.md)

---

### By Hierarchy (Nesting Structure)

**Root Level:**
- [et_pb_section.md](et_pb_section.md) - Parent: none

**Section Children:**
- [et_pb_row.md](et_pb_row.md) - Parent: et_pb_section

**Row Children:**
- [et_pb_column.md](et_pb_column.md) - Parent: et_pb_row

**Column Children (Content Modules):**
- [et_pb_text.md](et_pb_text.md)
- [et_pb_image.md](et_pb_image.md)
- [et_pb_button.md](et_pb_button.md)
- [et_pb_blurb.md](et_pb_blurb.md)
- [et_pb_tabs.md](et_pb_tabs.md)
- [et_pb_blog.md](et_pb_blog.md)

**Tabs Children:**
- [et_pb_tab.md](et_pb_tab.md) - Parent: et_pb_tabs

---

## Each File Contains

Every documentation file follows the same comprehensive structure:

### 1. Overview Section
- Clear description of the module's purpose
- Real-world use cases

### 2. Hierarchy Section
- Parent module(s)
- Child module(s)
- Usage context

### 3. Parameters Section
- Organized by category (Structural, Styling, Content, etc.)
- Parameter name and type
- Default value
- Purpose/description
- Example values from actual site usage

### 4. Real Usage Examples
- 3-6 actual shortcode examples from the site
- Realistic parameter combinations
- Comments explaining key features

### 5. Conversion Complexity Rating
- LOW / MEDIUM / HIGH
- Detailed reasoning for the rating
- Suggested conversion approach

### 6. Notes Section
- Special considerations
- Parameter format details
- Browser/feature support
- Common patterns on this site
- Conversion tips

---

## Documentation Highlights

### Parameter Coverage
- Over 200 unique parameters documented
- Real examples from site usage
- Format specifications for complex values
- Responsive design variants (_tablet, _phone)

### Real Examples
- 40+ actual shortcode examples extracted from site
- Realistic parameter combinations
- Czech language content (native to site)
- Covers all major use cases

### Conversion Guidance
- Clear complexity ratings for each module
- Gutenberg block mapping recommendations
- Integration points with custom functionality
- Testing strategies

### Site-Specific Notes
- References to custom shortcodes ([akce], [rml_file_list])
- Event system integration
- Custom CSS classes used
- Localization considerations (Czech)

---

## How to Use This Documentation

### For Developers Converting Content
1. Start with [README.md](README.md) for overview
2. Refer to specific module files as needed
3. Use parameter tables for quick lookups
4. Follow real examples for implementation guidance
5. Check conversion complexity to estimate effort

### For Understanding Site Structure
1. Read hierarchy section in [README.md](README.md)
2. Check flow: section → row → column → content modules
3. Review statistics table for module distribution
4. Study real examples to see patterns

### For Planning Conversion Project
1. Review complexity summary in [README.md](README.md)
2. Group modules by complexity level
3. Estimate effort using module counts
4. Prioritize high-frequency modules first
5. Plan testing strategy for each module type

### For Writing Custom Blocks
1. Check parameter lists in each module file
2. Review styling parameters for CSS mapping
3. Study real examples for expected functionality
4. Note responsive design requirements
5. Check conversion complexity for scope estimation

---

## Key Takeaways

### Module Distribution
- **Structural (section/row/column):** 2,400 instances (62%)
- **Content (text/image/button/blurb):** 1,194 instances (31%)
- **Advanced (tabs/blog):** 267 instances (7%)

### Conversion Difficulty
- **Easy to convert:** 891 text + 89 button + 67 image = 1,047 instances (27%)
- **Moderate complexity:** 712 row + 1,203 column + 156 blurb + 12 tabs = 2,083 instances (54%)
- **High complexity:** 485 section + 8 blog = 493 instances (13%)
- **Straightforward:** 24+ tabs = 24+ instances (1%)

### Conversion Strategy
1. Convert structural elements first (section/row/column) - foundation
2. Add content modules to columns (text/image/button/blurb)
3. Implement advanced modules (tabs, blog) with plugins or custom blocks
4. Validate responsive design and custom functionality
5. QA and performance testing

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Shortcode Instances | 3,861 |
| Unique Module Types | 10 |
| Documentation Files | 11 |
| Total Lines Documented | 2,011 |
| Pages Covered | 60+ |
| CSS Parameters Documented | 50+ |
| Spacing Variants | 20+ |
| Real Code Examples | 40+ |

---

## Quick Reference: Parameter Categories

### Most Used Parameters (Found in 5+ Modules)
- `_builder_version` - Version flag
- `custom_padding` - Internal spacing
- `custom_margin` - External spacing
- `background_color` - Background color
- `text_text_color` - Text color
- `module_id` - CSS ID
- `module_class` - CSS classes

### Styling Parameters (Color, Size, Effects)
- Colors: `*_color`, `*_color_hover`
- Sizing: `*_size`, `*_width`, `*_height`
- Effects: `*_shadow_*`, `border_radii`

### Layout Parameters (Structure and Positioning)
- Structure: `column_structure`, `type`, `fullwidth`
- Spacing: `custom_padding`, `custom_margin`, `gutter_width`
- Alignment: `alignment`, `orientation`

### Interactive Parameters (Links, Actions)
- Links: `url`, `button_url`, `link_url`
- Targets: `url_new_window`
- Actions: `show_in_lightbox`

---

## Related Documentation

- **DIVI_ANALYSIS.md** - Technical analysis of site structure
- **Divi Official Docs** - https://www.elegantthemes.com/documentation/
- **Gutenberg Handbook** - https://developer.wordpress.org/block-editor/

---

## Notes

- All documentation based on DIVI 4.16 (version used on site)
- Examples reflect actual site content and Czech language usage
- Parameters documented from source code analysis
- Conversion estimates based on module complexity assessment
- Documentation current as of November 20, 2025

---

**Start here:** [README.md](README.md) for complete overview, then jump to specific module files as needed.
