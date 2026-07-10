#!/usr/bin/env node
// visual-review.mjs — site-agnostic Playwright screenshot crawl + contact sheet.
//
// Screenshots a list of routes full-page at desktop (1440px) and mobile (390px)
// on a --base site, optionally side-by-side with a --compare site (e.g. the
// production design reference). Emits PNGs plus a self-contained index.html
// contact sheet of labeled thumbnails linking to the full images.
//
// This is the CANONICAL copy (wp_template/bin). A byte-identical working copy
// lives where Playwright deps resolve for the site (waldorf: site_waldorf/bin).
//
// Usage:
//   node visual-review.mjs [routes...] [options]
//   node visual-review.mjs / /kalendar /kontakty
//   node visual-review.mjs --routes routes.txt --compare https://example.com
//
// Options:
//   --base <url>       Site under review        (default http://localhost:4325)
//   --compare <url>    Reference site for side-by-side columns (optional)
//   --routes <file>    File of routes, one per line (# comments, blanks ignored)
//   --out <dir>        Output directory  (default ./visual-review/<timestamp>/)
//   --timeout <ms>     Per-navigation timeout   (default 45000)
//   -h, --help         Show this help
//
// Routes may be given as positional args and/or via --routes; they merge.
// Exit code is non-zero only on a fatal setup error (e.g. Playwright missing);
// per-route capture failures are recorded in the contact sheet, never silent.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

function parseArgs(argv) {
  const opts = {
    base: 'http://localhost:4325',
    compare: null,
    out: null,
    routesFile: null,
    timeout: 45000,
    routes: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h':
      case '--help':
        opts.help = true;
        break;
      case '--base': opts.base = argv[++i]; break;
      case '--compare': opts.compare = argv[++i]; break;
      case '--out': opts.out = argv[++i]; break;
      case '--routes': opts.routesFile = argv[++i]; break;
      case '--timeout': opts.timeout = parseInt(argv[++i], 10); break;
      default:
        if (a.startsWith('--')) {
          console.error(`Unknown option: ${a}`);
          process.exit(2);
        }
        opts.routes.push(a);
    }
  }
  return opts;
}

const HELP = `visual-review.mjs — Playwright screenshot crawl + contact sheet

Usage:
  node visual-review.mjs [routes...] [options]

Options:
  --base <url>       Site under review        (default http://localhost:4325)
  --compare <url>    Reference site for side-by-side columns (optional)
  --routes <file>    File of routes, one per line (# comments, blanks ignored)
  --out <dir>        Output directory  (default ./visual-review/<timestamp>/)
  --timeout <ms>     Per-navigation timeout   (default 45000)
  -h, --help         Show this help
`;

// Turn a route path into a filesystem-safe slug.
function routeSlug(route) {
  const trimmed = route.replace(/^\/+|\/+$/g, '');
  if (trimmed === '') return 'home';
  return trimmed.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function joinUrl(base, route) {
  const b = base.replace(/\/+$/, '');
  const r = route.startsWith('/') ? route : `/${route}`;
  return `${b}${r}`;
}

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Capture one full-page screenshot; returns {file, bytes} or {error}.
async function capture(context, url, outPath, timeout) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout });
    // Give hydration / islands (e.g. Kalendar) and lazy images a moment to settle.
    await page.waitForTimeout(1200);
    // Trigger lazy-loaded imagery by scrolling to the bottom, then back up.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollBy(0, window.innerHeight);
          y += window.innerHeight;
          if (y < document.body.scrollHeight) setTimeout(step, 100);
          else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
        };
        step();
      });
    });
    await page.waitForTimeout(400);
    const buf = await page.screenshot({ fullPage: true });
    await writeFile(outPath, buf);
    return { file: path.basename(outPath), bytes: buf.length };
  } catch (err) {
    return { error: err.message };
  } finally {
    await page.close();
  }
}

