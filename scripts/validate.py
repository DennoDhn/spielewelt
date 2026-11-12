from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
sw=(root/'sw.js').read_text()
manifest=json.loads((root/'manifest.webmanifest').read_text())
for world in ('farm','music','home','road','garden','shapes'):
    assert world in html, world
assert 'serviceWorker.register' in html
assert 'caches.open' in sw
assert manifest['start_url']=='./'
print('Static checks passed')
