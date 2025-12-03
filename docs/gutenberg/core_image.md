# Gutenberg Block: core/image

## Overview

The Image block displays **responsive images** with options for alignment, sizing, linking, and captions. It replaces DIVI's Image module and provides WordPress's native image handling with media library integration.

**DIVI Equivalent:** `et_pb_image`

**Use Cases:**
- Responsive image display
- Linked images
- Captioned images
- Lightbox galleries

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `id` | number | empty | Media library image ID | `123` |
| `url` | string | empty | Image URL | `"http://example.com/image.jpg"` |
| `alt` | string | empty | Alternative text (accessibility) | `"School building"` |
| `caption` | HTML | empty | Image caption text | `"School entrance"` |
| `title` | string | empty | Image title attribute | `"School Building"` |
| `href` | string | empty | Link destination | `"/about/"` |
| `rel` | string | empty | Link relationship | `"noopener noreferrer"` |
| `linkTarget` | string | "_self" | Link target (self, blank) | `"_blank"` |
| `width` | number | empty | Image width (pixels) | `400` |
| `height` | number | empty | Image height (pixels) | `300` |
| `sizeSlug` | string | "large" | WordPress image size | `"full"` |
| `align` | string | "none" | Block alignment (left, center, right, wide, full) | `"center"` |
| `className` | string | empty | Custom CSS classes | `"featured-image"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `src="url"` | `url="..."` or upload to media library | Prefer media library upload |
| `alt="text"` | `alt="text"` | Critical for accessibility |
| `title_text="text"` | `title="text"` | Hover tooltip |
| `url="/link"` | `href="/link"` | Link destination |
| `url_new_window="on"` | `linkTarget="_blank"` | Open in new tab |
| `image_max_width="500px"` | `width=500` | Set explicit width |
| `border_radii="10px"` | CSS border-radius | Use custom class |
| `box_shadow_style="preset1"` | CSS box-shadow | Use custom class |
| `image_alignment="center"` | `align="center"` | Direct mapping |
| `custom_margin="||20px||"` | CSS margin | Use custom class |

## Block Markup Example

### Simple Image

```html
<!-- wp:image {"id":123,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
  <img src="http://example.com/image.jpg" alt="School building" class="wp-image-123" />
</figure>
<!-- /wp:image -->
```

### Image with Caption

```html
<!-- wp:image {"id":123,"caption":"School entrance"} -->
<figure class="wp-block-image">
  <img src="..." alt="School" class="wp-image-123" />
  <figcaption class="wp-element-caption">School entrance</figcaption>
</figure>
<!-- /wp:image -->
```

### Linked Image

```html
<!-- wp:image {
  "id":123,
  "href":"/about/",
  "align":"center"
} -->
<figure class="wp-block-image aligncenter">
  <a href="/about/">
    <img src="..." alt="..." class="wp-image-123" />
  </a>
</figure>
<!-- /wp:image -->
```

## Conversion Complexity

**Rating:** LOW

### What's Easy
- Image upload and sizing
- Alt text
- Captions
- Links
- Alignment
- Custom classes

### What's Hard
- Image optimization
- Responsive image sizes
- Lightbox galleries
- Border radius/shadows

## Real-World Conversion Examples

### Example 1: Simple Image (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_image src="http://waldorf-brno.cz/uploads/school.jpg"
  alt="Waldorfská škola Brno"
  _builder_version="4.16"
  image_alignment="center"
  custom_margin="||20px||"]
[/et_pb_image]
```

**Gutenberg Conversion:**
1. Upload image to WordPress media library
2. Insert Image block
3. Select image from library
4. Set Alt text: "Waldorfská škola Brno"
5. Set alignment: Center
6. Add custom margin via CSS class

### Example 2: Linked Image with Lightbox (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_image src="http://waldorf-brno.cz/uploads/photo.jpg"
  alt="Team photo"
  show_in_lightbox="on"
  _builder_version="4.16"]
