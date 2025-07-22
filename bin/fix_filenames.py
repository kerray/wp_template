#!/usr/bin/env python3
"""
Script to fix corrupted filenames with escape sequences in WSL environment.
This script converts bash-style escape sequences like $'\240' back to proper Unicode characters.
"""

import os
import re
import sys
import shutil
from pathlib import Path


def decode_bash_escape(match):
    """Convert bash-style octal escape sequences to Unicode characters."""
    octal_str = match.group(1)
    try:
        # Convert octal to integer, then to character
        char_code = int(octal_str, 8)
        return chr(char_code)
    except ValueError:
        # Return the original if conversion fails
        return match.group(0)


def fix_filename(old_path):
    """Fix a single filename with escape sequences."""
    old_name = old_path.name

    # Skip files that don't have escape sequences
    if "$\\" not in old_name and "'$'" not in old_name:
        return False

    # Replace bash-style escape sequences with actual characters
    # This handles both $'\240' and '$'\240'' formats
    new_name = re.sub(r"\$\'\\(\d{3})\'", decode_bash_escape, old_name)
    new_name = re.sub(r"\'?\$\'\\(\d{3})\'\'?", decode_bash_escape, new_name)

    if old_name == new_name:
        return False

    new_path = old_path.parent / new_name

    # Check if destination already exists
    if new_path.exists():
        print(f"Warning: Destination exists, skipping: {new_path}")
        return False

    print(f"Renaming: '{old_name}' -> '{new_name}'")
    try:
        shutil.move(str(old_path), str(new_path))
        return True
    except Exception as e:
        print(f"Error renaming {old_path}: {e}")
        return False


def process_directory(directory):
    """Process all files in a directory and its subdirectories."""
    print(f"Processing directory: {directory}")

    # Get all files and directories
    try:
        entries = list(directory.iterdir())
    except PermissionError:
        print(f"Permission denied: {directory}")
        return 0

    count = 0

    # First process files
    for entry in entries:
        if entry.is_file():
            if fix_filename(entry):
                count += 1

    # Then process subdirectories (get the list again in case names changed)
    try:
        entries = list(directory.iterdir())
    except PermissionError:
        return count

    for entry in entries:
        if entry.is_dir():
            count += process_directory(entry)

    return count


def main():
    """Main function to process command line arguments and start fixing filenames."""
    if len(sys.argv) > 1:
        target_dir = Path(sys.argv[1])
    else:
        target_dir = Path("src/fotogalerie")

    if not target_dir.exists() or not target_dir.is_dir():
        print(f"Error: Directory not found: {target_dir}")
        sys.exit(1)

    print(f"Fixing filenames in: {target_dir}")
    count = process_directory(target_dir)
    print(f"Filename fixing complete! Fixed {count} filenames.")


if __name__ == "__main__":
    main()
