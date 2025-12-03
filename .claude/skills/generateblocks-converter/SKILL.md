---
name: generateblocks-converter
description: Converts DIVI shortcodes to GenerateBlocks format including GeneratePress theme integration. Use when converting DIVI layouts to GenerateBlocks with proper GeneratePress theme compatibility and spacing values.
---

# GenerateBlocks Converter

## Instructions

GenerateBlocks is a modern block library built for GeneratePress theme integration. When converting DIVI to GenerateBlocks, follow this approach:

### 1. Reference Documentation

Always reference the comprehensive documentation in:
- `./docs/divi/` - DIVI shortcode parameters
- `./docs/generateblocks/` - GenerateBlocks equivalents
- `./docs/generateblocks/CONVERSION_MATRIX.md` - Parameter mapping
- `./docs/generateblocks/WHY_GENERATEBLOCKS.md` - Feature comparison

### 2. GenerateBlocks Core Structure

GenerateBlocks extends Gutenberg with purpose-built layout blocks:

**Available GenerateBlocks Components:**
- `generateblocks/container` - Flexible layout container (replaces Group for complex layouts)
- `generateblocks/grid` - CSS Grid-based layouts (superior to Gutenberg columns)
- `generateblocks/headline` - Advanced heading block with styling
- `generateblocks/button` - Enhanced button with hover effects and animations
- `generateblocks/image` - Image with advanced responsive features
- `generateblocks/buttoncontainer` - Button group wrapper

**Additional with GenerateBlocks Pro:**
- Tab block (native tabs - perfect for `[et_pb_tabs]`)
- Accordion block
- Advanced query loop
- Shape dividers (for DIVI wave/zigzag dividers)

### 3. DIVI to GenerateBlocks Mapping

**Section + Row + Columns → Container + Grid**

```
DIVI:
[et_pb_section]
  [et_pb_row column_structure="1_3,1_3,1_3"]
    [et_pb_column type="1_3"]Content 1[/et_pb_column]
    [et_pb_column type="1_3"]Content 2[/et_pb_column]
    [et_pb_column type="1_3"]Content 3[/et_pb_column]
  [/et_pb_row]
[/et_pb_section]

GenerateBlocks:
<!-- wp:generateblocks/container {
  "paddingTop":"40",
  "paddingBottom":"40",
  "backgroundColor":"var:preset|color|background"
} -->
  <!-- wp:generateblocks/grid {"columns":3,"gap":20} -->
    <!-- wp:generateblocks/container {"gridItemWidthDesktop":"33.33"} -->
      Content 1
    <!-- /wp:generateblocks/container -->
    <!-- wp:generateblocks/container {"gridItemWidthDesktop":"33.33"} -->
      Content 2
    <!-- /wp:generateblocks/container -->
    <!-- wp:generateblocks/container {"gridItemWidthDesktop":"33.33"} -->
      Content 3
    <!-- /wp:generateblocks/container -->
  <!-- /wp:generateblocks/grid -->
<!-- /wp:generateblocks/container -->
```

**Text → Headline or Paragraph**

```
DIVI: [et_pb_text font_size="18px" text_color="#000000"]Content[/et_pb_text]

GenerateBlocks (for headings):
<!-- wp:generateblocks/headline {
  "element":"h2",
  "fontSize":18,
  "textColor":"var:preset|color|text"
} -->
Content
<!-- /wp:generateblocks/headline -->

Or use core paragraph for body text:
<!-- wp:paragraph {"fontSize":"medium"} -->
<p>Content</p>
<!-- /wp:paragraph -->
```

**Button → GenerateBlocks Button**

```
DIVI:
[et_pb_button button_text="Click Me" button_url="#" button_bg_color="#0066cc"]

GenerateBlocks:
<!-- wp:generateblocks/buttoncontainer -->
  <!-- wp:generateblocks/button {
    "text":"Click Me",
    "url":"#",
    "backgroundColor":"var:preset|color|primary",
    "paddingTop":"12",
    "paddingRight":"24",
    "paddingBottom":"12",
    "paddingLeft":"24",
    "borderRadiusTopLeft":"5",
    "borderRadiusTopRight":"5",
    "borderRadiusBottomLeft":"5",
    "borderRadiusBottomRight":"5"
  } /-->
<!-- /wp:generateblocks/buttoncontainer -->
```

**Image → GenerateBlocks Image**

```
DIVI: [et_pb_image src="image.jpg" align="center"]

GenerateBlocks:
<!-- wp:generateblocks/image {
  "mediaUrl":"image.jpg",
  "alignment":"center",
  "width":"100"
} /-->
```

**Blurb → Container + Image + Headline**

