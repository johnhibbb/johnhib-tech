// SphereReader — POC 1: OFX plugin that decodes equirectangular video via FFmpeg
// Part of the Sphere project (DaVinci Resolve 360 reframing plugin)
//
// Architecture: OFX Generator/General context plugin.
// - Defines a file path param for the equirectangular source video
// - Uses FFmpeg (libavcodec/libavformat/libswscale) to decode frames
// - Outputs decoded RGBA frames to the OFX output clip
//
// This is a proof of concept — no caching, no seeking optimization, no error recovery.

#include <cstring>
#include <cstdio>
#include <string>
#include <mutex>
#include <memory>

#include "ofxsImageEffect.h"
#include "ofxsMultiThread.h"
#include "ofxsProcessing.H"

// FFmpeg headers (C API)
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
#include <libavutil/imgutils.h>
#include <libavutil/opt.h>
}

// --------------------------------------------------------------------------
// FFmpeg decoder wrapper — manages a single video file
// --------------------------------------------------------------------------
class VideoDecoder {
public:
    VideoDecoder() = default;
    ~VideoDecoder() { close(); }

    bool open(const std::string& path) {
        close();

        if (avformat_open_input(&fmtCtx_, path.c_str(), nullptr, nullptr) < 0) {
            fprintf(stderr, "[SphereReader] Failed to open: %s\n", path.c_str());
            return false;
        }

        if (avformat_find_stream_info(fmtCtx_, nullptr) < 0) {
            fprintf(stderr, "[SphereReader] Failed to find stream info\n");
            close();
            return false;
        }

        // Find first video stream
        videoStreamIdx_ = -1;
        for (unsigned i = 0; i < fmtCtx_->nb_streams; i++) {
            if (fmtCtx_->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_VIDEO) {
                videoStreamIdx_ = (int)i;
                break;
            }
        }
        if (videoStreamIdx_ < 0) {
            fprintf(stderr, "[SphereReader] No video stream found\n");
            close();
            return false;
        }

        AVCodecParameters* codecpar = fmtCtx_->streams[videoStreamIdx_]->codecpar;
        const AVCodec* codec = avcodec_find_decoder(codecpar->codec_id);
        if (!codec) {
            fprintf(stderr, "[SphereReader] Unsupported codec\n");
            close();
            return false;
        }

        codecCtx_ = avcodec_alloc_context3(codec);
        avcodec_parameters_to_context(codecCtx_, codecpar);

        if (avcodec_open2(codecCtx_, codec, nullptr) < 0) {
            fprintf(stderr, "[SphereReader] Failed to open codec\n");
            close();
            return false;
        }

        width_ = codecCtx_->width;
        height_ = codecCtx_->height;

        // Determine framerate and duration
        AVStream* stream = fmtCtx_->streams[videoStreamIdx_];
        if (stream->avg_frame_rate.den > 0 && stream->avg_frame_rate.num > 0) {
            fps_ = av_q2d(stream->avg_frame_rate);
        } else if (stream->r_frame_rate.den > 0 && stream->r_frame_rate.num > 0) {
            fps_ = av_q2d(stream->r_frame_rate);
        } else {
            fps_ = 30.0; // fallback
        }

        if (stream->duration > 0) {
            totalFrames_ = (int)(stream->duration * av_q2d(stream->time_base) * fps_);
        } else if (fmtCtx_->duration > 0) {
            totalFrames_ = (int)((fmtCtx_->duration / (double)AV_TIME_BASE) * fps_);
        } else {
            totalFrames_ = 1;
        }

        // Set up scaler to RGBA
        swsCtx_ = sws_getContext(
            width_, height_, codecCtx_->pix_fmt,
            width_, height_, AV_PIX_FMT_RGBA,
            SWS_BILINEAR, nullptr, nullptr, nullptr
        );

        frame_ = av_frame_alloc();
        rgbaFrame_ = av_frame_alloc();
        rgbaFrame_->format = AV_PIX_FMT_RGBA;
        rgbaFrame_->width = width_;
        rgbaFrame_->height = height_;
        av_image_alloc(rgbaFrame_->data, rgbaFrame_->linesize,
                       width_, height_, AV_PIX_FMT_RGBA, 32);

        packet_ = av_packet_alloc();
        isOpen_ = true;

        fprintf(stderr, "[SphereReader] Opened: %s (%dx%d, %.2f fps, ~%d frames)\n",
                path.c_str(), width_, height_, fps_, totalFrames_);
        return true;
    }

