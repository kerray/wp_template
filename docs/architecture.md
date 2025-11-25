# Project Architecture

Technical details about the Docker-based WordPress development environment.

## Directory Structure

```
├── .claude/skills/       # Claude Code skills for AI assistance
├── .vscode/              # VSCode configuration and tasks
├── backups/              # Database and uploads backup storage
├── bin/                  # Utility scripts (legacy - use Just instead)
├── docker/               # Docker configuration files
│   ├── nginx/            # Nginx configuration (if using PHP-FPM)
│   └── php/              # PHP configuration
├── docs/                 # Project documentation
│   └── workflows/        # Step-by-step guides
├── memlog/               # Project progress and planning logs
├── prompts/              # AI agent instructions
├── src/                  # WordPress source files (mounted to container)
├── tests/                # Test files
├── uploads/              # WordPress media files (mounted separately)
├── Justfile              # Task runner commands
└── docker-compose.yml    # Docker services configuration
```

## Docker Services

| Service | Description | Port |
|---------|-------------|------|
| `wordpress` | Custom WordPress AI Development container (Apache + PHP + WP-CLI + Composer + MCP Plugin) | 8080 |
| `db` | MySQL 5.7 database | 3306 (internal) |
| `phpmyadmin` | Database management interface | 8081 |
| `wordpress_fpm` | PHP-FPM alternative to Apache (optional) | - |
| `nginx` | Reverse proxy for PHP-FPM (optional) | - |

## Custom WordPress Container

Our custom container extends the official WordPress image with pre-installed development tools:

- **WP-CLI**: Command-line interface for WordPress management
- **Composer**: PHP dependency manager for plugin/theme development
- **WordPress MCP Plugin**: Pre-installed and ready for AI agent integration
- **Development Tools**: Git, Vim, Nano, and other essential utilities

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
PMA_PORT=8081         # phpMyAdmin port

# WordPress Debug
WP_DEBUG=true

# Development Tool Versions (for custom container)
COMPOSER_VERSION=2.7.1    # PHP Composer version
WP_CLI_VERSION=2.11.0     # WP-CLI version
WP_MCP_VERSION=0.2.3      # WordPress MCP Plugin version

# User/Group ID Mapping (optional)
USER_ID=1000              # Maps to your host user ID
GROUP_ID=1000             # Maps to your host group ID

# Table Prefix (for restored databases)
WORDPRESS_TABLE_PREFIX=wp_
```

## File Mounting

| Local Path | Container Path | Purpose |
|------------|----------------|---------|
| `./src/` | `/var/www/html/` | WordPress core files |
| `./uploads/` | `/var/www/html/wp-content/uploads/` | Media files |

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
- Test artifacts

## VSCode Integration

Pre-configured tasks in `.vscode/tasks.json` that wrap Just recipes:

- Start/Stop/Restart WordPress Environment
- View WordPress/Database Logs
- Open WordPress Site/phpMyAdmin
- Run WP-CLI Commands
- Database Operations

Access via Command Palette: `Ctrl+Shift+P` → "Tasks: Run Task"

## Advanced Configuration

### User/Group ID Mapping

Automatically maps your host user ID to prevent permission conflicts:

```bash
USER_ID=1000
GROUP_ID=1000
```

### Pretty URLs & .htaccess

The template includes a default `.htaccess` with WordPress rewrite rules for pretty URLs.

### Table Prefix Management

For restoring databases with custom table prefixes:

```bash
WORDPRESS_TABLE_PREFIX=custom_
```

## Important Notes

- Always use `docker compose up -d` to start containers in background
- Use Just recipes instead of direct Docker commands
- Database backups go in `./backups/` and are excluded from Git
- WordPress core files in `./src/` should not be committed to Git
