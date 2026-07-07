from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (10, 14, 20, 255)      # --bg
ACCENT = (57, 255, 157, 255)  # --accent green
TEXT = (214, 224, 240, 255)   # --text

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = int(size * 0.08) if maskable else 0
    rect = [pad, pad, size - pad, size - pad]
    radius = int(size * 0.22)
    draw.rounded_rectangle(rect, radius=radius, fill=BG)

    cx, cy = size / 2, size / 2
    check_w = size * 0.34
    check_h = size * 0.34
    x0 = cx - check_w / 2
    y0 = cy - check_h / 2 + size * 0.03
    line_w = max(int(size * 0.055), 3)

    p1 = (x0, y0 + check_h * 0.55)
    p2 = (x0 + check_w * 0.38, y0 + check_h)
    p3 = (x0 + check_w, y0 + check_h * 0.15)

    draw.line([p1, p2], fill=ACCENT, width=line_w, joint="curve")
    draw.line([p2, p3], fill=ACCENT, width=line_w, joint="curve")

    r = line_w / 2
    for pt in (p1, p2, p3):
        draw.ellipse([pt[0]-r, pt[1]-r, pt[0]+r, pt[1]+r], fill=ACCENT)

    bracket_w = max(int(size * 0.03), 2)
    bx = size * 0.14
    by = size * 0.78
    bl = size * 0.10
    draw.line([(bx, by), (bx, by + bl)], fill=TEXT, width=bracket_w)
    draw.line([(bx, by), (bx + bl*0.5, by)], fill=TEXT, width=bracket_w)

    return img

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    icon = make_icon(s)
    icon.save(os.path.join(OUT_DIR, f"icon-{s}.png"))

maskable = make_icon(512, maskable=True)
maskable.save(os.path.join(OUT_DIR, "icon-maskable-512.png"))

print("Generated icons:", os.listdir(OUT_DIR))