    // Decode frame at the given OFX time (frame number, 0-based)
    // Returns pointer to RGBA data (width * height * 4 bytes), or nullptr on failure.
    // Data is valid until next call to decodeFrame() or close().
    const uint8_t* decodeFrame(int frameNum) {
        if (!isOpen_) return nullptr;

        // Seek to target frame
        AVStream* stream = fmtCtx_->streams[videoStreamIdx_];
        int64_t targetTs = (int64_t)(frameNum / fps_ / av_q2d(stream->time_base));
        
        // Only seek if we're not already near the target
        if (frameNum < lastDecodedFrame_ || frameNum > lastDecodedFrame_ + 5) {
            av_seek_frame(fmtCtx_, videoStreamIdx_, targetTs, AVSEEK_FLAG_BACKWARD);
            avcodec_flush_buffers(codecCtx_);
        }

        // Decode frames until we reach the target
        while (true) {
            int ret = av_read_frame(fmtCtx_, packet_);
            if (ret < 0) {
                // EOF or error — try to flush decoder
                if (ret == AVERROR_EOF) {
                    avcodec_send_packet(codecCtx_, nullptr);
                } else {
                    return nullptr;
                }
            }

            if (packet_->stream_index == videoStreamIdx_) {
                ret = avcodec_send_packet(codecCtx_, packet_);
                av_packet_unref(packet_);

                while (ret >= 0) {
                    ret = avcodec_receive_frame(codecCtx_, frame_);
                    if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) break;
                    if (ret < 0) return nullptr;

                    // Convert to RGBA
                    sws_scale(swsCtx_,
                              frame_->data, frame_->linesize, 0, height_,
                              rgbaFrame_->data, rgbaFrame_->linesize);

                    lastDecodedFrame_++;

                    // Check if this is approximately our target frame
                    double framePts = frame_->pts * av_q2d(stream->time_base) * fps_;
                    if ((int)framePts >= frameNum || lastDecodedFrame_ >= frameNum) {
                        return rgbaFrame_->data[0];
                    }
                }
            } else {
                av_packet_unref(packet_);
            }
        }
    }

    int width() const { return width_; }
    int height() const { return height_; }
    double fps() const { return fps_; }
    int totalFrames() const { return totalFrames_; }
    bool isOpen() const { return isOpen_; }

    void close() {
        if (packet_) { av_packet_free(&packet_); packet_ = nullptr; }
        if (rgbaFrame_) {
            if (rgbaFrame_->data[0]) av_freep(&rgbaFrame_->data[0]);
            av_frame_free(&rgbaFrame_);
            rgbaFrame_ = nullptr;
        }
        if (frame_) { av_frame_free(&frame_); frame_ = nullptr; }
        if (swsCtx_) { sws_freeContext(swsCtx_); swsCtx_ = nullptr; }
        if (codecCtx_) { avcodec_free_context(&codecCtx_); codecCtx_ = nullptr; }
        if (fmtCtx_) { avformat_close_input(&fmtCtx_); fmtCtx_ = nullptr; }
        isOpen_ = false;
        lastDecodedFrame_ = -1;
    }

private:
    AVFormatContext* fmtCtx_ = nullptr;
    AVCodecContext* codecCtx_ = nullptr;
    SwsContext* swsCtx_ = nullptr;
    AVFrame* frame_ = nullptr;
    AVFrame* rgbaFrame_ = nullptr;
    AVPacket* packet_ = nullptr;
    int videoStreamIdx_ = -1;
    int width_ = 0;
    int height_ = 0;
    double fps_ = 30.0;
    int totalFrames_ = 0;
    bool isOpen_ = false;
    int lastDecodedFrame_ = -1;
};

// --------------------------------------------------------------------------
// OFX Image Processor — copies decoded video frame to OFX output
// --------------------------------------------------------------------------
class FrameCopyProcessor : public OFX::ImageProcessor {
public:
    FrameCopyProcessor(OFX::ImageEffect& effect)
        : OFX::ImageProcessor(effect)
        , srcData_(nullptr)
        , srcWidth_(0)
        , srcHeight_(0)
        , srcRowBytes_(0)
    {}

    void setSrcData(const uint8_t* data, int width, int height) {
        srcData_ = data;
        srcWidth_ = width;
        srcHeight_ = height;
        srcRowBytes_ = width * 4; // RGBA
    }

