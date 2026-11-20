'use strict';
const board=document.querySelector('#board'),progress=document.querySelector('#progress'),status=document.querySelector('#status');
const panel=document.querySelector('#settings-panel'),celebration=document.querySelector('#celebration');
const settingsButton=document.querySelector('#settings'),closeButton=document.querySelector('#close-settings'),levels=document.querySelector('#levels'),soundInput=document.querySelector('#sound');
const animals=[
 {name:'Hund',kind:'dog',color:'#d99b62',accent:'#a9653c'},
 {name:'Katze',kind:'cat',color:'#f5bb71',accent:'#c8794e'},
 {name:'Kuh',kind:'cow',color:'#fffaf1',accent:'#414c58'},
 {name:'Schwein',kind:'pig',color:'#f7a6b5',accent:'#df778d'},
 {name:'Hase',kind:'rabbit',color:'#f4d7b5',accent:'#c99d7d'},
 {name:'Küken',kind:'chick',color:'#ffdc63',accent:'#efa843'}
];
function animalArt(a){
 const ears={dog:'<ellipse cx="45" cy="48" rx="20" ry="34" fill="#a9653c" transform="rotate(24 45 48)"/><ellipse cx="155" cy="48" rx="20" ry="34" fill="#a9653c" transform="rotate(-24 155 48)"/>',cat:'<path d="M35 84 39 19Q41 10 51 20L78 46M165 84 161 19Q159 10 149 20L122 46" fill="#c8794e" stroke="#b86d47" stroke-width="4" stroke-linejoin="round"/>',cow:'<ellipse cx="37" cy="80" rx="26" ry="18" fill="#414c58"/><ellipse cx="163" cy="80" rx="26" ry="18" fill="#414c58"/><path d="M65 43 56 15M135 43 144 15" stroke="#b5a384" stroke-width="10" stroke-linecap="round"/>',pig:'<path d="M42 68 39 20Q38 10 49 21L76 49M158 68 161 20Q162 10 151 21L124 49" fill="#df778d"/>',rabbit:'<ellipse cx="69" cy="38" rx="17" ry="38" fill="#c99d7d" transform="rotate(-10 69 38)"/><ellipse cx="131" cy="38" rx="17" ry="38" fill="#c99d7d" transform="rotate(10 131 38)"/><ellipse cx="69" cy="38" rx="9" ry="28" fill="#edb4af" transform="rotate(-10 69 38)"/><ellipse cx="131" cy="38" rx="9" ry="28" fill="#edb4af" transform="rotate(10 131 38)"/>',chick:'<path d="M88 48 100 18 113 48" fill="#efa843"/>'}[a.kind];
 const patches=a.kind==='cow'?'<ellipse cx="64" cy="90" rx="21" ry="27" fill="#414c58"/><ellipse cx="141" cy="61" rx="16" ry="21" fill="#414c58"/>':'';
 const nose=a.kind==='pig'?'<ellipse cx="100" cy="124" rx="38" ry="25" fill="#df778d"/><ellipse cx="86" cy="125" rx="7" ry="10" fill="#a9536d"/><ellipse cx="114" cy="125" rx="7" ry="10" fill="#a9536d"/>':a.kind==='cow'?'<ellipse cx="100" cy="128" rx="43" ry="29" fill="#eab6b7"/><ellipse cx="84" cy="130" rx="7" ry="9" fill="#b57881"/><ellipse cx="116" cy="130" rx="7" ry="9" fill="#b57881"/>':a.kind==='chick'?'<path d="M85 119 100 134 115 119 100 112Z" fill="#ed9646"/>':'<path d="M90 119Q100 111 110 119L100 129Z" fill="#76534c"/><path d="M100 129Q92 141 83 132M100 129Q108 141 117 132" fill="none" stroke="#76534c" stroke-width="4" stroke-linecap="round"/>';
 const cheeks=a.kind==='chick'?'<ellipse cx="58" cy="119" rx="16" ry="10" fill="#ffb68a" opacity=".7"/><ellipse cx="142" cy="119" rx="16" ry="10" fill="#ffb68a" opacity=".7"/>':'';
 return '<svg class="animal-illustration" viewBox="0 0 200 200" role="img" aria-label="'+a.name+'" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="176" rx="70" ry="10" fill="#607c91" opacity=".12"/>'+ears+'<circle cx="100" cy="104" r="72" fill="'+a.color+'" stroke="'+a.accent+'" stroke-width="4"/>'+patches+'<ellipse cx="72" cy="104" rx="7" ry="10" fill="#283948"/><ellipse cx="128" cy="104" rx="7" ry="10" fill="#283948"/><circle cx="75" cy="100" r="2.5" fill="#fff"/><circle cx="131" cy="100" r="2.5" fill="#fff"/>'+cheeks+nose+'</svg>';
}
let pairs=2,sound=true,first=null,second=null,locked=false,matched=0,timer=null,winTimer=null,audio=null;
try{const saved=Number(localStorage.getItem('tier-memory-pairs'));if([2,3,4,6].includes(saved))pairs=saved;sound=localStorage.getItem('tier-memory-sound')!=='false'}catch{}
soundInput.checked=sound;
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function note(freq=520,duration=.16){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.1,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.02)}catch{}}
function melody(){note(523);setTimeout(()=>note(659),110);setTimeout(()=>note(784),220)}
function clearTimers(){if(timer!==null)clearTimeout(timer);if(winTimer!==null)clearTimeout(winTimer);timer=winTimer=null}
function updateProgress(){progress.replaceChildren();for(let i=0;i<pairs;i++){const dot=document.createElement('span');dot.className='progress-dot'+(i<matched?' done':'');dot.setAttribute('aria-hidden','true');progress.append(dot)}}
function newGame(){clearTimers();first=second=null;locked=false;matched=0;celebration.hidden=true;board.replaceChildren();board.dataset.pairs=String(pairs);board.style.setProperty('--cols',String(pairs===2?2:pairs===3?3:4));status.textContent='Finde zwei gleiche Tiere';updateProgress();
 const cards=shuffle(animals.slice(0,pairs).flatMap((animal,id)=>[{animal,id},{animal,id}]));
 cards.forEach(({animal,id})=>{const button=document.createElement('button');button.className='card';button.setAttribute('aria-label','Verdeckte Karte');button.setAttribute('aria-pressed','false');button.innerHTML='<span class="card-inner"><span class="card-face card-back" aria-hidden="true"></span><span class="card-face card-front" aria-hidden="true"></span></span>';button.querySelector('.card-front').innerHTML=animalArt(animal);button.addEventListener('click',()=>flip(button,id,animal.name));board.append(button)});
}
function flip(button,id,name){if(locked||button.disabled||button===first?.button||panel.hidden===false||celebration.hidden===false)return;button.classList.add('is-open');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',name);note(480,.12);if(!first){first={button,id};return}second={button,id};locked=true;
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
