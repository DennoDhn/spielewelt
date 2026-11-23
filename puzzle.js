'use strict';
const $ = selector => document.querySelector(selector);
const stage = $('#stage');
const scenes = [['koppel', 'Fohlen'], ['waldbach', 'Fuchs'], ['blumengarten', 'Einhorn']];
let scene = 0, count = 6, choice, difficulty, hint = false, drag = null;
let pieces = [], slots = [], board, scale, layout;
const fingers = new Set();
function svg(tag, attributes, parent) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  parent.append(node);
  return node;
}
// Each shared edge is traced in reverse with the opposite normal by its neighbour.
function outline(col, row, h) {
  let x = 0, y = 0, path = 'M0 0';
  function edge(dx, dy, sign) {
    const n = Math.hypot(dx, dy);
    const point = (t, offset = 0) => [x + dx*t + dy/n*offset*sign, y + dy*t - dx/n*offset*sign].join(' ');
    if (sign) path += ' L'+point(.40)+' C'+point(.48)+ ' '+point(.36,15)+' '+point(.50,15)
      +' C'+point(.64,15)+' '+point(.52)+' '+point(.60);
    path += ' L'+point(1);
    x += dx; y += dy;
  }
  const parity = (col+row)%2 ? 1 : -1;
  edge(100,0,row ? parity : 0);
  edge(0,h,col<2 ? parity : 0);
  edge(-100,0,row<count/3-1 ? parity : 0);
  edge(0,-h,col ? parity : 0);
  return path+' Z';
}
function reset() {
  cancelDrag(); hint=false;
  slots=Array.from({length:count},(_,i)=>i);
  for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
  pieces=slots.map(()=>({placed:false}));
  draw();
}
function position(piece,x,y,s) {piece.node.setAttribute('transform','translate('+x+' '+y+') scale('+s+')');}
function home(piece) {position(piece,piece.placed?piece.x:piece.homeX,piece.placed?piece.y:piece.homeY,piece.placed?1:scale);}
function progress() {
  const done=pieces.filter(p=>p.placed).length;
  $('#score').textContent=done===count?'Geschafft! ★':done+' / '+count;
  $('#next').hidden=done!==count;
  $('#preview').setAttribute('aria-pressed',String(hint));
  $('#ghost').setAttribute('opacity',done===count?1:hint?.85:count===6?.26:.03);
  if(done===count){$('#pieceLayer').setAttribute('visibility','hidden');$('#ghost').classList.add('finished');}
}
function draw() {
  cancelDrag();
  layout=stage.clientWidth>stage.clientHeight*1.45?'wide':'tall';
  const wide=layout==='wide', w=wide?565:324, height=wide?240:475;
  stage.setAttribute('viewBox','0 0 '+w+' '+height);
  board={x:12,y:12}; scale=wide?.61:.69;
  stage.replaceChildren();
  const defs=svg('defs',{},stage);
  const src=scenes[scene][0]+'.svg';
  svg('rect',{x:8,y:8,width:308,height:224,rx:6,fill:'#fffdf4',stroke:'#acbfae'},stage);
  svg('image',{id:'ghost',href:src,x:board.x,y:board.y,width:300,height:216},stage);
  const layer=svg('g',{id:'pieceLayer'},stage);
  const h=216/(count/3);
  pieces.forEach((p,i)=>{
    const c=i%3,r=Math.floor(i/3), shape=outline(c,r,h);
    const clip=svg('clipPath',{id:'clip'+i},defs);
    svg('path',{d:shape},clip);
    p.x=board.x+c*100;p.y=board.y+r*h;
    const slot=slots[i],cellWidth=wide?78:101,cellHeight=(wide?215:220)/(count/3);
    p.homeX=(wide?321:10)+(slot%3)*cellWidth+(cellWidth-100*scale)/2;
    p.homeY=(wide?12:242)+Math.floor(slot/3)*cellHeight+(cellHeight-h*scale)/2;
    p.node=svg('g',{'data-piece':i,class:p.placed?'placed':'piece',role:'button','aria-label':'Puzzleteil '+(i+1),tabindex:p.placed?-1:0},layer);
    svg('path',{d:shape,fill:'#fff9ed',stroke:'#536959','stroke-width':3},p.node);
    const clipped=svg('g',{'clip-path':'url(#clip'+i+')'},p.node);
    svg('image',{href:src,x:-c*100,y:-r*h,width:300,height:216,'pointer-events':'none'},clipped);
    home(p);
    p.node.onpointerdown=e=>begin(e,p);
  });
  pieces.filter(p=>p.placed).forEach(p=>layer.prepend(p.node));
  progress();
}
function coords(e) {
  const pt=stage.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
  return pt.matrixTransform(stage.getScreenCTM().inverse());
}
function begin(e,p) {
  if(fingers.size>1 || drag || p.placed || e.button!==0)return;
  e.preventDefault();
  const pt=coords(e);
  drag={id:e.pointerId,p,dx:(pt.x-p.homeX)/scale,dy:(pt.y-p.homeY)/scale};
  p.node.parentNode.append(p.node);
  stage.setPointerCapture(e.pointerId);
  move(e);
}
function move(e) {
  if(!drag||e.pointerId!==drag.id)return;
  const pt=coords(e);
  position(drag.p,pt.x-drag.dx,pt.y-drag.dy,1);
}
function end(e) {
  if(!drag||drag.id!==e.pointerId)return;
  const {p,dx,dy}=drag,pt=coords(e);
  if(Math.hypot(pt.x-dx-p.x,pt.y-dy-p.y)<Math.min(37,216/(count/3)*.46)){
    p.placed=true;p.node.classList.replace('piece','placed');p.node.setAttribute('tabindex',-1);
    p.node.parentNode.prepend(p.node);
    // Reuse the Memory sound toggle and its audio context.
    if(typeof parent.chirp==='function')parent.chirp(true);
  }
  cancelDrag();progress();
}
function cancelDrag(){
  if(!drag)return;
  const {p,id}=drag;drag=null;home(p);
  if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
}
function interrupt(){cancelDrag();fingers.clear();}
document.addEventListener('pointerdown',e=>{fingers.add(e.pointerId);if(fingers.size>1)cancelDrag();},true);
document.addEventListener('pointerup',e=>{end(e);fingers.delete(e.pointerId);},true);
document.addEventListener('pointercancel',e=>{cancelDrag();fingers.delete(e.pointerId);},true);
stage.onpointermove=move;stage.onlostpointercapture=e=>{if(drag?.id===e.pointerId)cancelDrag();};
window.addEventListener('blur',interrupt);
document.addEventListener('visibilitychange',interrupt);
for(const name of ['gesturestart','gesturechange','gestureend'])document.addEventListener(name,e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});
new ResizeObserver(()=>{if(!stage.clientWidth)return;interrupt();draw();}).observe(stage);
$('#back').onclick=()=>{interrupt();parent.postMessage('open-memory',location.origin);};
$('#preview').onclick=()=>{hint=!hint;progress();};
$('#next').onclick=()=>{scene=(scene+1)%scenes.length;reset();};
function selectOptions(){
  $('#scenes').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===choice)));
  $('#levels').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.textContent===difficulty)));
}
scenes.forEach(([file,label],i)=>{
  const b=document.createElement('button'),img=document.createElement('img');
  img.src=file+'.svg';img.alt='';b.append(img,label);b.onclick=()=>{choice=i;selectOptions();};$('#scenes').append(b);
});
for(const n of [6,9]){
  const b=document.createElement('button');b.textContent=n;b.onclick=()=>{difficulty=n;selectOptions();};$('#levels').append(b);
}
$('#settings').onclick=()=>{interrupt();choice=scene;difficulty=count;selectOptions();$('dialog').showModal();};
$('#play').onclick=()=>{scene=choice;count=difficulty;$('dialog').close();reset();};
reset();
