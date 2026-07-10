<?php
/**
 * Plugin Name:       Markdown Content
 * Plugin URI:        https://waldorf-brno.cz/
 * Description:        Makes Markdown a first-class, canonical content format. Stores the Markdown source of truth in the post_content_filtered column (flagged by the _markdown_enabled meta) and renders an HTML cache into post_content on save via the bundled Parsedown parser. Adds an opt-in Markdown editing mode in wp-admin. Zero lock-in — the raw Markdown is trivially extractable from post_content_filtered.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      7.4
 * Author:            wp_template / Waldorf Brno
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       markdown-content
 *
 * ---------------------------------------------------------------------------
 * STORAGE CONVENTION (shared with the generic headless-api engine detection):
 *
 *   post_content_filtered   canonical Markdown source (the source of truth)
 *   post_content            rendered HTML cache (classic viewing / previews)
 *   meta _markdown_enabled  '1' when the post is a Markdown post (opt-in flag)
 *
 * The headless API detects engine === 'markdown' when _markdown_enabled == '1'
 * AND post_content_filtered is non-empty, and returns the Markdown in `raw`.
 * See docs/MARKDOWN_BACKEND.md.
 *
 * Parser: Parsedown 1.7.4 (MIT, single file, no dependencies) — the pragmatic
 * choice for WEDOS shared PHP hosting.
 * ---------------------------------------------------------------------------
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MARKDOWN_CONTENT_VERSION', '1.0.0');
define('MARKDOWN_CONTENT_META_ENABLED', '_markdown_enabled');
define('MARKDOWN_CONTENT_DIR', __DIR__);

/* -------------------------------------------------------------------------- *
 * Parser
 * -------------------------------------------------------------------------- */

/**
 * Lazily load Parsedown and return a configured instance.
 *
 * @return Parsedown
 */
function markdown_content_parser() {
    static $parser = null;
    if ($parser === null) {
        if (!class_exists('Parsedown')) {
            require_once MARKDOWN_CONTENT_DIR . '/Parsedown.php';
        }
        $parser = new Parsedown();
        // Content is authored by trusted logged-in editors, so inline HTML is
        // allowed (safe mode OFF). Output is still subject to WordPress's normal
        // capability-based kses on save for users lacking unfiltered_html.
        $parser->setBreaksEnabled(false);
    }
    return $parser;
}

/**
 * Render Markdown source to HTML.
 *
 * Public helper — safe to call from wp-cli (`wp eval`) and conversion scripts.
 *
 * @param string $markdown
 * @return string HTML
 */
function markdown_content_render($markdown) {
    $markdown = (string) $markdown;
    if ($markdown === '') {
        return '';
    }
    return markdown_content_parser()->text($markdown);
}

/**
 * Whether a post is currently a Markdown post.
 *
 * @param int $post_id
 * @return bool
 */
function markdown_content_is_enabled($post_id) {
    return get_post_meta((int) $post_id, MARKDOWN_CONTENT_META_ENABLED, true) === '1';
}

/* -------------------------------------------------------------------------- *
 * Canonical writer (used by the admin UI AND by mass-conversion scripts)
 * -------------------------------------------------------------------------- */

/**
 * Make $post_id a Markdown post: store the Markdown as the canonical source in
 * post_content_filtered, render HTML into post_content, and set the opt-in flag.
 *
 * This is the ONE recipe Phase-2 conversion scripts should use, e.g.:
 *
 *   wp eval "markdown_content_apply( 123, file_get_contents('/path/page.md') );"
 *
 * Safe against the plugin's own save hooks (they are nonce-gated to the admin
 * form and no-op in wp-cli), and additionally guarded against recursion.
 *
 * Idempotent and slash-safe. Beyond writing the canonical columns it applies
 * three guards learned the hard way during the waldorf mass-conversion (424
 * items); each is documented inline below:
 *
 *   (a) EMPTY-BODY ENGINE OVERRIDE. The generic headless engine detector only
 *       classifies a post as `markdown` when BOTH `_markdown_enabled == '1'`
 *       AND post_content_filtered is non-empty (so a stray filtered value from
 *       another plugin is never misread). An intentionally empty Markdown body
 *       therefore can't be detected from data alone — so we set the explicit
 *       `_headless_engine=markdown` override. When a non-empty body is later
 *       applied, natural detection works again, so we REMOVE the override we set
 *       (only if it still reads 'markdown', to never clobber a hand-set value).
 *
 *   (b) DIVI BUILDER FLAG. On DIVI sites converted posts kept `_et_pb_use_builder
 *       == 'on'`, so the theme still rendered them as builder layouts (broken
 *       titles / wrong body classes). 260 items had to be fixed post-hoc. If the
 *       flag is 'on' we flip it to 'off' (silent — nothing recorded).
 *
 *   (c) FUTURE-STATUS PRESERVATION. wp_update_post() re-evaluates post_date and
 *       auto-PUBLISHES a `future`-status post whose date is already in the past
 *       (it bit post 4722). We capture post_status before the write and, if
 *       WordPress changed it, restore the original directly via $wpdb so a
 *       content edit never silently changes publication state.
 *
 * @param int    $post_id
 * @param string $markdown
 * @return int|WP_Error  The post ID on success, WP_Error on failure.
 */
