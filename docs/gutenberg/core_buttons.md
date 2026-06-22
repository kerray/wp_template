# Gutenberg Block: core/buttons and core/button

## Overview

The Buttons block is a **container for one or more Button blocks**, allowing grouped button layouts with consistent spacing. Individual Button blocks create clickable call-to-action elements with text, links, and styling options.

**DIVI Equivalent:** `et_pb_button`

**Use Cases:**
- Primary and secondary action buttons
- Call-to-action (CTA) groups
- Navigation buttons
- Form submission buttons

## Block Attributes

### Buttons Container (core/buttons)

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `layout` | object | empty | Layout settings (flex, alignment, gap) | `{"type":"flex","justifyContent":"center"}` |
| `align` | string | "left" | Block alignment | `"center"` |
| `spacing` | object | empty | Gap between buttons | `{"blockGap":"1rem"}` |
| `className` | string | empty | Custom CSS classes | `"cta-buttons"` |

### Button (core/button)

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `text` | string | empty | Button label text | `"Learn More"` |
| `url` | string | empty | Link destination | `"/about/"` |
| `title` | string | empty | Link title (tooltip) | `"About Our School"` |
| `target` | string | empty | Link target | `"_blank"` |
| `rel` | string | empty | Link relationship | `"noopener noreferrer"` |
| `backgroundColor` | string | empty | Button background color | `"white"` |
| `textColor` | string | empty | Button text color | `"black"` |
| `width` | number | empty | Button width (%) | `50` |
| `className` | string | empty | Custom CSS classes | `"primary-button"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `button_text="..."` | `text="..."` | Direct mapping |
| `button_url="..."` | `url="..."` | Direct mapping |
| `url_new_window="on"` | `target="_blank"` | Open in new tab |
| `button_bg_color="#..."` | `backgroundColor="..."` | Use theme color or hex |
| `button_text_color="#..."` | `textColor="..."` | Use theme color or hex |
| `button_text_size="18px"` | CSS font-size | Use custom class |
| `button_alignment="center"` | Parent alignment | Align buttons container |
| `button_padding="15px\|..."` | CSS padding | Use custom class |
| `button_border_radius="5px"` | CSS border-radius | Use custom class |

## Block Markup Example

### Simple Single Button

```html
<!-- wp:buttons -->
<div class="wp-block-buttons">
  <!-- wp:button -->
  <div class="wp-block-button">
    <a class="wp-block-button__link" href="/contact/">Contact Us</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

### Multiple Buttons with Colors

```html
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
  <!-- wp:button {"backgroundColor":"white","textColor":"black"} -->
  <div class="wp-block-button">
    <a class="wp-block-button__link has-white-background-color has-black-color" href="/learn/">
      Learn More
    </a>
  </div>
  <!-- /wp:button -->

  <!-- wp:button {"backgroundColor":"primary","textColor":"white"} -->
  <div class="wp-block-button">
    <a class="wp-block-button__link has-primary-background-color has-white-color" href="/apply/">
      Apply Now
    </a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

## Conversion Complexity

**Rating:** LOW

### What's Easy
- Button text
- Links
- Background color
- Text color
- Alignment
- Custom classes

### What's Hard
- Button sizing and padding
- Border radius
- Hover states
- Complex button styling

## Real-World Conversion Examples

### Example 1: Single Primary Button (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_button button_url="/contact/"
  button_text="Kontaktujte Nás"
  button_bg_color="#2c3e50"
  button_text_color="#ffffff"
  button_alignment="center"
  _builder_version="4.16"]
[/et_pb_button]
```

**Gutenberg Conversion:**
```html
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
  <!-- wp:button {
    "backgroundColor":"dark-gray",
    "textColor":"white"
  } -->
  <div class="wp-block-button">
    <a class="wp-block-button__link has-dark-gray-background-color has-white-color"
       href="/contact/">
      Kontaktujte Nás
    </a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

### Example 2: Primary and Secondary Buttons (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_button button_url="/programs/"
  button_text="Zjistit Více"
  button_bg_color="#f0d118"
  button_text_color="#2c3e50"
  _builder_version="4.16"]
[/et_pb_button]

[et_pb_button button_url="/contact/"
  button_text="Kontakt"
  button_bg_color="#ffffff"
  button_text_color="#2c3e50"
  button_border_color="#2c3e50"
  button_border_width="2px"
  _builder_version="4.16"]
[/et_pb_button]
```

