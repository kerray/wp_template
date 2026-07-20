<?php
/**
 * content-hallucination-check.php — corpus-wide hallucination check:
 * no converted item may contain words absent from its pre-conversion original.
 *
 * Requires the pre-conversion SQL snapshot imported into a sibling DB
 * (default: verify_pre) on the same DB host, SELECT granted to the WP user:
 *   docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e \
 *     "CREATE DATABASE IF NOT EXISTS verify_pre; GRANT SELECT ON verify_pre.* TO \"wordpress\"@\"%\";"'
 *   docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" verify_pre' < backups/<snapshot>.sql
 * Then run like verify-content.php. Drop verify_pre afterwards.
 *
 * Usage:
 *   docker compose exec -T wordpress wp eval-file /tmp/content-hallucination-check.php \
 *       /tmp/conversion-manifest.json /tmp/content-conversion.config.json [pre_db_name] --allow-root
 *
 * Site-specific data from content-conversion.config.json (optional):
 *   table_prefix — prefix of the snapshot's posts table (default: live $wpdb->prefix)
 *
 * Known benign flag sources: curated/hand-rewritten content, documented
 * intentional transforms (e.g. shortcode swaps), image alt text (attribute
 * on the old side, plain text in markdown). Investigate anything else.
 */

$manifest_path = $args[0] ?? $argv[1] ?? '/tmp/conversion-manifest.json';
$config_path   = $args[1] ?? $argv[2] ?? '/tmp/content-conversion.config.json';
$pre_db        = $args[2] ?? $argv[3] ?? 'verify_pre';

if (!is_readable($manifest_path)) {
    fwrite(STDERR, "usage: wp eval-file content-hallucination-check.php <conversion-manifest.json> [content-conversion.config.json] [pre_db_name]\n");
    exit(2);
}
$manifest = json_decode(file_get_contents($manifest_path), true);
$items = isset($manifest['items']) ? $manifest['items'] : $manifest;

$config = is_readable($config_path)
    ? (json_decode(file_get_contents($config_path), true) ?: [])
    : [];
global $wpdb;
$prefix = $config['table_prefix'] ?? $wpdb->prefix;
if (!preg_match('/^[A-Za-z0-9_]+$/', $prefix) || !preg_match('/^[A-Za-z0-9_]+$/', $pre_db)) {
    fwrite(STDERR, "invalid table prefix or database name\n");
    exit(2);
}

$pre = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, $pre_db);
if ($pre->connect_error) { echo "CONNECT FAIL: {$pre->connect_error}\n"; exit(1); }
$pre->set_charset('utf8mb4');

function tokens(string $s): array {
    // strip shortcode names only (lowercase name followed by space/]/=), not markdown link text
    $s = preg_replace('/\[\/?([a-z0-9_]+)(?=[\s\]=\/])/', ' ', $s);
    $s = str_replace([']', '[', '"', "'"], ' ', $s);
    $s = preg_replace('/<!--.*?-->/s', ' ', $s);            // block comments
    $s = str_replace('<', ' <', $s);                        // avoid gluing adjacent cells/tags
    $s = wp_strip_all_tags($s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $s = mb_strtolower($s, 'UTF-8');
    preg_match_all('/[\p{L}\p{N}]{3,}/u', $s, $m);
    return array_unique($m[0]);
}

$flagged = [];
$checked = 0;
foreach ($items as $it) {
    if (!is_array($it) || !isset($it['id'])) continue;
    $target = $it['target'] ?? null;
    if (!in_array($target, ['markdown', 'gutenberg'], true)) continue;
    $id = (int)$it['id'];

    $res = $pre->query("SELECT post_content FROM `{$pre_db}`.`{$prefix}posts` WHERE ID = $id");
    $row = $res ? $res->fetch_row() : null;
    if (!$row) continue;
    $old = $row[0];

    $p = get_post($id);
    if (!$p) continue;
    $new = ($target === 'markdown') ? $p->post_content_filtered : $p->post_content;
    if (trim($new) === '') { $checked++; continue; }
    if ($target === 'markdown') {
        // link/image targets are attribute values in HTML but plain text in markdown
        $new = preg_replace('/\]\([^)\s]*(\s+"[^"]*")?\)/', '] ', $new);
        $new = preg_replace('~https?://\S+~', ' ', $new);
    }

    $novel = array_diff(tokens($new), tokens($old));
    // markdown syntax artifacts that aren't words
    $novel = array_filter($novel, fn($t) => !preg_match('/^(https?|www)$/', $t));
    $checked++;
    if (count($novel) > 0) {
        $flagged[$id] = [
            'slug' => $p->post_name, 'type' => $p->post_type, 'target' => $target,
            'novel_count' => count($novel),
            'novel_sample' => array_slice(array_values($novel), 0, 12),
        ];
    }
}
echo json_encode([
    'checked' => $checked,
    'clean' => $checked - count($flagged),
    'flagged_count' => count($flagged),
    'flagged' => $flagged,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

exit(count($flagged) > 0 ? 1 : 0);