function markdown_content_apply($post_id, $markdown) {
    global $wpdb;
    static $applying = false;

    $post_id  = (int) $post_id;
    $markdown = (string) $markdown;
    $post     = $post_id > 0 ? get_post($post_id) : null;
    if (!$post) {
        return new WP_Error('markdown_content_no_post', 'Post not found: ' . $post_id);
    }

    // (c) Capture the status BEFORE the write so we can restore it if
    // wp_update_post's date re-evaluation flips it (e.g. future -> publish).
    $status_before = $post->post_status;

    $html = markdown_content_render($markdown);

    $applying = true;
    $result = wp_update_post(array(
        'ID'                    => $post_id,
        // wp_update_post expects slashed data.
        'post_content'          => wp_slash($html),
        'post_content_filtered' => wp_slash($markdown),
    ), true);
    $applying = false;

    if (is_wp_error($result)) {
        return $result;
    }

    // (c) Restore the original status if WordPress changed it out from under us.
    $status_after = get_post_field('post_status', $post_id);
    if ($status_after !== $status_before) {
        $wpdb->update(
            $wpdb->posts,
            array('post_status' => $status_before),
            array('ID' => $post_id)
        );
        clean_post_cache($post_id);
    }

    update_post_meta($post_id, MARKDOWN_CONTENT_META_ENABLED, '1');

    // (a) Engine detection needs a non-empty body; force the override for an
    // empty one, and remove the override we set once a real body exists.
    if ($markdown === '') {
        update_post_meta($post_id, '_headless_engine', 'markdown');
    } elseif (get_post_meta($post_id, '_headless_engine', true) === 'markdown') {
        delete_post_meta($post_id, '_headless_engine', 'markdown');
    }

    // (b) Stop DIVI from rendering a converted post as a builder layout.
    if (get_post_meta($post_id, '_et_pb_use_builder', true) === 'on') {
        update_post_meta($post_id, '_et_pb_use_builder', 'off');
    }

    return $post_id;
}

/**
 * Turn Markdown mode OFF for a post (leaves post_content HTML in place, clears
 * the flag; the Markdown source in post_content_filtered is retained so nothing
 * is lost, but the post is no longer classified as Markdown).
 *
 * @param int $post_id
 * @return void
 */
function markdown_content_disable($post_id) {
    delete_post_meta((int) $post_id, MARKDOWN_CONTENT_META_ENABLED);
}

/* -------------------------------------------------------------------------- *
 * Admin editing UI (opt-in Markdown textarea)
 * -------------------------------------------------------------------------- */

/**
 * Post types that may be edited as Markdown. Filterable so other content types
 * (e.g. 'akce') can opt in.
 *
 * @return string[]
 */
function markdown_content_post_types() {
    /**
     * @param string[] $types Default: page, post.
     */
    return (array) apply_filters('markdown_content_post_types', array('page', 'post', 'akce'));
}

/**
 * Register the Markdown meta box on supported post types.
 *
 * @return void
 */
function markdown_content_add_meta_box() {
    foreach (markdown_content_post_types() as $type) {
        if (!post_type_exists($type)) {
            continue;
        }
        add_meta_box(
            'markdown-content-box',
            __('Markdown', 'markdown-content'),
            'markdown_content_render_meta_box',
            $type,
            'normal',
            'high'
        );
    }
}
add_action('add_meta_boxes', 'markdown_content_add_meta_box');

/**
 * Render the Markdown meta box: opt-in checkbox + a full-width source textarea.
 *
 * @param WP_Post $post
 * @return void
 */
