# WordPress AI Workspace Template - Justfile
# This file defines all project tasks and operations
# Run `just` to see all available commands

# Load environment variables from .env file if it exists
set dotenv-load := true

# Default recipe shows available commands
default:
    @just --list

# === Docker Environment Management ===

# Start WordPress environment (detached mode)
up:
    @echo "Starting WordPress environment..."
    docker-compose up -d
    @echo "Environment started. WordPress: http://localhost:${WP_PORT:-8080}, phpMyAdmin: http://localhost:${PMA_PORT:-8081}"

# Stop WordPress environment
down:
    @echo "Stopping WordPress environment..."
    docker-compose down

# Restart WordPress environment
restart:
    @echo "Restarting WordPress environment..."
    docker-compose restart

# Show status of all containers
status:
    @echo "Container status:"
    docker-compose ps

# View WordPress container logs
logs service="wordpress":
    docker-compose logs -f {{service}}

# View logs from all containers
logs-all:
    docker-compose logs -f

# === WP-CLI Operations ===

# Install WP-CLI in the WordPress container (gets latest version)
wp-install:
    @echo "Installing latest WP-CLI in WordPress container..."
    docker-compose exec wordpress bash -c "curl -L -o wp-cli.phar https://github.com/wp-cli/wp-cli/releases/download/v2.11.0/wp-cli-2.11.0.phar && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp"
    @echo "WP-CLI installed successfully!"
    @echo "Testing installation..."
    docker-compose exec wordpress wp --info --allow-root
    @echo "You can now use: just wp \"core version\""

# Run WP-CLI command (usage: just wp "core version")
wp *args:
    @if [ "{{args}}" = "" ]; then \
        echo "WordPress CLI wrapper for Docker environment"; \
        echo "Usage: just wp [wp-cli command]"; \
        echo ""; \
        echo "Examples:"; \
        echo "  just wp core version                # Check WordPress version"; \
        echo "  just wp plugin list                 # List installed plugins"; \
        echo "  just wp theme activate twentytwenty # Activate a theme"; \
        echo "  just wp user list                   # List WordPress users"; \
        echo ""; \
        echo "For more WP-CLI commands, visit: https://developer.wordpress.org/cli/commands/"; \
    else \
        if ! docker-compose ps | grep -q "wordpress.*Up"; then \
            echo "Warning: WordPress container does not appear to be running"; \
            echo "Starting Docker environment..."; \
            docker-compose up -d; \
            echo "Waiting for WordPress container to be ready..."; \
            sleep 5; \
        fi; \
        echo "Running: wp {{args}}"; \
        docker-compose exec wordpress wp {{args}} --allow-root; \
    fi

# Install and activate a WordPress plugin
plugin-install name:
    just wp plugin install {{name}} --activate

# Update all WordPress plugins
plugin-update-all:
    just wp plugin update --all

# List all installed plugins
plugin-list:
    just wp plugin list

# List all available themes
theme-list:
    just wp theme list

# Activate a WordPress theme
theme-activate name:
    just wp theme activate {{name}}

# Update WordPress core
core-update:
    just wp core update

# Check WordPress version
core-version:
    just wp core version

# Create a new WordPress user
user-create username email role="administrator":
    just wp user create {{username}} {{email}} --role={{role}}

# List WordPress users
user-list:
    just wp user list

# === WordPress URL Management ===

# Check current WordPress URLs
urls-check:
    @echo "Current WordPress URLs:"
    @echo "Site URL: $(just wp option get siteurl 2>/dev/null || echo 'Not set')"
    @echo "Home URL: $(just wp option get home 2>/dev/null || echo 'Not set')"

# Update WordPress URLs for local development
urls-update:
    @echo "Updating WordPress URLs for local development..."
    just wp option update siteurl "http://localhost:${WP_PORT:-8080}"
    just wp option update home "http://localhost:${WP_PORT:-8080}"
    @echo "URLs updated successfully!"
    @echo "Site should now be accessible at: http://localhost:${WP_PORT:-8080}"

# Search and replace URLs in database (usage: just urls-replace old-domain.com localhost:8080)
urls-replace old new:
    @echo "Replacing '{{old}}' with '{{new}}' in database..."
    just wp search-replace "{{old}}" "{{new}}"
    @echo "URL replacement completed!"

# === Database Operations ===

# Export database to backups directory
db-export:
    @mkdir -p backups
    @timestamp=$(date +%Y-%m-%d-%H%M%S); backup_file="backups/backup-$${timestamp}.sql"; echo "Exporting database to $${backup_file}..."; docker-compose exec db mysqldump -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} > "$${backup_file}"; echo "Database exported successfully!"

