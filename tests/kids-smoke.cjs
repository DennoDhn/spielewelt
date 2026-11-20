const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
(async()=>{
 const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 let browser;
 try{
  await new Promise(r=>setTimeout(r,1200));
  for(const engine of [chromium,webkit]){
  browser=await engine.launch({headless:true});
  for(const size of [{width:390,height:844},{width:820,height:1180},{width:1180,height:820},{width:375,height:667},{width:667,height:375}]){
   const page=await browser.newPage({viewport:size,deviceScaleFactor:2,hasTouch:true,isMobile:size.width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.tile').count(),4,'four cards at start');
   assert.equal(await page.locator('.tile .picture svg').count(),4,'animal art visible in DOM');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
   await page.locator('#settings').click();
   await page.locator('[data-pairs="6"]').click();
   assert.equal(await page.locator('.tile').count(),12,'six pairs');
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('.tile')].every(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})),true,'all twelve cards fit viewport');
   await page.reload();
   assert.equal(await page.locator('.tile').count(),12,'settings persisted');
   await page.locator('#settings').click();
   await page.locator('[data-pairs="2"]').click();
   const ids=await page.locator('.tile').evaluateAll(els=>els.map(e=>e.dataset.animal));
   let first=0,second=ids.findIndex(x=>x!==ids[first]);
   await page.locator('.tile').nth(first).click();
   await page.locator('.tile').nth(second).click();
   await page.waitForTimeout(1100);
   assert.equal(await page.locator('.tile.flipped').count(),0,'mismatch flips back');
   for(const id of [...new Set(ids)]){
    const indices=ids.flatMap((x,i)=>x===id?[i]:[]);
    await page.locator('.tile').nth(indices[0]).click();
    await page.locator('.tile').nth(indices[1]).click();
   }
   await page.locator('#won[open]').waitFor({timeout:3000});
   await page.locator('#again').click();
   assert.equal(await page.locator('.tile').count(),4,'restart');
   assert.deepEqual(errors,[],'no JS exceptions');
   await page.close();
  }
  await browser.close();browser=null;
  }
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'allow'});
  const offlinePage=await context.newPage();
  await offlinePage.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await offlinePage.evaluate(()=>navigator.serviceWorker.ready);
  await offlinePage.waitForTimeout(600);
  await context.setOffline(true);
  await offlinePage.reload({waitUntil:'domcontentloaded'});
  assert.equal(await offlinePage.locator('.tile').count(),4,'PWA works offline');
  await context.close();
  const blocked=await browser.newPage();
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage blocked')}})});
  await blocked.goto('http://127.0.0.1:8765/');
  assert.equal(await blocked.locator('.tile').count(),4,'game works without storage');
  await blocked.close();
  console.log('All child memory smoke checks passed');
 }finally{await browser?.close();server.kill()}
})().catch(e=>{console.error(e);process.exit(1)});
