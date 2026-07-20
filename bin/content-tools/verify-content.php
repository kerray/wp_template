<?php
/**
 * verify-content.php — full-corpus content conversion verification sweep.
 *
 * For every item in the conversion manifest, compare actual DB state
 * (detected engine, DIVI residue, Gutenberg block validity) to its target.
 *
 * Usage (from repo root, WordPress container running):
 *   docker compose cp conversion-manifest.json wordpress:/tmp/conversion-manifest.json
 *   docker compose cp content-conversion.config.json wordpress:/tmp/content-conversion.config.json
 *   docker compose cp bin/content-tools/verify-content.php wordpress:/tmp/verify-content.php
 *   docker compose exec -T wordpress wp eval-file /tmp/verify-content.php \
 *       /tmp/conversion-manifest.json /tmp/content-conversion.config.json --allow-root
 *
 * Or via the Justfile wrapper: `just verify-content`
 *
 * Site-specific data comes from content-conversion.config.json (optional):
 *   inventory.expected_skips  — post ids intentionally left unconverted
 *   inventory.post_types      — post types in scope for the DB-wide residue query
 *
 * Output: JSON report. Exit code 1 when any mismatch/residue/invalid block found.
 */

// wp eval-file passes trailing args in $args; a raw `php` run uses $argv.
$manifest_path = $args[0] ?? $argv[1] ?? '/tmp/conversion-manifest.json';
$config_path   = $args[1] ?? $argv[2] ?? '/tmp/content-conversion.config.json';

if (!is_readable($manifest_path)) {
    fwrite(STDERR, "usage: wp eval-file verify-content.php <conversion-manifest.json> [content-conversion.config.json]\n");
    exit(2);
}
$manifest = json_decode(file_get_contents($manifest_path), true);
$items = isset($manifest['items']) ? $manifest['items'] : $manifest;

$config = is_readable($config_path)
    ? (json_decode(file_get_contents($config_path), true) ?: [])
    : [];
$expected_skips = array_map('intval', $config['inventory']['expected_skips'] ?? []);
$post_types     = $config['inventory']['post_types'] ?? ['page', 'post'];

$counts = ['ok' => 0, 'mismatch' => 0, 'missing' => 0, 'skipped_expected' => 0];
$mismatches = [];
$et_pb_residue = [];
$invalid_blocks = [];

foreach ($items as $it) {
    if (!is_array($it) || !isset($it['id'])) continue;
    $id = (int)$it['id'];
    $target = $it['target'] ?? null;
    if (!in_array($target, ['markdown', 'gutenberg'], true)) continue;

    $p = get_post($id);
    if (!$p) { $counts['missing']++; $mismatches[] = "$id: post missing"; continue; }

    $content = $p->post_content;
    $md_src = $p->post_content_filtered;
    $md_flag = get_post_meta($id, '_markdown_enabled', true);
    $override = get_post_meta($id, '_headless_engine', true);

    // Detect engine the same way the headless API does
    if ($override) $engine = $override;
    elseif ($md_flag === '1' && $md_src !== '') $engine = 'markdown';
    elseif (strpos($content, '<!-- wp:') !== false) $engine = 'gutenberg';
    elseif (strpos($content, '[et_pb_') !== false) $engine = 'divi';
    else $engine = 'html';

    if (in_array($id, $expected_skips, true)) {
        $counts['skipped_expected']++;
        continue;
    }

    if ($engine !== $target) {
        $counts['mismatch']++;
        $mismatches[] = "$id ({$p->post_name}, {$p->post_type}/{$p->post_status}): target=$target actual=$engine";
    } else {
        $counts['ok']++;
    }

    // DIVI residue check in canonical content
    $canon = $engine === 'markdown' ? $md_src : $content;
    if (strpos($canon, '[et_pb_') !== false) $et_pb_residue[] = $id;
    if ($engine === 'markdown' && strpos($content, '[et_pb_') !== false) $et_pb_residue[] = "$id(rendered)";

    // Gutenberg: parse validation
    if ($target === 'gutenberg') {
        $blocks = parse_blocks($content);
        foreach ($blocks as $b) {
            if ($b['blockName'] === null && trim($b['innerHTML']) !== '') {
                $invalid_blocks[] = $id;
                break;
            }
        }
    }
}

// Whole-DB residue: any post of the configured types still containing [et_pb_ in post_content
global $wpdb;
$placeholders = implode(',', array_fill(0, count($post_types), '%s'));
$db_residue = $wpdb->get_col($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts}
     WHERE post_type IN ($placeholders)
       AND post_status NOT IN ('trash','auto-draft','inherit')
       AND post_content LIKE '%%[et_pb_%%'",
    $post_types
));

echo json_encode([
    'counts' => $counts,
    'mismatches' => $mismatches,
    'et_pb_residue_in_canonical' => $et_pb_residue,
    'gutenberg_invalid_blocks' => array_values(array_unique($invalid_blocks)),
    'db_wide_et_pb_residue_ids' => $db_residue,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

$fail = $counts['mismatch'] > 0 || $counts['missing'] > 0
    || !empty($et_pb_residue) || !empty($invalid_blocks) || !empty($db_residue);
exit($fail ? 1 : 0);
