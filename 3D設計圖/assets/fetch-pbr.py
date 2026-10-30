"""Fetch only explicitly CC0 ambientCG assets and bundle them for offline file:// use."""
import base64
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
import zipfile

ROOT = Path(__file__).resolve().parent
DEST = ROOT / 'textures'
DEST.mkdir(exist_ok=True)
ASSETS = {'stone': 'Bricks066', 'wood': 'Wood051', 'roof': 'RoofingTiles001', 'plaster': 'Plaster001', 'grass': 'Grass001', 'soil': 'Ground037', 'rock': 'Rock051'}
previous = {entry['material']: entry for entry in json.loads((ROOT / 'material-sources.json').read_text())} if (ROOT / 'material-sources.json').exists() else {}
KINDS = {'color': 'Color', 'normal': 'NormalGL', 'roughness': 'Roughness'}
bundle = {}
sources = []
for name, asset in ASSETS.items():
    cached = DEST / 'wood-source.zip'
    url = f'https://ambientcg.com/get?file={asset}_1K-JPG.zip'
    reuse = previous.get(name, {}).get('asset') == asset and all((DEST / f'{name}-{kind}.jpg').exists() for kind in KINDS)
    if reuse:
        archive = None
    else:
        if asset == 'Wood051' and cached.exists():
            raw = cached.read_bytes()
        else:
            with urlopen(Request(url, headers={'User-Agent': 'CastleAtlas/2.0 (CC0 offline material download)'}), timeout=90) as response:
                raw = response.read()
        archive = zipfile.ZipFile(io.BytesIO(raw))
    files = {}
    bundle[name] = {}
    for kind, suffix in KINDS.items():
        filename = f'{asset}_1K-JPG_{suffix}.jpg'
        target = f'{name}-{kind}.jpg'
        data = (DEST / target).read_bytes() if reuse else archive.read(filename)
        (DEST / target).write_bytes(data)
        bundle[name][kind] = 'data:image/jpeg;base64,' + base64.b64encode(data).decode('ascii')
        files[kind] = {'path': f'assets/textures/{target}', 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    sources.append({'material': name, 'asset': asset, 'author': 'ambientCG / Lennart Demes', 'license': 'CC0-1.0', 'licenseUrl': 'https://docs.ambientcg.com/license/', 'source': f'https://ambientcg.com/a/{asset}', 'download': url, 'files': files})
    print(f'{asset}: extracted 3 licensed 1K JPG maps', flush=True)
(ROOT / 'texture-data.js').write_text("'use strict';\nwindow.ATLAS_TEXTURES = " + json.dumps(bundle, separators=(',', ':')) + ';\nwindow.ATLAS_TEXTURE_SOURCES = ' + json.dumps(sources, separators=(',', ':')) + ';\n', encoding='utf-8')
(ROOT / 'material-sources.json').write_text(json.dumps(sources, indent=2), encoding='utf-8')
(ROOT / 'CC0-MATERIALS.txt').write_text('The included PBR textures are from ambientCG.com, authored by Lennart Demes.\nAll included assets are licensed under Creative Commons CC0 1.0 Universal.\nhttps://docs.ambientcg.com/license/\nhttps://creativecommons.org/publicdomain/zero/1.0/\n\nAssets: ' + ', '.join(ASSETS.values()) + '\nThe local texture-data.js contains unchanged JPG maps encoded as data URLs for offline browsers.\nSee material-sources.json for source URLs, file paths and SHA-256 checksums.\nNo Keen Games or Enshrouded Wiki image files are included.\n', encoding='utf-8')
if cached.exists():
    cached.unlink()
print('Offline PBR bundle and attribution saved.', flush=True)
