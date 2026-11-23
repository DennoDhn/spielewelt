// Use the browser's touch input pipeline, including gesture recognition and capture.
const assert = require('node:assert/strict');
module.exports = async function checkTouch(page) {
  const client = await page.context().newCDPSession(page);
  const frame = page.frameLocator('#puzzleFrame');
  await page.locator('#toPuzzle').tap();
  const piece = frame.locator('[data-piece="0"]');
  await piece.waitFor();
  const send = (type,points=[])=>client.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  async function points(){
    return piece.evaluate(node=>{
      const point=(matrix,x,y)=>{const p=new DOMPoint(x,y).matrixTransform(matrix);return {x:p.x,y:p.y,id:1};};
      return [point(node.getScreenCTM(),50,54),point(node.ownerSVGElement.getScreenCTM(),62,66)];
    });
  }
  let [start,target]=await points();
  await send('touchStart',[start]);
  await send('touchMove',[target]);
  await send('touchStart',[target,{x:target.x+30,y:target.y+25,id:2}]);
  await send('touchMove',[target,{x:target.x+65,y:target.y+55,id:2}]);
  await send('touchEnd');
  assert.equal(await frame.locator('.placed').count(),0,'second finger cancels drag');
  assert.equal(await page.evaluate(()=>visualViewport.scale),1,'two fingers do not zoom');
  await send('touchStart',[start]);
  await send('touchMove',[target]);
  await page.setViewportSize({width:844,height:390});
  await frame.locator('#stage[viewBox="0 0 565 240"]').waitFor();
  await send('touchEnd');
  assert.equal(await frame.locator('.placed').count(),0,'rotation interrupts drag');
  [start,target]=await points();
  await send('touchStart',[start]);
  await send('touchMove',[{x:target.x+95,y:target.y,id:1}]);
  await send('touchEnd');
  assert.equal(await frame.locator('.placed').count(),0,'wrong target rejected');
  await send('touchStart',[start]);
  await send('touchMove',[target]);
  await send('touchEnd');
  assert.equal(await frame.locator('.placed').count(),1,'next touch drag succeeds');
  await page.setViewportSize({width:390,height:844});
  await frame.locator('#stage[viewBox="0 0 324 475"]').waitFor();
  assert.equal(await frame.locator('.placed').count(),1,'rotation preserves placed pieces');
  await frame.locator('#back').tap();
  await client.detach();
};
