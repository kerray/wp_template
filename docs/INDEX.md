# Documentation Index

## WordPress Development Environment

| Document | Description |
|----------|-------------|
| [Quick Start](QUICK_START.md) | Getting started with the project |
| [Install Guide](INSTALL.md) | Detailed installation instructions |
| [Architecture](architecture.md) | Project structure, Docker setup, file locations |
| [Testing](testing.md) | Playwright test suite, error detection |
| [Troubleshooting](troubleshooting.md) | Common issues and solutions |
| [MCP Installation](wordpress-mcp-installation.md) | WordPress MCP plugin setup |
| **[Production Security](PRODUCTION_SECURITY.md)** | **Security hardening for production deployment** |

## Step-by-Step Workflows

| Document | Description |
|----------|-------------|
| [New WordPress](workflows/new-wordpress.md) | Fresh WordPress installation |
| [Restore Backup](workflows/restore-backup.md) | UpdraftPlus restoration |
| [Site Migration](workflows/site-migration.md) | Complete site migration |

## Claude Code Skills

Located in `.claude/skills/`:

| Skill | Description |
|-------|-------------|
| `wordpress-management` | Docker, WP-CLI, environment management |
| `wordpress-testing` | Site testing, Playwright |
| `backup-restore` | Database backups, UpdraftPlus |

## Quick Commands

```bash
just                  # Show all available commands
just up               # Start WordPress
just db-export        # Backup database
just wp "command"     # Run WP-CLI command
```

## Security Commands

```bash
just security-checklist          # View production security checklist
just security-setup-production   # Create .env from secure template
just security-generate-passwords # Generate secure random passwords
just security-verify             # Check current security status
just security-audit              # Run full security audit
```

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude Code project instructions |
| `Justfile` | Task runner commands |
| `.env` | Environment configuration |
| `.env.production` | Production environment template (secure defaults) |
| `docker-compose.yml` | Docker services (Apache) |
| `docker-compose.fpm.yml` | Docker services (Nginx + PHP-FPM) |
| `.vibe-tools.md` | vibe-tools CLI reference |
| `SITE_CONFIG.md` | Site-specific configuration |
