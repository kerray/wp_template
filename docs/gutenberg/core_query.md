# Gutenberg Block: core/query

## Overview

The Query block is a **dynamic block for displaying lists of posts** with filtering, sorting, and pagination. It replaces DIVI's Blog module by providing WordPress's native post query functionality. The Query block includes powerful filtering and template customization capabilities.

**DIVI Equivalent:** `et_pb_blog`

**Use Cases:**
- Blog post listings
- Category archives
- Custom post type displays
- Related posts
- Post filtering and search

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `query` | object | empty | Post query parameters | `{"perPage":10,"pages":0,"offset":0}` |
| `queryId` | string | empty | Unique query identifier | `"posts-list-1"` |
| `displayLayout` | object | empty | Display template (flex, columns) | `{"type":"list"}` |
| `namespace` | string | empty | Query namespace | `"core/posts"` |
| `align` | string | empty | Block alignment | `"full"` |
| `className` | string | empty | Custom CSS classes | `"blog-archive"` |

## Query Parameters

Core query settings within the `query` object:

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `perPage` | number | 10 | Posts per page | `5` |
| `pages` | number | 0 | Total pages (0 = all) | `0` |
| `offset` | number | 0 | Skip first N posts | `0` |
| `orderBy` | string | "date" | Sort field (date, title, rand) | `"date"` |
| `order` | string | "desc" | Sort direction (asc, desc) | `"desc"` |
| `search` | string | empty | Search keyword filter | `"example"` |
| `exclude` | array | empty | Exclude post IDs | `[1,2,3]` |
| `sticky` | string | empty | Include sticky (empty, include, exclude) | `"exclude"` |
| `taxQuery` | object | empty | Taxonomy filters | See examples below |
| `postType` | string | "post" | Post type to query | `"post"` |

### Taxonomy Query (Category/Tag Filtering)

```json
{
  "taxQuery": {
    "category": [3, 5],  // Include categories 3 and 5
    "post_tag": [10]     // Include tag 10
  }
}
```

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `posts_number="5"` | `query.perPage=5` | Direct mapping |
| `include_categories="1,2,3"` | `query.taxQuery.category=[1,2,3]` | Convert to array |
| `exclude_categories="4,5"` | `query.taxQuery.category=[exclude,4,5]` | Use exclude syntax |
| `orderby="date"` | `query.orderBy="date"` | Direct mapping |
| `order="DESC"` | `query.order="desc"` | Lowercase |
| `show_pagination="on"` | Template includes pagination | Built into template |
| `fullwidth="off"` | `displayLayout.type="list"` | Grid or list layout |
| `columns="3"` | `displayLayout.columns=3` | Multi-column grid |
| `show_featured_image="on"` | Template includes image block | Within post template |
| `show_title="on"` | Template includes heading | Within post template |
| `show_excerpt="on"` | Template includes excerpt block | Within post template |

## Block Markup Example

### Simple Post List

```html
<!-- wp:query {
  "queryId":"blog-posts",
  "query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date"}
} -->
<div class="wp-block-query">
  <!-- wp:post-template -->
  <div class="wp-block-post-template">
    <!-- Post template content -->
  </div>
  <!-- /wp:post-template -->

  <!-- wp:query-pagination -->
  <div class="wp-block-query-pagination">
    <!-- Pagination controls -->
  </div>
  <!-- /wp:query-pagination -->
</div>
<!-- /wp:query -->
```

### Post List with Filters

```html
<!-- wp:query {
  "queryId":"filtered-posts",
  "query":{
    "perPage":5,
    "postType":"post",
    "order":"desc",
    "orderBy":"date",
    "taxQuery":{"category":[3,5]}
  }
} -->
<div class="wp-block-query">
  <!-- Template and pagination -->
</div>
<!-- /wp:query -->
```

## Conversion Complexity

**Rating:** HIGH

### What's Easy
- Basic post listing
- Number of posts
- Sorting
- Pagination

### What's Hard
- Category/tag filtering (different syntax than DIVI)
- Post excerpt generation
- Template customization
- Metadata display options
- Layout variations (grid vs. list)
- Responsive column adjustments

### What's Missing from DIVI Blog
- **Dynamic Metadata Control** - Can't toggle individual fields easily
- **Custom Post Types** - Limited support compared to DIVI
- **Responsive Columns** - Can't change columns per breakpoint
- **Featured Image Sizing** - Limited sizing options
- **Comment Count Display** - Not directly supported

## Real-World Conversion Examples

### Example 1: Simple Blog Listing (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_blog posts_number="5"
  _builder_version="4.16"
  columns="2"
  fullwidth="off"
  show_featured_image="on"
  show_title="on"
  show_excerpt="on"
  show_author="on"
  show_date="on"
  show_pagination="on"]
[/et_pb_blog]
```

**Gutenberg Conversion:**
1. Add Query block to page
2. Click "Edit" or customize template
3. In query settings:
   - Set Posts per Page: 5
   - Set display layout: 2 columns grid
4. Customize post template to show:
   - Featured image
   - Title
   - Excerpt
   - Author
   - Date
5. Ensure pagination is included

### Example 2: Category-Filtered Posts (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_blog posts_number="10"
  include_categories="3,5"
  _builder_version="4.16"
  columns="3"
  show_featured_image="on"
  show_title="on"
  show_excerpt="on"
  show_pagination="on"]
[/et_pb_blog]
```

**Gutenberg Conversion:**

Step by step:
1. Add Query block
2. Open Advanced Settings
3. In "Query" section:
   - Set Posts per Page: 10
   - Click "Filters"
   - Add "Category" filter
   - Select categories 3 and 5
