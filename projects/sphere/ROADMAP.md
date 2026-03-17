# Sphere — Roadmap: 0 to Prototype

## Stage 0 — Foundation Research
*Goal: Understand exactly what we're building and validate it's buildable*

### Needs
- [ ] Map the DaVinci Resolve plugin architecture (OFX vs Fusion vs Scripting API — which layer does what)
- [ ] Confirm OFX Reader API can accept equirectangular input and tag it with spherical metadata
- [ ] Confirm OFX Overlay API can render a custom Metal/OpenGL spherical viewport
- [ ] Confirm Scripting API can write virtual camera keyframes to the timeline curve editor
- [ ] Confirm ProRes render job can be triggered programmatically via Scripting API
- [ ] Identify whether Resolve Studio is required (vs free Resolve) for any of the above
- [ ] Survey existing OFX plugins with custom viewports (Boris FX, etc.) for reference architecture
- [ ] Survey competitive landscape: what do Mistika VR, Mettle SkyBox, and others do / not do

### Deliverables
- Technical feasibility memo
- Architecture decision: OFX-first vs Fusion-scripting-first
- Decision: macOS-only MVP vs cross-platform from day 1

### Time estimate: 1–2 weeks

---

## Stage 1 — Technical Proof of Concept
*Goal: Prove each core technical component works in isolation*

### Needs
- [ ] Set up Xcode + OFX SDK build environment (macOS, C++)
- [ ] Build minimal OFX Reader that loads an equirectangular MP4 and places it on the Resolve timeline
- [ ] Build minimal Metal shader that renders a sphere from equirectangular texture in a custom viewport
- [ ] Build minimal Python script that writes a keyframe to a Fusion node via Scripting API
- [ ] Confirm these three pieces can communicate (plugin ↔ viewport ↔ keyframe store)

### Deliverables
- Three working isolated proofs of concept (import, viewport, keyframe)
- Technical risk register (what could break at integration)

### Time estimate: 3–4 weeks

---

## Stage 2 — Integration: Core Plugin v0
*Goal: All three components working together as a single plugin*

### Needs
- [ ] Integrate OFX Reader + spherical viewport into a single plugin
- [ ] Implement basic virtual camera controls: pan (yaw), tilt (pitch), FOV
- [ ] Connect virtual camera transforms to Resolve keyframe curve editor
- [ ] Implement "flatten" render: bake virtual camera path into a standard rectilinear video output
- [ ] Output clip to ProRes 422 HQ via Scripting API render job
- [ ] Basic UI: draggable viewport, FOV slider, keyframe markers

### Deliverables
- Working plugin: load equirectangular → reframe in viewport → export ProRes
- Internal demo video

### Time estimate: 4–6 weeks

---

## Stage 3 — Creator Validation
*Goal: Get real creators using it and stress-test the workflow*

### Needs
- [ ] Package plugin for clean install on macOS (signed, notarized)
- [ ] Write minimal getting started guide
- [ ] Recruit 5–10 beta users (360 camera owners, Resolve users — start with DJI Osmo 360 and Insta360 X4 users)
- [ ] Structured feedback: what's confusing, what's missing, what's broken
- [ ] Performance testing: 5.7K and 8K equirectangular at 30fps and 60fps

### Deliverables
- Signed macOS build
- 5+ hours of beta user sessions
- Prioritized bug/feature backlog

### Time estimate: 3–4 weeks

---

## Stage 4 — Prototype Polish
*Goal: Something you'd be proud to demo and put on johnhib.com*

### Needs
- [ ] Fix top 10 bugs from beta
- [ ] Improve viewport performance (target: real-time preview at 5.7K)
- [ ] Add: horizon lock (auto-level the virtual camera)
- [ ] Add: smooth camera path interpolation (Bezier easing on keyframes)
- [ ] Add: basic subject tracking (mark a point in the sphere, lock virtual camera to it)
- [ ] Design: plugin UI that feels native to Resolve, not bolted on
- [ ] Demo video: Tuna Canyon ride footage, reframed entirely in Sphere

### Deliverables
- Polished prototype
- Public demo video
- Product page on johnhib.com

### Time estimate: 4–6 weeks

---

## Stage 5 — AI Layer (Roadmap)
*Goal: Differentiation that makes Sphere a platform, not just a utility*

### Needs (research phase)
- [ ] Auto-reframe: detect most compelling frame within a 360 shot
- [ ] Subject tracking across cuts
- [ ] Style learning: adapt to user's reframing preferences over time
- [ ] Suggest virtual camera moves based on edit pacing
- [ ] Motion smoothing: AI-assisted stabilization of virtual camera path

### Notes
This stage is intentionally deferred until Stage 3 validation confirms creator demand and identifies the highest-value AI entry point.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Plugin framework | OFX (OpenFX) SDK |
| Language | C++ (core), Python/Lua (scripting) |
| GPU / Viewport | Apple Metal (macOS MVP) |
| Video decode | FFmpeg / libavcodec |
| Keyframe API | Resolve Scripting API (Python) |
| ProRes output | Resolve native render job (Scripting API) |
| Build tools | Xcode, CMake |
| Target platform | macOS first, Windows later |

---

## Open Questions
- Does OFX in free Resolve support custom Readers, or is Studio required?
- Can the Scripting API write to the curve editor from a C++ OFX plugin, or only from Python scripts?
- What's the right distribution model: free core + paid AI features? Or paid upfront?
- FCPX as second target after Resolve, or Premiere?

---
*Last updated: 2026-03-15*
