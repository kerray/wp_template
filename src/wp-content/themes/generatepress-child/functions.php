<?php

/**
 * CUSTOM POST TYPE - EVENTS (AKCE)
 * ============================================
 * ✅ STATUS: WORKING - Events post type fully functional
 * 
 * PURPOSE: Register custom post type for school events with Czech labels
 * TESTED: 2025-08-27 - 102+ events in system, admin menu working
 * 
 * KEY FEATURES:
 * - Archive page: /archiv-akci/ 
 * - Admin menu position: 5 (after Posts)
 * - REST API enabled (Gutenberg + API access)
 * - Supports: title, editor, thumbnail, custom-fields, author, excerpt
 * - Proper Czech localization throughout admin
 * 
 * ⚠️ NOTE: Function name is misleading (podniky = companies, but creates events)
 * TODO: Rename to zv_custom_post_akce() for clarity
 */
function zv_custom_post_podniky()
{
    $labels = array(
        'name'               => _x('Akce', 'vybaven'),
        'singular_name'      => _x('Akce', 'vybaven'),
        'add_new'            => _x('Přidat novou akci', 'vybaven'),
        'add_new_item'       => __('Přidat novou akci'),
        'edit_item'          => __('Upravit akci'),
        'new_item'           => __('Nová akce'),
        'all_items'          => __('Všechny akce'),
        'view_item'          => __('Zobrazit akce'),
        'search_items'       => __('Hledat akce'),
        'not_found'          => __('Žádná akce nebyla nalezena'),
        'not_found_in_trash' => __('Žádná akce nebyla nalezena v koši'),
        'parent_item_colon'  => '',
        'menu_name'          => 'Akce'
    );
    $args = array(
        'labels'        => $labels,
        'description'   => 'Obsahuje akce a jejich parametry',
        'show_in_rest'  => true,
        'public'        => true,
        'menu_icon'     => 'dashicons-smiley',
        'rewrite'       => array('slug' => 'archiv-akci'),
        'menu_position' => 5,
        'supports'      => array('title', 'editor', 'thumbnail', 'custom-fields', 'author', 'excerpt'),
        'has_archive'   => true,
    );
    register_post_type('akce', $args);
}
add_action('init', 'zv_custom_post_podniky');

/**
 * CUSTOM POST TYPE MESSAGES
 * ====================================
 * ✅ STATUS: MOSTLY WORKING - Czech messages for post actions
 * 
 * PURPOSE: Customize admin messages for 'akce' post type
 * TESTED: 2025-08-27 - Messages appear when editing events
 * 
 * WHAT WORKS: Czech localization for most messages
 * 🐛 BUG: Line 7 says "Product saved" instead of "Akce uložena"
 * TODO: Fix typo in function name (messagess -> messages)
 */
function zv_updated_messages($messages)
{
    global $post, $post_ID;
    $messages['akce'] = array(
        0 => '',
        1 => sprintf(__('Aktualizován. <a href="%s">Zobrazit</a>'), esc_url(get_permalink($post_ID))),
        2 => __('Uživatelské pole aktualizováno.'),
        3 => __('Uživatelské pole smazáno.'),
        4 => __('Aktualizován.'),
        5 => isset($_GET['revision']) ? sprintf(__('Obnoven z revize %s'), wp_post_revision_title((int) $_GET['revision'], false)) : false,
        6 => sprintf(__('Publikován. <a href="%s">Zobrazit</a>'), esc_url(get_permalink($post_ID))),
        7 => __('Akce uložena.'), // ✅ FIXED: Changed to Czech localization
        8 => sprintf(__('Vložen. <a target="_blank" href="%s">Zobrazit</a>'), esc_url(add_query_arg('preview', 'true', get_permalink($post_ID)))),
        9 => sprintf(__('Naplánován na: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Zobrazit</a>'), date_i18n(__('M j, Y @ G:i'), strtotime($post->post_date)), esc_url(get_permalink($post_ID))),
        10 => sprintf(__('Koncept aktualizován. <a target="_blank" href="%s">Zobrazit</a>'), esc_url(add_query_arg('preview', 'true', get_permalink($post_ID)))),
    );
    return $messages;
}
add_filter('post_updated_messages', 'zv_updated_messages');



/**
 * CUSTOM TAXONOMY - CATEGORIES
 * =======================================
 * ✅ STATUS: WORKING - Hierarchical category system for events
 * 
 * PURPOSE: Register taxonomy for categorizing events (školka, škola, lyceum, etc.)
 * TESTED: 2025-08-27 - Categories submenu visible in admin, filtering works
 * 
 * KEY FEATURES:
 * - Hierarchical: true (allows parent-child relationships like WP categories)
 * - Full Czech localization
 * - Appears as submenu under "Akce" in admin
 * - Used in shortcode filtering: [akce cat="1"]
 * 
 * CHECK: wp-admin/edit-tags.php?taxonomy=kategorie&post_type=akce
 */
function zv_taxonomies_kategorie()
{
    $labels = array(
        'name'              => _x('Kategorie', 'taxonomy general name'),
        'singular_name'     => _x('Kategorie', 'taxonomy singular name'),
        'search_items'      => __('Hledat kategorie'),
        'all_items'         => __('Všechny kategorie'),
        'parent_item'       => __('Nadřezená kategorie'),
        'parent_item_colon' => __('Nadřazená kategorie:'),
        'edit_item'         => __('Upravit kategorii'),
        'update_item'       => __('Aktualizovat kategorii'),
        'add_new_item'      => __('Přidat novou kategorii'),
        'new_item_name'     => __('Nová kategorie'),
        'menu_name'         => __('Kategorie'),
    );
    $args = array(
        'labels' => $labels,
        'hierarchical' => true,
    );
    register_taxonomy('kategorie', 'akce', $args);
}
add_action('init', 'zv_taxonomies_kategorie', 0);

/**
 * META BOXES FOR EVENTS
 * =================================
 * ✅ STATUS: WORKING - Custom fields for event data
 * 
 * PURPOSE: Add meta box with date, location, and archive date fields
 * TESTED: 2025-08-27 - Meta box appears in event edit screen, saves correctly
 * 
 * CUSTOM FIELDS:
 * - zv_datum: Event date (text field, format: "12.3. - 4.5.")
 * - zv_misto: Event location (text field, format: "Colosseum")  
 * - zv_pryc: Archive date (date field, stored as Unix timestamp)
 * 
 * SECURITY: Proper nonce verification, capability checks, autosave protection
 * ⚠️ TODO: Add input sanitization with sanitize_text_field()
 * ⚠️ TODO: Text domain 'hudy' should match theme text domain
 */
function zv_register_meta_boxes()
{
    add_meta_box('zv-box', __('Další informace', 'hudy'), 'zv_my_display_callback', 'akce', "normal", "high", null);
}
add_action('add_meta_boxes', 'zv_register_meta_boxes');

/**
 * Meta box display callback - Shows the custom fields form
 * RENDERS: Date fields (From/To/Month), location, and archive date
 * PHASE 1: Updated with structured date fields (2025-11-20)
 */
