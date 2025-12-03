# DIVI Shortcode: et_pb_tab

## Overview
The Tab shortcode represents an **individual tab within a tabs container** (et_pb_tabs). Each tab has a title that appears in the tab navigation and content that appears when the tab is selected. Tabs are used to organize related content into collapsible sections.

## Hierarchy
- **Parent:** `et_pb_tabs` (required)
- **Children:** None directly, but contains HTML content
- **Usage context:** Individual content panel within a tabbed interface

## Parameters

### Content Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `title` | text | empty | Tab label/title (required) | `title="Všechny akce"` |
| `(content)` | HTML | empty | Tab content (goes inside tags) | `<p>Content here</p>` |

### Display Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `_builder_version` | string | "4.16" | Divi builder version | `_builder_version="4.16"` |

### Advanced Parameters
| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `module_id` | string | empty | CSS ID for tab content | `module_id="tab-1"` |
| `module_class` | string | empty | CSS classes | `module_class="tab-content"` |

## Real Usage Examples

### Example 1: Simple Text Tab
```
[et_pb_tab title="AKCE ŠKOLKY"]
  <p>[akce cat="4" pocet="3"]</p>
[/et_pb_tab]
```

### Example 2: Tab with Rich HTML Content
```
[et_pb_tab title="O Škole"]
  <h3>Waldorfská Pedagogika</h3>
  <p>Waldorfská škola klade důraz na harmonický rozvoj paměti,
     fantazie a tvůrčích schopností.</p>
  <ul>
    <li>Individuální přístup</li>
    <li>Aktivní učení</li>
    <li>Rozvinutí osobnosti</li>
  </ul>
[/et_pb_tab]
```

### Example 3: Tab with Custom Shortcode (Events)
```
[et_pb_tab title="Všechny akce"]
  <p>[akce category="" pocet="5" wrapper="ol"]</p>
[/et_pb_tab]
```

### Example 4: Tab with Multiple Paragraphs
```
[et_pb_tab title="Vzdělání"]
  <h2>Náš Studijní Program</h2>
  <p>Waldorfská pedagogika kombinuje tradiční vědomosti
     s praktickými dovednostmi.</p>
  <p>Jednotlivé předměty jsou propojeny v tematické jednotě,
     která podporuje celistvý pohled na svět.</p>
  <p>Speciální pozornost věnujeme rozvoji uměleckého cítění
     a tvůrčího myšlení.</p>
[/et_pb_tab]
```

### Example 5: Tab with Images and Text
```
[et_pb_tab title="Galerie"]
  <h3>Školní Prostory</h3>
  <p>Naše moderní prostředí podporuje aktívní vzdělání.</p>
  <img src="http://waldorf-brno.cz/uploads/classroom1.jpg" alt="Classroom" />
  <img src="http://waldorf-brno.cz/uploads/classroom2.jpg" alt="Library" />
[/et_pb_tab]
```

## Conversion Complexity
**Rating:** LOW

**Reasoning:**
- Very simple structure: just a title and content wrapper
- Maps directly to tab content in any tab implementation
- Content inside is raw HTML (easily preserved)
- No complex parameters or styling on the tab itself
- Tab styling is handled by parent `et_pb_tabs` module
- Straightforward to extract and migrate
- Simplest module to convert once tab container is set up

## Notes
- **Must be a child of `et_pb_tabs`** - cannot be used standalone
- The `title` parameter becomes the clickable tab label
- Tab content goes **between** the opening and closing tags
- Tab **order is important** - tabs appear in the order they're defined
- Tab titles should be:
  - Concise (usually 1-3 words)
  - Descriptive of content
  - Unique within the tab group
- Content can include:
  - Plain text
  - HTML tags (h1-h6, p, ul/ol, blockquote, etc.)
  - Images and media
  - Custom shortcodes (e.g., `[akce]`)
  - Nested modules (with some limitations)
- **On this site:** Primarily used with custom `[akce]` shortcode for event listings
- Sixth most used module structure (tabs use 12 instances, tabs contain 24+ tab elements)
- Tab content is lazy-loaded - only loaded when tab is clicked
- CSS classes on tabs can be used to apply additional styling via custom CSS
- Tab IDs can be used for anchor linking in some implementations
- No responsive parameters - responsiveness is handled by parent tabs module
- Tab content is plain text inside the shortcode - HTML markup is preserved
- Long tab names may need special handling on mobile devices
- Tab switching is handled by JavaScript in the parent tabs module
- Consider SEO implications - hidden tab content may not be indexed equally
