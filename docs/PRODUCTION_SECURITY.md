# Production Security Hardening Guide

This guide covers security considerations when deploying the WordPress Docker environment to production.

## Quick Security Checklist

Before deploying to production, verify ALL of these:

- [ ] **Changed ALL default passwords** (MySQL root, MySQL user, SFTP)
- [ ] **Set `WP_DEBUG=false`** in `.env`
- [ ] **phpMyAdmin/Adminer NOT exposed** to public internet
- [ ] **SFTP disabled** or using SSH key authentication
- [ ] **Firewall configured** to restrict database port access
- [ ] **SSL/TLS configured** via reverse proxy
- [ ] **WordPress security plugins** installed (Wordfence, etc.)
- [ ] **File permissions** properly configured

---

## Critical Security Issues

### 1. Default Credentials (CRITICAL)

**Risk Level:** CRITICAL

The default configuration uses weak, well-known passwords that attackers actively scan for.

**Affected Services:**
- MySQL root password: `rootpassword`
- MySQL user password: `wordpress`
- SFTP password: `wordpress`

**Solution:**

Generate strong passwords (32+ characters):
```bash
# Generate secure passwords
openssl rand -base64 32

# Or use pwgen
pwgen -s 32 1
```

Update `.env` with unique passwords:
```bash
MYSQL_ROOT_PASSWORD=<your-generated-password-1>
MYSQL_PASSWORD=<your-generated-password-2>
SFTP_PASSWORD=<your-generated-password-3>
```

**Using the production template:**
```bash
# Copy production template
cp .env.production .env

# Edit and replace all CHANGE_ME values
nano .env
```

---

### 2. Debug Mode Enabled (HIGH)

**Risk Level:** HIGH

Debug mode exposes sensitive information including:
- File paths
- Database queries
- PHP errors with stack traces
- Plugin/theme vulnerabilities

**Solution:**

In `.env`:
```bash
WP_DEBUG=false
```

Remove debug log configuration from `docker-compose.fpm.yml` or set in `wp-config.php`:
```php
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
```

---

### 3. Exposed Database Management Tools (HIGH)

**Risk Level:** HIGH

phpMyAdmin and Adminer provide direct database access. If exposed to the internet, attackers can:
- Brute-force MySQL credentials
- Exploit known vulnerabilities
- Access/modify all site data

**Solution Options:**

**Option A: Don't enable in production (RECOMMENDED)**
```bash
# Start WITHOUT database tools
just up-fpm

# NOT this:
# just up-fpm phpmyadmin
# just up-fpm all
```

**Option B: SSH Tunnel Access**
```bash
# On your local machine, create SSH tunnel:
ssh -L 8081:localhost:8081 user@your-server

# Then access phpMyAdmin at http://localhost:8081
```

**Option C: VPN-only access**

Configure your firewall to only allow phpMyAdmin/Adminer ports from VPN IP ranges.

---

### 4. SFTP Service Exposure (MEDIUM-HIGH)

**Risk Level:** MEDIUM-HIGH

The SFTP service with password authentication is vulnerable to:
- Brute-force attacks
- Credential stuffing
- Man-in-the-middle attacks (if not properly configured)

**Solution Options:**

**Option A: Disable SFTP (RECOMMENDED for production)**
```bash
# Don't use --profile sftp
just up-fpm
```

**Option B: Use SSH Key Authentication**

1. Generate SSH keys:
```bash
ssh-keygen -t ed25519 -f docker/sftp/keys/id_ed25519
```

2. Update `docker-compose.fpm.yml`:
```yaml
sftp:
  volumes:
    - ./docker/sftp/keys/id_ed25519.pub:/home/wordpress/.ssh/keys/id_ed25519.pub:ro
  environment:
    # Empty password disables password auth
    SFTP_USERS: "wordpress::${USER_ID:-1000}:${GROUP_ID:-1000}:html,uploads"
```

**Option C: Strong password + fail2ban**

If you must use password auth:
1. Use a 32+ character random password
2. Install fail2ban on the host
3. Configure rate limiting

---

## Network Security

### 5. Database Network Isolation (MEDIUM)

**Current State:** All services share the same Docker network.

**Risk:** If nginx/WordPress is compromised, attacker has direct access to database.

**Solution:** Create separate networks:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access

