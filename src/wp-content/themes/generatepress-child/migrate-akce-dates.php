<?php
/**
 * Akce Date Migration Script v2
 * Migrates old zv_datum text fields to structured date fields
 *
 * Run via WP-CLI:
 *   wp eval-file wp-content/themes/Divi-child-wplama/migrate-akce-dates.php
 *
 * Dry run (preview only):
 *   wp eval-file wp-content/themes/Divi-child-wplama/migrate-akce-dates.php --dry-run
 */

// Ensure WordPress is loaded
if (!defined('ABSPATH')) {
    die('WordPress not loaded. Run via WP-CLI: wp eval-file <script>');
}

// Check if running via WP-CLI
$is_cli = defined('WP_CLI') && WP_CLI;
$dry_run = $is_cli && in_array('--dry-run', $GLOBALS['argv'] ?? []);

// Czech month names to number mapping
$czech_months = array(
    'leden' => '01', 'ledna' => '01',
    'únor' => '02', 'února' => '02',
    'březen' => '03', 'března' => '03',
    'duben' => '04', 'dubna' => '04',
    'květen' => '05', 'května' => '05',
    'červen' => '06', 'června' => '06',
    'červenec' => '07', 'července' => '07',
    'srpen' => '08', 'srpna' => '08',
    'září' => '09',
    'říjen' => '10', 'října' => '10',
    'listopad' => '11', 'listopadu' => '11',
    'prosinec' => '12', 'prosince' => '12'
);

/**
 * Parse Czech date string into structured data
 */
