# johnhib.com — Build Brief

## What This Is

John Elliott Hibionada's primary portfolio and presence. Not a blog, not a resume dump — a cinematic space. The feeling: you've stepped into someone's creative world and you're not quite sure how big it is yet. Dark, expansive, atmospheric.

Reference aesthetic: [try.wideframe.com](https://try.wideframe.com) — the "empty odyssey" feeling. Sparse. Heavy use of negative space. Text that feels like it belongs on a theater wall.

Think: a filmmaker who also engineers. A strategist with aesthetic instincts. Someone who operates at the intersection of AI, creative direction, and systems thinking.

---

## Design System

### Palette
- Background: `#080808` (near-black, not pure black — has warmth)
- Primary text: `#F2F0EB` (off-white, warm)
- Accent: `#C8A96E` (warm gold — used sparingly for hover states, selected states, subtle highlights)
- Muted text: `#6B6B6B`
- Border/divider: `#1A1A1A`

### Typography
- **Display / Hero:** `PP Editorial New` via Google Fonts fallback → `'Georgia', serif` — italic for atmosphere
- **Body / UI:** `Inter` via `next/font/google` — clean, neutral, readable
- **Mono / labels:** `JetBrains Mono` via `next/font/google` — for metadata, dates, tags

Font sizes (rem-based, fluid via clamp):
- Hero title: `clamp(3rem, 8vw, 7rem)`
- Section title: `clamp(1.5rem, 3vw, 2.5rem)`
- Body: `1rem` / `1.6` line-height
- Label/meta: `0.75rem` uppercase tracking-widest

### Spacing
- Max content width: `1200px`
- Section padding: `120px` vertical on desktop, `64px` on mobile
- Generous whitespace — resist the urge to fill

### Motion
- Subtle fade-in on scroll (use `IntersectionObserver`, no library)
- Hover states: slow opacity transitions `300ms ease`
- No jarring animations — everything breathes

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Fonts:** `next/font/google` — Inter + JetBrains Mono; Editorial New via CSS import fallback
- **Icons:** none (use text/symbol instead of icon packs)
- **Deploy target:** Vercel
- **No CMS, no MDX** — static content in TSX
- **No analytics** at build time

### Init command
```bash
cd /Users/maria/.openclaw/workspace-main/projects/johnhib-com
npx create-next-app@latest site --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
cd site && npm install
```

---

## Site Structure

Single-page scroll with distinct sections. No top nav. Optional sticky minimal nav appears after hero scroll.

```
/                       — Home (all sections)
/work/[slug]            — Individual project page (dynamic)
```

---

## Sections (in order)

### 1. Hero

Full viewport height. Nearly empty.

Left-aligned, vertically centered content:

```
JOHN HIBIONADA
——————————————
Creative Technologist
Los Angeles
```

- Name in display serif (Editorial New or Georgia italic), large
- Divider: a single thin horizontal rule, `60px` wide, `#C8A96E`
- Subtitle and location in Inter, muted
- Absolutely no buttons or CTAs in the hero — just presence
- Subtle ambient text in the far bottom-right corner: `↓ work` in mono, muted, pointing down

Background: pure `#080808`. No gradients, no particles, no video.

---

### 2. Work

Section heading: `Work` — small, mono, uppercase, letter-spaced, muted

4–6 project cards in a grid (2-col desktop, 1-col mobile). Each card:

**Card anatomy:**
```
[aspect-ratio 16:9 placeholder image area — dark #111 bg]
 
Project Title               Year
Short descriptor            →
```

- No borders on cards — whitespace does the separation
- Hover: title shifts to gold (`#C8A96E`), arrow rotates 45deg
- Image area: if no image, use a dark rectangle with project initials as a centered label in mono

**Projects to include (static):**

| Title | Year | Descriptor | Status | Slug |
|---|---|---|---|---|
| Sphere | 2026 | DaVinci Resolve OFX plugin for 360° video reframing | In Progress | `sphere` |
| Rodeo | 2025 | Video creation platform — Fan Line, Producer Mode, Creator Voice | Past | `rodeo` |
| johnhib.tech | 2026 | Writings on AI, tools, and working with language models | Live | (external link to johnhib.tech) |
| Backyard Cinematic Universe | 2025 | Episodic suburban world — THE SHED DIVE, THE SQUIRREL DERBY | Concept | `backyard-cinematic` |
| AI Video Skills Library | 2025 | Defined editing behaviors for AI-assisted video production | Reference | `ai-video-skills` |

---

### 3. About

Section heading: `About` — same mono style as Work

Two columns on desktop, stacked on mobile:
- **Left (60%):** bio copy
- **Right (40%):** sparse metadata list

**Bio copy (use verbatim):**

> I work at the intersection of creative production and technical execution — designing systems, agents, and workflows around AI rather than just using them.
>
> By day, I'm a management consultant embedded in YouTube's creator ecosystem, translating creator needs into product decisions. Before that, I helped scale Beats by Dr. Dre across Canada. The throughline is always the same: understand how people actually experience something, then build better.
>
> The work I'm most interested in right now is what happens when AI tools get genuinely expressive — not just capable. That gap between functional and resonant is where I spend most of my time.

**Metadata (right column):**
```
Currently
Management Consultant → Google/YouTube
Los Angeles

Background
Strategy & Operations
Creative Direction
AI Tooling & Agents

Contact
john@johnhib.tech
```

---

### 4. Footer

Minimal. Single row.

```
© 2026 John Hibionada          johnhib.tech    ↑ Top
```

Left: copyright. Center: link to .tech. Right: scroll-to-top.

All in mono, muted, small.

---

## Individual Work Pages (`/work/[slug]`)

Each project gets a page. Structure:

```
← Back

[PROJECT TITLE]
Year · Category

[Hero image or dark placeholder]

[Body copy — 2–4 paragraphs]

[Optional: what I did / what I learned — two short columns]
```

### Project content

**Sphere**
> A DaVinci Resolve OFX plugin that enables real-time 360° video reframing — pan, tilt, zoom — without leaving your timeline. Built for documentary and event videographers who shoot in 360 for coverage insurance but need to deliver conventional 16:9 output.
>
> Currently in active development. Stage 1: Xcode + OFX SDK scaffold, gyroscope data pipeline, three isolated proofs-of-concept.

What I did: `Plugin Architecture · OFX SDK · DaVinci Resolve Integration`
Status: `In Progress`

---

**Rodeo**
> A video creation platform concept built during my time on YouTube's creator tools team. Rodeo introduced Fan Line (direct fan-to-creator video messages), Producer Mode (structured creative briefs for collaborations), and Creator Voice Replies (AI-assisted response generation at scale).
>
> The work involved translating raw user research into high-fidelity product concepts — going from creator interviews to pitch-ready prototypes presented to YouTube leadership.

What I did: `User Research · Product Strategy · Prototyping · Stakeholder Presentations`
Status: `Past`

---

**Backyard Cinematic Universe**
> A suburban episodic world built for the AI video era. Three pilots in development: THE SHED DIVE (treasure hunting in backyard structures), THE SQUIRREL DERBY (competitive wildlife chaos), and THE GREAT LEAP (a frog's journey, told cinematically).
>
> The project is both a creative work and a technical demo — each episode uses a different AI video pipeline (Kling, Runway, LTX Studio) to show what's actually possible right now, not in theory.

What I did: `Concept · Scriptwriting · AI Video Direction`
Status: `In Development`

---

**AI Video Skills Library**
> A reference library of defined editing behaviors for AI-assisted video production. Each "skill" is a named, repeatable pattern: Kinetic Speed (propulsive time compression), The Reveal (slow environmental disclosure), Unscripted Cut (raw-footage rhythm preservation).
>
> Built as internal reference, now maintained as a public resource for teams integrating AI into post-production workflows.

What I did: `Taxonomy · Documentation · Production Reference`
Status: `Living Reference`

---

## File Structure

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, fonts, metadata
│   │   ├── page.tsx            # Home — all sections
│   │   ├── globals.css         # Tailwind base + custom tokens
│   │   └── work/
│   │       └── [slug]/
│   │           └── page.tsx    # Dynamic project page
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── Work.tsx
│   │   ├── WorkCard.tsx
│   │   ├── About.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── projects.ts         # Static project data
├── public/
│   └── (empty — no images yet)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Tailwind Tokens

In `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      bg: '#080808',
      surface: '#111111',
      text: '#F2F0EB',
      muted: '#6B6B6B',
      gold: '#C8A96E',
      border: '#1A1A1A',
    },
    fontFamily: {
      sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-jetbrains)', 'monospace'],
      display: ['Georgia', 'Times New Roman', 'serif'],
    },
  },
}
```

---

## Component Notes

### Scroll Fade-In
```tsx
// Use a simple IntersectionObserver hook, no library
// Add class 'opacity-0 translate-y-4' initially
// Toggle to 'opacity-100 translate-y-0 transition-all duration-700' on intersect
```

### Work Card Hover
```tsx
// Tailwind: group hover
// Title: group-hover:text-gold transition-colors duration-300
// Arrow: group-hover:rotate-45 transition-transform duration-300
```

### Sticky Nav (appears after hero)
```tsx
// Fixed top-0, translucent bg: bg-bg/80 backdrop-blur-sm
// Contains: JOHN HIBIONADA (left) + Work · About (right)
// Hidden until scrollY > 100vh
```

---

## Quality Bar

- Mobile-first, fully responsive
- 95+ Lighthouse performance
- Dark mode only (no toggle — this site is always dark)
- `npm run build` passes clean before handoff
- Semantic HTML — `<main>`, `<section>`, `<article>`, `<nav>` used correctly

---

## Delivery

Output to: `/Users/maria/.openclaw/workspace-main/projects/johnhib-com/site/`

When done, run `npm run build` and confirm clean. Report any warnings.
