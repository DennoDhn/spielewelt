'use strict';
const board=document.querySelector('#board'),progress=document.querySelector('#progress'),status=document.querySelector('#status');
const panel=document.querySelector('#settings-panel'),celebration=document.querySelector('#celebration');
const settingsButton=document.querySelector('#settings'),closeButton=document.querySelector('#close-settings'),levels=document.querySelector('#levels'),soundInput=document.querySelector('#sound');
const animals=['🐶','🐱','🐮','🐷','🐰','🐥'];
let pairs=2,sound=true,first=null,second=null,locked=false,matched=0,timer=null,winTimer=null,audio=null;
try{const saved=Number(localStorage.getItem('tier-memory-pairs'));if([2,3,4,6].includes(saved))pairs=saved;sound=localStorage.getItem('tier-memory-sound')!=='false'}catch{}
soundInput.checked=sound;
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function note(freq=520,duration=.16){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.1,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.02)}catch{}}
function melody(){note(523);setTimeout(()=>note(659),110);setTimeout(()=>note(784),220)}
function clearTimers(){if(timer!==null)clearTimeout(timer);if(winTimer!==null)clearTimeout(winTimer);timer=winTimer=null}
function updateProgress(){progress.replaceChildren();for(let i=0;i<pairs;i++){const dot=document.createElement('span');dot.className='progress-dot'+(i<matched?' done':'');dot.setAttribute('aria-hidden','true');progress.append(dot)}}
function newGame(){clearTimers();first=second=null;locked=false;matched=0;celebration.hidden=true;board.replaceChildren();board.dataset.pairs=String(pairs);board.style.setProperty('--cols',String(pairs===2?2:pairs===3?3:4));status.textContent='Finde zwei gleiche Tiere';updateProgress();
 const cards=shuffle(animals.slice(0,pairs).flatMap((emoji,id)=>[{emoji,id},{emoji,id}]));
 cards.forEach(({emoji,id})=>{const button=document.createElement('button');button.className='card';button.setAttribute('aria-label','Verdeckte Karte');button.setAttribute('aria-pressed','false');button.innerHTML='<span class="card-inner"><span class="card-face card-back" aria-hidden="true"></span><span class="card-face card-front" aria-hidden="true"></span></span>';button.querySelector('.card-front').textContent=emoji;button.addEventListener('click',()=>flip(button,id,emoji));board.append(button)});
}
function flip(button,id,emoji){if(locked||button.disabled||button===first?.button||panel.hidden===false||celebration.hidden===false)return;button.classList.add('is-open');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',emoji);note(480,.12);if(!first){first={button,id};return}second={button,id};locked=true;
 if(first.id===second.id){first.button.classList.add('is-matched');second.button.classList.add('is-matched');first.button.disabled=second.button.disabled=true;matched++;updateProgress();melody();status.textContent='Ein Paar gefunden';first=second=null;locked=false;if(matched===pairs){status.textContent='Alle Paare gefunden';winTimer=setTimeout(()=>{celebration.hidden=false;document.querySelector('#play-again').focus()},850)}}
 else{status.textContent='Versuch es noch einmal';timer=setTimeout(()=>{for(const item of [first,second]){item.button.classList.remove('is-open');item.button.setAttribute('aria-pressed','false');item.button.setAttribute('aria-label','Verdeckte Karte')}first=second=null;locked=false;timer=null},1150)}
}
function closeSettings(){panel.hidden=true;settingsButton.setAttribute('aria-expanded','false');settingsButton.focus()}
settingsButton.onclick=()=>{panel.hidden=false;settingsButton.setAttribute('aria-expanded','true');closeButton.focus()};
closeButton.onclick=closeSettings;panel.addEventListener('click',e=>{if(e.target===panel)closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)closeSettings()});
document.querySelector('#restart').onclick=newGame;document.querySelector('#play-again').onclick=newGame;
soundInput.onchange=()=>{sound=soundInput.checked;try{localStorage.setItem('tier-memory-sound',String(sound))}catch{}};
for(const n of [2,3,4,6]){const b=document.createElement('button');b.textContent=n+' Paare';b.dataset.n=String(n);b.onclick=()=>{pairs=n;try{localStorage.setItem('tier-memory-pairs',String(n))}catch{};levels.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));newGame();closeSettings()};levels.append(b)}
levels.querySelector('[data-n="'+pairs+'"]').classList.add('selected');newGame();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
