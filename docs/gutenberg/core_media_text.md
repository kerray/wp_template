# Gutenberg Block: core/media-text

## Overview

The Media & Text block displays an **image or video alongside text content** in a flexible two-column layout. It's useful for creating feature boxes, testimonials, team member cards, and content sections with images. It partially replaces DIVI's Blurb module (which combines icon/image + text).

**DIVI Equivalent:** Partial equivalent to `et_pb_blurb` (image-based blurbs)

**Use Cases:**

- Feature boxes with images and descriptions
- Team member cards (image + name + bio)
- Service descriptions with icons/images
- Testimonials with author photos
- Content sections with side-by-side images and text

## Block Attributes

| Attribute           | Type    | Default  | Description                              | Example                          |
| ------------------- | ------- | -------- | ---------------------------------------- | -------------------------------- |
| `mediaId`           | number  | empty    | Media library image ID                   | `123`                            |
| `mediaUrl`          | string  | empty    | Image/video URL                          | `"http://example.com/image.jpg"` |
| `mediaPosition`     | string  | "left"   | Media placement (left, right)            | `"top"`                          |
| `mediaType`         | string  | "image"  | Media type (image, video)                | `"image"`                        |
| `mediaWidth`        | number  | 50       | Media width percentage                   | `40`                             |
| `verticalAlignment` | string  | "center" | Vertical alignment (top, center, bottom) | `"center"`                       |
| `imageFill`         | boolean | false    | Fill media container                     | `true`                           |
| `backgroundColor`   | string  | empty    | Block background color                   | `"light-gray"`                   |
| `className`         | string  | empty    | Custom CSS classes                       | `"feature-box"`                  |

## Mapping from DIVI

| DIVI Parameter               | Gutenberg Attribute            | Conversion Notes               |
| ---------------------------- | ------------------------------ | ------------------------------ |
| `image="url"`                | `mediaUrl` or `mediaId`        | Use media library ID preferred |
| `image_alt="text"`           | Add alt text to image          | Critical for accessibility     |
| `title="text"`               | Text block inside media-text   | Add heading for title          |
| `body="<p>text</p>"`         | Text block inside media-text   | Body content goes inside       |
| `icon_placement="top"`       | `mediaPosition="top"`          | For icon placement             |
| `icon_placement="left"`      | `mediaPosition="left"`         | Default placement              |
| `background_color="#f5f5f5"` | `backgroundColor="light-gray"` | Container background           |
| `text_orientation="center"`  | CSS text-align                 | Apply to text inside           |
| `custom_padding="20px\|..."` | CSS padding                    | Use custom class               |

## Block Markup Example

### Image Left, Text Right

```html
<!-- wp:media-text {
  "mediaId":123,
  "mediaPosition":"left"
} -->
<div class="wp-block-media-text alignwide">
  <figure class="wp-block-media-text__media">
    <img src="..." alt="..." class="wp-image-123" />
  </figure>
  <div class="wp-block-media-text__content">
    <h3>Feature Title</h3>
    <p>Feature description goes here.</p>
  </div>
</div>
<!-- /wp:media-text -->
```

### Image Top, Text Bottom (Feature Box)

```html
<!-- wp:media-text {
  "mediaId":123,
  "mediaPosition":"top",
  "backgroundColor":"light-gray"
} -->
<div class="wp-block-media-text has-light-gray-background-color">
  <figure class="wp-block-media-text__media">
    <img src="..." alt="..." class="wp-image-123" />
  </figure>
  <div class="wp-block-media-text__content">
    <h3>Box Title</h3>
    <p>Box description text.</p>
  </div>
</div>
<!-- /wp:media-text -->
```

## Conversion Complexity

**Rating:** MEDIUM

### What's Easy

- Image placement
- Text content
- Text and background colors
- Custom classes

### What's Hard

- Exact layout matching (width ratios)
- Icon fonts (no direct support)
- Complex styling with borders/shadows
- Responsive behavior on mobile

### What's Missing from DIVI Blurb

- **Icon Font Support** - Can't use Divi icon library directly
- **Complex Spacing** - Limited padding/margin control
- **Link Wrapping** - Can't make entire box clickable
- **Title Styling** - Limited font size control for title

## Real-World Conversion Examples

### Example 1: Feature Box (DIVI Blurb → Gutenberg)

**DIVI Source:**

```
[et_pb_blurb title="Mateřská škola"
  image="/wp-content/uploads/2021/school.jpg"
  image_alt="Mateřská škola"
  url="/programs/"
  _builder_version="4.16"
  text_orientation="center"
  background_color="#f5f5f5"
  custom_padding="20px|20px|20px|20px|false|false"]

[/et_pb_blurb]
```

**Gutenberg Conversion:**

```html
<!-- wp:media-text {
  "mediaId":456,
  "mediaPosition":"top",
  "backgroundColor":"light-gray"
} -->
<div class="wp-block-media-text has-light-gray-background-color">
  <figure class="wp-block-media-text__media">
    <img src="..." alt="Mateřská škola" class="wp-image-456" />
  </figure>
  <div class="wp-block-media-text__content">
    <!-- wp:heading {"level":3,"align":"center"} -->
    <h3 class="has-text-align-center">Mateřská škola</h3>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">
      <a href="/programs/">Learn more about our programs</a>
    </p>
    <!-- /wp:paragraph -->
  </div>
</div>
<!-- /wp:media-text -->
```

**Add to theme CSS:**

```css
.wp-block-media-text {
  padding: 20px;
}
```

### Example 2: Team Member Card (DIVI Blurb → Gutenberg)

**DIVI Source:**

