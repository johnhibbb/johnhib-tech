// SphereKeyframe — POC 3: OFX plugin proving animatable pan/tilt/fov params
// Part of the Sphere project (DaVinci Resolve 360 reframing plugin)
//
// Architecture: OFX Filter context plugin.
// - Defines three Double params: pan (yaw), tilt (pitch), fov
// - All three are animatable (kOfxParamPropAnimates = true)
// - To make keyframe changes VISIBLE without Metal viewport integration:
//   param values drive a color tint + position offset on the source image.
//   pan  → horizontal offset + red channel modulation
//   tilt → vertical offset + green channel modulation
//   fov  → zoom (crop/scale) + blue channel modulation
//
// This is a proof of concept for OFX parameter animation in Resolve.

#include <cstring>
#include <cstdio>
#include <cmath>
#include <algorithm>

#include "ofxsImageEffect.h"
#include "ofxsMultiThread.h"
#include "ofxsProcessing.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// --------------------------------------------------------------------------
// Pixel processor — applies pan/tilt/fov-driven visual transform
// --------------------------------------------------------------------------
class KeyframeProcessor : public OFX::ImageProcessor {
public:
    KeyframeProcessor(OFX::ImageEffect& effect)
        : OFX::ImageProcessor(effect)
        , srcImg_(nullptr)
        , pan_(0.0)
        , tilt_(0.0)
        , fov_(90.0)
    {}

    void setSrcImg(const OFX::Image* img) { srcImg_ = img; }
    void setParams(double pan, double tilt, double fov) {
        pan_ = pan;
        tilt_ = tilt;
        fov_ = fov;
    }

    void multiThreadProcessImages(OfxRectI procWindow) override {
        if (!srcImg_ || !_dstImg) return;

        OFX::BitDepthEnum dstBitDepth = _dstImg->getPixelDepth();
        OFX::BitDepthEnum srcBitDepth = srcImg_->getPixelDepth();

        OfxRectI srcBounds = srcImg_->getBounds();
        int srcW = srcBounds.x2 - srcBounds.x1;
        int srcH = srcBounds.y2 - srcBounds.y1;

        OfxRectI dstBounds = _dstImg->getBounds();
        int dstW = dstBounds.x2 - dstBounds.x1;
        int dstH = dstBounds.y2 - dstBounds.y1;

        if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) return;

        double panNorm = pan_ / 360.0;
        int panOffsetPx = (int)(panNorm * srcW);
        double tiltNorm = tilt_ / 360.0;
        int tiltOffsetPx = (int)(tiltNorm * srcH);
        double zoomFactor = 90.0 / fov_;

        double redTint   = (pan_ + 180.0) / 360.0;
        double greenTint = (tilt_ + 90.0) / 180.0;
        double blueTint  = (fov_ - 30.0) / 120.0;
        double tintStrength = 0.35;

        double srcCenterX = srcBounds.x1 + srcW * 0.5;
        double srcCenterY = srcBounds.y1 + srcH * 0.5;

