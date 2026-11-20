const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn('python3', ['-m','http.server','8765','--bind','127.0.0.1'], { stdio:'ignore' });
(async()=>{
  const browser = await chromium.launch({headless:true});
  const errors=[];
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  page.on('pageerror',e=>errors.push(e.message));
  try {
    let loaded=false;
    for(let i=0;i<30;i++){try{await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});loaded=true;break}catch{await new Promise(r=>setTimeout(r,200))}}
    assert(loaded,'Local test server did not start');
    assert.equal(await page.locator('.tile').count(),13);
    for(const [name,selector] of [
      ['Tierpark','.zoo-animal'],['Tierpuzzle','.puzzle-piece'],['Versteckspiel','.hide-spot'],
      ['Kindermemory','.memory-card'],['Xylophon','.key'],['Seifenblasen','.bubble'],
      ['Tiere füttern','.item'],['Formen finden','.match-target'],
      ['Farben entdecken','.match-target'],['Tierbauernhof','.item'],
      ['Entdeckerwiese','.item'],['Fahrzeugwelt','.item'],['Kinderzimmer','.item']
    ]){
      await page.getByRole('button',{name,exact:true}).first().click();
      assert(await page.locator(selector).count()>0,name+' did not render '+selector);
      await page.locator('#back').click();
    }
    await page.getByRole('button',{name:'Kindermemory'}).click();
    await page.getByRole('button',{name:'6 Paare'}).click();
    assert.equal(await page.locator('.memory-card').count(),12);
    await page.locator('#back').click();
    await page.getByRole('button',{name:'Tierpuzzle'}).click();
    await page.locator('.puzzle-piece').first().click();
    assert.equal(await page.locator('.puzzle-slot').count(),3);
    assert.deepEqual(errors,[],'Uncaught browser errors');
    console.log('PASS: 13 games, memory levels, puzzle, mobile rendering, no page errors');
  } finally {await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill()});
