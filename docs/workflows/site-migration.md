# Complete Site Migration

Guide for migrating a complete existing WordPress site with files and database.

## Prerequisites

- Access to source server (SSH or file download)
- Database backup or access to export
- Docker environment ready locally

## Step 1: Preparation

```bash
just setup              # Initialize template
just build              # Build custom container
```

## Step 2: File Migration

### Option A: Via rsync (SSH access)

```bash
# Copy WordPress core and content files
rsync -av user@remote-server:/path/to/wordpress/ src/

# Copy media files separately for better organization
rsync -av user@remote-server:/path/to/wordpress/wp-content/uploads/ uploads/
```

### Option B: Manual Download

1. Download WordPress files from hosting panel/FTP
2. Extract to `src/` directory
3. Move `wp-content/uploads/` to `./uploads/`

## Step 3: Database Migration

### Export from Remote Server

```bash
# SSH to server and export
ssh user@remote-server "mysqldump -u db_user -p database_name > site-backup.sql"

# Download the backup
scp user@remote-server:site-backup.sql backups/
```

### Import Locally

```bash
just up                 # Start environment
# Wait for database to be ready (about 30 seconds)

just db-import site-backup.sql
```

If you get DEFINER errors:
```bash
just db-clean site-backup.sql
just db-import site-backup.sql.cleaned.sql
```

## Step 4: Configuration Updates

### Update URLs for Local Development

```bash
# Preview changes (dry run)
just wp "search-replace 'production-domain.com' 'localhost:8080' --dry-run"

# Apply URL replacement
just urls-replace "production-domain.com" "localhost:8080"
```

### Clear Caches

```bash
just wp "cache flush" 2>/dev/null || echo "No cache to flush"
```

## Step 5: Plugin & Permission Setup

```bash
just plugin-update-all   # Update plugins for compatibility
just mcp-install        # Add MCP plugin for AI integration
just fix-all-permissions # Ensure proper file permissions
```

## Step 6: Final Verification

```bash
just open-site          # Check site loads correctly
just mcp-status         # Verify MCP plugin is active
just wp "user list"     # Verify user accounts migrated
```

## Post-Migration Checklist

### Security

```bash
# Change admin password if needed
just wp "user update admin --user_pass=new_secure_password"

# Remove unnecessary default plugins
just wp "plugin delete hello akismet"  # Optional
```

### Development Configuration

```bash
# Enable debug mode
just wp "config set WP_DEBUG true --type=constant"
just wp "config set WP_DEBUG_LOG true --type=constant"
```

### Initial Backups

```bash
just db-export          # Creates database backup
just uploads-backup     # Creates media backup
```

## Troubleshooting

### Database Connection Issues

```bash
# Wait longer for database to start
sleep 30 && just wp "db check"

# Test database connection
just db-test
```

### Plugin Conflicts

```bash
# Deactivate all plugins temporarily
just wp "plugin deactivate --all"

# Reactivate one by one to find problematic plugin
just wp "plugin activate plugin-name"
```

### Container Issues

```bash
# Force rebuild without cache
just rebuild

# Check container logs
just logs wordpress
```

## File Locations After Migration

| Content Type | Local Path | Container Path |
|-------------|------------|----------------|
| WordPress Core | `./src/` | `/var/www/html/` |
| Themes | `./src/wp-content/themes/` | `/var/www/html/wp-content/themes/` |
| Plugins | `./src/wp-content/plugins/` | `/var/www/html/wp-content/plugins/` |
| Uploads | `./uploads/` | `/var/www/html/wp-content/uploads/` |
| Config | `./src/wp-config.php` | `/var/www/html/wp-config.php` |

## See Also

- [UpdraftPlus Restore](./restore-backup.md) - For UpdraftPlus-specific backups
- [Troubleshooting](../troubleshooting.md) - Common issues and solutions
