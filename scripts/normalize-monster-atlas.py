"""Normalize the 5x4 monster atlas without redrawing its sprites.

The generated source atlas did not use integer cell boundaries and every row
had a different foot line.  This script extracts each alpha silhouette,
nearest-neighbour scales it into a common visual box, and anchors every sprite
to the same baseline on a square transparent cell.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


COLS = 5
ROWS = 4
CELL_SIZE = 256
VISUAL_BOX = 216
BASELINE = 232
ALPHA_THRESHOLD = 8


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A").point(
        lambda value: 255 if value > ALPHA_THRESHOLD else 0
    )
    return alpha.getbbox()


def remove_neighbor_bleed(image: Image.Image) -> Image.Image:
    """Remove pieces of an adjacent sprite that crossed a source grid edge."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    components: list[tuple[list[tuple[int, int]], bool]] = []

    for y in range(height):
        for x in range(width):
            if (x, y) in seen or pixels[x, y] <= ALPHA_THRESHOLD:
                continue
            stack = [(x, y)]
            seen.add((x, y))
            component: list[tuple[int, int]] = []
            touches_vertical_edge = False
            while stack:
                px, py = stack.pop()
                component.append((px, py))
                touches_vertical_edge |= px == 0 or px == width - 1
                for nx in range(max(0, px - 1), min(width, px + 2)):
                    for ny in range(max(0, py - 1), min(height, py + 2)):
                        if (nx, ny) in seen or pixels[nx, ny] <= ALPHA_THRESHOLD:
                            continue
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            components.append((component, touches_vertical_edge))

    if not components:
        return image
    largest = max(range(len(components)), key=lambda index: len(components[index][0]))
    erase = [
        point
        for index, (component, touches_edge) in enumerate(components)
        if touches_edge and index != largest
        for point in component
    ]
    if not erase:
        return image
    cleaned = image.copy()
    cleaned_pixels = cleaned.load()
    for x, y in erase:
        cleaned_pixels[x, y] = (0, 0, 0, 0)
    return cleaned


def normalize(input_path: Path, output_path: Path) -> None:
    source = Image.open(input_path).convert("RGBA")
    atlas = Image.new("RGBA", (COLS * CELL_SIZE, ROWS * CELL_SIZE), (0, 0, 0, 0))

    for row in range(ROWS):
        for col in range(COLS):
            # round() distributes the source's non-divisible 1254 pixels
            # consistently instead of losing the final row/column.
            left = round(col * source.width / COLS)
            top = round(row * source.height / ROWS)
            right = round((col + 1) * source.width / COLS)
            bottom = round((row + 1) * source.height / ROWS)
            cell = remove_neighbor_bleed(source.crop((left, top, right, bottom)))
            bbox = alpha_bbox(cell)
            if bbox is None:
                raise ValueError(f"empty sprite at row={row}, col={col}")

            sprite = cell.crop(bbox)
            scale = min(VISUAL_BOX / sprite.width, VISUAL_BOX / sprite.height)
            width = max(1, round(sprite.width * scale))
            height = max(1, round(sprite.height * scale))
            sprite = sprite.resize((width, height), Image.Resampling.NEAREST)

            x = col * CELL_SIZE + (CELL_SIZE - width) // 2
            y = row * CELL_SIZE + BASELINE - height
            atlas.alpha_composite(sprite, (x, y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output_path, optimize=True)


def validate(path: Path) -> None:
    atlas = Image.open(path).convert("RGBA")
    expected = (COLS * CELL_SIZE, ROWS * CELL_SIZE)
    if atlas.size != expected:
        raise AssertionError(f"atlas size {atlas.size}, expected {expected}")
    if atlas.getpixel((0, 0))[3] != 0:
        raise AssertionError("atlas corner is not transparent")

    for row in range(ROWS):
        for col in range(COLS):
            cell = atlas.crop(
                (
                    col * CELL_SIZE,
                    row * CELL_SIZE,
                    (col + 1) * CELL_SIZE,
                    (row + 1) * CELL_SIZE,
                )
            )
            bbox = alpha_bbox(cell)
            if bbox is None:
                raise AssertionError(f"empty output sprite at row={row}, col={col}")
            left, top, right, bottom = bbox
            if bottom != BASELINE:
                raise AssertionError(
                    f"baseline mismatch at row={row}, col={col}: {bottom}"
                )
            if left <= 0 or right >= CELL_SIZE or top <= 0:
                raise AssertionError(
                    f"sprite touches cell edge at row={row}, col={col}: {bbox}"
                )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    normalize(args.input, args.output)
    validate(args.output)
    print(f"normalized and validated: {args.output} ({COLS}x{ROWS}, {CELL_SIZE}px cells)")


if __name__ == "__main__":
    main()
