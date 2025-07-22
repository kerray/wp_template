# WordPress MCP Installation and Configuration Guide

## Overview

This guide provides a comprehensive tutorial for installing and configuring the WordPress MCP (Model Context Protocol) plugin, which enables AI systems to interact with WordPress sites through a standardized interface.

The WordPress MCP plugin allows AI models to:
- Create, read, update, and delete WordPress content
- Access site information and metadata
- Interact with plugins and themes
- Execute custom tools and workflows
- Use structured prompts for WordPress-specific tasks

## Prerequisites

- WordPress site running in Docker (using this template)
- WP-CLI installed in WordPress container
- Composer available in WordPress container
- Admin access to WordPress

## Installation Steps

### 1. Download the Plugin

Download the latest release from GitHub and extract it to the plugins directory:

```bash
# Download latest release
curl -L "https://github.com/Automattic/wordpress-mcp/archive/refs/tags/v0.2.3.tar.gz" -o wordpress-mcp-v0.2.3.tar.gz

# Extract to plugins directory
tar -xzf wordpress-mcp-v0.2.3.tar.gz
mv wordpress-mcp-0.2.3 src/wp-content/plugins/wordpress-mcp

# Clean up archive
rm wordpress-mcp-v0.2.3.tar.gz
```

### 2. Install Dependencies

The plugin requires PHP dependencies to be installed via Composer:

```bash
# Install Composer in WordPress container (if not already installed)
just wp-install-composer

# Install plugin dependencies
docker-compose exec wordpress bash -c "cd /var/www/html/wp-content/plugins/wordpress-mcp && composer install --no-dev"
```

### 3. Activate the Plugin

```bash
# Activate via WP-CLI
just wp "plugin activate wordpress-mcp"

# Verify activation
just wp "plugin list --status=active" | grep wordpress-mcp
```

### 4. Configure Plugin Settings

The plugin creates a settings page at **Settings > WordPress MCP** in the WordPress admin dashboard. Key settings include:

- **Enable MCP**: Master switch for MCP functionality
- **Enable Create Tools**: Allow AI to create new content
- **Enable Update Tools**: Allow AI to modify existing content  
- **Enable Delete Tools**: Allow AI to remove content
- **WordPress Features Adapter**: Integration with WordPress Feature API

### 5. Generate JWT Authentication Token

**Option A: Via WordPress Admin (Recommended)**
1. Go to **Settings > WordPress MCP > Authentication Tokens**
2. Click "Generate New Token"
3. Set expiration time (1-24 hours)
4. Copy the generated JWT token
5. Store securely for use with MCP clients

**Option B: Via WP-CLI (if available)**
```bash
# Check if JWT commands are available
just wp "mcp token generate --expires=24h"
```

## Client Configuration

### Claude Code (HTTP Transport)

Add the WordPress MCP server to Claude Code:

```bash
claude mcp add --transport http wordpress-mcp http://localhost:8080/wp-json/wp/v2/wpmcp/streamable --header "Authorization: Bearer YOUR-JWT-TOKEN"
```

### Claude Desktop (STDIO Transport)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wordpress-mcp": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://localhost:8080/",
        "JWT_TOKEN": "YOUR-JWT-TOKEN",
        "LOG_FILE": "/tmp/wordpress-mcp.log"
      }
    }
  }
}
```

### VS Code MCP Extension

Add to VS Code MCP settings:

```json
{
  "servers": {
    "wordpress-mcp": {
      "type": "http",
      "url": "http://localhost:8080/wp-json/wp/v2/wpmcp/streamable",
      "headers": {
        "Authorization": "Bearer YOUR-JWT-TOKEN"
      }
    }
  }
}
```

## Available Tools and Resources

### Core Tools

- **wp_get_posts** - Retrieve WordPress posts
- **wp_create_post** - Create new posts (requires create tools enabled)
- **wp_update_post** - Update existing posts (requires update tools enabled)
- **wp_delete_post** - Delete posts (requires delete tools enabled)
- **wp_get_users** - Get user information
- **wp_get_plugins** - List installed plugins
- **wp_get_themes** - List available themes

### Resources

- **WordPress://site-info** - Site configuration and metadata
- **WordPress://plugin-info** - Plugin details and status
- **WordPress://theme-info** - Theme information
- **WordPress://user-capabilities** - User permissions and roles

### Prompts

- **wordpress-content-creation** - Structured content creation workflow
- **wordpress-seo-optimization** - SEO analysis and improvement
- **wordpress-troubleshooting** - Diagnostic and debugging assistance

## Security Considerations

### JWT Token Management

- **Use shortest necessary expiration time** (1-24 hours)
- **Revoke unused tokens** promptly from admin interface
- **Never commit tokens** to version control
- **Rotate tokens regularly** for security

### Permission Levels

- **Read tools**: Available when MCP is enabled (safe)
- **Create tools**: Allow content creation (moderate risk)
- **Update tools**: Allow content modification (higher risk)  
- **Delete tools**: Allow content removal (highest risk)

### Best Practices

1. Start with read-only access to test functionality
2. Enable create/update/delete tools only when needed
3. Use HTTPS in production environments
4. Monitor plugin activity through WordPress logs
5. Keep plugin updated to latest version

## Testing the Installation

### Verify Plugin Status

```bash
# Check plugin activation
just wp "plugin list --status=active" | grep wordpress-mcp

# Test MCP endpoint using pretty permalinks
curl -X GET "http://localhost:8080/wp-json/wp/v2/wpmcp" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN"

