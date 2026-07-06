<?php
/**
 * Headless API — bootstrap.
 *
 * Generic, reusable JSON feed for an Astro (or any) static frontend, namespaced
 * under `headless/v1`. Ships as part of astro-core and is site-agnostic: it
 * exposes pages, posts, site info and generic custom-post-type collections, plus
 * two extension seams (an action + a filter) so each site can bolt on its own
 * routes and content transforms WITHOUT editing this directory.
 *
 * Routes (all GET, all return WP_REST_Response):
 *   GET /wp-json/headless/v1/pages              published pages
 *   GET /wp-json/headless/v1/posts              published posts
 *   GET /wp-json/headless/v1/site               site meta
 *   GET /wp-json/headless/v1/collection/{cpt}   generic public CPT list
 *
 * Extension seams (documented in ../README.md and ../headless-api-site.example.php):
 *   do_action('headless_api_register_routes', $namespace)  — add site routes
 *   apply_filters('headless_api_clean_content', $value, $post)  — transform cleanContent
 *
 * mu-plugins load BEFORE themes, so any call to a theme-provided helper is
 * wrapped in function_exists() and executed inside a REST callback (which runs
 * on rest_api_init, after the theme has loaded).
 *
 * PHP 7.4 compatible (WEDOS shared hosting): no enums, no readonly, no arrow-fn
 * requirement, arrays written array() style to match the source plugin.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('HEADLESS_API_VERSION')) {
    define('HEADLESS_API_VERSION', '1.0.0');
}
if (!defined('HEADLESS_API_NAMESPACE')) {
    define('HEADLESS_API_NAMESPACE', 'headless/v1');
}
if (!defined('HEADLESS_API_DIR')) {
    define('HEADLESS_API_DIR', __DIR__);
}

require_once HEADLESS_API_DIR . '/includes/auth.php';
require_once HEADLESS_API_DIR . '/includes/clean-content.php';
require_once HEADLESS_API_DIR . '/includes/pages.php';
require_once HEADLESS_API_DIR . '/includes/posts.php';
require_once HEADLESS_API_DIR . '/includes/site.php';
require_once HEADLESS_API_DIR . '/includes/collection.php';

/**
 * Register the core routes, then fire the extension seam so per-site plugins
 * (headless-api-site.php) can register their own routes on the same namespace.
 *
 * @return void
 */
function headless_api_register_rest_routes() {
    $ns = HEADLESS_API_NAMESPACE;

    // Shared arg schema: `raw` gates edit-level fields (see auth.php); per_page
    // and page are trivial paging passthroughs (default: everything).
    $raw_args = array(
        'raw' => array(
            'description' => 'Include token-gated raw/rendered content fields.',
            'type'        => 'boolean',
            'default'     => false,
        ),
        'per_page' => array(
            'description' => 'Items per page (omit for all).',
            'type'        => 'integer',
        ),
        'page' => array(
            'description' => 'Page number (used with per_page).',
            'type'        => 'integer',
            'default'     => 1,
        ),
    );

    register_rest_route($ns, '/pages', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'headless_api_get_pages',
        'args'                => $raw_args,
    ));

    register_rest_route($ns, '/posts', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'headless_api_get_posts',
        'args'                => $raw_args,
    ));

    register_rest_route($ns, '/site', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'headless_api_get_site',
    ));

    register_rest_route($ns, '/collection/(?P<cpt>[a-zA-Z0-9_-]+)', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'headless_api_get_collection',
        'args'                => array_merge($raw_args, array(
            'cpt' => array(
                'description' => 'A registered, public custom post type slug.',
                'type'        => 'string',
                'required'    => true,
            ),
        )),
    ));

    /**
     * Extension seam: register additional site-specific routes here.
     *
     * @param string $ns The REST namespace ('headless/v1').
     */
    do_action('headless_api_register_routes', $ns);
}
add_action('rest_api_init', 'headless_api_register_rest_routes');

/* -------------------------------------------------------------------------- *
 * Shared field/response helpers (used by several route callbacks).
 * -------------------------------------------------------------------------- */

/**
 * Whether the request asked for the token-gated raw/rendered fields (?raw=1).
 *
 * @param WP_REST_Request $request
 * @return bool
 */
function headless_api_wants_raw($request) {
    return (bool) rest_sanitize_boolean($request->get_param('raw'));
}

/**
 * Merge trivial ?per_page & ?page paging onto a get_posts() args array.
 * Default (no per_page) is -1 (everything) — these sites are small.
 *
 * @param WP_REST_Request $request
 * @param array           $base    Base get_posts() args.
 * @return array
 */
function headless_api_paging_args($request, $base) {
    $per_page = $request->get_param('per_page');
    if ($per_page !== null && (int) $per_page > 0) {
        $base['posts_per_page'] = (int) $per_page;
        $base['paged']          = max(1, (int) $request->get_param('page'));
    } else {
        $base['posts_per_page'] = -1;
    }
    return $base;
}

/**
 * Featured image descriptor, or null when the post has no thumbnail.
 *
 * @param int $post_id
 * @return array<string,mixed>|null
 */
function headless_api_featured_image($post_id) {
    $thumb_id = get_post_thumbnail_id($post_id);
    if (!$thumb_id) {
        return null;
    }
    $src = wp_get_attachment_image_src($thumb_id, 'full');
    if (!$src) {
        return null;
    }
    return array(
        'id'     => (int) $thumb_id,
        'url'    => $src[0],
        'width'  => (int) $src[1],
        'height' => (int) $src[2],
        'alt'    => (string) get_post_meta($thumb_id, '_wp_attachment_image_alt', true),
    );
}

/**
 * All public (non-protected, non `_`-prefixed) post meta, unserialized.
 * Single-value keys collapse to a scalar; multi-value keys stay arrays.
 *
 * @param int $post_id
 * @return array<string,mixed>
 */
function headless_api_public_meta($post_id) {
    $all = get_post_meta($post_id);
    $out = array();
    if (!is_array($all)) {
        return $out;
    }
    foreach ($all as $key => $values) {
        if ($key === '' || $key[0] === '_' || is_protected_meta($key, 'post')) {
            continue;
        }
        $clean = array_map('maybe_unserialize', (array) $values);
        $out[$key] = (count($clean) === 1) ? $clean[0] : $clean;
    }
    return $out;
}

/**
 * Terms of the given taxonomies for a post, grouped by taxonomy.
 *
 * @param int      $post_id
 * @param string[] $taxonomies
 * @return array<string,array<int,array<string,mixed>>>
 */
function headless_api_post_terms($post_id, $taxonomies) {
    $out = array();
    foreach ($taxonomies as $tax) {
        $terms = wp_get_post_terms($post_id, $tax);
        if (is_wp_error($terms)) {
            continue;
        }
        $out[$tax] = array();
        foreach ($terms as $term) {
            $out[$tax][] = array(
                'id'   => (int) $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            );
        }
    }
    return $out;
}
