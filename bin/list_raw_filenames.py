#!/usr/bin/env python3
"""
Script to list filenames in their raw form to help diagnose encoding issues.
"""

import os
import sys
from pathlib import Path
import re


def list_raw_filenames(directory, level=0):
    """List filenames in their raw form."""
    try:
        entries = list(directory.iterdir())
    except PermissionError:
        print(f"{'  ' * level}Permission denied: {directory}")
        return

    # Print directory name
    print(f"{'  ' * level}Directory: {directory}")

    # List files first
    for entry in entries:
        if entry.is_file():
            name = entry.name
            # Check if the filename contains escape sequences
            has_escapes = "$\\" in name or "'$'" in name
            if has_escapes:
                print(f"{'  ' * (level + 1)}File (with escapes): {repr(name)}")
            else:
                print(f"{'  ' * (level + 1)}File: {name}")

    # Then list subdirectories
    for entry in entries:
        if entry.is_dir():
            list_raw_filenames(entry, level + 1)


def main():
    """Main function to process command line arguments."""
    if len(sys.argv) > 1:
        target_dir = Path(sys.argv[1])
    else:
        target_dir = Path("src/fotogalerie")

    if not target_dir.exists() or not target_dir.is_dir():
        print(f"Error: Directory not found: {target_dir}")
        sys.exit(1)

    print(f"Listing raw filenames in: {target_dir}")
    list_raw_filenames(target_dir)


if __name__ == "__main__":
    main()