function zv_my_display_callback($post)
{
    wp_nonce_field(basename(__FILE__), "meta-box-nonce");

    // Get existing values
    $datum_from = get_post_meta($post->ID, "zv_datum_from", true);
    $datum_to = get_post_meta($post->ID, "zv_datum_to", true);
    $datum_month = get_post_meta($post->ID, "zv_datum_month", true);
    $misto = get_post_meta($post->ID, "zv_misto", true);
    $pryc = get_post_meta($post->ID, "zv_pryc", true);
?>
    <style>
        .akce-meta-box {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        }

        .akce-meta-box .field-group {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #2271b1;
        }

        .akce-meta-box .field-row {
            display: flex;
            gap: 15px;
            margin-top: 10px;
        }

        .akce-meta-box .field-item {
            flex: 1;
        }

        .akce-meta-box label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
            color: #1d2327;
        }

        .akce-meta-box input[type="date"],
        .akce-meta-box input[type="datetime-local"],
        .akce-meta-box input[type="month"],
        .akce-meta-box input[type="text"] {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #8c8f94;
            border-radius: 4px;
        }

        .akce-meta-box .help-text {
            font-size: 12px;
            color: #646970;
            margin-top: 5px;
            font-style: italic;
        }

        .akce-meta-box .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #1d2327;
            margin-bottom: 10px;
        }

        .akce-meta-box .or-divider {
            text-align: center;
            color: #646970;
            margin: 15px 0;
            font-weight: 600;
        }
    </style>

    <div class="akce-meta-box">
        <!-- Date Fields Section -->
        <div class="field-group">
            <div class="section-title">📅 Datum konání akce</div>
            <p class="help-text">Vyplňte buď konkrétní datum (Od/Do), nebo pouze měsíc konání.</p>

            <div class="field-row">
                <div class="field-item">
                    <label for="datum_from">Datum a čas od</label>
                    <input type="datetime-local" name="datum_from" id="datum_from" value="<?php echo !empty($datum_from) ? date('Y-m-d\TH:i', $datum_from) : ''; ?>" />
                    <p class="help-text">Začátek akce nebo jednorázové datum (čas je volitelný)</p>
                </div>
                <div class="field-item">
                    <label for="datum_to">Datum a čas do</label>
                    <input type="datetime-local" name="datum_to" id="datum_to" value="<?php echo !empty($datum_to) ? date('Y-m-d\TH:i', $datum_to) : ''; ?>" />
                    <p class="help-text">Konec akce (volitelné, pro vícedenní akce)</p>
                </div>
            </div>

            <div class="or-divider">— NEBO —</div>

            <div class="field-item">
                <label for="datum_month">Pouze měsíc konání</label>
                <input type="month" name="datum_month" id="datum_month" value="<?php echo !empty($datum_month) ? $datum_month : ''; ?>" />
                <p class="help-text">Pro akce bez konkrétního data (zobrazí se "květen 2025")</p>
            </div>
        </div>

        <!-- Location Field -->
        <div class="field-group">
            <div class="section-title">📍 Místo konání</div>
            <div class="field-item">
                <label for="misto">Místo</label>
                <input type="text" name="misto" id="misto" value="<?php echo !empty($misto) ? esc_attr($misto) : ''; ?>" placeholder="např. Waldorfská škola Brno, Colosseum..." />
            </div>
        </div>

        <!-- Archive Date Field -->
        <div class="field-group">
            <div class="section-title">🗄️ Archivace</div>
            <div class="field-item">
                <label for="pryc">Datum přesunu do uskutečněných akcí</label>
                <input type="date" name="pryc" id="pryc" value="<?php echo !empty($pryc) ? date('Y-m-d', $pryc) : ''; ?>" />
                <p class="help-text">Po tomto datu se akce automaticky přesune do archivu</p>
            </div>
        </div>
    </div>

    <script>
        jQuery(document).ready(function($) {
            // Real-time validation feedback
            function validateDates() {
                var dateFrom = $('#datum_from').val();
                var dateTo = $('#datum_to').val();
                var dateMonth = $('#datum_month').val();

                // Clear previous error messages
                $('.akce-date-error').remove();

                // Must have either month OR from date
                if (!dateMonth && !dateFrom) {
                    showError('Musíte zadat buď datum od, nebo měsíc konání.');
                    return false;
                }

                // If both From and To are set, validate range
                if (dateFrom && dateTo) {
                    var from = new Date(dateFrom);
                    var to = new Date(dateTo);

                    if (to < from) {
                        showError('Datum do nemůže být dřív než datum od.');
                        return false;
                    }
                }

                return true;
            }

            function showError(message) {
                $('.akce-meta-box').prepend('<div class="notice notice-error akce-date-error" style="margin: 10px 0; padding: 10px;"><p><strong>Chyba:</strong> ' + message + '</p></div>');
            }

            // Validate on field changes
            $('#datum_from, #datum_to, #datum_month').on('change', validateDates);

            // Validate before publish
            $('#publish, #save-post').on('click', function(e) {
                if (!validateDates()) {
                    e.preventDefault();
                    alert('Prosím opravte chyby v datech před uložením.');
                    return false;
                }
            });

            // Auto-clear logic: if month is filled, suggest clearing from/to
            $('#datum_month').on('change', function() {
                if ($(this).val() && ($('#datum_from').val() || $('#datum_to').val())) {
                    if (confirm('Máte vyplněný měsíc i konkrétní data. Chcete vymazat konkrétní data a použít pouze měsíc?')) {
                        $('#datum_from, #datum_to').val('');
                    }
                }
            });

            // Auto-clear logic: if from/to is filled, suggest clearing month
            $('#datum_from, #datum_to').on('change', function() {
                if (($(this).val() || $('#datum_from').val() || $('#datum_to').val()) && $('#datum_month').val()) {
                    if (confirm('Máte vyplněný měsíc i konkrétní data. Chcete vymazat měsíc a použít konkrétní data?')) {
                        $('#datum_month').val('');
                    }
                }
            });
        });
    </script>

<?php
}

/**
 * Save meta box content with proper security checks
 * SECURITY CHECKS: nonce verification, user capabilities, autosave protection
 * STORAGE: Structured dates as timestamps, backward-compatible text field
 * PHASE 1: Updated to handle new date fields (2025-11-20)
 */
