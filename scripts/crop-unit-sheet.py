from pathlib import Path
from PIL import Image

source = Image.open("public/sprites/unit-sheet.png").convert("RGBA")
output = Path("public/sprites/units")
output.mkdir(parents=True, exist_ok=True)
names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "Joker"]

for index, name in enumerate(names):
    column = index % 7
    row = index // 7
    left = round(source.width * column / 7)
    right = round(source.width * (column + 1) / 7)
    top = round(source.height * row / 2)
    bottom = round(source.height * (row + 1) / 2)
    cell = source.crop((left, top, right, bottom))
    alpha = cell.getchannel("A")
    box = alpha.getbbox()
    if box:
        cell = cell.crop(box)
    padded = Image.new("RGBA", (cell.width + 16, cell.height + 16), (0, 0, 0, 0))
    padded.alpha_composite(cell, (8, 8))
    padded.save(output / f"{name}.png", optimize=True)
