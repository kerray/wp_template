# WordPress AI Workspace Template - Justfile
# This file defines all project tasks and operations
# Run `just` to see all available commands

# Load environment variables from .env file if it exists
set dotenv-load := true

# Default recipe shows available commands
default:
    @just --list

# === Docker Environment Management ===

# Build custom WordPress PHP-FPM + Nginx containers
build:
    @echo "Building WordPress PHP-FPM + Nginx containers..."
    @echo "Versions: Composer ${COMPOSER_VERSION:-2.7.1}, WP-CLI ${WP_CLI_VERSION:-2.11.0}, MCP ${WP_MCP_VERSION:-0.2.3}"
    @echo "Using host user: $(id -u):$(id -g)"
    USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose build --no-cache wordpress
    @echo "PHP-FPM container built successfully!"

# Rebuild and restart environment
rebuild: build
    @echo "Rebuilding and restarting environment..."
    docker compose down
    USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose up -d
    @echo "Environment rebuilt and restarted!"

# Start WordPress environment (detached mode) with optional profiles
up *profiles:
    @echo "Starting WordPress PHP-FPM + Nginx environment..."
    @echo "Using host user: $(id -u):$(id -g)"
    @if [ "{{profiles}}" = "all" ]; then \
        USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose --profile all up -d; \
        echo "Environment started with ALL services:"; \
        echo "  WordPress: http://localhost:${WP_PORT:-8080}"; \
        echo "  phpMyAdmin: http://localhost:${PMA_PORT:-8081}"; \
        echo "  Adminer: http://localhost:${ADMINER_PORT:-8082}"; \
        echo "  SFTP: sftp -P ${SFTP_PORT:-2222} wordpress@localhost"; \
    elif [ "{{profiles}}" = "phpmyadmin" ]; then \
        USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose --profile phpmyadmin up -d; \
        echo "Environment started with phpMyAdmin:"; \
        echo "  WordPress: http://localhost:${WP_PORT:-8080}"; \
        echo "  phpMyAdmin: http://localhost:${PMA_PORT:-8081}"; \
    elif [ "{{profiles}}" = "adminer" ]; then \
        USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose --profile adminer up -d; \
        echo "Environment started with Adminer:"; \
        echo "  WordPress: http://localhost:${WP_PORT:-8080}"; \
        echo "  Adminer: http://localhost:${ADMINER_PORT:-8082}"; \
    elif [ "{{profiles}}" = "sftp" ]; then \
        USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose --profile sftp up -d; \
        echo "Environment started with SFTP:"; \
        echo "  WordPress: http://localhost:${WP_PORT:-8080}"; \
        echo "  SFTP: sftp -P ${SFTP_PORT:-2222} wordpress@localhost"; \
    else \
        USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose up -d; \
        echo "Environment started (core services only):"; \
        echo "  WordPress: http://localhost:${WP_PORT:-8080}"; \
        echo ""; \
        echo "Optional services (use 'just up <profile>'):"; \
        echo "  just up phpmyadmin  # Add phpMyAdmin"; \
        echo "  just up adminer     # Add Adminer"; \
        echo "  just up sftp        # Add SFTP access"; \
        echo "  just up all         # Add all optional services"; \
    fi

# Stop WordPress environment
down:
    @echo "Stopping WordPress environment..."
    docker compose --profile all down

# Restart WordPress environment
restart:
    @echo "Restarting WordPress environment..."
    docker compose restart

# Show status of all containers
status:
    @echo "Container status:"
    docker compose --profile all ps

# View WordPress container logs
logs service="wordpress":
    docker compose logs -f {{service}}

# View logs from all containers
logs-all:
    docker compose --profile all logs -f

# === WP-CLI Operations ===

# WP-CLI is pre-installed in the custom container
wp-install:
    @echo "WP-CLI v${WP_CLI_VERSION:-2.11.0} is pre-installed in the custom container!"
    @echo "Testing installation..."
    docker compose exec wordpress wp --info --allow-root
    @echo "You can use: just wp \"core version\""

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
        if ! docker compose ps | grep -q "wordpress.*Up"; then \
            echo "Warning: WordPress container does not appear to be running"; \
            echo "Starting Docker environment..."; \
            docker compose up -d; \
            echo "Waiting for WordPress container to be ready..."; \
            sleep 5; \
        fi; \
        echo "Running: wp {{args}}"; \
        docker compose exec wordpress wp {{args}} --allow-root; \
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
    @timestamp=$(date +%Y-%m-%d-%H%M%S); backup_file="backups/backup-$${timestamp}.sql"; echo "Exporting database to $${backup_file}..."; docker compose exec db mysqldump -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} > "$${backup_file}"; echo "Database exported successfully!"

