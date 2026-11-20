const {chromium}=require('playwright');const {spawn}=require('node:child_process');const assert=require('node:assert/strict');
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const viewport of [{width:390,height:844},{width:820,height:1180},{width:1180,height:820}]){
 const page=await browser.newPage({viewport,hasTouch:true,isMobile:viewport.width===390});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let ready=false;for(let i=0;i<30;i++){try{await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});ready=true;break}catch{await new Promise(r=>setTimeout(r,200))}}assert(ready,'Server not ready');
 assert.equal(await page.locator('.card').count(),4,'Default two pairs');
 assert.equal(await page.locator('#settings-panel').isVisible(),false);
 await page.locator('#settings').click();assert.equal(await page.locator('#settings-panel').isVisible(),true);
 await page.locator('#levels [data-n="6"]').click();assert.equal(await page.locator('.card').count(),12);
 assert.equal(await page.locator('#settings-panel').isVisible(),false);
 await page.reload();assert.equal(await page.locator('.card').count(),12,'Difficulty persists');
 await page.locator('#settings').click();await page.locator('#levels [data-n="2"]').click();
 // Read accessible emoji from the rendered cards and click each matching pair.
 const cards=page.locator('.card');const labels=await cards.locator('.animal-illustration').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));const seen=new Map();
 for(let i=0;i<labels.length;i++){const e=labels[i];if(!seen.has(e))seen.set(e,[]);seen.get(e).push(i)}
 for(const positions of seen.values()){await cards.nth(positions[0]).click();await cards.nth(positions[1]).click()}
 assert.equal(await page.locator('.card.is-matched').count(),4,'All cards matched');
 await page.locator('#celebration').waitFor({state:'visible',timeout:3000});
 await page.locator('#play-again').click();assert.equal(await page.locator('#celebration').isVisible(),false);
 assert.equal(await page.locator('.card.is-matched').count(),0);
 await page.locator('#restart').click();assert.equal(await page.locator('.card').count(),4);
 assert.deepEqual(errors,[],'No JavaScript page errors');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);assert.equal(overflow,false,'No horizontal overflow');
 await page.close();console.log('PASS',viewport.width+'x'+viewport.height,'settings, persistence, full game, restart, layout');
 }
}finally{await browser.close();server.kill()}})().catch(e=>{console.error(e);server.kill();process.exitCode=1});