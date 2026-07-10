<?php
/**
 * validate-blocks.php — check that converted Gutenberg markup parses cleanly.
 *
 * Usage (from repo root, WordPress container running):
 *   docker compose cp path/to/converted.html wordpress:/tmp/converted.html
 *   docker compose exec -T wordpress wp eval-file /path/to/validate-blocks.php /tmp/converted.html --allow-root
 *
 * Or inline a file already inside the container:
 *   docker compose exec -T wordpress wp eval-file wp-content/.../validate-blocks.php /tmp/converted.html --allow-root
 *
 * PASS criteria (a normalized page must satisfy ALL):
 *   - BAD_freeform_with_content == 0   (no content fell outside a block = no editor "recovery")
 *   - every block name is a registered core/* block or an allowed passthrough
 *     (core/shortcode, core/html) — no unexpected/unknown blocks
 *
 * Exit code is non-zero when validation fails, so it can gate a batch.
 */

// wp eval-file passes trailing args in $args; a raw `php` run uses $argv.
$path = null;
if (isset($args) && is_array($args) && !empty($args[0])) {
    $path = $args[0];
} elseif (isset($argv[1])) {
    $path = $argv[1];
}
if (!$path || !is_readable($path)) {
    fwrite(STDERR, "usage: wp eval-file validate-blocks.php <file.html>\n");
    exit(2);
}

$html   = file_get_contents($path);
$blocks = parse_blocks($html);

// Blocks that are legitimately allowed to appear in normalized output.
$allowed = [
    'core/group', 'core/columns', 'core/column', 'core/heading', 'core/paragraph',
    'core/list', 'core/list-item', 'core/image', 'core/gallery', 'core/buttons',
    'core/button', 'core/details', 'core/separator', 'core/table', 'core/embed',
    'core/quote', 'core/media-text', 'core/spacer',
    // passthrough / escape hatches — flagged in the report but not errors:
    'core/shortcode', 'core/html',
];

$flatten = function ($bs, &$out) use (&$flatten) {
    foreach ($bs as $b) {
        $out[] = $b;
        if (!empty($b['innerBlocks'])) {
            $flatten($b['innerBlocks'], $out);
        }
    }
};
$all = [];
$flatten($blocks, $all);

$freeform_with_content = 0;
$freeform_samples      = [];
$named                 = [];
$unexpected            = [];
$passthrough           = 0;

foreach ($all as $b) {
    if ($b['blockName'] === null) {
        if (trim($b['innerHTML']) !== '') {
            $freeform_with_content++;
            if (count($freeform_samples) < 5) {
                $freeform_samples[] = trim(substr($b['innerHTML'], 0, 80));
            }
        }
        continue;
    }
    $name         = $b['blockName'];
    $named[$name] = ($named[$name] ?? 0) + 1;
    if (!in_array($name, $allowed, true)) {
        $unexpected[$name] = ($unexpected[$name] ?? 0) + 1;
    }
    if ($name === 'core/shortcode' || $name === 'core/html') {
        $passthrough++;
    }
}

ksort($named);
echo "file: $path\n";
echo "top-level blocks: " . count($blocks) . "   total (incl. nested): " . count($all) . "\n";
echo "block inventory:\n";
foreach ($named as $k => $v) {
    echo "  $k: $v\n";
}
echo "passthrough blocks (core/shortcode|core/html): $passthrough\n";
echo "BAD_freeform_with_content: $freeform_with_content\n";
foreach ($freeform_samples as $s) {
    echo "    ! stray: " . $s . "\n";
}

$fail = false;
if ($freeform_with_content > 0) {
    echo "FAIL: content outside any block (would trigger block recovery).\n";
    $fail = true;
}
if (!empty($unexpected)) {
    echo "FAIL: unexpected/unknown blocks: " . implode(', ', array_keys($unexpected)) . "\n";
    $fail = true;
}

echo $fail ? "RESULT: FAIL\n" : "RESULT: PASS\n";
exit($fail ? 1 : 0);
