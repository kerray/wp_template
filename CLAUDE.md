# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## WordPress AI Workspace Template

This is a Docker-based WordPress development environment template designed for AI agents (Cline, Roo, Claude Code) to set up and manage WordPress projects efficiently.

## Task Runner: Just

This project uses [Just](https://github.com/casey/just) as the primary task runner for all operations. Just provides a simple, consistent interface for all project tasks.

### Installation
```bash
# Install Just (if not already installed)
# On macOS:
brew install just

# On Ubuntu/Debian:
wget -qO - 'https://proget.makedeb.org/debian-feeds/prebuilt-mpr/gpg' | gpg --dearmor | sudo tee /usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg 1> /dev/null
echo "deb [arch=all,amd64,arm64,armhf signed-by=/usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg] https://proget.makedeb.org prebuilt-mpr $(lsb_release -cs)" | sudo tee /etc/apt/sources.list.d/prebuilt-mpr.list
sudo apt update && sudo apt install just

# Or download binary from GitHub releases
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin
```

### Quick Start
```bash
# Show all available commands
just

# Initialize new project
just setup

# Start WordPress environment
just up

# Open WordPress in browser
just open-site
```

## Key Commands

### Environment Management
```bash
# Start WordPress environment (detached mode)
just up

# Stop WordPress environment
just down

# Restart services
just restart

# Show container status
just status

# View logs
just logs
just logs db        # specific service logs
just logs-all       # all container logs
```

### WordPress Management via WP-CLI
All WP-CLI commands are run through the Just task runner:

```bash
# WordPress version and basic info
just wp "core version"
just core-version    # shorthand

# Plugin management
just plugin-list
just plugin-install [plugin-name]
just plugin-update-all

# Theme management
just theme-list
just theme-activate [theme-name]

# User management
just user-list
just user-create [username] [email] [role]
```

### Database Operations
```bash
# Export database
just db-export

# Import database
just db-import filename.sql
just db-import-gz filename.sql.gz

# List available backups
just db-list-backups

# Test database connection
just db-test
```

### Development Tools
```bash
# Open WordPress site in browser
just open-site

# Open phpMyAdmin in browser
just open-phpmyadmin

# Fix file permissions
just fix-permissions

# Show project information
just info

# Get help
just help
```

### Media/Uploads Management
```bash
# Create backup of uploads directory
just uploads-backup

# Restore uploads from backup
just uploads-restore filename.tar.gz

# List available uploads backups
just uploads-list-backups

# Set up uploads directory (included in setup)
just setup-uploads
```

### VSCode Integration
The project includes pre-configured VSCode tasks that call Just recipes. Access via Command Palette (Ctrl+Shift+P → "Tasks: Run Task"):
- Start/Stop/Restart WordPress Environment (calls `just up/down/restart`)
- View WordPress/Database Logs (calls `just logs`)
- Open WordPress Site/phpMyAdmin (calls `just open-site/open-phpmyadmin`)
- Run WP-CLI Commands (calls `just wp`)
- Database Operations (calls `just db-export/db-import`)

All VSCode tasks are thin wrappers around Just recipes for consistency.

## Project Architecture

### Directory Structure
```
├── .vscode/          # VSCode configuration and tasks
├── backups/          # Database and uploads backup storage
├── bin/              # Utility scripts (legacy - use Just instead)
├── docker/           # Docker configuration files
│   ├── nginx/        # Nginx configuration (if using PHP-FPM)
│   └── php/          # PHP configuration
├── memlog/           # Project progress and planning logs
├── prompts/          # AI agent instructions
│   └── INSTALL.md    # Detailed installation protocol
├── src/              # WordPress source files (mounted to container)
├── tests/            # Test files
├── uploads/          # WordPress media files (mounted separately)
├── Justfile          # Task runner commands
└── docker-compose.yml # Docker services configuration
```

### Docker Services
- **wordpress**: Main WordPress container (Apache + PHP)
- **db**: MySQL 5.7 database
- **phpmyadmin**: Database management interface
- **wordpress_fpm** (optional): PHP-FPM alternative to Apache
- **nginx** (optional): Reverse proxy for PHP-FPM

### Environment Variables
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
```

## Development Workflow

### New WordPress Installation
1. Run `just setup` to create `.env`, download WordPress, and set up directories
2. Start Docker environment: `just up`
3. Access site at `http://localhost:8080`
4. Complete WordPress setup wizard

### Existing Site Import
1. Use upload scripts or manual FTP/SSH to download existing site files to `./src/`
2. Copy media files to `./uploads/` directory
3. Import database backup: `just db-import filename.sql`
4. Update WordPress URLs for local development

### Custom Development
- **Themes**: Place in `./src/wp-content/themes/`
- **Plugins**: Place in `./src/wp-content/plugins/`
- **Uploads**: Stored in `./uploads/` directory (mounted to container)
- **Config**: `wp-config.php` is auto-generated and excluded from Git

### Media File Management
The `./uploads/` directory is mounted separately from WordPress core files:
- **Persistent**: Media files survive container restarts and rebuilds
- **Backupable**: Use `just uploads-backup` to create media backups
- **Portable**: Can be synced/copied independently of WordPress core
- **Performance**: Large media files don't affect WordPress core git operations

## AI Agent Workflow

### Installation Protocol
Follow the detailed installation guide in `prompts/INSTALL.md` which includes:
1. Project information collection
2. Docker environment setup
3. WordPress installation (new or existing)
4. Database and backup management
5. VSCode tasks configuration
6. Testing and verification

### Project Planning
Use `memlog/` directory for:
- Planning documents (`*-plan.md`)
- Progress tracking with datetime stamps
- Documentation of completed work
- Issue tracking and resolution

### Important Notes
- Always use `docker-compose up -d` to start containers in background
- Use `./bin/wp-cli.sh` wrapper instead of direct WP-CLI commands
- Database backups go in `./backups/` and are excluded from Git
- WordPress core files in `./src/` should not be committed to Git
- The `wp-sites.json` file (copied from `wp-sites.example.json`) contains site connection details and is excluded from Git

## Configuration Files

### .clinerules
Contains AI agent instructions emphasizing:
- Template-based development approach
- Use of `./memlog/` for progress tracking
- Multi-role AI agent coordination
- Documentation-driven development

### VSCode Integration
Pre-configured tasks for all common WordPress development operations including Docker management, WP-CLI commands, and database operations.