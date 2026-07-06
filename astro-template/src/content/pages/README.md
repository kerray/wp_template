# Curated page overrides

Drop one `.md` file per page here to override the headless-WordPress feed for
that slug. These curated Markdown bodies are the **highest-priority** source in
`src/pages/[...slug].astro` — they beat the adapter-parsed `wpPages` IR and the
`cleanContent` HTML fallback.

Frontmatter (see `src/content.config.ts` for the full schema):

```md
---
title: About our school
wpSlug: o-skole        # optional; defaults to the filename
source: divi           # divi | gutenberg | manual
draft: false           # true to keep the file but skip the build
---

Body in clean Markdown. Do **not** repeat the title — it is rendered as the <h1>.
```

Generate a starting draft with the `divi-to-astro-content` skill
(`.claude/skills/divi-to-astro-content/scripts/divi_to_markdown.py`), then
hand-review — DIVI flattening is intentionally lossy.
