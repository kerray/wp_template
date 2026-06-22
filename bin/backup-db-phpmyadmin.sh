#!/bin/bash

# Script to backup database from phpMyAdmin web interface
# For <your-site>; configure connection details in .env

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install it first."
    echo "You can install it with: curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups

echo "Starting database backup of ${SITE_NAME} via phpMyAdmin..."
echo "Debug information will be saved to ./backups/debug_TIMESTAMP/"

# Run the Node.js script
node bin/backup-via-phpmyadmin.js

# Note: If you encounter issues with cookies or browser automation,
# you can run the script in non-headless mode by editing the script
# and setting headless: false in the puppeteer.launch options

# Check if the backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed successfully!"
    echo "Check the debug directory for detailed logs if needed."
else
    echo "Error: Database backup failed."
    echo "Check the debug directory for detailed logs and screenshots to diagnose the issue."
    exit 1
fi

echo "Database backup process completed."