        for (int y = procWindow.y1; y < procWindow.y2; y++) {
            if (_effect.abort()) break;

            void* dstPtr = _dstImg->getPixelAddress(procWindow.x1, y);
            if (!dstPtr) continue;

            for (int x = procWindow.x1; x < procWindow.x2; x++) {
                double srcX = srcCenterX + (x - (dstBounds.x1 + dstW * 0.5)) / zoomFactor;
                double srcY = srcCenterY + (y - (dstBounds.y1 + dstH * 0.5)) / zoomFactor;
                srcX -= panOffsetPx;
                srcY -= tiltOffsetPx;

                int sx = (int)srcX;
                int sy = (int)srcY;

                // Read source pixel as normalized 0..1 RGBA
                double r = 0, g = 0, b = 0, a = 0;
                bool hasSrc = false;

                if (sx >= srcBounds.x1 && sx < srcBounds.x2 &&
                    sy >= srcBounds.y1 && sy < srcBounds.y2) {
                    const void* srcPtr = srcImg_->getPixelAddress(sx, sy);
                    if (srcPtr) {
                        hasSrc = true;
                        if (srcBitDepth == OFX::eBitDepthFloat) {
                            const float* sp = (const float*)srcPtr;
                            r = sp[0]; g = sp[1]; b = sp[2]; a = sp[3];
                        } else if (srcBitDepth == OFX::eBitDepthUShort) {
                            const unsigned short* sp = (const unsigned short*)srcPtr;
                            r = sp[0] / 65535.0; g = sp[1] / 65535.0;
                            b = sp[2] / 65535.0; a = sp[3] / 65535.0;
                        } else {
                            const unsigned char* sp = (const unsigned char*)srcPtr;
                            r = sp[0] / 255.0; g = sp[1] / 255.0;
                            b = sp[2] / 255.0; a = sp[3] / 255.0;
                        }
                    }
                }

                // Apply tint
                double outR, outG, outB, outA;
                if (hasSrc) {
                    outR = r * (1.0 - tintStrength) + redTint * tintStrength;
                    outG = g * (1.0 - tintStrength) + greenTint * tintStrength;
                    outB = b * (1.0 - tintStrength) + blueTint * tintStrength;
                    outA = a;
                } else {
                    outR = redTint * tintStrength * 0.5;
                    outG = greenTint * tintStrength * 0.5;
                    outB = blueTint * tintStrength * 0.5;
                    outA = 1.0;
                }

                outR = std::clamp(outR, 0.0, 1.0);
                outG = std::clamp(outG, 0.0, 1.0);
                outB = std::clamp(outB, 0.0, 1.0);
                outA = std::clamp(outA, 0.0, 1.0);

                // Write to destination in appropriate bit depth
                if (dstBitDepth == OFX::eBitDepthFloat) {
                    float* dp = (float*)dstPtr + (x - procWindow.x1) * 4;
                    dp[0] = (float)outR; dp[1] = (float)outG;
                    dp[2] = (float)outB; dp[3] = (float)outA;
                } else if (dstBitDepth == OFX::eBitDepthUShort) {
                    unsigned short* dp = (unsigned short*)dstPtr + (x - procWindow.x1) * 4;
                    dp[0] = (unsigned short)(outR * 65535.0);
                    dp[1] = (unsigned short)(outG * 65535.0);
                    dp[2] = (unsigned short)(outB * 65535.0);
                    dp[3] = (unsigned short)(outA * 65535.0);
                } else {
                    unsigned char* dp = (unsigned char*)dstPtr + (x - procWindow.x1) * 4;
                    dp[0] = (unsigned char)(outR * 255.0);
                    dp[1] = (unsigned char)(outG * 255.0);
                    dp[2] = (unsigned char)(outB * 255.0);
                    dp[3] = (unsigned char)(outA * 255.0);
                }
            }
        }
    }

private:
    const OFX::Image* srcImg_;
    double pan_;
    double tilt_;
    double fov_;
};

// --------------------------------------------------------------------------
// The OFX Plugin
// --------------------------------------------------------------------------
class SphereKeyframePlugin : public OFX::ImageEffect {
public:
    SphereKeyframePlugin(OfxImageEffectHandle handle)
        : OFX::ImageEffect(handle)
    {
        dstClip_ = fetchClip(kOfxImageEffectOutputClipName);
        srcClip_ = fetchClip(kOfxImageEffectSimpleSourceClipName);
        panParam_  = fetchDoubleParam("pan");
        tiltParam_ = fetchDoubleParam("tilt");
        fovParam_  = fetchDoubleParam("fov");
    }

    void render(const OFX::RenderArguments& args) override {
        // Fetch param values at the current time (this is the keyframe magic —
        // OFX host interpolates between keyframes automatically)
        double pan = 0.0, tilt = 0.0, fov = 90.0;
        panParam_->getValueAtTime(args.time, pan);
        tiltParam_->getValueAtTime(args.time, tilt);
        fovParam_->getValueAtTime(args.time, fov);

        // Fetch source and destination images
        std::unique_ptr<OFX::Image> src(srcClip_->fetchImage(args.time));
        std::unique_ptr<OFX::Image> dst(dstClip_->fetchImage(args.time));
        if (!dst.get()) return;

        // Process
        KeyframeProcessor processor(*this);
        processor.setDstImg(dst.get());
        processor.setSrcImg(src.get());
        processor.setRenderWindow(args.renderWindow);
        processor.setParams(pan, tilt, fov);
        processor.process();
    }

