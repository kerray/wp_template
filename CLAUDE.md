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
# Build custom WordPress container (first time or after changes)
just build

# Rebuild and restart environment
just rebuild

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
WP-CLI is pre-installed in our custom container. All commands are run through the Just task runner:

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

# Pre-installed tool verification
just wp-install           # Verify WP-CLI installation
just wp-install-composer  # Verify Composer installation
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

# Fix file permissions (local files only)
just fix-permissions

# Fix WordPress update permissions in Docker container
just fix-update-permissions

# Fix all permissions (local + Docker container)
just fix-all-permissions

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
- **wordpress**: Custom WordPress AI Development container (Apache + PHP + WP-CLI + Composer + MCP Plugin)
- **db**: MySQL 5.7 database
- **phpmyadmin**: Database management interface
- **wordpress_fpm** (optional): PHP-FPM alternative to Apache
- **nginx** (optional): Reverse proxy for PHP-FPM

### Custom WordPress Container Features
Our custom WordPress container extends the official WordPress image with pre-installed development tools:
- **WP-CLI**: Command-line interface for WordPress management
- **Composer**: PHP dependency manager for plugin/theme development
- **WordPress MCP Plugin**: Pre-installed and ready for AI agent integration
- **Development Tools**: Git, Vim, Nano, and other essential utilities

All tool versions are configurable via environment variables in your `.env` file.

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

