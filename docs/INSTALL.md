# WordPress AI Workspace Installation Protocol

> Status: Template Development - Last Updated: July 22, 2025

This guide provides instructions for AI agents to help users set up a WordPress project using this template. The project uses [Just](https://github.com/casey/just) as the primary task runner for all operations.

## Table of Contents
0. [CRITICAL: Site-Specific Configuration Guidelines](#site-specific-guidelines)
1. [Prerequisites & Just Installation](#prerequisites)
2. [Project Information Collection](#project-information)
3. [Docker Environment Setup](#docker-environment)
4. [WordPress Installation](#wordpress-installation)
5. [Database & Backup Management](#database-backup)
6. [WP-CLI Integration](#wp-cli-integration)
7. [VSCode Tasks Configuration](#vscode-tasks)
8. [Testing & Verification](#testing-verification)
9. [Template Updates & Maintenance](#template-updates)
10. [Troubleshooting](#troubleshooting)

## Progress Tracking
- [ ] **Site-specific configuration guidelines read and understood**
- [ ] SITE_CONFIG.md created and customized
- [ ] Just task runner installed
- [ ] Project information collected
- [ ] Docker environment configured
- [ ] WordPress installed
- [ ] Database setup completed
- [ ] WP-CLI integration confirmed
- [ ] VSCode tasks configured
- [ ] Installation tested and verified
- [ ] Template update strategy documented

## 🚨 CRITICAL: Site-Specific Configuration Guidelines {#site-specific-guidelines}

**⚠️ READ THIS FIRST - TEMPLATE HYGIENE IS CRUCIAL FOR MAINTAINING MULTIPLE SITES**

### **DO NOT MODIFY THESE CORE TEMPLATE FILES:**
These files are synced across all sites and will be **OVERWRITTEN** during template updates:
- ❌ `README.md` (use site-specific documentation instead)
- ❌ `CLAUDE.md` (AI instructions are template-wide)
- ❌ `Justfile` (core commands are template-wide)
- ❌ `docker-compose.yml` (container configuration is template-wide)
- ❌ `docker/` directory (custom container is template-wide)
- ❌ `.gitignore` (version control rules are template-wide)
- ❌ `docs/` directory (documentation is template-wide)

### **SAFE FILES FOR SITE CUSTOMIZATION:**
These files are **NEVER OVERWRITTEN** and are safe for site-specific changes:
- ✅ `SITE_CONFIG.md` - **YOUR MAIN CUSTOMIZATION FILE**
- ✅ `.env` - Environment variables (excluded from syncing)
- ✅ `src/` - WordPress core and content files
- ✅ `uploads/` - Media files
- ✅ `backups/` - Database and file backups

### **MANDATORY: Create SITE_CONFIG.md First**

**BEFORE STARTING ANY WORK**, create and customize your site-specific configuration:

```bash
# This file is automatically created by the template
# Customize it immediately with your site details
cp SITE_CONFIG.md SITE_CONFIG.md.backup  # Just in case
nano SITE_CONFIG.md  # Edit with your site information
```

**Required Information to Document in SITE_CONFIG.md:**
- Site name and domain
- Database source and migration notes  
- Custom plugins and their purposes
- Theme information and customizations
- MCP integration requirements
- Deployment and maintenance notes
- Any custom Just commands added
- Development team and contact information

### **Template Update Strategy**

When template updates are released:

1. **Your site-specific files are PROTECTED** - never overwritten
2. **Template files are REPLACED** - your changes will be lost
3. **Custom additions should go in SITE_CONFIG.md** - always preserved
4. **Custom Just commands** - add to a separate `site-commands.just` file if needed

### **Site-Specific Customization Patterns**

#### **Custom Environment Variables**
Add to `.env` file (never overwritten):
```bash
# Site-specific variables
SITE_NAME="My Custom Site"
CUSTOM_FEATURE_ENABLED=true
DEV_EMAIL="developer@site.com"
```

#### **Custom Documentation**
Add to `SITE_CONFIG.md` (never overwritten):
```markdown
## Custom Features
- Feature 1: Description
- Feature 2: Description

## Custom Commands
- `just custom-deploy`: Deploys to staging
- `just backup-everything`: Full site backup
```

#### **Custom Just Commands** (Advanced)
If you need site-specific commands, create `site-commands.just`:
```bash
# Include in main Justfile with: include site-commands.just

# Custom deployment command
deploy-staging:
    @echo "Deploying to staging..."
    # Custom deployment logic
```

### **AI Agent Instructions for Site Setup**

When setting up any site from this template:

1. **FIRST**: Create and customize `SITE_CONFIG.md` with all site-specific information
2. **DOCUMENT**: All customizations in `SITE_CONFIG.md` - never in core template files
3. **PROTECT**: Ensure `.env` contains site-specific environment variables
4. **VERIFY**: Core template files remain unmodified for easy updates

### **Template Synchronization Protocol**

This template is maintained across multiple sites. Updates flow as follows:

```
wp_template (source) → site_example
                    → site_foo  
                    → site_bar
                    → site_baz
                    → site_qux
```

**During sync operations:**
- ✅ Core template files are updated
- ✅ New features and improvements are added
- ❌ Site-specific files are never touched
- ❌ Environment files (.env) are never overwritten
- ❌ Content (src/, uploads/, backups/) is never modified

## Prerequisites & Just Installation {#prerequisites}

Before starting the WordPress setup, ensure the Just task runner is installed. All project operations use Just for consistency and simplicity.

### Installing Just

**Option 1: Package Managers (Recommended)**
```bash
# macOS (Homebrew)
brew install just

# Ubuntu/Debian
wget -qO - 'https://proget.makedeb.org/debian-feeds/prebuilt-mpr/gpg' | gpg --dearmor | sudo tee /usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg 1> /dev/null
echo "deb [arch=all,amd64,arm64,armhf signed-by=/usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg] https://proget.makedeb.org prebuilt-mpr $(lsb_release -cs)" | sudo tee /etc/apt/sources.list.d/prebuilt-mpr.list
sudo apt update && sudo apt install just

# Arch Linux
sudo pacman -S just

# Windows (Scoop)
scoop install just

# Windows (Chocolatey)
choco install just
```

**Option 2: Binary Installation**
```bash
# Download and install to ~/bin (add ~/bin to PATH if needed)
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin

# Or download and install system-wide
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sudo bash -s -- --to /usr/local/bin
```

**Option 3: Cargo (if Rust is installed)**
```bash
cargo install just
```

### Verifying Installation
```bash
# Check if Just is installed
just --version

# Show all available commands for this project
just --list

# Get help for the project
just help
```

### Quick Start After Installation
Once Just is installed, you can set up the entire WordPress environment with:
```bash
# Complete project setup (creates .env, downloads WordPress, sets up directories)
just setup

# Start the WordPress environment
just up

# Open WordPress site in browser
just open-site
```

## Project Information

AI Agent: Ask the user for the following information to configure the project:

- [ ] **Admin Contact**: Email and name for WordPress admin
- [ ] **Domain Name**: Primary domain for the site
- [ ] **Website Name**: Display name for the site
- [ ] **Project Description**: Brief description of the site's purpose

Once collected, this information will be used to:
1. Update the README.md file with project details
2. Configure `CLAUDE.md` and `SITE_CONFIG.md` with project-specific instructions
3. Set up the initial WordPress configuration

Example collection dialogue:
```
AI: I'll help you set up your WordPress project. First, I need some basic information:
- What email address should be used for the WordPress admin account?
- What is the primary domain name for this site? (e.g., example.com)
- What is the display name for the website?
- Could you provide a brief description of the site's purpose?

User: [Provides information]

AI: Thank you! I'll use this information to configure your project.
```

## Docker Environment

- [ ] **Docker Compose Configuration**
  - Verify `docker-compose.yml` exists in the project root (included with template)
  - Configure services for WordPress and MySQL
  - Include optional PHP-FPM/Nginx configuration
  - Always use `just up` to start containers in detached mode (background)
  - This ensures the terminal isn't blocked while images are pulled and containers start

- [ ] **Environment Variables**
  - Create a `.env` file using `just setup-env`
  - Customize variables for database credentials, ports, etc. if needed

- [ ] **Network Configuration**
  - Configure internal network for container communication
  - Set up port mapping for local access

Example docker-compose.yml:
```yaml
version: '3'

services:
  # Database
  db:
    image: mysql:5.7
    volumes:
      - db_data:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    networks:
      - wordpress_network

  # WordPress (Apache)
  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    ports:
      - "${WP_PORT}:80"
    restart: always
    volumes:
      - ./src:/var/www/html
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: ${MYSQL_USER}
      WORDPRESS_DB_PASSWORD: ${MYSQL_PASSWORD}
      WORDPRESS_DB_NAME: ${MYSQL_DATABASE}
    networks:
      - wordpress_network

  # Alternative: WordPress with PHP-FPM and Nginx
  # Uncomment if preferred over Apache
  # wordpress_fpm:
  #   depends_on:
  #     - db
  #   image: wordpress:php8.1-fpm
  #   volumes:
  #     - ./src:/var/www/html
  #   restart: always
  #   environment:
  #     WORDPRESS_DB_HOST: db
  #     WORDPRESS_DB_USER: ${MYSQL_USER}
  #     WORDPRESS_DB_PASSWORD: ${MYSQL_PASSWORD}
  #     WORDPRESS_DB_NAME: ${MYSQL_DATABASE}
  #   networks:
  #     - wordpress_network
  
  # nginx:
  #   depends_on:
  #     - wordpress_fpm
  #   image: nginx:latest
  #   ports:
  #     - "${WP_PORT}:80"
  #   volumes:
  #     - ./src:/var/www/html
  #     - ./docker/nginx/conf.d:/etc/nginx/conf.d
  #   networks:
  #     - wordpress_network

  # phpMyAdmin
  phpmyadmin:
    depends_on:
      - db
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - '${PMA_PORT}:80'
    environment:
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    networks:
      - wordpress_network

networks:
  wordpress_network:

volumes:
  db_data:
```

Example .env file:
```
# Database settings
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=wordpress
MYSQL_USER=wordpress
MYSQL_PASSWORD=wordpress

# Port settings
WP_PORT=8080
PMA_PORT=8081
```

## WordPress Installation

- [ ] **New Installation**
  - Download latest WordPress files to `./src` directory
  - Configure wp-config.php with environment variables
  - Set up initial database structure

- [ ] **Existing Site Integration**
  - Import existing WordPress files to `./src` directory
  - Update configuration for local development
  - Handle path and URL adjustments

- [ ] **File Structure Organization**
  - Ensure proper permissions on WordPress files
  - Set up .gitignore for WordPress development
  - Configure .htaccess file for proper URL rewriting

### New Installation Commands

The template includes a Just recipe that handles WordPress installation:

```bash
# Download and set up WordPress automatically
just setup-wp

# Or run full setup (includes .env creation and backups directory)
just setup
```

Manual installation (if needed):
```bash
# Create src directory if it doesn't exist
mkdir -p src

# Download latest WordPress
curl -o wordpress.tar.gz https://wordpress.org/latest.tar.gz

# Extract to src directory
tar -xzf wordpress.tar.gz -C src --strip-components=1

# Remove the archive
rm wordpress.tar.gz

# Set proper permissions (or use: just fix-permissions)
chmod -R 755 src
find src -type d -exec chmod 755 {} \;
find src -type f -exec chmod 644 {} \;
```

### Existing Site Integration

For existing sites, the AI agent should:

1. Ask the user for connection details (FTP/SFTP/SSH)
2. Verify connection tools are installed
3. Download the site files to the ./src directory
4. Adjust configuration for local development

Example dialogue:
```
AI: Do you have an existing WordPress site you'd like to import?

User: Yes, I have an existing site.

AI: Great! I'll need some connection details to import your site:
- What's the connection method? (FTP, SFTP, SSH)
- What's the hostname or IP address?
- What are the username and password?
- What's the remote path to the WordPress installation?

User: [Provides information]

AI: Thank you! I'll now check if the necessary tools are installed and proceed with importing your site.
```

### .htaccess Configuration

The `.htaccess` file is essential for WordPress URL rewriting but should not be committed to Git. Create it with the following default content for WordPress running in Docker with Apache:

```
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
```

Create this file in the `./src` directory after WordPress installation:

```bash
# Create .htaccess file with proper WordPress rewrite rules
cat > src/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
EOF
```

Note: Ensure `.htaccess` is added to your `.gitignore` file to prevent it from being committed to version control.

## Database & Backup Management

- [ ] **Backup Directory Setup**
  - Create `./backups` directory if it doesn't exist
  - Add README.md explaining backup file formats

- [ ] **Backup Validation**
  - Implement checks to validate SQL backup files
  - Provide commands to inspect backup headers

- [ ] **Database Import/Export**
  - Include commands for importing backups
  - Document export procedures for local development

### Backup Directory Setup

```bash
# Create backups directory
mkdir -p backups

# Create README.md in backups directory
cat > backups/README.md << 'EOF'
# WordPress Database Backups

This directory is for storing WordPress database backups.

## Supported Formats
- SQL files (.sql)
- Compressed SQL files (.sql.gz, .sql.zip)

Place your database backups in this directory, and the AI agent will help you import them into your local development environment.
EOF
```

### Backup Validation Commands

```bash
# Check if a file is a valid SQL backup (shows first 10 lines)
head -n 10 backups/your-backup-file.sql

# For compressed files
zcat backups/your-backup-file.sql.gz | head -n 10
unzip -p backups/your-backup-file.sql.zip | head -n 10
```

### Database Import Commands

```bash
# Import SQL file into Docker MySQL container
docker-compose exec -T db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < backups/your-backup-file.sql

# Import compressed SQL file
zcat backups/your-backup-file.sql.gz | docker-compose exec -T db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE}
```

## WP-CLI Integration

- [ ] **Installation**
  - Provide instructions for installing WP-CLI
  - Configure Docker to include WP-CLI

- [ ] **Essential Commands**
  - Document common WP-CLI commands for site management
  - Include examples for plugin/theme management

- [ ] **Custom Scripts**
  - Create helper scripts in `./bin` directory
  - Document usage of these scripts

### WP-CLI Installation

WP-CLI will be available inside the WordPress container. Create a shell script to make it easier to use:

```bash
# Create bin directory
mkdir -p bin

# Create wp-cli.sh script
cat > bin/wp-cli.sh << 'EOF'
#!/bin/bash
docker-compose exec wordpress wp "$@"
EOF

# Make the script executable
chmod +x bin/wp-cli.sh
```

### Essential WP-CLI Commands

```bash
# Check WordPress version
./bin/wp-cli.sh core version

# Install a plugin
./bin/wp-cli.sh plugin install plugin-name --activate

# Update all plugins
./bin/wp-cli.sh plugin update --all

# List installed themes
./bin/wp-cli.sh theme list

# Create a new user
./bin/wp-cli.sh user create username email@example.com --role=administrator
```

## VSCode Tasks Configuration

- [ ] **Task Configuration**
  - Create `.vscode/tasks.json` file
  - Configure tasks for common operations

- [ ] **Docker Tasks**
  - Start/stop Docker environment
  - View Docker logs

- [ ] **WordPress Tasks**
  - Run WP-CLI commands
  - Manage plugins/themes

Example tasks.json:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start WordPress Environment",
      "type": "shell",
      "command": "docker-compose up -d",
      "detail": "Starts WordPress containers in detached mode (background)",
      "problemMatcher": []
    },
    {
      "label": "Stop WordPress Environment",
      "type": "shell",
      "command": "docker-compose down",
      "problemMatcher": []
    },
    {
      "label": "View WordPress Logs",
      "type": "shell",
      "command": "docker-compose logs -f wordpress",
      "problemMatcher": []
    },
    {
      "label": "Open WordPress Site",
      "type": "shell",
      "command": "open http://localhost:${WP_PORT:-8080}",
      "problemMatcher": []
    },
    {
      "label": "Open phpMyAdmin",
      "type": "shell",
      "command": "open http://localhost:${PMA_PORT:-8081}",
      "problemMatcher": []
    },
    {
      "label": "Run WP-CLI Command",
      "type": "shell",
      "command": "./bin/wp-cli.sh",
      "args": [
        {
          "description": "WP-CLI Command",
          "value": "core version"
        }
      ],
      "problemMatcher": []
    }
  ]
}
```

## Testing & Verification

- [ ] **Environment Check**
  - Verify Docker containers are running
  - Check database connection

- [ ] **WordPress Check**
  - Verify WordPress is accessible at http://localhost:8080
  - Confirm admin login works

- [ ] **Functionality Check**
  - Test basic WordPress functionality
  - Verify file permissions and ownership

### Starting the Environment

```bash
# Start Docker containers in detached mode (background)
# The -d flag ensures containers run in the background and control returns to terminal immediately
docker-compose up -d

# This command will start all services and pull any required images in the background
# You can continue working in the terminal while images are being downloaded
```

### Environment Check Commands

```bash
# Check if Docker containers are running
docker-compose ps

# Check database connection
docker-compose exec db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SHOW DATABASES;"
```

### WordPress Check

The AI agent should guide the user to:

1. Open http://localhost:8080 in a browser
2. Verify the WordPress site loads correctly
3. Access the admin area at http://localhost:8080/wp-admin
4. Log in with the configured credentials

## Template Updates & Maintenance {#template-updates}

### **Understanding Template Updates**

This WordPress template is actively maintained and improved. Updates include:
- Security patches and improvements
- New features and tools
- Documentation enhancements
- Bug fixes and optimizations
- Container updates (WP-CLI, Composer versions)

### **Update Safety Guarantees**

When template updates are applied to your site:

**✅ ALWAYS SAFE (Never Modified):**
- `SITE_CONFIG.md` - Your site-specific documentation
- `.env` - Your environment variables and passwords
- `src/` - Your WordPress files and content
- `uploads/` - Your media files
- `backups/` - Your database and file backups

**⚠️ ALWAYS UPDATED (Your Changes Lost):**
- `README.md` - Template documentation
- `CLAUDE.md` - AI agent instructions  
- `Justfile` - Core commands and recipes
- `docker-compose.yml` - Container configuration
- `docker/` - Custom container definitions
- `.gitignore` - Version control rules
- `docs/` - All template documentation

### **Pre-Update Checklist**

Before any template update, ensure:

1. **Site configuration is documented** in `SITE_CONFIG.md`
2. **Environment variables are in `.env`** (never in template files)
3. **Custom changes are noted** in `SITE_CONFIG.md`
4. **Recent backups exist** of database and uploads
5. **No modifications made** to core template files

### **Post-Update Verification**

After template updates:

1. **Review new features** in updated `README.md`
2. **Check for new commands** with `just --list`
3. **Test environment** with `just status`
4. **Verify MCP functionality** with `just mcp-status`
5. **Update SITE_CONFIG.md** with any new relevant information

### **Custom Command Integration**

If you need site-specific commands that survive updates:

**Option 1: Document in SITE_CONFIG.md**
```markdown
## Custom Commands
Run these manually as needed:
- Database sync: `docker-compose exec wordpress wp db import ~/custom-backup.sql`
- Deploy to staging: `rsync -av src/ user@staging.server:/var/www/html/`
```

**Option 2: Create site-commands.just (Advanced)**
```bash
# Create site-commands.just file
# Add to main Justfile with: include site-commands.just

# Custom site-specific commands
deploy-staging:
    @echo "Deploying to staging server..."
    rsync -av src/ user@staging.server:/var/www/html/

custom-backup:
    @echo "Creating full site backup..."
    just db-export
    just uploads-backup
    tar -czf "backups/full-site-$(date +%Y%m%d).tar.gz" backups/ src/wp-content/themes/
```

### **Template Version Tracking**

Track template versions in `SITE_CONFIG.md`:
```markdown
## Template Version History
- 2025-07-24: Updated to custom container with pre-installed tools
- 2025-07-22: Added MCP integration
- 2025-07-20: Initial template deployment
```

### **Template Synchronization System**

This template includes an automated synchronization system for maintaining multiple WordPress sites:

**Sync Script Location:** `scripts/sync-template.sh`

**Basic Usage:**
```bash
# From the template directory
./scripts/sync-template.sh

# Dry run to preview changes
./scripts/sync-template.sh --dry-run

# Force sync without confirmation
./scripts/sync-template.sh --force
```

**For detailed information about template synchronization, see:** `docs/TEMPLATE_SYNC.md`

The sync system ensures:
- Template improvements flow to all sites automatically
- Site-specific customizations are never overwritten
- Consistent tool versions across all instances
- Safe, reversible updates with verification

## Troubleshooting

Common issues and their solutions will be documented here as they are encountered.

### Docker Issues

- **Port conflicts**: If ports 8080 or 8081 are already in use, edit the .env file to use different ports.
  ```
  WP_PORT=8090
  PMA_PORT=8091
  ```

- **Container startup failures**: Check Docker logs for specific error messages.
  ```bash
  docker-compose logs
  ```

### WordPress Issues

- **Database connection errors**: Verify database credentials in .env file and wp-config.php.

- **File permission problems**: Reset permissions with:
  ```bash
  chmod -R 755 src
  find src -type d -exec chmod 755 {} \;
  find src -type f -exec chmod 644 {} \;
  ```

### Development Environment Issues

- **VSCode configuration problems**: Ensure the .vscode directory and tasks.json file are properly configured.

- **Git integration issues**: Make sure .gitignore is properly set up to exclude sensitive files.
  ```
  # WordPress core files to ignore
  .htaccess
  wp-config.php
  wp-content/uploads/
  wp-content/upgrade/
  
  # Environment files
  .env
  
  # Database backups
  backups/*.sql
  backups/*.sql.gz
  backups/*.sql.zip
  
  # Docker volumes
  db_data/
  ```

---

*Note: This guide is part of the WordPress AI Workspace Template. As you work through these steps, mark them as completed and document any issues or improvements to help future users.*
