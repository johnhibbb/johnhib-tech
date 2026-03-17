// POC 2 — Metal Spherical Viewport
// Equirectangular → Rectilinear projection via Metal compute shader
// Standalone headless app: loads PNG texture, renders perspective views, writes output PNGs
//
// Build: clang++ -std=c++17 -framework Metal -framework Foundation -framework CoreGraphics -framework ImageIO main.mm -o equirect2rect

#import <Metal/Metal.h>
#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <ImageIO/ImageIO.h>
#include <cstdio>
#include <cmath>
#include <chrono>
#include <vector>

// ============================================================
// Metal Shader Source (compiled at runtime — no Xcode needed)
// ============================================================
static const char* shaderSource = R"METAL(
#include <metal_stdlib>
using namespace metal;

struct Params {
    float yaw;      // pan in radians
    float pitch;    // tilt in radians
    float fov;      // horizontal FOV in radians
    uint  outW;     // output width
    uint  outH;     // output height
};

// Equirectangular-to-rectilinear projection
//
// For each output pixel, we compute the ray direction in world space,
// then map that direction to equirectangular UV coordinates to sample
// the input texture.
//
// The math:
// 1. Map output pixel to normalized device coords (-1..1)
// 2. Compute ray direction using perspective projection (FOV-based)
// 3. Rotate ray by yaw (around Y) and pitch (around X)
// 4. Convert ray direction (x,y,z) to spherical coords (lon, lat)
// 5. Map spherical coords to equirectangular UV (0..1, 0..1)

kernel void equirect_to_rect(
    texture2d<float, access::sample>  inTex   [[texture(0)]],
    texture2d<float, access::write>   outTex  [[texture(1)]],
    constant Params&                  params  [[buffer(0)]],
    uint2                             gid     [[thread_position_in_grid]])
{
    if (gid.x >= params.outW || gid.y >= params.outH) return;

    // Step 1: Normalized device coordinates (-1..1)
    float aspect = float(params.outW) / float(params.outH);
    float halfFov = params.fov * 0.5;
    float scale = tan(halfFov);
    
    // NDC with Y flipped (top = +Y)
    float nx = (2.0 * (float(gid.x) + 0.5) / float(params.outW) - 1.0) * scale * aspect;
    float ny = (1.0 - 2.0 * (float(gid.y) + 0.5) / float(params.outH)) * scale;
    
    // Step 2: Ray direction in camera space (looking down -Z)
    float3 ray = normalize(float3(nx, ny, -1.0));
    
    // Step 3: Rotate by pitch (around X axis), then yaw (around Y axis)
    // Pitch rotation (positive = look up)
    float cp = cos(params.pitch);
    float sp = sin(params.pitch);
    ray = float3(ray.x, cp * ray.y - sp * ray.z, sp * ray.y + cp * ray.z);
    
    // Yaw rotation (positive = look right)
    // Negate angle: "pan right" = clockwise from above = negative rotation in RH coords
    float cy = cos(-params.yaw);
    float sy = sin(-params.yaw);
    ray = float3(cy * ray.x + sy * ray.z, ray.y, -sy * ray.x + cy * ray.z);
    
    // Step 4: Spherical coordinates from ray direction
    // lon = atan2(x, -z) → 0..2π  (wraps around equator)
    // lat = acos(y)       → 0..π   (north pole to south pole)
    float lon = atan2(ray.x, -ray.z);  // -π..π
    if (lon < 0.0) lon += 2.0 * M_PI_F;  // 0..2π
    float lat = acos(clamp(ray.y, -1.0f, 1.0f));  // 0..π
    
    // Step 5: Equirectangular UV
    float u = lon / (2.0 * M_PI_F);  // 0..1
    float v = lat / M_PI_F;          // 0..1
    
    // Sample with bilinear filtering and wrap addressing
    constexpr sampler smp(filter::linear, address::repeat);
    float4 color = inTex.sample(smp, float2(u, v));
    
    outTex.write(color, gid);
}
)METAL";