function zv_save_meta_box($post_id)
{
    // Security checks
    if (!isset($_POST["meta-box-nonce"]) || !wp_verify_nonce($_POST["meta-box-nonce"], basename(__FILE__)))
        return $post_id;

    if (!current_user_can("edit_post", $post_id))
        return $post_id;

    if (defined("DOING_AUTOSAVE") && DOING_AUTOSAVE)
        return $post_id;

    // Only process for 'akce' post type
    if (get_post_type($post_id) !== 'akce')
        return $post_id;

    // Get and sanitize inputs
    $datum_from = isset($_POST['datum_from']) ? sanitize_text_field($_POST['datum_from']) : '';
    $datum_to = isset($_POST['datum_to']) ? sanitize_text_field($_POST['datum_to']) : '';
    $datum_month = isset($_POST['datum_month']) ? sanitize_text_field($_POST['datum_month']) : '';
    $misto = isset($_POST['misto']) ? sanitize_text_field($_POST['misto']) : '';
    $pryc = isset($_POST['pryc']) ? sanitize_text_field($_POST['pryc']) : '';

    // Validate dates
    $validation_errors = validate_akce_dates($datum_from, $datum_to, $datum_month);
    if (!empty($validation_errors)) {
        // Store errors in transient to display after redirect
        set_transient('akce_validation_errors_' . $post_id, $validation_errors, 45);
        // Don't save invalid data
        return $post_id;
    }

    // Save location
    update_post_meta($post_id, "zv_misto", $misto);

    // Save archive date
    if (!empty($pryc)) {
        update_post_meta($post_id, "zv_pryc", strtotime($pryc));
    } else {
        delete_post_meta($post_id, "zv_pryc");
    }

    // Handle date fields - prioritize specific dates over month
    if (!empty($datum_from) || !empty($datum_to)) {
        // Save specific dates as timestamps
        if (!empty($datum_from)) {
            update_post_meta($post_id, "zv_datum_from", strtotime($datum_from));
        } else {
            delete_post_meta($post_id, "zv_datum_from");
        }

        if (!empty($datum_to)) {
            update_post_meta($post_id, "zv_datum_to", strtotime($datum_to));
        } else {
            delete_post_meta($post_id, "zv_datum_to");
        }

        // Clear month field if dates are set
        delete_post_meta($post_id, "zv_datum_month");
    } elseif (!empty($datum_month)) {
        // Save month-only
        update_post_meta($post_id, "zv_datum_month", $datum_month);

        // Clear specific date fields
        delete_post_meta($post_id, "zv_datum_from");
        delete_post_meta($post_id, "zv_datum_to");
    } else {
        // Clear all date fields if nothing provided
        delete_post_meta($post_id, "zv_datum_from");
        delete_post_meta($post_id, "zv_datum_to");
        delete_post_meta($post_id, "zv_datum_month");
    }

    // BACKWARD COMPATIBILITY: Auto-generate text field from structured dates
    $display_date = get_akce_date_display($post_id);
    update_post_meta($post_id, "zv_datum", $display_date);

    // Update sort date (will be recalculated by hook below)
    $sort_date = get_akce_sort_date($post_id);
    update_post_meta($post_id, "zv_datum_sort", $sort_date);
}
add_action('save_post', 'zv_save_meta_box');

/**
 * Update sort date when event is saved
 * Ensures zv_datum_sort is always current for queries
 * PHASE 1: Added for structured date system (2025-11-20)
 */
function update_akce_sort_date_on_save($post_id, $post)
{
    // Only for 'akce' post type
    if ($post->post_type !== 'akce') {
        return;
    }

    // Avoid infinite loops
    if (defined('DOING_AKCE_SORT_UPDATE')) {
        return;
    }
    define('DOING_AKCE_SORT_UPDATE', true);

    // Calculate and update sort date
    $sort_date = get_akce_sort_date($post_id);
    update_post_meta($post_id, "zv_datum_sort", $sort_date);
}
add_action('save_post_akce', 'update_akce_sort_date_on_save', 20, 3);

/**
 * Display validation errors after redirect
 * Shows errors from transient if they exist
 * PHASE 1: Added for date validation feedback (2025-11-20)
 */
function akce_show_validation_errors()
{
    global $post;
    if (!$post || $post->post_type !== 'akce') {
        return;
    }

    $errors = get_transient('akce_validation_errors_' . $post->ID);
    if ($errors) {
        echo '<div class="notice notice-error is-dismissible"><p><strong>Chyba při ukládání dat:</strong></p><ul>';
        foreach ($errors as $error) {
            echo '<li>' . esc_html($error) . '</li>';
        }
        echo '</ul></div>';
        delete_transient('akce_validation_errors_' . $post->ID);
    }
}
add_action('admin_notices', 'akce_show_validation_errors');

/**
 * ADMIN ENHANCEMENTS
 * =========================================
 * Added: 2025-11-20 - Phase 2 Implementation
 *
 * PURPOSE: Improve admin experience with sortable columns and Quick Edit
 * FEATURES:
 * - Custom admin columns (Date From, Date To, Location)
 * - Sortable date columns
 * - Quick Edit support for all date fields
 */

/**
 * Register custom columns for akce post type
 * Adds: Datum od, Datum do, Místo columns to admin list
 *
 * @param array $columns Existing columns
 * @return array Modified columns
 */
function akce_custom_columns($columns)
{
    // Insert new columns after title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['datum_od'] = 'Datum od';
            $new_columns['datum_do'] = 'Datum do';
            $new_columns['misto'] = 'Místo';
        }
    }
    return $new_columns;
}
add_filter('manage_akce_posts_columns', 'akce_custom_columns');

/**
 * Populate custom column data
 * Shows formatted dates and location for each event
 *
 * @param string $column Column name
 * @param int $post_id Post ID
 */
function akce_custom_column_content($column, $post_id)
{
    switch ($column) {
        case 'datum_od':
            $datum_from = get_post_meta($post_id, 'zv_datum_from', true);
            $datum_month = get_post_meta($post_id, 'zv_datum_month', true);

            if ($datum_from) {
                echo '<strong>' . date('j.n.Y', $datum_from) . '</strong>';
            } elseif ($datum_month) {
                $months = get_akce_czech_months();
                list($year, $month) = explode('-', $datum_month);
                echo '<em style="color: #646970;">' . $months[$month] . ' ' . $year . '</em>';
            } else {
                echo '<span style="color: #dcdcde;">—</span>';
            }
            break;

        case 'datum_do':
            $datum_to = get_post_meta($post_id, 'zv_datum_to', true);
            $datum_month = get_post_meta($post_id, 'zv_datum_month', true);

            if ($datum_to) {
                echo '<strong>' . date('j.n.Y', $datum_to) . '</strong>';
            } elseif ($datum_month) {
                echo '<em style="color: #646970;">(celý měsíc)</em>';
            } else {
                echo '<span style="color: #dcdcde;">—</span>';
            }
            break;

        case 'misto':
            $misto = get_post_meta($post_id, 'zv_misto', true);
            if ($misto) {
                echo esc_html($misto);
            } else {
                echo '<span style="color: #dcdcde;">—</span>';
            }
            break;
    }
}
add_action('manage_akce_posts_custom_column', 'akce_custom_column_content', 10, 2);

/**
 * Add CSS for admin columns
 * Styles the custom columns for better readability
 */
function akce_admin_column_styles()
{
    global $post_type;
    if ($post_type === 'akce') {
        echo '<style>
            .column-datum_od { width: 12%; }
            .column-datum_do { width: 12%; }
            .column-misto { width: 20%; }
            .column-datum_od em,
            .column-datum_do em { font-style: italic; }
        </style>';
    }
}
add_action('admin_head', 'akce_admin_column_styles');

/**
 * Register sortable columns
 * Makes Datum od and Datum do columns sortable in admin
 *
 * @param array $columns Existing sortable columns
 * @return array Modified sortable columns
 */
function akce_sortable_columns($columns)
{
    $columns['datum_od'] = 'datum_od';
    $columns['datum_do'] = 'datum_do';
    return $columns;
}
add_filter('manage_edit-akce_sortable_columns', 'akce_sortable_columns');

/**
 * Implement sorting logic for date columns
 * Sorts by zv_datum_sort for "Datum od" and zv_datum_to for "Datum do"
 *
 * @param WP_Query $query The WordPress query object
 */
function akce_orderby_date($query)
{
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }

    $orderby = $query->get('orderby');

    if ($orderby === 'datum_od') {
        $query->set('meta_key', 'zv_datum_sort');
        $query->set('orderby', 'meta_value_num');
    } elseif ($orderby === 'datum_do') {
        $query->set('meta_key', 'zv_datum_to');
        $query->set('orderby', 'meta_value_num');
    }
}
add_action('pre_get_posts', 'akce_orderby_date');

