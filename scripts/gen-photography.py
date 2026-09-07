#!/usr/bin/env python3
"""
Builds the web copies of the photography archive and its manifest.

Source:  public/assets/photography/<Folder>/<original>   (camera-sized, ~20MP)
Output:  public/assets/photography-web/<slug>/<nn>-t.jpg        480px long edge (grid tiles)
         public/assets/photography-web/<slug>/<nn>.jpg          1200px long edge
         public/assets/photography-web/<slug>/<nn>-full.jpg     2400px long edge
         src/lib/photography.manifest.json                      dims per frame

Folder names map to gallery slugs; files are numbered in name order so the
URLs are stable and free of spaces. Re-run after adding or removing photos.
"""
import json, os, re, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/assets/photography"
OUT = ROOT / "public/assets/photography-web"
MANIFEST = ROOT / "src/lib/photography.manifest.json"
SIZES = {"-t": 480, "": 1200, "-full": 2400}
EXT = {".jpg", ".jpeg", ".png", ".webp"}

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def natural(s: str):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]

def convert(job):
    src, dest_base = job
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size
    for suffix, edge in SIZES.items():
        dest = Path(f"{dest_base}{suffix}.jpg")
        if dest.exists():
            continue
        copy = im.copy()
        copy.thumbnail((edge, edge), Image.LANCZOS)
        copy.save(dest, "JPEG", quality=80, optimize=True, progressive=True)
    return {"src": str(src.relative_to(SRC)), "width": w, "height": h}

def main():
    galleries = []
    jobs = []
    for folder in sorted(p for p in SRC.iterdir() if p.is_dir()):
        slug = slugify(folder.name)
        files = sorted((f for f in folder.iterdir() if f.suffix.lower() in EXT), key=lambda f: natural(f.name))
        (OUT / slug).mkdir(parents=True, exist_ok=True)
        frames = []
        for i, f in enumerate(files, 1):
            base = OUT / slug / f"{i:02d}"
            jobs.append((f, base))
            frames.append({"n": i, "file": f.name})
        galleries.append({"folder": folder.name, "slug": slug, "frames": frames})

    with ProcessPoolExecutor() as pool:
        dims = list(pool.map(convert, jobs, chunksize=4))
    by_src = {d["src"]: d for d in dims}

    for g in galleries:
        for fr in g["frames"]:
            d = by_src[f"{g['folder']}/{fr['file']}"]
            fr["width"], fr["height"] = d["width"], d["height"]
            fr["thumb"] = f"/assets/photography-web/{g['slug']}/{fr['n']:02d}-t.jpg"
            fr["src"] = f"/assets/photography-web/{g['slug']}/{fr['n']:02d}.jpg"
            fr["full"] = f"/assets/photography-web/{g['slug']}/{fr['n']:02d}-full.jpg"
            del fr["n"]

    MANIFEST.write_text(json.dumps(galleries, indent=2) + "\n")
    total = sum(len(g["frames"]) for g in galleries)
    print(f"{len(galleries)} galleries, {total} frames -> {MANIFEST.relative_to(ROOT)}")
    for g in galleries:
        print(f"  {g['slug']:24s} {len(g['frames']):3d}  ({g['folder']})")

if __name__ == "__main__":
    main()
