# WordPress AI Template - Quick Start Reference

## 3-Minute Setup

### New WordPress Site
```bash
just setup && just build && just up
just open-site  # Complete setup in browser
just mcp-install  # Enable AI integration
```

### Restore from Backup
```bash
just setup && just build && just up
just db-import your-backup.sql
just urls-update
just mcp-install
```

### Complete Site Migration
```bash
just setup && just build
# Copy files to src/ and uploads/
just up
just db-import production-backup.sql
just urls-replace "old-domain.com" "localhost:8080"
just mcp-install
```

## Essential Commands

### Environment Management
```bash
just build      # Build custom container (first time)
just up         # Start WordPress environment
just down       # Stop everything
just rebuild    # Rebuild and restart
just status     # Check container status
```

### Optional Services
```bash
just up phpmyadmin  # Start with phpMyAdmin
just up adminer     # Start with Adminer
just up sftp        # Start with SFTP access
just up all         # Start with all optional services
```

### WordPress Management
```bash
just wp "command"           # Run any WP-CLI command
just wp "core version"      # Check WordPress version
just wp "plugin list"       # List installed plugins
just wp "user list"         # List WordPress users
```

### Database Operations
```bash
just db-export              # Create database backup
just db-import file.sql     # Import database backup
just db-import-gz file.gz   # Import compressed backup
just urls-update            # Fix URLs for local development
just urls-check             # Check current URLs
```

### MCP (AI Integration)
```bash
just mcp-install            # Install/activate MCP plugin
just mcp-status             # Check MCP plugin status
just mcp-token-info         # JWT token generation guide
just mcp-test-endpoints     # Test MCP API endpoints
```

### File Management
```bash
just uploads-backup         # Backup media files
just uploads-restore file   # Restore media backup
just fix-all-permissions    # Fix file permissions
```

## Tool Versions (Configurable in .env)
```bash
COMPOSER_VERSION=2.7.1      # PHP Composer
WP_CLI_VERSION=2.11.0       # WordPress CLI
WP_MCP_VERSION=0.2.3        # WordPress MCP Plugin
```

## Access Points
- **WordPress Site**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081 (localhost only, use `just up phpmyadmin`)
- **Adminer**: http://localhost:8082 (localhost only, use `just up adminer`)
- **WordPress Admin**: http://localhost:8080/wp-admin

## Key Directories
- `src/` - WordPress core files (live-mounted)
- `uploads/` - Media files (persistent)
- `backups/` - Database and file backups
- `logs/` - Nginx and PHP logs
- `docker/` - Custom container configuration

## Troubleshooting
```bash
just logs wordpress         # View WordPress/PHP-FPM logs
just logs nginx             # View Nginx logs
just logs db                # View database logs
just rebuild                # Force rebuild container
just fix-all-permissions    # Fix permission issues
```

## Full Documentation
- **Complete Guide**: `README.md`
- **AI Instructions**: `CLAUDE.md`
- **Architecture**: `docs/architecture.md`
- **Security**: `docs/PRODUCTION_SECURITY.md`

---
**Ready in 3 minutes:** `just setup && just build && just up`
