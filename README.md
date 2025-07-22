# WordPress AI Workspace Template

> **A complete WordPress development environment designed for AI agents like Claude Code, Cline, and Cursor**

This template provides a modern, Docker-based WordPress development setup that AI agents can easily understand, configure, and manage. Perfect for both beginners and experienced developers who want to work with AI assistance.

## 🚀 What This Template Gives You

### **Instant WordPress Development Environment**
- **Docker-powered setup** - No need to install WordPress, PHP, MySQL, or Apache locally
- **One-command startup** - Just run `just up` and you have a full WordPress site
- **Live file editing** - Edit files in `src/` and see changes immediately in your browser
- **Separate uploads handling** - Media files stay organized and portable
- **Multiple database environments** - Easy backup, restore, and migration

### **AI-Friendly Architecture**
- **Just task runner** - Simple, human-readable commands for all operations
- **Comprehensive documentation** - AI agents can understand and explain everything
- **Automated WordPress management** - WP-CLI integration for database operations
- **Smart file organization** - Clear separation of WordPress core, themes, plugins, and uploads
- **Built-in backup system** - Protect your work automatically

### **Professional Development Features**
- **Git-ready** - Proper `.gitignore` excludes sensitive files and uploads
- **VSCode integration** - Pre-configured tasks for common WordPress operations
- **Multi-language support** - Template supports Czech WordPress (easily adaptable)
- **Local URL management** - Automatic URL switching between production and development
- **Database management** - Export, import, and restore with simple commands

## 🎯 Perfect For

**Beginners who want to:**
- Learn WordPress development with AI guidance
- Set up a professional development environment quickly
- Understand modern WordPress workflows
- Work with real WordPress sites safely

**Experienced developers who want to:**
- Collaborate with AI agents on WordPress projects
- Restore existing WordPress sites for local development
- Maintain multiple WordPress environments efficiently
- Streamline repetitive WordPress tasks

**AI agents who need to:**
- Set up WordPress environments for users
- Restore WordPress sites from backups
- Manage WordPress URLs and databases
- Explain WordPress development concepts

## 🛠️ Core Features Explained

### **Just Task Runner - Your Command Center**
Instead of remembering complex Docker commands, use simple, readable commands:

```bash
just up              # Start your WordPress site
just down            # Stop everything
just wp "user list"  # Run any WordPress command
just urls-update     # Fix URLs for local development
just db-import site.sql  # Restore a database backup
```

**Why this matters:** AI agents can easily understand and explain these commands to users of any skill level.

### **Live File Editing Magic**
```
├── src/                    # WordPress files (live-mounted)
│   ├── wp-content/themes/  # Edit themes here → see changes instantly
│   ├── wp-content/plugins/ # Modify plugins → updates immediately
│   └── wp-config.php      # WordPress configuration
├── uploads/               # Media files (separate & organized)
└── backups/              # Database backups (version controlled)
```

**What this means:** When you edit a PHP file in your editor, you see the changes immediately in your browser at `http://localhost:8080`. No deployment steps, no file transfers, no waiting.

### **Database Magic**
The template handles the tricky parts of WordPress database management:
- **Automatic table prefix detection** - Works with any WordPress backup
- **URL management** - Switches between production and development URLs automatically
- **WP-CLI integration** - Professional WordPress command-line tools built-in
- **Backup and restore** - Simple commands for complex database operations

### **Professional Git Workflow**
The `.gitignore` is configured to:
- ✅ **Include:** Your themes, plugins, configuration files
- ❌ **Exclude:** WordPress core files, uploads, sensitive data, database backups
- 🔐 **Protect:** Passwords, keys, and personal data automatically

## 📋 Quick Start Guide

### **1. Start Your WordPress Site**
```bash
just up                    # Starts WordPress at http://localhost:8080
```

### **2. Install WordPress CLI Tools**
```bash
just wp-install           # Adds professional WordPress management tools
```

### **3. Work with Your Site**
```bash
just wp "core version"    # Check WordPress version
just wp "user list"       # See all users
just wp "plugin list"     # See installed plugins
just urls-check          # Check current URLs
```

### **4. Import Existing Site (Optional)**
If you have WordPress backup files:
```bash
# Put your files in the backups/ folder, then:
just db-import your-backup.sql     # Restore database
just urls-update                   # Fix URLs for local development
```

## 🤖 AI Agent Instructions

This template is specifically designed for AI agents. The included `CLAUDE.md` file provides detailed instructions for:

- **Automated site restoration** from backup files
- **Database management** with proper error handling
- **URL management** for local development
- **File organization** best practices
- **Professional WordPress workflows**

AI agents can use this template to help users:
1. **Set up professional WordPress development environments**
2. **Migrate existing sites for local development**
3. **Learn WordPress development concepts**
4. **Maintain proper version control practices**
5. **Understand modern development workflows**

## 📁 Project Structure

