# WordPress AI Development Container

This directory contains the custom Docker configuration for the WordPress AI Development environment.

## Custom Container Features

Our custom WordPress container (`docker/wordpress/Dockerfile`) extends the official WordPress image with:

- **WP-CLI**: Pre-installed WordPress command-line interface
- **Composer**: PHP dependency manager for modern WordPress development
- **WordPress MCP Plugin**: Pre-installed and ready for AI agent integration
- **Development Tools**: Git, Vim, Nano, and other essential utilities
- **Proper Permissions**: Pre-configured directory structure and permissions

## Version Management

All tool versions are controlled via environment variables:

```bash
# In your .env file
COMPOSER_VERSION=2.7.1    # PHP Composer version
WP_CLI_VERSION=2.11.0     # WP-CLI version  
WP_MCP_VERSION=0.2.3      # WordPress MCP Plugin version
```

## Container Structure

```
docker/
├── wordpress/
│   ├── Dockerfile        # Custom WordPress container definition
│   └── entrypoint.sh     # Custom initialization script
├── nginx/               # Optional Nginx configuration
│   └── conf.d/
│       └── default.conf
└── php/                 # PHP configuration
    └── php.ini
```

## Building the Container

```bash
# Build the custom container
just build

# Rebuild and restart everything
just rebuild

# Start with the custom container
just up
```

## Container Initialization

The custom entrypoint script (`entrypoint.sh`):

1. ✅ Displays installed tool versions
2. ✅ Ensures proper directory structure and permissions
3. ✅ Verifies pre-installed tools are working
4. ✅ Provides helpful status messages
5. ✅ Calls the original WordPress entrypoint

## Tool Verification

After starting the container, verify the tools are working:

```bash
# Check WP-CLI
just wp-install

# Check Composer
just wp-install-composer

# Check MCP Plugin
just mcp-status
```

## Updating Tool Versions

To update tool versions:

1. Update version numbers in your `.env` file
2. Rebuild the container: `just rebuild`
3. Verify the new versions are installed

## Benefits of the Custom Container

### Before (Manual Installation)
- Had to run `just wp-install` every time
- Had to run `just wp-install-composer` every time  
- Had to run `just mcp-install` for every project
- Installation commands could fail or timeout
- Inconsistent tool versions across environments

### After (Pre-installed Container)
- All tools ready immediately on container start
- Consistent, reproducible environments
- Faster startup times
- Version-controlled tool installations
- No manual installation steps required

## Troubleshooting

### Container Build Issues
```bash
# Clean build (no cache)
docker-compose build --no-cache wordpress

# Check build logs
docker-compose logs wordpress
```

### Tool Installation Issues
```bash
# Access container shell
docker-compose exec wordpress bash

# Check tool versions manually
wp --info --allow-root
composer --version
ls -la /var/www/html/wp-content/plugins/wordpress-mcp/
```

### Permission Issues
```bash
# Fix all permissions
just fix-all-permissions
```

## Architecture Decision

This custom container approach was chosen because:

1. **Reliability**: Pre-installed tools eliminate installation failures
2. **Speed**: Faster project setup and container startup
3. **Consistency**: Same tool versions across all environments
4. **Maintainability**: Version management via environment variables
5. **AI-Friendly**: Ready for immediate AI agent integration

The container remains lightweight by only adding essential development tools while maintaining full compatibility with the official WordPress image.