# CLAUDE.md

This file provides guidance to Claude Code when working with this WordPress project.

## Project Overview

Docker-based WordPress development environment template designed for AI agents (Claude Code, Cline, Cursor) to set up and manage WordPress projects efficiently.

## Quick Start

```bash
just setup           # Initialize project (creates .env, downloads WordPress)
just build           # Build custom container (first time only)
just up              # Start WordPress environment
just open-site       # Open in browser (localhost:8080)
```

## Key Commands Reference

| Task | Command |
|------|---------|
| Start environment | `just up` |
| Stop environment | `just down` |
| View logs | `just logs` |
| WP-CLI | `just wp "core version"` |
| Plugin list | `just plugin-list` |
| Update plugins | `just plugin-update-all` |
| Export database | `just db-export` |
| Import database | `just db-import file.sql` |
| Export content to files | `just content-export-all page` |
| Import content from files | `just content-import-all page` |
| Fix permissions | `just fix-all-permissions` |
| Sync production | `just ftp-sync` |
| Sync (dry run) | `just ftp-sync dry` |
| UpdraftPlus restore | `just restore-from-updraft prefix` |
| Snapshot restore | `just snapshot-restore-db backup.zip` |

Run `just` to see all available commands with descriptions.

## FTP/Remote Site Integration

Download files from live WordPress sites using FTP:

### Configuration
Add to your `.env` file:
```bash
FTP_HOST=ftp.example.com
FTP_USER=ftpuser
FTP_PASSWORD=ftppassword
FTP_PATH=/public_html
```

### Commands
| Task | Command |
|------|---------|
| Test connection | `just ftp-test` |
| List remote plugins | `just ftp-list-plugins` |
| List remote themes | `just ftp-list-themes` |
| Download all plugins | `just ftp-download-plugins` |
| Download all themes | `just ftp-download-themes` |
| Download specific plugin | `just ftp-download-plugin <name>` |
| Download specific theme | `just ftp-download-theme <name>` |
| Download uploads (careful!) | `just ftp-download-uploads` |
| Smart sync wp-content | `just ftp-sync` |
| Sync specific folder | `just ftp-sync-folder plugins` |
| Show FTP help | `just ftp-help` |

Downloaded files are placed in:
- `src/wp-content/plugins_remote/`
- `src/wp-content/themes_remote/`
- `uploads_remote/`

After downloading, manually copy needed files to the active directories.

## WPMUDEV Snapshot Backup Restore

Restore WordPress sites from WPMUDEV Snapshot backups:

### Backup Format
Snapshot creates a single ZIP file containing:
- `sql/` - Individual SQL files for each database table
- `www/` - Complete WordPress files structure
- `manifest.csv` & `manifest.json` - Backup metadata

### Commands
| Task | Command |
|------|---------|
| List backup contents | `just snapshot-list backup.zip` |
| Extract to temp directory | `just snapshot-extract backup.zip` |
| Restore database | `just snapshot-restore-db backup.zip` |
| Restore all files | `just snapshot-restore-files backup.zip` |
| Restore specific plugin | `just snapshot-restore-plugin backup.zip plugin-name` |
| Restore specific theme | `just snapshot-restore-theme backup.zip theme-name` |
| Show help | `just snapshot-help` |

### Example Workflow
```bash
# 1. Check backup contents
just snapshot-list backup.zip

# 2. Backup current database
just db-export

# 3. Restore database from Snapshot
just snapshot-restore-db backup.zip

# 4. Restore specific plugin
just snapshot-restore-plugin backup.zip generatepress
```

**Note**: Place Snapshot backup files in the `backups/` directory.

## Skills (Auto-Invoked)

Claude automatically uses these skills when relevant:

| Skill | Use Case |
|-------|----------|
| `wordpress-management` | Docker, WP-CLI, plugins/themes, environment |
| `wordpress-testing` | Site testing, Playwright, error detection |
| `backup-restore` | Database backups, UpdraftPlus restoration |

## Documentation

Detailed guides are in `docs/`:

- **[Quick Start](docs/QUICK_START.md)** - Getting started
- **[Install Guide](docs/INSTALL.md)** - Detailed installation
- **[Architecture](docs/architecture.md)** - Project structure, Docker setup
- **[Testing](docs/testing.md)** - Test suite, Playwright setup
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues & solutions
- **[MCP Installation](docs/wordpress-mcp-installation.md)** - WordPress MCP plugin

### Workflows

- **[New WordPress](docs/workflows/new-wordpress.md)** - Fresh installation
- **[Restore Backup](docs/workflows/restore-backup.md)** - UpdraftPlus restoration
- **[Site Migration](docs/workflows/site-migration.md)** - Full site migration

## Environment

```bash
# URLs
WordPress:  http://localhost:8080
phpMyAdmin: http://localhost:8081

# Key Files
Justfile           # Task runner commands
docker-compose.yml # Docker services
.env               # Environment variables
SITE_CONFIG.md     # Site-specific configuration
```

## Site Configuration

Edit `SITE_CONFIG.md` to set site-specific details:
- Site name and URLs
- Production server info
- Custom configuration notes

## Agent Guidelines

- **Use subagents** for MCP calls, database listings, and WordPress operations to minimize context size
- **Check skills** - Claude auto-discovers and uses relevant skills
- **Reference docs** - Detailed information is in `docs/` directory
- **Definition of done** - A unit of work is done when it is finished, tested, and its documentation is updated.

## vibe-tools

See `.vibe-tools.md` for vibe-tools CLI integration (web search, repo analysis, browser automation).
