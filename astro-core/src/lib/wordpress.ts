/**
 * WordPress data layer (build-time, typed, generic).
 *
 * Primary source: the custom headless feed added by the `headless-api` mu-plugin
 * at /wp-json/{restNamespace}/* (default namespace `headless/v1`), which exposes
 * DIVI-stripped `cleanContent` and a token-gated `raw` post_content the content
 * adapters parse.
 *
 * Resilience contract (ported from the waldorf prototype, generalized):
 *   - Try the custom namespace feed first.
 *   - Fall back to core REST (/wp/v2/*) when the plugin isn't deployed and
 *     `coreFallback` is enabled.
 *   - Return [] (or a safe empty object) on hard network failure so a spike
 *     build never breaks. Every fallback is logged — an empty build is never
 *     silent.
 *
 * Site-specific shapes (custom post types like `akce`, taxonomies, school years)
 * are NOT modelled here — each site extends this in its own `src/lib`.
 */

import { readEnv } from './config';

/* ------------------------------ options -------------------------------- */

export interface WpClientOptions {
  /** WP origin, e.g. "https://wp.example.com". Trailing slash tolerated. */
  baseUrl: string;
  /** Headless mu-plugin namespace. Default 'headless/v1'. */
  restNamespace?: string;
  /** Fall back to core /wp/v2/* when the custom feed is unavailable. Default true. */
  coreFallback?: boolean;
  /**
   * Bearer token for the token-gated raw endpoint. Falls back to
   * HEADLESS_API_TOKEN from the environment when omitted.
   */
  token?: string;
  /** Warning sink; defaults to console.warn. */
  warn?: (message: string) => void;
}

interface ResolvedEndpoints {
  custom: string;
  core: string;
  coreFallback: boolean;
  token: string | undefined;
  warn: (message: string) => void;
}

function resolve(opts: WpClientOptions): ResolvedEndpoints {
  const base = opts.baseUrl.replace(/\/$/, '');
  const ns = (opts.restNamespace ?? 'headless/v1').replace(/^\/|\/$/g, '');
  return {
    custom: `${base}/wp-json/${ns}`,
    core: `${base}/wp-json/wp/v2`,
    coreFallback: opts.coreFallback ?? true,
    token: opts.token ?? readEnv('HEADLESS_API_TOKEN'),
    warn: opts.warn ?? ((m: string) => console.warn(m)),
  };
}

/* ------------------------------- types --------------------------------- */

/** A standard page. */
export interface WpPage {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Raw body from core REST — clean HTML for Gutenberg, DIVI shortcodes for legacy. */
  content: string;
  /**
   * Builder-stripped clean HTML from the custom feed. Empty when the custom
   * plugin isn't deployed (core-REST fallback).
   */
  cleanContent: string;
  date: string;
  modified: string;
  link: string;
  /** Parent page id (0 = top level). */
  parent: number;
  /** WP menu_order. */
  menuOrder: number;
}

/** A standard blog post. */
export interface WpPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  link: string;
  image: string;
}

/** A media/attachment object. */
export interface WpMedia {
  id: number;
  source_url: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Site-level metadata (custom `/site` feed or core `/settings`). */
export interface WpSite {
  name: string;
  description: string;
  url: string;
}

/**
 * A raw page for adapter input: the token-gated `raw` post_content plus the
 * server-rendered HTML and builder-stripped cleanContent as fallbacks.
 */
export interface WpRawPage {
  id: number;
  slug: string;
  title: string;
  /**
   * Which builder authored this item's body: 'markdown' | 'gutenberg' | 'divi' |
   * 'html'. Optional — absent until the backend lands the engine contract, in
   * which case the loader sniffs `raw` and falls back to the site default hint.
   */
  engine?: string;
  /** Unprocessed post_content (Markdown / DIVI shortcodes / Gutenberg / HTML). */
  raw: string;
  /** Server-rendered HTML. */
  rendered: string;
  /** Builder-stripped clean HTML. */
  cleanContent: string;
  excerpt: string;
  modified: string;
  parent: number;
  menuOrder: number;
}

/* ------------------------------ fetch core ----------------------------- */

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Fetch every page of a paginated core-REST collection. */
async function fetchAllCore(
  core: string,
  endpoint: string,
  params: Record<string, string> = {},
): Promise<any[]> {
  const perPage = 100;
  let page = 1;
  const all: any[] = [];
  for (;;) {
    const url = new URL(`${core}/${endpoint}`);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (res.status === 400 && page > 1) break; // past last page
    if (!res.ok) throw new Error(`WP core ${endpoint} p${page} -> ${res.status}`);
    const batch = (await res.json()) as any[];
    all.push(...batch);
    const totalPages = Number(res.headers.get('X-WP-TotalPages') || '1');
    if (page >= totalPages || batch.length < perPage) break;
    page += 1;
  }
  return all;
}

function coreToWpPage(item: any): WpPage {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered ?? '',
    excerpt: item.excerpt?.rendered ?? '',
    content: item.content?.rendered ?? '',
    cleanContent: '',
    date: item.date ?? '',
    modified: item.modified ?? '',
    link: item.link ?? '',
    parent: item.parent ?? 0,
    menuOrder: item.menu_order ?? 0,
  };
}

function coreToWpPost(item: any): WpPost {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered ?? '',
    excerpt: (item.excerpt?.rendered ?? '').replace(/<[^>]+>/g, '').trim(),
    content: item.content?.rendered ?? '',
    date: item.date ?? '',
    modified: item.modified ?? '',
    link: item.link ?? '',
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '',
  };
}

