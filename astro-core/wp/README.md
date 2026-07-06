# astro-core/wp — WordPress-side headless API

The generic **Headless API** mu-plugin that feeds the Astro static frontend. It
is site-agnostic, namespaced under `headless/v1`, and ships as raw PHP (no build
step). Each site extends it — without editing this directory — through two hooks.

Everything here is template-owned (`TEMPLATE_DIRS`): it is overwritten on every
`sync_to_sites.sh` run, so **sites never edit these files**. Per-site routes go
in `headless-api-site.php` (see below), which is sync-protected.

## Layout

```
astro-core/wp/
├── README.md                          # this file
└── mu-plugins/
    ├── headless-api.php               # loader STUB (autoloaded by WP)
    ├── headless-api/                  # the actual plugin (NOT autoloaded)
    │   ├── plugin.php                 # bootstrap: constants, routes, shared helpers
    │   └── includes/
    │       ├── auth.php               # shared bearer-token auth (raw fields)
    │       ├── clean-content.php      # headless_api_clean_content() + excerpt
    │       ├── pages.php              # /pages
    │       ├── posts.php              # /posts
    │       ├── site.php               # /site
    │       └── collection.php         # /collection/{cpt}
    └── headless-api-site.example.php  # reference per-site extension (waldorf)
```

**Why a loader stub?** WordPress autoloads mu-plugins only for `.php` files
placed *directly* in `wp-content/mu-plugins/` — it does **not** descend into
subdirectories. `headless-api.php` is that autoloaded entry point; it simply
`require`s `headless-api/plugin.php`, which pulls in the rest.

## Install

Copy **both** the loader stub and the plugin directory into the site's
mu-plugins folder:

```bash
# via the Justfile recipe (Agent E) — copies into src/wp-content/mu-plugins/:
just astro-wp-plugin            # local copy
just astro-wp-plugin --remote   # + FTP upload to WEDOS

# or manually:
cp  astro-core/wp/mu-plugins/headless-api.php     src/wp-content/mu-plugins/
cp -r astro-core/wp/mu-plugins/headless-api       src/wp-content/mu-plugins/
```

Then, once per site, seed the per-site extension and adapt it:

```bash
cp astro-core/wp/mu-plugins/headless-api-site.example.php \
   src/wp-content/mu-plugins/headless-api-site.php
```

`headless-api-site.php` is sync-protected (never overwritten). The `.example.php`
reference is template-owned and refreshed on sync.

## Routes (namespace `headless/v1`)

All routes are `GET` and return a `WP_REST_Response`. Base URL:
`https://<wp-host>/wp-json/headless/v1`.

| Route                | Purpose                    | Auth        |
|----------------------|----------------------------|-------------|
| `/pages`             | published pages            | public (raw fields token-gated) |
| `/posts`             | published posts            | public (raw fields token-gated) |
| `/site`              | site metadata              | public      |
| `/collection/{cpt}`  | any public CPT + meta+terms| public (raw fields token-gated) |

### `/pages`

```jsonc
[{
  "id": 42, "slug": "o-skole", "title": "O škole",
  "excerpt": "…40-word plain-text…",
  "cleanContent": "<p>…DIVI-flattened / passthrough HTML…</p>",
  "menuOrder": 3, "parent": 0,
  "date": "2024-01-01T00:00:00+00:00",
  "modified": "2024-06-01T00:00:00+00:00",
  "link": "https://…/o-skole/",
  "featuredImage": { "id": 9, "url": "…", "width": 1200, "height": 630, "alt": "…" }
  // with ?raw=1 + valid token, additionally:
  // "raw": "<raw post_content>", "rendered": "<apply_filters the_content>"
}]
```

`?per_page=&page=` supported (default: all pages, ordered `menu_order title ASC`).

### `/posts`

Same envelope as `/pages` minus `menuOrder`/`parent`, plus:

```jsonc
{ "categories": [{ "id": 5, "name": "Novinky", "slug": "novinky" }] }
```

