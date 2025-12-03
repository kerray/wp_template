# DIVI → GenerateBlocks v2.x Conversion Matrix

Mapping of DIVI shortcodes to GenerateBlocks v2.x blocks.

## Block Name Reference

| DIVI | GenerateBlocks v2.x | Notes |
|------|---------------------|-------|
| `et_pb_section` | `generateblocks/element` | Use `tagName: "section"` |
| `et_pb_row` | `generateblocks/element` | Use CSS Grid or Flexbox in `styles` |
| `et_pb_column` | `generateblocks/element` | Child of grid/flex container |
| `et_pb_text` | `generateblocks/text` | Use appropriate `tagName` (p, h1-h6) |
| `et_pb_button` | `generateblocks/text` | Use `tagName: "a"` with button styles |
| `et_pb_image` | `generateblocks/media` | Uses `mediaId` for WP media |
| `et_pb_blurb` | `generateblocks/element` + children | Container with media + text |
| `et_pb_tabs` | `generateblocks-pro/tabs` | Pro block, requires hierarchy |
| `et_pb_tab` | `generateblocks-pro/tab-item` | Inside `tab-items` container |
| `et_pb_blog` | `generateblocks/query` | With looper + loop-item |

## Structural Elements

### Section → Element

**DIVI:**
```
[et_pb_section background_color="#ffffff" custom_padding="40px|20px|40px|20px"]
  ...
[/et_pb_section]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/element {"tagName":"section","uniqueId":"section-1","styles":{"backgroundColor":"#ffffff","padding":"40px 20px"}} -->
<section class="gb-element gb-element-section-1">
  <!-- inner blocks -->
</section>
<!-- /wp:generateblocks/element -->
```

### Row/Columns → Grid Element

**DIVI:**
```
[et_pb_row]
  [et_pb_column type="1_2"]...[/et_pb_column]
  [et_pb_column type="1_2"]...[/et_pb_column]
[/et_pb_row]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/element {"tagName":"div","uniqueId":"row-1","styles":{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"2em","@media (max-width:767px)":{"gridTemplateColumns":"1fr"}}} -->
<div class="gb-element gb-element-row-1">
  <!-- wp:generateblocks/element {"uniqueId":"col-1"} -->
  <div class="gb-element gb-element-col-1">
    <!-- column 1 content -->
  </div>
  <!-- /wp:generateblocks/element -->

  <!-- wp:generateblocks/element {"uniqueId":"col-2"} -->
  <div class="gb-element gb-element-col-2">
    <!-- column 2 content -->
  </div>
  <!-- /wp:generateblocks/element -->
</div>
<!-- /wp:generateblocks/element -->
```

### Column Ratios

| DIVI type | CSS gridTemplateColumns |
|-----------|------------------------|
| `1_2,1_2` | `1fr 1fr` |
| `1_3,1_3,1_3` | `repeat(3, 1fr)` |
| `1_4,1_4,1_4,1_4` | `repeat(4, 1fr)` |
| `2_3,1_3` | `2fr 1fr` |
| `1_3,2_3` | `1fr 2fr` |
| `1_4,3_4` | `1fr 3fr` |
| `3_4,1_4` | `3fr 1fr` |
| `1_4,1_2,1_4` | `1fr 2fr 1fr` |

## Content Modules

### Text → Text Block

**DIVI:**
```
[et_pb_text text_text_color="#333333"]
  <h2>Heading</h2>
  <p>Paragraph text.</p>
[/et_pb_text]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/text {"tagName":"h2","uniqueId":"heading-1","styles":{"color":"#333333","marginBottom":"16px"}} -->
<h2 class="gb-text gb-text-heading-1">Heading</h2>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"tagName":"p","uniqueId":"para-1","styles":{"color":"#333333"}} -->
<p class="gb-text gb-text-para-1">Paragraph text.</p>
<!-- /wp:generateblocks/text -->
```

### Button → Text Block (as link)

**DIVI:**
```
[et_pb_button button_text="Click Here" button_url="/page/"
  button_bg_color="#0066cc" button_text_color="#ffffff"]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/text {"tagName":"a","uniqueId":"btn-1","htmlAttributes":{"href":"/page/"},"styles":{"display":"inline-block","backgroundColor":"#0066cc","color":"#ffffff","padding":"12px 24px","borderRadius":"4px","textDecoration":"none","fontWeight":"600","&:hover":{"backgroundColor":"#0052a3"}}} -->
<a href="/page/" class="gb-text gb-text-btn-1">Click Here</a>
<!-- /wp:generateblocks/text -->
```

### Image → Media Block

**DIVI:**
```
[et_pb_image src="http://site.com/image.jpg" alt="Description" url="/link/"]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/media {"uniqueId":"img-1","mediaId":123,"htmlAttributes":{"alt":"Description"},"linkHtmlAttributes":{"href":"/link/"},"styles":{"width":"100%","height":"auto","borderRadius":"8px"}} -->
<a href="/link/"><img class="gb-media gb-media-img-1" src="" alt="Description"/></a>
<!-- /wp:generateblocks/media -->
```

