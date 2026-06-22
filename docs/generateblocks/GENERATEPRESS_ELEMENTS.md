# GeneratePress Premium: Elements System

## Overview

The **Elements System** in GeneratePress Premium allows you to add content (blocks) at specific hook points on your site without modifying theme code. This is a powerful alternative to DIVI's custom hooks and filters, but with a visual interface and no coding required.

**Similar to:** DIVI's custom hooks/filters
**Superior to:** WordPress's `do_action()` for non-developers
**Plugin:** GeneratePress Premium
**Cost:** Part of GeneratePress Premium license

## What Are Elements?

Elements are blocks (or groups of blocks) that can be displayed:
- Before/after pages
- Before/after posts
- Before/after specific post types
- In footer areas
- In custom locations
- Conditionally (based on rules)

## Hook Points Available

GeneratePress Premium provides these hook points:

### Content Hooks

| Hook Point | Description | Use Cases |
|---|---|---|
| `before_page_content` | Before all page content | Pre-content message, breadcrumbs |
| `after_page_content` | After all page content | Related pages, CTA, author bio |
| `before_post_content` | Before post/article body | Featured image, info banner |
| `after_post_content` | After post/article body | Social sharing, related posts |
| `before_archive_content` | Before archive listings | Archive intro, filters |
| `after_archive_content` | After archive listings | Load more button, pagination |

### Navigation Hooks

| Hook Point | Description | Use Cases |
|---|---|---|
| `before_primary_navigation` | Before main menu | Utility nav, language selector |
| `after_primary_navigation` | After main menu | Search bar, extra menu |
| `before_secondary_navigation` | Before footer menu | Secondary menu |
| `after_secondary_navigation` | After footer menu | Legal links |

### Header/Footer Hooks

| Hook Point | Description | Use Cases |
|---|---|---|
| `before_header` | Before header area | Top bar, announcement |
| `after_header` | After header area | Logo area, tagline |
| `footer_left` | Left footer area | Company info |
| `footer_center` | Center footer area | Copyright, links |
| `footer_right` | Right footer area | Social icons, newsletter |

### Special Hooks

| Hook Point | Description | Use Cases |
|---|---|---|
| `before_main` | Before main container | Full-width banner |
| `after_main` | After main container | Site-wide CTA |
| `before_sidebar` | Before sidebar | Sticky sidebar info |
| `after_sidebar` | After sidebar | Sidebar bottom CTA |

## Creating Elements

### 1. Access Elements Panel

In WordPress Admin:
1. Go to **Dashboard**
2. Navigate to **GeneratePress → Elements**
3. Click **Add Element**

### 2. Configure Element

**Basic Settings:**
- **Name** - Internal name (e.g., "Event List Before Page")
- **Hook Location** - Which hook point (e.g., "before_page_content")
- **Exclusions** - Pages/posts to exclude
- **Display Rules** - Conditions for showing

**Content:**
- Create blocks (same as page editor)
- Use any Gutenberg block
- Use GenerateBlocks blocks
- Add custom shortcodes

### 3. Set Display Rules

Control when element appears:

```
If:
  - Post Type is "post"
  - AND Category is "Events"
  - AND Date is after "2024-01-01"

Then:
  Display this element
```

## DIVI Equivalent Comparison

### DIVI Approach

```php
// In functions.php
add_action( 'divi_before_content', function() {
  echo do_shortcode( '[et_pb_section] ... [/et_pb_section]' );
} );
```

**Problems:**
- Requires code editing
- Shortcodes hard to maintain
- Not visual
- Hard to debug

### GeneratePress Elements Approach

**Visual Editor:**
1. Go to Elements panel
2. Create new element
3. Add blocks visually
4. Set hook point
5. Set display rules
6. Save

**Advantages:**
- No coding required
- Visual interface
- Easy to manage
- Easy to delete/modify
- No theme modifications
- Versioning (element history)

## Real Usage Examples

### Example 1: Event Information Before Page

**Scenario:** Show event details before page content on event posts

**Steps:**
1. Create new element: "Event Info Box"
2. Set hook: "before_page_content"
3. Add display rule: "Post Type is event"
4. Content:
   ```html
   <!-- wp:generateblocks/container -->
   <div class="event-info">
     <!-- wp:generateblocks/headline -->
     <h2>Event Details</h2>
     <!-- wp:core/paragraph -->
     <p>Date: {acf_event_date}</p>
     <p>Time: {acf_event_time}</p>
     <p>Location: {acf_event_location}</p>
   </div>
   ```

### Example 2: Related Content After Post

**Scenario:** Show related posts after article content

**Steps:**
1. Create new element: "Related Posts"
2. Set hook: "after_post_content"
3. Add display rule: "Post Type is post"
4. Content:
   ```html
   <!-- wp:generateblocks/headline -->
   <h3>Related Articles</h3>

   <!-- wp:core/query -->
   <!-- Show related posts with custom template -->
   ```

