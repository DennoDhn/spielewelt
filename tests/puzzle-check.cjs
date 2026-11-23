const assert = require('node:assert/strict');

module.exports = async function checkPuzzle(page) {
  const memory = page.locator('.tile');
  await memory.first().click();
  const original = await memory.evaluateAll(nodes => nodes.map(node => node.dataset.animal));
  await page.locator('#toPuzzle').click();
  const frame = page.frameLocator('#puzzleFrame');
  await frame.locator('.piece').first().waitFor();
  const settings = frame.locator('#settings');
  for (const [scene, count] of [[0,6],[1,9],[2,6]]) {
    await settings.click();
    await frame.locator('#scenes button').nth(scene).click();
    await frame.locator('#levels').getByText(String(count), {exact:true}).click();
    await frame.locator('#play').click();
    assert.equal(await frame.locator('.piece').count(), count);
    for (let i=0;i<count;i++) {
      const coords = await frame.locator('[data-piece="'+i+'"]').evaluate((node, {i,count}) => {
        const center = new DOMPoint(50,108/(count/3));
        const start = center.matrixTransform(node.getScreenCTM());
        const target = new DOMPoint(12+i%3*100+50,12+Math.floor(i/3)*216/(count/3)+center.y)
          .matrixTransform(node.ownerSVGElement.getScreenCTM());
        return {sx:start.x,sy:start.y,tx:target.x,ty:target.y};
      }, {i,count});
      await page.mouse.move(coords.sx,coords.sy);
      await page.mouse.down();
      if (i===0) {
        await frame.locator('#stage').dispatchEvent('pointerdown',{pointerId:99,pointerType:'touch',bubbles:true});
        await frame.locator('#stage').dispatchEvent('pointercancel',{pointerId:99,bubbles:true});
        await page.mouse.up();
        assert.equal(await frame.locator('.placed').count(),0);
        await page.mouse.move(coords.sx,coords.sy);await page.mouse.down();
      }
      await page.mouse.move(coords.tx,coords.ty);
      await page.mouse.up();
      assert.equal(await frame.locator('.placed').count(),i+1);
      if(i===0){
        await frame.locator('#back').click();
        assert.deepEqual(await memory.evaluateAll(nodes=>nodes.map(node=>node.dataset.animal)),original);
        assert.equal(await page.locator('.tile.flipped').count(),1);
        await page.locator('#toPuzzle').click();
        assert.equal(await frame.locator('.placed').count(),1);
      }
    }
    assert.equal(await frame.locator('#next').isVisible(), true);
  }
  await frame.locator('#back').click();
};
