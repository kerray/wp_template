# WordPress Source Directory

This directory will contain the WordPress core files and your custom themes and plugins.

## Structure

When WordPress is installed, this directory will contain:

```
src/
├── wp-admin/           # WordPress admin files
├── wp-content/         # Themes, plugins, and uploads
│   ├── plugins/        # WordPress plugins
│   ├── themes/         # WordPress themes
│   └── uploads/        # Uploaded media files
├── wp-includes/        # WordPress core functionality
├── index.php           # Main WordPress index file
├── wp-config.php       # WordPress configuration
└── ...                 # Other WordPress core files
```

## Installation

The WordPress files will be installed in this directory through one of two methods:

1. **New Installation**: The AI agent will download and extract the latest WordPress files here.
2. **Existing Site**: Files from your existing WordPress site will be imported to this directory.

## Development

When using Docker, this directory is mounted as a volume in the WordPress container, allowing you to edit files directly in your code editor and see changes immediately in your local WordPress environment.

## Version Control

When using Git, certain files and directories should be excluded from version control:
- `wp-config.php` (contains sensitive information)
- `wp-content/uploads/` (can be large and is typically environment-specific)
- `wp-content/upgrade/` (temporary files)

These exclusions are already configured in the project's `.gitignore` file.

## Customization

For custom theme and plugin development, create your files in:
- `wp-content/themes/your-theme-name/`
- `wp-content/plugins/your-plugin-name/`

The AI agent can help you scaffold these directories with the appropriate files.