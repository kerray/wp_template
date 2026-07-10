<?php
/**
 * Headless API — /posts route.
 *
 * All published posts, with their categories and a cleaned `cleanContent`. The
 * edit-level `raw`/`rendered` fields follow the same `?raw=1` + bearer-token
 * rule as /pages (see auth.php).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GET /wp-json/headless/v1/posts
 *
 * Response: array of {
 *   id, slug, title, excerpt, date, modified,
 *   categories: [{id, name, slug}], featuredImage, cleanContent, engine
 *   [, raw, rendered]   // only when ?raw=1 with valid auth; raw is the
 *                       // canonical source for the detected engine
 * }
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function headless_api_get_posts($request) {
    $want_raw = headless_api_wants_raw($request);
    if ($want_raw && !headless_api_check_auth($request)) {
        return headless_api_auth_error();
    }

    $posts = get_posts(headless_api_paging_args($request, array(
        'post_type'   => 'post',
        'post_status' => 'publish',
        'orderby'     => 'date',
        'order'       => 'DESC',
    )));

    $data = array();
    foreach ($posts as $post) {
        $categories = array();
        $terms = wp_get_post_terms($post->ID, 'category');
        if (!is_wp_error($terms)) {
            foreach ($terms as $term) {
                $categories[] = array(
                    'id'   => (int) $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                );
            }
        }

        $item = array(
            'id'            => $post->ID,
            'slug'          => $post->post_name,
            'title'         => get_the_title($post->ID),
            'excerpt'       => headless_api_excerpt(
                                   $post->post_excerpt !== '' ? $post->post_excerpt : $post->post_content
                               ),
            'date'          => get_post_time('c', true, $post->ID),
            'modified'      => get_post_modified_time('c', true, $post->ID),
            'categories'    => $categories,
            'featuredImage' => headless_api_featured_image($post->ID),
            'cleanContent'  => headless_api_clean_content($post->post_content, $post),
            'engine'        => headless_api_detect_engine($post),
        );

        if ($want_raw) {
            // Edit-level data — token-gated. See auth.php. `raw` is the canonical
            // source per the detected engine (Markdown text for markdown posts,
            // post_content otherwise); `rendered` is the filtered HTML body.
            $item['raw']      = headless_api_raw_source($post, $item['engine']);
            $item['rendered'] = apply_filters('the_content', $post->post_content);
        }

        $data[] = $item;
    }

    return new WP_REST_Response($data, 200);
}
