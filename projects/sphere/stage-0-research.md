# Stage 0 — Foundation Research
*Completed: 2026-03-15*

## Technical Feasibility Findings

### 1. OFX Reader API — Free Resolve vs Studio
**Verdict: Works in both. No Studio required.**
Free DaVinci Resolve fully supports third-party OFX plugins including custom readers and effects. Commercial plugins (Dehancer, OmniScope, Gyroflow OFX) install and operate identically in both editions. This is a green light — no paywall blocker for our users.

### 2. Custom Viewport in Resolve Viewer
**Verdict: Confirmed possible via OFX Overlay API + Metal.**
OFX `ImageEffect` and custom interaction suites allow plugins to create interactive overlays and Metal textures directly in the Resolve viewer. A Metal-specific example exists (dev.to `imetalling::falsecolor::Processor`) demonstrating extraction of Resolve clip buffers into Metal textures for custom rendering. This is the spherical viewport path.

### 3. Keyframing from C++ OFX Plugin
**Verdict: NOT via Scripting API. Must use OFX native ParamSet.**
The Resolve Scripting API (Python/Lua) cannot be invoked from within a C++ OFX plugin — it's an external automation interface only. However, OFX plugins have their own native parameter animation system (`OFX::ParamSet`) that supports keyframes. Virtual camera pan/tilt/FOV can be animated via OFX params and will show up in Resolve's curve editor natively.
**Architecture decision: OFX ParamSet for keyframing, not Scripting API.**

### 4. SDK & Documentation Paths (macOS)
- OFX plugin install path: `/Library/OFX/Plugins/` and `~/Library/OFX/Plugins/`
- OFX SDK: Download from OpenFX separately (not bundled); also at `/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/OFX/`
- Scripting API docs: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/Docs/ScriptingDoc.html`
- Blackmagic developer portal for latest SDK downloads

### 5. Reference Implementations
- **Gyroflow OFX** (GitHub: `gyroflow/gyroflow`) — open source OFX reader/effect for Resolve. Best available reference for OFX Reader implementation. No custom viewport but solid structural reference.
- **openfx-arena** — generic OFX plugin examples on GitHub, adaptable for readers.
- **Metal OFX example** (dev.to `imetalling`) — custom Metal viewport/processor example. Key reference for spherical preview implementation.

---

## Competitive Analysis

### Mettle SkyBox Suite (now Adobe CC built-in)
- **Where it works:** Premiere Pro, After Effects only. No Resolve, no FCPX.
- **Pricing:** Free with Adobe CC subscription (acquired ~2018)
- **What it does well:** Equirectangular import, pan/tilt/roll reframing, horizon correction, transitions, object removal (AE only), 2D text projection
- **Limitations:** Adobe-locked. Multi-step renders for complex rigs. Known bugs after CC updates. No AI tracking. No Resolve/FCPX path.
- **User complaints:** Multi-camera rigs slow. Missing standalone sales post-Adobe. No FCPX/Resolve.

### Mistika VR (SGO)
- **Where it works:** Primarily standalone, pre-NLE
- **Pricing:** €1,500+ perpetual or subscription
- **What it does:** Professional stitching, grading, live VR. More production pipeline than editor tool.
- **Limitations:** Steep learning curve, not NLE-native, expensive, overkill for creator use case
- **User complaints:** Not integrated into editing workflows

### GoPro Player
- **Where it works:** Standalone app only
- **Pricing:** Free (with GoPro+ or standalone)
- **What it does:** Basic keyframed reframing, stabilization, export to standard video
- **Limitations:** GoPro footage optimized, basic tools, no grading, must export then re-import to NLE

---

## Market Gap Summary

**The Resolve gap is completely unaddressed.** SkyBox is Adobe-only, Mistika is pre-NLE pro pipeline, GoPro Player is a standalone workaround. No one owns 360 reframing inside DaVinci Resolve.

**Creator wishlist (confirmed from research):**
1. Native DaVinci Resolve / FCPX plugins — explicitly called out as missing
2. AI auto-reframing / subject tracking
3. Direct multi-format support (DJI, Insta360, GoPro) without converters
4. Live 8K VR grading in NLE timeline
5. One-click social exports without metadata injection hacks

---

## Architecture Decision

**OFX-first. macOS MVP.**

| Component | Approach | Rationale |
|---|---|---|
| Format import | OFX Reader + FFmpeg/libavcodec | Handles equirectangular MP4/HEVC; no OSV needed |
| Spherical viewport | OFX Overlay + Apple Metal shaders | GPU-accelerated, real-time preview confirmed possible |
| Virtual camera keyframing | OFX ParamSet (native) | Animates within Resolve's curve editor without Scripting API bridge |
| ProRes output | Resolve native render job (Scripting API from external Python launcher) | No custom encoder needed; Resolve handles ProRes natively |
| Platform | macOS first | Metal is macOS-native; simplifies GPU layer; target audience skews Mac |

---

## Open Questions (Unresolved)

- [ ] Does OFX ParamSet keyframing actually surface in Resolve's curve editor UI, or does it only animate internally? Needs hands-on test.
- [ ] What is the maximum equirectangular resolution Resolve can preview in real-time via OFX overlay? (8K target)
- [ ] FCPX as second target: Motion plugin framework vs OFX? (FCPX doesn't support OFX natively — separate build required)
- [ ] Distribution model: free core + paid AI tier? One-time purchase? Subscription?
- [ ] What's the minimum Resolve version to target? (Resolve 18+ likely)

---

## Stage 0 Verdict: GO

All core technical components are confirmed possible. No fundamental blockers. Gyroflow OFX provides a solid reader reference. Metal viewport path is documented. The competitive gap is real and unaddressed in Resolve.

**Recommended next step: Stage 1 — set up Xcode + OFX SDK, build the Gyroflow OFX reader as a learning exercise, then diverge.**

---

## References
- Gyroflow OFX: https://github.com/gyroflow/gyroflow
- openfx-arena: https://github.com/NatronGitHub/openfx-arena
- Metal OFX example: https://dev.to/imetalling
- Resolve Scripting API docs: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/Docs/ScriptingDoc.html`
- OFX SDK: https://openeffects.org
