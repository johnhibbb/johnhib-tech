# Stage 1 Retrospective
*Completed: 2026-03-15*

---

## Summary

Stage 1 set out to prove three things in isolation. Here's where we landed:

| POC | Question | Result | Confidence |
|-----|----------|--------|------------|
| **1 — OFX Reader** | Can we load equirectangular video via OFX? | ✅ Plugin builds, symbols export, FFmpeg decodes correctly | Medium — bundle validates but untested in Resolve |
| **2 — Metal Viewport** | Can we render equirect→rect projection in real-time? | ✅ Metal compute shader works, ~8000 fps at 1080p on paravirtualized GPU | High — self-contained, fully verified |
| **3 — ParamSet Keyframing** | Can we define animatable pan/tilt/fov params? | ✅ Params defined correctly, plugin loads with proper OFX metadata | Medium — API is correct but Resolve UI untested |

**Bottom line:** All three core components build and verify structurally. POC 2 is the strongest — self-contained and fully proven. POCs 1 and 3 are proven at the API level but need Resolve for end-to-end confirmation.

---

## What Stage 0 Got Wrong

### 1. Gyroflow OFX is Rust, not C++
Stage 0 called it "the key C++ reference." It's Rust. Still useful architecturally but not for code patterns. The OFX SDK's own examples were the real reference.

### 2. "OFX Reader" doesn't exist as a concept
Stage 0 talked about an OFX Reader context. There's no such thing in the spec. OFX defines Generator, Filter, and General contexts. What we built is a Filter/General plugin that takes a file path param and decodes video internally. The user workflow in Resolve will be: apply Sphere as an effect to a timeline clip, then point it at the equirectangular file.

### 3. Resolve was assumed to be available
Stage 0 didn't flag that Resolve requires manual download from Blackmagic (no Homebrew cask, no CLI install). This turned out to be the single biggest limitation across all three POCs.

### 4. Full Xcode was assumed
The VM has Command Line Tools but not full Xcode. This meant no `metal` CLI compiler — but the workaround (runtime shader compilation) turned out to be the *better* approach anyway.

### What Stage 0 Got Right
- OFX ParamSet supports keyframing natively → confirmed
- Metal handles equirect→rect projection cleanly → confirmed
- FFmpeg integrates with OFX plugins without issues → confirmed
- macOS/Metal-first is the right platform call → confirmed
- Free Resolve supports OFX plugins → still assumed true (need to verify)

---

## Updated Risk Register

### Resolved Risks ✅
| Risk | Status | Resolution |
|------|--------|------------|
| OFX C++ API complexity | ✅ Resolved | Support Library handles all boilerplate |
| Metal shader compilation without Xcode | ✅ Resolved | Runtime compilation via `newLibraryWithSource:` works perfectly |
| Equirect→rect projection math | ✅ Resolved | Standard reverse-mapping, ~30 lines of MSL |
| FFmpeg linking with OFX | ✅ Resolved | No symbol conflicts, clean Homebrew integration |
| GPU performance for real-time preview | ✅ Resolved | 8000 fps at 1080p — not a concern |

### Open Risks ⚠️
| Risk | Severity | Mitigation |
|------|----------|------------|
| **Resolve doesn't load our plugins** | High | Bundle structure matches OFX spec. Need Resolve install to verify. Could fail on: signing, pixel format mismatch, context negotiation. |
| **Resolve curve editor doesn't work with OFX params** | High | Stage 0 said it would. OFX spec supports it. But Resolve's implementation is untested. If it doesn't expose curves for OFX params, we'd need Fusion integration instead (much harder). |
| **Pan wrap-around at ±180°** | Low | OFX has no circular param type. Animation from -170° to +170° goes the long way (through 0°). Document as workflow limitation or handle in shader. |
| **FFmpeg dylib distribution** | Low | Plugin links against Homebrew dylibs. For distribution: need static linking or bundled dylibs. Stage 2+ concern. |
| **5.7K performance with CPU decode** | Medium | swscale is slow for high-res. VideoToolbox (hardware decode) or frame caching needed for production. |
| **Plugin signing/notarization** | Low | macOS may require signing for Resolve to load the plugin. Unknown until tested. |

### New Risks (Discovered in Stage 1)
| Risk | Severity | Notes |
|------|----------|-------|
| **OFX image data format** | Medium | How does Resolve pass image data to OFX plugins? Raw pointer? Metal texture? OpenGL? This determines how POC 2's Metal shader integrates with the OFX render pipeline. The `imetalling` reference may clarify. |
| **Filter vs Generator context in Resolve** | Low | We support both, but Resolve may prefer one. Affects user workflow (need source clip for Filter, don't need one for Generator). |

---

## What's Needed Before Stage 2

### Must Have
1. **DaVinci Resolve installed.** This is the #1 blocker. All three POCs need end-to-end testing in the actual host. John needs to download and install it.
2. **End-to-end test of all three plugins.** Install the `.ofx.bundle` files, apply them in Resolve, verify they render correctly and params appear in the Inspector.
3. **Answer: does Resolve expose curve editor for OFX params?** This is the remaining high-severity unknown from Stage 0.

### Should Have
4. **Read the `imetalling` dev.to articles.** They show how to pass Metal textures through the OFX API in Resolve specifically. This bridges POC 2 and the OFX render pipeline.
5. **Decide on the OFX context strategy.** Filter (requires source clip) vs. Generator (standalone) vs. General (flexible). Impacts user workflow.
6. **Research `kOfxImageEffectPropOpenGLRenderSupported` / Metal equivalent.** Some hosts support GPU-accelerated OFX rendering. If Resolve does, we can skip CPU↔GPU transfers entirely.

### Nice to Have
7. **Add roll param.** Trivial — one more rotation matrix in the shader, one more Double param.
8. **Test with real 5.7K equirectangular footage.** All POCs used synthetic or small test data.

---

## Stage 2 Integration Plan (Draft)

Stage 2 combines the three POCs into a single plugin:

```
SphereReframe.ofx.bundle
├── FFmpeg decode (POC 1) → equirectangular frames
├── Param definitions (POC 3) → pan, tilt, fov (+ roll, lens correction)
├── Metal projection (POC 2) → equirect → rectilinear output
└── OFX image pipeline → source clip in, reframed clip out
```

The critical integration question is how Metal textures flow through OFX's image API. Everything else is straightforward composition of the three POCs.

---

## Process Notes

### What worked well in Stage 1
- **One POC at a time** was the right call. Each built on the previous one's learnings.
- **dlopen verification** as a proxy for "will Resolve load this" — fast feedback without needing the host.
- **Documenting as we go** (notes.md per POC) — captured surprises while they were fresh.
- **The OFX C++ Support Library** saved enormous time. Raw C API would have tripled the code.

### What we'd do differently
- **Install Resolve first.** The biggest friction was not being able to test in the actual host. Should have flagged this harder in planning.
- **Stage 0 reference quality.** Gyroflow being Rust was a miss that cost research time. Stage 0 should have cloned and inspected references, not just linked them.

---

*Written 2026-03-15. All three POCs complete. Stage 2 blocked on Resolve installation.*
