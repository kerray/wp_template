# DIVI Shortcode: et_pb_tabs

## Overview
The Tabs module creates **tabbed content sections** where content is organized into multiple tabs that can be clicked to reveal different content. This is useful for organizing related information in a compact, organized manner. Each tab can contain any type of content including text, images, and other modules.

## Hierarchy
- **Parent:** `et_pb_column`
- **Children:** `et_pb_tab` (required - one or more)
- **Usage context:** Organizing content into collapsible/switchable sections

## Parameters

### Tab Styling Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `_builder_version` | string | "4.16" | Divi builder version | `_builder_version="4.16"` |
| `active_tab_background_color` | color | empty | Active tab background | `active_tab_background_color="#f0d118"` |
| `inactive_tab_background_color` | color | empty | Inactive tab background | `inactive_tab_background_color="#ffffff"` |
| `active_tab_text_color` | color | empty | Active tab text color | `active_tab_text_color="#2c3e50"` |
| `inactive_tab_text_color` | color | empty | Inactive tab text color | `inactive_tab_text_color="#666666"` |
| `tab_text_color` | color | empty | Default tab text color | `tab_text_color="#333333"` |

### Spacing Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `custom_padding` | dimension | empty | Content padding | `custom_padding="20px|20px|20px|20px|false|false"` |
| `custom_margin` | dimension | empty | Margin around tabs | `custom_margin="||20px||"` |

### Background Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `background_color` | color | empty | Tab container background | `background_color="#ffffff"` |
| `background_image` | URL | empty | Background image | `background_image="http://example.com/bg.jpg"` |

### Advanced Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `module_id` | string | empty | CSS ID | `module_id="content-tabs"` |
| `module_class` | string | empty | CSS classes | `module_class="custom-tabs"` |

## Real Usage Examples

### Example 1: Simple Content Tabs (Events Page)
```
[et_pb_tabs active_tab_background_color="#f0d118" _builder_version="4.16"]

  [et_pb_tab title="Všechny akce"]
    <p>[akce category="" pocet="5" wrapper="ol"]</p>
  [/et_pb_tab]

  [et_pb_tab title="AKCE ŠKOLKY"]
    <p>[akce cat="4" pocet="3"]</p>
  [/et_pb_tab]

  [et_pb_tab title="AKCE ŠKOLY"]
    <p>[akce cat="3" pocet="3"]</p>
  [/et_pb_tab]

  [et_pb_tab title="AKCE LYCEA"]
    <p>[akce cat="5" pocet="3"]</p>
  [/et_pb_tab]

[/et_pb_tabs]
```

### Example 2: Information Tabs with Text Content
```
[et_pb_tabs _builder_version="4.16"
  active_tab_background_color="#2c3e50"
  active_tab_text_color="#ffffff"
  inactive_tab_background_color="#f5f5f5"
  inactive_tab_text_color="#333333"
  custom_padding="20px|20px|20px|20px|false|false"]

  [et_pb_tab title="O Škole"]
    <h3>Naše Hodnoty</h3>
    <p>Waldorfská škola se zaměřuje na holistický rozvoj osobnosti...</p>
  [/et_pb_tab]

  [et_pb_tab title="Vzdělání"]
    <h3>Studijní Program</h3>
    <p>Náš program kombinuje tradici s inovací...</p>
  [/et_pb_tab]

  [et_pb_tab title="Přijetí"]
    <h3>Jak Se Přihlásit</h3>
    <p>Podání přihlášky je jednoduchý proces...</p>
  [/et_pb_tab]

[/et_pb_tabs]
```

### Example 3: Product/Feature Tabs
```
[et_pb_tabs _builder_version="4.16"
  background_color="#ffffff"
  active_tab_background_color="#27ae60"
  active_tab_text_color="#ffffff"
  custom_padding="30px|30px|30px|30px|false|false"
  custom_margin="||20px||"
  module_class="product-tabs"]

  [et_pb_tab title="Vlastnosti"]
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
      <li>Feature 3</li>
    </ul>
  [/et_pb_tab]

  [et_pb_tab title="Výhody"]
    <p>List of benefits goes here...</p>
  [/et_pb_tab]

  [et_pb_tab title="Cena"]
    <p>Pricing information here...</p>
  [/et_pb_tab]

[/et_pb_tabs]
```

### Example 4: Styled Tabs with Border
```
[et_pb_tabs _builder_version="4.16"
  background_color="#f9f9f9"
  active_tab_background_color="#f0d118"
  active_tab_text_color="#2c3e50"
  inactive_tab_background_color="#ffffff"
  inactive_tab_text_color="#666666"
  custom_padding="25px|25px|25px|25px|false|false"
  module_id="styled-tabs"
  module_class="border-tabs"]

  [et_pb_tab title="Sekce 1"]
    <h3>Obsah Sekce 1</h3>
    <p>Text content for section 1</p>
  [/et_pb_tab]

  [et_pb_tab title="Sekce 2"]
    <h3>Obsah Sekce 2</h3>
    <p>Text content for section 2</p>
  [/et_pb_tab]

  [et_pb_tab title="Sekce 3"]
    <h3>Obsah Sekce 3</h3>
    <p>Text content for section 3</p>
  [/et_pb_tab]

[/et_pb_tabs]
```

## Conversion Complexity
**Rating:** MEDIUM

**Reasoning:**
- Gutenberg doesn't have native tabs block
- Requires either:
  - Custom tabs block development
  - Third-party tabs block plugin
  - CSS/JS solution using headings and paragraphs
- Tab content is straightforward (just HTML)
- Styling parameters are relatively simple
- Tab switching functionality requires JavaScript
- Moderately complex to implement but well-understood pattern
- Could use existing tab block plugins as fallback

## Notes
- Tabs container uses `et_pb_tabs` shortcode
- Each individual tab is wrapped in `et_pb_tab` shortcode
- `active_tab_background_color` and `active_tab_text_color` control the currently selected tab appearance
- `inactive_tab_*` colors control non-selected tabs
- Tabs are displayed with borders by default
- The first tab (or specified active tab) is shown by default
- Tab content can contain:
  - Plain text and HTML
  - Images and media
  - Custom shortcodes like `[akce]` (used on this site)
  - Nested modules (with limitations)
- **On this site:** Used primarily for event listings with custom `[akce]` shortcode
- Fifth most used module (12 instances) - specialized use case
- Tab navigation is handled by JavaScript - labels are clickable
- Each `et_pb_tab` takes a `title` parameter for the tab label
- Tab content goes **inside** the `[et_pb_tab]` tags
- Responsive design considerations:
  - Tabs typically stack vertically on mobile
  - Tab labels may need to resize or truncate
  - Consider long tab names for small screens
- Custom classes can be used to target specific tabs via CSS
- Mobile-specific styling may be needed for smaller screens
- Consider accessibility: ensure keyboard navigation and screen reader compatibility
