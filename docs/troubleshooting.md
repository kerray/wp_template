# Troubleshooting

Common issues and solutions for the WordPress development environment.

## Container Issues

### Container Build Fails

```bash
# Force rebuild without cache
just rebuild

# Check container logs
just logs wordpress
```

### Containers Won't Start

```bash
# Check if ports are in use
lsof -i :8080
lsof -i :8081

# Stop conflicting services or change ports in .env
```

### WordPress Container Not Running

```bash
# Check status
just status

# Start environment
just up

# View detailed logs
just logs wordpress
```

## Database Issues

### Connection Failed

```bash
# Wait for database to be ready (takes ~30 seconds on first start)
sleep 30 && just wp "db check"

# Test database connection
just db-test

# Check database container logs
just logs db
```

### DEFINER Permission Errors

**Error**: `Access denied; you need (at least one of) the SUPER privilege(s)`

**Cause**: Production database backups contain `DEFINER` statements.

**Solution**:
```bash
just db-clean backup-filename.sql.gz
just db-import-gz backup-filename.sql.gz.cleaned.gz
```

### Import Fails

```bash
# Check backup file exists
ls -la backups/

# Verify database is running
just db-test

# Try importing directly
docker compose exec -T db mysql -uwordpress -pwordpress wordpress < backups/file.sql
```

### Table Prefix Mismatch

**Cause**: Restored database has different table prefix than wp-config.php

**Solution**: Set the correct prefix in `.env`:
```bash
WORDPRESS_TABLE_PREFIX=custom_prefix_
```

Then restart:
```bash
just down && just up
```

## URL Issues

### Site Redirects to Production URL

**Cause**: Database still contains production URLs.

```bash
# Check current URLs
just urls-check

# Update to localhost
just urls-update

# Or custom replacement
just urls-replace "old-domain.com" "localhost:8080"
```

### Broken Links/Images After Migration

```bash
# Run search-replace dry run first
just wp "search-replace 'https://old.com' 'http://localhost:8080' --dry-run"

# Apply changes
just wp "search-replace 'https://old.com' 'http://localhost:8080'"
```

### 404 Errors on Pretty URLs

**Cause**: .htaccess missing or Apache rewrite not enabled

**Solution**: Verify .htaccess exists in `src/` with WordPress rewrite rules:
```bash
cat src/.htaccess
```

Or regenerate permalinks:
```bash
just wp "rewrite flush"
```

## Permission Issues

### Can't Update Plugins/Themes

```bash
just fix-update-permissions
```

### File Upload Fails

```bash
just fix-all-permissions
```

### Permission Denied Errors

```bash
# Fix local permissions
just fix-permissions

# Fix container permissions
just fix-update-permissions

# Or both at once
just fix-all-permissions
```

Note: Some Docker-owned file warnings during permission fixes are normal and can be ignored.

## Plugin Issues

### White Screen After Plugin Activation

```bash
# Deactivate all plugins via WP-CLI
just wp "plugin deactivate --all"

# Reactivate one by one to find the culprit
just wp "plugin activate plugin-name"
```

### Plugin Conflict Detection

```bash
# List active plugins
just wp "plugin list --status=active"

# Check for PHP errors
just logs wordpress | grep -i error
```

### MCP Plugin Not Working

```bash
# Check status
just mcp-status

# Reinstall
just mcp-install

# Test endpoints
just mcp-test-endpoints
```

## Performance Issues

### Site Loads Slowly

```bash
# Clear caches
just wp "cache flush"

# Check container resources
docker stats

# Review active plugins
just wp "plugin list --status=active"
```

### Database Operations Slow

```bash
# Optimize database
just wp "db optimize"

# Check database size
just wp "db size"
```

## Recovery Commands

### Complete Reset

```bash
# Stop and remove everything
just clean

# Rebuild from scratch
just setup
just build
just up
```

### Restore from Backup

```bash
# List available backups
just db-list-backups

# Import backup
just db-import backup-filename.sql

# Fix URLs
just urls-update
```

## Getting Help

### View Logs

```bash
just logs              # WordPress logs
just logs db           # Database logs
just logs-all          # All container logs
```

### Check Status

```bash
just status            # Container status
just info              # Environment info
just wp "core version" # WordPress version
```

### Run Diagnostics

```bash
just wp "db check"     # Database health
just wp "plugin list"  # Plugin status
just wp "theme list"   # Theme status
```