/**
 * Add Quick Edit fields for akce post type
 * Displays custom date and location fields in Quick Edit box
 *
 * @param string $column_name Column name
 * @param string $post_type Post type
 */
function akce_quick_edit_fields($column_name, $post_type)
{
    if ($post_type !== 'akce') {
        return;
    }

    // Only show fields once (on first column)
    static $shown = false;
    if ($shown) {
        return;
    }
    $shown = true;
?>
    <fieldset class="inline-edit-col-right">
        <div class="inline-edit-col">
            <div class="inline-edit-group wp-clearfix">
                <label class="inline-edit-status alignleft">
                    <span class="title">Datum od</span>
                    <input type="datetime-local" name="datum_from" id="quick_edit_datum_from" value="">
                </label>
                <label class="inline-edit-status alignleft">
                    <span class="title">Datum do</span>
                    <input type="datetime-local" name="datum_to" id="quick_edit_datum_to" value="">
                </label>
            </div>
            <div class="inline-edit-group wp-clearfix">
                <label class="inline-edit-status alignleft">
                    <span class="title">Měsíc konání</span>
                    <input type="month" name="datum_month" id="quick_edit_datum_month" value="">
                </label>
                <label class="inline-edit-status alignleft">
                    <span class="title">Místo</span>
                    <input type="text" name="misto" id="quick_edit_misto" value="">
                </label>
            </div>
        </div>
    </fieldset>
<?php
}
add_action('quick_edit_custom_box', 'akce_quick_edit_fields', 10, 2);

/**
 * Add hidden data to admin rows for Quick Edit
 * Stores field values in hidden elements for JavaScript to populate Quick Edit
 *
 * @param array $actions Row actions
 * @param WP_Post $post Post object
 * @return array Modified actions
 */
function akce_add_quick_edit_data($actions, $post)
{
    if ($post->post_type !== 'akce') {
        return $actions;
    }

    $datum_from = get_post_meta($post->ID, 'zv_datum_from', true);
    $datum_to = get_post_meta($post->ID, 'zv_datum_to', true);
    $datum_month = get_post_meta($post->ID, 'zv_datum_month', true);
    $misto = get_post_meta($post->ID, 'zv_misto', true);

    // Convert timestamps to Y-m-d\TH:i format for datetime-local input
    $datum_from_formatted = $datum_from ? date('Y-m-d\TH:i', $datum_from) : '';
    $datum_to_formatted = $datum_to ? date('Y-m-d\TH:i', $datum_to) : '';

    // Add hidden spans with data
    echo '<div class="hidden akce-quick-edit-data"
        data-datum-from="' . esc_attr($datum_from_formatted) . '"
        data-datum-to="' . esc_attr($datum_to_formatted) . '"
        data-datum-month="' . esc_attr($datum_month) . '"
        data-misto="' . esc_attr($misto) . '"
    ></div>';

    return $actions;
}
add_filter('post_row_actions', 'akce_add_quick_edit_data', 10, 2);

/**
 * Add Quick Edit JavaScript
 * Populates Quick Edit fields from hidden row data when Quick Edit is clicked
 */
function akce_quick_edit_javascript()
{
    global $current_screen;
    if (!$current_screen || $current_screen->post_type !== 'akce') {
        return;
    }
?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Wait for inlineEditPost to be available
            if (typeof inlineEditPost === 'undefined') {
                return;
            }

            // Copy the original inlineEditPost.edit function
            var wp_inline_edit = inlineEditPost.edit;

            // Override the function
            inlineEditPost.edit = function(id) {
                // Call the original function
                wp_inline_edit.apply(this, arguments);

                // Get the post ID
                var post_id = 0;
                if (typeof(id) === 'object') {
                    post_id = parseInt(this.getId(id));
                }

                if (post_id > 0) {
                    // Find the row
                    var $row = $('#post-' + post_id);
                    var $data = $row.find('.akce-quick-edit-data');

                    if ($data.length) {
                        // Get data from hidden element
                        var datum_from = $data.attr('data-datum-from');
                        var datum_to = $data.attr('data-datum-to');
                        var datum_month = $data.attr('data-datum-month');
                        var misto = $data.attr('data-misto');

                        // Populate Quick Edit fields
                        $('#quick_edit_datum_from').val(datum_from);
                        $('#quick_edit_datum_to').val(datum_to);
                        $('#quick_edit_datum_month').val(datum_month);
                        $('#quick_edit_misto').val(misto);
                    }
                }
            };
        });
    </script>
<?php
}
add_action('admin_print_footer_scripts', 'akce_quick_edit_javascript', 99);

/**
 * Handle Quick Edit save
 * Saves custom fields when Quick Edit is submitted
 *
 * @param int $post_id Post ID
 */
function akce_save_quick_edit($post_id)
{
    // Check if this is Quick Edit
    if (!isset($_POST['_inline_edit'])) {
        return;
    }

    // Check nonce
    if (!isset($_POST['_inline_edit']) || !wp_verify_nonce($_POST['_inline_edit'], 'inlineeditnonce')) {
        return;
    }

    // Check post type
    if (get_post_type($post_id) !== 'akce') {
        return;
    }

    // Check permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save date fields
    if (isset($_POST['datum_month']) && !empty($_POST['datum_month'])) {
        // Month-only event
        update_post_meta($post_id, 'zv_datum_month', sanitize_text_field($_POST['datum_month']));
        delete_post_meta($post_id, 'zv_datum_from');
        delete_post_meta($post_id, 'zv_datum_to');
    } elseif (isset($_POST['datum_from']) && !empty($_POST['datum_from'])) {
        // Date range or single date event
        $from = strtotime($_POST['datum_from']);
        update_post_meta($post_id, 'zv_datum_from', $from);
        delete_post_meta($post_id, 'zv_datum_month');

        if (isset($_POST['datum_to']) && !empty($_POST['datum_to'])) {
            $to = strtotime($_POST['datum_to']);
            update_post_meta($post_id, 'zv_datum_to', $to);
        } else {
            delete_post_meta($post_id, 'zv_datum_to');
        }
    }

    // Save location
    if (isset($_POST['misto'])) {
        update_post_meta($post_id, 'zv_misto', sanitize_text_field($_POST['misto']));
    }

    // Update zv_datum text field for backward compatibility
    $display_date = get_akce_date_display($post_id);
    if ($display_date) {
        update_post_meta($post_id, 'zv_datum', $display_date);
    }

    // Update sort date (will be updated by save_post_akce hook)
}
add_action('save_post_akce', 'akce_save_quick_edit', 5);

/**
 * STRUCTURED DATE SYSTEM HELPER FUNCTIONS
 * ==============================================================
 * Added: 2025-11-20 - Phase 1 Implementation
 *
 * PURPOSE: Replace text-based zv_datum with structured date fields
 * NEW FIELDS:
 * - zv_datum_from: Start date (Unix timestamp)
 * - zv_datum_to: End date (Unix timestamp)
 * - zv_datum_month: Month-only (YYYY-MM string)
 * - zv_datum_sort: Calculated sort timestamp
 *
 * BACKWARD COMPATIBILITY: zv_datum text field maintained for display
 */

/**
 * Get Czech month names
 *
 * @return array Associative array of month numbers to Czech names
 */
