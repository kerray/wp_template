# GenerateBlocks Pro Tabs Block (v2.x)

## Overview

The tabs block in GenerateBlocks Pro v2.4.0 provides tabbed content panels. It requires a specific block hierarchy.

## Block Hierarchy

```
generateblocks-pro/tabs
├── generateblocks-pro/tabs-menu
│   └── generateblocks-pro/tab-menu-item (repeatable)
└── generateblocks-pro/tab-items
    └── generateblocks-pro/tab-item (repeatable)
```

## Block Attributes

### tabs

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier |
| `tagName` | string | "" | div, section, aside, nav, ul, ol, li |
| `styles` | object | {} | CSS styling |
| `css` | string | "" | Custom CSS |
| `globalClasses` | array | [] | CSS classes |
| `htmlAttributes` | object | {} | HTML attributes |
| `showTemplateSelector` | boolean | false | UI template selector |

### tabs-menu

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier |
| `tagName` | string | "" | div, section, aside, nav, ul, ol, li |
| `styles` | object | {} | CSS styling |
| `css` | string | "" | Custom CSS |
| `globalClasses` | array | [] | CSS classes |
| `htmlAttributes` | object | {} | HTML attributes |

### tab-menu-item

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier |
| `tagName` | string | "" | div, button, ul, ol, li |
| `tabItemOpen` | boolean | false | **Is this tab active** |
| `styles` | object | {} | CSS styling |
| `css` | string | "" | Custom CSS |
| `globalClasses` | array | [] | CSS classes |
| `htmlAttributes` | object | {} | HTML attributes |

### tab-items

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier |
| `tagName` | string | "" | div, section, aside, nav, ul, ol, li |
| `styles` | object | {} | CSS styling |
| `css` | string | "" | Custom CSS |
| `globalClasses` | array | [] | CSS classes |
| `htmlAttributes` | object | {} | HTML attributes |

### tab-item

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier |
| `tagName` | string | "" | div, ul, ol, li |
| `tabItemOpen` | boolean | false | **Is this panel active** |
| `styles` | object | {} | CSS styling |
| `css` | string | "" | Custom CSS |
| `globalClasses` | array | [] | CSS classes |
| `htmlAttributes` | object | {} | HTML attributes |

## Active Tab Synchronization

The `tabItemOpen` attribute must be synchronized:
- Set `tabItemOpen: true` on the active `tab-menu-item`
- Set `tabItemOpen: true` on the corresponding `tab-item`
- All other tabs should have `tabItemOpen: false`

## Basic Example

```html
<!-- wp:generateblocks-pro/tabs {"uniqueId":"example-tabs"} -->
<div class="gb-tabs gb-tabs-example-tabs">
  <!-- wp:generateblocks-pro/tabs-menu {"uniqueId":"menu","tagName":"nav","styles":{"display":"flex","gap":"0","borderBottom":"2px solid #e0e0e0"}} -->
  <nav class="gb-tabs-menu gb-tabs-menu-menu">
    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"btn-1","tabItemOpen":true,"tagName":"button","styles":{"padding":"12px 24px","backgroundColor":"transparent","color":"#0066cc","border":"none","borderBottom":"2px solid #0066cc","marginBottom":"-2px","cursor":"pointer","fontWeight":"600"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-btn-1">First Tab</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"btn-2","tabItemOpen":false,"tagName":"button","styles":{"padding":"12px 24px","backgroundColor":"transparent","color":"#666","border":"none","borderBottom":"2px solid transparent","marginBottom":"-2px","cursor":"pointer"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-btn-2">Second Tab</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"btn-3","tabItemOpen":false,"tagName":"button","styles":{"padding":"12px 24px","backgroundColor":"transparent","color":"#666","border":"none","borderBottom":"2px solid transparent","marginBottom":"-2px","cursor":"pointer"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-btn-3">Third Tab</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->
  </nav>
  <!-- /wp:generateblocks-pro/tabs-menu -->

  <!-- wp:generateblocks-pro/tab-items {"uniqueId":"panels"} -->
  <div class="gb-tab-items gb-tab-items-panels">
    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-1","tabItemOpen":true,"styles":{"padding":"24px"}} -->
    <div class="gb-tab-item gb-tab-item-panel-1">
      <!-- wp:generateblocks/text {"tagName":"h3","styles":{"marginBottom":"12px"}} -->
      <h3 class="gb-text">First Tab Content</h3>
      <!-- /wp:generateblocks/text -->

      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">This is the content for the first tab panel.</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-2","tabItemOpen":false,"styles":{"padding":"24px"}} -->
    <div class="gb-tab-item gb-tab-item-panel-2">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Second tab content goes here.</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-3","tabItemOpen":false,"styles":{"padding":"24px"}} -->
    <div class="gb-tab-item gb-tab-item-panel-3">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Third tab content goes here.</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->
  </div>
  <!-- /wp:generateblocks-pro/tab-items -->
</div>
<!-- /wp:generateblocks-pro/tabs -->
```

## Styling Patterns

### Pill-Style Tabs

```json
{
  "styles": {
    "padding": "10px 20px",
    "backgroundColor": "#f0f0f0",
    "color": "#333",
    "borderRadius": "20px",
    "border": "none",
    "cursor": "pointer"
  }
}
```

Active pill tab:
```json
{
  "styles": {
    "padding": "10px 20px",
    "backgroundColor": "#0066cc",
    "color": "#ffffff",
    "borderRadius": "20px",
    "border": "none",
    "cursor": "pointer"
  }
}
```

### Boxed Tabs

