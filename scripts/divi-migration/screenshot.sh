#!/bin/bash
# DIVI Migration: Take screenshots of content before/after conversion
# Usage: ./screenshot.sh <post_type> <slug> <before|after>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTENT_DIR="$PROJECT_ROOT/content"

# WP-CLI wrapper function
wp_cli() {
    docker-compose exec -T wordpress wp "$@" --allow-root 2>/dev/null </dev/null
}

take_screenshot() {
    local post_type="$1"
    local slug="$2"
    local timing="$3"  # before or after

    echo "Taking $timing screenshot for $post_type: $slug"

    # Determine content directory
    local type_dir
    case "$post_type" in
        page) type_dir="pages" ;;
        post) type_dir="posts" ;;
        akce) type_dir="akce" ;;
        *) echo "Error: Unknown post type: $post_type"; exit 1 ;;
    esac

    local content_dir="$CONTENT_DIR/$type_dir/$slug"

    # Ensure directory exists
    mkdir -p "$content_dir"

    # Get post URL
    local post_url
    post_url=$(wp_cli post list \
        --post_type="$post_type" \
        --name="$slug" \
        --field=url 2>/dev/null || true)

    if [ -z "$post_url" ]; then
        # Fallback: construct URL from guid
        local guid
        guid=$(wp_cli post list \
            --post_type="$post_type" \
            --name="$slug" \
            --field=guid 2>/dev/null || true)

        if [ -z "$guid" ]; then
            echo "Error: Could not find $post_type with slug: $slug"
            exit 1
        fi

        # Convert to localhost URL
        post_url=$(echo "$guid" | sed 's|https\?://[^/]*/|http://localhost:8080/|')
    fi

    echo "  URL: $post_url"

    local screenshot_path="$content_dir/screenshot-${timing}.png"

    # Use Playwright MCP to take screenshot
    # This outputs a node script that can be run
    cat > "/tmp/screenshot-${slug}-${timing}.js" << EOF
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('${post_url}', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '${screenshot_path}', fullPage: true });
    await browser.close();
    console.log('Screenshot saved to: ${screenshot_path}');
})();
EOF

    echo "  Screenshot script created at: /tmp/screenshot-${slug}-${timing}.js"
    echo "  To take screenshot manually, run:"
    echo "    node /tmp/screenshot-${slug}-${timing}.js"
    echo ""
    echo "  Or use the MCP Playwright tools:"
    echo "    1. Navigate to: $post_url"
    echo "    2. Take full-page screenshot"
    echo "    3. Save to: $screenshot_path"

    # Update metadata with screenshot info
    if [ -f "$content_dir/metadata.json" ]; then
        local now
        now=$(date -Iseconds)

        if [ "$timing" = "before" ]; then
            jq --arg url "$post_url" --arg time "$now" \
                '.screenshots.before = { url: $url, taken_at: $time }' \
                "$content_dir/metadata.json" > "$content_dir/metadata.json.tmp" 2>/dev/null || true
        else
            jq --arg url "$post_url" --arg time "$now" \
                '.screenshots.after = { url: $url, taken_at: $time }' \
                "$content_dir/metadata.json" > "$content_dir/metadata.json.tmp" 2>/dev/null || true
        fi

        if [ -f "$content_dir/metadata.json.tmp" ]; then
            mv "$content_dir/metadata.json.tmp" "$content_dir/metadata.json"
        fi
    fi
}

# Main
if [ $# -lt 3 ]; then
    echo "Usage: $0 <post_type> <slug> <before|after>"
    echo ""
    echo "Takes a screenshot of the content for comparison."
    echo ""
    echo "post_type: page, post, or akce"
    echo "slug: the post slug"
    echo "timing: before (DIVI version) or after (converted version)"
    echo ""
    echo "Screenshots are saved to content/<type>/<slug>/screenshot-<timing>.png"
    exit 1
fi

if [ "$3" != "before" ] && [ "$3" != "after" ]; then
    echo "Error: timing must be 'before' or 'after'"
    exit 1
fi

take_screenshot "$1" "$2" "$3"
