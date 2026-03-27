---
name: wordpress-management
description: Manages WordPress Docker environment and WP-CLI operations. Use when starting/stopping WordPress, managing plugins/themes, running WP-CLI commands, or configuring the development environment.
---

# WordPress Management

## Quick Commands

All operations use the Just task runner:

```bash
# Environment
just up              # Start WordPress environment
just down            # Stop environment
just restart         # Restart services
just status          # Check container status
just logs            # View WordPress logs

# WP-CLI (run any WP-CLI command)
just wp "command"    # e.g., just wp "core version"
```

## Environment Management

### Starting & Stopping

```bash
just up              # Start in detached mode
just down            # Stop all containers
just restart         # Restart services
just rebuild         # Rebuild and restart
```

### Container Status

```bash
just status          # Show container status
just logs            # WordPress logs
just logs db         # Database logs
just logs-all        # All container logs
```

## WP-CLI Operations

WP-CLI is pre-installed in the container. Use through Just:

```bash
just wp "core version"                    # WordPress version
just wp "plugin list"                     # List plugins
just wp "plugin install plugin-name"      # Install plugin
just wp "plugin activate plugin-name"     # Activate plugin
just wp "theme list"                      # List themes
just wp "theme activate theme-name"       # Activate theme
just wp "user list"                       # List users
just wp "option get siteurl"              # Get option
just wp "cache flush"                     # Flush cache
```

### Shorthand Commands

```bash
just plugin-list         # List plugins
just plugin-install name # Install & activate plugin
just plugin-update-all   # Update all plugins
just theme-list          # List themes
just theme-activate name # Activate theme
just user-list           # List users
just core-version        # WordPress version
```

## URL Management

```bash
just urls-check                           # Show current URLs
just urls-update                          # Set to localhost:8080
just urls-replace "old.com" "new.com"     # Custom replacement
```

## Permissions

```bash
just fix-permissions         # Fix local file permissions
just fix-update-permissions  # Fix Docker container permissions
just fix-all-permissions     # Fix both
```

## Development Tools

```bash
just open-site        # Open WordPress in browser
just open-phpmyadmin  # Open phpMyAdmin
just info             # Show environment info
```

## Container Details

- **WordPress URL**: http://localhost:8080 (configurable via WP_PORT)
- **phpMyAdmin URL**: http://localhost:8081 (configurable via PMA_PORT)
- **Database**: MySQL 5.7

## Environment Variables

Configure in `.env` file:

```bash
WP_PORT=8080          # WordPress port
PMA_PORT=8081         # phpMyAdmin port
WP_DEBUG=true         # Debug mode
MYSQL_DATABASE=wordpress
MYSQL_USER=wordpress
MYSQL_PASSWORD=wordpress
```

## Troubleshooting

### Container won't start
```bash
just status           # Check what's running
just logs wordpress   # Check for errors
just rebuild          # Force rebuild
```

### Permission errors
```bash
just fix-all-permissions
```

### Database connection failed
```bash
just db-test          # Test connection
just logs db          # Check database logs
```

## Docker Uploads Volume Mapping

**Important**: The docker-compose.yml mounts `./uploads` to `/var/www/html/wp-content/uploads`. This is SEPARATE from `./src/wp-content/uploads`.

When images show 404 errors:
1. Check if images exist in the Docker-mounted path: `./uploads/`
2. If images are in `./src/wp-content/uploads/`, copy them to `./uploads/`
3. Create year/month subdirectories as needed: `uploads/2021/08/`, `uploads/2018/05/`, etc.

```bash
# Copy images to Docker-mounted uploads
mkdir -p uploads/2021/08
cp src/wp-content/uploads/2021/08/image.jpg uploads/2021/08/

# Or use docker cp directly
docker cp local-file.jpg wordpress:/var/www/html/wp-content/uploads/path/
```

**Special Characters in Filenames**: Files with non-ASCII characters (diacritics, umlauts, etc.) may cause 404 errors. Rename files to use ASCII characters only and update references in the database.

## Documentation References

- [Architecture](../../../docs/architecture.md) - Technical details
- [Troubleshooting](../../../docs/troubleshooting.md) - Common issues
- [New WordPress Setup](../../../docs/workflows/new-wordpress.md) - Fresh installation
