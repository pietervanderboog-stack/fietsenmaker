"""Recolour the player sprites into NPC variants (other cyclists, other rockets).

Masks are computed on the original by hue band, then each variant recolours
its parts, so parts never bleed into each other.
Usage: python scripts/make-npc-sprites.py   → public/sprites/npc-*.png
"""
import colorsys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / "public" / "sprites"


def hsv(p):
    r, g, b = (c / 255 for c in p[:3])
    return colorsys.rgb_to_hsv(r, g, b)  # h in 0..1


def part_of(p, bands, fy):
    """Name of the part a pixel belongs to, or None. fy = y within its 32px frame."""
    if p[3] == 0:
        return None
    h, s, v = hsv(p)
    deg = h * 360
    for name, test in bands.items():
        if test(deg, s, v, fy):
            return name
    return None


def recolour(src, bands, variant):
    im = Image.open(SPRITES / src).convert("RGBA")
    out = im.copy()
    px, po = im.load(), out.load()
    for y in range(im.height):
        for x in range(im.width):
            p = px[x, y]
            part = part_of(p, bands, y % 32)
            if part not in variant:
                continue
            rule = variant[part]
            h, s, v = hsv(p)
            if "hue" in rule:
                h = rule["hue"] / 360
            s = min(1, s * rule.get("sat", 1))
            v = min(1, v * rule.get("val", 1))
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            po[x, y] = (round(r * 255), round(g * 255), round(b * 255), p[3])
    return out


CYCLIST_BANDS = {
    # The helmet sits in the top of each frame, the bike in the bottom half
    "helm": lambda d, s, v, fy: 28 <= d <= 62 and s > 0.55 and v > 0.5 and fy < 12,
    "shirt": lambda d, s, v, fy: (d >= 325 or d <= 12) and s > 0.45 and v > 0.35,
    "fiets": lambda d, s, v, fy: 14 < d < 40 and s > 0.6 and v > 0.55 and fy >= 16,
    "broek": lambda d, s, v, fy: 195 <= d <= 245 and s > 0.35,
    "huid": lambda d, s, v, fy: 8 <= d <= 40 and 0.15 < s <= 0.6 and v > 0.6,
}

CYCLISTS = {
    "npc-fietser-blauw": {"shirt": {"hue": 212}, "helm": {"sat": 0.05, "val": 1.05}, "fiets": {"hue": 130}},
    "npc-fietser-groen": {"shirt": {"hue": 135, "val": 0.85}, "helm": {"hue": 2}, "fiets": {"hue": 210}, "huid": {"val": 0.62, "sat": 1.3}},
    "npc-fietser-paars": {"shirt": {"hue": 280}, "helm": {"hue": 190}, "broek": {"hue": 25, "val": 0.7}},
    "npc-fietser-oranje": {"shirt": {"hue": 28}, "helm": {"hue": 300, "sat": 0.8}, "fiets": {"hue": 350}, "huid": {"val": 0.78, "sat": 1.15}},
}

ROCKET_BANDS = {
    "rood": lambda d, s, v, fy: (d >= 330 or d <= 12) and s > 0.5 and 0.35 < v and not (d <= 12 and v > 0.9),
    "blauw": lambda d, s, v, fy: 190 <= d <= 225 and s > 0.4,
}

ROCKETS = {
    "npc-raket-groen": {"rood": {"hue": 130, "val": 0.9}, "blauw": {"hue": 50}},
    "npc-raket-paars": {"rood": {"hue": 280}, "blauw": {"hue": 170}},
}

if __name__ == "__main__":
    for name, variant in CYCLISTS.items():
        recolour("cyclist.png", CYCLIST_BANDS, variant).save(SPRITES / f"{name}.png")
        print("✓", name)
    for name, variant in ROCKETS.items():
        recolour("rocket.png", ROCKET_BANDS, variant).save(SPRITES / f"{name}.png")
        print("✓", name)