### Example 3: Event Signup After Event Post

**Scenario:** Show signup form after event post

**Steps:**
1. Create new element: "Event Signup Form"
2. Set hook: "after_post_content"
3. Add display rule: "Post Type is event AND Status is upcoming"
4. Content:
   ```html
   <!-- wp:generateblocks/container -->
   <!-- wp:core/heading -->
   <h3>Register for Event</h3>

   <!-- wp:core/form (using Gravity Forms or similar) -->
   ```

### Example 4: Footer Social Links

**Scenario:** Add social media links in footer

**Steps:**
1. Create new element: "Footer Social"
2. Set hook: "footer_right"
3. No exclusions (show everywhere)
4. Content:
   ```html
   <!-- wp:generateblocks/container {"layout":"flex"} -->
   <div class="footer-social">
     <!-- wp:generateblocks/button {"text":"Facebook"} /-->
     <!-- wp:generateblocks/button {"text":"Twitter"} /-->
     <!-- wp:generateblocks/button {"text":"Instagram"} /-->
   </div>
   ```

### Example 5: Category-Specific Announcements

**Scenario:** Show different messages based on page category

**Setup:**
1. Create element: "Category Announcement - Kindergarten"
   - Hook: "before_page_content"
   - Rule: "Category is kindergarten"
   - Content: Kindergarten-specific message

2. Create element: "Category Announcement - School"
   - Hook: "before_page_content"
   - Rule: "Category is school"
   - Content: School-specific message

3. Create element: "Category Announcement - Academy"
   - Hook: "before_page_content"
   - Rule: "Category is academy"
   - Content: Academy-specific message

## Advanced Features

### 1. Dynamic Content

Use dynamic tags to insert post meta:

```
{post_title}
{post_date}
{post_author}
{acf_field_name}
{post_type}
```

Example:
```html
<!-- wp:paragraph -->
<p>This event is in {acf_event_location}</p>
<!-- /wp:paragraph -->
```

### 2. Conditional Display

Set conditions for element visibility:

**Available Conditions:**
- Post Type (page, post, custom post type)
- Category/Taxonomy
- Author
- Date range
- Device (mobile, tablet, desktop)
- User role (admin, editor, subscriber, etc.)
- Post status (published, draft, etc.)
- Is singular page
- Is archive page

### 3. Exclusions

Exclude specific posts/pages:

```
Show on all pages EXCEPT:
  - Home page
  - About page
  - Contact page
```

### 4. Visibility per Device

Different content for different devices:

```
Desktop: Show full element
Tablet: Show simplified version
Mobile: Show mobile-optimized version
```

### 5. User Role Control

Different elements for different users:

```
If user role is "subscriber":
  Show limited information

If user role is "admin":
  Show full element with admin info
```

## Styling Elements

### Method 1: Global Classes

Apply GenerateBlocks global classes:

```html
<!-- wp:generateblocks/container {"globalClasses":["container-primary"]} -->
```

### Method 2: Custom CSS

Add custom CSS in element:

```css
.element-custom {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}
```

### Method 3: Theme Classes

Use GeneratePress theme classes:

```html
<!-- wp:generateblocks/container {"htmlAttributes":{"class":"has-primary-background-color"}} -->
```

## Comparison with DIVI Hooks

### DIVI Hooks Approach

DIVI uses WordPress hooks but requires coding:

```php
// File: theme/functions.php
add_action( 'divi_fb_before_section', function() {
    if ( is_post_type( 'events' ) ) {
        echo '<div class="event-banner">';
        echo get_field( 'event_banner' );
        echo '</div>';
    }
} );
```

**Limitations:**
- Must edit functions.php
- Risk of syntax errors
- Not WYSIWYG
- Hard for non-developers
- Risk of losing code in updates

### GeneratePress Elements Approach

Visual, no coding:

1. Create element in admin
2. Add blocks visually
3. Set conditions
4. Save
5. Done!

**Advantages:**
- No code editing
- WYSIWYG editor
- No risk to theme
- Non-developers can do it
- Safer updates
- Easy to manage/track

## Combining with GenerateBlocks

### Using GenerateBlocks Blocks in Elements

You can use any GenerateBlocks block inside an element:

```html
<!-- wp:generateblocks/container -->
<div class="custom-content">
  <!-- wp:generateblocks/grid -->
  <div class="grid-layout">
    <!-- wp:generateblocks/button -->
    <!-- wp:generateblocks/image -->
    <!-- wp:generateblocks/headline -->
  </div>
</div>
```

### Using Query Block for Dynamic Content

Combine with query block for dynamic post lists:

```html
<!-- wp:generateblocks/container -->
<h3>Latest Events</h3>

<!-- wp:core/query -->
<!-- Posts matching criteria displayed here -->
<!-- /wp:core/query -->
```

### Using Conditions for Smart Display

