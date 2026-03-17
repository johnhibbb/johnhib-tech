#!/usr/bin/env python3
"""Generate a test equirectangular image with grid lines and color regions.
Output: test_equirect.png (2048x1024)
"""
import struct, zlib, math, os

W, H = 2048, 1024

def make_pixel(x, y):
    """Generate RGBA for pixel at (x,y) in equirect image."""
    # Map to spherical coords
    lon = (x / W) * 360.0  # 0..360
    lat = (y / H) * 180.0  # 0..180 (top=north pole)
    
    # Color regions by longitude quadrant
    quad = int(lon / 90) % 4
    base_colors = [
        (180, 60, 60),   # Red - front (0-90)
        (60, 180, 60),   # Green - right (90-180)
        (60, 60, 180),   # Blue - back (180-270)
        (200, 180, 60),  # Yellow - left (270-360)
    ]
    r, g, b = base_colors[quad]
    
    # Darken southern hemisphere slightly
    if lat > 90:
        r = int(r * 0.7)
        g = int(g * 0.7)
        b = int(b * 0.7)
    
    # Grid lines every 30 degrees
    lon_grid = lon % 30.0
    lat_grid = lat % 30.0
    grid_w = 1.5
    if lon_grid < grid_w or lon_grid > (30.0 - grid_w) or lat_grid < grid_w or lat_grid > (30.0 - grid_w):
        r, g, b = 255, 255, 255
    
    # Equator line (thicker)
    if abs(lat - 90.0) < 2.0:
        r, g, b = 255, 255, 0
    
    # Prime meridian (lon=0)
    if lon < 2.0 or lon > 358.0:
        r, g, b = 255, 0, 255
    
    return bytes([r, g, b, 255])

# Build raw image data
print(f"Generating {W}x{H} test equirectangular image...")
rows = []
for y in range(H):
    row = b'\x00'  # PNG filter byte: None
    for x in range(W):
        row += make_pixel(x, y)
    rows.append(row)

raw_data = b''.join(rows)

# Write PNG manually (no PIL dependency)
def write_png(filename, width, height, raw_data):
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    compressed = zlib.compress(raw_data, 9)
    
    with open(filename, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))

out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test_equirect.png')
write_png(out_path, W, H, raw_data)
print(f"Written to {out_path}")
print(f"File size: {os.path.getsize(out_path)} bytes")
