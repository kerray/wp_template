<?php
/**
 * Headless API — /pages route.
 *
 * All published pages in the shape the Astro data layer expects: a cleaned,
 * headless-renderable `cleanContent` plus navigation metadata. With `?raw=1`
 * AND a valid bearer token the edit-level `raw` (unfiltered post_content) and
 * `rendered` (apply_filters('the_content')) fields are added; without auth,
 * `?raw=1` returns 401 (see auth.php).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GET /wp-json/headless/v1/pages
 *
 * Response: array of {
 *   id, slug, title, excerpt, cleanContent, menuOrder, parent,
 *   date, modified, link, featuredImage
 *   [, raw, rendered]   // only when ?raw=1 with valid auth
 * }
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function headless_api_get_pages($request) {
    $want_raw = headless_api_wants_raw($request);
    if ($want_raw && !headless_api_check_auth($request)) {
        return headless_api_auth_error();
    }

    $pages = get_posts(headless_api_paging_args($request, array(
        'post_type'   => 'page',
        'post_status' => 'publish',
        'orderby'     => 'menu_order title',
        'order'       => 'ASC',
    )));

    $data = array();
    foreach ($pages as $page) {
        $item = array(
            'id'            => $page->ID,
            'slug'          => $page->post_name,
            'title'         => get_the_title($page->ID),
            'excerpt'       => headless_api_excerpt(
                                   $page->post_excerpt !== '' ? $page->post_excerpt : $page->post_content
                               ),
            'cleanContent'  => headless_api_clean_content($page->post_content, $page),
            'menuOrder'     => (int) $page->menu_order,
            'parent'        => (int) $page->post_parent,
            'date'          => get_post_time('c', true, $page->ID),
            'modified'      => get_post_modified_time('c', true, $page->ID),
            'link'          => get_permalink($page->ID),
            'featuredImage' => headless_api_featured_image($page->ID),
        );

        if ($want_raw) {
            // Edit-level data — token-gated. See auth.php.
            $item['raw']      = $page->post_content;
            $item['rendered'] = apply_filters('the_content', $page->post_content);
        }

        $data[] = $item;
    }

    return new WP_REST_Response($data, 200);
}
