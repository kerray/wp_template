# content-sync — raw WordPress content ⇄ flat files

Round-trips WordPress content to editable, version-controllable flat files and
back, with full fidelity. Unlike a Markdown export, this keeps the **raw**
`post_content` plus all post fields, **post meta**, and **taxonomy terms**, so an
export → import cycle reproduces the post exactly.

Generic across post types (pages, posts, and any custom post type). Container-name
agnostic — it talks to the `wordpress` compose service, not a hardcoded container.

## Layout on disk

```
content/<post_type>/<slug>/
├── content.html   # raw post_content — edit this; it wins on import
└── bundle.json    # post fields + all post meta + taxonomy terms
```

## Commands

| Task | Command |
|------|---------|
| Export one item | `just content-export <post_type> <slug>` |
| Export a whole type | `just content-export-all <post_type>` |
| Export every public type | `just content-export-everything` |
| Import one item | `just content-import <post_type> <slug>` |
| Import a whole type | `just content-import-all <post_type>` |
| Import everything | `just content-import-everything` |

Or call the scripts directly: `python3 scripts/content-sync/export.py --all page`.

## How matching works

Posts are matched on **`post_name` (slug) + `post_type`**. Importing an item that
already exists updates it in place; otherwise a new post is created. Authors are
resolved by login, parents by slug, and taxonomy terms are created if missing.

## Notes

- `content.html` is authoritative for the body on import, so you can hand-edit
  the HTML and re-import without touching `bundle.json`.
- The `content/` directory is gitignored by default (it holds site content, not
  template code). Commit it deliberately if you want content under version control.
- This is distinct from `scripts/divi-migration/`, which is a one-way DIVI→Gutenberg
  migration toolkit; content-sync is a general-purpose, lossless round-trip.

## Known limitations

- **Additive, not authoritative.** Import replaces the meta keys and terms present
  in the bundle, but does not delete meta/terms that exist only on the target post.
  Re-importing an item won't strip data you removed from the files.
- **Empty-slug posts** (auto-drafts) export to an `id-N/` directory and are always
  *created*, never matched to an existing post (matching on an empty slug is unsafe).
  Give a post a real slug before relying on update-in-place.
- **Hierarchical taxonomy trees** are exported as a flat term list; on a fresh site,
  child terms are recreated at the top level (parent relationships are not preserved).
- **Serialized PHP *objects*** in post meta are not round-tripped (they become arrays).
  Plain scalars and arrays — the overwhelming majority of meta — are fine.

For most pages/posts/CPT content these don't apply; they matter mainly for complex
migrations, where `scripts/divi-migration/` or a full DB export may fit better.
