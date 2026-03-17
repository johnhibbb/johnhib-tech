# Portfolio Website UX Sketch

*Created 2026-02-23 by María — Target: live by end of week*

---

## Design Principles

1. **Show, don't list.** Every section should feel like evidence, not claims.
2. **Respect the NDA.** The site never tries to hint at or work around confidential work. It earns credibility through what's public.
3. **One clear takeaway:** "This person thinks like a strategist and builds like a practitioner."
4. **Fast to build.** This is a v1 — not a design portfolio. Clean, text-forward, ship it.

---

## Recommended Stack

**Astro + Tailwind + Markdown content files** or **Next.js + MDX**

Why: You want .md files as the content source (easy for us to maintain), fast static site, deploy to Vercel or Netlify in minutes. No CMS overhead.

If speed is the priority: **Astro** is the fastest path from .md files to a live site. Each project is a markdown file with frontmatter. Minimal config.

---

## Site Map

```
johnhibionada.com (or similar)
│
├── / (Home / Landing)
├── /about
├── /work (Project Grid)
├── /work/[project-slug] (Individual Project Pages)
├── /writing (LinkedIn posts / essays — optional for v1)
└── /contact
```

---

## Page-by-Page UX

### 1. Home (Landing Page)

**Purpose:** Instant positioning. Who you are, what you do, why it matters. One screen, one decision: explore or leave.

```
┌─────────────────────────────────────────────┐
│                                             │
│  JOHN HIBIONADA                             │
│                                             │
│  AI strategist. Management consultant.      │
│  I help organizations understand what AI    │
│  can do for their people — then I build     │
│  the proof.                                 │
│                                             │
│  [View Work]          [About Me]            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  SELECTED WORK                              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Project  │  │ Project  │  │ Project  │  │
│  │ Card 1   │  │ Card 2   │  │ Card 3   │  │
│  │          │  │          │  │          │  │
│  │ tag tag  │  │ tag tag  │  │ tag tag  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  [See all work →]                           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  "I didn't arrive at AI through a CS        │
│   degree. I arrived through a decade of     │
│   watching how people relate to products."  │
│                                             │
│  [Read my story →]                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  CONNECT                                    │
│  LinkedIn · Email · GitHub                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Notes:**
- Hero is text-only. No stock imagery. The words do the work.
- Project cards show: title, one-line description, 2-3 tags (e.g., "AI Agent," "Strategy," "Ethics")
- The pull quote section breaks up the page and introduces the non-traditional path narrative
- Minimal navigation: Home, Work, About, Contact

### 2. About Page

**Purpose:** The full story. This is where the non-traditional path narrative lives.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ABOUT                                      │
│                                             │
│  [Photo — professional, approachable,       │
│   not corporate]                            │
│                                             │
│  The long version of who I am and how I     │
│  got here. Written in first person, warm    │
│  but direct. Covers:                        │
│                                             │
│  → The non-traditional path (HR → retail    │
│    → consulting → AI)                       │
│  → What I actually do (translate between    │
│    humans and AI systems)                   │
│  → The NDA reality (framed as intrigue,     │
│    not gap)                                 │
│  → What I'm building now                    │
│  → Where I'm headed                         │
│                                             │
│  ─────────────────────────────────          │
│                                             │
│  EXPERIENCE (timeline view)                 │
│                                             │
│  2024    AI Strategy Consultant · Google    │
│  2022    Management Consultant · Google     │
│  2016    Market Dev & Ops · Beats by Dre    │
│  2016    Management Consultant · Twitter    │
│                                             │
│  ─────────────────────────────────          │
│                                             │
│  SKILLS & TOOLS                             │
│  (Visual grid or tag cloud — not a list)    │
│                                             │
└─────────────────────────────────────────────┘
```

**Notes:**
- Written narrative, not bullet points. This is a story page.
- Experience section is minimal — dates, titles, companies. The work page carries the proof.
- Skills shown as tags or a visual grid, not a resume-style list

### 3. Work Page (Project Grid)

**Purpose:** The portfolio. Each card is a doorway into a case study.

