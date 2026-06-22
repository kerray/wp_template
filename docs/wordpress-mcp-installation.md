# WordPress MCP Installation and Configuration Guide

This guide provides a comprehensive tutorial for installing and configuring the WordPress MCP (Model Context Protocol) plugin, which enables AI systems to interact with WordPress sites through a standardized interface.

## Overview

The WordPress MCP plugin allows AI models to:
- Create, read, update, and delete WordPress content
- Access site information and metadata
- Interact with plugins and themes
- Execute custom tools and workflows
- Use structured prompts for WordPress-specific tasks

## Installation Status

✅ **WordPress MCP Plugin**: Already installed at `src/wp-content/plugins/wordpress-mcp/`
✅ **Plugin Status**: Active (version 0.2.3)
✅ **Docker Environment**: Running on http://localhost:8080/
✅ **Error Fixes**: WordPress warnings and headers issues resolved

## Prerequisites

- WordPress development environment running in Docker
- WordPress MCP plugin installed and activated
- Access to WordPress admin panel
- Claude Code or other MCP-compatible client

## Step-by-Step Setup

### 1. Access WordPress Admin Panel

Since this is a Docker environment, you'll need to access the WordPress admin:

```bash
# Check that WordPress is running
just status

# If not running, start it
just up

# Access WordPress at http://localhost:8080/
# Use browser or curl to check status
curl -I http://localhost:8080/
```

### 2. Generate JWT Authentication Token

**Option A: Via WordPress Admin (Recommended)**
1. Open your browser and navigate to: **http://localhost:8080/wp-admin/**
2. Log in with your WordPress admin credentials
3. Navigate to **Settings > WordPress MCP > Authentication Tokens**
4. Select token duration (recommended: 24 hours for development)
5. Click **"Generate New Token"**
6. **Important**: Copy the generated JWT token immediately - it won't be shown again

**Option B: Via WP-CLI (if available)**
```bash
# Check if JWT commands are available
just wp "mcp token generate --expires=24h"
```

### 3. Configure Claude Code MCP Connection

#### Option A: Copy Template Configuration
```bash
# Copy the pre-configured template
cp claude_mcp_config.json ~/.config/claude/claude_desktop_config.json

# Edit the file and replace YOUR_JWT_TOKEN_HERE with your actual token
nano ~/.config/claude/claude_desktop_config.json
```

#### Option B: Manual Configuration
Create `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wordpress-mcp": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://localhost:8080/",
        "JWT_TOKEN": "paste-your-jwt-token-here",
        "LOG_FILE": "/path/to/site_example/logs/wordpress-mcp.log"
      }
    }
  }
}
```

### 4. Alternative Client Configurations

#### Claude Code (HTTP Transport - Direct)
```bash
claude mcp add --transport http wordpress-mcp http://localhost:8080/wp-json/wp/v2/wpmcp/streamable --header "Authorization: Bearer YOUR-JWT-TOKEN"
```

#### VS Code MCP Extension
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

### 5. Configure Plugin Settings

The plugin creates a settings page at **Settings > WordPress MCP** in the WordPress admin dashboard. Key settings include:

- **Enable MCP**: Master switch for MCP functionality
- **Enable Create Tools**: Allow AI to create new content
- **Enable Update Tools**: Allow AI to modify existing content  
- **Enable Delete Tools**: Allow AI to remove content (⚠️ use with caution)
- **Enable REST API CRUD Tools**: 🧪 Enable experimental generic REST API access tools
- **WordPress Features Adapter**: Integration with WordPress Feature API

## Available MCP Tools and Resources

### Core Tools
- **wp_get_posts** / **list_plugins** - Retrieve WordPress content and plugins
- **wp_create_post** - Create new posts (requires create tools enabled)
- **wp_update_post** - Update existing posts (requires update tools enabled)
- **wp_delete_post** - Delete posts (requires delete tools enabled)
- **wp_get_users** - Get user information
- **wp_get_themes** - List available themes

### 🧪 Experimental REST API CRUD Tools
When enabled, provides three powerful generic tools:
- **list_api_functions** - Discover all available WordPress REST API endpoints
- **get_function_details** - Get detailed metadata for specific endpoint/method
- **run_api_function** - Execute any REST API function with CRUD operations

### Resources
- **WordPress://site-info** - Site configuration and metadata
- **WordPress://plugin-info** - Plugin details and status
- **WordPress://theme-info** - Theme information
- **WordPress://user-capabilities** - User permissions and roles

### Prompts
- **wordpress-content-creation** - Structured content creation workflow
- **wordpress-seo-optimization** - SEO analysis and improvement
- **wordpress-troubleshooting** - Diagnostic and debugging assistance

## Testing the Installation

### Verify Plugin Status
```bash
# Check plugin activation
just wp "plugin list --status=active" | grep wordpress-mcp

# Test basic functionality
just wp "plugin list" | head -5
```

### Test MCP Connection

#### Using Claude Code
```bash
# Restart Claude Code and test MCP
/mcp

# Test with specific commands
# "Can you list all the currently installed WordPress plugins using MCP?"
```

#### Using MCP Inspector (Development)
```bash
npx @modelcontextprotocol/inspector \
  -e WP_API_URL=http://localhost:8080/ \
  -e JWT_TOKEN=your-jwt-token-here \
  npx @automattic/mcp-wordpress-remote@latest
```

