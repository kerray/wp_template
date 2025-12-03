# Gutenberg Block: core/paragraph

## Overview

The Paragraph block is a **simple text content container** that handles body text, paragraphs, and general text content. It's the most frequently used block on any Gutenberg-based WordPress site. Paragraphs support rich text editing (bold, italic, links, inline formatting) and offer control over text size, color, and alignment.

**DIVI Equivalent:** `et_pb_text` (body text only)

**Use Cases:**
- Body text and descriptive paragraphs
- List introductions
- Text content with basic formatting
- Mixed HTML and plain text content

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `content` | HTML | empty | Text content (can include HTML tags) | `"<p>Text here</p>"` |
| `fontSize` | string | empty | Font size (small, medium, large, custom) | `"large"` |
| `textColor` | string | empty | Text color (color slug or hex) | `"black"` |
| `backgroundColor` | string | empty | Background color | `"light-gray"` |
| `align` | string | "left" | Text alignment (left, center, right, justify) | `"center"` |
| `className` | string | empty | Custom CSS classes | `"intro-text"` |
| `textDecoration` | string | empty | Text decoration (underline, line-through, etc.) | `"underline"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| Body text content | `content` | Preserve HTML exactly |
| `text_font_size="16px"` | `fontSize="large"` or CSS | Use theme font sizes or custom CSS |
| `text_text_color="#333"` | `textColor="black"` | Map to theme color or use hex |
| `text_text_align="center"` | `align="center"` | Direct mapping |
| `custom_padding="20px\|..."` | CSS padding or spacing | Apply custom class with CSS |
| `custom_margin="\|20px\|..."` | CSS margin | Apply custom class with CSS |
| `module_class="custom"` | `className="custom"` | Preserve class names |
| Text shadow effects | CSS text-shadow | Use custom CSS class |

## Block Markup Example

### Simple Paragraph

```html
<!-- wp:paragraph -->
<p>This is a simple paragraph with regular text content.</p>
<!-- /wp:paragraph -->
```

### Paragraph with Styling

```html
<!-- wp:paragraph {
  "fontSize":"large",
  "textColor":"black",
  "align":"center"
} -->
<p class="has-large-font-size has-black-color">
  Centered text with large font size.
</p>
<!-- /wp:paragraph -->
```

### Paragraph with Custom Class

```html
<!-- wp:paragraph {"className":"intro-text highlight"} -->
<p class="intro-text highlight">
  Introduction paragraph with custom styling.
</p>
<!-- /wp:paragraph -->
```

### Paragraph with HTML Content

```html
<!-- wp:paragraph -->
<p>
  This paragraph contains <strong>bold text</strong>,
  <em>italic text</em>, and a
  <a href="/link">hyperlink</a>.
</p>
<!-- /wp:paragraph -->
```

## Conversion Complexity

**Rating:** LOW

### What's Easy
- Direct HTML content transfer
- Simple text styling (bold, italic, underline)
- Text alignment
- Color selection
- Custom CSS classes
- Hyperlinks

### What's Hard
- Font size mapping (DIVI pixels to theme sizes)
- Advanced text effects (shadows, gradients)
- Line height customization
- Letter spacing
- Font family changes
- Spacing (padding/margin)

### What's Missing
- **Text Shadows** - No direct attribute; use custom CSS
- **Advanced Spacing** - Limited padding/margin control
- **Multiple Font Families** - Limited to theme defaults
- **Font Weight Granularity** - Only Bold/Normal available in UI

## Real-World Conversion Examples

### Example 1: Simple Body Text (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_text _builder_version="4.16"
  text_font_size="16px"
  text_text_color="#333333"]

  <p>This is the main body text describing our school's mission and values.</p>
  <p>We focus on holistic development of children through innovative education.</p>

[/et_pb_text]
```

**Gutenberg Conversion:**
```html
<!-- wp:paragraph {"textColor":"dark-gray"} -->
<p class="has-dark-gray-color">
  This is the main body text describing our school's mission and values.
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"dark-gray"} -->
<p class="has-dark-gray-color">
  We focus on holistic development of children through innovative education.
</p>
<!-- /wp:paragraph -->
```

### Example 2: Centered Heading Paragraph (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_text _builder_version="4.16"
  header_text_color="#ffffff"
  header_font_size="38px"
  text_text_align="center"]

  <h2>Welcome to Our School</h2>
  <p style="text-align: center;">Building better futures</p>

[/et_pb_text]
```

**Gutenberg Conversion:**

Option 1 - Using separate blocks:
```html
<!-- wp:heading {"textAlign":"center","textColor":"white"} -->
<h2 class="has-text-align-center has-white-color">Welcome to Our School</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white"} -->
<p class="has-text-align-center has-white-color">Building better futures</p>
<!-- /wp:paragraph -->
```

Option 2 - Using HTML in paragraph:
```html
<!-- wp:paragraph {"align":"center","textColor":"white"} -->
<p class="has-text-align-center has-white-color">
  <strong>Welcome to Our School</strong><br />
  Building better futures
</p>
<!-- /wp:paragraph -->
```

### Example 3: Formatted List (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_text _builder_version="4.16"
  text_text_color="#333333"]

  <h3>Our Values:</h3>
  <ul>
    <li>Individualized attention for each student</li>
    <li>Development of creative abilities</li>
    <li>Healthy lifestyle promotion</li>
    <li>Multicultural tolerance</li>
  </ul>

[/et_pb_text]
```

