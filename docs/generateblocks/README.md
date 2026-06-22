# GenerateBlocks v2.x Documentation

## Overview

Documentation for **GenerateBlocks v2.1.2** (free) and **GenerateBlocks Pro v2.4.0** for creating WordPress block content programmatically.

## Installed Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| GenerateBlocks | 2.1.2 | Core blocks (element, text, media, query) |
| GenerateBlocks Pro | 2.4.0 | Advanced blocks (tabs, accordion, navigation) |

## Block Reference

### FREE Blocks (generateblocks/)

| Block Name | Title | Purpose |
|------------|-------|---------|
| `generateblocks/element` | Container | Flexible HTML container |
| `generateblocks/text` | Text | Text with flexible HTML tags |
| `generateblocks/media` | Image | Images |
| `generateblocks/shape` | Shape | SVG shapes and icons |
| `generateblocks/query` | Query | Post query container |
| `generateblocks/looper` | Looper | Iterates query results |
| `generateblocks/loop-item` | Loop Item | Single item in loop |
| `generateblocks/query-no-results` | No Results | Empty query fallback |
| `generateblocks/query-page-numbers` | Page Numbers | Pagination |

### PRO Blocks (generateblocks-pro/)

| Block Name | Title | Purpose |
|------------|-------|---------|
| `generateblocks-pro/tabs` | Tabs | Tabbed content |
| `generateblocks-pro/tabs-menu` | Tabs Menu | Tab buttons container |
| `generateblocks-pro/tab-items` | Tab Items | Tab panels container |
| `generateblocks-pro/tab-item` | Tab Item | Individual tab panel |
| `generateblocks-pro/tab-menu-item` | Tab Menu Item | Individual tab button |
| `generateblocks-pro/accordion` | Accordion | Collapsible sections |
| `generateblocks-pro/accordion-item` | Accordion Item | Single accordion section |
| `generateblocks-pro/accordion-toggle` | Accordion Toggle | Clickable header |
| `generateblocks-pro/accordion-content` | Accordion Content | Collapsible content |
| `generateblocks-pro/accordion-toggle-icon` | Toggle Icon | Open/close icon |
| `generateblocks-pro/navigation` | Navigation | Menu container |
| `generateblocks-pro/site-header` | Site Header | Header container |
| `generateblocks-pro/menu-toggle` | Menu Toggle | Mobile menu button |

## Common Attributes

Every block has these attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `uniqueId` | string | "" | Unique identifier for CSS targeting |
| `tagName` | string | "" | HTML element type |
| `styles` | object | {} | All CSS styling |
| `css` | string | "" | Custom CSS code |
| `globalClasses` | array | [] | CSS class names |
| `htmlAttributes` | object | {} | Custom HTML attributes |

## The `styles` Object

All styling uses the `styles` object. See [styles-object.md](styles-object.md) for complete reference.

### Basic Structure

```json
{
  "styles": {
    "backgroundColor": "#ffffff",
    "padding": "20px",
    "display": "flex",
    "gap": "1em",

    "@media (max-width:1024px)": {
      "padding": "15px"
    },
    "@media (max-width:767px)": {
      "padding": "10px"
    },

    "&:hover": {
      "backgroundColor": "#f0f0f0"
    }
  }
}
```

### Responsive Breakpoints

| At-Rule | Breakpoint |
|---------|------------|
| (default) | Desktop |
| `@media (max-width:1024px)` | Tablet |
| `@media (max-width:767px)` | Mobile |

## Element Block

Container block supporting multiple HTML tags.

**Supported tagNames:** `div`, `section`, `article`, `aside`, `header`, `footer`, `nav`, `main`, `figure`, `a`, `ul`, `ol`, `li`, `dl`, `dt`, `dd`

```html
<!-- wp:generateblocks/element {"tagName":"section","uniqueId":"hero","styles":{"backgroundColor":"#1a1a1a","padding":"60px 40px","@media (max-width:767px)":{"padding":"30px 20px"}}} -->
<section class="gb-element gb-element-hero">
  <!-- inner blocks -->
</section>
<!-- /wp:generateblocks/element -->
```

## Text Block

Text element with flexible HTML tags and optional icons.

**Supported tagNames:** `p`, `span`, `div`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `a`, `button`, `figcaption`, `li`

**Additional attributes:**
- `content` (rich-text) - The text content
- `icon` (string) - SVG icon HTML
- `iconLocation` (string) - "before" or "after"
- `iconOnly` (boolean) - Show only icon

