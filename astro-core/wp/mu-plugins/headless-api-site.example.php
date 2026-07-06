<?php
/**
 * Headless API — SITE EXTENSION (reference example).
 *
 * >>> copy to src/wp-content/mu-plugins/headless-api-site.php and adapt <<<
 *
 * This is the worked example for the Waldorf Brno site: it re-implements the
 * original waldorf/v1 {akce, categories, school-years} routes on top of the two
 * generic extension seams provided by the core headless-api plugin:
 *
 *   1. do_action('headless_api_register_routes', $namespace)
 *        Register per-site routes on the SAME namespace ('headless/v1'), so the
 *        site's custom feeds sit next to the generic /pages, /posts, /site,
 *        /collection/{cpt} routes.
 *
 *   2. apply_filters('headless_api_clean_content', $value, $post)
 *        Post-process the cleaned body per-site (not used below, but shown in a
 *        commented stub at the bottom).
 *
 * Load order: the core loader stub (headless-api.php) is autoloaded before this
 * file (mu-plugins load alphabetically; 'headless-api-site.php' sorts after
 * 'headless-api.php'), and route registration happens on rest_api_init, so all
 * core helpers (headless_api_excerpt, headless_api_check_auth, …) are available.
 *
 * mu-plugins load BEFORE themes, so every call to a theme-provided helper
 * (get_akce_category_colors, get_akce_sort_date, get_available_school_years, …)
 * stays wrapped in function_exists() and runs inside the REST callback (after
 * the theme has loaded). PHP 7.4 compatible.
 *
 * NAMING: when adapting, give your callbacks a prefix that cannot collide with
 * any legacy/site plugin still installed (a duplicate function name is a fatal
 * error that 500s all of wp-json). This example uses waldorf_astro_* precisely
 * because the legacy waldorf-headless-api.php plugin already owns
 * waldorf_headless_*.
 */

if (!defined('ABSPATH')) {
    exit;
}

/* -------------------------------------------------------------------------- *
 * Seam 1: register site routes.
 * -------------------------------------------------------------------------- */

add_action('headless_api_register_routes', function ($namespace) {
    register_rest_route($namespace, '/akce', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'waldorf_astro_get_akce',
    ));

    register_rest_route($namespace, '/categories', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'waldorf_astro_get_categories',
    ));

    register_rest_route($namespace, '/school-years', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'waldorf_astro_get_school_years',
    ));
});

/**
 * Category slug -> brand color, keyed by the ACTUAL `kategorie` taxonomy slugs
 * used in the live DB. The theme's get_akce_category_colors() keys on a
 * different intended slug set, so it alone falls back to purple for every real
 * term. This override fixes that headlessly; the theme map is merged underneath
 * for any future overlap.
 *
 * @return array<string,string>
 */
function waldorf_astro_category_colors() {
    $theme = function_exists('get_akce_category_colors') ? get_akce_category_colors() : array();
    $real = array(
        'akce-skoly'      => '#2d2864', // brand purple
        'akce-skolky'     => '#973528', // rust
        'akce-lycea'      => '#6b4c8a', // warm purple
        'akce-mraveniste' => '#4a7c59', // forest green
        'archive'         => '#7a7a6e', // earthy gray
    );
    return array_merge($theme, $real);
}

/**
 * All events (publish + archive), sorted chronologically, mapped to the field
 * shape the calendar JS consumes (AKCE_DATA) plus rendering extras.
 *
 * @return WP_REST_Response
 */
