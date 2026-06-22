# WordPress AI Development Container
# Based on official WordPress with pre-installed dev tools
FROM wordpress:latest

# Metadata
LABEL maintainer="WordPress AI Workspace Template"
LABEL description="Custom WordPress container with WP-CLI, Composer, and MCP plugin support"
LABEL version="1.0.0"

# Version environment variables
ENV COMPOSER_VERSION=2.7.1
ENV WP_CLI_VERSION=2.11.0
ENV WP_MCP_VERSION=0.2.3

# Accept user and group ID as build arguments for permission mapping
ARG USER_ID=1000
ARG GROUP_ID=1000

# Create a group and user with the same ID as the host user
RUN groupadd -g ${GROUP_ID} hostgroup \
    && useradd -u ${USER_ID} -g hostgroup -m -s /bin/bash hostuser

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    vim \
    nano \
    less \
    && rm -rf /var/lib/apt/lists/*

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
    && mkdir -p /var/www/html/wp-content/upgrade

# Set proper ownership for wp-content
RUN chown -R www-data:www-data /var/www/html/wp-content \
    && chmod -R 755 /var/www/html/wp-content

# Pre-install WordPress MCP Plugin
RUN cd /tmp \
    && curl -L "https://github.com/Automattic/wordpress-mcp/archive/refs/tags/v${WP_MCP_VERSION}.tar.gz" -o wordpress-mcp.tar.gz \
    && tar -xzf wordpress-mcp.tar.gz \
    && mv wordpress-mcp-${WP_MCP_VERSION} /var/www/html/wp-content/plugins/wordpress-mcp \
    && cd /var/www/html/wp-content/plugins/wordpress-mcp \
    && composer install --no-dev --optimize-autoloader \
    && chown -R www-data:www-data /var/www/html/wp-content/plugins/wordpress-mcp \
    && rm /tmp/wordpress-mcp.tar.gz

# Add custom PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Create entrypoint script to handle initialization
COPY docker/wordpress/entrypoint.sh /usr/local/bin/custom-entrypoint.sh
RUN chmod +x /usr/local/bin/custom-entrypoint.sh

# Set working directory
WORKDIR /var/www/html

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]
CMD ["apache2-foreground"]