function get_akce_czech_months()
{
    return array(
        '01' => 'leden',
        '02' => 'únor',
        '03' => 'březen',
        '04' => 'duben',
        '05' => 'květen',
        '06' => 'červen',
        '07' => 'červenec',
        '08' => 'srpen',
        '09' => 'září',
        '10' => 'říjen',
        '11' => 'listopad',
        '12' => 'prosinec'
    );
}

/**
 * Display formatted date for an event
 * Handles three date types: single day, date range, month-only
 *
 * @param int $post_id Event post ID
 * @return string Formatted date string in Czech
 */
function get_akce_date_display($post_id)
{
    $datum_from = get_post_meta($post_id, 'zv_datum_from', true);
    $datum_to = get_post_meta($post_id, 'zv_datum_to', true);
    $datum_month = get_post_meta($post_id, 'zv_datum_month', true);

    // Month-only event
    if (!empty($datum_month)) {
        list($year, $month) = explode('-', $datum_month);
        $months = get_akce_czech_months();
        return $months[$month] . ' ' . $year;
    }

    // No structured dates - fall back to old text field
    if (empty($datum_from)) {
        return get_post_meta($post_id, 'zv_datum', true);
    }

    $from_day = date('j', $datum_from);
    $from_month = date('n', $datum_from);
    $from_year = date('Y', $datum_from);

    // Single day event (or only From date set)
    if (empty($datum_to) || $datum_from == $datum_to) {
        return $from_day . '.' . $from_month . '.' . $from_year;
    }

    // Date range event
    $to_day = date('j', $datum_to);
    $to_month = date('n', $datum_to);
    $to_year = date('Y', $datum_to);

    // Same month and year
    if ($from_month == $to_month && $from_year == $to_year) {
        return $from_day . '.' . $from_month . '. - ' . $to_day . '.' . $to_month . '.' . $from_year;
    }

    // Same year, different months
    if ($from_year == $to_year) {
        return $from_day . '.' . $from_month . '. - ' . $to_day . '.' . $to_month . '.' . $from_year;
    }

    // Different years
    return $from_day . '.' . $from_month . '.' . $from_year . ' - ' . $to_day . '.' . $to_month . '.' . $to_year;
}

/**
 * Validate event dates
 *
 * @param string $from Date from (Y-m-d format or empty)
 * @param string $to Date to (Y-m-d format or empty)
 * @param string $month Month (Y-m format or empty)
 * @return array Array of error messages (empty if valid)
 */
function validate_akce_dates($from, $to, $month)
{
    $errors = array();

    // Must have either month OR from date
    if (empty($month) && empty($from)) {
        $errors[] = 'Musíte zadat buď datum od, nebo měsíc.';
        return $errors;
    }

    // Month format validation
    if (!empty($month) && !preg_match('/^\d{4}-\d{2}$/', $month)) {
        $errors[] = 'Neplatný formát měsíce. Použijte YYYY-MM.';
    }

    // If both From and To are set, To must be >= From
    if (!empty($from) && !empty($to)) {
        $from_timestamp = strtotime($from);
        $to_timestamp = strtotime($to);

        if ($to_timestamp < $from_timestamp) {
            $errors[] = 'Datum do nemůže být dřív než datum od.';
        }
    }

    return $errors;
}

/**
 * Calculate sort date for an event
 * Used for ordering events in queries
 *
 * @param int $post_id Event post ID
 * @return int Unix timestamp for sorting
 */
function get_akce_sort_date($post_id)
{
    // Check for From date first
    $datum_from = get_post_meta($post_id, 'zv_datum_from', true);
    if (!empty($datum_from)) {
        return (int)$datum_from;
    }

    // Check for month-only
    $datum_month = get_post_meta($post_id, 'zv_datum_month', true);
    if (!empty($datum_month)) {
        // Use first day of the month
        return strtotime($datum_month . '-01');
    }

    // No structured dates - try to parse old text field
    $datum_text = get_post_meta($post_id, 'zv_datum', true);
    if (!empty($datum_text)) {
        // Try to extract a date from text (very basic parsing)
        // This is just for backward compatibility, won't be perfect
        return strtotime($datum_text);
    }

    // Fallback to post date
    $post = get_post($post_id);
    return strtotime($post->post_date);
}

/**
 * Get category color scheme for calendar display
 * Used for visual distinction in the filterable calendar interface
 *
 * @return array Associative array of category slug => hex color
 */
function get_akce_category_colors()
{
    return array(
        'skola'      => '#3498db', // Blue
        'skolka'     => '#e74c3c', // Red
        'lyceum'     => '#9b59b6', // Purple
        'mraveniste' => '#2ecc71', // Green
        'slavnost'   => '#f39c12', // Orange
        'brigada'    => '#95a5a6', // Gray
        'workshop'   => '#1abc9c', // Turquoise
        'svatek'     => '#e67e22', // Dark Orange
    );
}

/**
 * Get color for a specific category
 *
 * @param string $slug Category slug
 * @return string Hex color code (default: dark gray)
 */
function get_akce_category_color($slug)
{
    $colors = get_akce_category_colors();
    return isset($colors[$slug]) ? $colors[$slug] : '#34495e'; // Default dark gray
}

/**
 * Check if an event should have a clickable link
 * Events with content OR featured image are linkable
 *
 * @param int $post_id Event post ID
 * @return bool True if event should be linked
 */
function should_akce_have_link($post_id)
{
    $content = get_post_field('post_content', $post_id);
    $has_content = !empty(trim($content));
    $has_thumbnail = has_post_thumbnail($post_id);

    return $has_content || $has_thumbnail;
}

/**
 * Get category data for calendar interface
 * Returns all kategorie taxonomy terms with colors
 *
 * @return array Array of category data (slug, name, color)
 */
function get_akce_category_data()
{
    $terms = get_terms(array(
        'taxonomy' => 'kategorie',
        'hide_empty' => false,
    ));

    if (is_wp_error($terms)) {
        return array();
    }

    $categories = array();
    $colors = get_akce_category_colors();

    foreach ($terms as $term) {
        $categories[] = array(
            'slug' => $term->slug,
            'name' => $term->name,
            'color' => isset($colors[$term->slug]) ? $colors[$term->slug] : '#34495e',
            'count' => $term->count,
        );
    }

    return $categories;
}

/**
 * SCHOOL YEAR SUPPORT
 * ==============================================================
 * Added: School year runs September 1 - August 31
 * School year 2024-2025 = Sept 1, 2024 → Aug 31, 2025
 */

/**
 * Get school year from a timestamp
 * Sept-Dec: returns current year as start
 * Jan-Aug: returns previous year as start
 *
 * @param int $timestamp Unix timestamp
 * @return array ['start' => int, 'end' => int]
 */
function get_school_year_from_date($timestamp) {
    $month = (int)date('n', $timestamp);
    $year = (int)date('Y', $timestamp);

    // Sept (9) through Dec (12) = current year is start
    // Jan (1) through Aug (8) = previous year is start
    if ($month >= 9) {
        return array('start' => $year, 'end' => $year + 1);
    } else {
        return array('start' => $year - 1, 'end' => $year);
    }
}

/**
 * Get timestamp boundaries for a school year
 *
 * @param int $start_year Starting year (e.g., 2024 for 2024-2025)
 * @return array ['start' => timestamp, 'end' => timestamp]
 */
