#!/bin/bash

# WordPress Template Synchronization Script (Generic Version)
# Syncs template files to multiple WordPress site instances while preserving site-specific customizations
# 
# Usage: ./sync-template.sh [options]
#   -f, --force     Skip confirmation prompt
#   -v, --verbose   Show detailed output
#   -d, --dry-run   Show what would be done without making changes
#   -h, --help      Show this help message

set -euo pipefail

# Configuration - modify these for your setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"
SITES_BASE_DIR="$(dirname "$TEMPLATE_DIR")"

# Default site patterns - modify for your site naming convention
SITE_PATTERN="site_*"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
FORCE=false
VERBOSE=false
DRY_RUN=false

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
    ".claude"
)

# Files that will NEVER BE TOUCHED (site-specific files)
PROTECTED_FILES=(
    ".env"
    "SITE_CONFIG.md"
    "src"
    "uploads"
    "backups"
    "logs"
    ".git"
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

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

show_help() {
    echo "WordPress Template Synchronization Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -f, --force     Skip confirmation prompt"
    echo "  -v, --verbose   Show detailed output"
    echo "  -d, --dry-run   Show what would be done without making changes"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Configuration:"
    echo "  Template directory: $TEMPLATE_DIR"
    echo "  Sites base directory: $SITES_BASE_DIR"
    echo "  Site pattern: $SITE_PATTERN"
    echo ""
    echo "Files that will be synchronized (overwritten):"
    for file in "${TEMPLATE_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Directories that will be synchronized (overwritten):"
    for dir in "${TEMPLATE_DIRS[@]}"; do
        echo "  - $dir/"
    done
    echo ""
    echo "Files/directories that will be protected:"
    for file in "${PROTECTED_FILES[@]}"; do
        echo "  - $file"
    done
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                FORCE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Discover site directories automatically
discover_sites() {
    local sites=()
    
    # Find directories matching the site pattern
    for dir in "$SITES_BASE_DIR"/$SITE_PATTERN; do
        if [ -d "$dir" ] && [ "$dir" != "$TEMPLATE_DIR" ]; then
            sites+=("$dir")
        fi
    done
    
    echo "${sites[@]}"
}

# Function to create SITE_CONFIG.md if it doesn't exist
create_site_config() {
    local site_dir="$1"
    local site_name=$(basename "$site_dir")
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would create SITE_CONFIG.md for $site_name"
        return 0
    fi
    
    if [ ! -f "$site_dir/SITE_CONFIG.md" ]; then
        log_verbose "Creating SITE_CONFIG.md for $site_name"
        
        if [ -f "$TEMPLATE_DIR/SITE_CONFIG.md" ]; then
            cp "$TEMPLATE_DIR/SITE_CONFIG.md" "$site_dir/SITE_CONFIG.md"
            
            # Customize with site name and date
            sed -i "s/\[Enter your site name\]/$site_name/g" "$site_dir/SITE_CONFIG.md" 2>/dev/null || true
            sed -i "s/\[Date\]/$(date +%Y-%m-%d)/g" "$site_dir/SITE_CONFIG.md" 2>/dev/null || true
            
            log_success "Created SITE_CONFIG.md for $site_name"
        else
            log_warning "Template SITE_CONFIG.md not found - skipping creation"
        fi
    else
        log_verbose "SITE_CONFIG.md already exists for $site_name - skipping"
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
    
    # Sync template files
    for file in "${TEMPLATE_FILES[@]}"; do
        if [ -f "$TEMPLATE_DIR/$file" ]; then
            if [ "$DRY_RUN" = true ]; then
                log_info "[DRY RUN] Would sync $file to $site_name"
            else
                log_verbose "Syncing $file to $site_name"
                cp "$TEMPLATE_DIR/$file" "$site_dir/$file"
            fi
        else
            log_warning "Template file $file not found in template"
        fi
    done
    
    # Sync template directories
    for dir in "${TEMPLATE_DIRS[@]}"; do
        if [ -d "$TEMPLATE_DIR/$dir" ]; then
            if [ "$DRY_RUN" = true ]; then
                log_info "[DRY RUN] Would sync directory $dir to $site_name"
            else
                log_verbose "Syncing directory $dir to $site_name"
                # Remove existing directory and copy fresh
                rm -rf "$site_dir/$dir"
                cp -r "$TEMPLATE_DIR/$dir" "$site_dir/$dir"
            fi
        else
            log_warning "Template directory $dir not found in template"
        fi
    done
    
    # Update .env with tool versions if missing
    if [ -f "$site_dir/.env" ] && ! grep -q "COMPOSER_VERSION" "$site_dir/.env"; then
        if [ "$DRY_RUN" = true ]; then
            log_info "[DRY RUN] Would add tool versions to $site_name .env"
        else
            log_verbose "Adding tool versions to $site_name .env"
            {
                echo ""
                echo "# Development Tool Versions"
                echo "COMPOSER_VERSION=2.7.1"
                echo "WP_CLI_VERSION=2.11.0"
                echo "WP_MCP_VERSION=0.2.3"
            } >> "$site_dir/.env"
        fi
    fi
    
    if [ "$DRY_RUN" = false ]; then
        log_success "Template sync completed for $site_name"
    fi
}

# Function to verify sync
verify_sync() {
    local site_dir="$1"
    local site_name=$(basename "$site_dir")
    
    if [ "$DRY_RUN" = true ]; then
        return 0
    fi
    
    log_verbose "Verifying sync for $site_name..."
    
    # Check that template files exist
    local missing_files=()
    for file in "${TEMPLATE_FILES[@]}"; do
        if [ ! -f "$site_dir/$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_verbose "All template files present in $site_name"
    else
        log_error "Missing files in $site_name: ${missing_files[*]}"
        return 1
    fi
    
    # Check that protected files were not touched
    local protected_count=0
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -e "$site_dir/$file" ]; then
            ((protected_count++))
        fi
    done
    
    log_verbose "Protected files/directories preserved in $site_name: $protected_count"
    
    # Check for SITE_CONFIG.md
    if [ -f "$site_dir/SITE_CONFIG.md" ]; then
        log_verbose "SITE_CONFIG.md exists in $site_name"
    else
        log_error "SITE_CONFIG.md missing in $site_name"
        return 1
    fi
    
    return 0
}

# Main execution
main() {
    parse_args "$@"
    
    local mode_text=""
    if [ "$DRY_RUN" = true ]; then
        mode_text=" (DRY RUN MODE)"
    fi
    
    log_info "Starting WordPress template synchronization$mode_text..."
    log_info "Template source: $TEMPLATE_DIR"
    
    # Verify template directory exists
    if [ ! -d "$TEMPLATE_DIR" ]; then
        log_error "Template directory $TEMPLATE_DIR does not exist"
        exit 1
    fi
    
    # Discover sites automatically
    local sites=($(discover_sites))
    
    if [ ${#sites[@]} -eq 0 ]; then
        log_error "No sites found matching pattern '$SITE_PATTERN' in $SITES_BASE_DIR"
        exit 1
    fi
    
    log_info "Found ${#sites[@]} sites to sync:"
    for site in "${sites[@]}"; do
        echo "  - $(basename "$site")"
    done
    echo ""
    
    # Show what will be synced
    if [ "$VERBOSE" = true ]; then
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
        echo ""
    fi
    
    # Ask for confirmation unless forced or dry run
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        echo "Continue with synchronization? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log_info "Synchronization cancelled"
            exit 0
        fi
    fi
    
    # Sync each site
    local success_count=0
    local total_sites=${#sites[@]}
    
    for site in "${sites[@]}"; do
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
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Dry run completed - no changes made"
    else
        log_success "Successfully synced: $success_count"
        
        if [ $success_count -eq $total_sites ]; then
            log_success "All sites synchronized successfully!"
            
            echo ""
            log_info "Next steps for each site:"
            echo "1. Review and customize SITE_CONFIG.md with site-specific information"
            echo "2. Build the updated custom container: just build"
            echo "3. Start the environment: just up"
            echo "4. Verify MCP functionality: just mcp-status"
        else
            log_warning "Some sites had issues - please review the output above"
        fi
    fi
}

# Run main function with all arguments
main "$@"