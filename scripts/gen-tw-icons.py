#!/usr/bin/env python3
"""Generate TOLWEX TW brand icons (favicon + app icons)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"

# Prefer bold geometric fonts
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def make_icon(size: int, radius_ratio: float = 0.22) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = max(2, int(size * radius_ratio))
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=(0, 0, 0, 255))

    # Font size tuned so "TW" fills the mark cleanly
    font_size = int(size * 0.42)
    font = load_font(font_size)
    text = "TW"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1] - size * 0.02
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    return img


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


def main() -> None:
    icon512 = make_icon(512)
    save_png(icon512, PUBLIC / "icon.png")
    save_png(icon512, BRAND / "tolwex-icon.png")
    save_png(make_icon(192), BRAND / "tolwex-icon-192.png")
    save_png(make_icon(180), PUBLIC / "apple-touch-icon.png")
    save_png(make_icon(180), BRAND / "apple-touch-icon.png")
    save_png(make_icon(32), PUBLIC / "favicon-32.png")
    save_png(make_icon(32), BRAND / "favicon-32.png")
    save_png(make_icon(16), PUBLIC / "favicon-16.png")
    save_png(make_icon(16), BRAND / "favicon-16.png")

    # Multi-size ICO
    ico_sizes = [16, 32, 48]
    icos = [make_icon(s) for s in ico_sizes]
    ico_path = PUBLIC / "favicon.ico"
    icos[0].save(ico_path, format="ICO", sizes=[(s, s) for s in ico_sizes], append_images=icos[1:])
    print(f"wrote {ico_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