```json
{
  "styles": {
    "padding": "12px 24px",
    "backgroundColor": "#ffffff",
    "color": "#333",
    "border": "1px solid #ddd",
    "borderBottom": "none",
    "borderRadius": "4px 4px 0 0",
    "marginBottom": "-1px",
    "cursor": "pointer"
  }
}
```

### Vertical Tabs

On the tabs-menu:
```json
{
  "styles": {
    "display": "flex",
    "flexDirection": "column",
    "width": "200px",
    "borderRight": "1px solid #e0e0e0"
  }
}
```

On the parent tabs container:
```json
{
  "styles": {
    "display": "flex",
    "flexDirection": "row"
  }
}
```

## Converting from DIVI

### DIVI Structure
```
[et_pb_tabs active_tab_background_color="#f0d118"]
  [et_pb_tab title="Tab 1"]Content[/et_pb_tab]
  [et_pb_tab title="Tab 2"]Content[/et_pb_tab]
[/et_pb_tabs]
```

### Conversion Notes

1. **All styling via `styles` object** - No direct color attributes like `activeTabBackground`
2. **Separate menu and content** - DIVI combines them, GenerateBlocks separates
3. **Manual active state** - Set `tabItemOpen: true` on both menu item and panel
4. **Tab titles become button content** - Not an attribute

### Converted Structure

```html
<!-- wp:generateblocks-pro/tabs {"uniqueId":"converted"} -->
<div class="gb-tabs gb-tabs-converted">
  <!-- Menu with styled buttons -->
  <!-- wp:generateblocks-pro/tabs-menu {"tagName":"nav","styles":{"display":"flex"}} -->
  <nav class="gb-tabs-menu">
    <!-- Active tab with DIVI's yellow background -->
    <!-- wp:generateblocks-pro/tab-menu-item {"tabItemOpen":true,"tagName":"button","styles":{"backgroundColor":"#f0d118","color":"#333","padding":"12px 20px","border":"none"}} -->
    <button class="gb-tab-menu-item">Tab 1</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- Inactive tab -->
    <!-- wp:generateblocks-pro/tab-menu-item {"tabItemOpen":false,"tagName":"button","styles":{"backgroundColor":"#e0e0e0","color":"#333","padding":"12px 20px","border":"none"}} -->
    <button class="gb-tab-menu-item">Tab 2</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->
  </nav>
  <!-- /wp:generateblocks-pro/tabs-menu -->

  <!-- Content panels -->
  <!-- wp:generateblocks-pro/tab-items -->
  <div class="gb-tab-items">
    <!-- wp:generateblocks-pro/tab-item {"tabItemOpen":true,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item">Content</div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"tabItemOpen":false,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item">Content</div>
    <!-- /wp:generateblocks-pro/tab-item -->
  </div>
  <!-- /wp:generateblocks-pro/tab-items -->
</div>
<!-- /wp:generateblocks-pro/tabs -->
```

## Site Example: Events Tabs

**Original DIVI:**
```
[et_pb_tabs active_tab_background_color="#f0d118"]
  [et_pb_tab title="Všechny akce"]
    <p>[akce category="" pocet="5" wrapper="ol"]</p>
  [/et_pb_tab]
  [et_pb_tab title="AKCE ŠKOLKY"]
    <p>[akce cat="4" pocet="3"]</p>
  [/et_pb_tab]
[/et_pb_tabs]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks-pro/tabs {"uniqueId":"events"} -->
<div class="gb-tabs gb-tabs-events">
  <!-- wp:generateblocks-pro/tabs-menu {"tagName":"nav","styles":{"display":"flex"}} -->
  <nav class="gb-tabs-menu">
    <!-- wp:generateblocks-pro/tab-menu-item {"tabItemOpen":true,"tagName":"button","styles":{"backgroundColor":"#f0d118","color":"#333","padding":"12px 20px","border":"none"}} -->
    <button class="gb-tab-menu-item">Všechny akce</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- wp:generateblocks-pro/tab-menu-item {"tabItemOpen":false,"tagName":"button","styles":{"backgroundColor":"#e0e0e0","color":"#333","padding":"12px 20px","border":"none"}} -->
    <button class="gb-tab-menu-item">AKCE ŠKOLKY</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->
  </nav>
  <!-- /wp:generateblocks-pro/tabs-menu -->

  <!-- wp:generateblocks-pro/tab-items -->
  <div class="gb-tab-items">
    <!-- wp:generateblocks-pro/tab-item {"tabItemOpen":true,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item">
      <!-- wp:shortcode -->
      [akce category="" pocet="5" wrapper="ol"]
      <!-- /wp:shortcode -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"tabItemOpen":false,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item">
      <!-- wp:shortcode -->
      [akce cat="4" pocet="3"]
      <!-- /wp:shortcode -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->
  </div>
  <!-- /wp:generateblocks-pro/tab-items -->
</div>
<!-- /wp:generateblocks-pro/tabs -->
```

## Responsive Considerations

### Stack on Mobile

Apply to tabs-menu:
```json
{
  "styles": {
    "display": "flex",
    "flexDirection": "row",
    "@media (max-width:767px)": {
      "flexDirection": "column"
    }
  }
}
```

### Scroll on Mobile

Apply to tabs-menu:
```json
{
  "styles": {
    "display": "flex",
    "overflowX": "auto",
    "WebkitOverflowScrolling": "touch",
    "@media (max-width:767px)": {
      "flexWrap": "nowrap"
    }
  }
}
```

## Accessibility

- Use `tagName: "button"` for tab-menu-items
- Use `tagName: "nav"` for tabs-menu
- GenerateBlocks Pro handles ARIA attributes automatically

---

**GenerateBlocks Pro:** 2.4.0
**Updated:** December 2025
