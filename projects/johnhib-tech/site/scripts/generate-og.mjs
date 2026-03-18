/**
 * generate-og.mjs
 * Pre-generates static OG images for every article at build time.
 * Output: public/og/[slug].png + public/og/home.png
 *
 * Run: node scripts/generate-og.mjs
 * Hooked into: package.json "build" script (runs before next build)
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Load fonts from public/fonts ────────────────────────────────────────────
const cormorantData = readFileSync(join(ROOT, 'public/fonts/CormorantGaramond-Italic-700.ttf'));
const interData = readFileSync(join(ROOT, 'public/fonts/Inter-Regular.ttf'));

// ─── Load article data ────────────────────────────────────────────────────────
// Import via dynamic require of the compiled data — we read the raw TS source
// and extract slugs/titles/excerpts/tags via simple regex since we can't run TS
// directly. Alternative: maintain a JSON manifest alongside data.ts.

const dataSource = readFileSync(join(ROOT, 'src/lib/articles/data.ts'), 'utf8');

function extractArticles(source) {
  const articles = [];

  // Match slug, title, excerpt, tag blocks in interactiveArticles array
  // This is a lightweight extractor — fragile to major structural changes
  const slugMatches = [...source.matchAll(/slug:\s*["']([^"']+)["']/g)];
  const titleMatches = [...source.matchAll(/title:\s*["']([^"']+)["']/g)];
  const excerptMatches = [...source.matchAll(/excerpt:\s*["']([^"']+)["']/g)];
  const tagMatches = [...source.matchAll(/tag:\s*["']([^"']+)["']/g)];

  for (let i = 0; i < slugMatches.length; i++) {
    articles.push({
      slug: slugMatches[i]?.[1] ?? '',
      title: titleMatches[i]?.[1] ?? 'johnhib.tech',
      excerpt: excerptMatches[i]?.[1] ?? '',
      tag: tagMatches[i]?.[1] ?? null,
    });
  }
  return articles;
}

// ─── Load field notes data ────────────────────────────────────────────────────
const fieldNotesSource = readFileSync(join(ROOT, 'src/lib/field-notes/data.ts'), 'utf8');

function extractFieldNotes(source) {
  const notes = [];
  const slugMatches = [...source.matchAll(/slug:\s*["']([^"']+)["']/g)];
  const titleMatches = [...source.matchAll(/title:\s*["']([^"']+)["']/g)];
  // Extract body content between backtick template literals
  const bodyMatches = [...source.matchAll(/body:\s*`([\s\S]*?)`\s*,?\s*\}/g)];

  for (let i = 0; i < slugMatches.length; i++) {
    const body = bodyMatches[i]?.[1]?.trim() ?? '';
    // Use first 140 chars of body as excerpt
    const excerpt = body.length > 140 ? body.slice(0, 140) + '…' : body;
    notes.push({
      slug: slugMatches[i]?.[1] ?? '',
      title: titleMatches[i]?.[1] ?? 'johnhib.tech',
      excerpt,
      tag: 'Field Notes',
    });
  }
  return notes;
}

const articles = extractArticles(dataSource);
const fieldNotes = extractFieldNotes(fieldNotesSource);

// Always add home
const pages = [
  { slug: 'home', title: 'johnhib.tech', excerpt: '', tag: null, isHome: true },
  ...articles.map(a => ({ ...a, isHome: false })),
  ...fieldNotes.map(n => ({ ...n, isHome: false })),
];

// ─── Card renderer ────────────────────────────────────────────────────────────
const ACCENT = '#1a1a1a';
const BG = '#ffffff';
const W = 1200;
const H = 630;

function buildCard({ title, excerpt, tag, isHome }) {
  const truncated = excerpt.length > 140 ? excerpt.slice(0, 140) + '…' : excerpt;

  return {
    type: 'div',
    props: {
      style: {
        width: `${W}px`,
        height: `${H}px`,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 72px',
      },
      children: [
        // Top bar
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            children: [
              {
                type: 'span',
                props: {
                  style: { color: '#999', fontSize: 25, letterSpacing: '0.06em', fontFamily: 'Inter', fontWeight: 400 },
                  children: 'johnhib.tech',
                },
              },
              tag ? {
                type: 'span',
                props: {
                  style: {
                    color: '#666',
                    border: '1px solid #ccc',
                    borderRadius: 3,
                    padding: '5px 14px',
                    fontSize: 17,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  },
                  children: tag,
                },
              } : { type: 'span', props: { children: '' } },
            ],
          },
        },

        // Center content
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 24 },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Cormorant Garamond',
                    fontStyle: 'italic',
                    fontSize: isHome ? 120 : 90,
                    color: ACCENT,
                    lineHeight: 1.08,
                    letterSpacing: '-0.01em',
                  },
                  children: title,
                },
              },
              !isHome && excerpt ? {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: '#888',
                    fontSize: 28,
                    lineHeight: 1.5,
                    maxWidth: 860,
                  },
                  children: truncated,
                },
              } : { type: 'span', props: { children: '' } },
            ],
          },
        },

        // Bottom rule + tagline
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 14 },
            children: [
              { type: 'div', props: { style: { width: '100%', height: 1, background: '#e5e5e5' } } },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontWeight: 400, color: '#aaa', fontSize: 24, letterSpacing: '0.04em' },
                  children: 'Building with AI, documented as it happens.',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ─── Generate PNGs ────────────────────────────────────────────────────────────
const outDir = join(ROOT, 'public/og');
mkdirSync(outDir, { recursive: true });

for (const page of pages) {
  const svg = await satori(buildCard(page), {
    width: W,
    height: H,
    fonts: [
      { name: 'Cormorant Garamond', data: cormorantData, style: 'italic', weight: 700 },
      { name: 'Inter', data: interData, style: 'normal', weight: 400 },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const png = resvg.render().asPng();
  const outPath = join(outDir, `${page.slug}.png`);
  writeFileSync(outPath, png);
  console.log(`✓ ${page.slug}.png (${Math.round(png.length / 1024)}KB)`);
}

console.log(`\nGenerated ${pages.length} OG images → public/og/`);
