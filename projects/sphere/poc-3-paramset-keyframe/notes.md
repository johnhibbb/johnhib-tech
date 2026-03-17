# POC 3 — Learnings & Notes

## What Worked

### OFX param definition is clean and well-documented
The C++ Support Library makes param definition straightforward: `desc.defineDoubleParam("name")` returns a descriptor, then you chain setters for range, display range, default, animation, type hints. The pattern is identical across all param types.

### `kOfxParamDoubleTypeAngle` is the right choice for all three params
Even FOV (which isn't a rotation) — it's an angular measurement, and the Angle type hint tells the host to display a `°` symbol and potentially an angle dial widget. Using Plain for FOV would work functionally but lose the semantic UI hint.

### Group params organize the Inspector nicely
`GroupParamDescriptor` lets us group pan/tilt/fov under a "Camera" section in Resolve's Inspector. The group can be collapsed/expanded. This is the right pattern for the final Sphere plugin, which will have more params.

### isIdentity optimization works well
When pan=0, tilt=0, fov=90 (no transform), the plugin returns identity — telling the host to pass through the source image unchanged. This saves a full pixel copy on frames where no camera adjustment is applied.

### The visual feedback approach proves the concept
Using param values to drive color tints + spatial transforms makes keyframe animation immediately visible. Even without the Metal spherical viewport, you'd see the image shifting, zooming, and changing color as keyframes play back.

## OFX Param Properties Reference (Key Findings)

### Properties the PLUGIN controls:
| Property | Type | Purpose |
|----------|------|---------|
| `kOfxParamPropAnimates` | bool | Whether the param can be keyframed (default true for Doubles) |
| `kOfxParamPropDefault` | double | Initial value |
| `kOfxParamPropMin/Max` | double | Hard limits (host clamps input) |
| `kOfxParamPropDisplayMin/Max` | double | Slider range (user can type outside this, up to Min/Max) |
| `kOfxParamPropIncrement` | double | Step size for UI interaction |
| `kOfxParamPropDigits` | int | Decimal places in display |
| `kOfxParamPropDoubleType` | string | Semantic type hint (Plain, Angle, Scale, Time, etc.) |
| `kOfxParamPropCacheInvalidation` | string | What re-renders when param changes |
| `kOfxParamPropEvaluateOnChange` | bool | Whether param change triggers re-render |
| `kOfxParamPropCanUndo` | bool | Whether changes are undoable |
| `kOfxParamPropPersistant` | bool | Whether value saves with project |
| `kOfxParamPropHint` | string | Tooltip text |
| `kOfxParamPropSecret` | bool | Whether param is hidden from UI |

### Properties the HOST controls (read-only to plugin):
| Property | Type | Purpose |
|----------|------|---------|
| `kOfxParamPropIsAnimating` | bool | Whether param currently has keyframes |
| `kOfxParamPropIsAutoKeying` | bool | Whether host is in auto-key mode |

### What the plugin CANNOT control:
- **Interpolation type** (linear, bezier, constant/hold) — entirely controlled by the host's curve editor
- **Keyframe positions** — set by the user in the host UI
- **Curve tangent handles** — host-managed
- **Default interpolation mode** — no OFX property for this

The plugin just calls `getValueAtTime(t)` and gets the interpolated result. It never sees raw keyframe data.

## Surprises vs Stage 0

### No surprises — Stage 0 was correct here
Stage 0 said OFX ParamSet supports keyframing natively. It does. The API is clean and the Support Library handles it well. This was the least surprising of the three POCs.

### Display range vs actual range is a useful distinction
`setRange()` sets hard limits — the host physically prevents values outside this range.
`setDisplayRange()` sets the slider range — the user can type values outside the display range (but within the hard range). For the final plugin, we might want:
- Pan display range: -180 to +180 (same as hard range — full rotation makes sense)
- Tilt display range: -45 to +45 (most common adjustment), hard range: -90 to +90
- FOV display range: 60 to 120 (common range), hard range: 30 to 150

### OFX has no "wrap-around" param type
For pan (yaw), ideally -180° and +180° would be the same position, and the host would allow smooth animation through the wrap point. OFX has no concept of circular/wrap-around params. If a user keyframes from -170° to +170°, the interpolation goes through 0° (the short way) rather than through ±180° (the short way on a circle). This is a known limitation — we may need to handle wrap-around in the shader or document it as a workflow note.

## What's NOT Tested Yet

1. **Resolve Inspector UI.** We know the params are correctly defined (the OFX API accepts them), but we haven't seen them appear in Resolve's Inspector panel.

2. **Resolve curve editor for OFX params.** Stage 0 raised the question of whether Resolve exposes curve editing for OFX plugin params (vs. only for Fusion node params). This remains unanswered until Resolve is installed.

3. **Auto-keying behavior.** Does Resolve's auto-key mode work with OFX params? Unknown.

4. **Keyframe interpolation quality.** Does Resolve default to linear or bezier for OFX Double params? Does the Angle type hint affect default interpolation?

## Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| **No DaVinci Resolve** | Cannot test Inspector UI, curve editor, or keyframe behavior | John installs Resolve |

## Architecture Note for Stage 2

The final Sphere plugin will combine all three POCs:
- POC 1's FFmpeg decode → source equirectangular frames
- POC 3's param definitions → pan/tilt/fov (this POC, reused directly)
- POC 2's Metal shader → equirect→rect projection using param values

The param definition code from this POC can be dropped into the final plugin almost unchanged. The only modifications needed:
1. Replace the color-tint visual feedback with the actual Metal projection
2. Add more params (roll, lens correction, stabilization toggle)
3. Potentially add Double2D params for fine position control

---
*Written 2026-03-15 after POC 3 completion.*
