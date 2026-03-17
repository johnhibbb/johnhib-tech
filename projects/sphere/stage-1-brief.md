# Sphere — Stage 1 Brief
*Assigned: 2026-03-15 | Assigned by: María | For: John via María*

---

## What Sphere Is

Sphere is a DaVinci Resolve OFX plugin for 360-degree video reframing. The core use case: load an equirectangular video (from DJI Osmo 360, Insta360, GoPro Max, etc.), set a virtual camera position (pan/tilt/FOV), animate it with keyframes, and export rectilinear video — all without leaving Resolve.

No equivalent tool exists natively in Resolve. SkyBox Suite is Adobe-only. GoPro Player is standalone. This is a real gap.

Stage 0 confirmed the architecture is buildable. Stage 1 is the hands-on proof.

---

## Stage 0 Summary (What We Already Know)

From `stage-0-research.md`:

| Component | Approach | Status |
|---|---|---|
| Format import | OFX Reader + FFmpeg/libavcodec | ✅ Confirmed feasible |
| Spherical viewport | OFX Overlay API + Apple Metal | ✅ Confirmed feasible |
| Virtual camera keyframing | OFX native ParamSet | ✅ Confirmed feasible |
| ProRes output | Resolve native render (Scripting API) | ✅ Not blocking Stage 1 |
| Platform | macOS first (Metal) | ✅ Decision locked |
| Resolve edition | Free Resolve supported | ✅ No Studio required |

Key architectural decisions already made:
- **OFX ParamSet for keyframing** — NOT the Resolve Scripting API (which can't be called from C++ plugins)
- **Metal for viewport** — GPU-accelerated, real-time spherical preview
- **FFmpeg for decode** — handles equirectangular MP4/HEVC; no proprietary OSV format needed

Key reference: **Gyroflow OFX** (https://github.com/gyroflow/gyroflow) — open source OFX plugin for Resolve. Best available reference for OFX Reader architecture. Clone and build it as the first step.

---

## Stage 1 Goal

**Prove each core technical component works in isolation on this machine.**

We are NOT building the final plugin yet. We are building the smallest possible thing that answers each open question with a working artifact. Think: spikes, proofs of concept, learning exercises.

Stage 2 is integration. Stage 1 is de-risking.

---

## Environment

- **OS:** macOS (arm64, Apple Silicon)
- **Machine:** UTM VM running macOS (no Docker available — do not use Docker)
- **Build tools to install:** Xcode (if not present), CMake, OFX SDK
- **Language:** C++ (core OFX plugins), Metal Shading Language (GPU viewport), Python (Scripting API — later)
- **Target:** DaVinci Resolve (free edition, installed or to be installed)

---

## The Three POCs

### POC 1 — OFX Reader
**Question to answer:** Can we write an OFX Reader plugin in C++ that loads an equirectangular MP4 and places it on the Resolve timeline?

**Minimum success criteria:**
- Plugin installs in `/Library/OFX/Plugins/` (or `~/Library/OFX/Plugins/`)
- Plugin appears in Resolve's "OpenFX" panel
- When applied, it decodes and displays a video frame from a test MP4

**Reference:** Gyroflow OFX reader implementation. Study it before writing anything.

**Key unknowns to resolve:**
- What does the OFX SDK's Reader base class look like? What methods must be overridden?
- How does FFmpeg integrate for decode? (libavcodec)
- Does the plugin need to be signed/notarized for Resolve to load it?

**Output files:** `projects/sphere/poc-1-ofx-reader/`

---

### POC 2 — Metal Spherical Viewport
**Question to answer:** Can we render a real-time spherical preview of an equirectangular texture using Metal inside an OFX plugin?

**Minimum success criteria:**
- A Metal shader that takes a 2D equirectangular texture as input
- Renders a rectilinear view of the sphere (equirectangular → perspective projection)
- Accepts pan (yaw), tilt (pitch), FOV as parameters
- Renders in real-time at 1080p (target: 5.7K, but 1080p is fine for POC)

**This POC can be a standalone Metal test app or an OFX overlay — standalone is fine for Stage 1.**

**Key unknowns to resolve:**
- What is the correct equirectangular-to-rectilinear projection math?
- How does the OFX Overlay API work for custom Metal rendering?
- Reference: `imetalling::falsecolor::Processor` (dev.to) for Metal-in-OFX pattern

**Output files:** `projects/sphere/poc-2-metal-viewport/`

---

### POC 3 — OFX ParamSet Keyframing
**Question to answer:** When we define OFX parameters (pan, tilt, FOV) and animate them in Resolve, do they surface in Resolve's curve editor as expected?

**Minimum success criteria:**
- OFX plugin defines Double params: `pan`, `tilt`, `fov`
- Params appear in Resolve's Inspector when plugin is applied
- Params can be keyframed in the timeline (right-click → Add Keyframe, or via curve editor)
- Keyframes drive visible changes in the output (even just a number display is sufficient for POC)

**Key unknowns to resolve:**
- What OFX param types are most appropriate for continuous camera values?
- Does Resolve expose a curve editor for OFX plugin params, or only for Fusion node params?
- Stage 0 research suggests OFX ParamSet works — this POC confirms it hands-on.

**Output files:** `projects/sphere/poc-3-paramset-keyframe/`

---

## How to Work

1. **Start with environment setup.** Confirm Xcode, CMake, OFX SDK are present or install them. Document what versions you installed and any gotchas.

2. **Clone Gyroflow OFX first.** Build it. Get it loading in Resolve. This is your reference architecture — don't write a single line of original code until you've read and understood theirs.

3. **Work one POC at a time.** Finish POC 1 before starting POC 2. Each POC should have:
   - A README explaining what it does and what question it answers
   - Working code
   - Notes on what you learned (especially surprises or things Stage 0 got wrong)

4. **Document blockers immediately.** If something doesn't work, write down exactly what failed before trying to fix it. This is the risk register — every failure is data.

5. **Report back after each POC.** Don't batch three POCs and report at the end. After each one: what you built, what you found, open questions for Stage 2.

---

## Output Structure

```
projects/sphere/
  stage-1-brief.md          ← this file
  stage-1-env-setup.md      ← document your build environment setup here
  poc-1-ofx-reader/
    README.md
    src/
    CMakeLists.txt
    notes.md                ← learnings, surprises, blockers
  poc-2-metal-viewport/
    README.md
    src/
    notes.md
  poc-3-paramset-keyframe/
    README.md
    src/
    CMakeLists.txt
    notes.md
  stage-1-retrospective.md  ← write this after all three POCs, before Stage 2
```

---

## What Success Looks Like

At the end of Stage 1, we should be able to say:
- "We can load a video into Resolve via OFX" (POC 1)
- "We can render a spherical viewport in Metal" (POC 2)
- "We can animate virtual camera params in Resolve's curve editor" (POC 3)
- "Here's the risk register — here's what we found that Stage 0 didn't answer"

That's the foundation Stage 2 builds on.

---

## References

- Gyroflow OFX: https://github.com/gyroflow/gyroflow
- openfx-arena (generic OFX examples): https://github.com/NatronGitHub/openfx-arena
- Metal OFX processor: https://dev.to/imetalling
- OFX SDK: https://openeffects.org / `/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/OFX/`
- Resolve OFX plugin paths: `/Library/OFX/Plugins/` or `~/Library/OFX/Plugins/`
- Stage 0 research: `projects/sphere/stage-0-research.md`
- Full roadmap: `projects/sphere/ROADMAP.md`

---

*Brief written by María. John is the product owner. SWE agent executes and reports. María coordinates.*
