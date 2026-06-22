# DIVI Shortcode: et_pb_blog

## Overview
The Blog module displays **dynamic blog post listings** with automated post queries. It can show posts from specific categories, with customizable layouts (grid or fullwidth), pagination, and metadata like date, author, category, and excerpt. This module queries the database to display current/recent posts automatically.

## Hierarchy
- **Parent:** `et_pb_column`
- **Children:** None (dynamic content module)
- **Usage context:** Creating blog archives, post listings, category displays

## Parameters

### Content Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `_builder_version` | string | "4.16" | Divi builder version | `_builder_version="4.16"` |
| `posts_number` | number | "10" | Number of posts to display | `posts_number="5"` |
| `include_categories` | string | empty | Include specific post categories (comma-separated) | `include_categories="1,2,3"` |
| `exclude_categories` | string | empty | Exclude specific post categories | `exclude_categories="4,5"` |
| `post_type` | string | "post" | Post type to query | `post_type="post"` |
| `orderby` | string | "date" | Sort order (date, title, rand, comment_count) | `orderby="date"` |
| `order` | string | "DESC" | Sort direction (ASC, DESC) | `order="DESC"` |

### Layout Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `fullwidth` | yes/no | "off" | Display in fullwidth vs. grid layout | `fullwidth="off"` |
| `columns` | number | "3" | Number of columns in grid | `columns="2"` |
| `show_pagination` | yes/no | "on" | Show page navigation | `show_pagination="on"` |

### Post Content Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `show_featured_image` | yes/no | "on" | Display featured images | `show_featured_image="on"` |
| `show_title` | yes/no | "on" | Display post titles | `show_title="on"` |
| `show_excerpt` | yes/no | "on" | Display post excerpts | `show_excerpt="on"` |
| `show_meta` | yes/no | "on" | Display post metadata | `show_meta="on"` |
| `excerpt_length` | number | "270" | Character count of excerpt | `excerpt_length="200"` |
| `show_categories` | yes/no | "off" | Show post categories | `show_categories="on"` |
| `show_author` | yes/no | "on" | Display author name | `show_author="on"` |
| `show_date` | yes/no | "on" | Display publication date | `show_date="on"` |
| `show_comments` | yes/no | "off" | Display comment count | `show_comments="on"` |

### Styling Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `background_layout` | string | "light" | Text contrast (light, dark) | `background_layout="light"` |
| `text_text_color` | color | empty | Body text color | `text_text_color="#333333"` |
| `header_text_color` | color | empty | Title color | `header_text_color="#2c3e50"` |

### Spacing Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `custom_padding` | dimension | empty | Custom padding | `custom_padding="20px|20px|20px|20px|false|false"` |

### Advanced Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `module_id` | string | empty | CSS ID | `module_id="blog-listing"` |
| `module_class` | string | empty | CSS classes | `module_class="blog-archive"` |

## Real Usage Examples

### Example 1: Simple Blog Listing (Latest 5 Posts)
```
[et_pb_blog posts_number="5"
  _builder_version="4.16"
  columns="2"
  fullwidth="off"]
[/et_pb_blog]
```

### Example 2: Category-Specific Posts
```
[et_pb_blog posts_number="10"
  include_categories="3,5"
  _builder_version="4.16"
  columns="3"
  show_pagination="on"
  show_featured_image="on"
  show_title="on"
  show_excerpt="on"
  show_author="on"
  show_date="on"]
[/et_pb_blog]
```

### Example 3: Fullwidth Blog Layout with Metadata
```
[et_pb_blog posts_number="8"
  _builder_version="4.16"
  fullwidth="on"
  show_featured_image="on"
  show_title="on"
  show_excerpt="on"
  show_meta="on"
  show_categories="on"
  show_author="on"
  show_date="on"
  excerpt_length="250"
  show_pagination="on"
  background_layout="light"]
[/et_pb_blog]
```

### Example 4: Recent Posts with Custom Styling
```
[et_pb_blog posts_number="6"
  _builder_version="4.16"
  columns="2"
  fullwidth="off"
  show_featured_image="on"
  show_title="on"
  show_excerpt="on"
  excerpt_length="150"
  header_text_color="#2c3e50"
  text_text_color="#555555"
  background_layout="light"
  custom_padding="20px|20px|20px|20px|false|false"
  module_class="recent-posts"]
[/et_pb_blog]
```

### Example 5: Blog Archive with Pagination (No Excerpt)
```
[et_pb_blog posts_number="12"
  _builder_version="4.16"
  columns="3"
  fullwidth="off"
  show_featured_image="on"
  show_title="on"
  show_excerpt="off"
  show_author="on"
  show_date="on"
  show_comments="off"
  show_pagination="on"]
[/et_pb_blog]
```

## Conversion Complexity
**Rating:** HIGH

**Reasoning:**
- Requires dynamic query functionality (not Gutenberg native)
- Gutenberg has `core/query` block but with different parameter structure
- Must preserve post filtering logic (categories, post type, order)
- Pagination implementation needs careful handling
- Layout grid vs. fullwidth needs CSS management
- Metadata display options need to be replicated
- Featured image display and resizing must work
- Post excerpt generation and length limit must function
- Author and date display formatting may differ
- Requires testing with actual post database
- Most complex conversion of all modules

## Notes
- **Category Parameters:** Use post category IDs (numeric values), separated by commas
  - Use `include_categories` to show only specific categories
  - Use `exclude_categories` to hide specific categories
  - Cannot use both at the same time
- **Sorting Options:**
  - `orderby="date"`: Sorted by publication date (most common)
  - `orderby="title"`: Alphabetical order
  - `orderby="rand"`: Random order
  - `orderby="comment_count"`: Most commented posts
- **Order Values:**
  - `order="DESC"`: Newest/highest first (default)
  - `order="ASC"`: Oldest/lowest first
- **Layout Modes:**
  - Grid: Multiple columns showing post cards
  - Fullwidth: Full-width posts with images above text
- **Post Excerpt:** Automatically generated from post content if not manually set
- **Pagination:** If `show_pagination="on"`, posts are split across multiple pages
- **On this site:** Least used module (8 instances) - mostly for blog archives
- **Performance Note:** Querying many posts can impact page load time
- **Featured Image:** If post doesn't have featured image, shows placeholder
- **Post Metadata:** Includes author, date, category, comment count (individually toggleable)
- **Responsive Design:** Columns reduce on mobile (columns parameter is desktop default)
- **Archive Pages:** Often used on blog index and category archive pages
- **Gutenberg Equivalent:** `core/query` block (different parameter names and structure)
- **Post Type Flexibility:** Can show custom post types beyond standard "post"
- Consider lazy loading images for performance on large post listings
