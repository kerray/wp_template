#!/bin/bash

# WordPress CLI wrapper for Docker environment
# This script allows running WP-CLI commands inside the WordPress container

# Display help if no arguments provided
if [ $# -eq 0 ]; then
    echo "WordPress CLI wrapper for Docker environment"
    echo "Usage: $0 [wp-cli command]"
    echo ""
    echo "Examples:"
    echo "  $0 core version                # Check WordPress version"
    echo "  $0 plugin list                 # List installed plugins"
    echo "  $0 theme activate twentytwenty # Activate a theme"
    echo "  $0 user list                   # List WordPress users"
    echo ""
    echo "For more WP-CLI commands, visit: https://developer.wordpress.org/cli/commands/"
    exit 0
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed or not in PATH"
    echo "Please install Docker and docker-compose before using this script"
    exit 1
fi

# Check if WordPress container is running
if ! docker-compose ps | grep -q "wordpress.*Up"; then
    echo "Warning: WordPress container does not appear to be running"
    echo "Starting Docker environment..."
    docker-compose up -d
    
    # Wait for container to be ready
    echo "Waiting for WordPress container to be ready..."
    sleep 5
fi

# Execute WP-CLI command in the WordPress container
echo "Running: wp $@"
docker-compose exec wordpress wp "$@"