4. Set display to 3-column grid
5. Customize template for featured image, title, excerpt

## Implementation Guide

### Step 1: Add Query Block

In Gutenberg:
1. Click "+" to add block
2. Search for "Query"
3. Insert block
4. Select layout (single column list or grid)

### Step 2: Configure Post Query

1. Click block
2. In right sidebar, find "Query" section
3. Click "Filters" button
4. Set up desired filters:
   - **Post Type:** Post (default)
   - **Number of items:** 10 or desired count
   - **Sort by:** Date (newest first)
   - **Categories:** Select specific categories if needed
   - **Tags:** Select specific tags if needed

### Step 3: Set Display Layout

1. In block settings, find "Display Settings"
2. Choose layout:
   - List (single column)
   - Grid (multiple columns)
3. If grid, set number of columns

### Step 4: Customize Post Template

1. Find "Edit template" button or click inside block
2. Template shows what appears for each post
3. Add blocks for:
   - Featured image
   - Title (heading)
   - Excerpt (paragraph)
   - Author, date, category (if needed)
4. Arrange blocks in desired order

### Step 5: Enable/Disable Pagination

1. In template, look for "Query Pagination" block
2. Keep for pagination
3. Remove if not needed (single page list)

### Step 6: Add Custom Styling

1. In right sidebar, find "Advanced"
2. Add custom CSS classes
3. Define styling in theme CSS

## Template Blocks Available

### Post-Related Blocks

- **Post Title** - Post name (usually h2 or h3)
- **Post Content** - Full post content (usually excerpt)
- **Post Featured Image** - The featured/thumbnail image
- **Post Date** - Publication date
- **Post Author** - Author name
- **Post Author Name** - Just the name
- **Post Excerpt** - Post excerpt or auto-generated
- **Post Categories** - Category list
- **Post Tags** - Tag list
- **Post Comment Count** - Number of comments (if enabled)

## Query Parameter Reference

### Common Query Patterns

**Latest 5 Posts:**
```json
{
  "perPage": 5,
  "order": "desc",
  "orderBy": "date"
}
```

**Recent Posts by Category:**
```json
{
  "perPage": 10,
  "order": "desc",
  "orderBy": "date",
  "taxQuery": {"category": [3]}
}
```

**Popular Posts (by comments):**
```json
{
  "perPage": 5,
  "order": "desc",
  "orderBy": "comment_count"
}
```

**Exclude Specific Posts:**
```json
{
  "exclude": [1, 2, 3],
  "perPage": 10
}
```

## CSS Customization for Query Blocks

### Grid Layout
```css
.wp-block-query .wp-block-post-template {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .wp-block-query .wp-block-post-template {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .wp-block-query .wp-block-post-template {
    grid-template-columns: 1fr;
  }
}
```

### Post Card Styling
```css
.wp-block-post {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.wp-block-post:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wp-block-post .wp-block-post-featured-image img {
  border-radius: 8px;
  width: 100%;
  height: auto;
  margin-bottom: 15px;
}
```

### Pagination Styling
```css
.wp-block-query-pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.wp-block-query-pagination a,
.wp-block-query-pagination .page-numbers {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-decoration: none;
}

.wp-block-query-pagination .page-numbers.current {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}
```

## Troubleshooting

### Q: Posts not displaying
**A:** Check query filters. Verify posts exist with selected filters. Check post type setting.

### Q: Wrong number of posts showing
**A:** Verify "Posts per Page" setting. Check if pagination is active.

### Q: Category filter not working
**A:** Ensure category IDs are correct. Check categories exist and have posts.

### Q: Featured image too large/small
**A:** Edit template, click image block, adjust size in image settings or CSS.

### Q: Pagination not showing
**A:** Ensure "Query Pagination" block is in template. Verify posts exceed per-page limit.

### Q: Excerpt too long or too short
**A:** Edit template, click excerpt block, adjust excerpt length if available.

## Comparison Table

| Feature | DIVI Blog | Gutenberg Query | Notes |
|---------|-----------|-----------------|-------|
| Post Listing | Yes | Yes | Core functionality |
| Category Filter | Yes | Yes | Different syntax |
| Number of Posts | Yes | Yes | Direct mapping |
| Sorting | Yes | Yes | Limited options |
| Pagination | Yes | Yes | Built-in |
| Grid Layout | Yes | Yes | Via display settings |
| Featured Image | Yes | Yes | Via template |
| Excerpt | Yes | Yes | Via template |
| Author/Date | Yes | Yes | Via template blocks |
| Custom Templates | No | Yes | More flexible |

## Recommendations

1. **Start Simple** - Begin with basic listing, add filters later
2. **Test Category Filters** - Verify correct category IDs are used
3. **Customize Template** - Adjust template to match original DIVI layout
4. **Responsive Testing** - Test grid on mobile to ensure proper stacking
5. **Performance** - Limit posts per page if displaying many on one page

## Related Blocks

- **[core/group](core_group.md)** - Container for query block
- **[core/columns](core_columns.md)** - Alternative layout option
- **[core/post-template](core_post_template.md)** - Template for posts
- **[core/query-pagination](core_query_pagination.md)** - Pagination controls

## Further Reading

- [WordPress Query Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/query/)
- [WordPress Post Queries](https://developer.wordpress.org/plugins/posts/post-queries/)
- [Template Structure Guide](https://developer.wordpress.org/block-editor/getting-started/fundamentals/block-templates/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation
**Instances in Current Site:** 8 DIVI blog modules
**Conversion Priority:** LOW - Specialized use (archives only)
