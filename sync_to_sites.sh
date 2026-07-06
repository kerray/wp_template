#!/bin/bash

# WordPress Template Synchronization Script
# Syncs updated template files to all existing sites while preserving site-specific customizations
#
# Note: the Astro layer splits into two roots with opposite sync semantics.
#   astro-core/     — template-owned shared layer (TEMPLATE_DIRS, overwritten every sync).
#   astro-template/ — scaffold source (TEMPLATE_DIRS, overwritten every sync).
#   astro/          — the per-site app created by `just astro-init` (PROTECTED, never touched).

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Template source directory
TEMPLATE_DIR="/home/kerray/wp_template"

# Target sites
SITES=(
    "/home/kerray/site_kerraycz"
    "/home/kerray/site_waldorf"
    "/home/kerray/site_sapazi"
    "/home/kerray/site_indiancorral"
    "/home/kerray/site_goodkarma"
)

# Files that WILL BE OVERWRITTEN (template files)
TEMPLATE_FILES=(
    "README.md"
    "CLAUDE.md"
    "Justfile"
    "docker-compose.yml"
    ".gitignore"
    "claude_mcp_config.json"
    "wp-sites.example.json"
)

# Directories that WILL BE OVERWRITTEN (template directories)
TEMPLATE_DIRS=(
    "docker"
    "docs"
    ".vscode"
    "astro-core"
    "astro-template"
)

# Files that will NEVER BE TOUCHED (site-specific files)
PROTECTED_FILES=(
    ".env"
    "SITE_CONFIG.md"
    "src"
    "uploads"
    "backups"
    "memlog"
    "logs"
    ".git"
    "astro"
)

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create SITE_CONFIG.md if it doesn't exist
create_site_config() {
    local site_dir="$1"
    local site_name=$(basename "$site_dir")
    
    if [ ! -f "$site_dir/SITE_CONFIG.md" ]; then
        log_info "Creating SITE_CONFIG.md for $site_name"
        cp "$TEMPLATE_DIR/SITE_CONFIG.md" "$site_dir/SITE_CONFIG.md"
        
        # Customize with site name
        sed -i "s/\[Enter your site name\]/$site_name/g" "$site_dir/SITE_CONFIG.md"
        sed -i "s/\[Date\]/$(date +%Y-%m-%d)/g" "$site_dir/SITE_CONFIG.md"
        
        log_success "Created SITE_CONFIG.md for $site_name"
    else
        log_info "SITE_CONFIG.md already exists for $site_name - skipping"
    fi
}

# Function to sync template files to a site
sync_site() {
    local site_dir="$1"
    local site_name=$(basename "$site_dir")
    
    log_info "Syncing template to $site_name..."
    
    # Check if site directory exists
    if [ ! -d "$site_dir" ]; then
        log_error "Site directory $site_dir does not exist - skipping"
        return 1
    fi
    
    # Create SITE_CONFIG.md first
    create_site_config "$site_dir"
    
    # Copy .claude directory if it exists in template
    if [ -d "$TEMPLATE_DIR/.claude" ]; then
        log_info "Syncing .claude directory to $site_name"
        rsync -av --delete "$TEMPLATE_DIR/.claude/" "$site_dir/.claude/" 2>/dev/null || log_warning "Failed to sync .claude directory"
    fi
    
    # Sync template files
    for file in "${TEMPLATE_FILES[@]}"; do
        if [ -f "$TEMPLATE_DIR/$file" ]; then
            log_info "Syncing $file to $site_name"
            cp "$TEMPLATE_DIR/$file" "$site_dir/$file"
        else
            log_warning "Template file $file not found in template"
        fi
    done
    
    # Sync template directories
    for dir in "${TEMPLATE_DIRS[@]}"; do
        if [ -d "$TEMPLATE_DIR/$dir" ]; then
            log_info "Syncing directory $dir to $site_name"
            # Remove existing directory and copy fresh. Use rsync with excludes so
            # installed deps / build output / caches (present in astro-core and
            # astro-template after local testing) never propagate to sites.
            rm -rf "$site_dir/$dir"
            mkdir -p "$site_dir/$dir"
            rsync -a --delete \
                --exclude 'node_modules/' \
                --exclude 'dist/' \
                --exclude '.astro/' \
                "$TEMPLATE_DIR/$dir/" "$site_dir/$dir/"
        else
            log_warning "Template directory $dir not found in template"
        fi
    done
    
    log_success "Template sync completed for $site_name"
}

# Function to verify sync
verify_sync() {
    local site_dir="$1"
    local site_name=$(basename "$site_dir")
    
    log_info "Verifying sync for $site_name..."
    
    # Check that template files exist
    local missing_files=()
    for file in "${TEMPLATE_FILES[@]}"; do
        if [ ! -f "$site_dir/$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All template files present in $site_name"
    else
        log_error "Missing files in $site_name: ${missing_files[*]}"
        return 1
    fi
    
    # Check that protected files were not touched
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -e "$site_dir/$file" ]; then
            log_success "Protected file/directory $file preserved in $site_name"
        fi
    done
    
    # Check for SITE_CONFIG.md
    if [ -f "$site_dir/SITE_CONFIG.md" ]; then
        log_success "SITE_CONFIG.md exists in $site_name"
    else
        log_error "SITE_CONFIG.md missing in $site_name"
    fi
}

# Main execution
main() {
    log_info "Starting WordPress template synchronization..."
    log_info "Template source: $TEMPLATE_DIR"
    log_info "Target sites: ${#SITES[@]}"
    
    # Verify template directory exists
    if [ ! -d "$TEMPLATE_DIR" ]; then
        log_error "Template directory $TEMPLATE_DIR does not exist"
        exit 1
    fi
    
    # Show what will be synced
    log_info "Files that will be OVERWRITTEN:"
    for file in "${TEMPLATE_FILES[@]}"; do
        echo "  - $file"
    done
    
    log_info "Directories that will be OVERWRITTEN:"
    for dir in "${TEMPLATE_DIRS[@]}"; do
        echo "  - $dir"
    done
    
    log_info "Files/directories that will be PROTECTED:"
    for file in "${PROTECTED_FILES[@]}"; do
        echo "  - $file"
    done
    
    # Ask for confirmation
    echo ""
    read -p "Continue with synchronization? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Synchronization cancelled"
        exit 0
    fi
    
    # Sync each site
    local success_count=0
    local total_sites=${#SITES[@]}
    
    for site in "${SITES[@]}"; do
        echo ""
        log_info "Processing $(basename "$site")..."
        
        if sync_site "$site"; then
            if verify_sync "$site"; then
                ((success_count++))
            else
                log_error "Verification failed for $(basename "$site")"
            fi
        else
            log_error "Sync failed for $(basename "$site")"
        fi
    done
    
    # Summary
    echo ""
    log_info "Synchronization Summary:"
    log_info "Total sites: $total_sites"
    log_success "Successfully synced: $success_count"
    
    if [ $success_count -eq $total_sites ]; then
        log_success "All sites synchronized successfully!"
    else
        log_warning "Some sites had issues - please review the output above"
    fi
    
    echo ""
    log_info "Next steps for each site:"
    echo "1. Review SITE_CONFIG.md and customize it with site-specific information"
    echo "2. Test the updated template with: just --list"
    echo "3. Build the new custom container with: just build"
    echo "4. Start the environment with: just up"
    echo "5. Verify MCP functionality with: just mcp-status"
}

# Run main function
main "$@"