function parse_czech_date($date_string, $czech_months) {
    $result = array(
        'success' => false,
        'type' => null,
        'from' => null,
        'to' => null,
        'month' => null,
        'from_time' => null,
        'to_time' => null,
        'message' => ''
    );

    $date_string = trim($date_string);
    if (empty($date_string)) {
        $result['message'] = 'Empty date string';
        return $result;
    }

    // Current year for dates without year
    $current_year = date('Y');

    // Clean up the string - normalize spaces around dots
    $clean = preg_replace('/\s+/', ' ', $date_string);
    $clean = str_replace(' .', '.', $clean);
    // Add space after . if followed by digit (normalize 24.3.2022 to 24. 3. 2022)
    $clean = preg_replace('/\.(\d)/', '. $1', $clean);
    // Now normalize multiple spaces
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);

    // Extract time information first
    $time_from = null;
    $time_to = null;

    // Pattern: 18:00 - 20:00 or 18:00-20:00 or 17.30 (decimal time)
    if (preg_match('/(\d{1,2})[:\.](\d{2})\s*[-–]\s*(\d{1,2})[:\.](\d{2})/', $clean, $time_match)) {
        $time_from = sprintf('%02d:%02d', $time_match[1], $time_match[2]);
        $time_to = sprintf('%02d:%02d', $time_match[3], $time_match[4]);
        $clean = preg_replace('/\s*\d{1,2}[:\.]?\d{2}\s*[-–]\s*\d{1,2}[:\.]?\d{2}\s*(hodin)?/', '', $clean);
    } elseif (preg_match('/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*hodin/', $clean, $time_match)) {
        // Pattern: "14 - 18 hodin" - hour only, no minutes
        $time_from = sprintf('%02d:00', $time_match[1]);
        $time_to = sprintf('%02d:00', $time_match[2]);
        $clean = preg_replace('/\s*\d{1,2}\s*[-–]\s*\d{1,2}\s*hodin/', '', $clean);
    } elseif (preg_match('/v?\s*(\d{1,2})[:\.](\d{2})$/', $clean, $time_match)) {
        // Only match time at the END of the string to avoid confusing with dates
        $time_from = sprintf('%02d:%02d', $time_match[1], $time_match[2]);
        $clean = preg_replace('/\s*v?\s*\d{1,2}[:\.]?\d{2}$/', '', $clean);
    }

    // Re-trim after time extraction
    $clean = trim($clean);

    // Pattern 1: Month only - "květen 2025" or "května 2025"
    foreach ($czech_months as $name => $num) {
        if (preg_match('/^' . preg_quote($name, '/') . '\s+(\d{4})$/iu', $clean, $matches)) {
            $result['success'] = true;
            $result['type'] = 'month';
            $result['month'] = $matches[1] . '-' . $num;
            $result['message'] = "Month: {$result['month']}";
            return $result;
        }
    }

    // Pattern 2: Single date - "12.3.2025" or "12.3." or "12. 3. 2025"
    if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?$/', $clean, $matches)) {
        $day = (int)$matches[1];
        $month = (int)$matches[2];
        $year = isset($matches[3]) && $matches[3] ? $matches[3] : $current_year;

        $timestamp = mktime(0, 0, 0, $month, $day, $year);

        $result['success'] = true;
        $result['type'] = 'single';
        $result['from'] = $timestamp;
        $result['to'] = $timestamp;
        $result['from_time'] = $time_from;
        $result['to_time'] = $time_to;
        $result['message'] = date('j.n.Y', $timestamp) . ($time_from ? " $time_from" . ($time_to ? "-$time_to" : '') : '');
        return $result;
    }

    // Pattern 3: Date range same month - "26.-27.10.2022" or "26. - 27. 10. 2022"
    if (preg_match('/^(\d{1,2})\.\s*[-–]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?$/', $clean, $matches)) {
        $day1 = (int)$matches[1];
        $day2 = (int)$matches[2];
        $month = (int)$matches[3];
        $year = isset($matches[4]) && $matches[4] ? $matches[4] : $current_year;

        $result['success'] = true;
        $result['type'] = 'range';
        $result['from'] = mktime(0, 0, 0, $month, $day1, $year);
        $result['to'] = mktime(0, 0, 0, $month, $day2, $year);
        $result['message'] = date('j.n.Y', $result['from']) . ' - ' . date('j.n.Y', $result['to']);
        return $result;
    }

    // Pattern 4: Date range different months - "12.3. - 15.4.2025" or "3.6.-4.6. 2022"
    if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\.\s*[-–]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?$/', $clean, $matches)) {
        $day1 = (int)$matches[1];
        $month1 = (int)$matches[2];
        $day2 = (int)$matches[3];
        $month2 = (int)$matches[4];
        $year = isset($matches[5]) && $matches[5] ? $matches[5] : $current_year;

        // Handle year boundary (December to January)
        $year1 = $year;
        $year2 = $year;
        if ($month2 < $month1) {
            $year2 = $year + 1;
        }

        $result['success'] = true;
        $result['type'] = 'range';
        $result['from'] = mktime(0, 0, 0, $month1, $day1, $year1);
        $result['to'] = mktime(0, 0, 0, $month2, $day2, $year2);
        $result['message'] = date('j.n.Y', $result['from']) . ' - ' . date('j.n.Y', $result['to']);
        return $result;
    }

    // Pattern 5: Full date range - "23.12.2022-2.1.2023" or "23. 12. 2022 - 2. 1. 2023"
    if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\s*[-–]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/', $clean, $matches)) {
        $result['success'] = true;
        $result['type'] = 'range';
        $result['from'] = mktime(0, 0, 0, (int)$matches[2], (int)$matches[1], (int)$matches[3]);
        $result['to'] = mktime(0, 0, 0, (int)$matches[5], (int)$matches[4], (int)$matches[6]);
        $result['message'] = date('j.n.Y', $result['from']) . ' - ' . date('j.n.Y', $result['to']);
        return $result;
    }

    // Pattern 6: Multi-date with "a" (and) - "22. 3. a 23. 3. 2024" or "11. 4. a 14. 4. 2025"
    // Format: day. month. a day. month. year
    if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\.\s*a\s+(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/i', $clean, $matches)) {
        $day1 = (int)$matches[1];
        $month1 = (int)$matches[2];
        $year = (int)$matches[5];

        $result['success'] = true;
        $result['type'] = 'single';
        $result['from'] = mktime(0, 0, 0, $month1, $day1, $year);
        $result['to'] = $result['from'];
        $result['message'] = date('j.n.Y', $result['from']) . " (multi-date, used first)";
        return $result;
    }

    // Pattern 6b: Multi-date - "6., 7. a 9. 5. 2024" - use first date
    if (preg_match('/^(\d{1,2})\.,?\s*\d{1,2}\.\s*a\s+\d{1,2}\.\s*(\d{1,2})\.\s*(\d{4})$/i', $clean, $matches)) {
        $day1 = (int)$matches[1];
        $month1 = (int)$matches[2];
        $year = (int)$matches[3];

        $result['success'] = true;
        $result['type'] = 'single';
        $result['from'] = mktime(0, 0, 0, $month1, $day1, $year);
        $result['to'] = $result['from'];
        $result['message'] = date('j.n.Y', $result['from']) . " (multi-date, used first)";
        return $result;
    }

    // Pattern 6c: Date range with missing dot - "25. - 26. 4 2023" -> 25.4.2023 - 26.4.2023
    if (preg_match('/^(\d{1,2})\.\s*[-–]\s*(\d{1,2})\.\s*(\d{1,2})\s+(\d{4})$/i', $clean, $matches)) {
        $day1 = (int)$matches[1];
        $day2 = (int)$matches[2];
        $month = (int)$matches[3];
        $year = (int)$matches[4];

        $result['success'] = true;
        $result['type'] = 'range';
        $result['from'] = mktime(0, 0, 0, $month, $day1, $year);
        $result['to'] = mktime(0, 0, 0, $month, $day2, $year);
        $result['message'] = date('j.n.Y', $result['from']) . ' - ' . date('j.n.Y', $result['to']);
        return $result;
    }

    // Pattern 7: ISO format - "2025-03-12"
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $clean, $matches)) {
        $timestamp = mktime(0, 0, 0, (int)$matches[2], (int)$matches[3], (int)$matches[1]);
        $result['success'] = true;
        $result['type'] = 'single';
        $result['from'] = $timestamp;
        $result['to'] = $timestamp;
        $result['message'] = date('j.n.Y', $timestamp);
        return $result;
    }

    $result['message'] = "Could not parse: $date_string";
    return $result;
}

