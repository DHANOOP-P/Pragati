from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

SRC = Path(
    r"C:\Users\wwwdh\.cursor\projects\c-Users-wwwdh-Desktop-FULLSTACK-PROJECTS-pragati\assets"
)
OUT = Path(r"c:\Users\wwwdh\Desktop\FULLSTACK PROJECTS\pragati\frontend\public\assets\workshops")

JOBS = [
    (
        "c__Users_wwwdh_AppData_Roaming_Cursor_User_workspaceStorage_2c7e1fc997002a9214351262ccb574b4_images_workshop1-e6150776-8837-4643-9b24-4927deb70d96.jpg",
        "drawing.jpg",
        (0.48, 0.0, 1.0, 1.0),
    ),
    (
        "c__Users_wwwdh_AppData_Roaming_Cursor_User_workspaceStorage_2c7e1fc997002a9214351262ccb574b4_images_workshop2-988fef61-8428-455f-8af9-7d64fe351d0b.jpg",
        "visual.jpg",
        (0.0, 0.04, 0.52, 0.98),
    ),
    (
        "c__Users_wwwdh_AppData_Roaming_Cursor_User_workspaceStorage_2c7e1fc997002a9214351262ccb574b4_images_workshop3-802ca09e-2ba7-4d23-8eff-62acc9723ff9.jpg",
        "hiphop.jpg",
        (0.0, 0.10, 0.56, 1.0),
    ),
]


def crop_frac(im, box):
    w, h = im.size
    l, t, r, b = box
    return im.crop((int(w * l), int(h * t), int(w * r), int(h * b)))


def tone_lime(im):
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if g > r + 12 and g > b + 8:
                px[x, y] = (
                    int(r * 0.55 + 28),
                    int(g * 0.38 + 18),
                    int(b * 0.32 + 10),
                )
            elif r > 180 and g > 160 and b < 90:
                px[x, y] = (
                    int(r * 0.52 + 30),
                    int(g * 0.36 + 16),
                    int(b * 0.28 + 10),
                )


def vignette(im, strength=0.62):
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = w * 0.5, h * 0.42
    maxd = ((w * 0.72) ** 2 + (h * 0.72) ** 2) ** 0.5
    step = 8
    for y in range(0, h, step):
        row = []
        for x in range(0, w, step):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / maxd
            v = int(255 * (1 - strength * min(1, d ** 1.45)))
            row.append(v)
        for yy in range(y, min(h, y + step)):
            for i, xx in enumerate(range(0, w, step)):
                for xxx in range(xx, min(w, xx + step)):
                    mask.putpixel((xxx, yy), row[i])
    dark = Image.new("RGB", im.size, (8, 6, 10))
    return Image.composite(im, dark, mask)


def grade(im):
    im = im.convert("RGB")
    tone_lime(im)
    im = ImageEnhance.Color(im).enhance(0.62)
    im = ImageEnhance.Contrast(im).enhance(1.22)
    im = ImageEnhance.Brightness(im).enhance(0.78)
    warm = Image.new("RGB", im.size, (46, 22, 14))
    im = Image.blend(im, warm, 0.22)
    im = vignette(im)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=2))
    return im


TARGET = (1400, 933)


def cover(im, size, focus=(0.5, 0.38)):
    tw, th = size
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = max(tw, int(sw * scale)), max(th, int(sh * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    fx, fy = focus
    left = int((nw - tw) * fx)
    top = int((nh - th) * fy)
    left = max(0, min(left, nw - tw))
    top = max(0, min(top, nh - th))
    return im.crop((left, top, left + tw, top + th))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    focuses = {
        "drawing.jpg": (0.82, 0.32),
        "visual.jpg": (0.28, 0.42),
        "hiphop.jpg": (0.32, 0.4),
    }
    for name, dest, box in JOBS:
        src = SRC / name
        im = Image.open(src)
        out = cover(grade(crop_frac(im, box)), TARGET, focuses[dest])
        out.save(OUT / dest, quality=90, optimize=True)
        print(dest, out.size)


if __name__ == "__main__":
    main()
