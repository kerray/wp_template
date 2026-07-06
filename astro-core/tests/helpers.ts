import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { ContentNode } from '../src/lib/content/ir';

const here = dirname(fileURLToPath(import.meta.url));

export function loadFixture(...parts: string[]): string {
  return readFileSync(join(here, 'fixtures', ...parts), 'utf8');
}

/** Recursively collect a { nodeType: count } histogram of an IR tree. */
export function nodeHistogram(nodes: ContentNode[]): Record<string, number> {
  const hist: Record<string, number> = {};
  const walk = (list: ContentNode[]) => {
    for (const n of list) {
      hist[n.type] = (hist[n.type] ?? 0) + 1;
      if (n.type === 'section' || n.type === 'columns' || n.type === 'column') walk(n.children);
      else if (n.type === 'buttongroup') walk(n.children);
      else if (n.type === 'tabs') n.tabs.forEach((t) => walk(t.children));
    }
  };
  walk(nodes);
  return hist;
}

/** Max nesting depth of layout containers (section/columns/column). */
export function maxDepth(nodes: ContentNode[]): number {
  let max = 0;
  const walk = (list: ContentNode[], depth: number) => {
    max = Math.max(max, depth);
    for (const n of list) {
      if (n.type === 'section' || n.type === 'columns' || n.type === 'column') {
        walk(n.children, depth + 1);
      } else if (n.type === 'buttongroup') {
        walk(n.children, depth + 1);
      } else if (n.type === 'tabs') {
        n.tabs.forEach((t) => walk(t.children, depth + 1));
      }
    }
  };
  walk(nodes, 0);
  return max;
}

export function collectWarnings(): { warn: (m: string) => void; warnings: string[] } {
  const warnings: string[] = [];
  return { warn: (m: string) => warnings.push(m), warnings };
}