/* ------------------------------ public API ----------------------------- */

/**
 * Standard pages. Custom feed first (adds `cleanContent`), core REST fallback.
 */
export async function fetchPages(opts: WpClientOptions): Promise<WpPage[]> {
  const { custom, core, coreFallback, warn } = resolve(opts);
  try {
    return await getJson<WpPage[]>(`${custom}/pages`);
  } catch (customErr) {
    warn(`[wp] custom ${custom}/pages unavailable (${(customErr as Error).message})`);
    if (!coreFallback) return [];
    try {
      const raw = await fetchAllCore(core, 'pages', {
        status: 'publish',
        _fields: 'id,slug,title,excerpt,content,date,modified,link,parent,menu_order',
      });
      return raw.map(coreToWpPage);
    } catch (coreErr) {
      warn(`[wp] core pages fetch failed (${(coreErr as Error).message}); returning []`);
      return [];
    }
  }
}

/**
 * Blog posts (newest-first). Custom feed first, core REST fallback with
 * embedded featured media.
 */
export async function fetchPosts(opts: WpClientOptions, limit?: number): Promise<WpPost[]> {
  const { custom, core, coreFallback, warn } = resolve(opts);
  try {
    const items = await getJson<WpPost[]>(`${custom}/posts`);
    return typeof limit === 'number' ? items.slice(0, limit) : items;
  } catch (customErr) {
    warn(`[wp] custom ${custom}/posts unavailable (${(customErr as Error).message})`);
    if (!coreFallback) return [];
    try {
      const url = new URL(`${core}/posts`);
      url.searchParams.set('per_page', String(limit ?? 100));
      url.searchParams.set('_embed', 'wp:featuredmedia');
      url.searchParams.set('status', 'publish');
      const raw = await getJson<any[]>(url.toString());
      return raw.map(coreToWpPost);
    } catch (coreErr) {
      warn(`[wp] core posts fetch failed (${(coreErr as Error).message}); returning []`);
      return [];
    }
  }
}

/**
 * A custom-post-type collection. Pass either a CPT slug (resolved against the
 * custom `/collection/{cpt}` feed, then core `/wp/v2/{cpt}`) or a full endpoint
 * path (e.g. "akce" or "waldorf/v1/akce"). Returns raw JSON items — sites map
 * these into their own typed shapes.
 */
export async function fetchCollection(
  opts: WpClientOptions,
  cptOrEndpoint: string,
): Promise<any[]> {
  const { custom, core, coreFallback, warn } = resolve(opts);
  const cpt = cptOrEndpoint.replace(/^\//, '');
  try {
    return await getJson<any[]>(`${custom}/collection/${cpt}`);
  } catch (customErr) {
    warn(`[wp] custom ${custom}/collection/${cpt} unavailable (${(customErr as Error).message})`);
    if (!coreFallback) return [];
    try {
      return await fetchAllCore(core, cpt, { status: 'publish' });
    } catch (coreErr) {
      warn(`[wp] core collection ${cpt} fetch failed (${(coreErr as Error).message}); returning []`);
      return [];
    }
  }
}

/** Site-level metadata. Custom `/site` feed first, core `/settings` fallback. */
export async function fetchSite(opts: WpClientOptions): Promise<WpSite> {
  const { custom, core, coreFallback, warn } = resolve(opts);
  const empty: WpSite = { name: '', description: '', url: '' };
  try {
    return await getJson<WpSite>(`${custom}/site`);
  } catch (customErr) {
    warn(`[wp] custom ${custom}/site unavailable (${(customErr as Error).message})`);
    if (!coreFallback) return empty;
    try {
      // /wp/v2/settings needs auth; the root index is public and carries these.
      const idx = await getJson<any>(core.replace(/\/wp\/v2$/, ''));
      return {
        name: idx.name ?? '',
        description: idx.description ?? '',
        url: idx.url ?? idx.home ?? '',
      };
    } catch (coreErr) {
      warn(`[wp] core site fetch failed (${(coreErr as Error).message}); returning empty`);
      return empty;
    }
  }
}

/**
 * Token-gated raw page bodies for adapter input: hits `{ns}/pages?raw=1` with a
 * Bearer token. Returns [] on any failure (no core fallback — core REST doesn't
 * expose the builder-stripped cleanContent or unfiltered raw content); the
 * loader is responsible for falling back to `fetchPages`.
 */
export async function fetchRawContent(opts: WpClientOptions): Promise<WpRawPage[]> {
  const { custom, token, warn } = resolve(opts);
  if (!token) {
    warn(`[wp] no HEADLESS_API_TOKEN set; skipping raw content feed`);
    return [];
  }
  try {
    const items = await getJson<any[]>(`${custom}/pages?raw=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return items.map((item): WpRawPage => ({
      id: item.id,
      slug: item.slug,
      title: typeof item.title === 'string' ? item.title : (item.title?.rendered ?? ''),
      ...(typeof item.engine === 'string' ? { engine: item.engine } : {}),
      raw: item.raw ?? item.content?.raw ?? '',
      rendered: item.rendered ?? item.content?.rendered ?? '',
      cleanContent: item.cleanContent ?? '',
      excerpt: typeof item.excerpt === 'string' ? item.excerpt : (item.excerpt?.rendered ?? ''),
      modified: item.modified ?? '',
      parent: item.parent ?? 0,
      menuOrder: item.menuOrder ?? item.menu_order ?? 0,
    }));
  } catch (err) {
    warn(`[wp] raw content feed unavailable (${(err as Error).message}); returning []`);
    return [];
  }
}
