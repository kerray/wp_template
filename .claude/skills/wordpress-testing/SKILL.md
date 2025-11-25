---
name: wordpress-testing
description: Runs WordPress site tests using Playwright. Use when testing site functionality, checking for PHP errors, verifying pages load correctly, or running pre-deployment checks.
---

# WordPress Testing

Comprehensive testing framework for WordPress sites using Playwright.

## Quick Commands

```bash
just test-local      # Test local WordPress (localhost:8080)
just test-prod       # Test production site
just test-both       # Test both environments
just test-quick      # Quick test suite (60s timeout)
just test-custom URL # Test any URL
```

## Setup (First Time)

```bash
just test-setup       # Install Node.js dependencies + Playwright
just test-setup-deps  # Install system dependencies (requires sudo)
```

## Test Coverage

The test suite detects:

| Category | What It Catches |
|----------|----------------|
| **PHP Errors** | Fatal errors, warnings, notices, deprecated functions |
| **HTTP Status** | 404s, 500s, and all error status codes |
| **Page Validation** | Content loading, element presence, navigation |
| **Performance** | Load times, resource optimization |
| **JavaScript** | Console errors, failed AJAX requests |
| **WordPress** | Plugin conflicts, theme issues, database errors |
| **Custom Features** | Events system (akce), forms, search, media |

## When to Test

**ALWAYS run tests after:**

- Plugin updates (`just plugin-update-all`)
- Theme modifications
- WordPress core updates
- Configuration changes
- Database imports
- Custom code changes
- Before deploying to production

## Testing Workflow

```bash
# Standard workflow after changes:
just test-local      # Verify local changes work
just test-prod       # Compare with production baseline
just test-report     # Review any errors or warnings
```

## Viewing Results

### Screenshots

```bash
just test-screenshots           # List available screenshots
just open-screenshot filename   # Open specific screenshot
```

### Reports

```bash
just test-report     # View latest JSON report
```

### Cleanup

```bash
just test-clean      # Remove screenshots and reports
```

## Test Files

| File | Purpose |
|------|---------|
| `test-site.js` | Main testing script |
| `package.json` | Node.js dependencies |
| `test-config.json` | Test configuration |
| `run-tests.sh` | Alternative bash script |

## Troubleshooting

### Tests won't start

```bash
just status          # Verify WordPress is running
just up              # Start if needed
```

### Playwright installation fails

```bash
sudo npx playwright install-deps   # System dependencies
npx playwright install             # Browsers
```

### Tests timeout

```bash
just test-quick      # Use shorter timeout
```

## Documentation

See [Testing Documentation](../../../docs/testing.md) for detailed information.
