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

# Run WP-CLI command (usage: just wp "core version")
wp *args:
    #!/bin/bash
    if [ $# -eq 0 ]; then
        echo "WordPress CLI wrapper for Docker environment"
        echo "Usage: just wp [wp-cli command]"
        echo ""
        echo "Examples:"
        echo "  just wp core version                # Check WordPress version"
        echo "  just wp plugin list                 # List installed plugins"
        echo "  just wp theme activate twentytwenty # Activate a theme"
        echo "  just wp user list                   # List WordPress users"
        echo ""
        echo "For more WP-CLI commands, visit: https://developer.wordpress.org/cli/commands/"
        exit 0
    fi
    
    # Check if WordPress container is running
    if ! docker-compose ps | grep -q "wordpress.*Up"; then
        echo "Warning: WordPress container does not appear to be running"
        echo "Starting Docker environment..."
        docker-compose up -d
        
        # Wait for container to be ready
        echo "Waiting for WordPress container to be ready..."
        sleep 5
    fi
    
    echo "Running: wp {{args}}"
    docker-compose exec wordpress wp {{args}}

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

# === Database Operations ===

# Export database to backups directory
db-export:
    #!/bin/bash
    mkdir -p backups
    timestamp=$(date +%Y-%m-%d-%H%M%S)
    backup_file="backups/backup-${timestamp}.sql"
    echo "Exporting database to ${backup_file}..."
    docker-compose exec db mysqldump -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} > "${backup_file}"
    echo "Database exported successfully!"

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
    #!/bin/bash
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:${WP_PORT:-8080}
    elif command -v open > /dev/null; then
        open http://localhost:${WP_PORT:-8080}
    elif command -v start > /dev/null; then
        start http://localhost:${WP_PORT:-8080}
    else
        echo "WordPress site: http://localhost:${WP_PORT:-8080}"
    fi

# Open phpMyAdmin in browser
open-phpmyadmin:
    #!/bin/bash
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:${PMA_PORT:-8081}
    elif command -v open > /dev/null; then
        open http://localhost:${PMA_PORT:-8081}
    elif command -v start > /dev/null; then
        start http://localhost:${PMA_PORT:-8081}
    else
        echo "phpMyAdmin: http://localhost:${PMA_PORT:-8081}"
    fi

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
    #!/bin/bash
    if [ ! -d "src" ]; then
        echo "Creating src directory and downloading WordPress..."
        mkdir -p src
        curl -o wordpress.tar.gz https://wordpress.org/latest.tar.gz
        tar -xzf wordpress.tar.gz -C src --strip-components=1
        rm wordpress.tar.gz
        
        # Set proper permissions
        chmod -R 755 src
        find src -type d -exec chmod 755 {} \;
        find src -type f -exec chmod 644 {} \;
        
        # Create .htaccess file
        printf '%s\n' \
            '<IfModule mod_rewrite.c>' \
            'RewriteEngine On' \
            'RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]' \
            'RewriteBase /' \
            'RewriteRule ^index\.php$ - [L]' \
            'RewriteCond %{REQUEST_FILENAME} !-f' \
            'RewriteCond %{REQUEST_FILENAME} !-d' \
            'RewriteRule . /index.php [L]' \
            '</IfModule>' \
            > src/.htaccess
        
        echo "WordPress downloaded and configured!"
    else
        echo "WordPress source directory already exists"
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
    #!/bin/bash
    if [ ! -d "uploads" ] || [ -z "$(ls -A uploads 2>/dev/null)" ]; then
        echo "No uploads directory or uploads directory is empty"
        exit 0
    fi
    
    mkdir -p backups
    timestamp=$(date +%Y-%m-%d-%H%M%S)
    backup_file="backups/uploads-${timestamp}.tar.gz"
    echo "Creating uploads backup: ${backup_file}..."
    tar -czf "${backup_file}" -C uploads .
    echo "Uploads backup created successfully!"

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
    @echo "Permissions fixed!"

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