# Import database from backup file (usage: just db-import filename.sql)
db-import file:
    @echo "Importing database from backups/{{file}}..."
    docker-compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} < backups/{{file}}
    @echo "Database imported successfully!"

# Import compressed database backup (usage: just db-import-gz filename.sql.gz)
db-import-gz file:
    @echo "Importing compressed database from backups/{{file}}..."
    zcat backups/{{file}} | docker-compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress}
    @echo "Database imported successfully!"

# List available database backups
db-list-backups:
    @echo "Available database backups:"
    @ls -la backups/*.sql 2>/dev/null || echo "No SQL backups found"
    @ls -la backups/*.sql.gz 2>/dev/null || echo "No compressed backups found"

# Test database connection
db-test:
    @echo "Testing database connection..."
    docker-compose exec db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} -e "SHOW DATABASES;" || echo "Database connection failed"

# === Development Operations ===

# Open WordPress site in browser
open-site:
    @if command -v xdg-open > /dev/null; then xdg-open http://localhost:${WP_PORT:-8080}; elif command -v open > /dev/null; then open http://localhost:${WP_PORT:-8080}; elif command -v start > /dev/null; then start http://localhost:${WP_PORT:-8080}; else echo "WordPress site: http://localhost:${WP_PORT:-8080}"; fi

# Open phpMyAdmin in browser
open-phpmyadmin:
    @if command -v xdg-open > /dev/null; then xdg-open http://localhost:${PMA_PORT:-8081}; elif command -v open > /dev/null; then open http://localhost:${PMA_PORT:-8081}; elif command -v start > /dev/null; then start http://localhost:${PMA_PORT:-8081}; else echo "phpMyAdmin: http://localhost:${PMA_PORT:-8081}"; fi

# === Setup Operations ===

# Create .env file from template
setup-env:
    @if [ ! -f .env ] || [ ! -s .env ]; then \
        printf '%s\n' \
            '# Database settings' \
            'MYSQL_ROOT_PASSWORD=rootpassword' \
            'MYSQL_DATABASE=wordpress' \
            'MYSQL_USER=wordpress' \
            'MYSQL_PASSWORD=wordpress' \
            '' \
            '# Port settings' \
            'WP_PORT=8080' \
            'PMA_PORT=8081' \
            '' \
            '# WordPress Debug' \
            'WP_DEBUG=true' \
            > .env; \
        echo ".env file created with default settings"; \
    else \
        echo ".env file already exists"; \
    fi

# Initialize new WordPress installation
setup-wp:
    @if [ ! -d "src" ]; then \
        echo "Creating src directory and downloading WordPress..."; \
        mkdir -p src; \
        curl -o wordpress.tar.gz https://wordpress.org/latest.tar.gz; \
        tar -xzf wordpress.tar.gz -C src --strip-components=1; \
        rm wordpress.tar.gz; \
        chmod -R 755 src; \
        find src -type d -exec chmod 755 {} \;; \
        find src -type f -exec chmod 644 {} \;; \
        printf '%s\n' \
            '<IfModule mod_rewrite.c>' \
            'RewriteEngine On' \
            'RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]' \
            'RewriteBase /' \
            'RewriteRule ^index\.php$$ - [L]' \
            'RewriteCond %{REQUEST_FILENAME} !-f' \
            'RewriteCond %{REQUEST_FILENAME} !-d' \
            'RewriteRule . /index.php [L]' \
            '</IfModule>' \
            > src/.htaccess; \
        echo "WordPress downloaded and configured!"; \
    else \
        echo "WordPress source directory already exists"; \
    fi

# Create backups directory
setup-backups:
    @mkdir -p backups
    @if [ ! -f backups/README.md ]; then \
        printf '%s\n' \
            '# WordPress Database Backups' \
            '' \
            'This directory is for storing WordPress database backups.' \
            '' \
            '## Supported Formats' \
            '- SQL files (.sql)' \
            '- Compressed SQL files (.sql.gz, .sql.zip)' \
            '' \
            'Use `just db-export` to create backups and `just db-import filename.sql` to restore them.' \
            > backups/README.md; \
        echo "Backups directory created with README"; \
    else \
        echo "Backups directory already exists"; \
    fi

# Create uploads directory for WordPress media
setup-uploads:
    @mkdir -p uploads
    @if [ ! -f uploads/README.md ]; then \
        printf '%s\n' \
            '# WordPress Media Uploads' \
            '' \
            'This directory stores WordPress media files (images, documents, etc.)' \
            '' \
            '## Features' \
            '- Persistent storage across container restarts' \
            '- Separate from WordPress core files' \
            '- Can be backed up independently' \
            '- Mounted to /var/www/html/wp-content/uploads inside container' \
            '' \
            '## Backup' \
            'Use `just uploads-backup` to create a backup of media files.' \
            > uploads/README.md; \
        echo "Uploads directory created with README"; \
    else \
        echo "Uploads directory already exists"; \
    fi

# Create uploads backup
uploads-backup:
    @if [ ! -d "uploads" ] || [ -z "$$(ls -A uploads 2>/dev/null)" ]; then \
        echo "No uploads directory or uploads directory is empty"; \
        exit 0; \
    fi
    @mkdir -p backups
    @timestamp=$$(date +%Y-%m-%d-%H%M%S); backup_file="backups/uploads-$${timestamp}.tar.gz"; echo "Creating uploads backup: $${backup_file}..."; tar -czf "$${backup_file}" -C uploads .; echo "Uploads backup created successfully!"

# Restore uploads from backup
uploads-restore file:
    @echo "Restoring uploads from backups/{{file}}..."
    @mkdir -p uploads
    @tar -xzf backups/{{file}} -C uploads
    @echo "Uploads restored successfully!"

# List uploads backups
uploads-list-backups:
    @echo "Available uploads backups:"
    @ls -la backups/uploads-*.tar.gz 2>/dev/null || echo "No uploads backups found"

# Full setup: create env, download WordPress, create directories
setup: setup-env setup-wp setup-backups setup-uploads
    @echo "Project setup complete! Run 'just up' to start the environment."

# === Maintenance Operations ===

# Clean up Docker containers and volumes
clean:
    @echo "Cleaning up Docker containers and volumes..."
    docker-compose down -v
    docker system prune -f

# Reset file permissions for WordPress
fix-permissions:
    @echo "Fixing file permissions..."
    chmod -R 755 src
    find src -type d -exec chmod 755 {} \;
    find src -type f -exec chmod 644 {} \;
    @echo "Local permissions fixed!"

# Fix WordPress update permissions in Docker container
fix-update-permissions:
    @echo "Fixing WordPress update permissions in Docker container..."
    docker-compose exec wordpress bash -c "chown -R www-data:www-data /var/www/html/wp-content/"
    docker-compose exec wordpress bash -c "chmod -R 755 /var/www/html/wp-content/"
    docker-compose exec wordpress bash -c "mkdir -p /var/www/html/wp-content/upgrade && chown www-data:www-data /var/www/html/wp-content/upgrade && chmod 755 /var/www/html/wp-content/upgrade"
    @echo "WordPress update permissions fixed!"
    @echo "You can now update plugins and themes from the WordPress admin."

# Fix all permissions (local + Docker container)
fix-all-permissions:
    @echo "Fixing all permissions (local files + Docker container)..."
    just fix-permissions
    just fix-update-permissions
    @echo "All permissions fixed!"

# === Information ===

# Show environment information
info:
    @echo "WordPress AI Workspace Template"
    @echo "==============================="
    @echo "WordPress URL: http://localhost:${WP_PORT:-8080}"
    @echo "phpMyAdmin URL: http://localhost:${PMA_PORT:-8081}"
    @echo "Database: ${MYSQL_DATABASE:-wordpress}"
    @echo "DB User: ${MYSQL_USER:-wordpress}"
    @echo ""
    @echo "Container Status:"
    @docker-compose ps 2>/dev/null || echo "Docker environment not running"
    @echo ""
    @echo "Available commands: just --list"

# Show help information
help:
    @echo "WordPress AI Workspace Template - Justfile Help"
    @echo "================================================"
    @echo ""
    @echo "Quick Start:"
    @echo "  just setup     # Initialize project (create .env, download WordPress)"
    @echo "  just up        # Start the environment"
    @echo "  just open-site # Open WordPress in browser"
    @echo ""
    @echo "Common Tasks:"
    @echo "  just status           # Check container status"
    @echo "  just logs             # View WordPress logs"
    @echo "  just wp 'core version' # Run WP-CLI commands"
    @echo "  just db-export        # Backup database"
    @echo ""
    @echo "For all commands: just --list"

# === WordPress MCP Plugin Management ===

# Install WordPress MCP plugin from GitHub releases
mcp-install version="v0.2.3":
    @echo "Installing WordPress MCP plugin {{version}}..."
    @if [ -d "src/wp-content/plugins/wordpress-mcp" ]; then \
        echo "WordPress MCP plugin already exists. Use 'just mcp-update' to update."; \
        exit 1; \
    fi
    curl -L "https://github.com/Automattic/wordpress-mcp/archive/refs/tags/{{version}}.tar.gz" -o wordpress-mcp-{{version}}.tar.gz
    tar -xzf wordpress-mcp-{{version}}.tar.gz
    mv wordpress-mcp-$(echo {{version}} | sed 's/^v//') src/wp-content/plugins/wordpress-mcp
    rm wordpress-mcp-{{version}}.tar.gz
    @echo "Installing plugin dependencies..."
    @just mcp-install-deps
    @echo "Activating plugin..."
    @just mcp-activate
    @echo "WordPress MCP plugin installed and activated!"

# Install WordPress MCP plugin dependencies
mcp-install-deps:
    @echo "Installing WordPress MCP dependencies..."
    docker-compose exec wordpress bash -c "cd /var/www/html/wp-content/plugins/wordpress-mcp && composer install --no-dev"

# Activate WordPress MCP plugin
mcp-activate:
    @echo "Activating WordPress MCP plugin..."
    just wp "plugin activate wordpress-mcp"

# Deactivate WordPress MCP plugin
mcp-deactivate:
    @echo "Deactivating WordPress MCP plugin..."
    just wp "plugin deactivate wordpress-mcp"

# Check WordPress MCP plugin status
mcp-status:
    @echo "WordPress MCP Plugin Status:"
    @echo "============================"
    @just wp "plugin list --name=wordpress-mcp" 2>/dev/null || echo "Plugin not found"
    @echo ""
    @echo "MCP Settings:"
    @just wp "option get wordpress_mcp_settings" 2>/dev/null || echo "No settings found"

# Update WordPress MCP plugin to latest version
mcp-update version="v0.2.3":
    @echo "Updating WordPress MCP plugin to {{version}}..."
    @if [ ! -d "src/wp-content/plugins/wordpress-mcp" ]; then \
        echo "WordPress MCP plugin not installed. Use 'just mcp-install' first."; \
        exit 1; \
    fi
    @just mcp-deactivate
    @echo "Backing up current plugin..."
    mv src/wp-content/plugins/wordpress-mcp src/wp-content/plugins/wordpress-mcp-backup-$(date +%Y%m%d-%H%M%S)
    @echo "Installing new version..."
    curl -L "https://github.com/Automattic/wordpress-mcp/archive/refs/tags/{{version}}.tar.gz" -o wordpress-mcp-{{version}}.tar.gz
    tar -xzf wordpress-mcp-{{version}}.tar.gz
    mv wordpress-mcp-$(echo {{version}} | sed 's/^v//') src/wp-content/plugins/wordpress-mcp
    rm wordpress-mcp-{{version}}.tar.gz
    @just mcp-install-deps
    @just mcp-activate
    @echo "WordPress MCP plugin updated to {{version}}!"

# Install Composer in WordPress container
wp-install-composer:
    @echo "Installing Composer in WordPress container..."
    docker-compose exec wordpress bash -c "curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer"
    @echo "Composer installed successfully!"

# Remove WordPress MCP plugin completely
mcp-remove:
    @echo "Removing WordPress MCP plugin..."
    @just mcp-deactivate 2>/dev/null || echo "Plugin not active"
    rm -rf src/wp-content/plugins/wordpress-mcp
    @echo "WordPress MCP plugin removed!"

# Test MCP endpoints
mcp-test-endpoints:
    @echo "Testing WordPress MCP endpoints..."
    @echo "Standard endpoint:"
    @curl -s -X GET "http://localhost:${WP_PORT:-8080}/wp-json/wp/v2/wpmcp" | head -c 200 || echo "Endpoint not accessible"
    @echo ""
    @echo "Streamable endpoint:"
    @curl -s -X POST "http://localhost:${WP_PORT:-8080}/wp-json/wp/v2/wpmcp/streamable" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | head -c 200 || echo "Endpoint not accessible"
    @echo ""

# Generate JWT token via WordPress admin (requires manual admin access)
mcp-token-info:
    @echo "JWT Token Generation:"
    @echo "===================="
    @echo "1. Access WordPress admin: http://localhost:${WP_PORT:-8080}/wp-admin"
    @echo "2. Go to Settings > WordPress MCP"
    @echo "3. Navigate to Authentication Tokens section"
    @echo "4. Click 'Generate New Token'"
    @echo "5. Set expiration time (1-24 hours recommended)"
    @echo "6. Copy the generated token for use with MCP clients"
    @echo ""
    @echo "Alternative: Check if plugin provides WP-CLI token commands"

# Show MCP client configuration examples
mcp-client-config:
    @echo "WordPress MCP Client Configuration Examples:"
    @echo "==========================================="
    @echo ""
    @echo "Claude Code (HTTP Transport):"
    @echo "claude mcp add --transport http wordpress-mcp http://localhost:${WP_PORT:-8080}/wp-json/wp/v2/wpmcp/streamable --header \"Authorization: Bearer YOUR-JWT-TOKEN\""
    @echo ""
    @echo "Claude Desktop (claude_desktop_config.json):"
    @echo "{"
    @echo "  \"mcpServers\": {"
    @echo "    \"wordpress-mcp\": {"
    @echo "      \"command\": \"npx\","
    @echo "      \"args\": [\"-y\", \"@automattic/mcp-wordpress-remote@latest\"],"
    @echo "      \"env\": {"
    @echo "        \"WP_API_URL\": \"http://localhost:${WP_PORT:-8080}/\","
    @echo "        \"JWT_TOKEN\": \"YOUR-JWT-TOKEN\""
    @echo "      }"
    @echo "    }"
    @echo "  }"
    @echo "}"
    @echo ""
    @echo "For detailed configuration, see: docs/wordpress-mcp-installation.md"

# Launch MCP Inspector for testing
mcp-inspector:
    @echo "Launching MCP Inspector for WordPress MCP testing..."
    @echo "Make sure you have a valid JWT token ready!"
    @read -p "Enter your JWT token: " jwt_token; \
    npx @modelcontextprotocol/inspector \
      -e WP_API_URL=http://localhost:${WP_PORT:-8080}/ \
      -e JWT_TOKEN="$$jwt_token" \
      npx @automattic/mcp-wordpress-remote@latest

# Backup WordPress MCP settings
mcp-backup-settings:
    @mkdir -p backups
    @timestamp=$(date +%Y-%m-%d-%H%M%S); \
    echo "Backing up WordPress MCP settings..."; \
    just wp "option get wordpress_mcp_settings" > "backups/mcp-settings-$${timestamp}.json" 2>/dev/null && \
    echo "MCP settings backed up to backups/mcp-settings-$${timestamp}.json" || \
    echo "No MCP settings found to backup"

# Restore WordPress MCP settings
mcp-restore-settings file:
    @echo "Restoring WordPress MCP settings from backups/{{file}}..."
    @if [ -f "backups/{{file}}" ]; then \
        settings_content=$(cat "backups/{{file}}"); \
        just wp "option update wordpress_mcp_settings '$${settings_content}'" && \
        echo "MCP settings restored successfully!"; \
    else \
        echo "Backup file not found: backups/{{file}}"; \
        echo "Available backups:"; \
        ls -la backups/mcp-settings-*.json 2>/dev/null || echo "No MCP setting backups found"; \
    fi

# Show MCP installation and usage help
mcp-help:
    @echo "WordPress MCP Plugin Commands:"
    @echo "==============================="
    @echo ""
    @echo "Installation & Management:"
    @echo "  just mcp-install [version]    # Install WordPress MCP plugin"
    @echo "  just mcp-update [version]     # Update plugin to specific version"
    @echo "  just mcp-activate             # Activate the plugin"
    @echo "  just mcp-deactivate           # Deactivate the plugin"
    @echo "  just mcp-remove               # Completely remove the plugin"
    @echo "  just mcp-status               # Check plugin status and settings"
    @echo ""
    @echo "Configuration & Testing:"
    @echo "  just mcp-token-info           # Show JWT token generation instructions"
    @echo "  just mcp-client-config        # Show client configuration examples"
    @echo "  just mcp-test-endpoints       # Test MCP endpoints availability"
    @echo "  just mcp-inspector            # Launch MCP Inspector for testing"
    @echo ""
    @echo "Backup & Restore:"
    @echo "  just mcp-backup-settings      # Backup MCP plugin settings"
    @echo "  just mcp-restore-settings     # Restore settings from backup"
    @echo ""
    @echo "Utilities:"
    @echo "  just wp-install-composer      # Install Composer in WordPress container"
    @echo "  just mcp-install-deps         # Install plugin PHP dependencies"
    @echo ""
    @echo "For detailed installation guide, see: docs/wordpress-mcp-installation.md"