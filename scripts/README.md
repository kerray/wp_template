# WordPress Template Scripts

This directory contains utility scripts for maintaining the WordPress template across multiple site instances.

## Available Scripts

### sync-template.sh

**Purpose:** Synchronizes template files to all WordPress site instances while preserving site-specific customizations.

**Usage:**
```bash
# Interactive sync with confirmation
./scripts/sync-template.sh

# Force sync without confirmation
./scripts/sync-template.sh --force

# Dry run to see what would be changed
./scripts/sync-template.sh --dry-run

# Verbose output for detailed logging
./scripts/sync-template.sh --verbose --force

# Show help
./scripts/sync-template.sh --help
```

**Features:**
- Automatic site discovery
- Site-specific file protection
- Comprehensive verification
- Dry-run capability
- Colored output for easy monitoring
- Tool version management

**What it syncs:**
- Template files (README.md, CLAUDE.md, Justfile, etc.)
- Template directories (docker/, docs/, .vscode/)
- Creates SITE_CONFIG.md if missing
- Updates .env with tool versions

**What it protects:**
- Site-specific configurations (.env, SITE_CONFIG.md)
- Content directories (src/, uploads/, backups/)
- Version control (.git/)
- Project logs (memlog/, logs/)

## Configuration

The sync script automatically discovers sites using the pattern `site_*` in the parent directory of the template.

**Current setup:**
```
/home/kerray/
├── wp_template/           # Template source
├── site_kerraycz/         # Auto-discovered
├── site_waldorf/          # Auto-discovered
├── site_sapazi/           # Auto-discovered
├── site_indiancorral/     # Auto-discovered
└── site_goodkarma/        # Auto-discovered
```

To modify the site discovery pattern, edit the `SITE_PATTERN` variable in `sync-template.sh`.

## Best Practices

### When to Sync
- After adding new template features
- After updating tool versions
- After improving documentation
- After fixing bugs in core template files

### Before Syncing
1. Test changes in the wp_template first
2. Document changes in docs/TEMPLATE_SYNC.md
3. Consider the impact on existing sites
4. Run with --dry-run first to preview changes

### After Syncing
1. Test on one site before using others
2. Update site-specific SITE_CONFIG.md files
3. Build new containers: `just build`
4. Verify MCP functionality: `just mcp-status`

## Troubleshooting

### Common Issues

**Script Permission Denied**
```bash
chmod +x scripts/sync-template.sh
```

**Sites Not Found**
- Check that site directories exist
- Verify site naming follows `site_*` pattern
- Ensure you're running from template directory

**Sync Verification Fails**
```bash
# Check what's missing
./scripts/sync-template.sh --verbose --dry-run

# Manual verification
ls -la site_name/{README.md,CLAUDE.md,Justfile}
```

## Adding New Scripts

When adding new utility scripts:

1. **Create the script** in this directory
2. **Make it executable**: `chmod +x script-name.sh`
3. **Document it** in this README
4. **Follow naming convention**: Use kebab-case with .sh extension
5. **Include help option**: Support `--help` flag
6. **Add error handling**: Use `set -euo pipefail`
7. **Use colored output**: Follow existing color scheme

## Development Guidelines

### Script Standards
- Use bash with strict error handling
- Include help text and usage examples
- Support dry-run mode where applicable
- Use consistent logging format
- Handle errors gracefully
- Make scripts self-documenting

### Testing
- Test with different site configurations
- Verify protection of site-specific files
- Test error conditions and recovery
- Run dry-run mode before real operations

---

For detailed information about the template synchronization process, see `docs/TEMPLATE_SYNC.md`.