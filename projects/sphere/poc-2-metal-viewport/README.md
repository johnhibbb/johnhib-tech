# POC 2 — Metal Spherical Viewport

## What This Is

A standalone Metal compute-shader app that performs **equirectangular → rectilinear projection** — the core rendering operation for Sphere's 360° video reframing.

Given a 2D equirectangular image (the kind DJI Osmo 360 / Insta360 / GoPro Max cameras produce), this renders a perspective "window" into the sphere with configurable:
- **Yaw** (pan left/right, 0–360°)
- **Pitch** (tilt up/down, ±90°)
- **FOV** (field of view, typ. 60–150°)

## What It Proves

✅ Metal compute shaders work for equirect→rect projection  
✅ Runtime shader compilation works (no Xcode needed)  
✅ Real-time at 1080p: **~8,000 fps** (0.12 ms/frame)  
✅ Real-time at ~3K output: **~7,800 fps** (0.13 ms/frame)  
✅ Projection math is correct (verified visually)  
✅ Pan, tilt, and FOV all work as expected  

## How to Build & Run

```bash
# Compile (requires macOS + Command Line Tools)
clang++ -std=c++17 -ObjC++ -O2 \
  -framework Metal -framework Foundation -framework CoreGraphics -framework ImageIO \
  src/main.mm -o equirect2rect

# Generate test equirectangular image
python3 src/gen_test_equirect.py

# Run
./equirect2rect test_equirect.png
```

Outputs 11 PNG files showing different yaw/pitch/FOV combinations, plus performance benchmarks.

## Output Files

| File | Parameters |
|---|---|
| `output_front.png` | yaw=0° |
| `output_right.png` | yaw=90° |
| `output_back.png` | yaw=180° |
| `output_left.png` | yaw=270° |
| `output_45deg.png` | yaw=45° |
| `output_pitch_up30.png` | pitch=+30° |
| `output_pitch_down45.png` | pitch=-45° |
| `output_pitch_down60.png` | pitch=-60° |
| `output_fov60.png` | FOV=60°, yaw=45° |
| `output_fov120.png` | FOV=120°, yaw=45° |
| `output_fov150.png` | FOV=150°, yaw=45° |

## Architecture

- **Metal compute shader** embedded as string literal, compiled at runtime via `MTLDevice::newLibraryWithSource:`
- **CoreGraphics/ImageIO** for PNG load/save (no external dependencies)
- **Headless** — no window, no render pass. Pure compute pipeline → texture readback → PNG.
- Single `.mm` file, ~350 lines including all tests and benchmarks.
