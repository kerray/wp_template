#!/bin/bash

# Script to download the complete WordPress site from a remote FTP host to ./src

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create it first."
    exit 1
fi

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo "Error: lftp is not installed. Please install it first."
    echo "You can install it with: sudo apt-get install lftp"
    exit 1
fi

# Create src directory if it doesn't exist
mkdir -p src

echo "Starting download of ${REMOTE_FTP_HOST} website files..."
echo "This may take some time depending on the size of the site."

# Use lftp to mirror the remote site to the local src directory
lftp -c "set ssl:verify-certificate no; \
         open -u $REMOTE_FTP_USER,$REMOTE_FTP_PASS $REMOTE_FTP_HOST; \
         mirror --verbose --delete --parallel=4 / ./src"

# Set proper permissions
echo "Setting proper file permissions..."
chmod -R 755 src
find src -type d -exec chmod 755 {} \;
find src -type f -exec chmod 644 {} \;

echo "Website files download completed successfully!"
echo "Files are available in the ./src directory."