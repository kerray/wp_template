#!/bin/bash

# Script to download a database backup from Wedos MySQL to ./backups
# Uses SITE_NAME from .env file

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create it first."
    exit 1
fi

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "Error: mysql client is not installed. Please install it first."
    echo "You can install it with: sudo apt-get install mysql-client"
    exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp for the backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/${SITE_NAME}_db_backup_$TIMESTAMP.sql"

echo "Starting database backup of ${SITE_NAME}.cz..."

# Use mysqldump to create a backup
# Note: Using the admin user as it has full privileges
mysqldump --host=$REMOTE_DB_HOST \
          --user=$REMOTE_DB_ADMIN_USER \
          --password=$REMOTE_DB_ADMIN_PASS \
          --add-drop-table \
          --no-tablespaces \
          --default-character-set=utf8mb4 \
          $REMOTE_DB_NAME > $BACKUP_FILE

# Check if the backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed successfully!"
    echo "Backup saved to: $BACKUP_FILE"
    
    # Create a compressed version
    echo "Creating compressed backup..."
    gzip -c $BACKUP_FILE > "$BACKUP_FILE.gz"
    echo "Compressed backup saved to: $BACKUP_FILE.gz"
else
    echo "Error: Database backup failed."
    exit 1
fi

echo "Database backup process completed."