```
DIVI:
[et_pb_blurb title="Feature" image="icon.png" url="/link"]Content[/et_pb_blurb]

GenerateBlocks:
<!-- wp:generateblocks/container {
  "textAlign":"center",
  "paddingTop":"20",
  "paddingBottom":"20"
} -->
  <!-- wp:generateblocks/image {"mediaUrl":"icon.png","width":"64"} /-->
  <!-- wp:generateblocks/headline {"element":"h3"} -->Feature<!-- /wp:generateblocks/headline -->
  <!-- wp:paragraph -->
  <p>Content</p>
  <!-- /wp:paragraph -->
<!-- /wp:generateblocks/container -->
```

**Tabs → GenerateBlocks Pro Tabs**

```
DIVI:
[et_pb_tabs]
  [et_pb_tab title="Tab 1"]Content 1[/et_pb_tab]
  [et_pb_tab title="Tab 2"]Content 2[/et_pb_tab]
[/et_pb_tabs]

GenerateBlocks Pro:
<!-- wp:generateblocks/tabs -->
  <!-- wp:generateblocks/tab {"title":"Tab 1"} -->
    Content 1
  <!-- /wp:generateblocks/tab -->
  <!-- wp:generateblocks/tab {"title":"Tab 2"} -->
    Content 2
  <!-- /wp:generateblocks/tab -->
<!-- /wp:generateblocks/tabs -->

Note: Requires GenerateBlocks Pro (available on this site)
```

### 4. Attribute Mapping for GenerateBlocks

| DIVI Attribute | GenerateBlocks Attribute | Notes |
|---|---|---|
| `custom_padding` | `padding*` | paddingTop, paddingRight, paddingBottom, paddingLeft (numeric values) |
| `custom_margin` | `margin*` | marginTop, marginRight, marginBottom, marginLeft (numeric values) |
| `background_color` | `backgroundColor` | Use theme color variables: `var:preset\|color\|primary` |
| `text_color` | `textColor` | Use theme color variables |
| `text_orientation` | `textAlign` | left, center, right |
| `font_size` | `fontSize` | Numeric value or named size |
| `module_class` | `className` | Custom CSS classes |
| `type` (column width) | `gridItemWidthDesktop` | Percentage value |
| `background_image` | `backgroundImage` | Use GenerateBlocks image selector |
| `border_radii` | `borderRadius*` | borderRadiusTopLeft, etc. (numeric values) |
| `use_border_color` | `borderColor` | Theme color variable |
| `border_width` | `borderSize*` | borderSizeTop, borderSizeRight, etc. |

### 5. GeneratePress Theme Integration

**Color System:**
Always use GeneratePress theme color variables instead of hardcoded colors:
```json
{
  "textColor": "var:preset|color|text",
  "backgroundColor": "var:preset|color|background",
  "buttonColor": "var:preset|color|primary"
}
```

Common GeneratePress colors:
- `var:preset|color|background` - Background color
- `var:preset|color|text` - Text color
- `var:preset|color|primary` - Primary accent color
- `var:preset|color|secondary` - Secondary accent color
- `var:preset|color|accent` - Accent color

**Spacing Scale:**
GenerateBlocks integrates with GeneratePress spacing. Common values:
- `10` - Extra small spacing
- `20` - Small spacing
- `30` - Medium spacing
- `40` - Large spacing
- `50` - Extra large spacing

**Typography:**
Use GeneratePress font size scale:
```json
{
  "fontSize": 18,
  "fontSizeUnit": "px"
}
```

Or use named sizes:
- `small` - Small text
- `medium` - Body text (default)
- `large` - Large text
- `huge` - Very large text

### 6. Advanced Features

**Responsive Spacing:**
GenerateBlocks has superior responsive control compared to Gutenberg:
```json
{
  "paddingTop": "40",
  "paddingTopTablet": "30",
  "paddingTopMobile": "20",
  "paddingRight": "40",
  "paddingRightTablet": "20",
  "paddingRightMobile": "10"
}
```

**Display Control:**
Show/hide at different breakpoints:
```json
{
  "hideOnDesktop": false,
  "hideOnTablet": false,
  "hideOnMobile": false
}
```

**Flexbox Layout:**
For complex alignment:
```json
{
  "display": "flex",
  "flexDirection": "row",
  "justifyContent": "center",
  "alignItems": "center"
}
```

**Grid Layout:**
For multi-column layouts:
```json
{
  "isGrid": true,
  "columns": 3,
  "gap": 20,
  "gapTablet": 15,
  "gapMobile": 10
}
```

**Background Images:**
```json
{
  "backgroundImage": {
    "url": "http://example.com/image.jpg",
    "id": 123
  },
  "backgroundImageSize": "cover",
  "backgroundImagePosition": "center center"
}
```

### 7. Column Width Conversion

DIVI fraction notation → GenerateBlocks percentage:

