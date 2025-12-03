# Project Architecture

Technical details about the Docker-based WordPress development environment.

## Directory Structure

```
├── .claude/skills/       # Claude Code skills for AI assistance
├── .vscode/              # VSCode configuration and tasks
├── backups/              # Database and uploads backup storage
├── docker/               # Docker configuration files
│   ├── nginx/            # Nginx configuration
│   ├── php/              # PHP configuration
│   └── wordpress-fpm/    # PHP-FPM WordPress container
├── docs/                 # Project documentation
│   ├── workflows/        # Step-by-step guides
│   ├── divi/             # DIVI shortcode documentation
│   ├── gutenberg/        # Gutenberg block documentation
│   └── generateblocks/   # GenerateBlocks documentation
├── logs/                 # Log files
│   ├── nginx/            # Nginx access and error logs
│   └── php/              # PHP-FPM logs
├── memlog/               # Project progress and planning logs
├── prompts/              # AI agent instructions
├── src/                  # WordPress source files (mounted to container)
├── tests/                # Test files
├── uploads/              # WordPress media files (mounted separately)
├── Justfile              # Task runner commands
└── docker-compose.yml    # Docker services configuration
```

## Docker Services

| Service | Description | Port | Access |
|---------|-------------|------|--------|
| `wordpress` | PHP-FPM with WP-CLI, Composer, MCP Plugin | 9000 (internal) | Via nginx |
| `nginx` | Web server (serves static files, proxies PHP) | 8080 | Public |
| `db` | MySQL 5.7 database | 3306 (internal) | Internal only |
| `phpmyadmin` | Database management interface (optional) | 8081 | Localhost only |
| `adminer` | Lightweight DB management (optional) | 8082 | Localhost only |
| `sftp` | SFTP/SCP file access (optional) | 2222 | Configurable |

### Service Profiles

Optional services are enabled via Docker Compose profiles:

```bash
just up                # Core services only (nginx, wordpress, db)
just up phpmyadmin     # + phpMyAdmin
just up adminer        # + Adminer
just up sftp           # + SFTP access
just up all            # All optional services
```

### Security Features

- **phpMyAdmin/Adminer**: Bound to `127.0.0.1` only - not accessible from network
- **Nginx**: Security headers configured, sensitive files blocked
- **SFTP**: Uses host user UID/GID for proper file permissions

## Custom WordPress Container

Our custom PHP-FPM container extends the official WordPress image with pre-installed development tools:

- **WP-CLI**: Command-line interface for WordPress management
- **Composer**: PHP dependency manager for plugin/theme development
- **WordPress MCP Plugin**: Pre-installed and ready for AI agent integration
- **Development Tools**: Git, Vim, Nano, and other essential utilities

### Bidirectional File Editing

The container runs as your host user (via `USER_ID` and `GROUP_ID`), enabling:
- Edit files from your IDE on the host
- Edit files from within the container
- No permission conflicts between host and container

All tool versions are configurable via environment variables.

## Environment Variables

Configure via `.env` file:

```bash
# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=wordpress
MYSQL_USER=wordpress
MYSQL_PASSWORD=wordpress

# Ports
WP_PORT=8080          # WordPress site port
PMA_PORT=8081         # phpMyAdmin port (localhost only)
ADMINER_PORT=8082     # Adminer port (localhost only)
SFTP_PORT=2222        # SFTP port

# WordPress Debug
WP_DEBUG=true

# Development Tool Versions (for custom container)
COMPOSER_VERSION=2.7.1    # PHP Composer version
WP_CLI_VERSION=2.11.0     # WP-CLI version
WP_MCP_VERSION=0.2.3      # WordPress MCP Plugin version

# SFTP Password (change for production!)
SFTP_PASSWORD=wordpress
```

## File Mounting

| Local Path | Container Path | Purpose |
|------------|----------------|---------|
| `./src/` | `/var/www/html/` | WordPress core files |
| `./uploads/` | `/var/www/html/wp-content/uploads/` | Media files |
| `./logs/nginx/` | `/var/log/nginx/` | Nginx logs |
| `./logs/php/` | `/var/log/php/` | PHP-FPM logs |

### Media File Management

The `./uploads/` directory is mounted separately from WordPress core files:

- **Persistent**: Media files survive container restarts and rebuilds
- **Backupable**: Use `just uploads-backup` to create media backups
- **Portable**: Can be synced/copied independently of WordPress core
- **Performance**: Large media files don't affect WordPress core git operations

## Git Strategy

### Tracked Files

- `wp-content/themes/` - Custom themes
- `wp-content/plugins/` - Custom plugins (excluding vendor directories)
- `docs/` - Documentation
- Configuration files

### Ignored Files

- WordPress core files (`wp-admin/`, `wp-includes/`)
- `wp-config.php` (auto-generated)
- `uploads/` (managed separately)
- `backups/` (local only)
- `logs/` (local only)
- Test artifacts

## VSCode Integration

Pre-configured tasks in `.vscode/tasks.json` that wrap Just recipes:

- Start/Stop/Restart WordPress Environment
- View WordPress/Database/Nginx Logs
- Open WordPress Site/phpMyAdmin
- Run WP-CLI Commands
- Database Operations

Access via Command Palette: `Ctrl+Shift+P` → "Tasks: Run Task"

## Important Notes

- Always use `docker compose up -d` to start containers in background
- Use Just recipes instead of direct Docker commands
- Database backups go in `./backups/` and are excluded from Git
- WordPress core files in `./src/` should not be committed to Git
- Logs are stored in `./logs/` and are excluded from Git