// Get all akce posts
$akce_posts = get_posts(array(
    'post_type' => 'akce',
    'posts_per_page' => -1,
    'post_status' => array('publish', 'draft', 'pending', 'private', 'future'),
));

$stats = array(
    'total' => count($akce_posts),
    'success' => 0,
    'failed' => 0,
    'skipped' => 0,
    'types' => array(
        'single' => 0,
        'range' => 0,
        'month' => 0
    ),
    'with_time' => 0
);

$results = array();
$start_time = microtime(true);

echo "=== Akce Date Migration " . ($dry_run ? "(DRY RUN)" : "") . " ===\n\n";

foreach ($akce_posts as $post) {
    // Check if already migrated
    $existing_from = get_post_meta($post->ID, 'zv_datum_from', true);
    $existing_month = get_post_meta($post->ID, 'zv_datum_month', true);

    if (!empty($existing_from) || !empty($existing_month)) {
        $stats['skipped']++;
        continue;
    }

    // Get old date text
    $old_date = get_post_meta($post->ID, 'zv_datum', true);

    if (empty($old_date)) {
        $stats['skipped']++;
        continue;
    }

    // Parse the date
    $parsed = parse_czech_date($old_date, $czech_months);

    if ($parsed['success']) {
        $stats['success']++;
        $stats['types'][$parsed['type']]++;

        if ($parsed['from_time']) {
            $stats['with_time']++;
        }

        if (!$dry_run) {
            // Save new structured fields
            if ($parsed['type'] === 'month') {
                update_post_meta($post->ID, 'zv_datum_month', $parsed['month']);
                $sort_date = strtotime($parsed['month'] . '-01');
            } else {
                update_post_meta($post->ID, 'zv_datum_from', $parsed['from']);
                update_post_meta($post->ID, 'zv_datum_to', $parsed['to']);
                $sort_date = $parsed['from'];

                if ($parsed['from_time']) {
                    update_post_meta($post->ID, 'zv_datum_from_time', $parsed['from_time']);
                }
                if ($parsed['to_time']) {
                    update_post_meta($post->ID, 'zv_datum_to_time', $parsed['to_time']);
                }
            }

            // Update sort date
            update_post_meta($post->ID, 'zv_datum_sort', $sort_date);
        }

        echo "[{$post->ID}] {$post->post_title}\n";
        echo "  Old: {$old_date}\n";
        echo "  New: {$parsed['message']} ({$parsed['type']})" . ($parsed['from_time'] ? " ⏰" : "") . "\n\n";
    } else {
        $stats['failed']++;
        echo "[{$post->ID}] {$post->post_title}: FAILED\n";
        echo "  Old: {$old_date}\n";
        echo "  Error: {$parsed['message']}\n\n";
    }
}

$duration = round(microtime(true) - $start_time, 2);

echo "\n=== Migration Statistics ===\n";
echo "Total events: {$stats['total']}\n";
echo "✅ Successful: {$stats['success']}\n";
echo "⏭️  Skipped (already migrated): {$stats['skipped']}\n";
echo "❌ Failed: {$stats['failed']}\n\n";

echo "By type:\n";
echo "  - Single day: {$stats['types']['single']}\n";
echo "  - Date range: {$stats['types']['range']}\n";
echo "  - Month only: {$stats['types']['month']}\n";
echo "  - With times: {$stats['with_time']}\n\n";

echo "Duration: {$duration}s\n";

if ($dry_run) {
    echo "\n⚠️  DRY RUN MODE - No changes were made\n";
    echo "Run without --dry-run to apply changes.\n";
} else {
    echo "\n✅ Migration complete!\n";
}
