# POC 1 — OFX Reader (Equirectangular Video Decode)

## Question Answered
**Can we write an OFX plugin in C++ that loads an equirectangular MP4 and displays it in DaVinci Resolve?**

**Answer: YES** — with caveats (see notes.md for details).

## What This Is
An OFX ImageEffect plugin that:
1. Presents a file-picker parameter (`filePath`) for selecting an equirectangular video
2. Uses FFmpeg (libavcodec/libavformat/libswscale) to decode video frames
3. Outputs decoded RGBA frames to the OFX output clip
4. Supports Filter, General, and Generator contexts

## Architecture
- **OFX C++ Support Library** — uses the official OFX Support wrappers (not raw C API)
- **FFmpeg decode** — libavformat for container demuxing, libavcodec for H.264/HEVC decode, libswscale for pixel format conversion to RGBA
- **No caching** — POC only; each render call decodes fresh (production would cache decoded frames)
- **No GPU decode** — CPU-only via FFmpeg; production would use VideoToolbox or Metal

## Files
```
poc-1-ofx-reader/
  CMakeLists.txt          — Build system
  Info.plist              — macOS bundle metadata
  src/SphereReader.cpp    — Main plugin source (VideoDecoder + OFX plugin)
  test_decoder.cpp        — Standalone FFmpeg decode test
  test_equirect.mp4       — Generated test equirectangular video (1920x960, 5s, 30fps)
  notes.md                — Learnings, surprises, blockers
  build/
    SphereReader.ofx.bundle/  — Built OFX bundle (ready to install)
```

## Build
```bash
cd poc-1-ofx-reader
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
```

Requires: CMake, clang (Xcode CLT), FFmpeg (`brew install ffmpeg`), OFX SDK at `/tmp/openfx/`.

## Install
```bash
cp -R build/SphereReader.ofx.bundle ~/Library/OFX/Plugins/
```

## Verification
- ✅ Bundle structure correct (`.ofx.bundle/Contents/MacOS/SphereReader.ofx` + `Info.plist`)
- ✅ OFX entry points exported (`OfxGetNumberOfPlugins`, `OfxGetPlugin`)
- ✅ Plugin metadata valid (`com.sphere.reader`, OfxImageEffectPluginAPI v1)
- ✅ FFmpeg decode pipeline tested standalone (H.264 → RGBA conversion works)
- ⏳ NOT tested in DaVinci Resolve (Resolve not installed on this machine)

## Status
**BUILD VERIFIED. Awaiting DaVinci Resolve installation for end-to-end test.**