function renderContactSheet({ base, compare, results, outDir }) {
  const hasCompare = Boolean(compare);
  const cell = (shot, label) => {
    if (!shot || shot.error) {
      return `<div class="cell err"><div class="ph">FAILED</div><div class="cap">${esc(label)}<br><span class="msg">${esc(shot ? shot.error : 'not captured')}</span></div></div>`;
    }
    const kb = (shot.bytes / 1024).toFixed(0);
    return `<div class="cell"><a href="${esc(shot.file)}" target="_blank"><img loading="lazy" src="${esc(shot.file)}" alt="${esc(label)}"></a><div class="cap">${esc(label)} <span class="msg">${kb} KB</span></div></div>`;
  };

  const sections = results.map((r) => {
    const rows = VIEWPORTS.map((vp) => {
      const baseShot = r.shots[`base-${vp.name}`];
      if (hasCompare) {
        const cmpShot = r.shots[`compare-${vp.name}`];
        return `<div class="row">
          <div class="rowlabel">${esc(vp.name)} · ${vp.width}px</div>
          <div class="pair">
            ${cell(baseShot, `base · ${vp.name}`)}
            ${cell(cmpShot, `compare · ${vp.name}`)}
          </div>
        </div>`;
      }
      return `<div class="row">
        <div class="rowlabel">${esc(vp.name)} · ${vp.width}px</div>
        <div class="pair single">${cell(baseShot, `base · ${vp.name}`)}</div>
      </div>`;
    }).join('\n');
    return `<section class="route">
      <h2>${esc(r.route)}</h2>
      ${rows}
    </section>`;
  }).join('\n');

  const legend = hasCompare
    ? `<p class="legend"><span class="k">base</span> ${esc(base)} &nbsp;·&nbsp; <span class="k cmp">compare</span> ${esc(compare)}</p>`
    : `<p class="legend"><span class="k">base</span> ${esc(base)}</p>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Visual review — ${esc(timestamp())}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.5 system-ui, sans-serif; background: #f4f4f5; color: #18181b; }
  @media (prefers-color-scheme: dark) { body { background: #18181b; color: #e4e4e7; } }
  header { padding: 20px 24px; border-bottom: 1px solid #d4d4d8; position: sticky; top: 0; background: inherit; z-index: 2; }
  @media (prefers-color-scheme: dark) { header { border-color: #3f3f46; } }
  h1 { margin: 0 0 4px; font-size: 18px; }
  .legend { margin: 0; font-size: 12px; opacity: .8; }
  .k { display: inline-block; padding: 1px 6px; border-radius: 4px; background: #2563eb; color: #fff; font-weight: 600; }
  .k.cmp { background: #16a34a; }
  main { padding: 16px 24px 60px; max-width: 1600px; margin: 0 auto; }
  .route { margin: 0 0 28px; }
  .route > h2 { font-size: 15px; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #a1a1aa; font-family: monospace; }
  .row { margin: 0 0 14px; }
  .rowlabel { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; opacity: .6; margin-bottom: 4px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pair.single { grid-template-columns: 1fr; max-width: 780px; }
  .cell { background: #fff; border: 1px solid #d4d4d8; border-radius: 6px; overflow: hidden; }
  @media (prefers-color-scheme: dark) { .cell { background: #27272a; border-color: #3f3f46; } }
  .cell img { display: block; width: 100%; height: auto; max-height: 620px; object-fit: cover; object-position: top; background: #fff; }
  .cell.err { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 160px; border-color: #dc2626; }
  .ph { font-weight: 700; color: #dc2626; letter-spacing: .1em; }
  .cap { padding: 6px 8px; font-size: 12px; border-top: 1px solid #e4e4e7; }
  @media (prefers-color-scheme: dark) { .cap { border-color: #3f3f46; } }
  .cap .msg { opacity: .55; }
  .cell.err .cap .msg { color: #dc2626; opacity: 1; }
</style></head>
<body>
<header>
  <h1>Visual review · ${esc(timestamp())}</h1>
  ${legend}
</header>
<main>
  ${sections}
</main>
</body></html>`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(HELP); return; }

  let routes = [...opts.routes];
  if (opts.routesFile) {
    const lines = readFileSync(opts.routesFile, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    routes.push(...lines);
  }
  // De-dupe, preserve order.
  routes = [...new Set(routes)];
  if (routes.length === 0) {
    console.error('No routes given. Pass routes as args or via --routes <file>.');
    process.exit(2);
  }

  const outDir = path.resolve(opts.out || path.join('visual-review', timestamp()));
  await mkdir(outDir, { recursive: true });

  console.log(`visual-review`);
  console.log(`  base:    ${opts.base}`);
  if (opts.compare) console.log(`  compare: ${opts.compare}`);
  console.log(`  routes:  ${routes.length}`);
  console.log(`  out:     ${outDir}`);
  console.log('');

  const browser = await chromium.launch();
  const results = [];
  let failures = 0;

  const targets = [{ key: 'base', url: opts.base }];
  if (opts.compare) targets.push({ key: 'compare', url: opts.compare });

  for (const route of routes) {
    const slug = routeSlug(route);
    const shots = {};
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        ignoreHTTPSErrors: true,
      });
      for (const t of targets) {
        const url = joinUrl(t.url, route);
        const fileName = `${t.key}__${slug}__${vp.name}.png`;
        const outPath = path.join(outDir, fileName);
        process.stdout.write(`  [${t.key}/${vp.name}] ${route} … `);
        const res = await capture(context, url, outPath, opts.timeout);
        if (res.error) {
          failures++;
          console.log(`FAILED (${res.error.split('\n')[0]})`);
        } else {
          console.log(`ok (${(res.bytes / 1024).toFixed(0)} KB)`);
        }
        shots[`${t.key}-${vp.name}`] = res;
      }
      await context.close();
    }
    results.push({ route, slug, shots });
  }

  await browser.close();

  const html = renderContactSheet({
    base: opts.base,
    compare: opts.compare,
    results,
    outDir,
  });
  const sheetPath = path.join(outDir, 'index.html');
  await writeFile(sheetPath, html);

  console.log('');
  console.log(`Contact sheet: ${sheetPath}`);
  if (failures) console.log(`Capture failures: ${failures} (see contact sheet)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
