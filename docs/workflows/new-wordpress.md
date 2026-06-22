# New WordPress Installation

Complete step-by-step process for creating a fresh WordPress site with this template.

## Prerequisites

- Docker and Docker Compose installed
- Just task runner installed (`brew install just` or see main README)
- Git repository cloned

## Step 1: Initial Setup

```bash
just setup              # Creates .env, downloads WordPress core, sets up directories
just build              # Builds custom container (first time only)
just up                 # Starts Docker environment
```

## Step 2: WordPress Installation

### Option A: Web Interface (Recommended)

```bash
just open-site          # Opens http://localhost:8080 in browser
```

Complete WordPress setup wizard:
- Site Title
- Username & Password
- Email address
- Database connection is automatic

### Option B: WP-CLI (Automated)

```bash
just wp "core install --url=http://localhost:8080 --title='Your Site Title' --admin_user=admin --admin_password=secure_password --admin_email=your@email.com"
```

## Step 3: Post-Installation Setup

```bash
just mcp-install        # Activates WordPress MCP plugin for AI integration
just urls-check         # Verify URLs are correct for local development
just fix-all-permissions # Ensure proper file permissions
```

## Step 4: Verification

```bash
just status             # Check all containers are running
just wp "core version"  # Verify WordPress is installed
just mcp-status         # Confirm MCP plugin is active
```

## Step 5: MCP Token Setup (Optional - for AI integration)

1. Access: http://localhost:8080/wp-admin
2. Navigate: Settings > WordPress MCP > Authentication Tokens
3. Generate JWT token (1-24 hours recommended)
4. Configure your AI client with the token

See [MCP Installation Guide](../wordpress-mcp-installation.md) for detailed configuration.

## Next Steps

- Install your theme: `just plugin-install theme-name`
- Configure plugins as needed
- Set up backups: `just db-export`
- Run tests if configured: `just test-local`