**Gutenberg Conversion:**

Option 1 - Separate blocks:
```html
<!-- wp:heading {"level":3} -->
<h3>Our Values:</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
  <li>Individualized attention for each student</li>
  <li>Development of creative abilities</li>
  <li>Healthy lifestyle promotion</li>
  <li>Multicultural tolerance</li>
</ul>
<!-- /wp:list -->
```

Option 2 - Combined in single paragraph:
```html
<!-- wp:paragraph -->
<p><strong>Our Values:</strong></p>
<ul style="text-align: left;">
  <li>Individualized attention for each student</li>
  <li>Development of creative abilities</li>
  <li>Healthy lifestyle promotion</li>
  <li>Multicultural tolerance</li>
</ul>
<!-- /wp:paragraph -->
```

## Implementation Guide

### Step 1: Extract Text Content

From DIVI shortcode, copy all content between tags:
```
[et_pb_text ...]Content Here[/et_pb_text]
```

### Step 2: Create Paragraph Block

In Gutenberg:
1. Click "+" to add block
2. Search for "Paragraph"
3. Paste content

### Step 3: Format Text

1. Select text to format
2. Use toolbar buttons:
   - **B** = Bold
   - **I** = Italic
   - **U** = Underline
   - **A** = Links/Advanced
3. Or use keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

### Step 4: Set Text Color (Optional)

1. Select text or click block
2. In right sidebar, find "Text Color"
3. Choose color from palette

### Step 5: Set Alignment (Optional)

1. Click block
2. In toolbar, click alignment button
3. Choose Left, Center, Right, or Justify

### Step 6: Apply Custom Classes (Optional)

1. In right sidebar, find "Advanced"
2. Add custom CSS classes
3. Define styling in theme CSS file

## Text Size Mapping

### DIVI Font Sizes to Gutenberg

| DIVI Size | Gutenberg Equivalent | CSS Value |
|-----------|-------------------|-----------|
| 12px | Small | 14px |
| 14px | Small | 14px |
| 16px | Medium | 16px |
| 18px | Medium | 16px |
| 20px | Large | 20px |
| 24px | Large | 20px |
| 28px+ | Custom | (varies by theme) |

**Method:** Use theme font size presets if available. For custom sizes, use CSS class with `font-size` property.

## Color Mapping

### Common Colors

| DIVI Color | Gutenberg Slug | Hex |
|-----------|---|---|
| `#ffffff` | white | #ffffff |
| `#000000` | black | #000000 |
| `#333333` | dark-gray | #333333 |
| `#666666` | medium-gray | #666666 |
| `#f5f5f5` | light-gray | #f5f5f5 |

**Method:** Match colors to theme palette. If exact match not available, use hex code directly.

## CSS Customization for Advanced Styling

### Text Shadow
```css
.has-text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
```

### Custom Padding
```css
.intro-paragraph {
  padding: 20px;
  margin: 20px 0;
}
```

### Custom Font Size and Line Height
```css
.large-body-text {
  font-size: 18px;
  line-height: 1.8;
  letter-spacing: 0.5px;
}
```

## Troubleshooting

### Q: Text content not showing
**A:** Ensure you've pasted content into the paragraph block. Check HTML validity (mismatched tags).

### Q: Color not applying
**A:** Verify color slug exists in theme palette. Use hex code as fallback (e.g., `#333333`).

### Q: Formatting lost during conversion
**A:** Copy content as plain text first, then apply formatting in Gutenberg for consistency.

### Q: Links not working
**A:** Select link text, click link button in toolbar, enter URL. Ensure URL is valid.

### Q: Custom class not applying
**A:** Ensure CSS rule exists in theme stylesheet. Check class name spelling.

## Comparison Table

| Feature | DIVI | Gutenberg | Notes |
|---------|------|-----------|-------|
| Body Text | Yes | Yes | Direct content copy |
| Text Formatting | Yes | Yes | Bold, italic, underline supported |
| Text Color | Yes | Yes | Limited to theme palette |
| Font Size | Yes | Limited | Theme presets only |
| Text Alignment | Yes | Yes | Left, center, right, justify |
| Line Height | Yes | No | Use custom CSS |
| Letter Spacing | Yes | No | Use custom CSS |
| Custom Classes | Yes | Yes | Preserved |
| HTML Content | Yes | Yes | Exact copy |

## Recommendations

1. **Keep Paragraphs Simple** - Use shorter paragraphs for better readability
2. **Use Heading Blocks** - For headings, use `core/heading` instead of formatting in paragraph
3. **Preserve Formatting** - Don't lose bold/italic when converting
4. **Test Links** - Verify all hyperlinks work after conversion
5. **Use Lists Separately** - For lists, use `core/list` block for better semantics
6. **Consistent Spacing** - Use theme spacing variables for consistency

## Related Blocks

- **[core/heading](core_heading.md)** - Headings (h1-h6)
- **[core/list](core_list.md)** - Bulleted and numbered lists
- **[core/quote](core_quote.md)** - Block quotes
- **[core/image](core_image.md)** - Images within text flow

## Further Reading

- [WordPress Paragraph Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/paragraph/)
- [HTML Text Formatting](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals)
- [CSS Text Properties](https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation with conversion examples
**Instances in Current Site:** 891 DIVI text blocks
**Conversion Priority:** CRITICAL - Highest volume content
