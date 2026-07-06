<?php
/**
 * Headless API — /site route.
 *
 * Basic site metadata the frontend needs to render titles, set <html lang>, and
 * resolve the front page / posts page.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GET /wp-json/headless/v1/site
 *
 * Response: {
 *   name, description, home, language,
 *   frontPageId  (int|null),   // 'page_on_front' when a static page is set
 *   postsPageId  (int|null)    // 'page_for_posts' when a blog page is set
 * }
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function headless_api_get_site($request) {
    $front_id = (int) get_option('page_on_front');
    $posts_id = (int) get_option('page_for_posts');

    $data = array(
        'name'        => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'home'        => home_url('/'),
        'language'    => get_bloginfo('language'),
        'frontPageId' => $front_id > 0 ? $front_id : null,
        'postsPageId' => $posts_id > 0 ? $posts_id : null,
    );

    return new WP_REST_Response($data, 200);
}
