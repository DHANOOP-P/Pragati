"""Rebuild the 80-frame Theyyam sequence from the original JPEGs.

Upscales, grades toward the high-quality demo still, and writes
high-quality WebP so scroll playback is not crushed by conversion.
"""
from pathlib import Path
import re
import numpy as np
from PIL import Image, ImageFilter
import cv2

SRC_DIR = Path(
    r"C:\Users\wwwdh\.cursor\projects\c-Users-wwwdh-Desktop-FULLSTACK-PROJECTS-pragati\assets"
)
DEMO = SRC_DIR / (
    "c__Users_wwwdh_AppData_Roaming_Cursor_User_workspaceStorage_"
    "2c7e1fc997002a9214351262ccb574b4_images_theyyam-f2b26deb-cc85-4038-b43c-0719a7cfc555.jpg"
)
OUT = Path(r"c:\Users\wwwdh\Desktop\FULLSTACK PROJECTS\pragati\frontend\public\assets\theyyam\frames")
SIZE = (1920, 1080)  # 16:9, 1.875x the 1024x576 sources
WEBP_QUALITY = 94
GRADE_MIX = 0.38  # how hard to pull toward the demo look


def collect_sources():
    files = []
    for p in SRC_DIR.glob("*_images_ezgif-frame-*.jpg"):
        m = re.search(r"ezgif-frame-(\d+)", p.name)
        if m:
            files.append((int(m.group(1)), p))
    files.sort()
    nums = [n for n, _ in files]
    if nums != list(range(1, 81)):
        raise SystemExit(f"expected frames 1-80, got {nums[:3]}...{nums[-3:]} count={len(nums)}")
    return files


def center_lab_stats(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    h, w = rgb.shape[:2]
    y0, y1 = int(h * 0.18), int(h * 0.82)
    x0, x1 = int(w * 0.28), int(w * 0.72)
    crop = rgb[y0:y1, x0:x1]
    lab = cv2.cvtColor(crop, cv2.COLOR_RGB2LAB).astype(np.float32)
    return lab.reshape(-1, 3).mean(0), lab.reshape(-1, 3).std(0) + 1e-5


def grade_toward(rgb: np.ndarray, src_mean, src_std, tgt_mean, tgt_std, mix: float) -> np.ndarray:
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    transferred = lab.copy()
    for i in range(3):
        transferred[:, :, i] = (lab[:, :, i] - src_mean[i]) * (tgt_std[i] / src_std[i]) + tgt_mean[i]
    blended = lab * (1.0 - mix) + transferred * mix
    blended[:, :, 0] = np.clip(blended[:, :, 0], 0, 255)
    blended[:, :, 1:] = np.clip(blended[:, :, 1:], 0, 255)
    out = cv2.cvtColor(blended.astype(np.uint8), cv2.COLOR_LAB2RGB)
    return out


def enhance(rgb: np.ndarray, src_mean, src_std, tgt_mean, tgt_std) -> Image.Image:
    graded = grade_toward(rgb, src_mean, src_std, tgt_mean, tgt_std, GRADE_MIX)
    up = cv2.resize(graded, SIZE, interpolation=cv2.INTER_LANCZOS4)
    # Gentle local contrast so paint edges stay crisp after upscale.
    lab = cv2.cvtColor(up, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.35, tileGridSize=(8, 8))
    l = clahe.apply(l)
    up = cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2RGB)
    img = Image.fromarray(up)
    return img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=115, threshold=2))


def main():
    files = collect_sources()
    demo = np.array(Image.open(DEMO).convert("RGB"))
    ref = np.array(Image.open(files[39][1]).convert("RGB"))  # frame 40, eyes open
    src_mean, src_std = center_lab_stats(ref)
    tgt_mean, tgt_std = center_lab_stats(demo)

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("theyyam_*.webp"):
        old.unlink()

    sizes = []
    for n, path in files:
        rgb = np.array(Image.open(path).convert("RGB"))
        img = enhance(rgb, src_mean, src_std, tgt_mean, tgt_std)
        dest = OUT / f"theyyam_{n - 1:02d}.webp"
        img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
        sizes.append(dest.stat().st_size)
        if n in (1, 20, 40, 60, 80) or n % 20 == 0:
            print(f"wrote {dest.name} {img.size} {dest.stat().st_size}")

    print(
        "done",
        len(files),
        "avg_kb",
        round(sum(sizes) / len(sizes) / 1024, 1),
        "total_mb",
        round(sum(sizes) / 1024 / 1024, 2),
    )


if __name__ == "__main__":
    main()
