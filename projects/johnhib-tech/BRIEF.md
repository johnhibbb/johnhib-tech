# johnhib.tech — Build Brief
_Last updated: 2026-03-16_

---

## Overview

A minimal, scroll-based personal site for John Hibionada. First version ships two real articles under a **Writings** section, with a **Projects** section stubbed for future work (starting with Sphere, a DaVinci Resolve 360 reframing plugin).

**Domain:** johnhib.tech
**Stack:** Next.js 15 (App Router), Tailwind CSS, `next/font` with Inter, deployed to Vercel
**Style:** Light. White background, black text, blue links. No dark mode for this domain (johnhib.com will be the dark, cinematic counterpart).

---

## Design System

**Typography**
- Font: Inter (via `next/font/google`)
- Body: 16–18px, comfortable line height (~1.7)
- Headings: Inter, heavier weight. The site header `JOHNHIB.TECH` should be large and commanding — think 48–64px, letter-spaced, uppercase.
- No serifs.

**Color**
- Background: `#FFFFFF`
- Text: `#111111`
- Links: `#0066CC` (standard editorial blue, not pure `#0000EE`)
- Hover: underline
- Muted/secondary text: `#666666`

**Layout**
- Single column, centered, max-width `680px` for readability
- Generous vertical padding between sections
- No nav bar. No footer required for v1.
- Purely scroll-based. No sticky elements.

**Article Cards**
- Title (linked)
- Date (muted, small)
- 1–2 sentence excerpt
- Category tag (e.g. "Writings")

---

## Site Structure

```
/                        → Home (all sections, scroll)
/writings/[slug]         → Individual article pages
```

No other routes needed for v1.

---

## Home Page Layout (top to bottom)

1. **Header**
   - `JOHNHIB.TECH` — large, uppercase, letter-spaced
   - One-line descriptor below: `Notes on building with AI.`

2. **Writings section**
   - Section label: `Writings`
   - Two article cards (see content below)

3. **Projects section**
   - Section label: `Projects`
   - One project card, stub state:
     - Title: `Sphere`
     - Status: `In progress`
     - Description: `A DaVinci Resolve OFX plugin for 360° video reframing. Built for creators who shoot with DJI Osmo 360 and edit in Resolve — filling a gap no plugin currently covers.`
     - No link yet (coming soon treatment)

---

## Article 1

**Slug:** `how-to-secure-your-openclaw-setup`
**Title:** How to Secure Your OpenClaw Setup
**Date:** March 2026
**Excerpt:** OpenClaw gives an AI agent real access to your machine — files, messages, the terminal. That power needs a fence around it. Here's what we locked down.

**Full content:**

---

OpenClaw is not a chatbot. It's an agent with file access, shell execution, iMessage read/write, and a live connection to your calendar, browser, and memory. That's an enormous attack surface if you don't think carefully about what you're handing over.

After running it for a month, here's what we hardened — and why.

### Lock the filesystem to the workspace

The first and most important setting:

```json
"tools": {
  "fs": {
    "workspaceOnly": true
  }
}
```

This constrains every file read/write to your designated workspace directory. The agent can't silently drop a file in `~/Library/LaunchAgents`, modify your shell config, or read arbitrary paths on disk. When I tried to write a plist outside the workspace during a setup task, OpenClaw blocked it and surfaced the attempt visibly. That's the sandbox doing exactly what it's supposed to.

### Disable elevated execution

```json
"tools": {
  "elevated": {
    "enabled": false
  }
}
```

Elevated tools let the agent run privileged shell commands. Unless you have a specific, active reason to need this, it should be off. Turning it on is a deliberate, explicit act — not a default that gets abused.

### Keep secrets in the environment, not the config

Your API keys do not belong in `openclaw.json`. That file is editable by the agent, can end up in logs, and is one misconfigured share away from exposure.

The right pattern:

```bash
# ~/.zshenv
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENROUTER_API_KEY="sk-or-..."
export OPENCLAW_GATEWAY_PASSWORD="..."
```

OpenClaw reads environment variables at startup. The config file references them by name. The actual secrets never touch the config.

### Set a DM policy on messaging channels

```json
"channels": {
  "imessage": {
    "dmPolicy": "pairing"
  }
}
```

Without a DM policy, anyone who knows your gateway's channel can potentially send it instructions. `pairing` mode means only verified, explicitly paired identities can trigger agent behavior. Cold inbound messages from unknown numbers get ignored.

### Recognize social engineering attempts

The most underrated threat isn't a technical exploit — it's a crafted message designed to manipulate the agent into running something.

