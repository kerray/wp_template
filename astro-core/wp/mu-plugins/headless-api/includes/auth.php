<?php
/**
 * Headless API — shared bearer-token authentication.
 *
 * SECURITY: the `raw` and `rendered` content fields are EDIT-LEVEL data. Raw
 * post_content can carry unpublished builder internals, editor-only shortcodes,
 * private notes and other material that is deliberately NOT in the public
 * cleaned feed; `rendered` is the fully filtered body. Both are therefore only
 * exposed when the caller presents a valid bearer token. The public feed stays
 * limited to published, cleaned fields (title, excerpt, cleanContent, …).
 *
 * Token source (first non-empty wins):
 *   1. constant HEADLESS_API_TOKEN     — define('HEADLESS_API_TOKEN', '…') in
 *                                        wp-config.php (preferred: not in the DB).
 *   2. option   'headless_api_token'   — fallback for hosts without wp-config
 *                                        access (settable via WP-CLI/UI).
 *
 * The token is compared with hash_equals() (constant-time) against the bearer
 * value of the "Authorization: Bearer <token>" request header. If NO token is
 * configured, auth always fails closed — raw content stays private by default.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * The configured shared token, or '' when none is set.
 *
 * @return string
 */
function headless_api_token() {
    if (defined('HEADLESS_API_TOKEN') && HEADLESS_API_TOKEN !== '') {
        return (string) HEADLESS_API_TOKEN;
    }
    $option = get_option('headless_api_token', '');
    return is_string($option) ? $option : '';
}

/**
 * Extract the bearer credential from the request's Authorization header.
 *
 * @param WP_REST_Request $request
 * @return string  The token portion, or '' when absent/malformed.
 */
function headless_api_bearer_token($request) {
    $header = $request->get_header('authorization');
    if (!is_string($header) || $header === '') {
        return '';
    }
    if (stripos($header, 'Bearer ') !== 0) {
        return '';
    }
    return trim(substr($header, 7));
}

/**
 * Whether the request carries a valid bearer token. Fails closed.
 *
 * @param WP_REST_Request $request
 * @return bool
 */
function headless_api_check_auth($request) {
    $expected = headless_api_token();
    if ($expected === '') {
        return false; // no token configured => raw content stays closed
    }
    $provided = headless_api_bearer_token($request);
    if ($provided === '') {
        return false;
    }
    return hash_equals($expected, $provided);
}

/**
 * Standard 401 response for a raw request without valid auth.
 *
 * @return WP_REST_Response
 */
function headless_api_auth_error() {
    return new WP_REST_Response(array(
        'code'    => 'headless_api_unauthorized',
        'message' => 'A valid bearer token is required for raw/rendered content.',
    ), 401);
}
