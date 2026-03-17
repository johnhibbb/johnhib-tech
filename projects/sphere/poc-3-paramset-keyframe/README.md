# POC 3 — OFX ParamSet Keyframing

## Question
When we define OFX parameters (pan, tilt, FOV) and animate them in Resolve, do they surface in Resolve's curve editor as expected?

## What It Does
An OFX Filter plugin (`com.sphere.keyframe`) that defines three animatable Double params:

| Param | Label | Type | Range | Default | Purpose |
|-------|-------|------|-------|---------|---------|
| `pan` | Pan | Angle | -180° to +180° | 0° | Horizontal camera rotation (yaw) |
| `tilt` | Tilt | Angle | -90° to +90° | 0° | Vertical camera rotation (pitch) |
| `fov` | FOV | Angle | 30° to 150° | 90° | Field of view (lens angle) |

All three params have `kOfxParamPropAnimates = true` and use `kOfxParamDoubleTypeAngle`.

### Visual Feedback (Without Metal Viewport)
To make keyframe changes visible without the spherical projection integrated, the param values drive three visual effects on the source image:

1. **Pan** → horizontal pixel offset + red channel tint
2. **Tilt** → vertical pixel offset + green channel tint
3. **FOV** → zoom (crop/scale around center) + blue channel tint

When keyframed in Resolve, changing param values over time produces an obviously animated output — proving the params are animatable and the host interpolates between keyframes correctly.

## Build

```bash
cd poc-3-paramset-keyframe
mkdir -p build && cd build
cmake ..
make -j4
```

### Install (when Resolve is available)
```bash
cmake --install .
# Installs to ~/Library/OFX/Plugins/SphereKeyframe.ofx.bundle
```

## Verify
```bash
# dlopen test (same as POC 1)
/tmp/test_keyframe_plugin build/SphereKeyframe.ofx.bundle/Contents/MacOS/SphereKeyframe.ofx
# Should report: OfxGetNumberOfPlugins() = 1, id=com.sphere.keyframe
```

## Status
- ✅ Builds cleanly (0 errors, 0 warnings)
- ✅ Bundle structure correct (Contents/MacOS/*.ofx + Info.plist)
- ✅ Symbol exports verified (OfxGetNumberOfPlugins, OfxGetPlugin)
- ⏳ Resolve integration pending (Resolve not installed on this machine)

## Files
```
src/SphereKeyframe.cpp   — plugin source (single-file, ~300 lines)
CMakeLists.txt           — build config (follows POC 1 pattern)
Info.plist               — macOS bundle metadata
notes.md                 — detailed learnings
```
