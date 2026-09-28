"""
Remove baked-in checkerboard transparency pattern from AI-generated sprites.

Usage:
    python remove_checkerboard.py sprite.png
    python remove_checkerboard.py sprites/    (processes all PNGs in folder)

Options:
    --tolerance  How loosely to match checkerboard colors (default: 30)
    --output     Output directory (default: cleaned/)
"""

import sys
import os
import glob
import numpy as np
from PIL import Image


def remove_checkerboard(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    white = np.array([255, 255, 255])
    gray = np.array([204, 204, 204])

    rgb = data[:, :, :3].astype(int)
    white_mask = np.all(np.abs(rgb - white) <= tolerance, axis=2)
    gray_mask = np.all(np.abs(rgb - gray) <= tolerance, axis=2)

    data[white_mask | gray_mask, 3] = 0

    Image.fromarray(data).save(output_path)
    print(f"  {os.path.basename(input_path)} -> {output_path}")


def main():
    tolerance = 30
    output_dir = "cleaned"

    args = sys.argv[1:]
    while args and args[0].startswith("--"):
        if args[0] == "--tolerance" and len(args) > 1:
            tolerance = int(args[1])
            args = args[2:]
        elif args[0] == "--output" and len(args) > 1:
            output_dir = args[1]
            args = args[2:]
        else:
            args = args[1:]

    if not args:
        print("Usage: python remove_checkerboard.py <file_or_folder> [--tolerance 30] [--output cleaned/]")
        sys.exit(1)

    target = args[0]

    if os.path.isdir(target):
        files = sorted(glob.glob(os.path.join(target, "*.png")))
    else:
        files = [target]

    if not files:
        print(f"No PNG files found in {target}")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing {len(files)} file(s) with tolerance={tolerance}...")
    for f in files:
        out = os.path.join(output_dir, os.path.basename(f))
        remove_checkerboard(f, out, tolerance)

    print("Done!")


if __name__ == "__main__":
    main()