function waldorf_astro_get_akce() {
    // Return ALL events. We deliberately do NOT filter by the structured
    // zv_datum_sort meta: legacy DIVI events still use the old zv_datum text
    // field, and a meta_key order would silently drop them. We compute a sort
    // value per event below and order in PHP instead.
    $events = get_posts(array(
        'post_type'      => 'akce',
        'post_status'    => array('publish', 'archive'),
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ));

    $colors = waldorf_astro_category_colors();
    $default_color = '#2d2864';

    $data = array();
    foreach ($events as $event) {
        $terms      = wp_get_post_terms($event->ID, 'kategorie');
        $cat_slugs  = array();
        $cat_names  = array();
        $cat_colors = array();
        if (!is_wp_error($terms)) {
            foreach ($terms as $term) {
                $cat_slugs[]  = $term->slug;
                $cat_names[]  = $term->name;
                $cat_colors[] = isset($colors[$term->slug]) ? $colors[$term->slug] : $default_color;
            }
        }

        $thumb_id  = get_post_thumbnail_id($event->ID);
        $thumb_url = $thumb_id ? wp_get_attachment_image_url($thumb_id, 'large') : '';

        // Sort timestamp: prefer the structured value; fall back to the theme's
        // legacy-aware helper (parses zv_datum text / post_date) when present.
        $date_sort = get_post_meta($event->ID, 'zv_datum_sort', true);
        if (empty($date_sort) && function_exists('get_akce_sort_date')) {
            $date_sort = get_akce_sort_date($event->ID);
        }
        if (empty($date_sort)) {
            $date_sort = get_post_time('U', true, $event->ID);
        }

        // Reuse the core plugin's excerpt helper when present (it is, since the
        // core plugin loads first); guard defensively regardless.
        $excerpt_src = $event->post_excerpt !== '' ? $event->post_excerpt : $event->post_content;
        $excerpt = function_exists('headless_api_excerpt')
            ? headless_api_excerpt($excerpt_src)
            : wp_trim_words(wp_strip_all_tags(strip_shortcodes($excerpt_src)), 40);

        $data[] = array(
            'id'             => $event->ID,
            'slug'           => $event->post_name,
            'title'          => get_the_title($event->ID),
            'url'            => get_permalink($event->ID),
            'status'         => $event->post_status,
            'hasLink'        => function_exists('should_akce_have_link') ? should_akce_have_link($event->ID) : true,
            // Structured dates (unix timestamps in postmeta); may be '' on legacy
            // content, in which case dateDisplay carries the text date.
            'dateFrom'       => get_post_meta($event->ID, 'zv_datum_from', true),
            'dateTo'         => get_post_meta($event->ID, 'zv_datum_to', true),
            'dateMonth'      => get_post_meta($event->ID, 'zv_datum_month', true),
            'dateSort'       => (int) $date_sort,
            'dateDisplay'    => function_exists('get_akce_date_display') ? get_akce_date_display($event->ID) : get_post_meta($event->ID, 'zv_datum', true),
            'location'       => get_post_meta($event->ID, 'zv_misto', true),
            'categories'     => $cat_slugs,
            'categoryNames'  => $cat_names,
            'categoryColors' => $cat_colors,
            'excerpt'        => $excerpt,
            'content'        => apply_filters('the_content', $event->post_content),
            'image'          => $thumb_url,
            'modified'       => get_post_modified_time('c', true, $event->ID),
        );
    }

    // Chronological order (oldest -> newest) to match the calendar's ASC feed.
    usort($data, function ($a, $b) {
        return $a['dateSort'] <=> $b['dateSort'];
    });

    return new WP_REST_Response($data, 200);
}

/**
 * kategorie taxonomy terms with brand colors, built from the real taxonomy slugs
 * + the headless color override.
 *
 * @return WP_REST_Response
 */
function waldorf_astro_get_categories() {
    $terms  = get_terms(array('taxonomy' => 'kategorie', 'hide_empty' => false));
    $colors = waldorf_astro_category_colors();
    $out    = array();
    if (!is_wp_error($terms)) {
        foreach ($terms as $term) {
            $out[] = array(
                'slug'  => $term->slug,
                'name'  => $term->name,
                'color' => isset($colors[$term->slug]) ? $colors[$term->slug] : '#2d2864',
                'count' => $term->count,
            );
        }
    }
    return new WP_REST_Response($out, 200);
}

/**
 * School years that have events (newest-first), for the archive selector.
 *
 * @return WP_REST_Response
 */
function waldorf_astro_get_school_years() {
    $years = function_exists('get_available_school_years') ? get_available_school_years() : array();
    return new WP_REST_Response(array_values($years), 200);
}

/* -------------------------------------------------------------------------- *
 * Seam 2 (optional): per-site cleanContent transform.
 *
 * Uncomment to post-process the generic /pages & /posts cleanContent, e.g. to
 * rewrite upload URLs, strip a shortcode the core flatten missed, etc.
 * -------------------------------------------------------------------------- */

// add_filter('headless_api_clean_content', function ($value, $post) {
//     // Example: drop a leftover [kalendar] placeholder line.
//     return trim(str_replace('[kalendar]', '', $value));
// }, 10, 2);
