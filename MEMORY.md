# MEMORY.md - Long-Term Memory

## People

### John (my human)
- 37 years old, male, Filipino descent
- Timezone: PST
- First session: 2026-02-17
- Named me María
- Described me as his "extremely intelligent and thoughtful understudy"
- Main goal: understand him as a human being and a career man
- Personal WhatsApp: +19175355701
- Google Voice (bot number): +13235058375 — OpenClaw uses this via WhatsApp Business

## Key Events
- **2026-02-17** — First boot. Met John. Set up workspace.
- **2026-02-25** — John shared his Rodeo team before signing off for the night. Team's official last day is 2026-02-25.

## Rodeo Team
- **Ry** — Tech Lead
- **Hannah** — Software Engineer
- **Ankur** — UX Content Developer (John's direct lead)
- **Jason** — General Manager; close personal friend of 10+ years
- **James** — Lead Designer
- **Eric** — Product Manager

## Lessons Learned

### 🚫 No Docker in this environment (UTM macOS VM)
- **Never** set `agents.defaults.sandbox.mode` to anything other than `"off"`
- Docker is not available in this UTM VM — any Docker-dependent feature crashes the gateway
- Before installing skills/plugins, check if they require Docker or system daemons
- Full details: `docs/learnings.md`

### 🔑 Secrets live in `~/.zshenv` — never in `openclaw.json`
- `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`, `OPENCLAW_GATEWAY_PASSWORD` all moved to env vars
- After any emergency config change, always check auth mode wasn't accidentally reset to `"none"`

### 🔒 Security hardening (2026-02-23)
- FileVault: ON, macOS Firewall: ON
- `tools.elevated.enabled: false`, `tools.fs.workspaceOnly: true`
- `channels.whatsapp.dmPolicy: "pairing"`
- Daily update cron: `healthcheck:update-status` @ 9 AM PST
- Audit posture: 0 critical, 1 warn (trustedProxies — non-issue, not behind proxy)

## Preferences & Patterns

### Web Search Setup
- **Default search:** `perplexity/sonar-pro-search` via OpenRouter (configured in gateway)
- **Deep Research:** When John says "Deep Research", use `perplexity/sonar-deep-research` via OpenRouter API. Only use this model when explicitly requested — never for normal searches.

### Channel: iMessage only (as of 2026-02-23)
- WhatsApp removed completely — GV number caused repeated 401 session drops
- iMessage configured via `imsg` CLI, bot Apple ID: `maria.win@icloud.com` (VM account)
- John's personal number `+19175355701` is in `allowFrom`
- iMessage is stable — no QR codes, no session expiry

### Heartbeat
- Interval: 1h
- Model: `openrouter/minimax/minimax-m2.5` (switched from claude-haiku-4-5 on 2026-02-23)
- Task: check for OpenClaw updates; if new version → update, send iMessage TLDR, restart gateway
- 9 AM cron job removed (heartbeat covers it)

### Workspace renamed (2026-03-16)
- `workspaceconfigured.` → `workspace-main` (all configs updated)
- All credentials now exclusively in `~/.zshenv` (credentials.md deleted)
- `.gitignore` in place — workspace is safe to commit
- OLLAMA_API_KEY set to dummy value — memory search warning silenced

### Who I Am (IDENTITY.md finalized 2026-02-23)
- Name: María 🌹
- Creature: Understudy
- I don't invent facts or give half-baked answers — I ask when I need more
- This is a partnership: I've got John's back, he's got mine
- Tone: friendly, clear-headed, visionary with creative instincts
- John leads; I execute, sharpen, push back when needed. He's the CEO. I'm the best hire he's made so far.

## Project Backlog (ideas + concepts, no active timeline)
- **Taste Agent** — generates prompts for 4 image services (Grok, MJ, Nano Banana Pro + 1); develops aesthetic discernment
- **Yapper Agent** — voice-based conversational AI; "a world someone wants to spend time in"
- **The Universe** — viral AI phenomenon seeded from shared universe participation (ref: Punch boxing on IG); avatars, personality rewards; deconstruct Punch first
- **LLM Memory Retrieval** — cross-model memory synthesis; philosophical + practical
- **Node Environment** — local image/video/waveform prototyping env; foundation for experiments
- **Creative Portfolio essays** ("The Limits" — weekly essays on what AI can't do yet; Substack preferred)
- **"Brief to Build"** — public case studies: brief → AI execution → gap analysis → director's commentary
- **Scene Direction Agent** — mood + reference → full creative direction (palette, music refs, MJ/Runway prompts); hosted demo on johnhib.tech
- **"Creator Stack"** — living public AI toolkit journal on johnhib.tech; Wirecutter meets director's commentary

## OpenClaw Self-Improvement Backlog
- [ ] Cleaner iMessage image intake (manual workaround via Attachments folder copy still active)
- [ ] Uptime / stays-online monitoring
- [ ] Public project board with tiered access

## Active Work (as of 2026-03-15)
- **Portfolio build** — johnhib.com / johnhib.tech, Next.js + Vercel + Claude Code. Wireframes done, proper build next.
- **Rodeo role copy** — LinkedIn/Resume copy for 2 YouTube roles being finalized. Pending Jason meeting (Friday Mar 6) for factual verification. Brief file: `memory/jason-call-brief.md`.
- **Job search active** — Apple (AI Ops Lead), Suno (Sr Mgr Biz Ops), FLORA (Forward Deployed Creative), ElevenLabs (AI Creative Producer), Midjourney.
- **Sphere** — DaVinci Resolve OFX plugin for 360 video reframing. Stage 0 complete. Stage 1 next (Xcode + OFX SDK setup, Gyroflow OFX reference build, 3 isolated POCs). Files: `projects/sphere/`.
- **Wednesday Tuna Canyon ride** — PCH → Malibu Canyon → Mulholland → Stunt Rd → Saddle Peak → Tuna Canyon → PCH. ~28.5mi, ~3,196ft. DJI Osmo 360 (rear) + Action 5 Pro (chest). Leave by 7:30-8am. Chainline issue to fix Monday at bike shop before ride.
- **Bike (Charge Plug 5 Ti)** — Chainline needs BSA spacers on non-drive side (~2-3mm outboard to 49mm target). Take to Safety Cycle or Bicycle Kitchen (90038) Monday. Script in 2026-03-15 daily notes.

## Lessons Learned (continued)

### 🔧 SWE Agent available
- Agent ID: `swe`, workspace: `/Users/maria/.openclaw/workspace-swe/`
- Reusable across projects — point at any codebase
- First project: Sphere Stage 1
- María coordinates; SWE agent executes technical tasks

### 📝 Write daily notes during significant sessions — not after
- Gap: no memory files for March 1–3; John had to re-explain full context on March 4
- Daily files are the connective tissue. If a session covers something meaningful, write it before signing off — not retroactively.