[/et_pb_image]
```

**Gutenberg Conversion:**
1. Insert image from media library
2. Click image to select
3. Click link icon
4. Use WordPress native lightbox or lightbox plugin

## Implementation Guide

### Step 1: Upload Image (if needed)

If image not already in media library:
1. Click image block
2. Click "Upload" button
3. Select image from computer
4. WordPress uploads and optimizes

### Step 2: Select Image from Library

1. Click image block
2. Click "Choose image"
3. Browse or search media library
4. Click image to select

### Step 3: Set Alt Text

1. Image selected in block
2. Look for "Alt text (alternative text)"
3. Enter descriptive text (important for SEO/accessibility)

### Step 4: Add Caption (Optional)

1. Below image, find caption area
2. Click and type caption text
3. Caption displays below image

### Step 5: Add Link (Optional)

1. Click image
2. Click link icon in toolbar
3. Enter URL (internal or external)
4. Check "Open in new tab" if needed

### Step 6: Set Alignment

1. Click image block
2. In toolbar, click alignment button
3. Choose Left, Center, Right, Wide, or Full

### Step 7: Add Custom CSS (Optional)

1. In right sidebar, find "Advanced"
2. Add custom CSS classes
3. Define styling in theme CSS

## Image Optimization

### WordPress Responsive Images

WordPress automatically generates multiple image sizes:
- Thumbnail: 150x150
- Medium: 300x300
- Medium Large: 768x768
- Large: 1024x1024
- Full: Original size

**Best Practice:** Upload full-size image; WordPress handles optimization.

### Lightbox Integration

**WordPress Native:**
- WordPress 6.4+ has built-in lightbox
- No plugin needed

**Plugin Alternative:**
- [Elementor Lightbox](https://elementor.com/)
- [Easy Lightbox](https://wordpress.org/plugins/easy-lightbox/)

## CSS Customization

### Border Radius
```css
.featured-image img {
  border-radius: 10px;
}
```

### Box Shadow
```css
.featured-image {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Responsive Image Width
```css
.wp-block-image {
  max-width: 600px;
}

@media (max-width: 768px) {
  .wp-block-image {
    max-width: 100%;
  }
}
```

## Troubleshooting

### Q: Image not displaying
**A:** Verify image is uploaded to media library. Check URL is valid.

### Q: Alt text field missing
**A:** Look for "Alt text (alternative text)" field. Scroll down in sidebar if needed.

### Q: Link not working
**A:** Verify URL is correct. Test link by clicking image while holding Ctrl.

### Q: Image too large on mobile
**A:** Set max-width constraint via CSS. Use media queries for responsive sizing.

### Q: Caption styling wrong
**A:** Caption uses theme styles. Customize with CSS targeting `.wp-element-caption`.

## Comparison Table

| Feature | DIVI | Gutenberg | Notes |
|---------|------|-----------|-------|
| Image Upload | Yes | Yes | Media library integration |
| Alt Text | Yes | Yes | Critical for accessibility |
| Captions | Yes | Yes | Simple text below image |
| Links | Yes | Yes | Direct link or lightbox |
| Alignment | Yes | Yes | Left, center, right, wide, full |
| Sizing | Yes | Limited | Theme sizes available |
| Border Radius | Yes | No | Use CSS custom class |
| Box Shadow | Yes | No | Use CSS custom class |
| Lightbox | Yes | Limited | WordPress native or plugin |

## Recommendations

1. **Always Add Alt Text** - Critical for accessibility and SEO
2. **Use Media Library** - Don't link to external URLs
3. **Optimize Images** - Use appropriate file formats (JPEG, WebP)
4. **Set Captions** - If image needs explanation
5. **Test Responsiveness** - Verify on mobile devices

## Related Blocks

- **[core/media-text](core_media_text.md)** - Image with text
- **[core/gallery](core_gallery.md)** - Multiple images
- **[core/paragraph](core_paragraph.md)** - Text with images

## Further Reading

- [WordPress Image Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/image/)
- [Web Image Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation
**Instances in Current Site:** 67 DIVI images
**Conversion Priority:** HIGH - Important visual content
