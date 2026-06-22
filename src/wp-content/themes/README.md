# Themes

This directory is intentionally empty in the public template. Themes are **not**
tracked here — the previous child theme was site-specific.

For your own sites, drop themes into this folder (gitignored), or restore them
from the private overlay repo
([`wp_private`](https://github.com/kerray/wp_private)):

```bash
rsync -a /path/to/wp_private/wp-content/themes/ ./src/wp-content/themes/
```

Or install a stock theme from wordpress.org with WP-CLI:

```bash
just wp "theme install generatepress --activate"
```
