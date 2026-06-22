# WordPress AI Development Container

This directory contains the custom Docker configuration for the WordPress AI Development environment using PHP-FPM + Nginx.

## Architecture

The environment uses a modern, high-performance stack:

- **Nginx**: Fast web server for static files and PHP proxy
- **PHP-FPM**: PHP FastCGI Process Manager for efficient PHP execution
- **MySQL 5.7**: Database server

## Custom Container Features

Our custom WordPress PHP-FPM container (`docker/wordpress-fpm/Dockerfile`) extends the official WordPress FPM image with:

- **WP-CLI**: Pre-installed WordPress command-line interface
- **Composer**: PHP dependency manager for modern WordPress development
- **WordPress MCP Plugin**: Pre-installed and ready for AI agent integration
- **Development Tools**: Git, Vim, Nano, and other essential utilities
- **Host User Mapping**: Runs as your host user for bidirectional file editing
- **Proper Permissions**: Pre-configured directory structure and permissions

## Directory Structure

```
docker/
├── nginx/
│   └── conf.d/
│       └── wordpress.conf  # Nginx configuration for WordPress
├── php/
│   └── php.ini             # PHP configuration overrides
├── wordpress-fpm/
│   ├── Dockerfile          # Custom PHP-FPM container definition
│   └── entrypoint-fpm.sh   # Custom initialization script
└── archive/                # Archived Apache-based configuration (legacy)
```

## Version Management

All tool versions are controlled via environment variables:

```bash
# In your .env file
COMPOSER_VERSION=2.7.1    # PHP Composer version
WP_CLI_VERSION=2.11.0     # WP-CLI version
WP_MCP_VERSION=0.2.3      # WordPress MCP Plugin version
```

## Building the Container

```bash
# Build the custom container
just build

# Rebuild and restart everything
just rebuild

# Start with the custom container
just up
```

## Bidirectional File Editing

The container runs as your host user (via `USER_ID` and `GROUP_ID` environment variables), enabling:

- Edit files from your IDE on the host
- Edit files from within the container
- No permission conflicts between host and container

This is achieved by:
1. Creating a user inside the container with matching UID/GID
2. Running PHP-FPM as that user
3. Mounting volumes without permission conflicts

## Container Initialization

The custom entrypoint script (`entrypoint-fpm.sh`):

1. Displays installed tool versions
2. Ensures proper directory structure and permissions
3. Verifies pre-installed tools are working
4. Provides helpful status messages
5. Calls the original WordPress entrypoint

## Tool Verification

After starting the container, verify the tools are working:

```bash
# Check WP-CLI
just wp-install

# Check Composer
just wp-install-composer

# Check MCP Plugin
just mcp-status
```

## Security Features

### Nginx Security
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Blocked access to sensitive files (wp-config.php, .git, etc.)
- PHP execution disabled in uploads directory
- xmlrpc.php blocked by default

### Database Admin Tools
- phpMyAdmin and Adminer bound to `127.0.0.1` only
- Not accessible from network by default
- Use `just up phpmyadmin` or `just up adminer` to enable

## Updating Tool Versions

To update tool versions:

1. Update version numbers in your `.env` file
2. Rebuild the container: `just rebuild`
3. Verify the new versions are installed

## Benefits of This Architecture

### PHP-FPM + Nginx vs Apache
- Better performance for high-traffic sites
- Efficient static file serving
- Separate processes for web serving and PHP execution
- More granular control over resources

### Pre-installed Container
- All tools ready immediately on container start
- Consistent, reproducible environments
- Faster startup times
- Version-controlled tool installations
- No manual installation steps required

## Troubleshooting

### Container Build Issues
```bash
# Clean build (no cache)
docker compose build --no-cache wordpress

# Check build logs
docker compose logs wordpress
```

### Tool Installation Issues
```bash
# Access container shell
docker compose exec wordpress sh

# Check tool versions manually
wp --info --allow-root
composer --version
ls -la /var/www/html/wp-content/plugins/wordpress-mcp/
```

### Permission Issues
```bash
# Fix all permissions
just fix-all-permissions
```

### Log Files
```bash
# View PHP-FPM logs
just logs wordpress

# View Nginx logs
just logs nginx

# Or check local log files
ls -la logs/nginx/
ls -la logs/php/
```

## Legacy Apache Configuration

The previous Apache-based configuration has been archived in `docker/archive/`. This includes:
- `wordpress-apache/` - Apache-based Dockerfile and entrypoint
- `docker-compose.apache.yml` - Apache docker-compose configuration

The nginx/PHP-FPM architecture is now the default and recommended approach.
