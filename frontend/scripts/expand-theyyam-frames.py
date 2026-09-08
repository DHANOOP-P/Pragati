"""Build a dense, same-size Theyyam sequence from the 6 key poses."""
from pathlib import Path
import numpy as np
from PIL import Image
import cv2

SRC = Path(r"c:\Users\wwwdh\Desktop\FULLSTACK PROJECTS\pragati\frontend\public\assets\theyyam\frames")
SIZE = (1024, 1536)  # width, height
STEPS_BETWEEN = 6  # in-betweens per key pair
WEBP_QUALITY = 82
KEYS = [f"theyyam_{i:02d}.webp" for i in range(6)]


def load_bgr(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGB").resize(SIZE, Image.Resampling.LANCZOS)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)


def align_to(ref: np.ndarray, img: np.ndarray) -> np.ndarray:
    ref_g = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
    img_g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    warp = np.eye(2, 3, dtype=np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 120, 1e-5)
    try:
        cv2.findTransformECC(ref_g, img_g, warp, cv2.MOTION_EUCLIDEAN, criteria, None, 5)
        aligned = cv2.warpAffine(
            img,
            warp,
            SIZE,
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE,
        )
        return aligned
    except cv2.error:
        return img


def flow_morph(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    a_g = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    b_g = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    fwd = dis.calc(a_g, b_g, None)
    bwd = dis.calc(b_g, a_g, None)
    h, w = a_g.shape
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    map_ax = (grid_x + fwd[..., 0] * t).astype(np.float32)
    map_ay = (grid_y + fwd[..., 1] * t).astype(np.float32)
    map_bx = (grid_x + bwd[..., 0] * (1.0 - t)).astype(np.float32)
    map_by = (grid_y + bwd[..., 1] * (1.0 - t)).astype(np.float32)
    wa = cv2.remap(a, map_ax, map_ay, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    wb = cv2.remap(b, map_bx, map_by, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    mixed = cv2.addWeighted(wa, 1.0 - t, wb, t, 0)
    return mixed


def save_webp(bgr: np.ndarray, dest: Path) -> None:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(dest, "WEBP", quality=WEBP_QUALITY, method=6)


def main() -> None:
    keys = [load_bgr(SRC / name) for name in KEYS]
    ref = keys[0]
    aligned = [ref] + [align_to(ref, img) for img in keys[1:]]

    frames = []
    for i, current in enumerate(aligned):
        frames.append(current)
        if i == len(aligned) - 1:
            break
        nxt = aligned[i + 1]
        for step in range(1, STEPS_BETWEEN + 1):
            t = step / (STEPS_BETWEEN + 1)
            frames.append(flow_morph(current, nxt, t))

    # Wipe old numbered files so leftover keys cannot desync the player.
    for old in SRC.glob("theyyam_*.webp"):
        old.unlink()

    for i, frame in enumerate(frames):
        dest = SRC / f"theyyam_{i:02d}.webp"
        save_webp(frame, dest)
        print(f"{dest.name} {dest.stat().st_size}")

    print(f"TOTAL {len(frames)}")


if __name__ == "__main__":
    main()