### Blurb → Element with Children

**DIVI:**
```
[et_pb_blurb title="Feature Title"
  image="http://site.com/icon.png"
  url="/feature-page/"
  link_option_url="/feature-page/"]
  Description text here.
[/et_pb_blurb]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/element {"tagName":"div","uniqueId":"blurb-1","styles":{"display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","padding":"24px"}} -->
<div class="gb-element gb-element-blurb-1">
  <!-- wp:generateblocks/media {"uniqueId":"blurb-icon","mediaId":456,"styles":{"width":"64px","height":"64px","marginBottom":"16px"}} -->
  <img class="gb-media gb-media-blurb-icon" src="" alt=""/>
  <!-- /wp:generateblocks/media -->

  <!-- wp:generateblocks/text {"tagName":"h3","uniqueId":"blurb-title","styles":{"fontSize":"20px","fontWeight":"600","marginBottom":"12px"}} -->
  <h3 class="gb-text gb-text-blurb-title">Feature Title</h3>
  <!-- /wp:generateblocks/text -->

  <!-- wp:generateblocks/text {"tagName":"p","uniqueId":"blurb-desc","styles":{"color":"#666"}} -->
  <p class="gb-text gb-text-blurb-desc">Description text here.</p>
  <!-- /wp:generateblocks/text -->

  <!-- wp:generateblocks/text {"tagName":"a","uniqueId":"blurb-link","htmlAttributes":{"href":"/feature-page/"},"styles":{"color":"#0066cc","textDecoration":"none","&:hover":{"textDecoration":"underline"}}} -->
  <a href="/feature-page/" class="gb-text gb-text-blurb-link">Learn more</a>
  <!-- /wp:generateblocks/text -->
</div>
<!-- /wp:generateblocks/element -->
```

## Advanced Modules

### Tabs (Pro)

**DIVI:**
```
[et_pb_tabs active_tab_background_color="#f0d118"]
  [et_pb_tab title="Tab 1"]
    Tab 1 content
  [/et_pb_tab]
  [et_pb_tab title="Tab 2"]
    Tab 2 content
  [/et_pb_tab]
[/et_pb_tabs]
```

**GenerateBlocks Pro v2.x:**

Required hierarchy:
```
tabs
├── tabs-menu
│   └── tab-menu-item (for each tab)
└── tab-items
    └── tab-item (for each tab)
```

```html
<!-- wp:generateblocks-pro/tabs {"uniqueId":"tabs-1"} -->
<div class="gb-tabs gb-tabs-tabs-1">
  <!-- wp:generateblocks-pro/tabs-menu {"uniqueId":"tabs-nav","tagName":"nav","styles":{"display":"flex"}} -->
  <nav class="gb-tabs-menu gb-tabs-menu-tabs-nav">
    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"tab-btn-1","tabItemOpen":true,"tagName":"button","styles":{"padding":"12px 20px","backgroundColor":"#f0d118","color":"#333","border":"none"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-tab-btn-1">Tab 1</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->

    <!-- wp:generateblocks-pro/tab-menu-item {"uniqueId":"tab-btn-2","tabItemOpen":false,"tagName":"button","styles":{"padding":"12px 20px","backgroundColor":"#e0e0e0","color":"#333","border":"none"}} -->
    <button class="gb-tab-menu-item gb-tab-menu-item-tab-btn-2">Tab 2</button>
    <!-- /wp:generateblocks-pro/tab-menu-item -->
  </nav>
  <!-- /wp:generateblocks-pro/tabs-menu -->

  <!-- wp:generateblocks-pro/tab-items {"uniqueId":"tabs-content"} -->
  <div class="gb-tab-items gb-tab-items-tabs-content">
    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-1","tabItemOpen":true,"styles":{"padding":"20px","backgroundColor":"#fff"}} -->
    <div class="gb-tab-item gb-tab-item-panel-1">
      <!-- wp:generateblocks/text {"tagName":"p"} -->
      <p class="gb-text">Tab 1 content</p>
      <!-- /wp:generateblocks/text -->
    </div>
    <!-- /wp:generateblocks-pro/tab-item -->

    <!-- wp:generateblocks-pro/tab-item {"uniqueId":"panel-2","tabItemOpen":false,"styles":{"padding":"20px","backgroundColor":"#fff"}} -->
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

**Key attributes:**
- `tabItemOpen: true` on the active tab-menu-item AND tab-item
- All styling via `styles` object
- No `activeTabBackground` attribute - use `styles` on tab-menu-item

### Blog → Query Loop

**DIVI:**
```
[et_pb_blog posts_per_page="6" category="news" orderby="date"]
```

**GenerateBlocks v2.x:**
```html
<!-- wp:generateblocks/query {"uniqueId":"blog","query":{"post_type":"post","posts_per_page":6,"category_name":"news","orderby":"date","order":"DESC"}} -->
<div class="gb-query gb-query-blog">
  <!-- wp:generateblocks/looper {"uniqueId":"loop","tagName":"div","styles":{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"2em","@media (max-width:767px)":{"gridTemplateColumns":"1fr"}}} -->
  <div class="gb-looper gb-looper-loop">
    <!-- wp:generateblocks/loop-item {"uniqueId":"post","tagName":"article","styles":{"backgroundColor":"#fff","borderRadius":"8px","overflow":"hidden","boxShadow":"0 2px 8px rgba(0,0,0,0.1)"}} -->
    <article class="gb-loop-item gb-loop-item-post">
      <!-- wp:generateblocks/media {"uniqueId":"thumb","styles":{"width":"100%","height":"200px","objectFit":"cover"}} /-->

      <!-- wp:generateblocks/element {"uniqueId":"content","styles":{"padding":"20px"}} -->
      <div class="gb-element gb-element-content">
        <!-- wp:generateblocks/text {"tagName":"h3","styles":{"fontSize":"18px","marginBottom":"8px"}} -->
        <h3 class="gb-text">Post Title</h3>
        <!-- /wp:generateblocks/text -->

        <!-- wp:generateblocks/text {"tagName":"p","styles":{"fontSize":"14px","color":"#666"}} -->
        <p class="gb-text">Excerpt text...</p>
        <!-- /wp:generateblocks/text -->
      </div>
      <!-- /wp:generateblocks/element -->
    </article>
    <!-- /wp:generateblocks/loop-item -->
  </div>
  <!-- /wp:generateblocks/looper -->

  <!-- wp:generateblocks/query-page-numbers {"uniqueId":"pagination","midSize":2,"styles":{"marginTop":"2em","display":"flex","justifyContent":"center","gap":"8px"}} /-->
