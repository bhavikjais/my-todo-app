"""Generate app icons in the THEME.md style: ink checkmark on the pastel "Button" gradient.

Run:  python scripts/gen_icons.py
Writes icons/icon-<size>.png (rounded tile, purpose "any") and icons/icon-maskable-512.png
(full-bleed square; the check stays inside Android's 80% safe zone).
"""
from PIL import Image, ImageDraw
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

# THEME.md --g-button: linear-gradient(90deg, #CFD8F7 0%, #E9C3EC 55%, #F4B6D8 100%), drawn diagonally here
STOPS = [(0.0, (0xCF, 0xD8, 0xF7)), (0.55, (0xE9, 0xC3, 0xEC)), (1.0, (0xF4, 0xB6, 0xD8))]
INK = (0x14, 0x14, 0x16, 255)
SS = 4  # supersampling for smooth edges


def lerp_color(t):
    for (t0, c0), (t1, c1) in zip(STOPS, STOPS[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            return tuple(round(a + (b - a) * k) for a, b in zip(c0, c1))
    return STOPS[-1][1]


def gradient(size):
    # 1-px strip -> square, then rotate 45deg so it runs top-left -> bottom-right
    n = size * 2
    strip = Image.new("RGB", (n, 1))
    strip.putdata([lerp_color(x / (n - 1)) for x in range(n)])
    big = strip.resize((n, n)).rotate(-45, resample=Image.BICUBIC)
    o = (n - size) // 2
    return big.crop((o, o, o + size, o + size)).convert("RGBA")


def make_icon(size, maskable=False):
    S = size * SS
    img = gradient(S)
    if not maskable:  # rounded tile for browsers / desktop
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.24), fill=255)
        img.putalpha(mask)

    d = ImageDraw.Draw(img)
    scale = 0.36 if maskable else 0.44  # maskable: keep well inside the safe zone
    w = S * scale
    cx, cy = S / 2, S / 2
    p1 = (cx - w * 0.50, cy + w * 0.02)
    p2 = (cx - w * 0.14, cy + w * 0.36)
    p3 = (cx + w * 0.50, cy - w * 0.34)
    lw = int(S * (0.075 if maskable else 0.09))
    d.line([p1, p2, p3], fill=INK, width=lw, joint="curve")
    r = lw / 2
    for x, y in (p1, p3):  # round caps
        d.ellipse([x - r, y - r, x + r, y + r], fill=INK)
    return img.resize((size, size), Image.LANCZOS)


for s in [72, 96, 128, 144, 152, 192, 384, 512]:
    make_icon(s).save(os.path.join(OUT_DIR, f"icon-{s}.png"))
make_icon(512, maskable=True).save(os.path.join(OUT_DIR, "icon-maskable-512.png"))
print("Generated icons:", sorted(os.listdir(OUT_DIR)))
