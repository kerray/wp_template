<?php
/**
 * Headless API — /collection/{cpt} route.
 *
 * Generic lister for any registered, PUBLIC custom post type: standard post
 * fields + all public meta + the terms of every taxonomy attached to that CPT.
 * Only published posts are returned — private/draft content is never exposed.
 * Unregistered or non-public CPTs return 404.
 *
 * A site that needs a bespoke shape (extra computed fields, theme helpers, a
 * different sort) should register its own route on the
 * `headless_api_register_routes` seam instead (see headless-api-site.example.php).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GET /wp-json/headless/v1/collection/{cpt}
 *
 * Response: array of {
 *   id, slug, title, excerpt, date, modified, link, featuredImage,
 *   cleanContent, status,
 *   meta:  { <public meta keys> },
 *   terms: { <taxonomy>: [{id, name, slug}, …] }
 *   [, raw, rendered]   // only when ?raw=1 with valid auth
 * }
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function headless_api_get_collection($request) {
    $cpt = (string) $request->get_param('cpt');
    $type = get_post_type_object($cpt);

    // 404 for unregistered / non-public CPTs (never leak internal types).
    if (!$type || empty($type->public)) {
        return new WP_REST_Response(array(
            'code'    => 'headless_api_unknown_collection',
            'message' => sprintf('No public post type "%s".', $cpt),
        ), 404);
    }

    $want_raw = headless_api_wants_raw($request);
    if ($want_raw && !headless_api_check_auth($request)) {
        return headless_api_auth_error();
    }

    $posts = get_posts(headless_api_paging_args($request, array(
        'post_type'   => $cpt,
        'post_status' => 'publish', // published only — no private/draft exposure
        'orderby'     => 'date',
        'order'       => 'DESC',
    )));

    $taxonomies = get_object_taxonomies($cpt, 'names');

    $data = array();
    foreach ($posts as $post) {
        $item = array(
            'id'            => $post->ID,
            'slug'          => $post->post_name,
            'title'         => get_the_title($post->ID),
            'excerpt'       => headless_api_excerpt(
                                   $post->post_excerpt !== '' ? $post->post_excerpt : $post->post_content
                               ),
            'status'        => $post->post_status,
            'date'          => get_post_time('c', true, $post->ID),
            'modified'      => get_post_modified_time('c', true, $post->ID),
            'link'          => get_permalink($post->ID),
            'featuredImage' => headless_api_featured_image($post->ID),
            'cleanContent'  => headless_api_clean_content($post->post_content, $post),
            'meta'          => headless_api_public_meta($post->ID),
            'terms'         => headless_api_post_terms($post->ID, $taxonomies),
        );

        if ($want_raw) {
            // Edit-level data — token-gated. See auth.php.
            $item['raw']      = $post->post_content;
            $item['rendered'] = apply_filters('the_content', $post->post_content);
        }

        $data[] = $item;
    }

    return new WP_REST_Response($data, 200);
}
