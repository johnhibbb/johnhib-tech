# Stage 1 — Environment Setup
*Completed: 2026-03-15*

## Machine

| Item | Value |
|---|---|
| OS | macOS 15.4 (Sequoia) arm64 |
| Machine | UTM VM, Apple Silicon |
| Disk | ~27 GB free on / |

## Build Tools

| Tool | Version | Source | Notes |
|---|---|---|---|
| **Clang/C++** | Apple clang 16.0.0 (clang-1600.0.26.6) | Xcode Command Line Tools | Pre-installed. No full Xcode — only CLT. |
| **CMake** | 3.31.6 | `brew install cmake` | Installed during Stage 1 setup |
| **pkg-config** | 0.29.2 | `brew install pkg-config` | Installed during Stage 1 setup |
| **FFmpeg** | 7.1.1 (libs: libavcodec, libavformat, libswscale, etc.) | `brew install ffmpeg` | Installed during Stage 1 setup. Includes all decode libs needed. |
| **Git** | 2.39.5 | Pre-installed (CLT) | |

## SDK / Libraries

| Item | Location | Notes |
|---|---|---|
| **OFX SDK** | `/tmp/openfx/` (cloned from GitHub) | AcademySoftwareFoundation/openfx — latest main branch |
| **OFX Headers** | `/tmp/openfx/include/` | C API headers (`ofxCore.h`, `ofxImageEffect.h`, `ofxParam.h`, etc.) |
| **OFX C++ Support Lib** | `/tmp/openfx/Support/` | C++ wrappers: `Library/` (source), `include/` (headers), `Plugins/` (examples) |
| **Metal Framework** | System SDK (CLT) | Headers available at `/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk/System/Library/Frameworks/Metal.framework/Headers/` |

## Key References Studied

| Reference | What It Is | Usefulness |
|---|---|---|
| **OFX Basic Example** (`/tmp/openfx/Examples/Basic/basic.cpp`) | Raw C OFX API example — full plugin lifecycle in ~700 lines | ⭐⭐⭐ Best for understanding the raw API |
| **OFX Invert (C API)** (`/tmp/openfx/Examples/Invert/invert.cpp`) | Raw C API filter plugin | ⭐⭐⭐ Clean render loop reference |
| **OFX Invert (Support)** (`/tmp/openfx/Support/Plugins/Invert/invert.cpp`) | C++ Support wrapper example | ⭐⭐⭐ Shows the modern OFX C++ pattern |
| **Gyroflow OFX** (`/tmp/gyroflow-ofx/`) | Open-source OFX stabilizer for Resolve | ⭐ Written in Rust, not C++ — structural reference only |

## Missing / Blockers

### ❌ No Full Xcode Installed
Only Command Line Tools are present. Metal framework headers are available (can link against Metal), but the `metal` shader compiler is NOT available — `.metal` files cannot be compiled to `.metallib` without full Xcode.

**Impact:** POC 1 (OFX Reader) — no impact. POC 2 (Metal Viewport) — will need a workaround (embed shader as string, compile at runtime via MTLDevice's `newLibraryWithSource:`, or install Xcode). POC 3 (ParamSet) — no impact.

**Mitigation:** For POC 2, we can use runtime Metal shader compilation via the Metal C API (`MTLDevice::newLibraryWithSource:`). This avoids needing the `metal` CLI compiler entirely. Alternatively, request John install Xcode.

### ❌ No DaVinci Resolve Installed
Resolve is not present in `/Applications/`. It requires manual download from Blackmagic Design's website (no Homebrew cask exists).

**Impact:** We can BUILD OFX plugins and verify they produce correct `.ofx.bundle` structure, but we CANNOT test that they load in Resolve or verify UI integration until Resolve is installed.

**Mitigation:** Build plugins to spec, verify bundle structure matches OFX conventions. Flag for María/John: Resolve installation needed before end-to-end testing. All POCs will have a "verified builds, not tested in Resolve" caveat until then.

### ⚠️ Gyroflow OFX is Rust, Not C++
Stage 0 identified Gyroflow as the key reference. It IS a good structural reference (OFX plugin that processes video in Resolve), but the code is Rust, not C++. Direct code reuse isn't possible. The OFX SDK's own examples (especially the C++ Support library examples) are better as code references.

**Impact:** Low. The OFX C++ Support library examples are excellent and well-documented. We have enough reference material.

## OFX Plugin Architecture Summary (Learned During Setup)

An OFX plugin is a macOS bundle (`.ofx.bundle`) with this structure:
```
MyPlugin.ofx.bundle/
  Contents/
    Info.plist
    MacOS/
      MyPlugin.ofx    ← compiled dylib
```

Installed at: `/Library/OFX/Plugins/` (system-wide) or `~/Library/OFX/Plugins/` (per-user).

Two API styles available:
1. **Raw C API** — Plugin exports `OfxGetNumberOfPlugins()` and `OfxGetPlugin(n)`. Each plugin provides an `mainEntry` function pointer that handles OFX actions (describe, createInstance, render, etc.) via property set manipulation.
2. **C++ Support Library** — Wraps the C API in classes (`OFX::ImageEffect`, `OFX::PluginFactory`, etc.). Cleaner, less boilerplate, handles action routing automatically.

For POC 1, using the **C++ Support Library** — it's the standard approach and matches how production plugins are written.

## Decision: OFX Plugin Build Strategy

The OFX SDK's top-level CMake requires Conan packages (spdlog, cimg, etc.) which are overkill for our plugins. Instead:

**Strategy:** Standalone CMake project that directly compiles the OFX Support Library source files alongside our plugin code. This is how most real-world OFX plugins work — they vendor the Support lib or include it as a subdirectory.

Files needed from OFX SDK:
- All headers from `include/` (C API)
- All headers from `Support/include/` (C++ wrappers)
- Source files from `Support/Library/` (implementation)

---

*Environment setup complete. Proceeding to POC 1.*
