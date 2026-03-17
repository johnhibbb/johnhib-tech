# POC 1 — Learnings & Notes

## What Worked

### OFX C++ Support Library is excellent
The Support library (`OFX::ImageEffect`, `OFX::PluginFactory`, etc.) handles all the boilerplate of action routing, property set management, and host negotiation. Compared to the raw C API (which is ~700 lines just for a basic passthrough), the Support library cuts plugin code to ~300 lines for the same functionality. **Decision: use Support library for all Sphere plugins.**

### FFmpeg integration is straightforward
libavcodec/libavformat link cleanly against the OFX plugin via Homebrew. No symbol conflicts with the host application. The decode pipeline (open → find stream → open codec → read/decode → swscale to RGBA) is well-documented and worked on first attempt.

### OFX bundle structure is simple
Just a macOS bundle with `Contents/MacOS/<name>.ofx` (a dylib) and `Contents/Info.plist`. CMake handles this cleanly with a MODULE target + post-build copy.

### Plugin loads and reports correctly
Verified via `dlopen()` + symbol lookup. `OfxGetNumberOfPlugins()` returns 1, `OfxGetPlugin(0)` returns valid metadata. This is the same path Resolve would take to discover the plugin.

## Surprises vs Stage 0

### Gyroflow OFX is Rust, not C++
Stage 0 recommended Gyroflow OFX as the key C++ reference. **It's written in Rust.** Still useful as an architectural reference (how to structure an OFX plugin that processes video), but not for code patterns. The OFX SDK's own examples are better. This is a Stage 0 error — should have noted the language.

### No DaVinci Resolve on the machine
Stage 0 assumed Resolve was installed or easily installable. It's not in the VM and requires a manual download from Blackmagic's website (no Homebrew cask). **This is the biggest blocker for all three POCs.** We can build and verify plugin structure, but can't test actual integration until Resolve is installed.

### No full Xcode, but CLT is sufficient for POC 1
Metal headers are available via Command Line Tools, so we can link against Metal. The `metal` shader compiler is missing (needed for POC 2), but POC 1 doesn't need it. Not a surprise per se, but worth noting.

### OFX "Reader" context doesn't exist
Stage 0 talked about an "OFX Reader." There's no such thing in the OFX spec. OFX defines contexts: Generator, Filter, General, Transition, Retimer, Paint. What we actually built is a **General/Filter context plugin** with a file-path parameter that loads external video. The terminology in Stage 0 was misleading. Resolve won't create new media pool items from our plugin — it applies as an effect to existing timeline items. For the final Sphere workflow, the user would apply Sphere as an effect to a timeline clip (even a black slug), then point it at the equirectangular file.

### `StringParam` with `eStringTypeFilePath` gives file picker UI
OFX supports native file browser dialogs for string params. This means the user can browse for their equirectangular video directly in Resolve's Inspector panel. Better UX than expected.

## Open Questions

1. **Will Resolve actually render our frames correctly?** Bundle structure validates, symbols export, but real-host integration is untested. Potential issues: pixel format negotiation, memory layout, timing.

2. **Performance with CPU-only decode.** swscale's yuv420p→RGBA conversion on CPU is not fast for 5.7K video. Production needs VideoToolbox (hardware decode) or at minimum a frame cache. Not a POC concern but flagging for Stage 2.

3. **Resolve's OFX context support.** We support Generator, General, and Filter contexts. Need to verify which context Resolve actually instantiates for our plugin. If it prefers Filter, we need a source clip on the timeline.

4. **FFmpeg dylib dependencies.** The plugin links against Homebrew FFmpeg dylibs. For distribution, we'd need to either statically link FFmpeg or bundle the dylibs inside the .ofx.bundle. Not a concern for POC.

## Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| **No DaVinci Resolve installed** | Cannot test plugin loading/rendering in actual host | Need manual download from Blackmagic Design |
| **No full Xcode** | Cannot compile `.metal` shader files (POC 2) | Use runtime Metal compilation or install Xcode |

## What's Next (POC 2)
POC 2 tests the Metal spherical viewport — equirectangular-to-rectilinear projection. This can be done as a standalone Metal app (no Resolve needed), which sidesteps the Resolve blocker. The key unknowns: projection math and Metal shader compilation without full Xcode.

---
*Written 2026-03-15 after POC 1 completion.*