```
wordpress-ai-workspace/
├── src/                 # WordPress core files (live-mounted to container)
│   ├── wp-content/      # Your themes, plugins, uploads
│   ├── wp-config.php    # WordPress configuration
│   └── ...              # WordPress core files
├── uploads/             # Media files (mounted separately)
├── backups/             # Database and file backups
├── docker-compose.yml   # Docker configuration
├── Justfile            # All project commands
├── CLAUDE.md           # AI agent instructions
├── .gitignore          # Proper WordPress Git setup
└── README.md           # This file
```

## 🎯 Key Benefits

### **For Beginners:**
- **No complex setup** - Everything works out of the box
- **Safe learning environment** - Break things without consequences
- **Professional practices** - Learn the right way from the start
- **AI guidance** - Get help understanding every step

### **For Experienced Developers:**
- **Rapid environment setup** - From zero to WordPress in under 5 minutes
- **Consistent workflows** - Same commands work across all projects
- **Easy collaboration** - Share exact development environments
- **Production-ready practices** - Proper Git workflows and file organization

### **For AI Agents:**
- **Clear documentation** - Every feature is explained and justified
- **Predictable structure** - Standard locations for all files and configurations
- **Comprehensive tooling** - Built-in solutions for common WordPress tasks
- **Error handling** - Graceful handling of common WordPress development issues

## 🚀 Getting Started

1. **Clone this template** for your WordPress project
2. **Run `just up`** to start your development environment
3. **Visit `http://localhost:8080`** to see your WordPress site
4. **Edit files in `src/`** and see changes immediately
5. **Ask your AI agent** to help you with any WordPress development tasks

## 💡 Pro Tips

- **Use `just --list`** to see all available commands
- **The `uploads/` folder** is perfect for backing up and sharing media files
- **Database backups go in `backups/`** and are ignored by Git for security
- **AI agents can explain any command** - just ask!
- **Everything is documented** - check `CLAUDE.md` for AI-specific instructions

---

## 🌐 Complete Site Migration & MCP Integration

### **Clone Any WordPress Site Locally in 5 Minutes**

This template makes it incredibly easy to take any existing WordPress site and run it locally for development, testing, or AI-powered content management.

#### **Step 1: Download Your Site**
```bash
# Get site files via FTP, cPanel File Manager, or hosting provider
# Example structure:
backups/
├── your-site-database.sql      # Database export
├── your-site-uploads.zip       # Media files
└── your-site-plugins.zip       # Custom plugins (optional)
```

#### **Step 2: One-Command Setup**
```bash
just setup                      # Initialize environment
just up                         # Start Docker containers
just db-import your-site-database.sql  # Restore database
just uploads-restore your-site-uploads.tar.gz  # Restore media
just urls-update                # Fix URLs for local development
```

**That's it!** Your production site is now running locally at `http://localhost:8080`

#### **Step 3: Advanced Automation**
```bash
# Complete site backup (everything)
just db-export                  # Database backup
just uploads-backup             # Media backup

# Site maintenance
just wp "plugin update --all"   # Update all plugins
just wp "core update"           # Update WordPress
just fix-permissions           # Fix file permissions

# Development workflow
just wp "search-replace 'production-site.com' 'localhost:8080'"  # URL updates
just wp "user create dev dev@local.test --role=administrator"    # Create dev user
just wp "plugin activate wordpress-mcp"  # Enable MCP for AI integration
```

## 🤖 AI-Powered WordPress Management with MCP

### **What is Model Context Protocol (MCP)?**

MCP enables AI assistants like Claude to directly interact with your WordPress site. Instead of just giving you code suggestions, AI can:
- ✅ **Actually create and edit posts** for you
- ✅ **Manage users, plugins, and themes** automatically  
- ✅ **Analyze your site's content and SEO**
- ✅ **Perform bulk operations** across hundreds of posts
- ✅ **Generate reports** on site performance and content

### **Install WordPress MCP Plugin**
```bash
# One command installs everything needed
just mcp-install                # Downloads, installs, and activates MCP plugin
just mcp-status                 # Verify installation
just mcp-token-info             # Instructions for generating access token
```

### **Connect AI Assistant to Your Site**
```bash
# For Claude Code users
claude mcp add --transport http wordpress-mcp \
  "http://localhost:8080/wp-json/wp/v2/wpmcp/streamable" \
  --header "Authorization: Bearer YOUR-JWT-TOKEN"

# Test the connection
just mcp-test-endpoints
```

### **Real-World AI + WordPress Examples**

#### **Example 1: Bulk Content Creation**
*"Hey Claude, create 10 blog posts about sustainable living, each 500 words, with SEO-optimized titles and proper categories."*

**What happens:** Claude uses MCP to automatically create 10 unique, well-structured blog posts directly in your WordPress site, complete with:
- SEO-friendly titles and meta descriptions
- Proper category assignments
- Featured images (if available)
- Publishing schedule spread over time

#### **Example 2: Site Content Audit**
*"Claude, analyze all my blog posts and create a report on content gaps, outdated information, and SEO improvement opportunities."*

