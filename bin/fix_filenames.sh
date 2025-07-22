#!/bin/bash

# Script to fix corrupted filenames with escape sequences
# Usage: ./fix_filenames.sh [directory]

set -e

TARGET_DIR="${1:-src/fotogalerie}"
echo "Fixing filenames in: $TARGET_DIR"

# Function to convert escape sequences to proper characters
fix_filename() {
    local old_name="$1"
    local dir_path="$2"
    
    # Skip files that don't have escape sequences
    if [[ "$old_name" != *'$'* ]]; then
        return
    fi
    
    # Use printf to interpret the escape sequences
    # This converts things like $'\240' to the actual character
    local new_name=$(echo "$old_name" | sed 's/\$\\[0-9]\{3\}/\\\\\\/g' | xargs -0 printf "%b")
    
    if [ "$old_name" != "$new_name" ]; then
        echo "Renaming: '$old_name' -> '$new_name'"
        # Use mv with -i to prompt before overwrite
        mv -i "$dir_path/$old_name" "$dir_path/$new_name"
    fi
}

# Process all files in the directory and subdirectories
process_directory() {
    local dir="$1"
    echo "Processing directory: $dir"
    
    # First, process files in the current directory
    for file in "$dir"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            fix_filename "$filename" "$dir"
        fi
    done
    
    # Then process subdirectories
    for subdir in "$dir"/*; do
        if [ -d "$subdir" ]; then
            process_directory "$subdir"
        fi
    done
}

# Start processing
process_directory "$TARGET_DIR"

echo "Filename fixing complete!"