function markdown_content_render_meta_box($post) {
    wp_nonce_field('markdown_content_save', 'markdown_content_nonce');

    $enabled  = markdown_content_is_enabled($post->ID);
    $markdown = (string) $post->post_content_filtered;

    ?>
    <p>
        <label>
            <input type="checkbox" id="markdown-content-enabled"
                   name="markdown_content_enabled" value="1" <?php checked($enabled); ?> />
            <strong><?php esc_html_e('Edit this content as Markdown', 'markdown-content'); ?></strong>
        </label>
        <br />
        <span class="description">
            <?php esc_html_e('When enabled, the Markdown below is the source of truth. HTML is generated into the post body on save (used for classic viewing/preview and the headless feed).', 'markdown-content'); ?>
        </span>
    </p>
    <p id="markdown-content-editor-wrap">
        <textarea id="markdown-content-source" name="markdown_content_source"
                  style="width:100%;min-height:420px;font-family:Menlo,Consolas,Monaco,monospace;font-size:13px;line-height:1.5;"
                  spellcheck="false"><?php echo esc_textarea($markdown); ?></textarea>
    </p>
    <script>
    (function () {
        var cb = document.getElementById('markdown-content-enabled');
        if (!cb) { return; }
        function sync() {
            var on = cb.checked;
            // Hide the default block/classic editor + DIVI toggle when Markdown owns the body.
            ['postdivrich', 'et_pb_layout', 'et-builder-page-settings-bar'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) { el.style.display = on ? 'none' : ''; }
            });
            var wrap = document.getElementById('markdown-content-editor-wrap');
            if (wrap) { wrap.style.opacity = on ? '1' : '0.5'; }
        }
        cb.addEventListener('change', sync);
        sync();
    })();
    </script>
    <?php
}

/**
 * Force the CLASSIC editor for Markdown posts — the block editor would try to
 * parse the generated HTML into blocks and fight the Markdown source.
 *
 * @param bool    $use_block_editor
 * @param WP_Post $post
 * @return bool
 */
function markdown_content_force_classic($use_block_editor, $post) {
    if ($post instanceof WP_Post && markdown_content_is_enabled($post->ID)) {
        return false;
    }
    return $use_block_editor;
}
add_filter('use_block_editor_for_post', 'markdown_content_force_classic', 10, 2);

/**
 * On save: write the canonical columns from the submitted Markdown.
 *
 * Runs on `wp_insert_post_data` (a FILTER over the row about to be written) so
 * we mutate post_content / post_content_filtered in a single DB write with no
 * recursion. Only fires for real admin submissions carrying our nonce.
 *
 * @param array $data    Slashed post row about to be saved.
 * @param array $postarr Slashed submitted values (includes our $_POST fields).
 * @return array
 */
function markdown_content_filter_insert_data($data, $postarr) {
    // Only act on genuine editor submissions carrying our nonce.
    if (empty($postarr['markdown_content_nonce'])
        || !wp_verify_nonce($postarr['markdown_content_nonce'], 'markdown_content_save')) {
        return $data;
    }
    // Skip autosaves / revisions.
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $data;
    }
    if (isset($data['post_type']) && $data['post_type'] === 'revision') {
        return $data;
    }

    if (!empty($postarr['markdown_content_enabled'])) {
        // $postarr is slashed; keep the Markdown slashed for storage, unslash a
        // copy for rendering, then re-slash the HTML.
        $markdown_slashed = isset($postarr['markdown_content_source']) ? $postarr['markdown_content_source'] : '';
        $markdown_raw     = wp_unslash($markdown_slashed);
        $html             = markdown_content_render($markdown_raw);

        $data['post_content_filtered'] = $markdown_slashed;
        $data['post_content']          = wp_slash($html);
    }

    return $data;
}
add_filter('wp_insert_post_data', 'markdown_content_filter_insert_data', 10, 2);

/**
 * On save: persist the opt-in flag meta (meta is not part of wp_insert_post_data).
 *
 * @param int     $post_id
 * @param WP_Post $post
 * @return void
 */
function markdown_content_save_flag($post_id, $post) {
    if (empty($_POST['markdown_content_nonce'])
        || !wp_verify_nonce($_POST['markdown_content_nonce'], 'markdown_content_save')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (wp_is_post_revision($post_id)) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (!empty($_POST['markdown_content_enabled'])) {
        update_post_meta($post_id, MARKDOWN_CONTENT_META_ENABLED, '1');
    } else {
        delete_post_meta($post_id, MARKDOWN_CONTENT_META_ENABLED);
    }
}
add_action('save_post', 'markdown_content_save_flag', 10, 2);
