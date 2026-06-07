from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import os

OUT = 280   # output square size in pixels

def make_avatar(src, dst, crop_frac, bg_rgb, brightness=1.08, contrast=1.2, saturation=1.25):
    """
    crop_frac: (left, top, right, bottom) as 0-1 fractions of source image
    bg_rgb: background color shown at the circle edge (feathered blend)
    """
    img = Image.open(src).convert('RGB')
    w, h = img.size

    # 1. Crop to face region
    l = int(w * crop_frac[0])
    t = int(h * crop_frac[1])
    r = int(w * crop_frac[2])
    b = int(h * crop_frac[3])
    cropped = img.crop((l, t, r, b))

    # 2. Force square from center
    cw, ch = cropped.size
    side = min(cw, ch)
    cl = (cw - side) // 2
    ct = (ch - side) // 2
    square = cropped.crop((cl, ct, cl + side, ct + side))

    # 3. Resize
    face = square.resize((OUT, OUT), Image.LANCZOS)

    # 4. Enhancements
    face = ImageEnhance.Brightness(face).enhance(brightness)
    face = ImageEnhance.Contrast(face).enhance(contrast)
    face = ImageEnhance.Color(face).enhance(saturation)
    face = ImageEnhance.Sharpness(face).enhance(1.4)
    face = face.convert('RGBA')

    # 5. Circular mask – hard edge + feathered outer ring
    mask = Image.new('L', (OUT, OUT), 0)
    draw = ImageDraw.Draw(mask)
    pad = 4
    draw.ellipse([pad, pad, OUT - pad, OUT - pad], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5))

    # 6. Solid color background
    bg = Image.new('RGBA', (OUT, OUT), (*bg_rgb, 255))

    # 7. Paste face onto background using mask
    face.putalpha(mask)
    bg.paste(face, (0, 0), face)

    # 8. Thin white ring drawn on top for polish
    ring = ImageDraw.Draw(bg)
    ring.ellipse([pad, pad, OUT - pad, OUT - pad], outline=(255, 255, 255, 100), width=3)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    bg.save(dst, 'PNG', optimize=True)
    w2, h2 = bg.size
    print(f"  OK {os.path.basename(dst)}  ({w2}x{h2}px)")


print("Processing avatars...")

# OFEK – ילד עם קפוצ'ון כהה, פנים מסולסלות חמודות
# חיתוך קצת יותר רחב כי הקפוצ'ון עוטף את הפנים
make_avatar(
    src=r'C:\C3 Kids\OFEK.png',
    dst=r'C:\C3 Kids\client\public\avatars\OFEK.png',
    crop_frac=(0.03, 0.02, 0.97, 0.97),
    bg_rgb=(28, 18, 55),       # dark purple
    brightness=1.10,
    contrast=1.18,
    saturation=1.2,
)

# ORI – ילד עם שיער ישר, רקע בהיר
# חיתוך מעט מהצדדים כי הרקע נראה
make_avatar(
    src=r'C:\C3 Kids\ORI.png',
    dst=r'C:\C3 Kids\client\public\avatars\ORI.png',
    crop_frac=(0.05, 0.0, 0.95, 0.95),
    bg_rgb=(15, 40, 65),       # כחול כהה
    brightness=1.05,
    contrast=1.22,
    saturation=1.3,
)

# TSAHY – אבא עם זקן, רקע חיצוני
# חיתוך מהצד העליון כי הפנים קצת למטה בתמונה
make_avatar(
    src=r'C:\C3 Kids\TSAHY.png',
    dst=r'C:\C3 Kids\client\public\avatars\TSAHY.png',
    crop_frac=(0.0, 0.02, 1.0, 0.96),
    bg_rgb=(45, 22, 10),       # חום כהה-חם
    brightness=1.06,
    contrast=1.20,
    saturation=1.15,
)

print("Done!")