services:
  nginx:
    networks:
      - frontend
      - backend

  wordpress:
    networks:
      - backend

  db:
    networks:
      - backend
```

---

### 6. Port Exposure (MEDIUM)

**Risk:** Services bound to `0.0.0.0` are accessible from any network interface.

**Solution:** Bind to localhost when using reverse proxy:

```yaml
nginx:
  ports:
    - "127.0.0.1:${WP_PORT:-8080}:80"

phpmyadmin:
  ports:
    - "127.0.0.1:${PMA_PORT:-8081}:80"
```

---

## WordPress-Specific Security

### 7. Security Headers

The nginx configuration includes basic security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`

**Missing (add to production):**
```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

# Strict Transport Security (only if using HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 8. File Protection (Already Configured)

The nginx configuration already blocks:
- `.git` directories
- `wp-config.php`
- PHP files in uploads
- `xmlrpc.php` (common attack vector)
- `debug.log`
- Hidden files (`.htaccess`, etc.)

### 9. WordPress Admin Security

**Additional hardening for wp-config.php:**
```php
// Disable file editing in admin
define('DISALLOW_FILE_EDIT', true);

// Disable plugin/theme installation (for locked-down production)
define('DISALLOW_FILE_MODS', true);

// Force SSL for admin
define('FORCE_SSL_ADMIN', true);

// Limit post revisions
define('WP_POST_REVISIONS', 5);

// Security keys (regenerate at https://api.wordpress.org/secret-key/1.1/salt/)
define('AUTH_KEY',         'unique-phrase-here');
define('SECURE_AUTH_KEY',  'unique-phrase-here');
define('LOGGED_IN_KEY',    'unique-phrase-here');
define('NONCE_KEY',        'unique-phrase-here');
define('AUTH_SALT',        'unique-phrase-here');
define('SECURE_AUTH_SALT', 'unique-phrase-here');
define('LOGGED_IN_SALT',   'unique-phrase-here');
define('NONCE_SALT',       'unique-phrase-here');
```

---

## SSL/TLS Configuration

For production, always use HTTPS. Options:

### Option A: Reverse Proxy (Recommended)

Use nginx, Traefik, or Caddy as a reverse proxy with Let's Encrypt:

```nginx
# /etc/nginx/sites-available/wordpress
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option B: Traefik with Docker

Add Traefik labels to your docker-compose for automatic SSL.

---

## Recommended Security Plugins

Install via WP-CLI:
```bash
just wp-fpm "plugin install wordfence --activate"
just wp-fpm "plugin install sucuri-scanner --activate"
just wp-fpm "plugin install limit-login-attempts-reloaded --activate"
```

---

## Monitoring & Logging

### Enable Access Logging

Logs are already configured in the docker-compose:
```yaml
volumes:
  - ./logs/nginx:/var/log/nginx
  - ./logs/php:/var/log/php
```

### Monitor for Attacks

```bash
# Watch for failed login attempts
tail -f logs/nginx/access.log | grep "wp-login.php"

# Watch for suspicious PHP errors
tail -f logs/php/error.log
```

---

## Quick Production Deployment Checklist

```bash
# 1. Copy and configure production environment
cp .env.production .env
nano .env  # Change ALL passwords

# 2. Build containers
just build-fpm

# 3. Start WITHOUT optional services
just up-fpm  # NOT 'just up-fpm all'

# 4. Verify debug is disabled
just wp-fpm "config get WP_DEBUG"  # Should return empty or false

# 5. Install security plugins
just wp-fpm "plugin install wordfence --activate"

# 6. Test security headers
curl -I http://localhost:8080 | grep -E "X-Frame|X-XSS|X-Content"

# 7. Verify sensitive files are blocked
curl -I http://localhost:8080/wp-config.php  # Should return 403
curl -I http://localhost:8080/.git/config    # Should return 403
curl -I http://localhost:8080/xmlrpc.php     # Should return 403
```

---

## MySQL Security Hardening

Consider upgrading from MySQL 5.7 (EOL October 2023) to MySQL 8.0:

```yaml
db:
  image: mysql:8.0
```

---

## Related Documentation

- [Docker Compose FPM Configuration](../docker-compose.fpm.yml)
- [Nginx Security Configuration](../docker/nginx/conf.d/wordpress.conf)
- [WordPress Installation Guide](INSTALL.md)
- [Troubleshooting Guide](troubleshooting.md)
