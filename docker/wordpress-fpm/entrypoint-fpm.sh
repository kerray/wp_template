#!/bin/bash
set -euo pipefail

# WordPress PHP-FPM AI Development Container Entrypoint
# Handles initialization and ensures proper permissions

echo "Starting WordPress PHP-FPM AI Development Container..."
echo "Versions: WP-CLI v${WP_CLI_VERSION}, Composer v${COMPOSER_VERSION}, MCP Plugin v${WP_MCP_VERSION}"
echo "PHP-FPM will run as UID:GID ${HOST_USER_ID:-1000}:${HOST_GROUP_ID:-1000}"

# Ensure wp-content directories exist with proper permissions
mkdir -p /var/www/html/wp-content/{plugins,themes,uploads,upgrade}
mkdir -p /var/log/php

# Set ownership to the host user (for bidirectional file editing)
chown -R ${HOST_USER_ID:-1000}:${HOST_GROUP_ID:-1000} /var/www/html/wp-content 2>/dev/null || true
chown -R ${HOST_USER_ID:-1000}:${HOST_GROUP_ID:-1000} /var/log/php 2>/dev/null || true
chmod -R 755 /var/www/html/wp-content 2>/dev/null || true
chmod -R 755 /var/log/php 2>/dev/null || true

# Verify MCP plugin is in place
if [ -d "/var/www/html/wp-content/plugins/wordpress-mcp" ]; then
    echo "WordPress MCP Plugin (v${WP_MCP_VERSION}) is ready"
else
    echo "Warning: WordPress MCP Plugin not found - will need manual installation"
fi

# Verify WP-CLI is working
if wp --info --allow-root >/dev/null 2>&1; then
    echo "WP-CLI (v${WP_CLI_VERSION}) is ready"
else
    echo "Warning: WP-CLI installation issue detected"
fi

# Verify Composer is working
if composer --version >/dev/null 2>&1; then
    echo "Composer is ready"
else
    echo "Warning: Composer installation issue detected"
fi

echo "Container initialization complete!"

# Execute the original WordPress entrypoint
exec docker-entrypoint.sh "$@"
