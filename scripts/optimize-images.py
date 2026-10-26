from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
before = after = 0
for source in (root / 'src/assets/images').glob('*.jpg'):
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert('RGB')
        bound = (256,256) if 'logo' in source.name else (1440,960) if 'hero' in source.name else (720,720)
        image.thumbnail(bound, Image.Resampling.LANCZOS)
        target=source.with_suffix('.webp')
        image.save(target, 'WEBP', quality=78, method=6)
        before += source.stat().st_size; after += target.stat().st_size
        print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes, {image.size}')
print(f'Total: {before} -> {after} bytes; reduction {(1-after/before)*100:.1f}%')