| DIVI `type` | GenerateBlocks `gridItemWidthDesktop` | Notes |
|---|---|---|
| `4_4` | `100` | Full width |
| `1_2` | `50` | Half width |
| `1_3` | `33.33` | One third |
| `2_3` | `66.66` | Two thirds |
| `1_4` | `25` | One quarter |
| `3_4` | `75` | Three quarters |
| `1_5` | `20` | One fifth |
| `2_5` | `40` | Two fifths |
| `3_5` | `60` | Three fifths |
| `4_5` | `80` | Four fifths |
| `1_6` | `16.66` | One sixth |
| `5_6` | `83.33` | Five sixths |

### 8. Conversion Output Format

When converting to GenerateBlocks, provide:

**DIVI Source:**
```
[et_pb_section][et_pb_row][et_pb_column]...[/et_pb_column][/et_pb_row][/et_pb_section]
```

**GenerateBlocks HTML (Comment Syntax):**
```html
<!-- wp:generateblocks/container -->
  <!-- wp:generateblocks/grid {"columns":3} -->
    ...
  <!-- /wp:generateblocks/grid -->
<!-- /wp:generateblocks/container -->
```

**GeneratePress Theme CSS:** (if needed for advanced features)
```css
.gb-container-custom {
  /* Additional styling */
}
```

### 9. Migration Best Practices

1. **Use Container over Group:** GenerateBlocks/container offers better spacing and layout control
2. **Leverage Grid Layouts:** Use generateblocks/grid for complex multi-column layouts (better than Gutenberg columns)
3. **Apply Theme Colors:** Always use GeneratePress theme color variables for consistency
4. **Consistent Spacing:** Use GeneratePress spacing scale (10, 20, 30, 40, 50) instead of arbitrary values
5. **Test Responsiveness:** GenerateBlocks has excellent mobile support with responsive controls
6. **Use Tabs Block:** For `[et_pb_tabs]`, use GenerateBlocks Pro tabs (native support, works with custom shortcodes)

### 10. Special Features

**Wave Dividers (DIVI dividers)**
```
DIVI:
top_divider_style="wave"
top_divider_color="#ffffff"

GenerateBlocks Pro:
Use Shape Divider feature in Container block
Or use custom CSS with SVG
```

**Parallax Scrolling**
```
DIVI: parallax="on"

GenerateBlocks + Custom CSS:
<!-- wp:generateblocks/container {"className":"parallax-background"} -->

.parallax-background {
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}
```

**Custom Animations**
```
GenerateBlocks supports CSS animations via className:
{"className":"animate-fade-in"}

Add custom CSS:
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 1s ease-in;
}
```

### 11. Custom Shortcode Integration

Custom shortcodes work perfectly inside GenerateBlocks:
```html
<!-- wp:generateblocks/container -->
  <!-- wp:paragraph -->
  <p>[your-custom-shortcode param="value"]</p>
  <!-- /wp:paragraph -->
<!-- /wp:generateblocks/container -->
```

**Tabs with Custom Shortcodes:**
```html
<!-- wp:generateblocks/tabs -->
  <!-- wp:generateblocks/tab {"title":"Tab 1"} -->
    <!-- wp:paragraph -->
    <p>[custom-shortcode category="all"]</p>
    <!-- /wp:paragraph -->
  <!-- /wp:generateblocks/tab -->
  <!-- wp:generateblocks/tab {"title":"Tab 2"} -->
    <!-- wp:paragraph -->
    <p>[custom-shortcode category="specific"]</p>
    <!-- /wp:paragraph -->
  <!-- /wp:generateblocks/tab -->
<!-- /wp:generateblocks/tabs -->
```

### 12. Advantages Over Vanilla Gutenberg

GenerateBlocks provides these benefits for DIVI migration:

1. **Better Layout Control** - Grid system superior to Gutenberg columns
2. **Responsive by Default** - Tablet/mobile controls built-in
3. **Native Tabs** - No plugin needed for `[et_pb_tabs]` conversion
4. **Performance** - Lighter and faster than DIVI
5. **Global Classes** - Reusable styling across site
6. **Theme Integration** - Works perfectly with GeneratePress theme
7. **Developer-Friendly** - Clean code, no vendor lock-in
8. **Future-Proof** - Built on WordPress standards

## Common Issues

- **Color formats**: Always use theme color variables for consistency
- **Spacing**: Use GeneratePress spacing scale values (10, 20, 30, 40, 50)
- **Responsive**: Set tablet and mobile values explicitly for best results
- **Grid columns**: Use Grid block instead of core Gutenberg columns for better control
- **Custom shortcodes**: Work perfectly - preserve them exactly as-is

## Tools and Resources

- GenerateBlocks Documentation: https://docs.generateblocks.com/
- GeneratePress Theme: https://generatepress.com/
- Project documentation: `./docs/generateblocks/README.md`
- Why GenerateBlocks: `./docs/generateblocks/WHY_GENERATEBLOCKS.md`
- Conversion matrix: `./docs/generateblocks/CONVERSION_MATRIX.md`
- GeneratePress Elements: `./docs/generateblocks/GENERATEPRESS_ELEMENTS.md`
- Tabs documentation: `./docs/generateblocks/tabs-block.md`