# Import database from backup file (usage: just db-import filename.sql)
db-import file:
    @echo "Importing database from backups/{{file}}..."
    docker compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} < backups/{{file}}
    @echo "Database imported successfully!"

# Import compressed database backup (usage: just db-import-gz filename.sql.gz)
db-import-gz file:
    @echo "Importing compressed database from backups/{{file}}..."
    zcat backups/{{file}} | docker compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress}
    @echo "Database imported successfully!"

# List available database backups
db-list-backups:
    @echo "Available database backups:"
    @ls -la backups/*.sql 2>/dev/null || echo "No SQL backups found"
    @ls -la backups/*.sql.gz 2>/dev/null || echo "No compressed backups found"

# Test database connection
db-test:
    @echo "Testing database connection..."
    docker compose exec db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} -e "SHOW DATABASES;" || echo "Database connection failed"

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
            'ADMINER_PORT=8082' \
            'SFTP_PORT=2222' \
            '' \
            '# WordPress Debug' \
            'WP_DEBUG=true' \
            '' \
            '# Development Tool Versions' \
            'COMPOSER_VERSION=2.7.1' \
            'WP_CLI_VERSION=2.11.0' \
            'WP_MCP_VERSION=0.2.3' \
            '' \
            '# SFTP Password (change for production!)' \
            'SFTP_PASSWORD=wordpress' \
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

# Create logs directories
setup-logs:
    @mkdir -p logs/nginx logs/php
    @echo "Log directories created"

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
setup: setup-env setup-wp setup-backups setup-uploads setup-logs
    @echo "Project setup complete! Run 'just build && just up' to start the environment."

# === Maintenance Operations ===

# Clean up Docker containers and volumes
clean:
    @echo "Cleaning up Docker containers and volumes..."
    docker compose --profile all down -v
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
    docker compose exec wordpress sh -c "chown -R www-data:www-data /var/www/html/wp-content/"
    docker compose exec wordpress sh -c "chmod -R 755 /var/www/html/wp-content/"
    docker compose exec wordpress sh -c "mkdir -p /var/www/html/wp-content/upgrade && chown www-data:www-data /var/www/html/wp-content/upgrade && chmod 755 /var/www/html/wp-content/upgrade"
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
    @echo "WordPress PHP-FPM + Nginx Workspace"
    @echo "===================================="
    @echo ""
    @echo "Core Services:"
    @echo "  WordPress: http://localhost:${WP_PORT:-8080}"
    @echo ""
    @echo "Optional Services (use 'just up <profile>'):"
    @echo "  phpMyAdmin: http://localhost:${PMA_PORT:-8081} (--profile phpmyadmin)"
    @echo "  Adminer:    http://localhost:${ADMINER_PORT:-8082} (--profile adminer)"
    @echo "  SFTP:       sftp -P ${SFTP_PORT:-2222} wordpress@localhost (--profile sftp)"
    @echo ""
    @echo "Database:"
    @echo "  Host: db"
    @echo "  Database: ${MYSQL_DATABASE:-wordpress}"
    @echo "  User: ${MYSQL_USER:-wordpress}"
    @echo ""
    @echo "Container Status:"
    @docker compose --profile all ps 2>/dev/null || echo "Environment not running"
    @echo ""
    @echo "Commands:"
    @echo "  just up             # Start core services"
    @echo "  just up all         # Start all services"
    @echo "  just down           # Stop all services"
    @echo "  just wp \"command\"   # Run WP-CLI"
    @echo "  just logs nginx     # View nginx logs"

# Show help information
help:
    @echo "WordPress AI Workspace Template - Justfile Help"
    @echo "================================================"
    @echo ""
    @echo "Quick Start:"
    @echo "  just setup     # Initialize project (create .env, download WordPress)"
    @echo "  just build     # Build custom container"
    @echo "  just up        # Start the environment"
    @echo "  just open-site # Open WordPress in browser"
    @echo ""
    @echo "Common Tasks:"
    @echo "  just status           # Check container status"
    @echo "  just logs             # View WordPress logs"
    @echo "  just logs nginx       # View Nginx logs"
    @echo "  just wp 'core version' # Run WP-CLI commands"
    @echo "  just db-export        # Backup database"
    @echo ""
    @echo "Optional Services:"
    @echo "  just up phpmyadmin   # Start with phpMyAdmin"
    @echo "  just up all          # Start with all optional services"
    @echo ""
    @echo "For all commands: just --list"

# === WordPress MCP Plugin Management ===

# WordPress MCP plugin is pre-installed in the custom container
# Activate the pre-installed WordPress MCP plugin
mcp-install:
    @echo "WordPress MCP plugin is pre-installed in the container!"
    @echo "Activating WordPress MCP plugin v${WP_MCP_VERSION:-0.2.3}..."
    @just mcp-activate
    @echo "WordPress MCP plugin activated!"

# Note: Plugin dependencies are pre-installed in the container
mcp-install-deps:
    @echo "WordPress MCP dependencies are pre-installed in the custom container!"
    @echo "No additional installation needed."

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

# Composer is pre-installed in the custom container
wp-install-composer:
    @echo "Composer v${COMPOSER_VERSION:-2.7.1} is pre-installed in the custom container!"
    @echo "Testing installation..."
    docker compose exec wordpress composer --version
    @echo "Composer is ready to use!"

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

# === Production Security ===

# Show production security checklist
security-checklist:
    @echo "Production Security Checklist"
    @echo "=============================="
    @echo ""
    @echo "CRITICAL - Before deploying to production:"
    @echo ""
    @echo "[ ] 1. Changed MYSQL_ROOT_PASSWORD (use: openssl rand -base64 32)"
    @echo "[ ] 2. Changed MYSQL_PASSWORD (use: openssl rand -base64 32)"
    @echo "[ ] 3. Changed SFTP_PASSWORD or disabled SFTP service"
    @echo "[ ] 4. Set WP_DEBUG=false in .env"
    @echo "[ ] 5. NOT exposing phpMyAdmin/Adminer to internet"
    @echo "[ ] 6. Configured SSL/TLS via reverse proxy"
    @echo "[ ] 7. Installed WordPress security plugin (Wordfence, etc.)"
    @echo ""
    @echo "For detailed guidance, see: docs/PRODUCTION_SECURITY.md"
    @echo ""
    @echo "Quick commands:"
    @echo "  just security-generate-passwords  # Generate secure passwords"
    @echo "  just security-setup-production    # Copy production .env template"
    @echo "  just security-verify              # Check current security status"

# Generate secure random passwords
security-generate-passwords:
    @echo "Generated Secure Passwords (32 characters):"
    @echo "============================================"
    @echo ""
    @echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)"
    @echo ""
    @echo "MYSQL_PASSWORD=$(openssl rand -base64 32)"
    @echo ""
    @echo "SFTP_PASSWORD=$(openssl rand -base64 32)"
    @echo ""
    @echo "Copy these to your .env file. Each password is unique."

# Setup production environment from template
security-setup-production:
    @if [ -f ".env" ] && [ -s ".env" ]; then \
        echo "WARNING: .env file already exists!"; \
        echo ""; \
        read -p "Backup existing .env and create production template? (y/N): " confirm; \
        if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
            timestamp=$$(date +%Y%m%d-%H%M%S); \
            cp .env ".env.backup-$$timestamp"; \
            echo "Backed up existing .env to .env.backup-$$timestamp"; \
            cp .env.production .env; \
            echo "Created new .env from production template"; \
            echo ""; \
            echo "IMPORTANT: Edit .env and replace ALL 'CHANGE_ME' values!"; \
            echo "Use 'just security-generate-passwords' to generate secure passwords."; \
        else \
            echo "Aborted. No changes made."; \
        fi \
    else \
        cp .env.production .env; \
        echo "Created .env from production template"; \
        echo ""; \
        echo "IMPORTANT: Edit .env and replace ALL 'CHANGE_ME' values!"; \
        echo "Use 'just security-generate-passwords' to generate secure passwords."; \
    fi

# Verify current security configuration
security-verify:
    @echo "Security Configuration Verification"
    @echo "===================================="
    @echo ""
    @issues=0; \
    \
    echo "Checking .env settings..."; \
    echo ""; \
    \
    if grep -q "MYSQL_ROOT_PASSWORD=rootpassword" .env 2>/dev/null; then \
        echo "[CRITICAL] MYSQL_ROOT_PASSWORD is using default value!"; \
        issues=$$((issues + 1)); \
    elif grep -q "MYSQL_ROOT_PASSWORD=CHANGE_ME" .env 2>/dev/null; then \
        echo "[CRITICAL] MYSQL_ROOT_PASSWORD has not been changed!"; \
        issues=$$((issues + 1)); \
    else \
        echo "[OK] MYSQL_ROOT_PASSWORD appears to be customized"; \
    fi; \
    \
    if grep -q "MYSQL_PASSWORD=wordpress" .env 2>/dev/null; then \
        echo "[CRITICAL] MYSQL_PASSWORD is using default value!"; \
        issues=$$((issues + 1)); \
    elif grep -q "MYSQL_PASSWORD=CHANGE_ME" .env 2>/dev/null; then \
        echo "[CRITICAL] MYSQL_PASSWORD has not been changed!"; \
        issues=$$((issues + 1)); \
    else \
        echo "[OK] MYSQL_PASSWORD appears to be customized"; \
    fi; \
    \
    if grep -q "WP_DEBUG=true" .env 2>/dev/null; then \
        echo "[WARNING] WP_DEBUG is enabled (should be false in production)"; \
        issues=$$((issues + 1)); \
    else \
        echo "[OK] WP_DEBUG is disabled or not set to true"; \
    fi; \
    \
    if grep -q "SFTP_PASSWORD=wordpress" .env 2>/dev/null; then \
        echo "[WARNING] SFTP_PASSWORD is using default value"; \
        issues=$$((issues + 1)); \
    elif grep -q "SFTP_PASSWORD=CHANGE_ME" .env 2>/dev/null; then \
        echo "[WARNING] SFTP_PASSWORD has not been changed"; \
        issues=$$((issues + 1)); \
    else \
        echo "[OK] SFTP_PASSWORD appears to be customized or disabled"; \
    fi; \
    \
    echo ""; \
    if [ $$issues -gt 0 ]; then \
        echo "Found $$issues security issue(s). Please address before production deployment."; \
        echo "See: docs/PRODUCTION_SECURITY.md"; \
    else \
        echo "Basic security checks passed!"; \
        echo "Remember to also verify:"; \
        echo "  - phpMyAdmin/Adminer are not publicly accessible"; \
        echo "  - SSL/TLS is configured via reverse proxy"; \
        echo "  - WordPress security plugins are installed"; \
    fi

# Test nginx security headers
security-test-headers:
    @echo "Testing Security Headers..."
    @echo ""
    @curl -s -I http://localhost:${WP_PORT:-8080} 2>/dev/null | grep -iE "^(x-frame|x-xss|x-content|content-security|strict-transport|server:)" || echo "Could not connect to WordPress. Is it running?"

# Test blocked paths (security file protection)
security-test-blocked:
    @echo "Testing Blocked Paths..."
    @echo ""
    @echo "Testing wp-config.php:"
    @status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${WP_PORT:-8080}/wp-config.php 2>/dev/null); \
    if [ "$$status" = "403" ]; then echo "  [OK] Blocked (403)"; else echo "  [FAIL] Status: $$status (expected 403)"; fi
    @echo ""
    @echo "Testing .git/config:"
    @status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${WP_PORT:-8080}/.git/config 2>/dev/null); \
    if [ "$$status" = "403" ] || [ "$$status" = "404" ]; then echo "  [OK] Blocked ($$status)"; else echo "  [FAIL] Status: $$status (expected 403/404)"; fi
    @echo ""
    @echo "Testing xmlrpc.php:"
    @status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${WP_PORT:-8080}/xmlrpc.php 2>/dev/null); \
    if [ "$$status" = "403" ]; then echo "  [OK] Blocked (403)"; else echo "  [FAIL] Status: $$status (expected 403)"; fi
    @echo ""
    @echo "Testing debug.log:"
    @status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${WP_PORT:-8080}/wp-content/debug.log 2>/dev/null); \
    if [ "$$status" = "403" ] || [ "$$status" = "404" ]; then echo "  [OK] Blocked ($$status)"; else echo "  [FAIL] Status: $$status (expected 403/404)"; fi
    @echo ""
    @echo "Testing PHP in uploads:"
    @status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${WP_PORT:-8080}/wp-content/uploads/test.php 2>/dev/null); \
    if [ "$$status" = "403" ] || [ "$$status" = "404" ]; then echo "  [OK] Blocked ($$status)"; else echo "  [FAIL] Status: $$status (expected 403/404)"; fi

# Full security audit
security-audit:
    @echo "Running Full Security Audit"
    @echo "============================"
    @echo ""
    just security-verify
    @echo ""
    @echo "---"
    @echo ""
    just security-test-headers
    @echo ""
    @echo "---"
    @echo ""
    just security-test-blocked
    @echo ""
    @echo "---"
    @echo ""
    @echo "For comprehensive security guidance, see: docs/PRODUCTION_SECURITY.md"

# Test security on a remote URL (usage: just security-test-remote https://example.com)
security-test-remote url:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Security Check: {{url}}"
    echo "=============================="
    echo ""
    echo "1. Site Accessibility:"
    status=$(curl -s -o /dev/null -w "%{http_code}" "{{url}}/" --connect-timeout 10 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then echo "   [OK] Homepage: $status"; else echo "   [FAIL] Homepage: $status"; fi
    echo ""
    echo "2. Security Headers:"
    curl -sI "{{url}}/" 2>/dev/null | grep -iE "^(x-frame|x-xss|x-content|strict-transport|server:)" | sed 's/^/   /' || echo "   Could not retrieve headers"
    echo ""
    echo "3. Blocked Files:"
    for path in "wp-config.php:403" "xmlrpc.php:403" ".git/config:403,404" ".htaccess:403,404" "wp-content/debug.log:403,404"; do
        file="${path%%:*}"
        expected="${path##*:}"
        status=$(curl -s -o /dev/null -w "%{http_code}" "{{url}}/$file" 2>/dev/null || echo "000")
        if echo "$expected" | grep -q "$status"; then
            echo "   [OK] $file: $status"
        else
            echo "   [FAIL] $file: $status (expected $expected)"
        fi
    done

# Show security help
security-help:
    @echo "Production Security Commands"
    @echo "============================"
    @echo ""
    @echo "Setup:"
    @echo "  just security-setup-production   # Create .env from production template"
    @echo "  just security-generate-passwords # Generate secure random passwords"
    @echo ""
    @echo "Verification:"
    @echo "  just security-checklist          # Show security checklist"
    @echo "  just security-verify             # Check .env security settings"
    @echo "  just security-test-headers       # Test nginx security headers (local)"
    @echo "  just security-test-blocked       # Test blocked file paths (local)"
    @echo "  just security-test-remote <url>  # Test security on remote URL"
    @echo "  just security-audit              # Run full security audit (local)"
    @echo ""
    @echo "Documentation:"
    @echo "  docs/PRODUCTION_SECURITY.md      # Detailed security guide"
    @echo "  .env.production                  # Production environment template"

# === FTP/Remote Site Commands ===

# Test FTP connection
ftp-test:
    @echo "Testing FTP connection..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP_HOST not set in .env"; exit 1; fi
    @lftp -c "set ssl:verify-certificate no; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; ls -la; bye" 2>&1 | head -10
    @echo "FTP connection test complete"

# List remote plugins
ftp-list-plugins:
    @echo "Listing plugins on remote site..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @lftp -c "set ssl:verify-certificate no; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/plugins 2>/dev/null || cd ${FTP_PATH}/plugins; ls -la; bye" 2>&1

# List remote themes
ftp-list-themes:
    @echo "Listing themes on remote site..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @lftp -c "set ssl:verify-certificate no; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/themes 2>/dev/null || cd ${FTP_PATH}/themes; ls -la; bye" 2>&1

# Download all plugins from remote site
ftp-download-plugins:
    @echo "Downloading plugins from remote site..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @mkdir -p src/wp-content/plugins_remote
    @echo "Connecting to ${FTP_HOST}..."
    @lftp -c "set ssl:verify-certificate no; set net:timeout 60; set net:max-retries 2; set ftp:passive-mode on; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/plugins 2>/dev/null || cd ${FTP_PATH}/plugins; lcd src/wp-content/plugins_remote; mirror --parallel=3 --only-newer --verbose .; bye"
    @echo "Plugins downloaded to src/wp-content/plugins_remote/"

# Download all themes from remote site
ftp-download-themes:
    @echo "Downloading themes from remote site..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @mkdir -p src/wp-content/themes_remote
    @echo "Connecting to ${FTP_HOST}..."
    @lftp -c "set ssl:verify-certificate no; set net:timeout 60; set net:max-retries 2; set ftp:passive-mode on; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/themes 2>/dev/null || cd ${FTP_PATH}/themes; lcd src/wp-content/themes_remote; mirror --parallel=3 --only-newer --verbose .; bye"
    @echo "Themes downloaded to src/wp-content/themes_remote/"

# Download specific plugin (usage: just ftp-download-plugin plugin-name)
ftp-download-plugin plugin:
    @echo "Downloading plugin: {{plugin}}..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @mkdir -p src/wp-content/plugins_remote
    @lftp -c "set ssl:verify-certificate no; set net:timeout 60; set ftp:passive-mode on; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/plugins 2>/dev/null || cd ${FTP_PATH}/plugins; lcd src/wp-content/plugins_remote; mirror --parallel=3 {{plugin}} {{plugin}}; bye"
    @echo "Plugin downloaded to src/wp-content/plugins_remote/{{plugin}}"

# Download specific theme (usage: just ftp-download-theme theme-name)
ftp-download-theme theme:
    @echo "Downloading theme: {{theme}}..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @mkdir -p src/wp-content/themes_remote
    @lftp -c "set ssl:verify-certificate no; set net:timeout 60; set ftp:passive-mode on; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/themes 2>/dev/null || cd ${FTP_PATH}/themes; lcd src/wp-content/themes_remote; mirror --parallel=3 {{theme}} {{theme}}; bye"
    @echo "Theme downloaded to src/wp-content/themes_remote/{{theme}}"

# Download uploads/media files (WARNING: Can be large!)
ftp-download-uploads:
    @echo "WARNING: Uploads directory can be very large!"
    @echo "Press Ctrl+C to cancel, or Enter to continue..."
    @read _
    @echo "Downloading uploads from remote site..."
    @if [ -z "$FTP_HOST" ]; then echo "Error: FTP configuration not found in .env"; exit 1; fi
    @mkdir -p uploads_remote
    @lftp -c "set ssl:verify-certificate no; set net:timeout 60; set ftp:passive-mode on; open ftp://${FTP_USER}:${FTP_PASSWORD}@${FTP_HOST}; cd ${FTP_PATH}/wp-content/uploads 2>/dev/null || cd ${FTP_PATH}/uploads; lcd uploads_remote; mirror --parallel=3 --only-newer --verbose .; bye"
    @echo "Uploads downloaded to uploads_remote/"

# Show FTP download help
ftp-help:
    @echo "FTP/Remote Site Commands"
    @echo "========================"
    @echo ""
    @echo "Configuration (.env file):"
    @echo "  FTP_HOST=ftp.example.com"
    @echo "  FTP_USER=username"
    @echo "  FTP_PASSWORD=password"
    @echo "  FTP_PATH=/public_html"
    @echo ""
    @echo "Commands:"
    @echo "  just ftp-test                    # Test FTP connection"
    @echo "  just ftp-list-plugins            # List remote plugins"
    @echo "  just ftp-list-themes             # List remote themes"
    @echo "  just ftp-download-plugins        # Download all plugins"
    @echo "  just ftp-download-themes         # Download all themes"
    @echo "  just ftp-download-plugin <name>  # Download specific plugin"
    @echo "  just ftp-download-theme <name>   # Download specific theme"
    @echo "  just ftp-download-uploads        # Download media files (WARNING: Large!)"
    @echo ""
    @echo "Downloaded files go to:"
    @echo "  - src/wp-content/plugins_remote/"
    @echo "  - src/wp-content/themes_remote/"
    @echo "  - uploads_remote/"
    @echo ""
    @echo "After downloading, manually copy needed files to the active directories."

# === DIVI Migration Commands ===

# Generate inventory of all DIVI content with complexity scoring
divi-inventory:
    @echo "Generating DIVI content inventory..."
    python3 ./scripts/divi-migration/inventory.py

# Export single content item (usage: just divi-export page my-page-slug)
divi-export post_type slug:
    python3 ./scripts/divi-migration/export.py {{post_type}} {{slug}}

# Export all content of a type (usage: just divi-export-all page)
divi-export-all post_type:
    python3 ./scripts/divi-migration/export.py --all {{post_type}}

# Convert single item (usage: just divi-convert page my-page-slug)
divi-convert post_type slug:
    python3 ./scripts/divi-migration/convert.py {{post_type}} {{slug}}

# Batch convert all items of a complexity level (usage: just divi-convert-batch simple)
divi-convert-batch complexity:
    python3 ./scripts/divi-migration/convert.py --batch {{complexity}}

# Dry-run batch convert to preview changes (usage: just divi-convert-batch-dry simple)
divi-convert-batch-dry complexity:
    python3 ./scripts/divi-migration/convert.py --batch {{complexity}} --dry-run

# Publish converted content to WordPress (usage: just divi-publish page my-page-slug)
divi-publish post_type slug:
    python3 ./scripts/divi-migration/publish.py {{post_type}} {{slug}}

# Restore original DIVI content from backup (usage: just divi-restore page my-page-slug)
divi-restore post_type slug:
    python3 ./scripts/divi-migration/restore.py {{post_type}} {{slug}}

# Take screenshot before conversion (usage: just divi-screenshot-before page my-page-slug)
divi-screenshot-before post_type slug:
    ./scripts/divi-migration/screenshot.sh {{post_type}} {{slug}} before

# Take screenshot after conversion (usage: just divi-screenshot-after page my-page-slug)
divi-screenshot-after post_type slug:
    ./scripts/divi-migration/screenshot.sh {{post_type}} {{slug}} after

# Show migration status summary
divi-status:
    #!/usr/bin/env bash
    echo "=== DIVI Migration Status ==="
    echo ""
    echo "Content directory: content/"
    echo ""
    if [ -d "content/pages" ]; then
        pages=$(find content/pages -name "metadata.json" 2>/dev/null | wc -l)
        echo "Pages exported: $pages"
    else
        echo "Pages exported: 0"
    fi
    if [ -d "content/posts" ]; then
        posts=$(find content/posts -name "metadata.json" 2>/dev/null | wc -l)
        echo "Posts exported: $posts"
    else
        echo "Posts exported: 0"
    fi
    if [ -d "content/akce" ]; then
        akce=$(find content/akce -name "metadata.json" 2>/dev/null | wc -l)
        echo "Akce exported: $akce"
    else
        echo "Akce exported: 0"
    fi
    echo ""
    echo "By status:"
    pending=$(find content -name "metadata.json" -exec grep -l '"status": "pending"' {} \; 2>/dev/null | wc -l)
    echo "  Pending: $pending"
    converted=$(find content -name "metadata.json" -exec grep -l '"status": "converted"' {} \; 2>/dev/null | wc -l)
    echo "  Converted: $converted"
    reviewed=$(find content -name "metadata.json" -exec grep -l '"status": "reviewed"' {} \; 2>/dev/null | wc -l)
    echo "  Reviewed: $reviewed"
    published=$(find content -name "metadata.json" -exec grep -l '"status": "published"' {} \; 2>/dev/null | wc -l)
    echo "  Published: $published"
    toohard=$(find content -name "metadata.json" -exec grep -l '"status": "too-hard"' {} \; 2>/dev/null | wc -l)
    echo "  Too-hard: $toohard"

# List content by status (usage: just divi-list pending)
divi-list status:
    @echo "=== Content with status: {{status}} ==="
    @find content -name "metadata.json" -exec sh -c 'if grep -q "\"status\": \"{{status}}\"" "$$1"; then jq -r "[.post_type, .slug, .complexity] | @tsv" "$$1"; fi' _ {} \;

# Show DIVI migration help
divi-help:
    @echo "DIVI Migration Commands"
    @echo "======================="
    @echo ""
    @echo "Phase 1: Inventory & Export"
    @echo "  just divi-inventory              # Generate inventory with complexity scoring"
    @echo "  just divi-export <type> <slug>   # Export single item"
    @echo "  just divi-export-all <type>      # Export all of a type (page/post/akce)"
    @echo ""
    @echo "Phase 2: Conversion"
    @echo "  just divi-convert <type> <slug>  # Convert single item (TODO)"
    @echo ""
    @echo "Phase 3: Review & Publish"
    @echo "  just divi-screenshot-before <type> <slug>  # Screenshot before conversion"
    @echo "  just divi-screenshot-after <type> <slug>   # Screenshot after conversion"
    @echo "  just divi-publish <type> <slug>            # Publish converted content"
    @echo "  just divi-restore <type> <slug>            # Restore original from backup"
    @echo ""
    @echo "Status & Utilities"
    @echo "  just divi-status                 # Show migration progress"
    @echo "  just divi-list <status>          # List content by status"
    @echo ""
    @echo "Documentation: docs/DIVI_MIGRATION_PLAN.md"
