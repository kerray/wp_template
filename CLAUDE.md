# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## WordPress AI Workspace Template

This is a Docker-based WordPress development environment template designed for AI agents (Cline, Roo, Claude Code) to set up and manage WordPress projects efficiently.

## Key Commands

### Docker Environment Management
```bash
# Start WordPress environment (detached mode)
docker-compose up -d

# Stop WordPress environment
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f wordpress
docker-compose logs -f db
```

### WordPress Management via WP-CLI
All WP-CLI commands should be run through the wrapper script:

```bash
# WordPress version and basic info
./bin/wp-cli.sh core version

# Plugin management
./bin/wp-cli.sh plugin list
./bin/wp-cli.sh plugin install [plugin-name] --activate
./bin/wp-cli.sh plugin update --all

# Theme management
./bin/wp-cli.sh theme list
./bin/wp-cli.sh theme activate [theme-name]

# User management
./bin/wp-cli.sh user list
./bin/wp-cli.sh user create [username] [email] --role=administrator
```

### Database Operations
```bash
# Export database
docker-compose exec db mysqldump -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} > backups/backup-$(date +%Y-%m-%d).sql

# Import database
docker-compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress} < backups/your-backup-file.sql

# Import compressed database
zcat backups/backup.sql.gz | docker-compose exec -T db mysql -u${MYSQL_USER:-wordpress} -p${MYSQL_PASSWORD:-wordpress} ${MYSQL_DATABASE:-wordpress}
```

### VSCode Tasks
The project includes pre-configured VSCode tasks accessible via Command Palette (Ctrl+Shift+P → "Tasks: Run Task"):
- Start/Stop/Restart WordPress Environment
- View WordPress/Database Logs
- Open WordPress Site (localhost:8080)
- Open phpMyAdmin (localhost:8081)
- Run WP-CLI Commands
- Install WordPress Plugins
- Export/Import Database

## Project Architecture

### Directory Structure
```
├── .vscode/          # VSCode configuration and tasks
├── bin/              # Utility scripts
│   ├── wp-cli.sh     # WP-CLI wrapper for Docker
│   └── *.sh          # Additional utility scripts
├── backups/          # Database backup storage
├── docker/           # Docker configuration files
│   ├── nginx/        # Nginx configuration (if using PHP-FPM)
│   └── php/          # PHP configuration
├── memlog/           # Project progress and planning logs
├── prompts/          # AI agent instructions
│   └── INSTALL.md    # Detailed installation protocol
├── src/              # WordPress source files (mounted to container)
└── tests/            # Test files
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
1. Create `.env` file with database credentials
2. Start Docker environment: `docker-compose up -d`
3. Download WordPress core to `./src/` directory
4. Access site at `http://localhost:8080`
5. Complete WordPress setup wizard

### Existing Site Import
1. Use utility scripts in `./bin/` to download existing site files
2. Import database backup to `./backups/` directory
3. Import database using Docker command
4. Update WordPress URLs for local development

### Custom Development
- **Themes**: Place in `./src/wp-content/themes/`
- **Plugins**: Place in `./src/wp-content/plugins/`
- **Uploads**: Excluded from Git via `.gitignore`
- **Config**: `wp-config.php` is auto-generated and excluded from Git

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