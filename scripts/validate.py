from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
js=(root/'app.js').read_text()
css=(root/'style.css').read_text()
sw=(root/'sw.js').read_text()
manifest=json.loads((root/'manifest.webmanifest').read_text())
for name in ('farm','music','memory','shapes','colors','bubbles','feed','garden','road','room'):
    assert "'"+name+"'" in js, name
for path in ('index.html','app.js','style.css','manifest.webmanifest','icon.svg'):
    assert (root/path).exists(), path
    assert './'+path in sw, path
assert 'serviceWorker.register' in js
assert 'aria-label' in js and 'aria-live' in js
assert 'prefers-reduced-motion' in css
assert manifest['start_url']=='./'
assert manifest['display']=='standalone'
assert manifest['icons']
assert 'icon-192.png' not in html
print('Static PWA and game checks passed')