Show/hide entire element based on conditions:

```
Element: "Event Registration Button"
Hook: "after_post_content"
Condition: Post Type is "event" AND Status is "upcoming"

Content: Registration button and form
```

## Migration from DIVI Hooks

### DIVI Hooks to Elements Mapping

| DIVI | GeneratePress Elements |
|---|---|
| `divi_before_main_content` | `before_main` |
| `divi_after_main_content` | `after_main` |
| `divi_before_post_content` | `before_post_content` |
| `divi_after_post_content` | `after_post_content` |
| `divi_sidebar_top` | `before_sidebar` |
| `divi_sidebar_bottom` | `after_sidebar` |
| `divi_footer_widgets` | `footer_center` |
| Custom hooks | Not applicable (not needed) |

### Steps to Migrate

1. **Identify** - Find all DIVI hook usage
2. **Map** - Determine equivalent GeneratePress hooks
3. **Create** - Create new elements with same content
4. **Test** - Verify output looks correct
5. **Remove** - Delete old DIVI hooks from functions.php

## Performance Considerations

### CSS/JavaScript Impact

Each element adds:
- **CSS:** ~1-2KB per styled element
- **JavaScript:** Only if blocks require JS
- **Render time:** Negligible (blocks rendered server-side)
- **Caching:** Works with all caching plugins

### Best Practices

1. **Minimize elements** - Use fewer, larger elements instead of many small ones
2. **Optimize content** - Keep block content lightweight
3. **Use conditions** - Don't show elements everywhere
4. **Cache wisely** - Some caching plugins exclude dynamic elements
5. **Monitor performance** - Use tools like GTmetrix

## Troubleshooting

### Element Not Showing

**Check:**
1. Is element enabled?
2. Do conditions match?
3. Is hook point correct?
4. Check browser console for errors
5. Temporarily remove conditions

### Styling Not Applying

**Check:**
1. CSS class names correct?
2. CSS specificity issues?
3. Theme styles overriding?
4. Cache enabled (clear cache)

### Content Breaking Layout

**Solution:**
1. Wrap in container with max-width
2. Use responsive padding
3. Test on mobile
4. Adjust block widths

## Examples for This Site

### Example: Event Category Banners

Create different banners for each category:

```
Element 1: "Kindergarten Info"
  Hook: before_page_content
  Condition: Category = kindergarten
  Content: Kindergarten-specific info

Element 2: "School Info"
  Hook: before_page_content
  Condition: Category = school
  Content: School-specific info

Element 3: "Academy Info"
  Hook: before_page_content
  Condition: Category = academy
  Content: Academy-specific info
```

### Example: Event Registration CTA

Add registration button only for upcoming events:

```
Element: "Event Registration"
Hook: after_post_content
Condition: Post Type = event AND custom_field "is_upcoming" = true
Content: Registration form and button
```

### Example: Related Events

Show related events after single event:

```
Element: "Related Events"
Hook: after_post_content
Condition: Post Type = event
Content: Query block showing other events in same category
```

## Advanced Use Cases

### 1. Progressive Disclosure

Show different content based on user role:

```
Admin: See edit button, debug info
Editor: See full element
Subscriber: See basic element
Guest: See limited element
```

### 2. A/B Testing

Create two elements with different content:

```
Element A: "CTA Version 1"
Element B: "CTA Version 2"

Use conditions to show different versions to different users
```

### 3. Seasonal Content

Show different content based on date:

```
Element: "Holiday Message"
Condition: Date is between 12/15 and 1/5
Content: Holiday-specific message
```

### 4. Geographic Content

Show location-specific content:

```
Requires: Geolocation plugin
Then: Show region-specific information
```

## Integrations

### with ACF (Advanced Custom Fields)

Use ACF field values in elements:

```html
<!-- wp:paragraph -->
<p>{acf_custom_field_name}</p>
<!-- /wp:paragraph -->
```

### with Query Block

Combine elements with query blocks:

```html
<!-- wp:core/query -->
<!-- Dynamically display posts matching criteria -->
<!-- /wp:core/query -->
```

### with WooCommerce

Show product-specific information:

```
Condition: Post Type = product
Content: Related products, reviews, etc.
```

## Summary

**GeneratePress Elements are perfect for:**
- Adding content at theme hook points
- Non-developers creating layouts
- Dynamic, conditional content
- Post-type specific customizations
- Category-specific information
- No-code template building

**Advantages over DIVI hooks:**
- Visual editor (WYSIWYG)
- No code required
- Easy to manage
- Safer (no theme modifications)
- Built-in conditions
- Easy to test and iterate

**For this site:**
- Use for event-specific information
- Create category-specific banners
- Add registration forms conditionally
- Display related content dynamically
- Replace any DIVI hook-based customizations

---

**Last Updated:** November 20, 2025
**GeneratePress Premium Version:** Latest
**Status:** Recommended for advanced customizations
