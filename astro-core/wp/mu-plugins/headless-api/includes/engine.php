<?php
/**
 * Headless API — content engine detection + canonical raw source.
 *
 * Every page/post/CPT item exposed by the headless feed carries an `engine`
 * classification so the Astro (or any) frontend knows how to interpret the
 * canonical `raw` source it receives under ?raw=1:
 *
 *   'markdown'  — canonical source is Markdown text (source of truth), stored in
 *                 the post_content_filtered column and flagged by the
 *                 `_markdown_enabled` post meta. post_content holds a rendered
 *                 HTML cache for classic viewing/preview only.
 *   'gutenberg' — post_content is Gutenberg block markup ('<!-- wp:' comments).
 *   'divi'      — post_content is DIVI builder shortcode source ('[et_pb_').
 *   'html'      — post_content is plain/raw HTML (the fallback).
 *
 * Detection order (first match wins):
 *   1. explicit post meta `_headless_engine` override (if a known engine)
 *   2. Markdown source present (post_content_filtered non-empty AND
 *      `_markdown_enabled` == '1')
 *   3. post_content contains '<!-- wp:'   -> 'gutenberg'
 *   4. post_content contains '[et_pb_'    -> 'divi'
 *   5. otherwise                          -> 'html'
 *
 * The Markdown storage convention (post_content_filtered + `_markdown_enabled`)
 * is a DATA convention only — this generic layer has NO code dependency on the
 * markdown-content editor plugin; any producer (the editor, a wp-cli conversion
 * script) that follows the convention is detected here. See docs/MARKDOWN_BACKEND.md.
 *
 * SECURITY: `engine` is a non-sensitive classification and is ALWAYS exposed.
 * The canonical `raw` source stays token-gated (see auth.php) exactly like the
 * pre-existing raw/rendered fields — callers must present a valid bearer token.
 *
 * PHP 7.4 compatible (WEDOS shared hosting).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * The set of known content engines.
 *
 * @return string[]
 */
function headless_api_engines() {
    return array('markdown', 'gutenberg', 'divi', 'html');
}

/**
 * The canonical Markdown source for a post following the storage convention,
 * or '' when the post is not a Markdown post.
 *
 * Convention: markdown text lives in the `post_content_filtered` column and the
 * post carries `_markdown_enabled` == '1'. Both are required so that a
 * post_content_filtered value written by some OTHER plugin is never mistaken for
 * canonical Markdown.
 *
 * @param WP_Post $post
 * @return string
 */
function headless_api_markdown_source($post) {
    if (!($post instanceof WP_Post)) {
        return '';
    }
    $enabled = get_post_meta($post->ID, '_markdown_enabled', true);
    if ($enabled !== '1') {
        return '';
    }
    $src = isset($post->post_content_filtered) ? (string) $post->post_content_filtered : '';
    return $src !== '' ? $src : '';
}

/**
 * Classify a post's content engine. See file header for the detection order.
 *
 * @param WP_Post|int $post
 * @return string One of headless_api_engines().
 */
function headless_api_detect_engine($post) {
    $post = get_post($post);
    if (!($post instanceof WP_Post)) {
        return 'html';
    }

    // 1. Explicit override wins (only if it names a known engine).
    $override = get_post_meta($post->ID, '_headless_engine', true);
    if (is_string($override) && in_array($override, headless_api_engines(), true)) {
        return $override;
    }

    // 2. Markdown source present.
    if (headless_api_markdown_source($post) !== '') {
        return 'markdown';
    }

    $content = (string) $post->post_content;

    // 3. Gutenberg block markup.
    if (strpos($content, '<!-- wp:') !== false) {
        return 'gutenberg';
    }

    // 4. DIVI builder shortcodes.
    if (strpos($content, '[et_pb_') !== false) {
        return 'divi';
    }

    // 5. Fallback: plain/raw HTML.
    return 'html';
}

/**
 * The canonical raw source for a post, per its engine:
 *   - markdown  -> the Markdown text (post_content_filtered)
 *   - otherwise -> post_content (block markup / DIVI shortcodes / raw HTML)
 *
 * This is EDIT-LEVEL data and callers MUST gate it behind headless_api_check_auth()
 * exactly like the pre-existing `raw` field.
 *
 * @param WP_Post|int $post
 * @param string|null $engine Optional precomputed engine to avoid re-detecting.
 * @return string
 */
function headless_api_raw_source($post, $engine = null) {
    $post = get_post($post);
    if (!($post instanceof WP_Post)) {
        return '';
    }
    if ($engine === null) {
        $engine = headless_api_detect_engine($post);
    }
    if ($engine === 'markdown') {
        $src = headless_api_markdown_source($post);
        if ($src !== '') {
            return $src;
        }
        // An override claimed 'markdown' but no source is stored — fall through
        // to post_content so `raw` is never empty for a real body.
    }
    return (string) $post->post_content;
}
