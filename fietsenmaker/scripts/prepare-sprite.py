"""Turn a Gemini spritesheet into a game-ready 128×128 sheet (4×4 frames of 32px).

  python scripts/prepare-sprite.py <input.png> <name> [--mirror-right] [--cols=N] [--height=PX]
      --cols=N    Gemini often returns N columns instead of 4 (e.g. 6); 4 are picked evenly
      --height=PX tallest frame in px (default 28 = player size; ~16 for small animals)
      --auto      find the figures per row instead of assuming a grid (Gemini sometimes
                  puts 8 figures in one row and 6 in the next)
      → public/sprites/<name>.png + debug/<name>-check.png (enlarged, on grey)
  python scripts/prepare-sprite.py --preview <sprite.png>
      → debug/<stem>-ref.png, a crisp 1024×1024 upscale to use as style reference

Steps: split into a 4×4 grid, make magenta transparent, crop each frame to
its content, scale it into 32×32 with nearest-neighbour, and bottom-align all
frames on the same baseline so the character doesn't jitter while walking.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FRAME = 32
BASELINE = 30  # feet land on this row of each 32px frame
MAX_H = 28     # tallest frame height after scaling


def is_magenta(p):
    # Also catches the anti-aliased magenta fringe around the character:
    # anything where red and blue both clearly dominate green
    r, g, b, a = p
    return a == 0 or (r - g > 60 and b - g > 60)


def key_out(cell):
    cell = cell.convert("RGBA")
    px = cell.load()
    for y in range(cell.height):
        for x in range(cell.width):
            if is_magenta(px[x, y]):
                px[x, y] = (0, 0, 0, 0)
    return cell


def find_figures(band):
    """x-ranges of figures in a keyed row band, split on empty columns."""
    px = band.load()
    filled = [any(px[x, y][3] for y in range(0, band.height, 2)) for x in range(band.width)]
    segs, start = [], None
    for x, f in enumerate(filled + [False]):
        if f and start is None:
            start = x
        elif not f and start is not None:
            segs.append([start, x])
            start = None
    # Merge tiny gaps (a tail or a foot separated by a column or two)
    merged = []
    for a, b in segs:
        if merged and a - merged[-1][1] < 6:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return [m for m in merged if m[1] - m[0] > 12]


def prepare(src, name, mirror_right=False, cols=4, max_h=MAX_H, auto=False):
    im = Image.open(src).convert("RGBA")
    ch = im.height / 4
    if auto:
        cells = []
        for r in range(4):
            band = key_out(im.crop((0, round(r * ch) + 2, im.width, round((r + 1) * ch) - 2)))
            figs = find_figures(band)
            if len(figs) < 4:
                sys.exit(f"Row {r + 1}: found only {len(figs)} figures")
            picks = [figs[int(i * len(figs) / 4)] for i in range(4)]
            cells.append([band.crop((a, 0, b, band.height)) for a, b in picks])
    else:
        cw = im.width / cols
        picks = [int(i * cols / 4) for i in range(4)]
        # 2px inset per cell drops grid seams / neighbours bleeding in
        cells = [[key_out(im.crop((round(c * cw) + 2, round(r * ch) + 2, round((c + 1) * cw) - 2, round((r + 1) * ch) - 2)))
                  for c in picks] for r in range(4)]

    # One scale for all frames, based on the tallest content, so size stays constant
    boxes = [[cell.getbbox() for cell in row] for row in cells]
    heights = [b[3] - b[1] for row in boxes for b in row if b]
    widths = [b[2] - b[0] for row in boxes for b in row if b]
    if not heights:
        sys.exit("No content found — is the background magenta #FF00FF?")
    scale = min(max_h / max(heights), (FRAME - 2) / max(widths))

    out = Image.new("RGBA", (FRAME * 4, FRAME * 4), (0, 0, 0, 0))
    for r in range(4):
        for c in range(4):
            box = boxes[r][c]
            if not box:
                continue
            part = cells[r][c].crop(box)
            w = max(1, round(part.width * scale))
            h = max(1, round(part.height * scale))
            part = part.resize((w, h), Image.NEAREST)
            x = c * FRAME + (FRAME - w) // 2
            y = r * FRAME + BASELINE - h
            out.alpha_composite(part, (x, max(r * FRAME, y)))

    if mirror_right:
        left = out.crop((0, FRAME, FRAME * 4, FRAME * 2))
        mirrored = Image.new("RGBA", left.size)
        for c in range(4):
            f = left.crop((c * FRAME, 0, (c + 1) * FRAME, FRAME)).transpose(Image.FLIP_LEFT_RIGHT)
            mirrored.paste(f, (c * FRAME, 0))
        out.paste(mirrored, (0, FRAME * 2))

    dest = ROOT / "public" / "sprites" / f"{name}.png"
    out.save(dest)
    check = Image.new("RGBA", (512, 512), (190, 190, 190, 255))
    check.alpha_composite(out.resize((512, 512), Image.NEAREST))
    (ROOT / "debug").mkdir(exist_ok=True)
    check.save(ROOT / "debug" / f"{name}-check.png")
    print(f"✓ {dest.relative_to(ROOT)}  (check: debug/{name}-check.png)")


def preview(src):
    im = Image.open(src).convert("RGBA")
    big = Image.new("RGBA", (1024, 1024), (255, 0, 255, 255))
    big.alpha_composite(im.resize((1024, 1024), Image.NEAREST))
    (ROOT / "debug").mkdir(exist_ok=True)
    dest = ROOT / "debug" / f"{Path(src).stem}-ref.png"
    big.convert("RGB").save(dest)
    print(f"✓ {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--preview" in sys.argv and args:
        preview(args[0])
    elif len(args) == 2:
        opt = dict(a[2:].split("=", 1) for a in sys.argv if a.startswith("--") and "=" in a)
        prepare(args[0], args[1], mirror_right="--mirror-right" in sys.argv,
                cols=int(opt.get("cols", 4)), max_h=int(opt.get("height", MAX_H)),
                auto="--auto" in sys.argv)
    else:
        sys.exit(__doc__)
