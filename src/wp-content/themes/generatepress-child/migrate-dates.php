<?php
/**
 * Migration script: Populate zv_datum_sort for all events
 * Run via WP-CLI: wp eval-file wp-content/themes/Divi-child-wplama/migrate-dates.php
 */

// Ensure WordPress is loaded
if (!function_exists('get_post_meta')) {
    die("This script must be run through WP-CLI\n");
}

/**
 * Parse Czech date string to timestamp
 * Handles formats: "12.3.2025", "1. 9. 2026", "12.3. - 14.3.2025", etc.
 */
function parse_czech_date($date_str) {
    if (empty($date_str)) return false;

    // Clean up the string - normalize spaces and dots
    $date_str = trim($date_str);

    // Pattern 1: "1. 9. 2026" or "12. 3. 2025" (with spaces)
    if (preg_match('/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/', $date_str, $matches)) {
        $day = (int)$matches[1];
        $month = (int)$matches[2];
        $year = (int)$matches[3];
        return mktime(0, 0, 0, $month, $day, $year);
    }

    // Pattern 2: "12.3.2025" (no spaces)
    if (preg_match('/(\d{1,2})\.(\d{1,2})\.(\d{4})/', $date_str, $matches)) {
        $day = (int)$matches[1];
        $month = (int)$matches[2];
        $year = (int)$matches[3];
        return mktime(0, 0, 0, $month, $day, $year);
    }

    // Pattern 3: Range "12.3. - 14.3.2025" - extract first date
    if (preg_match('/(\d{1,2})\.\s*(\d{1,2})\.\s*[-–]\s*\d{1,2}\.\s*\d{1,2}\.\s*(\d{4})/', $date_str, $matches)) {
        $day = (int)$matches[1];
        $month = (int)$matches[2];
        $year = (int)$matches[3];
        return mktime(0, 0, 0, $month, $day, $year);
    }

    // Pattern 4: Month only in Czech "září 2025", "leden 2024"
    $czech_months = array(
        'leden' => 1, 'únor' => 2, 'březen' => 3, 'duben' => 4,
        'květen' => 5, 'červen' => 6, 'červenec' => 7, 'srpen' => 8,
        'září' => 9, 'říjen' => 10, 'listopad' => 11, 'prosinec' => 12
    );
    foreach ($czech_months as $name => $num) {
        if (preg_match('/\b' . $name . '\b\s*(\d{4})/ui', $date_str, $matches)) {
            return mktime(0, 0, 0, $num, 1, (int)$matches[1]);
        }
    }

    // Try PHP's strtotime as fallback
    $parsed = strtotime($date_str);
    if ($parsed !== false && $parsed > 0) {
        return $parsed;
    }

    return false;
}

$args = array(
    'post_type' => 'akce',
    'post_status' => 'any',
    'posts_per_page' => -1,
);

$query = new WP_Query($args);
$migrated = 0;
$errors = 0;
$using_pryc = 0;

echo "Starting migration of " . $query->post_count . " events...\n";

foreach ($query->posts as $post) {
    $post_id = $post->ID;

    // Get existing date fields
    $datum_from = get_post_meta($post_id, 'zv_datum_from', true);
    $datum_month = get_post_meta($post_id, 'zv_datum_month', true);
    $datum_text = get_post_meta($post_id, 'zv_datum', true);
    $pryc = get_post_meta($post_id, 'zv_pryc', true);

    $sort_date = 0;
    $source = '';

    // Priority 1: Use structured date from
    if (!empty($datum_from) && is_numeric($datum_from)) {
        $sort_date = (int)$datum_from;
        $source = 'datum_from';
    }
    // Priority 2: Use month field (first day of month)
    elseif (!empty($datum_month) && preg_match('/^\d{4}-\d{2}$/', $datum_month)) {
        $sort_date = strtotime($datum_month . '-01');
        $source = 'datum_month';
    }
    // Priority 3: Try to parse text datum field (Czech format)
    elseif (!empty($datum_text)) {
        $parsed = parse_czech_date($datum_text);
        if ($parsed !== false && $parsed > 0) {
            $sort_date = $parsed;
            $source = 'datum_text';
        }
    }

    // Priority 4: Use archive date (zv_pryc) - but this is the END date
    // So we should still use it if nothing else is available
    if ($sort_date == 0 && !empty($pryc) && is_numeric($pryc)) {
        $sort_date = (int)$pryc;
        $source = 'pryc';
        $using_pryc++;
    }

    // Fallback: Use post date
    if ($sort_date == 0) {
        $sort_date = strtotime($post->post_date);
        $source = 'post_date';
    }

    if ($sort_date > 0) {
        update_post_meta($post_id, 'zv_datum_sort', $sort_date);
        $migrated++;

        // Also populate zv_datum_from if it's empty but we parsed a text date
        if (empty($datum_from) && $source == 'datum_text' && !empty($datum_text)) {
            $parsed = parse_czech_date($datum_text);
            if ($parsed !== false && $parsed > 0) {
                update_post_meta($post_id, 'zv_datum_from', $parsed);
            }
        }
    } else {
        echo "Warning: Could not determine date for post $post_id ({$post->post_title})\n";
        $errors++;
    }
}

echo "\nMigration complete!\n";
echo "Migrated: $migrated events\n";
echo "Using zv_pryc (archive date): $using_pryc events\n";
echo "Errors: $errors events\n";
