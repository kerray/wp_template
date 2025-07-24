#!/bin/bash
set -euo pipefail

# WordPress AI Development Container Entrypoint
# Handles initialization and ensures proper permissions

echo "🚀 Starting WordPress AI Development Container..."
echo "📦 Versions: WP-CLI v${WP_CLI_VERSION}, Composer v${COMPOSER_VERSION}, MCP Plugin v${WP_MCP_VERSION}"

# Ensure wp-content directories exist with proper permissions
mkdir -p /var/www/html/wp-content/{plugins,themes,uploads,upgrade}
chown -R www-data:www-data /var/www/html/wp-content
chmod -R 755 /var/www/html/wp-content

# Verify MCP plugin is in place
if [ -d "/var/www/html/wp-content/plugins/wordpress-mcp" ]; then
    echo "✅ WordPress MCP Plugin (v${WP_MCP_VERSION}) is ready"
else
    echo "⚠️  WordPress MCP Plugin not found - will need manual installation"
fi

# Verify WP-CLI is working
if wp --info --allow-root >/dev/null 2>&1; then
    echo "✅ WP-CLI (v${WP_CLI_VERSION}) is ready"
else
    echo "⚠️  WP-CLI installation issue detected"
fi

# Verify Composer is working
if composer --version >/dev/null 2>&1; then
    echo "✅ Composer is ready"
else
    echo "⚠️  Composer installation issue detected"
fi

echo "🎯 Container initialization complete!"

# Execute the original WordPress entrypoint
exec docker-entrypoint.sh "$@"