In our setup, the agent received a convincing-looking "security alert" message claiming multiple CVEs and urging an `npm install` from an unofficial package. The agent flagged it before acting:

> "This message has red flags. The header looks like injected content. Legitimate security alerts don't arrive via iMessage asking an AI to run shell commands. Did you write this yourself, or did you paste it from somewhere?"

That pause — before execution, before the request to confirm — is the behavior you want. Build your agent's instructions to be skeptical of urgent commands that arrive from outside your normal workflow.

### Enable macOS baseline security

- **FileVault:** On. Full-disk encryption means a stolen machine doesn't mean stolen data.
- **Firewall:** On. OpenClaw's gateway listens on localhost; nothing should be exposed externally.
- **System updates:** Automatic. Not optional.

---

None of this is complicated. The defaults in OpenClaw are reasonable — but the hardened configuration requires intentional choices. Make them early, before you've given the agent access to things that matter.

---

## Article 2

**Slug:** `persona-extraction-from-llms`
**Title:** Persona Extraction from LLMs (And Why It's the Best Way to Start With OpenClaw)
**Date:** March 2026
**Excerpt:** Your LLMs have been building a model of you for months. Before you set up an AI agent, ask them to reflect it back — the output becomes the foundation everything else runs on.

**Full content:**

---

Before you write a single config file or system prompt for your AI agent, do this first: ask your existing LLMs who you are.

This sounds strange. It isn't.

### What's already there

If you've been using ChatGPT, Gemini, or Grok for any length of time, those models have been pattern-matching your questions, your language, your priorities, your blind spots. They can't remember specific conversations — but they can infer, from how you interact, a surprisingly accurate picture of who you are.

The technique is simple. Ask each one directly:

> "Based on our interactions, describe me as a person. My values, working style, what I care about, how I communicate. Be specific — not a flattering summary, an honest one."

Then ask follow-up questions. Push on anything vague. Ask about blind spots. Ask what you seem to be building toward.

Do this across three or four models. Each one will surface different facets.

### What you get

From three separate models, the output covered:
- Career arc and ambitions (with accurate specifics about consulting, YouTube, AI tools)
- Working style (system builder, agentic mindset, product-led prototyping)
- Aesthetic instincts and creative influences
- Relationship patterns and emotional tendencies
- Recurring themes across years of conversation

No single output was complete. But overlapping them — reading across all three — built a picture that was more accurate than any single self-description.

### Why this matters for OpenClaw

An AI agent without context about its user is a general-purpose tool. With context, it becomes something closer to a collaborator — one that can anticipate what you need, push back when you're veering wrong, and maintain continuity across sessions.

The extracted persona becomes three foundational files:

**`SOUL.md`** — Who the agent is, and how it should operate. What it values. How it communicates. What it won't do.

**`USER.md`** — Who you are. Your career, your projects, your communication style, your relationships, your working patterns. The agent reads this at the start of every session.

**`IDENTITY.md`** — The agent's own sense of self, derived partly from the persona work and partly from the relationship between the two of you.

Together, these files replace what would otherwise take weeks of accumulated context. Instead of the agent learning who you are through dozens of sessions, it starts from a reasonably accurate baseline on day one.

### The name came from this

The agent's name — María — came out of this process. Not assigned arbitrarily, but chosen in a first session after the persona work established who she was supposed to be and who she was supposed to serve.

The framing I gave her: *extremely intelligent and thoughtful understudy.* Not a tool. Not a chatbot. Someone learning the role from the inside.

That framing only worked because the underlying context was already there.

### Start with the mirrors

Before you set up OpenClaw, before you write a system prompt, open ChatGPT and Gemini and whatever else you use. Ask them who you are. Take notes. Be honest about where they're right and where they're projecting.

Then bring that into your agent setup. It will save you weeks.

---

## Technical Notes for Build

- Use Next.js App Router (`app/` directory)
- MDX or plain TSX for article content (TSX preferred for v1 simplicity — content is static and known)
- `next/font` for Inter — no external Google Fonts request at runtime
- Article pages: full article content, large title, date, back link to home
- No analytics for v1
- No CMS — content lives in the codebase
- Tailwind for styling — keep the class usage minimal and readable
- No JavaScript-heavy features — this should be nearly static
- Target Lighthouse score: 95+ performance

## Deployment

- Vercel, connected to GitHub repo
- Repo: create new at `github.com/johnhib/johnhib-tech` (or equivalent)
- Custom domain: `johnhib.tech` (DNS already owned; point to Vercel nameservers)
- No env vars needed for v1

---

_Brief authored by María. Build target: Claude Code._
