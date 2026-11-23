const CACHE='spielewelt-memory-v3';
const ASSETS=['./','./index.html','./kids.css','./kids.js','./manifest.webmanifest','./icon.svg','./switch-game.js','./puzzle.html','./puzzle.js','./puzzle.css','./koppel.svg','./waldbach.svg','./blumengarten.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('spielewelt-memory-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return response}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))))});