```
┌─────────────────────────────────────────────┐
│                                             │
│  WORK                                       │
│                                             │
│  Filter: [All] [AI Agents] [Strategy]       │
│          [Creative] [Ethics]                │
│                                             │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │                  │  │                  │ │
│  │  Project Title   │  │  Project Title   │ │
│  │  One-line desc   │  │  One-line desc   │ │
│  │                  │  │                  │ │
│  │  tag  tag  tag   │  │  tag  tag  tag   │ │
│  └──────────────────┘  └──────────────────┘ │
│                                             │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │                  │  │                  │ │
│  │  Project Title   │  │  Project Title   │ │
│  │  One-line desc   │  │  One-line desc   │ │
│  │                  │  │                  │ │
│  │  tag  tag  tag   │  │  tag  tag  tag   │ │
│  └──────────────────┘  └──────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Project cards for v1:**

| Project | Tags | One-Liner |
|---|---|---|
| AI Video Skills Library | AI, Product, Feature Design | Standardized library of AI editing behaviors — turning creative concepts into replicable software features |
| Compose My Soundtrack | AI Agent, Music, Workflow | AI agent for music generation with custom workflow and model routing |
| Lore Dropper | AI Agent, Narrative, Product | AI world-building agent — packaging creative AI into a product concept |
| Participant Bill of Rights | Ethics, Governance, Media | Ethical framework for high-stakes human-centric content production |
| Gnome Man's Land | UX, Onboarding, Creative | Short film designed to onboard new users to AI creative tools |
| Strategy Brief Agent | AI Agent, Consulting, Strategy | *(Build this week — translates research notes into executive strategy briefs)* |

### 4. Individual Project Page

**Purpose:** Case study format. This is where hiring managers spend the most time.

```
┌─────────────────────────────────────────────┐
│                                             │
│  PROJECT TITLE                              │
│  tags: AI Agent · Strategy · Consulting     │
│                                             │
│  ─────────────────────────────────          │
│                                             │
│  THE PROBLEM                                │
│  What gap or need this addresses.           │
│                                             │
│  THE APPROACH                               │
│  How you thought about it. Design           │
│  decisions. Strategic framing.              │
│                                             │
│  THE BUILD                                  │
│  What you actually made. Screenshots,       │
│  diagrams, code snippets, workflow maps.    │
│                                             │
│  THE INSIGHT                                │
│  What you learned. What it proves.          │
│  Why it matters beyond this project.        │
│                                             │
│  ─────────────────────────────────          │
│                                             │
│  [← Back to Work]    [Next Project →]       │
│                                             │
└─────────────────────────────────────────────┘
```

**Notes:**
- Each project follows the same four-section structure: Problem → Approach → Build → Insight
- This mirrors how a hiring manager evaluates strategic thinking — they want to see *how you think*, not just what you made
- Visuals are encouraged (screenshots, architecture diagrams, workflow charts) but text carries the weight

### 5. Contact Page

**Purpose:** Simple. Don't overthink it.

```
┌─────────────────────────────────────────────┐
│                                             │
│  LET'S TALK                                 │
│                                             │
│  I'm currently exploring opportunities in   │
│  AI strategy, product, and consulting.      │
│                                             │
│  Email: john@domain.com                     │
│  LinkedIn: linkedin.com/in/johnhib          │
│  GitHub: github.com/johnhib                 │
│                                             │
│  Based in Los Angeles.                      │
│  Open to remote and hybrid.                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Content as Markdown Files

All project content lives as .md files in the repo:

```
/content
  /projects
    ai-video-skills-library.md
    compose-my-soundtrack.md
    lore-dropper.md
    participant-bill-of-rights.md
    gnome-mans-land.md
    strategy-brief-agent.md
  about.md
  contact.md
```

Each project .md has frontmatter:

```yaml
---
title: "AI Video Skills Library"
description: "Standardized library of AI editing behaviors"
tags: ["AI", "Product", "Feature Design"]
date: 2025-12-01
featured: true
order: 1
---
```

This means we can add projects by dropping in a new .md file. No code changes needed.

---

## Visual Direction

- **Typography-forward.** Clean sans-serif (Inter, Satoshi, or similar). Let the words breathe.
- **Minimal color.** Black/white/one accent. The work provides the visual interest.
- **No stock imagery.** Project screenshots, diagrams, or nothing at all.
- **Mobile-first.** Hiring managers check LinkedIn on their phone, click your link on their phone.
- **Fast.** Static site, no spinners, no loading states. Sub-2-second full load.

**Aesthetic reference point:** Think Stripe's documentation site meets a minimal creative portfolio. Clean enough for a PM, interesting enough for a creative director.

---

## Build Timeline (This Week)

| Day | Milestone |
|---|---|
| **Tue** | Finalize stack choice, scaffold project, deploy blank site |
| **Wed** | Home page + About page live with real content |
| **Thu** | Work grid + 2-3 project pages drafted |
| **Fri** | All project pages, contact page, mobile QA |
| **Sat** | Domain connected, final polish, share link |

This is aggressive but doable if the content is written in .md and the site is a static generator. The design decisions are already made above — it's execution from here.

---

## What I Need From You

1. **Domain preference** — johnhibionada.com? johnhib.com? Something else?
2. **Photo** — for the About page. Current headshot or something you like.
3. **Stack preference** — Astro (fastest) vs. Next.js (more flexible long-term)?
4. **Review these wireframes** — anything feel wrong or missing?

Once you greenlight, I can scaffold the project and start populating content.