</div>
<!-- /wp:generateblocks/query -->
```

## Style Attribute Mapping

### DIVI → styles Object

| DIVI Attribute | styles Property |
|----------------|-----------------|
| `background_color` | `backgroundColor` |
| `text_text_color` | `color` |
| `custom_padding="T\|R\|B\|L"` | `padding` or `paddingTop`, etc. |
| `custom_margin="T\|R\|B\|L"` | `margin` or `marginTop`, etc. |
| `border_radii="on\|Tpx\|Rpx\|Bpx\|Lpx"` | `borderRadius` |
| `text_font_size` | `fontSize` |
| `text_line_height` | `lineHeight` |
| `text_letter_spacing` | `letterSpacing` |
| `text_text_align` | `textAlign` |
| `max_width` | `maxWidth` |
| `module_class` | `htmlAttributes.class` or `globalClasses` |

### Responsive Suffix Mapping

| DIVI Suffix | styles At-Rule |
|-------------|----------------|
| `_tablet` | `@media (max-width:1024px)` |
| `_phone` | `@media (max-width:767px)` |

**Example:**
```
custom_padding="40px|20px|40px|20px"
custom_padding_tablet="30px|15px|30px|15px"
custom_padding_phone="20px|10px|20px|10px"
```

Becomes:
```json
{
  "styles": {
    "padding": "40px 20px",
    "@media (max-width:1024px)": {
      "padding": "30px 15px"
    },
    "@media (max-width:767px)": {
      "padding": "20px 10px"
    }
  }
}
```

## Conversion Priority

| Priority | DIVI Module | Count | GenerateBlocks Block |
|----------|-------------|-------|---------------------|
| HIGH | `et_pb_section` | 485 | `generateblocks/element` |
| HIGH | `et_pb_row` | 712 | `generateblocks/element` (grid) |
| HIGH | `et_pb_column` | 1,203 | `generateblocks/element` |
| HIGH | `et_pb_text` | 891 | `generateblocks/text` |
| MEDIUM | `et_pb_blurb` | 156 | `generateblocks/element` + children |
| MEDIUM | `et_pb_button` | 89 | `generateblocks/text` (as link) |
| MEDIUM | `et_pb_image` | 67 | `generateblocks/media` |
| LOW | `et_pb_tabs` | 12 | `generateblocks-pro/tabs` |
| LOW | `et_pb_blog` | 8 | `generateblocks/query` |

## Features Without Direct Mapping

| DIVI Feature | Workaround |
|--------------|------------|
| Wave/divider shapes | SVG in `generateblocks/shape` or CSS |
| Parallax backgrounds | `backgroundAttachment: "fixed"` in styles |
| Video backgrounds | Custom HTML or separate video element |
| DIVI icon fonts | SVG icons via `generateblocks/shape` |
| Built-in animations | CSS animations via `css` attribute |

---

**GenerateBlocks:** 2.1.2
**GenerateBlocks Pro:** 2.4.0
**Updated:** December 2025