# Test streamable endpoint using pretty permalinks
curl -X POST "http://localhost:8080/wp-json/wp/v2/wpmcp/streamable" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Note**: If the above commands return 404 errors, your Docker WordPress setup may not have pretty permalinks fully configured. In this case, use the index.php method:

```bash
# Test MCP endpoint using index.php method
curl -X GET "http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN"

# Test streamable endpoint using index.php method
curl -X POST "http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp/streamable" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### Client Configuration for Docker Environments

When configuring MCP clients for Docker WordPress installations that require the index.php method, update your URLs accordingly:

**Claude Code (with index.php):**
```bash
claude mcp add --transport http wordpress-mcp "http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp/streamable" --header "Authorization: Bearer YOUR-JWT-TOKEN"
```

**VS Code MCP Extension (with index.php):**
```json
{
  "servers": {
    "wordpress-mcp": {
      "type": "http",
      "url": "http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp/streamable",
      "headers": {
        "Authorization": "Bearer YOUR-JWT-TOKEN"
      }
    }
  }
}
```

### MCP Inspector (Development Testing)

```bash
npx @modelcontextprotocol/inspector \
  -e WP_API_URL=http://localhost:8080/ \
  -e JWT_TOKEN=YOUR-JWT-TOKEN \
  npx @automattic/mcp-wordpress-remote@latest
```

## Troubleshooting

### Common Issues

**Plugin Not Activating**
- Check that dependencies are installed: `composer install --no-dev`
- Verify file permissions: `just fix-permissions`
- Check WordPress error logs: `just logs`

**JWT Token Issues**
- Verify token hasn't expired
- Check token format (should be long base64-encoded string)
- Ensure proper Authorization header format

**Connection Timeouts**
- Verify WordPress container is running: `just status`
- Check endpoint accessibility: `curl http://localhost:8080/wp-json/wp/v2/`
- Review firewall and network settings

**REST API 404 Errors**
- Pretty permalinks may not be configured in Docker environment
- Use index.php method: `http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp`
- Test basic REST API: `curl "http://localhost:8080/index.php?rest_route=/wp/v2/posts&per_page=1"`
- Flush rewrite rules: `just wp "rewrite flush"`

**Permission Errors**
- Verify user has admin privileges
- Check MCP settings are properly configured
- Ensure required tool types are enabled

### Debug Steps

1. **Check WordPress logs**:
   ```bash
   just logs wordpress
   tail -f logs/apache/error.log
   ```

2. **Test REST API**:
   ```bash
   curl "http://localhost:8080/wp-json/wp/v2/posts?per_page=1"
   ```

3. **Verify plugin files**:
   ```bash
   ls -la src/wp-content/plugins/wordpress-mcp/
   ```

4. **Check database options**:
   ```bash
   just wp "option get wordpress_mcp_settings"
   ```

## Advanced Configuration

### Custom Tools and Resources

Create custom MCP extensions by adding code to your theme's `functions.php` or a custom plugin:

```php
// Add custom MCP tools
add_action('wordpress_mcp_init', function() {
    new \Automattic\WordpressMcp\Core\RegisterMcpTool([
        'name' => 'custom_site_stats',
        'description' => 'Get custom site statistics',
        'type' => 'read',
        'callback' => function($args) {
            return [
                'posts_count' => wp_count_posts()->publish,
                'users_count' => count_users()['total_users'],
                'plugins_count' => count(get_plugins()),
                'themes_count' => count(wp_get_themes()),
            ];
        },
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});
```

### WooCommerce Integration

If WooCommerce is installed, additional e-commerce tools become available:

- **wc_get_products** - Retrieve products
- **wc_get_orders** - Get order information  
- **wc_create_product** - Add new products
- **wc_update_inventory** - Manage stock levels

### Logging and Monitoring

Enable detailed logging for debugging:

```php
// Add to wp-config.php
define('WORDPRESS_MCP_DEBUG', true);
define('WORDPRESS_MCP_LOG_FILE', '/var/www/html/wp-content/debug.log');
```

## Integration Examples

### Content Creation Workflow

```javascript
// Example: Create a blog post with AI assistance
const mcpClient = new MCPClient('wordpress-mcp');

await mcpClient.callTool('wp_create_post', {
    title: 'AI-Generated Content',
    content: 'Content created by AI assistant',
    status: 'draft',
    categories: ['Technology', 'AI']
});
```

### SEO Analysis

```javascript
// Example: Analyze site SEO
const siteInfo = await mcpClient.readResource('WordPress://site-info');
const posts = await mcpClient.callTool('wp_get_posts', { per_page: 10 });

// AI can analyze and provide SEO recommendations
```

## Maintenance and Updates

### Regular Tasks

```bash
# Update plugin (manual process)
just mcp-update

# Regenerate JWT tokens
just mcp-token-refresh

# Check plugin status
just mcp-status

# Backup MCP settings
just mcp-backup-settings
```

### Monitoring

- Monitor JWT token expiration
- Check MCP endpoint response times
- Review security logs for unauthorized access attempts
- Update plugin when new versions are available

## Resources and Support

- **Plugin Repository**: https://github.com/Automattic/wordpress-mcp
- **MCP Specification**: https://modelcontextprotocol.io
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Support Issues**: https://github.com/Automattic/wordpress-mcp/issues

## Conclusion

The WordPress MCP plugin provides a powerful bridge between AI systems and WordPress, enabling sophisticated content management and site interaction capabilities. Following this guide ensures a secure and functional installation that can be extended and customized for specific use cases.

Remember to prioritize security by using JWT tokens, enabling only necessary tool types, and regularly monitoring access patterns. Start with read-only access and gradually enable additional capabilities as needed.