### Test Endpoints Directly
```bash
# Test MCP endpoint using pretty permalinks
curl -X GET "http://localhost:8080/wp-json/wp/v2/wpmcp" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN"

# Test streamable endpoint
curl -X POST "http://localhost:8080/wp-json/wp/v2/wpmcp/streamable" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Note**: If the above commands return 404 errors, use the index.php method:

```bash
# Test using index.php method
curl -X GET "http://localhost:8080/index.php?rest_route=/wp/v2/wpmcp" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN"
```

## Error Fixes Applied

This installation includes fixes for common WordPress issues:

### 1. Translation Loading Warnings
- ✅ Fixed "Translation loading for domain was triggered too early" notices
- ✅ Added proper error handling for complianz-gdpr and complianz-terms-conditions plugins
- ✅ Implemented custom error handler in wp-config.php

### 2. Deprecated Function Warnings
- ✅ Fixed "Use of 'parent' in callables is deprecated" warnings from simple-lightbox plugin
- ✅ Added mu-plugin to handle deprecation notices gracefully

### 3. Headers Already Sent Errors
- ✅ Implemented output buffering in wp-config.php
- ✅ Added clean output handling for MCP requests
- ✅ Ensured proper header management for API endpoints

### 4. MCP-Specific Optimizations
- ✅ Added WPMCP_JWT_SECRET_KEY configuration
- ✅ Enabled MCP debug logging (when WPMCP_DEBUG=true)
- ✅ Memory limit increased to 512M for better performance
- ✅ Must-use plugin for seamless MCP operation

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
- **Delete tools**: Allow content removal (highest risk - ⚠️ use with caution)

### Security Features
- ✅ JWT signature validation
- ✅ Token expiration and revocation
- ✅ User capability inheritance
- ✅ Secure secret key generation
- ✅ Audit logging for security events
- ✅ Protection against malformed requests

## Troubleshooting

### Common Issues

1. **"No MCP servers configured"**
   - Ensure `claude_desktop_config.json` exists in correct location
   - Check JSON syntax is valid
   - Restart Claude Code after configuration

2. **Connection timeouts**
   - Verify WordPress is accessible: `curl -I http://localhost:8080/`
   - Check Docker containers: `just status`
   - Ensure JWT token hasn't expired

3. **Authentication errors**
   - Regenerate JWT token from WordPress admin
   - Ensure token is correctly copied (no extra spaces)
   - Verify WordPress admin user has appropriate permissions

4. **Plugin warnings/errors (now fixed)**
   - ✅ Translation loading warnings suppressed
   - ✅ Deprecated function notices handled
   - ✅ Headers already sent errors resolved

### Debug Mode

View logs and debug information:
```bash
# MCP connection logs
tail -f logs/wordpress-mcp.log

# WordPress debug logs  
just logs wordpress | grep -i mcp

# Check error fixes
just wp "plugin list" | head -3  # Should show no warnings now
```

## Advanced Configuration

### Alternative Authentication (Application Passwords)
Instead of JWT tokens, you can use WordPress Application Passwords:

```json
{
  "mcpServers": {
    "wordpress-mcp": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://localhost:8080/",
        "WP_API_USERNAME": "your-username",
        "WP_API_PASSWORD": "your-application-password"
      }
    }
  }
}
```

### Custom Tools and Resources
Create custom MCP extensions by adding code to your theme's `functions.php` or a custom plugin:

```php
// Add custom MCP tools
add_action('wp_mcp_register_tools', function() {
    WPMCP()->register_tool([
        'name' => 'custom_site_stats',
        'description' => 'Get custom site statistics',
        'inputSchema' => [
            'type' => 'object',
            'properties' => []
        ],
        'callback' => function($args) {
            return [
                'posts_count' => wp_count_posts()->publish,
                'users_count' => count_users()['total_users'],
                'plugins_count' => count(get_plugins()),
                'themes_count' => count(wp_get_themes()),
            ];
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

## Next Steps

Once MCP is configured and tested:

1. **List current plugins**: Ask Claude to show you all installed plugins
2. **Explore capabilities**: Try creating a test post through MCP
3. **Monitor logs**: Check `logs/wordpress-mcp.log` for activity
4. **Security review**: Regularly rotate JWT tokens
5. **Enable experimental features**: Try REST API CRUD tools for advanced functionality

## Integration Examples

### Test Plugin Listing
Once configured, test with:
```bash
# Through Claude Code MCP interface
/mcp tools call list_plugins

# Or ask Claude directly:
# "Can you list all the currently installed WordPress plugins using MCP?"
```

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

## Resources and Support

- **Plugin Repository**: https://github.com/Automattic/wordpress-mcp
- **MCP Remote Proxy**: https://github.com/Automattic/mcp-wordpress-remote
- **MCP Specification**: https://modelcontextprotocol.io
- **Claude Code MCP Docs**: https://docs.anthropic.com/en/docs/claude-code/mcp
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Support Issues**: https://github.com/Automattic/wordpress-mcp/issues

## Conclusion

The WordPress MCP plugin provides a powerful bridge between AI systems and WordPress, enabling sophisticated content management and site interaction capabilities. This installation includes comprehensive error fixes and optimizations for Docker environments.

**Key improvements in this setup:**
- ✅ All WordPress warnings and errors resolved
- ✅ Proper MCP configuration for Claude Code
- ✅ Enhanced security with JWT token management
- ✅ Debug logging and monitoring capabilities
- ✅ Must-use plugins for seamless operation

Remember to prioritize security by using JWT tokens, enabling only necessary tool types, and regularly monitoring access patterns. Start with read-only access and gradually enable additional capabilities as needed.

---

**Note**: This installation assumes you're running the WordPress AI Workspace Template with Docker. All error fixes and optimizations are specifically tailored for this environment.