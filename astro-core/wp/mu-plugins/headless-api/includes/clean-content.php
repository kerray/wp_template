<?php
/**
 * Headless API — content cleaning.
 *
 * Ports waldorf_headless_clean_content() (v1.0.0) into the generic layer as
 * headless_api_clean_content(). The DIVI-flatten pipeline only runs when the
 * body actually contains a DIVI shortcode ('[et_pb_'), so Gutenberg/plain sites
 * pass through untouched. The final value is always run through the
 * `headless_api_clean_content` filter so a site can extend or replace it.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Build a clean plain-text excerpt from raw post content.
 *
 * DIVI stores content as [et_pb_*] shortcodes that are NOT registered in the
 * REST context, so strip_shortcodes() alone leaves them behind — a regex removes
 * any remaining bracketed tokens as a fallback.
 *
 * @param string $raw
 * @param int    $words
 * @return string
 */
function headless_api_excerpt($raw, $words = 40) {
    $text = strip_shortcodes($raw);                        // registered shortcodes
    $text = preg_replace('/\[\/?[^\]]*\]/', ' ', $text);   // any leftover [..] tokens
    $text = wp_strip_all_tags($text);
    $text = preg_replace('/\s+/', ' ', $text);
    return wp_trim_words(trim($text), (int) $words);
}

/**
 * Flatten a body to clean, headless-renderable HTML.
 *
 * DIVI stores page bodies as [et_pb_section]…[et_pb_text]…[/…] shortcodes whose
 * CSS is generated dynamically by the theme, so they never render headlessly.
 * When DIVI markup is present this keeps the inner HTML of content modules (text,
 * plus image/button rebuilt as <img>/<a>) and drops the layout wrappers,
 * flattening multi-column DIVI to a clean single-column article.
 *
 * When the body is NOT DIVI (Gutenberg blocks, plain HTML, Markdown) it is left
 * untouched here — the frontend adapter / the `headless_api_clean_content` filter
 * is the right place to transform those.
 *
 * This is the LOWER-FIDELITY fallback path. A curated frontend entry (e.g. an
 * Astro Markdown page) is preferred per-page and overrides this in the frontend.
 *
 * NOTE: strip_shortcodes() does NOT remove [et_pb_*] in the REST context (they
 * aren't registered there), so a regex fallback that eats any leftover [...]
 * token is required.
 *
 * @param string       $content Raw post_content.
 * @param WP_Post|null $post    The post (passed to the filter for context).
 * @return string
 */
function headless_api_clean_content($content, $post = null) {
    $html = (string) $content;

    if (strpos($html, '[et_pb_') !== false) {
        // [et_pb_image src="…"] -> <img>
        $html = preg_replace_callback('/\[et_pb_image\b([^\]]*)\]/', function ($m) {
            if (preg_match('/\bsrc="([^"]+)"/', $m[1], $s)) {
                $alt = preg_match('/\balt="([^"]*)"/', $m[1], $a) ? $a[1] : '';
                return '<img src="' . esc_url($s[1]) . '" alt="' . esc_attr($alt) . '" />';
            }
            return '';
        }, $html);

        // [et_pb_button button_text="…" button_url="…"] -> <a>
        $html = preg_replace_callback('/\[et_pb_button\b([^\]]*)\]/', function ($m) {
            $text = preg_match('/\bbutton_text="([^"]*)"/', $m[1], $t) ? $t[1] : 'Odkaz';
            $url  = preg_match('/\bbutton_url="([^"]*)"/', $m[1], $u) ? $u[1] : '#';
            return '<p><a href="' . esc_url($url) . '">' . esc_html($text) . '</a></p>';
        }, $html);

        // Remove remaining DIVI wrappers (opening + closing), then any leftover
        // bracketed shortcode token (e.g. [wpseo_breadcrumb], [kalendar]).
        $html = preg_replace('/\[et_pb_\w+\b[^\]]*\]/', '', $html);
        $html = preg_replace('/\[\/et_pb_\w+\]/', '', $html);
        $html = preg_replace('/\[\/?[^\]]*\]/', '', $html);

        // Drop DIVI's empty heading spacers (<h3></h3>) and collapse blank runs.
        $html = preg_replace('/<h([1-6])[^>]*>\s*<\/h\1>/', '', $html);
        $html = preg_replace('/(\R\s*){3,}/', "\n\n", $html);
    }

    $value = trim($html);

    /**
     * Filter the cleaned content. Sites can DIVI-flatten differently, run a
     * Markdown transform, sanitize, etc.
     *
     * @param string       $value The cleaned content.
     * @param WP_Post|null $post  The source post.
     */
    return apply_filters('headless_api_clean_content', $value, $post);
}