    void multiThreadProcessImages(OfxRectI procWindow) override {
        OFX::BitDepthEnum dstBitDepth = _dstImg->getPixelDepth();

        for (int y = procWindow.y1; y < procWindow.y2; y++) {
            if (_effect.abort()) break;

            void* dstPtr = _dstImg->getPixelAddress(procWindow.x1, y);
            if (!dstPtr) continue;

            int pixelCount = procWindow.x2 - procWindow.x1;

            if (srcData_ && y >= 0 && y < srcHeight_) {
                int srcY = y;
                if (srcY >= 0 && srcY < srcHeight_) {
                    const uint8_t* srcRow = srcData_ + srcY * srcRowBytes_;
                    int copyWidth = std::min(pixelCount, srcWidth_ - procWindow.x1);
                    if (copyWidth > 0 && procWindow.x1 >= 0 && procWindow.x1 < srcWidth_) {
                        const uint8_t* srcPix = srcRow + procWindow.x1 * 4;
                        if (dstBitDepth == OFX::eBitDepthFloat) {
                            float* dst = (float*)dstPtr;
                            for (int i = 0; i < copyWidth * 4; i++) {
                                dst[i] = srcPix[i] / 255.0f;
                            }
                            // Zero remaining pixels
                            for (int i = copyWidth * 4; i < pixelCount * 4; i++) {
                                dst[i] = 0.0f;
                            }
                        } else if (dstBitDepth == OFX::eBitDepthUShort) {
                            unsigned short* dst = (unsigned short*)dstPtr;
                            for (int i = 0; i < copyWidth * 4; i++) {
                                dst[i] = (unsigned short)(srcPix[i] * 257); // 0-255 → 0-65535
                            }
                            for (int i = copyWidth * 4; i < pixelCount * 4; i++) {
                                dst[i] = 0;
                            }
                        } else {
                            memcpy(dstPtr, srcPix, copyWidth * 4);
                            if (pixelCount > copyWidth) {
                                memset((unsigned char*)dstPtr + copyWidth * 4, 0, (pixelCount - copyWidth) * 4);
                            }
                        }
                    } else {
                        // Zero the row
                        if (dstBitDepth == OFX::eBitDepthFloat) {
                            memset(dstPtr, 0, pixelCount * 4 * sizeof(float));
                        } else if (dstBitDepth == OFX::eBitDepthUShort) {
                            memset(dstPtr, 0, pixelCount * 4 * sizeof(unsigned short));
                        } else {
                            memset(dstPtr, 0, pixelCount * 4);
                        }
                    }
                }
            } else {
                if (dstBitDepth == OFX::eBitDepthFloat) {
                    memset(dstPtr, 0, pixelCount * 4 * sizeof(float));
                } else if (dstBitDepth == OFX::eBitDepthUShort) {
                    memset(dstPtr, 0, pixelCount * 4 * sizeof(unsigned short));
                } else {
                    memset(dstPtr, 0, pixelCount * 4);
                }
            }
        }
    }

private:
    const uint8_t* srcData_;
    int srcWidth_;
    int srcHeight_;
    int srcRowBytes_;
};

// --------------------------------------------------------------------------
// The OFX Plugin
// --------------------------------------------------------------------------
class SphereReaderPlugin : public OFX::ImageEffect {
public:
    SphereReaderPlugin(OfxImageEffectHandle handle)
        : OFX::ImageEffect(handle)
    {
        dstClip_ = fetchClip(kOfxImageEffectOutputClipName);
        // Source clip (optional — we generate output from the file)
        srcClip_ = fetchClip(kOfxImageEffectSimpleSourceClipName);
        filePath_ = fetchStringParam("filePath");
    }

    void render(const OFX::RenderArguments& args) override {
        std::string path;
        filePath_->getValueAtTime(args.time, path);

        if (path.empty()) {
            // No file specified — output black
            std::unique_ptr<OFX::Image> dst(dstClip_->fetchImage(args.time));
            if (!dst.get()) return;
            
            FrameCopyProcessor processor(*this);
            processor.setDstImg(dst.get());
            processor.setRenderWindow(args.renderWindow);
            processor.setSrcData(nullptr, 0, 0);
            processor.process();
            return;
        }

        // Open/reopen decoder if path changed
        std::lock_guard<std::mutex> lock(decoderMutex_);
        if (!decoder_.isOpen() || path != currentPath_) {
            decoder_.close();
            if (!decoder_.open(path)) {
                fprintf(stderr, "[SphereReader] Cannot open file: %s\n", path.c_str());
                return;
            }
            currentPath_ = path;
        }

        // Decode frame at current time
        int frameNum = (int)args.time;
        const uint8_t* frameData = decoder_.decodeFrame(frameNum);

        // Get output image
        std::unique_ptr<OFX::Image> dst(dstClip_->fetchImage(args.time));
        if (!dst.get()) return;

        // Copy decoded frame to OFX output
        FrameCopyProcessor processor(*this);
        processor.setDstImg(dst.get());
        processor.setRenderWindow(args.renderWindow);
        processor.setSrcData(frameData, decoder_.width(), decoder_.height());
        processor.process();
    }