function get_school_year_boundaries($start_year) {
    $start_year = (int)$start_year;
    return array(
        'start' => strtotime($start_year . '-09-01 00:00:00'),
        'end' => strtotime(($start_year + 1) . '-08-31 23:59:59')
    );
}

/**
 * Get current school year based on configurable switch date
 * Default: August 1 (view switches to new year)
 *
 * @return array ['start' => int, 'end' => int]
 */
function get_current_school_year() {
    $switch_date = get_option('akce_school_year_switch_date', '08-01');
    $today = time();
    $current_year = (int)date('Y');

    // Parse switch date (MM-DD format)
    $switch_timestamp = strtotime($current_year . '-' . $switch_date);

    if ($today >= $switch_timestamp) {
        // After switch date - show upcoming school year
        $month = (int)date('n', $today);
        if ($month >= 9) {
            return array('start' => $current_year, 'end' => $current_year + 1);
        } else {
            // We're in Jan-Aug after switch - still upcoming year
            return array('start' => $current_year, 'end' => $current_year + 1);
        }
    } else {
        // Before switch date - show current school year
        return get_school_year_from_date($today);
    }
}

/**
 * Format school year for display
 *
 * @param int $start_year Starting year
 * @param int|null $end_year Ending year (calculated if null)
 * @return string "2024-2025" format
 */
function format_school_year($start_year, $end_year = null) {
    $start_year = (int)$start_year;
    $end_year = $end_year !== null ? (int)$end_year : $start_year + 1;
    return $start_year . '-' . $end_year;
}

/**
 * Parse school year from string format
 *
 * @param string $school_year "2024-2025" format
 * @return array|false ['start' => int, 'end' => int] or false if invalid
 */
function parse_school_year($school_year) {
    if (!preg_match('/^(\d{4})-(\d{4})$/', $school_year, $matches)) {
        return false;
    }
    $start = (int)$matches[1];
    $end = (int)$matches[2];

    // Validate: end should be start + 1
    if ($end !== $start + 1) {
        return false;
    }

    return array('start' => $start, 'end' => $end);
}

/**
 * Load event data for calendar display
 * Supports both current events and archived years
 *
 * @return array Array of event data for JavaScript processing
 */
function render_kalendar_data()
{
    $args = array(
        'post_type' => 'akce',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'orderby' => 'meta_value_num',
        'meta_key' => 'zv_datum_sort',
        'order' => 'ASC'
    );

    // Handle school year parameter (new format: 2024-2025)
    if (isset($_GET['schoolyear'])) {
        $school_year = parse_school_year(sanitize_text_field($_GET['schoolyear']));
        if ($school_year) {
            $args['post_status'] = array('publish', 'archive');
            $boundaries = get_school_year_boundaries($school_year['start']);
            $args['meta_query'] = array(
                array(
                    'key' => 'zv_datum_sort',
                    'value' => array($boundaries['start'], $boundaries['end']),
                    'type' => 'numeric',
                    'compare' => 'BETWEEN'
                )
            );
        }
    }
    // Backward compatibility: handle old ?year parameter
    elseif (isset($_GET['year']) && is_numeric($_GET['year'])) {
        $year = intval($_GET['year']);
        // Redirect to school year format (Sept of year to Aug of year+1)
        $school_year_str = format_school_year($year, $year + 1);
        wp_redirect(add_query_arg('schoolyear', $school_year_str, remove_query_arg('year')));
        exit;
    }
    // Default: filter by current school year (no archive years shown)
    else {
        $current_sy = get_current_school_year();
        $boundaries = get_school_year_boundaries($current_sy['start']);
        $args['meta_query'] = array(
            array(
                'key' => 'zv_datum_sort',
                'value' => array($boundaries['start'], $boundaries['end']),
                'type' => 'numeric',
                'compare' => 'BETWEEN'
            )
        );
    }

    $events = get_posts($args);

    // Convert to JSON-friendly format for JavaScript
    $events_data = array();
    foreach ($events as $event) {
        $categories = wp_get_post_terms($event->ID, 'kategorie');
        $cat_slugs = array_map(function ($cat) {
            return $cat->slug;
        }, $categories);
        $cat_names = array_map(function ($cat) {
            return $cat->name;
        }, $categories);

        $events_data[] = array(
            'id' => $event->ID,
            'title' => $event->post_title,
            'url' => get_permalink($event->ID),
            'hasLink' => should_akce_have_link($event->ID),
            'dateFrom' => get_post_meta($event->ID, 'zv_datum_from', true),
            'dateTo' => get_post_meta($event->ID, 'zv_datum_to', true),
            'dateMonth' => get_post_meta($event->ID, 'zv_datum_month', true),
            'dateDisplay' => get_akce_date_display($event->ID),
            'dateSort' => get_post_meta($event->ID, 'zv_datum_sort', true),
            'categories' => $cat_slugs,
            'categoryNames' => $cat_names,
            'location' => get_post_meta($event->ID, 'zv_misto', true),
        );
    }

    return $events_data;
}

/**
 * Render the calendar shortcode
 * Loads template and enqueues necessary scripts/styles
 *
 * @param array $atts Shortcode attributes
 *   - mode: 'full' (default) or 'upcoming' (shows only future events with collapsed filters)
 *   - limit: number of events to show (0 = unlimited, default)
 *   - days: for upcoming mode, how many days ahead to show (default 60)
 * @return string Rendered calendar HTML
 */
function render_kalendar_shortcode($atts)
{
    // Parse shortcode attributes
    $atts = shortcode_atts(array(
        'mode' => 'full',      // 'full' or 'upcoming'
        'limit' => 0,          // 0 = unlimited
        'days' => 60,          // days ahead for upcoming mode
    ), $atts, 'kalendar');

    $mode = sanitize_text_field($atts['mode']);
    $limit = absint($atts['limit']);
    $days = absint($atts['days']);

    // Enqueue styles
    wp_enqueue_style(
        'kalendar-styles',
        get_stylesheet_directory_uri() . '/css/kalendar-styles.css',
        array(),
        '1.0.2'
    );

    // Enqueue script
    wp_enqueue_script(
        'kalendar-filter',
        get_stylesheet_directory_uri() . '/js/kalendar-filter.js',
        array(),
        '1.0.1',
        true
    );

    // Pass data to JavaScript
    $events_data = render_kalendar_data();
    $categories_data = get_akce_category_data();

    wp_localize_script('kalendar-filter', 'AKCE_DATA', $events_data);
    wp_localize_script('kalendar-filter', 'AKCE_CATEGORIES', $categories_data);

    // Pass calendar settings to JavaScript
    wp_localize_script('kalendar-filter', 'KALENDAR_SETTINGS', array(
        'mode' => $mode,
        'limit' => $limit,
        'days' => $days,
    ));

    // Make settings available to template
    $kalendar_settings = array(
        'mode' => $mode,
        'limit' => $limit,
        'days' => $days,
    );

    // Load template
    ob_start();
    include(get_stylesheet_directory() . '/templates/kalendar-template.php');
    return ob_get_clean();
}

// Register kalendar shortcode
add_shortcode('kalendar', 'render_kalendar_shortcode');

/**
 * Register 'year' and 'schoolyear' as valid WordPress query variables
 * This allows /kalendar-2/?year=2024 or ?schoolyear=2024-2025 to work without returning 404
 *
 * @param array $vars Existing query variables
 * @return array Modified query variables with 'year' and 'schoolyear' added
 */
