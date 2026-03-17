# POC 2 — Learnings & Notes

## What Worked

### Runtime Metal shader compilation is seamless
`MTLDevice::newLibraryWithSource:` compiles MSL source strings at runtime with no issues. No full Xcode, no `metal` CLI compiler, no `.metallib` files needed. Compilation is fast (~instant for our shader). This is the right approach for the OFX plugin too — embed the shader as a string in the C++ code.

### The projection math is straightforward
The equirect→rect projection is a well-understood reverse-mapping: for each output pixel, cast a ray through a virtual pinhole camera, rotate by yaw/pitch, convert to spherical coords, sample the equirectangular texture. The entire shader is ~30 lines of Metal.

**Key formulas:**
1. NDC: `nx = (2*(x+0.5)/W - 1) * tan(fov/2) * aspect`, `ny = (1 - 2*(y+0.5)/H) * tan(fov/2)`
2. Camera ray: `normalize(nx, ny, -1)` (looking down -Z)
3. Pitch rotation (around X): standard 3x3 rotation matrix
4. Yaw rotation (around Y): standard 3x3 rotation matrix (negated for "pan right = positive")
5. Spherical coords: `lon = atan2(x, -z)`, `lat = acos(y)`
6. Equirect UV: `u = lon/(2π)`, `v = lat/π`

### Performance is absurdly good
~8,000 fps at 1080p output on a **paravirtualized** Metal device in a UTM VM. On native Apple Silicon, this will be even faster. The shader is compute-bound but trivially parallel — each pixel is independent. Real-time at 5.7K will not be a problem.

Note: the benchmark pipelines commands without waiting between frames, measuring GPU throughput rather than single-frame latency. Single-frame latency would be higher but still sub-millisecond for 1080p.

### CoreGraphics handles PNG I/O without external deps
No need for libpng, stb_image, or any external library. `CGImageSource` loads PNGs, `CGImageDestination` writes them. This keeps the build simple for the POC. For the OFX plugin, the host provides textures so we won't need image I/O at all.

## Surprises vs Stage 0

### Yaw direction convention requires care
Initial implementation had yaw going the wrong direction — yaw=90° showed the 270° view. The fix was negating the yaw angle in the rotation matrix. Convention: positive yaw = pan right (clockwise from above), which is a negative rotation in right-handed coordinates. This is a common gotcha in spherical video tools. **Lock this convention down early in Stage 2.**

### Metal on paravirtualized GPU works fine
Running in a UTM VM with "Apple Paravirtual device" — no issues with compute shaders, texture sampling, bilinear filtering. Good sign for development velocity: we don't need native hardware for iteration.

### Compute pipeline is simpler than render pipeline for this use case
No vertex buffers, no render passes, no framebuffers. Just: load texture → dispatch compute → read back texture. For the OFX plugin, we'll need to interface with the host's render pipeline, but the core projection can stay as a compute shader.

## Key Decisions Made

1. **Compute shader, not fragment shader.** Simpler setup, no geometry to manage. The OFX plugin can either keep this as compute or switch to a render pipeline depending on how the OFX overlay API provides textures.

2. **Bilinear filtering via hardware sampler.** Using `filter::linear` and `address::repeat` on the sampler. The `repeat` addressing mode automatically wraps longitude — no manual edge-case code needed for the seam at 0°/360°.

3. **No roll (rotation around viewing axis) for now.** The shader only does yaw + pitch. Roll would be trivial to add (one more rotation matrix) but wasn't required for the POC.

## Open Questions

1. **How does OFX provide Metal textures?** The OFX image effect API gives us `OfxPropertySet` with image data. Need to understand if we get a raw pointer, a Metal texture, or an OpenGL texture. The `imetalling` reference on dev.to may clarify this — worth reading before Stage 2.

2. **Interpolation quality at high zoom.** Bilinear filtering works for 90° FOV, but at very narrow FOVs (< 30°, high zoom), we're magnifying the equirectangular texture significantly. May need mipmaps or anisotropic filtering for quality. Not a POC concern.

3. **Should the shader use half precision?** The current shader uses float (32-bit). Metal supports half (16-bit) which is faster on Apple Silicon's GPU. Worth benchmarking in Stage 2, though at 8000 fps the optimization is academic.

4. **Antialiasing.** The current shader samples one point per pixel. For production quality, especially at wide FOVs where peripheral pixels cover large areas of the equirect map, we may want multi-sample or cone-traced sampling. Stage 2 concern.

## Blockers

None. POC 2 is fully self-contained and complete.

## What's Next (POC 3)

POC 3 tests OFX ParamSet keyframing — defining pan/tilt/FOV parameters that surface in Resolve's UI and can be keyframed. This requires Resolve to be installed for full verification, which is still a blocker. However, we can build the plugin structure and verify param definition compiles correctly, similar to what we did in POC 1.

---
*Written 2026-03-15 after POC 2 completion.*
