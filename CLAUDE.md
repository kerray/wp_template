# CLAUDE.md

This file provides guidance to Claude Code when working with this WordPress project.

## Project Overview

Docker-based WordPress development environment template designed for AI agents (Cline, Roo, Claude Code) to set up and manage WordPress projects efficiently.

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
| Fix permissions | `just fix-all-permissions` |
| UpdraftPlus restore | `just restore-from-updraft prefix` |

Run `just` to see all available commands with descriptions.

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
- **Track progress** - Use `memlog/` for planning documents and progress tracking

## vibe-tools

See `.vibe-tools.md` for vibe-tools CLI integration (web search, repo analysis, browser automation).