Ordered `date DESC`. `?raw=1` and `?per_page=&page=` behave as for `/pages`.

### `/site`

```jsonc
{
  "name": "…", "description": "…",
  "home": "https://…/", "language": "cs-CZ",
  "frontPageId": 12,   // or null
  "postsPageId": 34    // or null
}
```

### `/collection/{cpt}`

Generic lister for any **registered, public** custom post type. Unregistered or
non-public types → `404`. Only **published** posts are returned (no private/draft
exposure).

```jsonc
[{
  "id": 101, "slug": "…", "title": "…", "excerpt": "…", "status": "publish",
  "date": "…", "modified": "…", "link": "…",
  "featuredImage": { … } | null,
  "cleanContent": "…",
  "meta":  { "custom_field": "value", "…": "…" },   // public, non `_`-prefixed, unserialized
  "terms": { "kategorie": [{ "id": 7, "name": "…", "slug": "…" }] }
  // with ?raw=1 + valid token: "raw", "rendered"
}]
```

`?per_page=&page=` supported (default: all, ordered `date DESC`). When a CPT
needs a bespoke shape (computed fields, theme helpers, custom sort), register a
dedicated route on the extension seam instead — see `headless-api-site.php`.

## Auth — raw/rendered content (edit-level data)

`raw` (unfiltered `post_content`) and `rendered` (`apply_filters('the_content')`)
are **edit-level data**: raw bodies can contain unpublished builder internals,
editor-only shortcodes and private notes. They are only returned when the request
both sets `?raw=1` **and** carries a valid bearer token. Without a token, `?raw=1`
returns **401**. `?raw=1` is what both content adapters (Gutenberg / DIVI) use at
build time; the frontend always falls back to `cleanContent` if the token is
absent, so a build never fails.

Configure the shared token (first non-empty wins):

```php
// wp-config.php  (preferred — not stored in the DB)
define('HEADLESS_API_TOKEN', 'a-long-random-secret');
```

```bash
# or as an option (hosts without wp-config access)
wp option update headless_api_token 'a-long-random-secret'
```

Request:

```
Authorization: Bearer a-long-random-secret
```

Comparison is constant-time (`hash_equals`). If **no** token is configured, auth
fails closed and raw content stays private. Always serve over HTTPS — the token
is a shared bearer secret. On the Astro side it lives in `.env` as
`HEADLESS_API_TOKEN`.

## Extension seams

Two seams let a site extend the API without touching template-owned files. Both
are demonstrated in `headless-api-site.example.php`.

### 1. `do_action('headless_api_register_routes', $namespace)`

Fires on `rest_api_init` right after the core routes register. Add your own
routes on the same `headless/v1` namespace:

```php
add_action('headless_api_register_routes', function ($namespace) {
    register_rest_route($namespace, '/akce', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'my_site_get_akce',
    ));
});
```

### 2. `apply_filters('headless_api_clean_content', $value, $post)`

Runs at the end of `headless_api_clean_content()` — the last chance to transform
the cleaned body used by `/pages`, `/posts` and `/collection/{cpt}`:

```php
add_filter('headless_api_clean_content', function ($value, $post) {
    return trim(str_replace('[kalendar]', '', $value)); // e.g. drop a shortcode
}, 10, 2);
```

## Notes / conventions

- **mu-plugins load before themes.** Any call to a theme-provided helper must be
  wrapped in `function_exists()` and made inside a REST callback (which runs
  after the theme is loaded). The core plugin needs no theme helpers; the
  site example (`get_akce_*`, `get_available_school_years`, …) shows the pattern.
- **PHP 7.4 compatible** — WEDOS shared hosting. No enums/readonly/match; arrays
  in `array()` style to match the source plugin.
- **`headless_api_clean_content()` only DIVI-flattens when the body contains
  `[et_pb_`.** Gutenberg / plain bodies pass through untouched (the frontend
  adapter or the filter handles those).