### Paragraph
```html
<!-- wp:generateblocks/text {"tagName":"p","uniqueId":"intro","styles":{"fontSize":"18px","lineHeight":"1.6","color":"#333"}} -->
<p class="gb-text gb-text-intro">Your paragraph text here.</p>
<!-- /wp:generateblocks/text -->
```

### Heading
```html
<!-- wp:generateblocks/text {"tagName":"h2","uniqueId":"title","styles":{"fontSize":"36px","fontWeight":"700","color":"#1a1a1a","marginBottom":"20px"}} -->
<h2 class="gb-text gb-text-title">Section Title</h2>
<!-- /wp:generateblocks/text -->
```

### Button (as link)
```html
<!-- wp:generateblocks/text {"tagName":"a","uniqueId":"cta","htmlAttributes":{"href":"/contact"},"styles":{"backgroundColor":"#0066cc","color":"#ffffff","padding":"14px 28px","borderRadius":"4px","display":"inline-block","textDecoration":"none","fontWeight":"600","&:hover":{"backgroundColor":"#0052a3"}}} -->
<a href="/contact" class="gb-text gb-text-cta">Contact Us</a>
<!-- /wp:generateblocks/text -->
```

## Media Block

Image element.

**Supported tagNames:** `img`

**Additional attributes:**
- `mediaId` (number) - WordPress media library ID
- `linkHtmlAttributes` (object) - Wrapper link attributes

```html
<!-- wp:generateblocks/media {"uniqueId":"hero-img","mediaId":123,"styles":{"width":"100%","height":"auto","objectFit":"cover","borderRadius":"8px"}} -->
<img class="gb-media gb-media-hero-img" src="" alt=""/>
<!-- /wp:generateblocks/media -->
```

## Grid Layout

Use `generateblocks/element` with CSS Grid styles:

```html
<!-- wp:generateblocks/element {"tagName":"div","uniqueId":"grid","styles":{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"2em","@media (max-width:1024px)":{"gridTemplateColumns":"repeat(2, 1fr)"},"@media (max-width:767px)":{"gridTemplateColumns":"1fr"}}} -->
<div class="gb-element gb-element-grid">
  <!-- wp:generateblocks/element {"uniqueId":"col-1"} -->
  <div class="gb-element gb-element-col-1"><!-- content --></div>
  <!-- /wp:generateblocks/element -->

  <!-- wp:generateblocks/element {"uniqueId":"col-2"} -->
  <div class="gb-element gb-element-col-2"><!-- content --></div>
  <!-- /wp:generateblocks/element -->

  <!-- wp:generateblocks/element {"uniqueId":"col-3"} -->
  <div class="gb-element gb-element-col-3"><!-- content --></div>
  <!-- /wp:generateblocks/element -->
</div>
<!-- /wp:generateblocks/element -->
```

## Flexbox Layout

```html
<!-- wp:generateblocks/element {"tagName":"div","uniqueId":"flex","styles":{"display":"flex","flexWrap":"wrap","alignItems":"center","justifyContent":"space-between","gap":"1.5em"}} -->
<div class="gb-element gb-element-flex">
  <!-- child blocks -->
</div>
<!-- /wp:generateblocks/element -->
```

## Tabs (Pro)

Required hierarchy:
```
tabs
├── tabs-menu
│   └── tab-menu-item (repeatable)
└── tab-items
    └── tab-item (repeatable)
```

**tab-item attributes:**
- `tabItemOpen` (boolean) - Is this tab active

**tab-menu-item attributes:**
- `tabItemOpen` (boolean) - Is this tab button active

```html
<!-- wp:generateblocks-pro/tabs {"uniqueId":"my-tabs"} -->
<div class="gb-tabs gb-tabs-my-tabs">
  <!-- wp:generateblocks-pro/tabs-menu {"uniqueId":"tabs-nav","tagName":"nav","styles":{"display":"flex","gap":"0"}} -->
  <nav class="gb-tabs-menu gb-tabs-menu-tabs-nav">
    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"tab-btn-1","tabItemOpen":true,"tagName":"button","styles":{"padding":"12px 24px","backgroundColor":"#0066cc","color":"#fff"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-tab-btn-1">Tab 1</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"tab-btn-2","tabItemOpen":false,"tagName":"button","styles":{"padding":"12px 24px","backgroundColor":"#e0e0e0","color":"#333"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-tab-btn-2">Tab 2</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->
  </nav>
  <!-- /wp:generateblocks-pro/tabs-menu -->

  <!-- wp:generateblocks-pro/tab-items {"uniqueId":"tabs-content"} -->
  <div class="gb-tab-items gb-tab-items-tabs-content">
    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-1","tabItemOpen":true,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item gb-tab-item-panel-1">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Tab 1 content</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-2","tabItemOpen":false,"styles":{"padding":"20px"}} -->
    <div class="gb-tab-item gb-tab-item-panel-2">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Tab 2 content</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->
  </div>
  <!-- /wp:generateblocks-pro/tab-items -->
</div>
<!-- /wp:generateblocks-pro/tabs -->
```