// ============================================================
// PNG Loading via CoreGraphics
// ============================================================
id<MTLTexture> loadPNGTexture(id<MTLDevice> device, const char* path) {
    NSString* nsPath = [NSString stringWithUTF8String:path];
    NSURL* url = [NSURL fileURLWithPath:nsPath];
    CGImageSourceRef source = CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
    if (!source) {
        fprintf(stderr, "Failed to open image: %s\n", path);
        return nil;
    }
    
    CGImageRef image = CGImageSourceCreateImageAtIndex(source, 0, NULL);
    CFRelease(source);
    if (!image) {
        fprintf(stderr, "Failed to decode image: %s\n", path);
        return nil;
    }
    
    size_t w = CGImageGetWidth(image);
    size_t h = CGImageGetHeight(image);
    printf("Loaded texture: %zux%zu from %s\n", w, h, path);
    
    // Convert to RGBA8
    std::vector<uint8_t> pixels(w * h * 4);
    CGColorSpaceRef cs = CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx = CGBitmapContextCreate(
        pixels.data(), w, h, 8, w * 4, cs,
        kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGContextDrawImage(ctx, CGRectMake(0, 0, w, h), image);
    CGContextRelease(ctx);
    CGColorSpaceRelease(cs);
    CGImageRelease(image);
    
    MTLTextureDescriptor* desc = [MTLTextureDescriptor
        texture2DDescriptorWithPixelFormat:MTLPixelFormatRGBA8Unorm
        width:w height:h mipmapped:NO];
    desc.usage = MTLTextureUsageShaderRead;
    id<MTLTexture> tex = [device newTextureWithDescriptor:desc];
    [tex replaceRegion:MTLRegionMake2D(0, 0, w, h)
           mipmapLevel:0
             withBytes:pixels.data()
           bytesPerRow:w * 4];
    return tex;
}

// ============================================================
// PNG Writing via CoreGraphics/ImageIO
// ============================================================
bool writePNG(const char* path, uint32_t w, uint32_t h, const uint8_t* rgba) {
    CGColorSpaceRef cs = CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx = CGBitmapContextCreate(
        (void*)rgba, w, h, 8, w * 4, cs,
        kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGImageRef img = CGBitmapContextCreateImage(ctx);
    CGContextRelease(ctx);
    CGColorSpaceRelease(cs);
    
    NSString* nsPath = [NSString stringWithUTF8String:path];
    NSURL* url = [NSURL fileURLWithPath:nsPath];
    CGImageDestinationRef dest = CGImageDestinationCreateWithURL(
        (__bridge CFURLRef)url, CFSTR("public.png"), 1, NULL);
    if (!dest) {
        CGImageRelease(img);
        return false;
    }
    CGImageDestinationAddImage(dest, img, NULL);
    bool ok = CGImageDestinationFinalize(dest);
    CFRelease(dest);
    CGImageRelease(img);
    return ok;
}

// ============================================================
// Params struct (must match shader)
// ============================================================
struct Params {
    float yaw;
    float pitch;
    float fov;
    uint32_t outW;
    uint32_t outH;
};

// ============================================================
// Main
// ============================================================
int main(int argc, const char* argv[]) {
    @autoreleasepool {
        // --- Config ---
        const char* inputPath = (argc > 1) ? argv[1] : "test_equirect.png";
        const uint32_t outW = 1920;
        const uint32_t outH = 1080;
        const float fovDeg = 90.0f;
        const float pitchDeg = 0.0f;
        
        printf("=== POC 2: Metal Spherical Viewport ===\n");
        printf("Output: %ux%u, FOV: %.0f°\n\n", outW, outH, fovDeg);
        
        // --- Metal device ---
        id<MTLDevice> device = MTLCreateSystemDefaultDevice();
        if (!device) {
            fprintf(stderr, "ERROR: No Metal device available\n");
            return 1;
        }
        printf("Metal device: %s\n", [[device name] UTF8String]);
        
        // --- Compile shader at runtime ---
        printf("Compiling Metal shader at runtime...\n");
        NSError* error = nil;
        MTLCompileOptions* opts = [[MTLCompileOptions alloc] init];
        id<MTLLibrary> library = [device newLibraryWithSource:
            [NSString stringWithUTF8String:shaderSource]
            options:opts error:&error];
        if (!library) {
            fprintf(stderr, "ERROR: Shader compilation failed:\n%s\n",
                    [[error localizedDescription] UTF8String]);
            return 1;
        }
        printf("Shader compiled successfully.\n");
        
        id<MTLFunction> kernelFunc = [library newFunctionWithName:@"equirect_to_rect"];
        if (!kernelFunc) {
            fprintf(stderr, "ERROR: Kernel function not found\n");
            return 1;
        }
        
        id<MTLComputePipelineState> pipeline =
            [device newComputePipelineStateWithFunction:kernelFunc error:&error];
        if (!pipeline) {
            fprintf(stderr, "ERROR: Pipeline creation failed:\n%s\n",
                    [[error localizedDescription] UTF8String]);
            return 1;
        }
        printf("Compute pipeline created. Max threads/group: %lu\n\n",
               (unsigned long)[pipeline maxTotalThreadsPerThreadgroup]);
        
        // --- Load input texture ---
        id<MTLTexture> inTex = loadPNGTexture(device, inputPath);
        if (!inTex) return 1;
        
        // --- Create output texture ---
        MTLTextureDescriptor* outDesc = [MTLTextureDescriptor
            texture2DDescriptorWithPixelFormat:MTLPixelFormatRGBA8Unorm
            width:outW height:outH mipmapped:NO];
        outDesc.usage = MTLTextureUsageShaderWrite;
        id<MTLTexture> outTex = [device newTextureWithDescriptor:outDesc];
        
        // --- Command queue ---
        id<MTLCommandQueue> queue = [device newCommandQueue];
        
        // --- Params buffer ---
        Params params;
        params.fov = fovDeg * M_PI / 180.0f;
        params.pitch = pitchDeg * M_PI / 180.0f;
        params.outW = outW;
        params.outH = outH;
        
        // --- Thread group sizing ---
        NSUInteger threadW = 16;
        NSUInteger threadH = 16;
        MTLSize threadgroupSize = MTLSizeMake(threadW, threadH, 1);
        MTLSize gridSize = MTLSizeMake(
            (outW + threadW - 1) / threadW * threadW,
            (outH + threadH - 1) / threadH * threadH, 1);
        
        // --- Readback buffer ---
        std::vector<uint8_t> readback(outW * outH * 4);
        
        // ==========================================================
        // Test 1: Render views at different yaw angles, write PNGs
        // ==========================================================
        printf("\n--- Rendering static views ---\n");
        float yawAngles[] = {0.0f, 90.0f, 180.0f, 270.0f, 45.0f};
        const char* yawNames[] = {"front", "right", "back", "left", "45deg"};
        
        for (int i = 0; i < 5; i++) {
            params.yaw = yawAngles[i] * M_PI / 180.0f;
            
            id<MTLCommandBuffer> cmdBuf = [queue commandBuffer];
            id<MTLComputeCommandEncoder> enc = [cmdBuf computeCommandEncoder];
            [enc setComputePipelineState:pipeline];
            [enc setTexture:inTex atIndex:0];
            [enc setTexture:outTex atIndex:1];
            [enc setBytes:&params length:sizeof(params) atIndex:0];
            [enc dispatchThreads:MTLSizeMake(outW, outH, 1)
                threadsPerThreadgroup:threadgroupSize];
            [enc endEncoding];
            [cmdBuf commit];
            [cmdBuf waitUntilCompleted];
            
            // Read back pixels
            [outTex getBytes:readback.data()
                 bytesPerRow:outW * 4
                  fromRegion:MTLRegionMake2D(0, 0, outW, outH)
                 mipmapLevel:0];
            
            char outPath[256];
            snprintf(outPath, sizeof(outPath), "output_%s.png", yawNames[i]);
            if (writePNG(outPath, outW, outH, readback.data())) {
                printf("  Written: %s (yaw=%.0f°)\n", outPath, yawAngles[i]);
            } else {
                fprintf(stderr, "  FAILED to write: %s\n", outPath);
            }
        }
        
        // ==========================================================
        // Test 2: Render with pitch variations
        // ==========================================================
        printf("\n--- Rendering pitch variations ---\n");
        float pitchAngles[] = {-45.0f, 30.0f, -60.0f};
        const char* pitchNames[] = {"down45", "up30", "down60"};
        
        for (int i = 0; i < 3; i++) {
            params.yaw = 0.0f;
            params.pitch = pitchAngles[i] * M_PI / 180.0f;
            
            id<MTLCommandBuffer> cmdBuf = [queue commandBuffer];
            id<MTLComputeCommandEncoder> enc = [cmdBuf computeCommandEncoder];
            [enc setComputePipelineState:pipeline];
            [enc setTexture:inTex atIndex:0];
            [enc setTexture:outTex atIndex:1];
            [enc setBytes:&params length:sizeof(params) atIndex:0];
            [enc dispatchThreads:MTLSizeMake(outW, outH, 1)
                threadsPerThreadgroup:threadgroupSize];
            [enc endEncoding];
            [cmdBuf commit];
            [cmdBuf waitUntilCompleted];
            
            [outTex getBytes:readback.data()
                 bytesPerRow:outW * 4
                  fromRegion:MTLRegionMake2D(0, 0, outW, outH)
                 mipmapLevel:0];
            
            char outPath[256];
            snprintf(outPath, sizeof(outPath), "output_pitch_%s.png", pitchNames[i]);
            if (writePNG(outPath, outW, outH, readback.data())) {
                printf("  Written: %s (pitch=%.0f°)\n", outPath, pitchAngles[i]);
            }
        }
        
        // ==========================================================
        // Test 3: FOV variation
        // ==========================================================
        printf("\n--- Rendering FOV variations ---\n");
        float fovAngles[] = {60.0f, 120.0f, 150.0f};
        const char* fovNames[] = {"fov60", "fov120", "fov150"};
        
        for (int i = 0; i < 3; i++) {
            params.yaw = 45.0f * M_PI / 180.0f;
            params.pitch = 0.0f;
            params.fov = fovAngles[i] * M_PI / 180.0f;
            
            id<MTLCommandBuffer> cmdBuf = [queue commandBuffer];
            id<MTLComputeCommandEncoder> enc = [cmdBuf computeCommandEncoder];
            [enc setComputePipelineState:pipeline];
            [enc setTexture:inTex atIndex:0];
            [enc setTexture:outTex atIndex:1];
            [enc setBytes:&params length:sizeof(params) atIndex:0];
            [enc dispatchThreads:MTLSizeMake(outW, outH, 1)
                threadsPerThreadgroup:threadgroupSize];
            [enc endEncoding];
            [cmdBuf commit];
            [cmdBuf waitUntilCompleted];
            
            [outTex getBytes:readback.data()
                 bytesPerRow:outW * 4
                  fromRegion:MTLRegionMake2D(0, 0, outW, outH)
                 mipmapLevel:0];
            
            char outPath[256];
            snprintf(outPath, sizeof(outPath), "output_%s.png", fovNames[i]);
            if (writePNG(outPath, outW, outH, readback.data())) {
                printf("  Written: %s (fov=%.0f°, yaw=45°)\n", outPath, fovAngles[i]);
            }
        }
        
        // ==========================================================
        // Test 4: Performance benchmark — 360 frames (1° per frame)
        // ==========================================================
        printf("\n--- Performance benchmark: 360 frames at 1080p ---\n");
        params.pitch = 0.0f;
        params.fov = 90.0f * M_PI / 180.0f;
        
        auto t0 = std::chrono::high_resolution_clock::now();
        
        for (int frame = 0; frame < 360; frame++) {
            params.yaw = float(frame) * M_PI / 180.0f;
            
            id<MTLCommandBuffer> cmdBuf = [queue commandBuffer];
            id<MTLComputeCommandEncoder> enc = [cmdBuf computeCommandEncoder];
            [enc setComputePipelineState:pipeline];
            [enc setTexture:inTex atIndex:0];
            [enc setTexture:outTex atIndex:1];
            [enc setBytes:&params length:sizeof(params) atIndex:0];
            [enc dispatchThreads:MTLSizeMake(outW, outH, 1)
                threadsPerThreadgroup:threadgroupSize];
            [enc endEncoding];
            [cmdBuf commit];
            // Don't wait between frames — let GPU pipeline
        }
        
        // Wait for last command
        id<MTLCommandBuffer> lastCmd = [queue commandBuffer];
        id<MTLBlitCommandEncoder> blit = [lastCmd blitCommandEncoder];
        [blit endEncoding];
        [lastCmd commit];
        [lastCmd waitUntilCompleted];
        
        auto t1 = std::chrono::high_resolution_clock::now();
        double ms = std::chrono::duration<double, std::milli>(t1 - t0).count();
        double fps = 360.0 / (ms / 1000.0);
        
        printf("  360 frames rendered in %.1f ms\n", ms);
        printf("  Average: %.1f fps (%.2f ms/frame)\n", fps, ms / 360.0);
        printf("  Target for real-time: 24+ fps → %s\n",
               fps >= 24.0 ? "✅ PASS" : "❌ FAIL");
        printf("  Target for smooth:    60+ fps → %s\n",
               fps >= 60.0 ? "✅ PASS" : "❌ FAIL");
        
        // ==========================================================
        // Test 5: Benchmark at 5.7K (5760x2880 input, 2880x1620 output)
        // ==========================================================
        printf("\n--- Performance benchmark: simulated 5.7K ---\n");
        const uint32_t outW57 = 2880;
        const uint32_t outH57 = 1620;
        
        MTLTextureDescriptor* outDesc57 = [MTLTextureDescriptor
            texture2DDescriptorWithPixelFormat:MTLPixelFormatRGBA8Unorm
            width:outW57 height:outH57 mipmapped:NO];
        outDesc57.usage = MTLTextureUsageShaderWrite;
        id<MTLTexture> outTex57 = [device newTextureWithDescriptor:outDesc57];
        
        Params params57;
        params57.fov = 90.0f * M_PI / 180.0f;
        params57.pitch = 0.0f;
        params57.outW = outW57;
        params57.outH = outH57;
        
        auto t2 = std::chrono::high_resolution_clock::now();
        
        for (int frame = 0; frame < 360; frame++) {
            params57.yaw = float(frame) * M_PI / 180.0f;
            
            id<MTLCommandBuffer> cmdBuf = [queue commandBuffer];
            id<MTLComputeCommandEncoder> enc = [cmdBuf computeCommandEncoder];
            [enc setComputePipelineState:pipeline];
            [enc setTexture:inTex atIndex:0];
            [enc setTexture:outTex57 atIndex:1];
            [enc setBytes:&params57 length:sizeof(params57) atIndex:0];
            [enc dispatchThreads:MTLSizeMake(outW57, outH57, 1)
                threadsPerThreadgroup:threadgroupSize];
            [enc endEncoding];
            [cmdBuf commit];
        }
        
        id<MTLCommandBuffer> lastCmd57 = [queue commandBuffer];
        id<MTLBlitCommandEncoder> blit57 = [lastCmd57 blitCommandEncoder];
        [blit57 endEncoding];
        [lastCmd57 commit];
        [lastCmd57 waitUntilCompleted];
        
        auto t3 = std::chrono::high_resolution_clock::now();
        double ms57 = std::chrono::duration<double, std::milli>(t3 - t2).count();
        double fps57 = 360.0 / (ms57 / 1000.0);
        
        printf("  Output: %ux%u (using 2K source — real 5.7K would use 5.7K source)\n",
               outW57, outH57);
        printf("  360 frames rendered in %.1f ms\n", ms57);
        printf("  Average: %.1f fps (%.2f ms/frame)\n", fps57, ms57 / 360.0);
        printf("  Real-time at 5.7K: %s\n",
               fps57 >= 24.0 ? "✅ Likely achievable" : "⚠️ May need optimization");
        
        printf("\n=== POC 2 Complete ===\n");
        return 0;
    }
}
