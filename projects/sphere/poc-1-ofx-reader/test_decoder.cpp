// Standalone test for the VideoDecoder — doesn't need OFX
// Build: clang++ -std=c++17 test_decoder.cpp -I/opt/homebrew/include -L/opt/homebrew/lib -lavcodec -lavformat -lswscale -lavutil -o test_decoder

#include <cstdio>
#include <cstring>
#include <string>
#include <mutex>

extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
#include <libavutil/imgutils.h>
}

// Paste the VideoDecoder class inline (in real code, share via header)
// For this test, we just verify FFmpeg decode works

int main(int argc, char** argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <video.mp4>\n", argv[0]);
        return 1;
    }

    const char* path = argv[1];

    AVFormatContext* fmtCtx = nullptr;
    if (avformat_open_input(&fmtCtx, path, nullptr, nullptr) < 0) {
        fprintf(stderr, "Failed to open %s\n", path);
        return 1;
    }

    if (avformat_find_stream_info(fmtCtx, nullptr) < 0) {
        fprintf(stderr, "Failed to find stream info\n");
        return 1;
    }

    int videoIdx = -1;
    for (unsigned i = 0; i < fmtCtx->nb_streams; i++) {
        if (fmtCtx->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_VIDEO) {
            videoIdx = (int)i;
            break;
        }
    }

    if (videoIdx < 0) {
        fprintf(stderr, "No video stream\n");
        return 1;
    }

    AVCodecParameters* par = fmtCtx->streams[videoIdx]->codecpar;
    const AVCodec* codec = avcodec_find_decoder(par->codec_id);
    AVCodecContext* ctx = avcodec_alloc_context3(codec);
    avcodec_parameters_to_context(ctx, par);
    avcodec_open2(ctx, codec, nullptr);

    printf("Video: %dx%d, codec=%s\n", ctx->width, ctx->height, codec->name);

    // Decode first frame
    AVPacket* pkt = av_packet_alloc();
    AVFrame* frame = av_frame_alloc();
    
    bool decoded = false;
    while (av_read_frame(fmtCtx, pkt) >= 0) {
        if (pkt->stream_index == videoIdx) {
            avcodec_send_packet(ctx, pkt);
            if (avcodec_receive_frame(ctx, frame) >= 0) {
                printf("Decoded frame: pts=%lld, size=%dx%d, format=%d\n",
                       frame->pts, frame->width, frame->height, frame->format);
                
                // Convert to RGBA
                SwsContext* sws = sws_getContext(
                    ctx->width, ctx->height, ctx->pix_fmt,
                    ctx->width, ctx->height, AV_PIX_FMT_RGBA,
                    SWS_BILINEAR, nullptr, nullptr, nullptr);
                
                uint8_t* rgbaData[4] = {nullptr};
                int rgbaLinesize[4] = {0};
                av_image_alloc(rgbaData, rgbaLinesize, ctx->width, ctx->height, AV_PIX_FMT_RGBA, 32);
                
                sws_scale(sws, frame->data, frame->linesize, 0, ctx->height, rgbaData, rgbaLinesize);
                
                // Check first pixel
                printf("First pixel RGBA: %d %d %d %d\n",
                       rgbaData[0][0], rgbaData[0][1], rgbaData[0][2], rgbaData[0][3]);
                printf("Pixel at center: %d %d %d %d\n",
                       rgbaData[0][(ctx->height/2 * rgbaLinesize[0]) + (ctx->width/2 * 4) + 0],
                       rgbaData[0][(ctx->height/2 * rgbaLinesize[0]) + (ctx->width/2 * 4) + 1],
                       rgbaData[0][(ctx->height/2 * rgbaLinesize[0]) + (ctx->width/2 * 4) + 2],
                       rgbaData[0][(ctx->height/2 * rgbaLinesize[0]) + (ctx->width/2 * 4) + 3]);

                av_freep(&rgbaData[0]);
                sws_freeContext(sws);
                decoded = true;
                break;
            }
        }
        av_packet_unref(pkt);
    }

    if (!decoded) {
        fprintf(stderr, "Failed to decode any frame\n");
    } else {
        printf("\n✅ FFmpeg decode pipeline working correctly.\n");
    }

    av_frame_free(&frame);
    av_packet_free(&pkt);
    avcodec_free_context(&ctx);
    avformat_close_input(&fmtCtx);
    return decoded ? 0 : 1;
}
