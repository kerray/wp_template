# WordPress Template Synchronization Guide

This document explains how to maintain and sync the WordPress template across multiple site instances.

## Overview

The WordPress AI Workspace Template is maintained as a central template (`wp_template`) that gets synchronized to multiple active site instances. This ensures all sites benefit from improvements while preserving site-specific customizations.

## Current Site Structure

```
/path/to/
├── wp_template/           # 🏗️  Master template (source of truth)
├── site_example/          # 🌐 Production site instance
├── site_foo/              # 🌐 Production site instance  
├── site_bar/              # 🌐 Production site instance
├── site_baz/              # 🌐 Production site instance
└── site_qux/              # 🌐 Production site instance
```

## Template Synchronization System

### Files That Are SYNCHRONIZED (Overwritten)
These files are maintained by the template and will be **replaced** during sync:

**Core Template Files:**
- `README.md` - Template documentation
- `CLAUDE.md` - AI agent instructions
- `Justfile` - Task runner commands
- `docker-compose.yml` - Container configuration
- `.gitignore` - Version control rules
- `claude_mcp_config.json` - MCP configuration template
- `wp-sites.example.json` - Site configuration example

**Template Directories:**
- `docker/` - Custom container definitions
- `docs/` - All template documentation
- `.vscode/` - VSCode integration
- `.claude/` - Claude Code configuration

### Files That Are PROTECTED (Never Touched)
These files contain site-specific data and are **never modified** during sync:

**Site-Specific Files:**
- `SITE_CONFIG.md` - Site customization documentation
- `.env` - Environment variables and secrets
- `src/` - WordPress core files and content
- `uploads/` - Media files
- `backups/` - Database and file backups
- `logs/` - Container logs
- `.git/` - Version control history

## Synchronization Tools

### 1. Automated Sync Script

**Location:** `wp_template/sync_to_sites.sh`

**Usage:**
```bash
cd /path/to/wp_template
./sync_to_sites.sh
```

**Features:**
- Interactive confirmation before sync
- Automatic `SITE_CONFIG.md` creation
- Verification of sync success
- Protection of site-specific files
- Colored output for easy monitoring

### 2. Manual Sync Commands

For individual site updates or troubleshooting:

```bash
# Sync specific files to a single site
cp README.md CLAUDE.md Justfile /path/to/site_name/

# Sync directories to a single site
cp -r docker docs .vscode /path/to/site_name/

# Ensure SITE_CONFIG.md exists
[ ! -f /path/to/site_name/SITE_CONFIG.md ] && cp SITE_CONFIG.md /path/to/site_name/
```

### 3. Verification Commands

After any sync operation, verify success:

```bash
# Check all sites have required files
for site in site_*; do
  echo "=== $site ==="
  ls -la $site/{README.md,CLAUDE.md,Justfile,SITE_CONFIG.md,.env}
  echo ""
done

# Verify custom container setup
for site in site_*; do
  echo "$site container setup:"
  [ -f "$site/docker/wordpress/Dockerfile" ] && echo "  ✅ Dockerfile" || echo "  ❌ Dockerfile"
  [ -f "$site/docker/wordpress/entrypoint.sh" ] && echo "  ✅ Entrypoint" || echo "  ❌ Entrypoint"
done
```

## Site-Specific Customization Workflow

### Adding New Template Features

1. **Develop in Master Template**
   ```bash
   cd /path/to/wp_template
   # Make improvements to template files
   # Test changes
   ```

2. **Document Changes**
   ```bash
   # Update this file (TEMPLATE_SYNC.md) with sync notes
   # Update INSTALL.md if installation process changes
   # Update QUICK_START.md if commands change
   ```

3. **Synchronize to All Sites**
   ```bash
   ./sync_to_sites.sh
   ```

4. **Verify and Test**
   ```bash
   # Test on one site first
   cd /path/to/site_example
   just build
   just up
   just mcp-status
   ```

### Adding Site-Specific Features

Sites should **never modify template files directly**. Instead:

1. **Document in SITE_CONFIG.md**
   ```markdown
   ## Custom Commands
   - `just deploy-production`: Custom deployment to live server
   - `just backup-full`: Complete site backup including uploads
   
   ## Custom Plugins
   - Custom Gallery Plugin: Handles site-specific image galleries
   - Payment Integration: Connects to site's payment processor
   ```

2. **Use Site-Specific Scripts** (if needed)
   ```bash
   # Create site-commands.just for complex custom commands
   echo 'deploy-production:
       @echo "Deploying to production server..."
       rsync -av src/ user@server:/var/www/html/' > site-commands.just
   
   # Include in main Justfile (manual edit)
   echo 'include site-commands.just' >> Justfile
   ```

3. **Environment Variables for Customization**
   ```bash
   # Add to .env file
   SITE_CUSTOM_FEATURE=enabled
   CUSTOM_PLUGIN_API_KEY=secret_key_here
   DEPLOYMENT_TARGET=production
   ```

## Maintenance Schedule

### Regular Template Updates (Monthly)
1. Review and improve template features
2. Update tool versions (WP-CLI, Composer, MCP Plugin)
3. Sync to all sites
4. Test one site thoroughly
5. Document changes in TEMPLATE_SYNC.md

### Emergency Updates (As Needed)
1. Security patches
2. Critical bug fixes
3. Emergency sync to all sites
4. Immediate testing

### Site-Specific Maintenance (As Needed)
1. Update SITE_CONFIG.md with changes
2. Backup site data before major changes
3. Test locally before production deployment

## Troubleshooting Sync Issues

### Common Problems

**1. Sync Script Fails**
```bash
# Check script permissions
chmod +x sync_to_sites.sh

# Run manually for single site
cp README.md /path/to/site_name/
```

**2. Site-Specific Files Overwritten**
```bash
# Restore from Git (if tracked)
cd /path/to/site_name
git checkout .env SITE_CONFIG.md

# Or recreate from template
cp /path/to/wp_template/SITE_CONFIG.md .
```

**3. Custom Container Build Fails**
```bash
# Rebuild without cache
just rebuild

# Check Dockerfile syntax
docker build -f docker/wordpress/Dockerfile .
```

**4. Version Conflicts**
```bash
# Update tool versions in .env
echo "COMPOSER_VERSION=2.7.1" >> .env
echo "WP_CLI_VERSION=2.11.0" >> .env
echo "WP_MCP_VERSION=0.2.3" >> .env
```

## Best Practices

### For Template Maintenance
1. **Test changes in wp_template first**
2. **Document all changes in this file**
3. **Use semantic versioning for major changes**
4. **Keep sync operations atomic and reversible**
5. **Always verify sync success across all sites**

### For Site Customization
1. **Never modify template files directly**
2. **Document everything in SITE_CONFIG.md**
3. **Use .env for site-specific configuration**
4. **Create backups before major changes**
5. **Test template updates on staging first**

### For Emergency Situations
1. **Keep site backups current**
2. **Document rollback procedures**
3. **Have emergency contact information**
4. **Test disaster recovery procedures**

## Sync History

Track major template synchronizations:

| Date | Version | Changes | Sites Updated |
|------|---------|---------|---------------|
| 2025-07-24 | v2.0 | Custom container, MCP integration, comprehensive docs | All 5 sites |
| | | | |

---

**⚠️ Important:** This synchronization system is critical for maintaining consistency across all WordPress instances. Always test changes in the master template before syncing to production sites.