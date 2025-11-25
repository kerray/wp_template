---
name: backup-restore
description: Handles WordPress database backups, imports, and UpdraftPlus restoration. Use when exporting/importing databases, restoring from backups, or managing UpdraftPlus archives.
---

# Backup & Restore Operations

## Quick Commands

```bash
# Database
just db-export                    # Export database to backups/
just db-import file.sql           # Import SQL file
just db-import-gz file.sql.gz     # Import compressed SQL
just db-clean file.sql.gz         # Remove DEFINER statements
just db-list-backups              # List available backups

# UpdraftPlus
just restore-from-updraft prefix  # Full automated restore

# Uploads/Media
just uploads-backup               # Backup media files
just uploads-restore file.tar.gz  # Restore media
just uploads-list-backups         # List media backups
```

## Database Operations

### Export Database

```bash
just db-export
# Creates: backups/backup-YYYY-MM-DD-HHMMSS.sql
```

### Import Database

```bash
# Plain SQL
just db-import backup-filename.sql

# Compressed SQL
just db-import-gz backup-filename.sql.gz
```

### Clean Production Backups

Production backups often have `DEFINER` statements that fail locally:

```bash
just db-clean backup-filename.sql.gz
# Creates: backup-filename.sql.gz.cleaned.gz

just db-import-gz backup-filename.sql.gz.cleaned.gz
```

### Test Connection

```bash
just db-test
```

## UpdraftPlus Restoration

### Backup File Structure

UpdraftPlus creates separate archives:

| Pattern | Contents |
|---------|----------|
| `*-db.gz` | Database (required) |
| `*-themes.zip` | Themes |
| `*-plugins.zip` | Plugins |
| `*-uploads.zip` | Media files |
| `*-others.zip` | Cache (usually skip) |

### Automated Restore

```bash
# 1. Place backup files in ./backups/

# 2. Find the common prefix
ls backups/
# Example: backup_2025-11-21-1131_Site_Name_abc123-db.gz

# 3. Run automated restore (use prefix without -db.gz)
just restore-from-updraft backup_2025-11-21-1131_Site_Name_abc123
```

The automated restore:
- Cleans DEFINER statements
- Imports database
- Extracts themes, plugins, uploads
- Updates URLs to localhost:8080
- Fixes permissions

### Manual Restore Steps

For more control:

```bash
# 1. Clean and import database
just db-clean prefix-db.gz
just db-import-gz prefix-db.gz.cleaned.gz

# 2. Extract content
unzip -o backups/prefix-themes.zip -d src/wp-content/
unzip -o backups/prefix-plugins.zip -d src/wp-content/
unzip -o backups/prefix-uploads.zip -d ./

# 3. Update URLs
just urls-replace "old-domain.com" "localhost:8080"

# 4. Fix permissions
just fix-all-permissions
```

## Media/Uploads Management

### Create Backup

```bash
just uploads-backup
# Creates: backups/uploads-YYYY-MM-DD-HHMMSS.tar.gz
```

### Restore Backup

```bash
just uploads-restore uploads-backup-filename.tar.gz
```

### List Backups

```bash
just uploads-list-backups
```

## Post-Restore Verification

```bash
just wp "db check"                    # Database OK
just wp "core version"                # WordPress version
just wp "option get siteurl"          # URL is correct
just wp "theme list"                  # Themes loaded
just wp "plugin list --status=active" # Plugins active
just test-local                       # Run tests
```

## Common Issues

### DEFINER Permission Error

```
Access denied; you need (at least one of) the SUPER privilege(s)
```

**Solution**: Clean the backup first:
```bash
just db-clean backup.sql.gz
just db-import-gz backup.sql.gz.cleaned.gz
```

### URLs Still Point to Production

```bash
just urls-check                              # View current
just urls-replace "old.com" "localhost:8080" # Fix
```

### Permission Errors After Restore

```bash
just fix-all-permissions
```

## Documentation

- [Restore from Backup Guide](../../../docs/workflows/restore-backup.md)
- [Site Migration Guide](../../../docs/workflows/site-migration.md)
- [Troubleshooting](../../../docs/troubleshooting.md)