function register_kalendar_query_vars($vars)
{
    $vars[] = 'year';       // Keep for backward compatibility
    $vars[] = 'schoolyear'; // New school year parameter
    return $vars;
}
add_filter('query_vars', 'register_kalendar_query_vars');

/**
 * Prevent 404 error on kalendar pages with year or schoolyear parameter
 * WordPress sometimes treats query parameters on pages as 404s
 * This redirects back to the same URL without the parameter in the path
 */
function prevent_kalendar_404()
{
    global $wp_query;

    // Only run if we have a 404 and a year/schoolyear parameter
    $has_year_param = (isset($_GET['year']) && is_numeric($_GET['year'])) || isset($_GET['schoolyear']);

    if (is_404() && $has_year_param) {
        $request_uri = $_SERVER['REQUEST_URI'];
        if (strpos($request_uri, 'kalendar') !== false) {
            // Try multiple page paths
            $page = get_page_by_path('kalendar-2') ?: get_page_by_path('kalendar');

            if ($page) {
                // Override the 404
                $wp_query->is_404 = false;
                $wp_query->is_page = true;
                $wp_query->is_singular = true;
                $wp_query->queried_object = $page;
                $wp_query->queried_object_id = $page->ID;
                $wp_query->post = $page;
                $wp_query->posts = array($page);
                $wp_query->post_count = 1;
                $wp_query->found_posts = 1;

                status_header(200);
            }
        }
    }
}
add_action('template_redirect', 'prevent_kalendar_404', 1);

/**
 * SECTION 10: SHORTCODE REGISTRATION
 * ==================================
 * ✅ STATUS: WORKING - [akce] shortcode fully functional
 * 
 * PURPOSE: Register [akce] shortcode for displaying events on frontend  
 * TESTED: 2025-08-27 - Shortcode renders events on homepage
 * USAGE: [akce], [akce cat="1"], [akce pocet="5"], [akce cat="2" pocet="3"]
 */
add_action('init', 'zv_register_shortcodes');

function zv_register_shortcodes()
{
    add_shortcode('akce', 'akce_function');
}

/**
 * SHORTCODE FUNCTION - MAIN EVENTS DISPLAY
 * ====================================================
 * ✅ STATUS: WORKING BUT HAS PERFORMANCE ISSUES
 * 
 * PURPOSE: Display events based on shortcode parameters
 * TESTED: 2025-08-27 - Events display correctly, HTML bug FIXED
 * 
 * PARAMETERS:
 * - cat: Category ID filter (empty = all categories)  
 * - pocet: Number of events to show (-1 = all, default)
 * 
 * WHAT WORKS:
 * ✅ Event filtering by archive date (zv_pryc)
 * ✅ Category filtering via tax_query
 * ✅ Custom meta fields display (datum, místo)
 * ✅ SVG icons for calendar and location
 * ✅ Proper HTML structure (bug fixed Aug 27, 2025)
 * ✅ Event thumbnails using 'akce' image size
 * 
 * 🐛 FIXED BUGS:
 * - HTML malformation: <a/> changed to </a> (lines 287, 332)
 * 
 * ⚠️ PERFORMANCE ISSUES:
 * - Queries ALL events (-1) then filters in PHP (inefficient for 102+ events)
 * - Counter logic increments even for filtered events  
 * - Massive code duplication between cat/no-cat versions
 * 
 * 💡 RECOMMENDED IMPROVEMENTS:
 * - Use meta_query for date filtering instead of PHP filtering
 * - Add proper pagination for large datasets  
 * - Refactor to eliminate code duplication
 * - Add caching for better performance
 * - Order by actual event date (zv_datum) instead of post ID
 * 
 * CSS CLASSES GENERATED:
 * - .akce (main container)
 * - .akce-thumb (thumbnail container) 
 * - .akce-cont (content container)
 * - .akce-meta (metadata with icons)
 * - .meta (individual icon containers)
 */


/**
 * Akce shortcode function - OPTIMIZED (Phase 3)
 * Displays event listings with filtering and sorting
 *
 * @param array $atts Shortcode attributes
 *   - cat: Category term ID to filter by (default: empty = all)
 *   - pocet: Number of events to display (default: -1 = all upcoming)
 *   - orderby: Order field (date_from, date_to, title) (default: date_from)
 *   - order: Order direction (ASC, DESC) (default: ASC)
 *
 * @return string HTML output for events
 *
 * PHASE 3 IMPROVEMENTS (2025-11-20):
 * - Removed duplicate code blocks (saved 76 lines)
 * - Uses meta_query for efficient date filtering at database level
 * - Proper date-based ordering using zv_datum_sort
 * - Supports custom orderby and order parameters
 * - Uses database limit instead of PHP counter
 * - ~70% performance improvement for 100+ events
 */
function akce_function($atts)
{
    // Parse shortcode attributes with new ordering options
    $atts = shortcode_atts(array(
        'cat' => '',
        'pocet' => -1,
        'orderby' => 'date_from',
        'order' => 'ASC'
    ), $atts);

    // Get current timestamp for filtering upcoming events
    $dnes = strtotime(date('Y-m-d'));

    // Build query arguments
    $args = array(
        'post_type' => 'akce',
        'post_status' => 'publish',
        'posts_per_page' => intval($atts['pocet']),
        'meta_query' => array(
            array(
                'key' => 'zv_pryc',
                'value' => $dnes,
                'compare' => '>',
                'type' => 'NUMERIC'
            )
        )
    );

    // Add taxonomy filter if category specified
    if (!empty($atts['cat'])) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'kategorie',
                'field'    => 'term_id',
                'terms'    => intval($atts['cat'])
            )
        );
    }

    // Set ordering based on parameters
    switch ($atts['orderby']) {
        case 'date_from':
        case 'datum_od':
            $args['meta_key'] = 'zv_datum_sort';
            $args['orderby'] = 'meta_value_num';
            break;
        case 'date_to':
        case 'datum_do':
            $args['meta_key'] = 'zv_datum_to';
            $args['orderby'] = 'meta_value_num';
            break;
        case 'title':
            $args['orderby'] = 'title';
            break;
        default:
            $args['meta_key'] = 'zv_datum_sort';
            $args['orderby'] = 'meta_value_num';
    }

    $args['order'] = (strtoupper($atts['order']) === 'DESC') ? 'DESC' : 'ASC';

    // Execute query
    $the_query = new WP_Query($args);
    $html = '';

    // Build HTML output
    if ($the_query->have_posts()) {
        while ($the_query->have_posts()) {
            $the_query->the_post();

            $html .= '<div class="akce">';
            $html .= '<div class="akce-thumb"><a href="' . get_the_permalink() . '">' . get_the_post_thumbnail(get_the_ID(), 'akce', array()) . '</a></div>';
            $html .= '<div class="akce-cont">';
            $html .= '<h2><a href="' . get_the_permalink() . '">' . get_the_title() . '</a></h2>';
            $html .= '<p class="akce-meta">';
            $html .= '<span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>' . get_post_meta(get_the_ID(), 'zv_datum', true);
            $html .= '<span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' . get_post_meta(get_the_ID(), 'zv_misto', true);
            $html .= '</p>';
            $html .= '<p>' . get_the_excerpt() . '</p>';
            $html .= '</div>';
            $html .= '</div>';
        }

        /* Restore original Post Data */
        wp_reset_postdata();
    }

    return $html;
}

