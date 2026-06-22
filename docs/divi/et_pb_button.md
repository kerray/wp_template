# DIVI Shortcode: et_pb_button

## Overview
The Button module creates **styled call-to-action buttons**. It's a simple module that wraps HTML button elements with comprehensive styling options including colors, sizes, hover effects, and animations. Buttons are essential for guiding user interactions and conversions.

## Hierarchy
- **Parent:** `et_pb_column`
- **Children:** None (self-contained)
- **Usage context:** Creating clickable CTAs, navigation buttons, action prompts

## Parameters

### Content Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `_builder_version` | string | "4.16" | Divi builder version | `_builder_version="4.16"` |
| `button_text` | text | "Click Here" | Button label text | `button_text="Zjistit Více"` |
| `button_url` | URL | empty | Link destination | `button_url="/programs/"` |
| `url_new_window` | yes/no | "off" | Open in new tab | `url_new_window="on"` |

### Button Styling Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `button_text_color` | color | "#ffffff" | Button text color | `button_text_color="#ffffff"` |
| `button_text_color_hover` | color | empty | Text color on hover | `button_text_color_hover="#f0d118"` |
| `button_bg_color` | color | "#2c3e50" | Button background color | `button_bg_color="#2c3e50"` |
| `button_bg_color_hover` | color | empty | Background color on hover | `button_bg_color_hover="#1a252f"` |
| `button_border_color` | color | empty | Border color | `button_border_color="#2c3e50"` |
| `button_border_color_hover` | color | empty | Border color on hover | `button_border_color_hover="#1a252f"` |

### Button Size & Shape Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `button_text_size` | dimension | "20px" | Button text size | `button_text_size="18px"` |
| `button_text_size_tablet` | dimension | empty | Mobile text size | `button_text_size_tablet="16px"` |
| `button_text_size_phone` | dimension | empty | Phone text size | `button_text_size_phone="14px"` |
| `button_font` | string | empty | Font family | `button_font="Montserrat|700"` |
| `button_letter_spacing` | dimension | "0px" | Letter spacing | `button_letter_spacing="1px"` |
| `button_padding` | dimension | empty | Internal padding | `button_padding="15px|40px|15px|40px"` |
| `button_border_radius` | dimension | "3px" | Rounded corners | `button_border_radius="3px"` |
| `button_border_width` | dimension | "0px" | Border thickness | `button_border_width="2px"` |

### Button Alignment & Layout
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `button_alignment` | string | "left" | Button position (left, center, right, justified) | `button_alignment="center"` |

### Spacing Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `custom_margin` | dimension | empty | Custom margin around button | `custom_margin="||20px||"` |
| `custom_padding` | dimension | empty | Custom padding | `custom_padding="10px|10px|10px|10px|false|false"` |

### Advanced Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `module_id` | string | empty | CSS ID | `module_id="cta-button"` |
| `module_class` | string | empty | CSS classes | `module_class="action-button"` |

## Real Usage Examples

### Example 1: Simple Action Button
```
[et_pb_button button_url="/programs/"
  button_text="Objednat Přihlášku"
  _builder_version="4.16"
  button_bg_color="#2c3e50"
  button_text_color="#ffffff"]
[/et_pb_button]
```

### Example 2: Large Centered CTA Button
```
[et_pb_button button_url="/contact/"
  button_text="Kontaktujte Nás"
  url_new_window="off"
  _builder_version="4.16"
  button_alignment="center"
  button_bg_color="#f0d118"
  button_text_color="#2c3e50"
  button_text_size="18px"
  button_border_radius="5px"
  button_padding="15px|40px|15px|40px|false|false"
  button_text_color_hover="#ffffff"
  button_bg_color_hover="#2c3e50"
  custom_margin="||20px||"]
[/et_pb_button]
```

### Example 3: Link-Style Button
```
[et_pb_button button_url="/learn-more/"
  button_text="Zjistit Více"
  _builder_version="4.16"
  button_alignment="left"
  button_bg_color="rgba(0,0,0,0)"
  button_text_color="#2c3e50"
  button_border_color="#2c3e50"
  button_border_width="2px"
  button_border_radius="3px"
  button_text_color_hover="#f0d118"
  button_border_color_hover="#f0d118"]
[/et_pb_button]
```

### Example 4: Button with External Link (New Window)
```
[et_pb_button button_url="https://www.external-site.com"
  button_text="Navštívit Partnerský Web"
  url_new_window="on"
  _builder_version="4.16"
  button_bg_color="#27ae60"
  button_text_color="#ffffff"
  button_text_size="16px"
  button_padding="12px|35px|12px|35px|false|false"
  button_alignment="center"]
[/et_pb_button]
```

### Example 5: Multi-variant Button Styling
```
[et_pb_button button_url="/apply/"
  button_text="Přihlášit Se Nyní"
  _builder_version="4.16"
  button_alignment="center"
  button_bg_color="#2c3e50"
  button_text_color="#ffffff"
  button_text_size="18px"
  button_text_size_tablet="16px"
  button_text_size_phone="14px"
  button_border_radius="5px"
  button_padding="15px|50px|15px|50px|false|false"
  button_text_color_hover="#f0d118"
  button_bg_color_hover="#1a252f"
  custom_margin="||20px||"
  module_class="primary-cta"]
[/et_pb_button]
```

## Conversion Complexity
**Rating:** LOW

**Reasoning:**
- Maps directly to Gutenberg `core/button` block
- Simple parameter structure
- Styling converts to CSS or block attributes
- No complex layout or nested elements
- Straightforward link handling
- Easy to test and validate
- One of the simplest modules to convert

## Notes
- `button_url` can be:
  - Relative path: `/programs/`
  - Absolute URL: `https://example.com`
  - Email: `mailto:info@example.com`
  - Phone: `tel:+420541234567`
  - Anchor: `#section-id`
- **Font format:** `FontName|Weight` (e.g., `Montserrat|700`)
- Text size can have different values for desktop (`button_text_size`), tablet (`button_text_size_tablet`), and phone (`button_text_size_phone`)
- `button_alignment` only affects button position within its container
- Default padding is typically `"15px|40px|15px|40px"` (top|right|bottom|left)
- Border radius of `0px` creates sharp corners, higher values create more rounded buttons
- Hover states should be preserved for user experience
- Third most common module (89 instances) - moderate volume
- Usually appears as single buttons or small groups
- Text should be concise and action-oriented (e.g., "Apply Now", "Learn More", "Contact Us")
- Button styling is critical for visual hierarchy and user engagement
- Consider button variants (primary, secondary, danger) during conversion
- Mobile responsiveness via `button_text_size_tablet` and `button_text_size_phone` should be preserved
- Links should be validated during conversion to ensure no broken references