## Accordion (Pro)

Required hierarchy:
```
accordion
└── accordion-item (repeatable)
    ├── accordion-toggle
    │   └── accordion-toggle-icon (optional)
    └── accordion-content
```

**accordion-item attributes:**
- `openByDefault` (boolean) - Start expanded

**accordion-toggle-icon attributes:**
- `openIcon` (string) - SVG for open state
- `closeIcon` (string) - SVG for closed state

```html
<!-- wp:generateblocks-pro/accordion {"uniqueId":"faq"} -->
<div class="gb-accordion gb-accordion-faq">
  <!-- wp:generateblocks-pro/accordion-item {"uniqueId":"item-1","openByDefault":true} -->
  <div class="gb-accordion-item gb-accordion-item-item-1">
    <!-- wp:generateblocks-pro/accordion-toggle {"uniqueId":"toggle-1","tagName":"button","styles":{"display":"flex","justifyContent":"space-between","width":"100%","padding":"16px","backgroundColor":"#f5f5f5","border":"none","cursor":"pointer"}} -->
    <button class="gb-accordion-toggle gb-accordion-toggle-toggle-1">
      <!-- wp:generateblocks/text {"tagName":"span"} -->
      <span class="gb-text">Question 1?</span>
      <!-- /wp:generateblocks/text -->
    </button>
    <!-- /wp:generateblocks-pro/accordion-toggle -->

    <!-- wp:generateblocks-pro/accordion-content {"uniqueId":"content-1","styles":{"padding":"16px"}} -->
    <div class="gb-accordion-content gb-accordion-content-content-1">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Answer to question 1.</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/accordion-content -->
  </div>
  <!-- /wp:generateblocks-pro/accordion-item -->
</div>
<!-- /wp:generateblocks-pro/accordion -->
```

## Query Loop

Required hierarchy:
```
query
├── looper
│   └── loop-item (template, repeats for each post)
├── query-no-results (optional)
└── query-page-numbers (optional)
```

**query attributes:**
- `query` (object) - WP_Query parameters
- `queryType` (string) - "WP_Query" or "instant"
- `paginationType` (string) - "standard" or "instant"
- `inheritQuery` (boolean) - Use archive query

```html
<!-- wp:generateblocks/query {"uniqueId":"posts","query":{"post_type":"post","posts_per_page":6,"orderby":"date","order":"DESC"}} -->
<div class="gb-query gb-query-posts">
  <!-- wp:generateblocks/looper {"uniqueId":"loop","tagName":"div","styles":{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"2em"}} -->
  <div class="gb-looper gb-looper-loop">
    <!-- wp:generateblocks/loop-item {"uniqueId":"post","tagName":"article"} -->
    <article class="gb-loop-item gb-loop-item-post">
      <!-- wp:generateblocks/media {"uniqueId":"thumb"} /-->
      <!-- wp:generateblocks/text {"tagName":"h3"} -->
      <h3 class="gb-text">Post Title</h3>
      <!-- /wp:generateblocks/text -->
    </article>
    <!-- /wp:generateblocks/loop-item -->
  </div>
  <!-- /wp:generateblocks/looper -->

  <!-- wp:generateblocks/query-no-results -->
  <!-- wp:generateblocks/text {"tagName":"p"} -->
  <p class="gb-text">No posts found.</p>
  <!-- /wp:generateblocks/text -->
  <!-- /wp:generateblocks/query-no-results -->

  <!-- wp:generateblocks/query-page-numbers {"uniqueId":"pagination","midSize":3} /-->
</div>
<!-- /wp:generateblocks/query -->
```

## Documentation Files

| File | Description |
|------|-------------|
| [README.md](README.md) | This overview |
| [styles-object.md](styles-object.md) | Complete styles reference |
| [CONVERSION_MATRIX.md](CONVERSION_MATRIX.md) | DIVI to GenerateBlocks mapping |
| [tabs-block.md](tabs-block.md) | Tabs documentation |

---

**GenerateBlocks:** 2.1.2
**GenerateBlocks Pro:** 2.4.0
**Updated:** December 2025