```
[et_pb_blurb title="Mgr. Jan Novotný"
  body="<p><em>Vedoucí pedagogického týmu</em></p>"
  image="http://waldorf-brno.cz/uploads/team/novotny.jpg"
  image_alt="Mgr. Jan Novotný"
  _builder_version="4.16"
  text_orientation="center"
  background_color="#ffffff"]

[/et_pb_blurb]
```

**Gutenberg Conversion:**

```html
<!-- wp:media-text {
  "mediaId":789,
  "mediaPosition":"top",
  "backgroundColor":"white"
} -->
<div class="wp-block-media-text has-white-background-color team-card">
  <figure class="wp-block-media-text__media">
    <img src="..." alt="Mgr. Jan Novotný" class="wp-image-789" />
  </figure>
  <div class="wp-block-media-text__content">
    <!-- wp:heading {"level":3,"align":"center"} -->
    <h3 class="has-text-align-center">Mgr. Jan Novotný</h3>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center"><em>Vedoucí pedagogického týmu</em></p>
    <!-- /wp:paragraph -->
  </div>
</div>
<!-- /wp:media-text -->
```

**Add to theme CSS:**

```css
.team-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-card .wp-block-media-text__media img {
  border-radius: 8px 8px 0 0;
}
```

## Implementation Guide

### Step 1: Add Media & Text Block

In Gutenberg:

1. Click "+" to add block
2. Search for "Media & Text"
3. Insert block

### Step 2: Upload or Select Image

1. Click media placeholder
2. Either:
   - Upload from computer ("Upload")
   - Select from library ("Media Library")
3. Select image and insert

### Step 3: Add Text Content

1. Click text area on the right
2. Add heading block (h3 recommended)
3. Type title text
4. Add paragraph blocks
5. Type description text

### Step 4: Set Media Position

1. Click block
2. In right sidebar, look for "Media Position"
3. Choose: Left, Right, or Top
4. Block updates to show new layout

### Step 5: Adjust Media Width (Optional)

1. Click block
2. In toolbar, drag divider between media and text
3. Adjust width as needed
4. Or set explicit percentage in settings

### Step 6: Set Background Color (Optional)

1. Click block
2. In right sidebar, find "Background Color"
3. Select color

### Step 7: Apply Custom Classes (Optional)

1. In right sidebar, find "Advanced"
2. Add custom CSS classes
3. Define styling in theme CSS

## CSS Customization

### Feature Box Styling

```css
.wp-block-media-text.feature-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.wp-block-media-text.feature-box .wp-block-media-text__media {
  margin-bottom: 15px;
}

.wp-block-media-text.feature-box img {
  border-radius: 8px;
  width: 100%;
  height: auto;
}
```

### Team Card with Image Top

```css
.team-card .wp-block-media-text__media img {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}
```

### Icon Box Simulation (without real icons)

```css
.wp-block-media-text.icon-box .wp-block-media-text__media {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.wp-block-media-text.icon-box .wp-block-media-text__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

## Responsive Behavior

### Default Responsive

- Desktop: Media left, text right (or as configured)
- Mobile: Media top, text bottom (stacks automatically)

### Custom Mobile Behavior

```css
@media (max-width: 768px) {
  .wp-block-media-text {
    display: flex;
    flex-direction: column;
  }

  .wp-block-media-text__media {
    margin-bottom: 15px;
    width: 100%;
  }
}
```

## Icon Box Alternative

Since Gutenberg media-text doesn't support icon fonts, use one of:

1. **Image Icons** - Create small PNG/SVG images of icons
2. **Icon Plugin** - Use Advanced Blocks, GenerateBlocks, or similar
3. **Unicode Icons** - Use Unicode symbols in text (limited options)
4. **SVG Inline** - Embed SVG directly in text block

## Troubleshooting

### Q: Image not showing

**A:** Verify image is in media library. Check that media ID is correct.

### Q: Media position changing on mobile

**A:** This is default responsive behavior. Use CSS media queries to control.

### Q: Text not aligning with image

**A:** Check `verticalAlignment` setting. Choose top, center, or bottom.

### Q: Icon fonts not working

**A:** Gutenberg media-text doesn't support icon fonts. Use image or icon plugin instead.

### Q: Background color too light/dark

**A:** Select different color from palette, or use custom hex code.

## Comparison Table

| Feature          | DIVI Blurb | Gutenberg Media-Text | Notes                 |
| ---------------- | ---------- | -------------------- | --------------------- |
| Image/Media      | Yes        | Yes                  | Direct mapping        |
| Title Text       | Yes        | Yes (separate block) | Use heading           |
| Body Text        | Yes        | Yes (separate block) | Use paragraph         |
| Icon Fonts       | Yes        | No                   | Use images instead    |
| Background Color | Yes        | Yes                  | Direct mapping        |
| Text Alignment   | Yes        | Yes                  | Limited control       |
| Link Wrapping    | Yes        | Limited              | Can link title/button |
| Custom Classes   | Yes        | Yes                  | Preserved             |

## Recommendations

1. **Use for Feature Boxes** - Excellent for structured content
2. **Team Cards** - Works well with image top layout
3. **Product/Service Showcase** - Left/right alternating layouts
4. **Simple Icons** - Replace icon fonts with small SVG/PNG images
5. **Custom Styling** - Use CSS classes for consistent appearance

## Related Blocks

- **[core/columns](core_columns.md)** - Multi-column alternative
- **[core/image](core_image.md)** - Image only
- **[core/paragraph](core_paragraph.md)** - Text only
- **[core/group](core_group.md)** - Container for more control

## Further Reading

- [WordPress Media-Text Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/media-text/)
- [SVG Icons Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML)
- [Responsive Design Patterns](https://www.smashingmagazine.com/guides/responsive-web-design/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation
**Instances in Current Site:** 156 DIVI blurbs
**Conversion Priority:** MEDIUM - Common feature boxes