    bool isIdentity(const OFX::IsIdentityArguments& args,
                    OFX::Clip*& identityClip,
                    double& identityTime) override {
        // If pan=0, tilt=0, fov=90 — output is identical to input (no transform)
        double pan = 0.0, tilt = 0.0, fov = 90.0;
        panParam_->getValueAtTime(args.time, pan);
        tiltParam_->getValueAtTime(args.time, tilt);
        fovParam_->getValueAtTime(args.time, fov);

        if (std::abs(pan) < 0.001 && std::abs(tilt) < 0.001 && std::abs(fov - 90.0) < 0.001) {
            identityClip = srcClip_;
            identityTime = args.time;
            return true;
        }
        return false;
    }

private:
    OFX::Clip* dstClip_ = nullptr;
    OFX::Clip* srcClip_ = nullptr;
    OFX::DoubleParam* panParam_ = nullptr;
    OFX::DoubleParam* tiltParam_ = nullptr;
    OFX::DoubleParam* fovParam_ = nullptr;
};

// --------------------------------------------------------------------------
// Plugin Factory
// --------------------------------------------------------------------------
mDeclarePluginFactory(SphereKeyframePluginFactory, {}, {});

using namespace OFX;

void SphereKeyframePluginFactory::describe(OFX::ImageEffectDescriptor& desc) {
    desc.setLabels("Sphere Keyframe", "Sphere Keyframe", "Sphere 360 Camera Keyframing POC");
    desc.setPluginGrouping("Sphere");

    desc.addSupportedContext(eContextFilter);
    desc.addSupportedContext(eContextGeneral);

    desc.addSupportedBitDepth(eBitDepthFloat);
    desc.addSupportedBitDepth(eBitDepthUShort);
    desc.addSupportedBitDepth(eBitDepthUByte);

    desc.setSingleInstance(false);
    desc.setHostFrameThreading(false);
    desc.setSupportsMultiResolution(true);
    desc.setSupportsTiles(true);
    desc.setTemporalClipAccess(false);
    desc.setRenderTwiceAlways(false);
    desc.setSupportsMultipleClipPARs(false);
}