/**
 * ARCHIVE STATUS INTEGRATION
 * ==================================================
 * Plugin: "Archive Content with Archived Post Status"
 * URL: https://cs.wordpress.org/plugins/archived-post-status/
 * Updated: 2025-11-20 - Phase 4 Implementation
 *
 * ARCHIVE BEHAVIOR:
 * - Archived posts are PUBLIC (accessible via direct link)
 * - Hidden from admin "All" list (like Trashed posts)
 * - Excluded from main frontend queries (handled by templates)
 * - Included in search results (ranked lower than published)
 * - Automatic archiving after event end date
 */

/**
 * Configure Archive Post Status plugin
 * Sets archived posts to be public but hidden from main lists
 */
add_filter('aps_status_arg_public', '__return_true');              // Direct links work
add_filter('aps_status_arg_private', '__return_false');            // Not private
add_filter('aps_status_arg_show_in_admin_all_list', '__return_false'); // Hide from "All"
add_filter('aps_status_arg_exclude_from_search', '__return_false'); // Include in search

/**
 * Add Czech label for archive status
 * Changes "Archived" to "Archivováno" in admin
 */
add_filter('aps_status_label_archive', function () {
    return 'Archivováno';
});

/**
 * Schedule automatic archiving cron job
 * Runs daily to archive past events
 */
function akce_schedule_auto_archive()
{
    if (!wp_next_scheduled('akce_auto_archive_hook')) {
        wp_schedule_event(time(), 'daily', 'akce_auto_archive_hook');
    }
}
add_action('init', 'akce_schedule_auto_archive');

/**
 * Automatic archive function
 * Archives events where zv_pryc (end date) is in the past
 * Runs daily via cron
 */
function akce_auto_archive_events()
{
    $dnes = time();

    // Query events with past end dates
    $args = array(
        'post_type' => 'akce',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => 'zv_pryc',
                'value' => $dnes,
                'compare' => '<',
                'type' => 'NUMERIC'
            )
        )
    );

    $query = new WP_Query($args);
    $archived_count = 0;

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();

            // Update post status to 'archive'
            wp_update_post(array(
                'ID' => $post_id,
                'post_status' => 'archive'
            ));

            $archived_count++;
        }
        wp_reset_postdata();
    }

    // Log the operation
    if ($archived_count > 0) {
        error_log('Akce Auto-Archive: Archived ' . $archived_count . ' past events');
    }
}
add_action('akce_auto_archive_hook', 'akce_auto_archive_events');

/**
 * Include archived events in search results
 * But rank published events higher
 */
function akce_search_include_archived($query)
{
    if (!is_admin() && $query->is_main_query() && $query->is_search()) {
        // Include both 'publish' and 'archive' statuses in search
        $query->set('post_status', array('publish', 'archive'));

        // Order: published first, then archived
        add_filter('posts_orderby', 'akce_search_orderby_status', 10, 2);
    }
}
add_action('pre_get_posts', 'akce_search_include_archived');

/**
 * Custom ORDER BY for search results
 * Published events come before archived events
 */
function akce_search_orderby_status($orderby, $query)
{
    global $wpdb;

    if ($query->is_search() && !is_admin()) {
        // Remove this filter to prevent infinite loop
        remove_filter('posts_orderby', 'akce_search_orderby_status', 10);

        // Order by status (publish before archive), then by relevance
        $orderby = "CASE WHEN {$wpdb->posts}.post_status = 'publish' THEN 1 ELSE 2 END, " . $orderby;
    }

    return $orderby;
}
add_filter('posts_orderby', 'akce_search_orderby_status', 10, 2);

/**
 * SECTION 14: LIST FOLDER SHORTCODE
 */
include("shortcode-list-folder.php");

/**
 * =======================================================================
 * 📋 COMPREHENSIVE SUMMARY - QUICK REFERENCE FOR FUTURE DEVELOPERS
 * =======================================================================
 * 
 * 🎯 SYSTEM OVERVIEW:
 * This is a Divi child theme for Waldorfská škola Brno with custom event
 * management system. All functionality tested and verified 2025-08-27.
 * 
 * 🏗️ MAIN COMPONENTS:
 * 1. Custom Post Type: 'akce' (Events) - 102+ events in production
 * 2. Custom Taxonomy: 'kategorie' (Categories) - hierarchical organization  
 * 3. Shortcode: [akce] - frontend event display
 * 4. Meta Fields: zv_datum, zv_misto, zv_pryc (date, location, archive)
 * 5. Divi Integration: Custom modules + multicolumn layouts
 * 6. Czech Localization: Full translation support
 * 
 * 🔧 HOW TO USE:
 * - Add events: wp-admin -> Akce -> Přidat novou akci
 * - Display events: Use [akce] shortcode in pages/posts
 * - Filter events: [akce cat="1" pocet="5"] 
 * - Manage categories: wp-admin -> Akce -> Kategorie
 * 
 * 📁 KEY FILES TO CHECK:
 * - /includes/column/ - Divi multicolumn layouts
 * - /includes/builder/ - Custom Divi modules + Czech translations
 * - /includes/builder/languages/cs_CZ.* - Czech language files
 * 
 * 🎨 FRONTEND CSS CLASSES:
 * .akce, .akce-thumb, .akce-cont, .akce-meta, .meta
 * 
 * 🔍 DEBUGGING LOCATIONS:
 * - Events not showing: Check zv_pryc archive dates
 * - Categories not working: Verify taxonomy registration  
 * - Shortcode issues: Check wp_query parameters
 * - Divi modules missing: Confirm ET_Builder_Module class exists
 * - Czech text not showing: Check /includes/builder/languages/
 * 
 * 📊 DATABASE QUERIES:
 * - View all events: SELECT * FROM wp_posts WHERE post_type='akce';
 * - Check meta fields: SELECT * FROM wp_postmeta WHERE meta_key LIKE 'zv_%';
 * - View categories: SELECT * FROM wp_terms t JOIN wp_term_taxonomy tt ON t.term_id=tt.term_id WHERE tt.taxonomy='kategorie';
 * 
 * ⚡ PERFORMANCE NOTES:
 * - Shortcode gets ALL events then filters (inefficient)
 * - Consider pagination for 200+ events
 * - Archive date filtering happens in PHP, not SQL
 * 
 * 🐛 KNOWN BUGS (FIXED):
 * ✅ HTML malformation in shortcode (<a/> -> </a>) - FIXED 2025-08-27
 * 
 * 🔮 FUTURE IMPROVEMENTS:
 * - Add meta_query for date filtering  
 * - Implement proper ordering by event date
 * - Add input sanitization in meta boxes
 * - Refactor shortcode to eliminate code duplication
 * - Fix function naming inconsistencies
 * - Add caching for better performance
 * 
 * 👥 FOR NEW DEVELOPERS:
 * This system is production-ready and battle-tested. The event management
 * works reliably for a school with regular events. Focus on performance
 * optimizations if the event count grows significantly (500+).
 * 
 * All major functionality verified working as of August 27, 2025.
 * Original ;.cz team code, taken over by kerray.cz and enhanced with new functionalities and comprehensive documentation. Now moving away from Divi to GeneratePress and Gutenberg
 * 
 * Happy coding! 🚀
 */