# Development Tool Versions (for custom container)
COMPOSER_VERSION=2.7.1    # PHP Composer version
WP_CLI_VERSION=2.11.0     # WP-CLI version
WP_MCP_VERSION=0.2.3      # WordPress MCP Plugin version
```

## WordPress Installation Workflows

This template supports three main installation scenarios. Choose the workflow that matches your needs.

### 🆕 Scenario 1: New WordPress Installation (Blank Site)

**Complete step-by-step process for creating a fresh WordPress site:**

1. **Initial Setup**
   ```bash
   just setup              # Creates .env, downloads WordPress core, sets up directories
   just build              # Builds custom container (first time only)
   just up                 # Starts Docker environment
   ```

2. **WordPress Installation Options**

   **Option A: Via Web Interface (Recommended)**
   ```bash
   just open-site          # Opens http://localhost:8080 in browser
   # Complete WordPress setup wizard:
   # - Site Title, Username, Password, Email
   # - Note: Database connection is automatic
   ```

   **Option B: Via WP-CLI (Automated)**
   ```bash
   just wp "core install --url=http://localhost:8080 --title='Your Site Title' --admin_user=admin --admin_password=secure_password --admin_email=your@email.com"
   ```

3. **Post-Installation Setup**
   ```bash
   just mcp-install        # Activates WordPress MCP plugin for AI integration
   just urls-check         # Verify URLs are correct for local development
   just fix-all-permissions # Ensure proper file permissions
   ```

4. **Verification**
   ```bash
   just status             # Check all containers are running
   just wp "core version"  # Verify WordPress is installed
   just mcp-status         # Confirm MCP plugin is active
   ```

5. **MCP Token Setup** (for AI integration)
   - Access: http://localhost:8080/wp-admin
   - Navigate: Settings > WordPress MCP > Authentication Tokens
   - Generate JWT token (1-24 hours recommended)
   - Configure your AI client with the token

### 🔄 Scenario 2: Restore from Database Backup

**For sites where you have a database backup (.sql/.sql.gz) but need fresh WordPress core:**

1. **Initial Setup**
   ```bash
   just setup              # Sets up environment
   just build              # Builds custom container
   ```

2. **Database Restoration**
   ```bash
   just up                 # Start containers
   # Wait for database to be ready (about 30 seconds)
   just db-import backup-filename.sql        # For .sql files
   # OR
   just db-import-gz backup-filename.sql.gz  # For compressed files
   ```

3. **URL Configuration**
   ```bash
   # Update URLs for local development
   just urls-update        # Sets to http://localhost:8080
   # OR manually replace if needed:
   just urls-replace "old-domain.com" "localhost:8080"
   ```

4. **WordPress Core Update** (if backup is from different WP version)
   ```bash
   just wp "core update"
   just wp "core update-db"  # Update database if needed
   ```

5. **Plugin & Media Setup**
   ```bash
   just mcp-install        # Install MCP plugin
   just plugin-update-all  # Update all plugins
   just fix-all-permissions # Fix permissions
   ```

6. **Media Files** (if available)
   ```bash
   # Copy media files to uploads directory
   cp -r /path/to/old-site/wp-content/uploads/* uploads/
   # OR restore from uploads backup
   just uploads-restore uploads-backup-filename.tar.gz
   ```

### 📥 Scenario 3: Complete Site Migration (Files + Database)

**For migrating a complete existing WordPress site with files and database:**

1. **Preparation**
   ```bash
   just setup              # Initialize template
   just build              # Build custom container
   ```

2. **File Migration**
   ```bash
   # Copy WordPress core and content files
   rsync -av user@remote-server:/path/to/wordpress/ src/
   # OR manually download and extract
   
   # Copy media files separately for better organization
   rsync -av user@remote-server:/path/to/wordpress/wp-content/uploads/ uploads/
   # OR extract from archive
   ```

3. **Database Migration**
   ```bash
   just up                 # Start environment
   # Export database from remote server:
   # ssh user@remote-server "mysqldump -u user -p database_name > site-backup.sql"
   # Copy the backup file to ./backups/ directory
   
   just db-import site-backup.sql
   ```

4. **Configuration Updates**
   ```bash
   # Update wp-config.php if needed (usually automatic)
   # Update URLs for local development
   just urls-replace "production-domain.com" "localhost:8080"
   
   # Clear any caching if plugins are installed
   just wp "cache flush" 2>/dev/null || echo "No cache to flush"
   ```

5. **Plugin & Permission Setup**
   ```bash
   just plugin-update-all   # Update plugins for compatibility
   just mcp-install        # Add MCP plugin for AI integration
   just fix-all-permissions # Ensure proper file permissions
   
   # Verify installation
   just wp "search-replace --dry-run 'production-domain.com' 'localhost:8080'"
   ```

6. **Final Verification**
   ```bash
   just open-site          # Check site loads correctly
   just mcp-status         # Verify MCP plugin is active
   just wp "user list"     # Verify user accounts migrated
   ```

### 🔧 Post-Installation Tasks (All Scenarios)

**Essential tasks to complete after any installation:**

1. **Security Hardening**
   ```bash
   # Change default admin password if using automated install
   just wp "user update admin --user_pass=new_secure_password"
   
   # Remove default plugins if not needed
   just wp "plugin delete hello akismet" # Optional
   ```

2. **Development Configuration**
   ```bash
   # Enable debug mode (already in .env)
   just wp "config set WP_DEBUG true --type=constant"
   just wp "config set WP_DEBUG_LOG true --type=constant"
   ```

3. **Backup Strategy Setup**
   ```bash
   # Create initial backups
   just db-export          # Creates database backup
   just uploads-backup     # Creates media backup
   
   # List available backups
   just db-list-backups
   just uploads-list-backups
   ```

4. **MCP Integration Setup**
   ```bash
   # Get token generation instructions
   just mcp-token-info
   
   # Test MCP endpoints
   just mcp-test-endpoints
   
   # Show client configuration examples
   just mcp-client-config
   ```

### 🚨 Common Issues & Solutions

**Container Build Issues**
```bash
# Force rebuild without cache
just rebuild

# Check container logs
just logs wordpress
```

**Database Connection Issues**
```bash
# Wait longer for database to start
sleep 30 && just wp "db check"

# Test database connection
just db-test
```

**Permission Issues**
```bash
# Fix all permission problems
just fix-all-permissions

# Specific WordPress update permissions
just fix-update-permissions
```

**URL Issues After Migration**
```bash
# Check current URLs
just urls-check

# Update all URLs in database
just wp "search-replace 'old-domain.com' 'localhost:8080' --dry-run"
just wp "search-replace 'old-domain.com' 'localhost:8080'"
```

**Plugin Issues**
```bash
# Deactivate all plugins temporarily
just wp "plugin deactivate --all"

# Reactivate one by one to find problematic plugin
just wp "plugin activate plugin-name"
```

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

## WordPress MCP (Model Context Protocol) Integration

This WordPress installation includes the [WordPress MCP Plugin](https://github.com/Automattic/wordpress-mcp) (v0.2.3) which enables AI agents to interact with WordPress through standardized MCP interfaces.

### MCP Plugin Status
- **Plugin Location**: `src/wp-content/plugins/wordpress-mcp/`
- **Status**: Active
- **Version**: 0.2.3

### Available MCP Features
- 🔄 **Dual Transport Protocols**: STDIO and HTTP-based (Streamable) transports
- 🔐 **JWT Authentication**: Secure token-based authentication with management UI
- 🎛️ **Admin Interface**: React-based token management at `Settings > WordPress MCP`
- 🤖 **AI-Friendly APIs**: JSON-RPC 2.0 compliant endpoints for AI integration
- 🧪 **Experimental REST API CRUD Tools**: Generic tools for any WordPress REST API endpoint

### MCP Endpoints
- **STDIO Transport**: `/wp/v2/wpmcp` (WordPress-style format)
- **Streamable Transport**: `/wp/v2/wpmcp/streamable` (JSON-RPC 2.0 format)

### Claude Code MCP Configuration

To connect Claude Code to this WordPress MCP server:

1. **Generate JWT Token** (manual step):
   - Access WordPress admin at http://localhost:8080/wp-admin/
   - Navigate to `Settings > WordPress MCP > Authentication Tokens`
   - Select token duration (1-24 hours)
   - Click "Generate New Token"
   - Copy the generated JWT token

2. **Configure Claude Code**:
   ```bash
   # Copy the template configuration
   cp claude_mcp_config.json ~/.config/claude/claude_desktop_config.json
   
   # Edit the configuration file and replace YOUR_JWT_TOKEN_HERE with your actual JWT token
   # The configuration points to: http://localhost:8080/
   ```

3. **Restart Claude Code** to load the MCP configuration

### MCP Configuration Template
```json
{
  "mcpServers": {
    "wordpress-mcp": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://localhost:8080/",
        "JWT_TOKEN": "YOUR_JWT_TOKEN_HERE",
        "LOG_FILE": "/home/kerray/site_waldorf/logs/wordpress-mcp.log"
      }
    }
  }
}
```

### Available MCP Tools
Once configured, the following WordPress operations become available through MCP:
- **Plugin Management**: List, install, activate, deactivate plugins
- **Theme Management**: List, install, activate themes
- **Post/Page Management**: Create, read, update, delete content
- **User Management**: List, create, update users
- **Media Management**: Upload, list, manage media files
- **Site Information**: Get WordPress version, settings, configuration

### Testing MCP Connection
After configuration, test the connection with:
```bash
# Using Claude Code's MCP interface
/mcp

# Or test with MCP Inspector (if available)
npx @modelcontextprotocol/inspector \
  -e WP_API_URL=http://localhost:8080/ \
  -e JWT_TOKEN=your-jwt-token-here \
  npx @automattic/mcp-wordpress-remote@latest
```

### Security Notes
- JWT tokens expire automatically (1-24 hours)
- Tokens inherit the generating user's WordPress capabilities
- Never commit JWT tokens to repositories
- Regularly revoke unused tokens through WordPress admin

## Vibe tools
vibe-tools is a CLI tool that allows you to interact with AI models and other tools.
vibe-tools is installed on this machine and it is available to you to execute. You're encouraged to use it.

<vibe-tools Integration>
# Instructions
Use the following commands to get AI assistance:

**Direct Model Queries:**
`vibe-tools ask "<your question>" --provider <provider> --model <model>` - Ask any model from any provider a direct question (e.g., `vibe-tools ask "What is the capital of France?" --provider openai --model o3-mini`). Note that this command is generally less useful than other commands like `repo` or `plan` because it does not include any context from your codebase or repository. In general you should not use the ask command because it does not include any context. The other commands like `web`, `doc`, `repo`, or `plan` are usually better. If you are using it, make sure to include in your question all the information and context that the model might need to answer usefully.

**Ask Command Options:**
--provider=<provider>: AI provider to use (openai, anthropic, perplexity, gemini, modelbox, openrouter, or xai)
--model=<model>: Model to use (required for the ask command)
--reasoning-effort=<low|medium|high>: Control the depth of reasoning for supported models (OpenAI o1/o3-mini models and Claude 3.7 Sonnet). Higher values produce more thorough responses for complex questions.

**Implementation Planning:**
`vibe-tools plan "<query>"` - Generate a focused implementation plan using AI (e.g., `vibe-tools plan "Add user authentication to the login page"`)
The plan command uses multiple AI models to:
1. Identify relevant files in your codebase (using Gemini by default)
2. Extract content from those files
3. Generate a detailed implementation plan (using OpenAI o3-mini by default)

**Plan Command Options:**
--fileProvider=<provider>: Provider for file identification (gemini, openai, anthropic, perplexity, modelbox, openrouter, or xai)
--thinkingProvider=<provider>: Provider for plan generation (gemini, openai, anthropic, perplexity, modelbox, openrouter, or xai)
--fileModel=<model>: Model to use for file identification
--thinkingModel=<model>: Model to use for plan generation
--with-doc=<doc_url>: Fetch content from a document URL and include it as context for both file identification and planning (e.g., `vibe-tools plan "implement feature X following the spec" --with-doc=https://example.com/feature-spec`)

**Web Search:**
`vibe-tools web "<your question>"` - Get answers from the web using a provider that supports web search (e.g., Perplexity models and Gemini Models either directly or from OpenRouter or ModelBox) (e.g., `vibe-tools web "latest shadcn/ui installation instructions"`)
Note: web is a smart autonomous agent with access to the internet and an extensive up to date knowledge base. Web is NOT a web search engine. Always ask the agent for what you want using a proper sentence, do not just send it a list of keywords. In your question to web include the context and the goal that you're trying to acheive so that it can help you most effectively.
when using web for complex queries suggest writing the output to a file somewhere like local-research/<query summary>.md.

**Web Command Options:**
--provider=<provider>: AI provider to use (perplexity, gemini, modelbox, or openrouter)

**Repository Context:**
`vibe-tools repo "<your question>" [--subdir=<path>] [--from-github=<username/repo>] [--with-doc=<doc_url>]` - Get context-aware answers about this repository using Google Gemini (e.g., `vibe-tools repo "explain authentication flow"`). Use the optional `--subdir` parameter to analyze a specific subdirectory instead of the entire repository (e.g., `vibe-tools repo "explain the code structure" --subdir=src/components`). Use the optional `--from-github` parameter to analyze a remote GitHub repository without cloning it locally (e.g., `vibe-tools repo "explain the authentication system" --from-github=username/repo-name`). Use the optional `--with-doc` parameter to include content from a URL as additional context (e.g., `vibe-tools repo "implement feature X following the design spec" --with-doc=https://example.com/design-spec`).

**Documentation Generation:**
`vibe-tools doc [options] [--with-doc=<doc_url>]` - Generate comprehensive documentation for this repository (e.g., `vibe-tools doc --output docs.md`). Can incorporate document context from a URL (e.g., `vibe-tools doc --with-doc=https://example.com/existing-docs`).

**YouTube Video Analysis:**
`vibe-tools youtube "<youtube-url>" [question] [--type=<summary|transcript|plan|review|custom>]` - Analyze YouTube videos and generate detailed reports (e.g., `vibe-tools youtube "https://youtu.be/43c-Sm5GMbc" --type=summary`)
Note: The YouTube command requires a `GEMINI_API_KEY` to be set in your environment or .vibe-tools.env file as the GEMINI API is the only interface that supports YouTube analysis.

**GitHub Information:**
`vibe-tools github pr [number]` - Get the last 10 PRs, or a specific PR by number (e.g., `vibe-tools github pr 123`)
`vibe-tools github issue [number]` - Get the last 10 issues, or a specific issue by number (e.g., `vibe-tools github issue 456`)

**ClickUp Information:**
`vibe-tools clickup task <task_id>` - Get detailed information about a ClickUp task including description, comments, status, assignees, and metadata (e.g., `vibe-tools clickup task "task_id"`)

**Model Context Protocol (MCP) Commands:**
Use the following commands to interact with MCP servers and their specialized tools:
`vibe-tools mcp search "<query>"` - Search the MCP Marketplace for available servers that match your needs (e.g., `vibe-tools mcp search "git repository management"`)
`vibe-tools mcp run "<query>"` - Execute MCP server tools using natural language queries (e.g., `vibe-tools mcp run "list files in the current directory" --provider=openrouter`). The query must include sufficient information for vibe-tools to determine which server to use, provide plenty of context.

The `search` command helps you discover servers in the MCP Marketplace based on their capabilities and your requirements. The `run` command automatically selects and executes appropriate tools from these servers based on your natural language queries. If you want to use a specific server include the server name in your query. E.g. `vibe-tools mcp run "using the mcp-server-sqlite list files in directory --provider=openrouter"`

**Notes on MCP Commands:**
- MCP commands require `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` to be set in your environment
- By default the `mcp` command uses Anthropic, but takes a --provider argument that can be set to 'anthropic' or 'openrouter'
- Results are streamed in real-time for immediate feedback
- Tool calls are automatically cached to prevent redundant operations
- Often the MCP server will not be able to run because environment variables are not set. If this happens ask the user to add the missing environment variables to the cursor tools env file at ~/.vibe-tools/.env

**Stagehand Browser Automation:**
`vibe-tools browser open <url> [options]` - Open a URL and capture page content, console logs, and network activity (e.g., `vibe-tools browser open "https://example.com" --html`)
`vibe-tools browser act "<instruction>" --url=<url | 'current'> [options]` - Execute actions on a webpage using natural language instructions (e.g., `vibe-tools browser act "Click Login" --url=https://example.com`)
`vibe-tools browser observe "<instruction>" --url=<url> [options]` - Observe interactive elements on a webpage and suggest possible actions (e.g., `vibe-tools browser observe "interactive elements" --url=https://example.com`)
`vibe-tools browser extract "<instruction>" --url=<url> [options]` - Extract data from a webpage based on natural language instructions (e.g., `vibe-tools browser extract "product names" --url=https://example.com/products`)

**Notes on Browser Commands:**
- All browser commands are stateless unless --connect-to is used to connect to a long-lived interactive session. In disconnected mode each command starts with a fresh browser instance and closes it when done.
- When using `--connect-to`, special URL values are supported:
  - `current`: Use the existing page without reloading
  - `reload-current`: Use the existing page and refresh it (useful in development)
  - If working interactively with a user you should always use --url=current unless you specifically want to navigate to a different page. Setting the url to anything else will cause a page refresh loosing current state.
- Multi step workflows involving state or combining multiple actions are supported in the `act` command using the pipe (|) separator (e.g., `vibe-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" --url=https://example.com`)
- Video recording is available for all browser commands using the `--video=<directory>` option. This will save a video of the entire browser interaction at 1280x720 resolution. The video file will be saved in the specified directory with a timestamp.
- DO NOT ask browser act to "wait" for anything, the wait command is currently disabled in Stagehand.

**Tool Recommendations:**
- `vibe-tools web` is best for general web information not specific to the repository. Generally call this without additional arguments.
- `vibe-tools repo` is ideal for repository-specific questions, planning, code review and debugging. E.g. `vibe-tools repo "Review recent changes to command error handling looking for mistakes, omissions and improvements"`. Generally call this without additional arguments.
- `vibe-tools plan` is ideal for planning tasks. E.g. `vibe-tools plan "Adding authentication with social login using Google and Github"`. Generally call this without additional arguments.
- `vibe-tools doc` generates documentation for local or remote repositories.
- `vibe-tools youtube` analyzes YouTube videos to generate summaries, transcripts, implementation plans, or custom analyses
- `vibe-tools browser` is useful for testing and debugging web apps and uses Stagehand
- `vibe-tools mcp` enables interaction with specialized tools through MCP servers (e.g., for Git operations, file system tasks, or custom tools)

**Running Commands:**
1. Use `vibe-tools <command>` to execute commands (make sure vibe-tools is installed globally using npm install -g vibe-tools so that it is in your PATH)

**General Command Options (Supported by all commands):**
--provider=<provider>: AI provider to use (openai, anthropic, perplexity, gemini, openrouter, modelbox, or xai). If provider is not specified, the default provider for that task will be used.
--model=<model name>: Specify an alternative AI model to use. If model is not specified, the provider's default model for that task will be used.
--max-tokens=<number>: Control response length
--save-to=<file path>: Save command output to a file (in *addition* to displaying it)
--help: View all available options (help is not fully implemented yet)
--debug: Show detailed logs and error information

**Repository Command Options:**
--provider=<provider>: AI provider to use (gemini, openai, openrouter, perplexity, modelbox, anthropic, or xai)
--model=<model>: Model to use for repository analysis
--max-tokens=<number>: Maximum tokens for response
--from-github=<GitHub username>/<repository name>[@<branch>]: Analyze a remote GitHub repository without cloning it locally
--subdir=<path>: Analyze a specific subdirectory instead of the entire repository
--with-doc=<doc_url>: Fetch content from a document URL and include it as context

**Documentation Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Generate documentation for a remote GitHub repository
--provider=<provider>: AI provider to use (gemini, openai, openrouter, perplexity, modelbox, anthropic, or xai)
--model=<model>: Model to use for documentation generation
--max-tokens=<number>: Maximum tokens for response
--with-doc=<doc_url>: Fetch content from a document URL and include it as context

**YouTube Command Options:**
--type=<summary|transcript|plan|review|custom>: Type of analysis to perform (default: summary)

**GitHub Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Access PRs/issues from a specific GitHub repository

**Browser Command Options (for 'open', 'act', 'observe', 'extract'):**
--console: Capture browser console logs (enabled by default, use --no-console to disable)
--html: Capture page HTML content (disabled by default)
--network: Capture network activity (enabled by default, use --no-network to disable)
--screenshot=<file path>: Save a screenshot of the page
--timeout=<milliseconds>: Set navigation timeout (default: 120000ms for Stagehand operations, 30000ms for navigation)
--viewport=<width>x<height>: Set viewport size (e.g., 1280x720). When using --connect-to, viewport is only changed if this option is explicitly provided
--headless: Run browser in headless mode (default: true)
--no-headless: Show browser UI (non-headless mode) for debugging
--connect-to=<port>: Connect to existing Chrome instance. Special values: 'current' (use existing page), 'reload-current' (refresh existing page)
--wait=<time:duration or selector:css-selector>: Wait after page load (e.g., 'time:5s', 'selector:#element-id')
--video=<directory>: Save a video recording (1280x720 resolution, timestamped subdirectory). Not available when using --connect-to
--url=<url>: Required for `act`, `observe`, and `extract` commands. Url to navigate to before the main command or one of the special values 'current' (to stay on the current page without navigating or reloading) or 'reload-current' (to reload the current page)
--evaluate=<string>: JavaScript code to execute in the browser before the main command

**Nicknames**
Users can ask for these tools using nicknames
Gemini is a nickname for vibe-tools repo
Perplexity is a nickname for vibe-tools web
Stagehand is a nickname for vibe-tools browser
If people say "ask Gemini" or "ask Perplexity" or "ask Stagehand" they mean to use the `vibe-tools` command with the `repo`, `web`, or `browser` commands respectively.


</vibe-tools Integration>