void SphereKeyframePluginFactory::describeInContext(OFX::ImageEffectDescriptor& desc,
                                                     OFX::ContextEnum context) {
    // Source clip (required — this is a filter)
    ClipDescriptor* srcClip = desc.defineClip(kOfxImageEffectSimpleSourceClipName);
    srcClip->addSupportedComponent(ePixelComponentRGBA);
    srcClip->addSupportedComponent(ePixelComponentAlpha);
    srcClip->setSupportsTiles(true);

    // Output clip
    ClipDescriptor* dstClip = desc.defineClip(kOfxImageEffectOutputClipName);
    dstClip->addSupportedComponent(ePixelComponentRGBA);
    dstClip->setSupportsTiles(true);

    // ===================================================================
    // PARAMETER DEFINITIONS — the core of this POC
    // ===================================================================
    //
    // OFX param properties for controlling keyframe behavior:
    //
    //   kOfxParamPropAnimates (bool)
    //     Whether the param can be keyframed. Default true for most types.
    //     We set it explicitly to be clear.
    //
    //   kOfxParamPropDoubleType (string)
    //     Semantic hint to the host UI:
    //     - kOfxParamDoubleTypePlain:   raw number, no special display
    //     - kOfxParamDoubleTypeAngle:   degrees, host may show angle widget
    //     - kOfxParamDoubleTypeScale:   scale factor
    //     - kOfxParamDoubleTypeTime:    time value
    //     - kOfxParamDoubleTypeX/Y/XY:  spatial (normalized to project size)
    //
    //   kOfxParamPropMin / kOfxParamPropMax (double)
    //     Hard limits. Host prevents values outside this range.
    //     This is the ACTUAL clamping range.
    //
    //   kOfxParamPropDisplayMin / kOfxParamPropDisplayMax (double)
    //     Soft limits for the UI slider. User can type values outside
    //     display range (but still within min/max). Useful for keeping
    //     the slider at a practical range while allowing extremes.
    //
    //   kOfxParamPropDefault (double)
    //     Initial value when the effect is first applied.
    //
    //   kOfxParamPropIncrement (double)
    //     Step size for click-dragging the value. Affects UI granularity.
    //
    //   kOfxParamPropDigits (int)
    //     Decimal places shown in the value display.
    //
    //   kOfxParamPropIsAnimating (bool, read-only at instance time)
    //     Whether the param currently has keyframes set. Plugin can
    //     query this at render time.
    //
    //   kOfxParamPropIsAutoKeying (bool, read-only at instance time)
    //     Whether the host is in auto-key mode for this param.
    //
    //   kOfxParamPropCacheInvalidation (string)
    //     When param changes, what gets invalidated:
    //     - "OfxParamInvalidateValueChange": just the current frame
    //     - "OfxParamInvalidateValueChangeToEnd": this frame to end
    //     - "OfxParamInvalidateAll": all frames
    //
    //   kOfxParamPropEvaluateOnChange (bool)
    //     Whether changing this param triggers a re-render. Default true.
    //
    //   kOfxParamPropCanUndo (bool)
    //     Whether changes are undoable. Default true.
    //
    //   kOfxParamPropPersistant (bool)
    //     Whether the param value is saved with the project. Default true.
    //
    // NOTE: OFX does NOT expose interpolation type (linear, bezier, constant)
    // as a param property. Interpolation between keyframes is entirely
    // controlled by the HOST (Resolve's curve editor). The plugin always
    // gets the interpolated value via getValueAtTime() — it never sees
    // individual keyframes or interpolation curves.
    //
    // ===================================================================

    // --- Pan (Yaw) ---
    // Range: -180° to +180° (full horizontal rotation)
    // Default: 0° (looking straight ahead)
    // Type: Angle — host may display ° symbol or angle dial widget
    DoubleParamDescriptor* panParam = desc.defineDoubleParam("pan");
    panParam->setLabels("Pan", "Pan", "Pan (Yaw) — horizontal camera rotation");
    panParam->setHint("Horizontal camera rotation in degrees. "
                      "-180 = full left, 0 = center, +180 = full right.");
    panParam->setDoubleType(eDoubleTypeAngle);
    panParam->setDefault(0.0);
    panParam->setRange(-180.0, 180.0);
    panParam->setDisplayRange(-180.0, 180.0);
    panParam->setIncrement(1.0);
    panParam->setDigits(1);
    panParam->setAnimates(true);

    // --- Tilt (Pitch) ---
    // Range: -90° to +90° (full vertical rotation)
    // Default: 0° (looking at horizon)
    // Type: Angle
    DoubleParamDescriptor* tiltParam = desc.defineDoubleParam("tilt");
    tiltParam->setLabels("Tilt", "Tilt", "Tilt (Pitch) — vertical camera rotation");
    tiltParam->setHint("Vertical camera rotation in degrees. "
                       "-90 = straight down, 0 = horizon, +90 = straight up.");
    tiltParam->setDoubleType(eDoubleTypeAngle);
    tiltParam->setDefault(0.0);
    tiltParam->setRange(-90.0, 90.0);
    tiltParam->setDisplayRange(-90.0, 90.0);
    tiltParam->setIncrement(1.0);
    tiltParam->setDigits(1);
    tiltParam->setAnimates(true);

    // --- FOV (Field of View) ---
    // Range: 30° to 150°
    // Default: 90° (standard wide angle)
    // Type: Angle (it's an angular measurement, even though it's not a rotation)
    DoubleParamDescriptor* fovParam = desc.defineDoubleParam("fov");
    fovParam->setLabels("FOV", "FOV", "Field of View — camera lens angle");
    fovParam->setHint("Vertical field of view in degrees. "
                      "30 = telephoto (zoomed in), 90 = wide, 150 = ultra-wide.");
    fovParam->setDoubleType(eDoubleTypeAngle);
    fovParam->setDefault(90.0);
    fovParam->setRange(30.0, 150.0);
    fovParam->setDisplayRange(30.0, 150.0);
    fovParam->setIncrement(1.0);
    fovParam->setDigits(1);
    fovParam->setAnimates(true);

    // --- Group the camera params together ---
    GroupParamDescriptor* cameraGroup = desc.defineGroupParam("cameraGroup");
    cameraGroup->setLabels("Camera", "Camera", "Virtual Camera Controls");
    cameraGroup->setOpen(true);

    panParam->setParent(*cameraGroup);
    tiltParam->setParent(*cameraGroup);
    fovParam->setParent(*cameraGroup);

    // --- Page ---
    PageParamDescriptor* page = desc.definePageParam("Controls");
    page->addChild(*cameraGroup);
    page->addChild(*panParam);
    page->addChild(*tiltParam);
    page->addChild(*fovParam);
}

OFX::ImageEffect* SphereKeyframePluginFactory::createInstance(OfxImageEffectHandle handle,
                                                               OFX::ContextEnum /*context*/) {
    return new SphereKeyframePlugin(handle);
}

// --------------------------------------------------------------------------
// Plugin registration
// --------------------------------------------------------------------------
namespace OFX {
namespace Plugin {
    void getPluginIDs(OFX::PluginFactoryArray& ids) {
        static SphereKeyframePluginFactory p("com.sphere.keyframe", 1, 0);
        ids.push_back(&p);
    }
}
}
