# DIVI Shortcode: et_pb_text

## Overview
The Text module is a **content container** for all text-based content including paragraphs, headings, lists, quotes, and formatted text. It's the simplest and most frequently used content module, essentially wrapping HTML text content with DIVI styling options.

## Hierarchy
- **Parent:** `et_pb_column`
- **Children:** None (contains raw HTML content)
- **Usage context:** Used for displaying text content within columns

## Parameters

### Content Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `_builder_version` | string | "4.16" | Divi builder version | `_builder_version="4.16"` |
| `text_font_size` | dimension | "14px" | Font size for paragraph text | `text_font_size="16px"` |
| `text_text_color` | color | empty | Text color (hex or rgba) | `text_text_color="#333333"` |
| `text_line_height` | dimension | "1.7em" | Line height for readability | `text_line_height="1.8em"` |

### Heading Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `header_font_size` | dimension | "32px" | Heading font size | `header_font_size="38px"` |
| `header_text_color` | color | empty | Heading text color | `header_text_color="#ffffff"` |
| `header_font_family` | string | empty | Font family for headings | `header_font_family="Open Sans"` |
| `header_letter_spacing` | dimension | "0px" | Letter spacing in headings | `header_letter_spacing="1px"` |

### Text Effects Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `text_text_shadow_style` | string | "none" | Text shadow preset | `text_text_shadow_style="preset3"` |
| `text_text_shadow_color` | color | empty | Text shadow color | `text_text_shadow_color="#000000"` |
| `text_text_shadow_blur_strength` | dimension | "3px" | Shadow blur amount | `text_text_shadow_blur_strength="3px"` |

### Text Alignment Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `text_text_align` | string | "left" | Text alignment (left, center, right, justified) | `text_text_align="center"` |
| `text_text_orientation` | string | "left" | Alternative text orientation setting | `text_text_orientation="left"` |

### Spacing Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `custom_padding` | dimension | empty | Custom padding | `custom_padding="10px|10px|10px|10px|false|false"` |
| `custom_margin` | dimension | empty | Custom margin | `custom_margin="||20px||"` |

### Advanced Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `module_id` | string | empty | CSS ID for styling | `module_id="intro-text"` |
| `module_class` | string | empty | CSS classes | `module_class="highlighted-text"` |

## Real Usage Examples

### Example 1: Simple Heading with Subtitle
```
[et_pb_text _builder_version="4.16"
  header_text_color="#ffffff"
  header_font_size="38px"
  text_text_color="#ffffff"
  text_font_size="16px"]

  <h1 style="text-align: center;">EXAMPLE SITE</h1>

[/et_pb_text]
```

### Example 2: Article Text with Custom Styling
```
[et_pb_text _builder_version="4.16"
  text_text_color="#333333"
  text_font_size="16px"
  text_line_height="1.8em"
  header_font_size="28px"
  header_text_color="#2c3e50"
  custom_padding="20px|20px|20px|20px|false|false"
  module_class="article-text"]

  <h2>Naše Historie</h2>
  <p>Example Site byla založena v roce...</p>
  <p>Naši pedagogové se řídí principy moderní pedagogiky...</p>

[/et_pb_text]
```

### Example 3: Centered Text with Text Shadow (Hero Section)
```
[et_pb_text _builder_version="4.16"
  text_text_color="#ffffff"
  header_text_color="#ffffff"
  header_font_size="48px"
  text_text_shadow_style="preset3"
  text_text_shadow_color="#000000"
  text_text_align="center"
  custom_padding="40px|40px|40px|40px|false|false"]

  <h1>Vitajte na Example Site</h1>
  <p>Zaměřujeme se na holistický rozvoj dítěte</p>

[/et_pb_text]
```

### Example 4: Bulleted List
```
[et_pb_text _builder_version="4.16"
  text_text_color="#333333"
  text_font_size="15px"
  custom_padding="15px|15px|15px|15px|false|false"]

  <h3>Naše Hodnoty:</h3>
  <ul>
    <li>Individuální přístup k žákům</li>
    <li>Rozvoj tvůrčích schopností</li>
    <li>Zdravý životní styl</li>
    <li>Mezikulturní toleranci</li>
  </ul>

[/et_pb_text]
```

### Example 5: Mixed Content with Heading and Paragraph
```
[et_pb_text _builder_version="4.16"
  header_text_color="#2c3e50"
  header_font_size="32px"
  text_text_color="#444444"
  text_font_size="14px"
  text_line_height="1.6em"]

  <h2>Kontaktujte nás</h2>
  <p>Email: info@example.com<br />
     Telefon: +420 541 234 567<br />
     Adresa: Example Street 15, 613 00 Brno</p>

[/et_pb_text]
```

### Example 6: Blockquote with Special Styling
```
[et_pb_text _builder_version="4.16"
  text_text_color="#555555"
  text_font_size="16px"
  text_line_height="1.8em"
  custom_padding="20px|20px|20px|20px|false|false"
  custom_margin="||20px||"
  module_class="blockquote-style"]

  <blockquote>
    <p><em>"Cílem vzdělání není nacpávat hlavu znalostmi,
    ale naučit ji myslet."</em></p>
    <p>— Example Site</p>
  </blockquote>

[/et_pb_text]
```

## Conversion Complexity
**Rating:** LOW

**Reasoning:**
- Maps directly to Gutenberg `core/paragraph`, `core/heading`, `core/list` blocks
- HTML content is preserved as-is (easily transferable)
- Text styling parameters convert to CSS or block attributes
- No complex layout or JavaScript required
- Straightforward parameter mapping to CSS properties
- One of the easiest modules to convert to Gutenberg
- HTML structure inside the module is standard and well-supported
- Highest volume conversion but lowest complexity

## Notes
- The shortcode wraps **raw HTML content** - HTML structure is preserved exactly
- Text alignment and orientation parameters may be redundant (both control same property)
- `text_text_shadow_style="preset3"` uses DIVI's preset shadow styles (preset1, preset2, preset3, etc.)
- Font sizes specified in pixels but can include units like em, rem, %
- Line height can be specified with or without units (numbers like 1.7 or 1.7em)
- Text color supports:
  - Hex colors: `#ffffff`
  - RGB: `rgb(255,255,255)`
  - RGBA: `rgba(255,255,255,0.9)`
  - Named colors: `white`, `black`, etc.
- Most frequently used content module (891 instances) - **HIGH VOLUME CONVERSION**
- Contains actual page content - **CRITICAL TO PRESERVE ACCURATELY**
- Responsive text sizing (_tablet, _phone variants) may include different font sizes for mobile
- Many instances contain just `<h1>`, `<h2>`, etc. without complex styling
- Custom CSS classes should be checked for theme-specific styling rules
- Always wrap content text in semantic HTML tags (h1-h6, p, ul/ol, blockquote, etc.)