    bool getRegionOfDefinition(const OFX::RegionOfDefinitionArguments& args,
                               OfxRectD& rod) override {
        // If we have a file open, use its dimensions
        std::string path;
        filePath_->getValueAtTime(args.time, path);

        if (!path.empty()) {
            std::lock_guard<std::mutex> lock(decoderMutex_);
            if (!decoder_.isOpen() || path != currentPath_) {
                decoder_.close();
                decoder_.open(path);
                currentPath_ = path;
            }
            if (decoder_.isOpen()) {
                rod.x1 = 0;
                rod.y1 = 0;
                rod.x2 = decoder_.width();
                rod.y2 = decoder_.height();
                return true;
            }
        }

        // Default: use project size
        rod.x1 = 0;
        rod.y1 = 0;
        rod.x2 = 1920;
        rod.y2 = 1080;
        return true;
    }

    void getClipPreferences(OFX::ClipPreferencesSetter& clipPreferences) override {
        clipPreferences.setOutputFrameVarying(true);
    }

private:
    OFX::Clip* dstClip_ = nullptr;
    OFX::Clip* srcClip_ = nullptr;
    OFX::StringParam* filePath_ = nullptr;

    VideoDecoder decoder_;
    std::string currentPath_;
    std::mutex decoderMutex_;
};

// --------------------------------------------------------------------------
// Plugin Factory
// --------------------------------------------------------------------------
mDeclarePluginFactory(SphereReaderPluginFactory, {}, {});

using namespace OFX;

void SphereReaderPluginFactory::describe(OFX::ImageEffectDescriptor& desc) {
    desc.setLabels("Sphere Reader", "Sphere Reader", "Sphere 360 Video Reader");
    desc.setPluginGrouping("Sphere");

    // Support both General and Generator contexts
    desc.addSupportedContext(eContextGeneral);
    desc.addSupportedContext(eContextGenerator);
    desc.addSupportedContext(eContextFilter);

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

void SphereReaderPluginFactory::describeInContext(OFX::ImageEffectDescriptor& desc,
                                                   OFX::ContextEnum context) {
    // Source clip (optional for generator, required for filter)
    ClipDescriptor* srcClip = desc.defineClip(kOfxImageEffectSimpleSourceClipName);
    srcClip->addSupportedComponent(ePixelComponentRGBA);
    srcClip->addSupportedComponent(ePixelComponentAlpha);
    srcClip->setSupportsTiles(true);
    if (context == eContextGenerator || context == eContextGeneral) {
        srcClip->setOptional(true);
    }

    // Output clip
    ClipDescriptor* dstClip = desc.defineClip(kOfxImageEffectOutputClipName);
    dstClip->addSupportedComponent(ePixelComponentRGBA);
    dstClip->setSupportsTiles(true);

    // File path parameter
    StringParamDescriptor* fileParam = desc.defineStringParam("filePath");
    fileParam->setLabels("Video File", "Video File", "Path to equirectangular video file");
    fileParam->setHint("Path to an equirectangular MP4/MOV video file");
    fileParam->setStringType(eStringTypeFilePath);
    fileParam->setFilePathExists(true);
    fileParam->setDefault("");
    fileParam->setAnimates(false);

    // Info display (read-only)
    StringParamDescriptor* infoParam = desc.defineStringParam("fileInfo");
    infoParam->setLabels("File Info", "File Info", "Information about the loaded file");
    infoParam->setHint("Displays resolution and codec info of the loaded file");
    infoParam->setStringType(eStringTypeSingleLine);
    infoParam->setDefault("No file loaded");
    infoParam->setAnimates(false);
    infoParam->setEnabled(false); // read-only display

    // Page
    PageParamDescriptor* page = desc.definePageParam("Controls");
    page->addChild(*fileParam);
    page->addChild(*infoParam);
}

OFX::ImageEffect* SphereReaderPluginFactory::createInstance(OfxImageEffectHandle handle,
                                                             OFX::ContextEnum /*context*/) {
    return new SphereReaderPlugin(handle);
}

// --------------------------------------------------------------------------
// Plugin registration
// --------------------------------------------------------------------------
namespace OFX {
namespace Plugin {
    void getPluginIDs(OFX::PluginFactoryArray& ids) {
        static SphereReaderPluginFactory p("com.sphere.reader", 1, 0);
        ids.push_back(&p);
    }
}
}
