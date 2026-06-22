# Website Testing

Optional testing framework for WordPress sites using Playwright.

## Quick Reference

```bash
just test-local         # Test local WordPress (http://localhost:8080)
just test-prod          # Test production site
just test-both          # Test both environments
just test-quick         # Quick test suite (60s timeout)
just test-custom <url>  # Test any URL
```

## Setup

### Install Dependencies

```bash
# Install Node.js dependencies and Playwright
just test-setup

# Install Playwright system dependencies (requires sudo)
just test-setup-deps
```

### Prerequisites

- Node.js installed on your system
- npm dependencies: `npm install`
- Playwright browsers: `npx playwright install`
- System deps: `sudo npx playwright install-deps`

## Test Coverage

A comprehensive test suite can detect:

| Category | What It Catches |
|----------|----------------|
| **PHP Errors** | Fatal errors, warnings, notices, deprecated functions |
| **HTTP Status** | 404s, 500s, and all error status codes |
| **Page Validation** | Content loading, element presence, navigation |
| **Performance** | Load times, resource optimization, responsiveness |
| **JavaScript** | Console errors, failed AJAX requests |
| **WordPress-Specific** | Plugin conflicts, theme issues, database errors |

## Test Results

### View Screenshots

```bash
just test-screenshots    # List available screenshots
just open-screenshot <filename>  # Open specific screenshot
```

### View Reports

```bash
just test-report         # View latest JSON report
```

### Clean Artifacts

```bash
just test-clean          # Remove screenshots and reports
```

## Test Files

| File | Purpose |
|------|---------|
| `test-site.js` | Main testing script (if configured) |
| `package.json` | Node.js dependencies and npm scripts |
| `test-config.json` | Testing configuration and page definitions |

## Testing Artifacts

Auto-generated files (excluded from Git):

- `test-report-*.json` - Detailed JSON test reports with timestamps
- `test-screenshots/` - Full-page screenshots for debugging

## When to Test

**ALWAYS run tests after:**

- Plugin updates (`just plugin-update-all`)
- Theme modifications (custom CSS, functions.php changes)
- WordPress core updates (`just wp "core update"`)
- Configuration changes (wp-config.php, .htaccess)
- Database imports (`just db-import`)
- Custom code changes (PHP, JavaScript, CSS)
- Server configuration changes
- Before deploying to production

## Testing Workflow

```bash
# After ANY changes, run:
just test-local           # Verify local changes work
just test-prod           # Compare with production baseline
just test-report         # Review any errors or warnings

# If tests pass, you're safe to proceed
# If tests fail, fix issues before continuing
```

## Troubleshooting

### Tests Won't Start

```bash
# Verify WordPress is running
just status

# Start environment if needed
just up
```

### Playwright Installation Fails

```bash
# Run system dependencies separately
sudo npx playwright install-deps

# Then install browsers
npx playwright install
```

### Screenshots Not Generating

Check that the `test-screenshots/` directory is writable and has sufficient disk space.

## Setting Up Testing for Your Project

If testing commands are not available, you can add them by:

1. Creating a `test-site.js` script with Playwright
2. Adding npm dependencies to `package.json`
3. Adding test recipes to the `Justfile`

See the testing documentation in similar projects for examples.