**Gutenberg Conversion:**
```html
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"flex-start"}} -->
<div class="wp-block-buttons">
  <!-- wp:button {"backgroundColor":"yellow","textColor":"dark-gray"} -->
  <div class="wp-block-button">
    <a class="wp-block-button__link has-yellow-background-color has-dark-gray-color"
       href="/programs/">
      Zjistit Více
    </a>
  </div>
  <!-- /wp:button -->

  <!-- wp:button {"backgroundColor":"white","textColor":"dark-gray","className":"outlined-button"} -->
  <div class="wp-block-button outlined-button">
    <a class="wp-block-button__link has-white-background-color has-dark-gray-color"
       href="/contact/">
      Kontakt
    </a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

**CSS for outlined button:**
```css
.wp-block-button.outlined-button .wp-block-button__link {
  border: 2px solid #2c3e50;
  background-color: transparent !important;
}
```

## Implementation Guide

### Step 1: Add Buttons Block

In Gutenberg:
1. Click "+" to add block
2. Search for "Buttons"
3. Insert block

### Step 2: Add First Button

1. Click inside Buttons block
2. Button block should appear automatically
3. Type button text

### Step 3: Configure Button

1. Select text
2. In toolbar, click link icon
3. Enter URL
4. Check "Open in new tab" if external

### Step 4: Style Button

1. Click button block
2. In right sidebar, find "Background Color"
3. Select button background
4. Find "Text Color"
5. Select text color

### Step 5: Add More Buttons (Optional)

1. Click after first button
2. Click "+" to add another button
3. Repeat steps 2-4

### Step 6: Align Buttons

1. Click Buttons container block (outer)
2. In toolbar, click alignment button
3. Choose alignment (left, center, right)

## CSS Customization for Advanced Styling

### Button Padding and Border Radius
```css
.wp-block-button__link {
  padding: 15px 40px;
  border-radius: 5px;
  font-weight: 600;
}
```

### Button Hover Effects
```css
.wp-block-button__link {
  transition: all 0.3s ease;
}

.wp-block-button__link:hover {
  background-color: #1a252f !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### Button Sizing
```css
.wp-block-button.large-button .wp-block-button__link {
  font-size: 18px;
  padding: 18px 50px;
}
```

### Responsive Button Layout
```css
.wp-block-buttons {
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 480px) {
  .wp-block-buttons {
    flex-direction: column;
  }

  .wp-block-button {
    width: 100%;
  }

  .wp-block-button__link {
    width: 100%;
    text-align: center;
  }
}
```

## Troubleshooting

### Q: Button text not showing
**A:** Verify text was entered. Check button is selected and click inside to edit.

### Q: Link not working
**A:** Ensure URL is entered correctly. Test by Ctrl+clicking button.

### Q: Button colors not applying
**A:** Verify colors exist in theme palette. Use hex as fallback.

### Q: Buttons stacking vertically when should be horizontal
**A:** Check parent Buttons block layout. May need to adjust flex direction in CSS.

### Q: Button too small or large
**A:** Use custom CSS class to control button padding and font size.

## Comparison Table

| Feature | DIVI | Gutenberg | Notes |
|---------|------|-----------|-------|
| Button Text | Yes | Yes | Direct mapping |
| Button Link | Yes | Yes | URL and target |
| Background Color | Yes | Yes | Theme colors or hex |
| Text Color | Yes | Yes | Theme colors or hex |
| Button Alignment | Yes | Yes | Left, center, right |
| Button Sizing | Yes | No (CSS) | Use custom CSS |
| Border Radius | Yes | No (CSS) | Use custom CSS |
| Multiple Buttons | Limited | Yes | Better support |
| Hover Effects | Yes | No (CSS) | Use custom CSS |

## Recommendations

1. **Keep Text Short** - Button labels should be concise
2. **Use Clear CTAs** - "Learn More", "Apply Now", "Contact Us"
3. **Contrast Colors** - Ensure text color contrasts with background
4. **Test Links** - Verify all URLs work before publishing
5. **Use Custom Classes** - For styling consistency across site
6. **Consider Accessibility** - Ensure buttons are keyboard accessible

## Related Blocks

- **[core/group](core_group.md)** - Container for buttons
- **[core/paragraph](core_paragraph.md)** - Text with inline links
- **[core/search](core_search.md)** - Search form with button

## Further Reading

- [WordPress Button Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/buttons/)
- [Button Design Best Practices](https://www.nngroup.com/articles/button-ux/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/tutorials/forms/buttons/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation
**Instances in Current Site:** 89 DIVI buttons
**Conversion Priority:** HIGH - Important for CTAs
