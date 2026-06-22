# Plugins

This directory is intentionally empty in the public template. Plugins are **not**
tracked here — premium/licensed plugins can't be redistributed publicly, and the
rest are site-specific.

For your own sites, drop plugins into this folder (gitignored), or restore your
working set from the private overlay repo
([`wp_private`](https://github.com/kerray/wp_private)):

```bash
rsync -a /path/to/wp_private/wp-content/plugins/ ./src/wp-content/plugins/
```

You can also install free plugins from wordpress.org with WP-CLI, e.g.:

```bash
just wp "plugin install generateblocks code-snippets --activate"
```