**What happens:** Claude reads through your entire site content and provides:
- Content performance analysis
- Keyword gap identification
- Recommendations for updating old posts
- SEO optimization suggestions
- Content calendar for new posts

#### **Example 3: User Management & Analytics**
*"Claude, create user accounts for my new team members and generate a report on site usage patterns."*

**What happens:** Claude automatically:
- Creates WordPress user accounts with appropriate roles
- Configures permissions and access levels
- Generates usage reports and analytics summaries
- Sets up notification systems for new content

#### **Example 4: Plugin & Theme Management**
*"Claude, audit my plugins for security issues, update everything safely, and recommend performance improvements."*

**What happens:** Claude:
- Scans all plugins for known security vulnerabilities
- Creates backups before making any changes
- Updates plugins and themes systematically  
- Tests functionality after each update
- Provides performance optimization recommendations

### **MCP Commands for Site Management**
```bash
# Plugin management
just mcp-install                # Install WordPress MCP plugin
just mcp-update                 # Update to latest version
just mcp-activate              # Enable MCP functionality
just mcp-status                # Check plugin status and configuration

# Testing and debugging  
just mcp-test-endpoints        # Test API connectivity
just mcp-inspector             # Launch interactive MCP testing tool
just mcp-client-config         # Show configuration examples

# Backup and security
just mcp-backup-settings       # Backup MCP configuration
just mcp-token-info            # JWT token management instructions
```

## 🚀 Complete Workflow Examples

### **Scenario 1: Agency Developer Workflow**
```bash
# Client sends WordPress backup files
# 1. Set up local development environment
just setup
just up
just db-import client-site.sql
just uploads-restore client-media.tar.gz
just urls-update

# 2. Enable AI assistance
just mcp-install
# Generate JWT token via WordPress admin
just mcp-client-config  # Get Claude Code setup instructions

# 3. AI-powered development begins
# Claude can now directly:
# - Analyze existing site structure
# - Create new features and content
# - Optimize performance and SEO
# - Generate documentation
```

### **Scenario 2: Content Creator Workflow**
```bash
# Start with fresh WordPress installation
just setup
just up

# Install and configure MCP for content management
just mcp-install
# Configure AI assistant access

# AI assistant can now help with:
# - Content planning and creation
# - SEO optimization
# - Social media integration
# - Performance monitoring
# - Automated publishing schedules
```

### **Scenario 3: Site Migration & Optimization**
```bash
# Migrate existing site for development
just setup
just up
just db-import production-backup.sql
just uploads-restore production-media.tar.gz

# Enable AI-powered optimization
just mcp-install

# AI assistant performs:
# - Complete site audit
# - Performance optimization
# - Security hardening
# - Content optimization
# - SEO improvements
# - Automated testing
```

## 📊 Benefits of This Integrated Approach

### **For Developers:**
- **Faster development cycles** - AI handles repetitive tasks
- **Better code quality** - AI reviews and suggests improvements
- **Automated testing** - AI creates and runs test scenarios
- **Documentation generation** - AI documents your code and processes

### **For Content Creators:**
- **Bulk content operations** - Create/edit hundreds of posts at once
- **SEO optimization** - AI optimizes every piece of content automatically
- **Content strategy** - AI analyzes performance and suggests improvements
- **Automated workflows** - Set up publishing schedules and social sharing

### **For Site Owners:**
- **Reduced maintenance overhead** - AI handles updates and monitoring
- **Better security** - AI continuously scans for vulnerabilities
- **Performance optimization** - AI monitors and improves site speed
- **Cost savings** - Reduce need for specialized developers

## 🔧 Advanced Configuration

### **Production-Ready Deployment**
```bash
# Prepare site for production
just wp "search-replace 'localhost:8080' 'your-domain.com'"
just db-export  # Final backup
just uploads-backup  # Media backup

# Security hardening
just wp "plugin install wordfence --activate"  # Security plugin
just fix-permissions  # Secure file permissions
```

### **Multi-Environment Management**
```bash
# Development environment
WP_PORT=8080 just up

# Staging environment  
WP_PORT=8081 just up

# Each environment has its own:
# - Database
# - Media files
# - Configuration
# - MCP access tokens
```

## 💡 Pro Tips for AI Integration

1. **Start with read-only MCP access** to test AI integration safely
2. **Use JWT tokens with short expiration** for enhanced security
3. **Enable MCP logging** to monitor AI interactions with your site
4. **Create backup workflows** before allowing AI to make changes
5. **Set up staging environments** for testing AI-generated content

## 📚 Additional Resources

- **WordPress MCP Installation Guide**: `docs/wordpress-mcp-installation.md`
- **AI Agent Instructions**: `CLAUDE.md`
- **VSCode Integration**: Pre-configured tasks in `.vscode/tasks.json`
- **Command Reference**: Run `just --list` or `just mcp-help`

---

**Ready to revolutionize your WordPress development with AI assistance? Start with `just up` and `just mcp-install` to unlock the full power of AI-driven WordPress management!** 🚀