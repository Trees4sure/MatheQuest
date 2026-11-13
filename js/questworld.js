// MatheQuest: begehbare, wiederbesuchbare Lernwelten. Alle Aktionen bleiben lokal/offline.
import {gangHtml,walk} from './gang.js';
import * as store from './store.js';
import { ROOMS, createTask, isCorrect } from './lernorte-logic.js';
import { update, rec } from './competence.js';
import { esc, toast } from './ui.js';
import { sound } from './fx.js';

const ICONS = {
  w1:['🥚','🥕','👣','🌷','⚖️'], w2:['🥨','🧺','💰','🕰️','⚖️'],
  w3:['💺','🕒','🧳','📊','🎫'], w4:['💧','📏','📊','📐','🏠'],
  w5:['🌳','🧱','📏','📝','🌡️'],w6:['🥧','🏷️','💶','🧮','📦']
};
const POSITIONS = [
  {x:17,y:54}, {x:33,y:45}, {x:51,y:39}, {x:69,y:48}, {x:85,y:56}
];
const miniVis=t=>{
  const v=t.visual;
  if(!v)return '';
  if(v.kind==='groups')return `<div class="ex-counters">${v.values.map((n,i)=>`<div><small>Gruppe ${i+1}</small><div>${Array.from({length:Math.min(n,24)},()=>v.icon).join(' ')}</div></div>`).join('')}</div>`;
  if(v.kind==='array')return `<div class="ex-array" style="--ex-cols:${v.cols}">${Array.from({length:Math.min(v.rows*v.cols,100)},()=>`<span>${v.icon}</span>`).join('')}</div>`;
  if(v.kind==='fractions')return `<div class="ex-counters">${[v.a,v.b].map(n=>`<div><b>${n}/${v.den}</b><div class="ex-frbar">${Array.from({length:v.den},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div></div>`).join('')}</div>`;
  if(v.kind==='percent')return `<div class="ex-percent">${Array.from({length:100},(_,i)=>`<i class="${i<v.percent?'filled':''}"></i>`).join('')}</div>`;
  if(v.kind==='rect'||v.kind==='grid')return `<div class="ex-geometry">${esc(String(v.a||v.rows))} × ${esc(String(v.b||v.cols))}</div>`;
  if(v.kind==='compare')return `<div class="ex-geometry">${v.left}　?　${v.right}</div>`;
  if(v.kind==='place')return `<div class="ex-geometry">${v.hundreds} H　${v.tens} Z　${v.ones} E</div>`;
  if(v.kind==='line')return `<div class="ex-geometry">${v.from}　→　?</div>`;
  if(v.kind==='clock')return `<div class="ex-geometry">🕒 ${v.h}:${String(v.m).padStart(2,'0')}　+ ${v.duration} min</div>`;
  return `<div class="ex-geometry">${esc(t.question)}</div>`;
};

export function run(root,{go,onBadges},roomId){
  const room=roomId==='wald'?{...ROOMS.w1,name:'Waldpfad am Dorfbach',emoji:'🌳'}:ROOMS[roomId]; if(!room) return go('#/map');
  const p=store.current(); if(!p)return go('#/profiles');
  p.explore||={}; p.explore[roomId]||={found:{},solved:0};
  const history=p.explore[roomId];
  let x=18,walkBusy=false,opened=null,task=null,attempts=0,hintUsed=0,finished=false,lastQ='';
  let pendingTimer=null; const ctl=new AbortController();
  const qa=s=>root.querySelector(s);
  const source=`assets/scenes/erkundung-${roomId}.webp`;
  const hero=p.hero==='ben'?'ben':'lina';
  root.innerHTML=`<section class="ex-screen"><header class="ex-header"><button class="ghost" data-ex-back>← Zurück</button><h1>${room.emoji} ${esc(room.name)}</h1><span class="ex-score">⭐ ${p.xp} Punkte</span></header>
   <p class="ex-lead">Bewege deine Figur: Tippe auf den Weg oder nutze ← und →. Suche die fünf Stellen im Bild. Jede Stelle bietet immer wieder neue Aufgaben.</p>
   <div class="ex-stage" tabindex="0" aria-label="Erkundbare Dorfwelt. Pfeiltasten bewegen deine Figur.">
      <img class="ex-backdrop" src="${source}" alt="Gemalte Spiellandschaft: ${esc(room.name)}">
      <div class="ex-player" style="left:${x}%"><img src="assets/chars/${hero}-froh.webp" alt="${hero==='ben'?'Ben':'Lina'}" draggable="false">${gangHtml(hero)}<span class="ex-shadow"></span></div>
      <div class="ex-dog" style="left:${x-6}%"><img src="assets/chars/fips-froh.webp" alt="Fips begleitet dich" draggable="false">${gangHtml('fips')}</div>
      ${room.actions.map((a,i)=>`<button class="ex-hunt ${history.found[a[0]]?'found':''}" style="left:${POSITIONS[i].x}%;top:${POSITIONS[i].y}%" data-hunt="${i}" aria-label="${esc(a[1])}" title="${esc(a[1])}"><span>${(ICONS[roomId]||ICONS.w1)[i]}</span><small>${history.found[a[0]]?'✓':'?'}</small></button>`).join('')}
   </div>
   <div class="ex-controls"><button type="button" data-left aria-label="Nach links gehen">◀ Links</button><span>Erkunden · <strong data-found>${Object.keys(history.found).length}/5</strong> Fundstellen entdeckt</span><button type="button" data-right aria-label="Nach rechts gehen">Rechts ▶</button></div>
   <div class="ex-action-list"><h2>Fundstellen und Aufgaben</h2>${room.actions.map(([id,name,emo,desc],i)=>`<button type="button" data-action="${i}"><span>${emo}</span><b>${esc(name)}</b><small>${esc(desc)}</small></button>`).join('')}</div>
   <section class="ex-panel" data-panel hidden aria-label="Mathematik-Quest"><div class="ex-panel-head"><h2 data-title>Aufgabe</h2><button type="button" data-close aria-label="Aufgabe schließen">✕</button></div><p class="ex-question" data-question></p><div data-visual></div><label class="ex-label">Deine Antwort <input data-answer type="text" inputmode="decimal" autocomplete="off" aria-label="Deine Antwort"></label><p data-feedback role="status" aria-live="polite"></p><p class="ex-explanation" data-explanation hidden></p><div class="ex-panel-buttons"><button class="btn" data-check>Prüfen</button><button class="ghost" data-hint>Tipp</button><button class="ghost" data-solution>Erklären</button><button class="btn" data-next hidden>Neue Aufgabe</button></div></section>
   <p class="ex-footer">Du kannst alle Fundstellen erneut besuchen. Fehler sind erlaubt, und Hilfen kosten keine Punkte. <button class="ghost" data-go-back>Zur Dorfkarte</button></p>
 </section>`;
  const stage=qa('.ex-stage'),avatar=qa('.ex-player'),dog=qa('.ex-dog'),panel=qa('[data-panel]');
  let faceLeft=false; // Fips läuft immer hinter der Figur her
  function setPos(n){x=Math.min(91,Math.max(9,n)); avatar.style.left=x+'%';dog.style.left=(x+(faceLeft?6:-6))+'%';}
  function move(n,callback){if(pendingTimer)clearTimeout(pendingTimer);walkBusy=true; const distance=Math.abs(n-x); avatar.classList.add('walking');dog.classList.add('walking');// Gehzeit und Schrittzyklus hängen an derselben Dauer – sonst gleitet die Figur.
    const ms=Math.round(Math.min(1600,Math.max(distance>0.5?700:0,320+distance*30))); /* mindestens ein ganzer Schrittzyklus */if(distance>0.5)faceLeft=n<x;avatar.style.transitionDuration=dog.style.transitionDuration=ms+'ms';walk(avatar,true,faceLeft);walk(dog,true,faceLeft);setPos(n); pendingTimer=setTimeout(()=>{walkBusy=false;avatar.classList.remove('walking');dog.classList.remove('walking');walk(avatar,false);walk(dog,false);callback?.();pendingTimer=null;},ms);}
  function find(i){const [id]=room.actions[i];history.found[id]=true;store.save();const h=qa(`[data-hunt="${i}"]`);h?.classList.add('found'); if(h)h.querySelector('small').textContent='✓';qa('[data-found]').textContent=Object.keys(history.found).length+'/5';}
  function showTask(i){const a=room.actions[i];opened=i;find(i);let t;const r=rec(p,createTask(roomId==='wald'?'w1':roomId,a[0],1).skill);for(let k=0;k<8;k++){t=createTask(roomId==='wald'?'w1':roomId,a[0],r.level);if(t.question!==lastQ)break;}task=t;lastQ=t.question;attempts=0;hintUsed=0;finished=false;panel.hidden=false;qa('[data-title]').textContent=a[2]+' '+a[1];qa('[data-question]').textContent=t.question;qa('[data-visual]').innerHTML=miniVis(t);const input=qa('[data-answer]');input.value='';input.disabled=false;input.inputMode=['compare','time'].includes(t.type)?'text':'decimal';input.placeholder=t.type==='time'?'z. B. 14:30':t.type==='compare'?'<, = oder >':t.type==='coins'?'in Cent':'Zahl oder Bruch';qa('[data-feedback]').textContent='';qa('[data-explanation]').hidden=true;qa('[data-check]').hidden=false;qa('[data-next]').hidden=true;panel.scrollIntoView({behavior:store.settings().reducedMotion?'auto':'smooth',block:'nearest'});input.focus({preventScroll:true});}
  function answer(){if(finished||!task)return;const val=qa('[data-answer]').value.trim();if(!val){qa('[data-feedback]').textContent='Gib eine Antwort ein.';return;}attempts++;
   let ok=isCorrect(task,val);
   // Zahlen im Dezimalformat oder Eurobetrag werden in Münz-Aufgaben auch akzeptiert.
   if(!ok&&task.type==='coins'&&/^\d+[,.]\d\d$/.test(val))ok=isCorrect(task,String(Math.round(Number(val.replace(',','.'))*100)));
   if(!ok){qa('[data-feedback]').textContent=attempts===1?'Versuch es noch einmal. Ein Tipp kann helfen.':'Noch nicht. Schau dir die Erklärung an oder versuche es erneut.';return;}
   finished=true;history.solved++;store.recordAnswer({correct:true,attempts,hint:hintUsed>0,combo:0});update(p,task.skill,{correct:true,attempts,hint:hintUsed>0});store.reward(attempts===1?(hintUsed?8:12):6,3);store.save();onBadges?.(store.checkBadges());sound('right');qa('[data-feedback]').textContent='Geschafft! Du hast die Aufgabe gelöst. Du kannst hier weiterüben.';qa('[data-explanation]').textContent=task.explanation;qa('[data-explanation]').hidden=false;qa('[data-answer]').disabled=true;qa('[data-check]').hidden=true;qa('[data-next]').hidden=false;qa('.ex-score').textContent='⭐ '+p.xp+' Punkte';
  }
  function reveal(){if(!task||finished)return;finished=true;qa('[data-feedback]').textContent='Hier ist ein Lösungsweg. Du kannst gleich mit neuen Zahlen weiterüben – ohne Punktabzug.';qa('[data-explanation]').textContent=task.explanation;qa('[data-explanation]').hidden=false;qa('[data-check]').hidden=true;qa('[data-next]').hidden=false;qa('[data-answer]').disabled=true;}
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(b){
   if(b.hasAttribute('data-ex-back')||b.hasAttribute('data-go-back'))return go(`#/region/${roomId==='wald'?'w1':roomId}`);
   if(b.hasAttribute('data-left'))return move(x-14);
   if(b.hasAttribute('data-right'))return move(x+14);
   if(b.hasAttribute('data-close')){panel.hidden=true;stage.focus();return;}
   if(b.dataset.hunt!==undefined||b.dataset.action!==undefined){const i=Number(b.dataset.hunt??b.dataset.action);move(POSITIONS[i].x,()=>showTask(i));return;}
   if(b.hasAttribute('data-check'))return answer();
   if(b.hasAttribute('data-hint')){hintUsed=Math.min(2,hintUsed+1);qa('[data-feedback]').textContent=task.hints?.[hintUsed-1]||'Schau dir die Abbildung an.';return;}
   if(b.hasAttribute('data-solution'))return reveal();
   if(b.hasAttribute('data-next'))return showTask(opened);
  }
  if(e.target===stage||e.target.classList.contains('ex-backdrop')){const r=stage.getBoundingClientRect();move((e.clientX-r.left)/r.width*100);}
  },{signal:ctl.signal});
  root.addEventListener('keydown',e=>{if(e.target.matches('input')){if(e.key==='Enter'){e.preventDefault();answer();}return;}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(x+(e.key==='ArrowRight'?5:-5));}},{signal:ctl.signal});
  root.addEventListener('cleanup',()=>{ctl.abort();if(pendingTimer)clearTimeout(pendingTimer);},{once:true,signal:ctl.signal});
}
