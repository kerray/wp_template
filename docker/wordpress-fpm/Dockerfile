# WordPress PHP-FPM AI Development Container
# Based on official WordPress FPM with pre-installed dev tools
FROM wordpress:6-php8.2-fpm-alpine

# Metadata
LABEL maintainer="WordPress AI Workspace Template"
LABEL description="Custom WordPress PHP-FPM container with WP-CLI, Composer, and MCP plugin support"
LABEL version="2.1.0"

# Version environment variables (can be overridden at build time)
ARG COMPOSER_VERSION=2.7.1
ARG WP_CLI_VERSION=2.11.0
ARG WP_MCP_VERSION=0.2.3
ARG USER_ID=1000
ARG GROUP_ID=1000

ENV COMPOSER_VERSION=${COMPOSER_VERSION}
ENV WP_CLI_VERSION=${WP_CLI_VERSION}
ENV WP_MCP_VERSION=${WP_MCP_VERSION}
ENV HOST_USER_ID=${USER_ID}
ENV HOST_GROUP_ID=${GROUP_ID}

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    unzip \
    vim \
    nano \
    less \
    shadow \
    su-exec \
    mysql-client \
    && rm -rf /var/cache/apk/*

# Create a group and user with the same ID as the host user (for file permission sync)
RUN if getent group ${GROUP_ID} > /dev/null 2>&1; then \
        delgroup $(getent group ${GROUP_ID} | cut -d: -f1) 2>/dev/null || true; \
    fi \
    && addgroup -g ${GROUP_ID} hostgroup \
    && if getent passwd ${USER_ID} > /dev/null 2>&1; then \
        deluser $(getent passwd ${USER_ID} | cut -d: -f1) 2>/dev/null || true; \
    fi \
    && adduser -u ${USER_ID} -G hostgroup -D -s /bin/bash hostuser

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=${COMPOSER_VERSION} \
    && chmod +x /usr/local/bin/composer

# Install WP-CLI
RUN curl -L "https://github.com/wp-cli/wp-cli/releases/download/v${WP_CLI_VERSION}/wp-cli-${WP_CLI_VERSION}.phar" -o /usr/local/bin/wp \
    && chmod +x /usr/local/bin/wp

# Create wp-content structure early
RUN mkdir -p /var/www/html/wp-content/plugins \
    && mkdir -p /var/www/html/wp-content/themes \
    && mkdir -p /var/www/html/wp-content/uploads \
    && mkdir -p /var/www/html/wp-content/upgrade \
    && mkdir -p /var/log/php

# Set proper ownership for wp-content (will be overridden by mount, but good for initial state)
RUN chown -R www-data:www-data /var/www/html/wp-content \
    && chmod -R 755 /var/www/html/wp-content \
    && chown -R www-data:www-data /var/log/php

# Pre-install WordPress MCP Plugin
RUN cd /tmp \
    && curl -L "https://github.com/Automattic/wordpress-mcp/archive/refs/tags/v${WP_MCP_VERSION}.tar.gz" -o wordpress-mcp.tar.gz \
    && tar -xzf wordpress-mcp.tar.gz \
    && mv wordpress-mcp-${WP_MCP_VERSION} /var/www/html/wp-content/plugins/wordpress-mcp \
    && cd /var/www/html/wp-content/plugins/wordpress-mcp \
    && composer install --no-dev --optimize-autoloader \
    && chown -R www-data:www-data /var/www/html/wp-content/plugins/wordpress-mcp \
    && rm /tmp/wordpress-mcp.tar.gz

# Configure PHP-FPM to run as host user for bidirectional file editing
RUN sed -i "s/user = www-data/user = hostuser/" /usr/local/etc/php-fpm.d/www.conf \
    && sed -i "s/group = www-data/group = hostgroup/" /usr/local/etc/php-fpm.d/www.conf

# Configure PHP-FPM to listen on all interfaces (needed for Docker networking)
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf || true

# Enable PHP-FPM status page for health checks
RUN echo "pm.status_path = /status" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "ping.path = /ping" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "ping.response = pong" >> /usr/local/etc/php-fpm.d/www.conf

# Create entrypoint script to handle initialization
COPY entrypoint-fpm.sh /usr/local/bin/custom-entrypoint.sh
RUN chmod +x /usr/local/bin/custom-entrypoint.sh

# Set working directory
WORKDIR /var/www/html

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]
CMD ["php-fpm"]
