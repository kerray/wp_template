# Restoring from UpdraftPlus Backups

Guide for restoring WordPress sites from UpdraftPlus backup archives.

## UpdraftPlus Backup Structure

UpdraftPlus creates separate archives for each WordPress component:

| File Pattern | Contents | Required |
|-------------|----------|----------|
| `*-db.gz` | Database backup | Yes |
| `*-themes.zip` | All themes | Recommended |
| `*-plugins.zip` | All plugins | Recommended |
| `*-uploads.zip` | Media files | Recommended |
| `*-others.zip` | Cache files | Usually not needed |

## Quick Restoration (Automated)

```bash
# 1. Place all backup files in ./backups/ directory

# 2. Find the common backup prefix
ls -la backups/
# Example output:
# backup_2025-11-21-1131_Site_Name_abc123-db.gz
# backup_2025-11-21-1131_Site_Name_abc123-themes.zip
# ...

# 3. Run automated restore with the prefix (everything before -db.gz)
just restore-from-updraft backup_2025-11-21-1131_Site_Name_abc123
```

The automated restore:
- Verifies all backup files exist
- Cleans DEFINER statements from database
- Imports database
- Extracts themes, plugins, and uploads
- Updates URLs for local environment (localhost:8080)
- Fixes file permissions

## Manual Restoration Steps

For more control or partial restoration:

### Step 1: Clean Database Backup

Production backups contain `DEFINER` statements that fail on local MySQL:

```bash
just db-clean backup-*-db.gz
# Creates: backup-*-db.gz.cleaned.gz
```

### Step 2: Import Database

```bash
just db-import-gz backup-*-db.gz.cleaned.gz
```

### Step 3: Extract Content

```bash
# Themes
unzip -o backups/backup-*-themes.zip -d src/wp-content/

# Plugins
unzip -o backups/backup-*-plugins.zip -d src/wp-content/

# Uploads (media files)
unzip -o backups/backup-*-uploads.zip -d ./
```

### Step 4: Update URLs

```bash
just urls-replace "old-domain.com" "localhost:8080"
```

### Step 5: Fix Permissions

```bash
just fix-all-permissions
```

## Verification Checklist

```bash
# Database
just wp "db check"                    # Verify database connection

# WordPress Core
just wp "core version"                # Check WordPress version
just wp "option get siteurl"          # Verify site URL is correct

# Content
just wp "theme list"                  # Check active theme
just wp "plugin list --status=active" # Check active plugins
just open-site                        # Load site in browser
```

## Common Issues

### DEFINER Permission Errors

**Problem**: `Access denied; you need (at least one of) the SUPER privilege(s)`

**Solution**: Always clean database backups before import:
```bash
just db-clean backup-filename.sql.gz
just db-import-gz backup-filename.sql.gz.cleaned.gz
```

### URL Mismatch

**Symptoms**: Site redirects to production URL, broken links

**Solution**:
```bash
just urls-check                        # View current URLs
just urls-update                       # Set to localhost:8080
# Or custom replacement:
just urls-replace "old.com" "new.com"
```

### Permission Errors

**Symptoms**: Can't update plugins, media upload fails

**Solution**:
```bash
just fix-all-permissions
```

Some Docker-owned file warnings are normal and can be ignored.

## See Also

- [Site Migration Guide](./site-migration.md) - For full site migrations
- [Troubleshooting](../troubleshooting.md) - Common issues
