import * as store from './store.js';
import {CHAPTERS,createJourneyTask,awardStep,chapterCount,nextChapter,fmt,fmtMoney,stepTitles,stepPlan} from './journey-logic.js';
import {STORY,PEOPLE,FADEN,ASK_OP,LOB_OP,PASS_OP,HALLO_OP,fill} from './story.js';
import {spriteImg} from './sprites.js';
/* Porträt der Person eines Ortes: gemaltes Bild, sonst Emoji (bis JPs Bilder da sind). */
const face=(id,froh)=>{const m=PEOPLE[id];if(m.img==='brumm')return spriteImg(froh?'brummFroh':'brummGrummelig','j-say-img');const src=froh&&m.froh?m.froh:m.img;return src?`<img class="j-say-img" src="${src}" alt="">`:`<span class="j-say-emoji">${m.emoji}</span>`;};
/* Sprechblase der Person – steht über der Aufgabe, muss nicht weggeklickt werden. */
const bubble=(id,lines,cls='')=>`<div class="j-say ${cls}" data-say><div class="j-say-por">${face(id,cls==='lob')}</div><div class="j-say-text"><b>${esc(PEOPLE[id].name)}</b>${lines.map(t=>`<p>${esc(t)}</p>`).join('')}</div></div>`;
/* Ergebnis so, wie es auf dem Lieferschein steht. */
const resText=r=>`${typeof r.v==='number'?String(Math.round(r.v*100)/100).replace('.',','):r.v}${r.u?' '+r.u:''}`;
import {esc} from './ui.js';
import {installButton} from './install.js';
import {gangHtml,walk} from './gang.js';
const appButtons=()=>`<div class="v-apps">${installButton()}<button class="v-share" data-go="#/teilen"><span>🔗</span>Weitersagen · QR-Code</button></div>`;
import {check} from './answer.js';
import {update,rec} from './competence.js';
import {sound,confetti,speak,stopSpeaking} from './fx.js';
// Zählbild eines Kapitels: gemaltes Bild, sonst das Emoji
const pic=c=>c.img?`<img class="j-pic" src="${c.img}" alt="" draggable="false">`:c.icon;
const hero=p=>`assets/chars/${p.hero==='ben'?'ben':'lina'}-froh.webp`;
const stamps=p=>CHAPTERS.map((c,i)=>`<span class="journey-stamp ${p.campaign?.chapters?.[c.id]?.completed?'earned':''}" title="${esc(c.reward)}">${p.campaign?.chapters?.[c.id]?.completed?'✓':i+1}</span>`).join('');
export function nav(active='map'){return `<nav class="v-nav" aria-label="Hauptnavigation">${[['map','⌂','Dorfkarte'],['training','✎','Üben'],['collection','☆','Sammlung'],['adults','⚙','Erwachsene']].map(([id,icon,name])=>`<button data-go="#/${id}" ${id===active?'aria-current="page"':''}><span>${icon}</span>${name}</button>`).join('')}</nav>`;}
export function home(root){
 const p=store.current(),c=nextChapter(p),s=p.campaign?.chapters?.[c.id],done=chapterCount(p),d=store.day();
 root.innerHTML=`<div class="v-shell"><header class="v-header"><a href="#/map" class="v-logo"><img src="icon-192.png" alt=""><span>Mathe<span>Quest</span><small>ABENTEUER IN RECHENBACH</small></span></a><button class="v-profile" data-go="#/profiles"><span>${p.avatar}</span><b>${esc(p.name)}</b><small>Klasse ${p.grade}</small></button></header>${nav()}
 <section class="v-intro"><div><p class="v-eyebrow">DEIN DORF. DEIN ABENTEUER.</p><h1>Rechenbach braucht dich.</h1><p>Mit ${p.hero==='ben'?'Ben':'Lina'} und Fips wird aus Rechnen ein Abenteuer.</p></div><div class="v-stat"><strong>${p.xp}</strong><span>Entdeckerpunkte</span></div></section>
 <div class="v-main"><section class="v-map" aria-label="Dorfkarte mit sechs Spielorten"><img src="assets/scenes/rechenbach-karte.webp" alt="Gemalte Dorfkarte mit Bauernhof, Bäckerei, Bahnhof, Feuerwehr, Schreinerei und Festplatz">${CHAPTERS.map((x,i)=>`<button class="v-pin ${p.campaign?.chapters?.[x.id]?.completed?'done':''}" data-go="#/reise/${x.id}" style="--x:${x.x}%;--y:${x.y}%" aria-label="${i+1}. ${x.short}${p.campaign?.chapters?.[x.id]?.completed?', abgeschlossen':''}"><span>${p.campaign?.chapters?.[x.id]?.completed?'✓':i+1}</span><b>${x.short}</b></button>`).join('')}<div class="v-map-caption">Tippe auf einen Ort und hilf mit.</div></section>
 <aside class="v-next"><p class="v-eyebrow">${done===6?'ALLE SECHS ORTE GESCHAFFT':'DEIN NÄCHSTES ABENTEUER'}</p><div class="v-companions"><img src="${hero(p)}" alt="${p.hero==='ben'?'Ben':'Lina'}"><img src="assets/chars/fips-froh.webp" alt="Fips"></div><h2>${done===6?'Das Dorf feiert dich!':c.name}</h2><p>${done===6?'Dein Dorfpass ist voll. Komm zum Fest und hol dir deine Urkunde.':c.intro}</p><button class="v-primary" data-go="${done===6?'#/dorffest':`#/reise/${c.id}`}">${done===6?'Zum Dorffest':s?.step?'Abenteuer fortsetzen':'Los geht’s'} <span>→</span></button><small>${done===6?'Alle Orte bleiben zum Üben geöffnet.':`${s?.step||0} von 5 Aufträgen · ohne Zeitdruck`}</small></aside></div>
 <section class="v-bottom"><div class="v-pass"><div><p class="v-eyebrow">DEIN DORFPASS</p><b>${done} von 6 Orten geholfen</b></div><div class="v-stamps">${stamps(p)}</div></div><div class="v-daily"><span>Heute schon</span><strong>${d.correct}</strong><span>Aufgaben gelöst</span></div></section>
 <section class="v-extras"><button data-go="#/adv/bridge"><span>🌉</span><b>Die kaputte Brücke</b><small>Ein Mitmach-Abenteuer mit Brumm →</small></button><button data-go="#/adv/hoppel"><span>🐇</span><b>Hoppel ist ausgebüxt</b><small>Finde den richtigen Trittstein →</small></button><button data-go="#/explore/wald"><span>🌳</span><b>Unterwegs am Waldbach</b><small>Entdecken & weiterüben →</small></button></section>${appButtons()}<footer class="v-foot"><span data-offline-status>Offline-Dateien werden vorbereitet …</span><span>Spielstand auf diesem Gerät · <a href="#/hilfe">Spielhilfe & Installation</a></span></footer></div>`;
 const status=root.querySelector('[data-offline-status]');
 if(!('serviceWorker'in navigator)||location.protocol==='file:')status.textContent='Offline-Modus benötigt einen Webserver.';
 else navigator.serviceWorker.ready.then(()=>{if(status.isConnected)status.textContent='✓ Für das Offline-Spielen bereit';});
}
function visual(t,c){
 const v=t.visual;
 const dots=(n,taken=0)=>Array.from({length:n},(_,i)=>`<button type="button" class="j-counter ${i>=n-taken?'taken':''}" data-count aria-label="Gegenstand ${i+1}${i>=n-taken?', weggenommen':''}" aria-pressed="false">${pic(c)}</button>`).join('');
 if(['add','sub','missing'].includes(v.kind)&&Math.max(v.total||0,v.a+(v.kind==='add'?v.b:0))<=30){
  if(v.kind==='add')return `<div class="j-groups"><div>${dots(v.a)}<b>${v.a}</b></div><strong>+</strong><div>${dots(v.b)}<b>${v.b}</b></div></div><p class="j-vis-note">Tippe Gegenstände an, um beim Zählen den Überblick zu behalten.</p>`;
  if(v.kind==='sub')return `<div class="j-counters">${dots(v.a,v.b)}</div><p class="j-vis-note">Durchgestrichene Gegenstände sind schon weg.</p>`;
  return `<div class="j-counters">${dots(v.a)}${Array.from({length:v.total-v.a},()=>'<span class="j-empty">?</span>').join('')}</div><p class="j-vis-note">Ziel: ${v.total}. Wie viele Plätze sind noch leer?</p>`;
 }
 if(v.kind==='array'&&v.a*v.b<=40)return `<div class="j-array" style="--cols:${v.b}">${Array.from({length:v.a*v.b},()=>`<i>${pic(c)}</i>`).join('')}</div><p class="j-vis-note">${v.a} Reihen · ${v.b} in jeder Reihe</p>`;
 if(v.kind==='fraction')return `<div class="j-frbar">${Array.from({length:v.den},(_,i)=>`<span class="${i<v.num?'selected':''}">${i<v.num?'✓':''}</span>`).join('')}</div><p class="j-vis-note">${v.num} von ${v.den} gleich großen Teilen · zusammen ${v.total}</p>`;
 if(v.kind==='percent')return `<div class="j-percent">${Array.from({length:100},(_,i)=>`<i class="${i<v.b?'selected':''}"></i>`).join('')}</div><p class="j-vis-note">${v.b} von 100 Kästchen · ganze Menge: ${v.a}</p>`;
 if(v.kind==='area')return `<div class="j-area"><span>${v.a} m</span><div class="j-array" style="--cols:${v.a}">${Array.from({length:v.a*v.b},()=>'<i></i>').join('')}</div><b>${v.b} m</b></div>`;
 const text=({add:`${v.a} + ${v.b} = ?`,sub:`${v.a} − ${v.b} = ?`,missing:`${v.a} + ? = ${v.total}`,array:`${v.a} · ${v.b} = ?`,divide:`${v.total} : ${v.a} = ?`,prices:`${fmtMoney(v.a)} € + ${fmtMoney(v.b)} €`,compare:`${v.a}  ▢  ${v.b}`,ratio:`${v.a} Karten → ${v.total} €\n${v.b} Karten → ?`,equation:`${v.a} · x + ${v.b} = ${v.total}`})[v.kind];
 return `<div class="j-equation">${esc(text||'')}</div>`;
}
export function run(root,{go,onBadges},id){
 const c=CHAPTERS.find(c=>c.id===id);if(!c)return go('#/map');
 const p=store.current();p.campaign||={chapters:{}};p.campaign.chapters||={};
 const s=p.campaign.chapters[id]||={step:0,done:false,completed:false,claimed:[]};
 let task=null,attempts=0,hint=0,solved=false,revealed=false; const ctl=new AbortController();
 // Zustand der Mitmach-Formen: gewählte Zahl/Zeichen, neu gefüllte Felder, Inhalt der Gefäße
 let pick=null,cells=new Set(),bags=[];
 const q=x=>root.querySelector(x),index=CHAPTERS.indexOf(c),who=p.hero==='ben'?'Ben':'Lina';
 const grade=()=>s.practiceGrade||p.grade,mode=()=>task.mode||'number';
 const shown=v=>task.op==='decimal'?fmtMoney(v):fmt(v);
 const st=STORY[id],vals=()=>({name:p.name,held:who});
 /* Nach jedem Auftrag liegt ein Gegenstand mehr in der Szene. */
 const loot=()=>Array.from({length:s.step},()=>pic(c)).join('');
 /* Folgt die Klassenstufe der Rechenart der Geschichte? Sonst allgemeine Sätze zur Rechenart. */
 /* Große Mengen heißen im Aufgabentext Heu, Mehl, Sitzplätze … – dann passen die Sätze über Eier oder Brötchen nicht. */
 const big=t=>['add','sub','missing','compare'].includes(t.op)&&Math.max(t.visual.a+(t.visual.kind==='add'?t.visual.b:0),t.visual.total||0,t.visual.b||0)>100;
 const fits=(k=s.step)=>task.op===c.seq[k]?.[0]&&!big(task);
 function askLines(){
  const L=[];
  if(s.step===0)L.push(fill(big(task)?HALLO_OP:st.hallo,{...vals(),beitrag:st.beitrag}));
  if(s.step===2){L.push(fill(st.patzer.text,vals()));L.push(big(task)?ASK_OP[task.op]:fill(st.rettung,vals()));return L;}
  if(s.step===4&&task.chain)L.push(fill(st.kette,vals()));
  else L.push(fits()?st.ask[s.step]:ASK_OP[task.op]);
  return L;
 }
 /* Fips reagiert ohne Worte: wedeln bei richtig, Kopf schief bei falsch. */
 function fipsDo(kind){const d=q('.j-actor.dog');if(!d)return;const img=d.querySelector('img');d.classList.remove('wag','tilt');void d.offsetWidth;d.classList.add(kind);
  /* Gemalte Pose für zwei Sekunden: freudig oder fragend, dann wieder das Standbild. */
  img.src=`assets/chars/fips-${kind==='wag'?'freut':'fragt'}.webp`;clearTimeout(fipsDo.t);fipsDo.t=setTimeout(()=>{if(img.isConnected)img.src='assets/chars/fips-froh.webp';},2000);}
 root.addEventListener('cleanup',()=>{ctl.abort();stopSpeaking();},{once:true,signal:ctl.signal});
 function frame(){const steps=stepTitles(c,grade());root.innerHTML=`<section class="j-shell"><header class="j-header"><button class="ghost" data-go="#/map">← Dorfkarte</button><div><small>KAPITEL ${index+1} · KLASSE ${grade()}</small><h1>${c.name}</h1></div><span class="j-xp">${p.xp} Punkte</span></header><div class="j-stage tint-${index}"><img class="j-background" src="assets/scenes/erkundung-${id}.webp" alt="${c.name}">${index===5?'<div class="j-lights" aria-hidden="true">'+'<i></i>'.repeat(12)+'</div>':''}${id==='w1'?'<img class="j-hare" src="assets/chars/feldhase.webp" alt="Ein Feldhase schaut zu">':''}<div class="j-scene-label">${s.done?'Geschafft':'Für den Festkuchen fehlt'}: ${STORY[id].beitrag}</div><div class="j-loot" aria-label="${s.step} Sachen gesammelt">${loot()}</div><div class="j-actors" style="left:${18+s.step*12}%"><span class="j-actor"><img src="${hero(p)}" alt="${who}">${gangHtml(p.hero==='ben'?'ben':'lina')}</span><span class="j-actor dog"><img src="assets/chars/fips-froh.webp" alt="Fips">${gangHtml('fips')}</span></div><div class="j-delivery" aria-label="${s.step} von 5 Vorbereitungen erledigt">${Array.from({length:5},(_,i)=>`<span class="${i<s.step?'ready':''}" title="${steps[i]}">${i<s.step?'✓':i+1}</span>`).join('')}</div></div><div class="j-layout"><aside class="j-story"><p class="v-eyebrow">DER FESTKUCHEN</p><p class="j-faden">${FADEN}</p><h2>Dein Lieferschein</h2><ol class="j-schein">${steps.map((x,i)=>`<li class="${i<s.step?'done':i===s.step?'current':''}"><span>${i<s.step?'✓':i+1}</span>${x}${i<s.step&&s.results?.[i]?`<i class="j-br"></i><b class="j-res">${s.results[i].u===c.item?pic(c):''}${esc(resText(s.results[i]))}</b>`:''}</li>`).join('')}</ol><button class="ghost small" data-go="#/ort/${id}">Hier frei weiterüben</button></aside><section class="j-task" aria-label="Deine Aufgabe"><div data-task></div></section></div></section>`;return steps;}
 // Die Mitmach-Fläche: je nach Form Zahlenweg, Felder, Gefäße, Zeichen oder Auswahl.
 function widget(){
  const off=solved||revealed?'disabled':'',v=task.visual;
  switch(mode()){
   case 'line':{const start=v.a,max=Math.max(10,Math.ceil(Math.max(v.a,task.answer)/10)*10);
    return `<p class="j-how">${who} steht auf Stein <b>${start}</b> und geht <b>${v.b}</b> ${v.kind==='add'?'Schritte vor':'Schritte zurück'}. Tippe auf den Stein, auf dem ${who} landet.</p><div class="j-line" role="group" aria-label="Zahlenweg von 0 bis ${max}">${Array.from({length:max+1},(_,n)=>`<button type="button" class="j-stone${n===start?' start':''}${revealed&&n===task.answer?' goal':''}" data-pick="${n}" aria-pressed="${pick===n}" ${off}>${n}</button>`).join('')}</div>`;}
   case 'fill':{const size=v.total<=10?10:20;
    return `<p class="j-how">${v.a} Plätze sind schon belegt. Tippe so viele freie Plätze an, bis es <b>${v.total}</b> sind. <span class="j-count">Dazugelegt: <b>${cells.size}</b></span></p><div class="j-fill" role="group" aria-label="Feld mit ${size} Plätzen">${Array.from({length:size},(_,n)=>n<v.a?`<span class="j-cell fixed" aria-label="belegt">${pic(c)}</span>`:`<button type="button" class="j-cell${cells.has(n)?' on':''}" data-cell="${n}" aria-pressed="${cells.has(n)}" aria-label="Platz ${n+1}" ${off}>${cells.has(n)?pic(c):''}</button>`).join('')}</div>`;}
   case 'split':{const rest=v.total-bags.reduce((x,y)=>x+y,0);
    return `<p class="j-how">Tippe auf ein Gefäß, um ein Stück hineinzulegen. Verteile alle ${v.total} gerecht. <span class="j-count">Noch übrig: <b>${rest}</b></span></p><div class="j-bags">${bags.map((n,i)=>`<button type="button" class="j-bag" data-bag="${i}" aria-label="Gefäß ${i+1} mit ${n} Stück" ${off||(rest?'':'disabled')}><b>${n}</b><span>${pic(c).repeat(Math.min(n,12))||'&nbsp;'}</span></button>`).join('')}</div><button type="button" class="ghost" data-rebag ${off?'hidden':''}>Noch einmal neu verteilen</button>`;}
   case 'compare':return `<p class="j-how">Welches Zeichen passt in die Lücke?</p><div class="j-options signs">${[['<','ist kleiner als'],['=','ist gleich'],['>','ist größer als']].map(([sign,text])=>`<button type="button" data-pick="${sign==='<'?'lt':sign==='>'?'gt':'eq'}" aria-pressed="${pick===sign}" aria-label="${text}" ${off}><b>${sign==='<'?'&lt;':sign==='>'?'&gt;':'='}</b><small>${text}</small></button>`).join('')}</div>`;
   case 'choice':return `<p class="j-how">Tippe auf die richtige Antwort.</p><div class="j-options">${task.options.map(o=>`<button type="button" data-pick="${o}" aria-pressed="${pick===o}" ${off}><b>${shown(o)}${task.unit?' '+task.unit:''}</b></button>`).join('')}</div>`;
  }
  return `<label class="j-answer-label" for="journey-answer">Deine Antwort${task.unit?' in '+task.unit:''}</label>`;
 }
 const SIGNS={lt:'<',eq:'=',gt:'>'};
 function drawWidget(){q('[data-widget]').innerHTML=widget();}
 // Antwort aus der Mitmach-Fläche lesen; null heißt: es wurde noch nichts gewählt.
 function value(){
  switch(mode()){
   case 'line':case 'compare':case 'choice':return pick;
   case 'fill':return cells.size||null;
   case 'split':{const sum=bags.reduce((x,y)=>x+y,0);if(sum<task.visual.total)return null;return bags.every(n=>n===bags[0])?bags[0]:'ungleich';}
  }
  const raw=q('[data-answer]').value;return raw.trim()?raw:null;
 }
 function newTask(scroll=false){
  if(s.task&&s.task.grade!==grade())s.task=null;
  // Aufgaben aus einer älteren Spielfassung passen nicht mehr zur neuen Abfolge.
  if(s.task&&!s.task.mode)s.task=null;
  solved=false;revealed=false;attempts=s.attempts||0;hint=s.hint||0;pick=null;cells=new Set();
  if(!s.task){const prev=(s.results||[]).map(r=>r.v),trial=createJourneyTask(id,s.step,grade(),1,Math.random,prev);s.task=createJourneyTask(id,s.step,grade(),rec(p,trial.skill).level,Math.random,prev);s.attempts=0;s.hint=0;attempts=0;hint=0;store.save();}
  task=s.task;bags=mode()==='split'?Array(task.visual.a).fill(0):[];
  const steps=frame(),typed=mode()==='number',own=['line','fill','split'].includes(mode());
  q('[data-task]').innerHTML=`<div class="j-task-top"><p class="v-eyebrow">AUFTRAG ${s.step+1} VON 5</p><button class="j-read" data-read aria-label="Aufgabe vorlesen">♪ Vorlesen</button></div>${bubble(id,askLines(),s.step===2?'patzer':'')}<h2>${steps[s.step]}</h2><p class="j-question">${esc(task.question)}</p>${own?'':`<div class="j-visual">${visual(task,c)}</div>`}<form data-form><div data-widget>${widget()}</div><div class="j-answer-row">${typed?`<input id="journey-answer" data-answer type="text" inputmode="decimal" autocomplete="off" placeholder="?" aria-describedby="j-feedback">`:''}<button class="v-primary" type="submit" data-check>Prüfen ✓</button></div></form><p id="j-feedback" class="j-feedback" role="status"></p><div class="j-tip" data-tip-panel ${hint?'':'hidden'}>${hint?esc(task.hints[hint-1]):''}</div><div class="j-tools"><button class="ghost" data-hint>Tipp ${hint?hint+'/2':''}</button><button class="ghost" data-explain>Zeig mir den Weg</button><button class="ghost" data-easier>Leichter</button></div><button class="v-primary j-next" data-next hidden>Weiter →</button>`;
  if(scroll)q('.j-task').scrollIntoView({block:'start'});
  /* Handy: die Sprechblase liegt als Comic-Blase in der Szene, damit „Prüfen“ im ersten Bildschirm bleibt. */
  if(matchMedia('(max-width:650px)').matches){q('.j-stage').appendChild(q('[data-say]'));if(scroll)q('.j-stage').scrollIntoView({block:'start'});}
  if(s.step===2&&st.patzer.fips)fipsDo('tilt');
 }
 function result(scroll=false){frame();const next=CHAPTERS[index+1];q('[data-task]').innerHTML=`<div class="j-complete"><span class="j-medal">✓</span><p class="v-eyebrow">KAPITEL ABGESCHLOSSEN</p><h2>${c.reward}!</h2>${bubble(id,[fill(st.schluss,vals())],'lob')}${s.pass?`<p class="j-passline">📖 ${esc(s.pass)}</p>`:''}<div class="v-stamps">${stamps(p)}</div><p>Dein Fortschritt ist gespeichert.</p><button class="v-primary" data-go="${chapterCount(p)===6?'#/dorffest':next?`#/reise/${next.id}`:'#/map'}">${chapterCount(p)===6?'Das Dorffest eröffnen':next?'Zum nächsten Ort':'Zur Dorfkarte'} →</button><button class="ghost" data-replay>Noch einmal mit neuen Zahlen</button></div>`;if(scroll)q('.j-task').scrollIntoView({block:'start'});}
 // Nach Lösung oder Erklärung: Eingaben sperren, Weiter-Knopf zeigen.
 function lock(nextLabel){
  drawWidget();if(q('[data-answer]'))q('[data-answer]').disabled=true;
  // Beim Vergleichen das richtige Zeichen in die Lücke setzen, sobald es gelöst oder erklärt ist.
  if(mode()==='compare'&&q('.j-equation'))q('.j-equation').textContent=`${task.visual.a}  ${task.answer}  ${task.visual.b}`;
  q('[data-check]').hidden=true;q('.j-tools').hidden=true;q('[data-next]').hidden=false;q('[data-next]').textContent=nextLabel;
 }
 function respond(){
  if(solved||revealed)return;const given=value();
  if(given===null){q('#j-feedback').textContent=({number:'Trage erst deine Antwort ein.',line:'Tippe erst auf einen Stein.',fill:'Tippe erst freie Plätze an.',split:'Verteile erst alle Stücke auf die Gefäße.',compare:'Wähle erst ein Zeichen.',choice:'Wähle erst eine Antwort.'})[mode()];return;}
  attempts++;s.attempts=attempts;
  if(given==='ungleich'||!check(task,String(given))){q('#j-feedback').textContent=given==='ungleich'?'Die Gefäße sind noch nicht gleich voll. Verteile noch einmal neu.':attempts===1?'Noch nicht ganz. Probiere es noch einmal oder hol dir einen Tipp.':'Du darfst weiterprobieren. „Zeig mir den Weg“ erklärt die Rechnung.';store.save();fipsDo('tilt');return;}
  solved=true;const at=s.step;
  if(awardStep(p,id,task.id)){
   /* Lieferschein: Ergebnis mit Einheit merken; der letzte Auftrag und der Dorfpass rechnen damit. */
   const u=task.unit||(typeof task.answer==='number'&&['add','sub','missing','mul','div','frac','percent'].includes(task.op)?(task.answer>100?c.bulk:c.item):'');
   s.results||=[];s.results[at]={v:task.op==='compare'?`${task.visual.a} ${task.answer} ${task.visual.b}`:task.answer,u};
   if(s.done){const num=s.results.find(r=>typeof r?.v==='number'),r0=s.results[0];
    /* Dorfpass-Satz der Geschichte nur, wenn sein Ergebnis wirklich die gezählten Dinge sind (kleine Klassen, gleiche Rechenart). */
    const own=c.seq[0][0]===stepPlan(c.id,0,grade())[0]&&typeof r0.v==='number'&&r0.v>1&&r0.v<=100&&grade()<=2;
    s.pass=own?fill(st.pass,{a:String(r0.v)}):num?fill(PASS_OP,{a:resText(num),ort:c.short,person:PEOPLE[id].name}):`${c.short}: Du hast ${PEOPLE[id].name} geholfen.`;}
   store.recordAnswer({correct:true,attempts,hint:hint>0,combo:0});update(p,task.skill,{correct:true,attempts,hint:hint>0});store.reward(10,4);
   if(s.done&&!s.rewarded){s.rewarded=true;store.addShard();store.reward(40,15);}
   s.attempts=0;s.hint=0;store.save();onBadges?.(store.checkBadges());
  }
  sound('right');if(s.done)confetti(35);q('#j-feedback').textContent=`${attempts>1?'Gut drangeblieben.':'Das stimmt!'} +10 Entdeckerpunkte`;
  /* Die Person lobt mit dem eigenen Ergebnis; Fips wedelt; ein Gegenstand mehr liegt in der Szene. */
  const lob=fill(fits(at)?st.lob[at]:LOB_OP[at],{...vals(),ergebnis:typeof task.answer==='number'?shown(task.answer)+(task.unit?' '+task.unit:''):`${task.visual.a} ${task.answer} ${task.visual.b}`});
  const sayEl=q('[data-say]');if(sayEl)sayEl.outerHTML=bubble(id,[lob],'lob');speak(lob);
  fipsDo('wag');if(q('.j-loot'))q('.j-loot').innerHTML=loot();
  q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.explain;lock(s.done?'Kapitel abschließen →':'Nächster Auftrag →');q('.j-xp').textContent=p.xp+' Punkte';q('.j-actors').style.left=(18+s.step*12)+'%';
  // Während die Figuren zum nächsten Platz rücken, läuft der Schrittzyklus; danach stehen sie wieder.
  const actors=[...root.querySelectorAll('.j-actor')];actors.forEach(a=>walk(a,true));setTimeout(()=>actors.forEach(a=>walk(a,false)),1000);
  q('.j-delivery').setAttribute('aria-label',`${s.step} von 5 Vorbereitungen erledigt`);q('.j-delivery').innerHTML=Array.from({length:5},(_,i)=>`<span class="${i<s.step?'ready':''}">${i<s.step?'✓':i+1}</span>`).join('');q('[data-next]').focus({preventScroll:true});
 }
 root.addEventListener('submit',e=>{if(e.target.matches('[data-form]')){e.preventDefault();respond();}},{signal:ctl.signal});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-count')){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));return;}
  if(b.dataset.pick!==undefined){const raw=b.dataset.pick;pick=mode()==='compare'?SIGNS[raw]:Number(raw);drawWidget();return;}
  if(b.dataset.cell!==undefined){const n=Number(b.dataset.cell);cells.has(n)?cells.delete(n):cells.add(n);drawWidget();return;}
  if(b.dataset.bag!==undefined){bags[Number(b.dataset.bag)]++;drawWidget();if(bags.reduce((x,y)=>x+y,0)===task.visual.total)q('#j-feedback').textContent='Alles verteilt. Sind alle Gefäße gleich voll? Dann prüfe.';return;}
  if(b.hasAttribute('data-rebag')){bags=bags.map(()=>0);q('#j-feedback').textContent='';drawWidget();return;}
  if(b.hasAttribute('data-read'))return speak(([...root.querySelectorAll('[data-say] p')].map(x=>x.textContent).join(' ')+' '+task.question).trim(),true);
  if(b.hasAttribute('data-hint')){hint=Math.min(2,hint+1);s.hint=hint;store.save();q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.hints[hint-1];b.textContent=`Tipp ${hint}/2`;return;}
  if(b.hasAttribute('data-explain')){revealed=true;q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.explain;q('#j-feedback').textContent='Schau dir den Rechenweg an. Danach übst du denselben Auftrag mit neuen Zahlen.';lock('Mit neuen Zahlen probieren →');s.task=null;s.attempts=0;s.hint=0;store.save();return;}
  if(b.hasAttribute('data-next'))return s.done?result(true):newTask(true);
  if(b.hasAttribute('data-easier')){s.practiceGrade=Math.max(1,grade()-1);s.task=null;s.attempts=0;s.hint=0;newTask(true);q('#j-feedback').textContent='Eine einfachere Aufgabe. Deine Klassenstufe im Profil bleibt erhalten.';return;}
  if(b.hasAttribute('data-replay')){s.results=[];s.step=0;s.done=false;s.task=null;s.attempts=0;s.hint=0;s.claimed=[];delete s.practiceGrade;store.save();return newTask(true);}
 },{signal:ctl.signal});
 sound('ort'+index);
 if(s.done)result();else newTask();
}
export function finale(root,{go}){
 const p=store.current();if(chapterCount(p)!==6)return go('#/map');
 root.innerHTML=`<section class="v-finale"><img class="v-finale-art" src="assets/scenes/rechenbach-karte.webp" alt="Rechenbach feiert sein Dorffest"><div class="v-certificate"><p class="v-eyebrow">MATHEQUEST · DORF RECHENBACH</p><h1>Du hast das Dorf zusammengebracht.</h1><p class="v-cert-name">${esc(p.name)}</p><p>hat auf dem Bauernhof, in der Bäckerei, am Bahnhof, bei der Feuerwehr, in der Schreinerei und auf dem Dorfplatz geholfen – und so kam der Festkuchen zustande.</p><img class="v-festkuchen" src="assets/chars/festkuchen.webp" alt="Der Festkuchen"><div class="v-festtisch" aria-label="Was aus jedem Ort kam">${CHAPTERS.map(x=>`<span>${pic(x)}<small>${esc(x.short)}</small></span>`).join('')}</div><ol class="v-buch">${CHAPTERS.map(x=>p.campaign?.chapters?.[x.id]?.pass).filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="v-stamps">${stamps(p)}</div><strong>30 Aufträge. Sechs Orte. Ein gemeinsames Fest.</strong><p>Danke fürs Mitdenken, Ausprobieren und Dranbleiben.</p><small>${new Date().toLocaleDateString('de-DE')}</small></div><div class="row-actions"><button class="v-primary" data-print>Urkunde drucken / als PDF speichern</button><button class="ghost" data-go="#/map">Weiter im Dorf spielen</button></div></section>`;
 root.querySelector('[data-print]').onclick=()=>window.print();confetti(40);
}
export function help(root){root.innerHTML=`<section class="screen help-screen"><button class="ghost" data-go="#/map">← Dorfkarte</button><h1>So spielst du MatheQuest</h1><div class="panel"><h2>Dein Abenteuer</h2><p>Wähle einen der sechs Orte. Löse dort fünf Aufträge. Die Aufgaben richten sich nach deiner Klasse. Für jeden Ort bekommst du einen Stempel. Mit sechs Stempeln beginnt das Dorffest.</p><p>Du darfst zählen, Tipps nutzen und vorlesen lassen. „Zeig mir den Weg“ erklärt die Rechnung. Danach probierst du neue Zahlen. Es gibt kein Zeitlimit.</p></div><div class="panel"><h2>Noch mehr entdecken</h2><p>Unter „Üben“ warten 47 Trainingsthemen, 30 Mitmachspiele, begehbare Lernorte, ein Klasse-7-Labor und die lokale Rangliste. Die Brücke und der Gemüsegarten sind eigenständige Abenteuer.</p></div><div class="panel"><h2>Installieren & offline spielen</h2><p>Öffne die Spieladresse einmal mit Internet und warte auf „Für das Offline-Spielen bereit“. Danach kannst du ohne Internet weiterspielen.</p><p><b>Android (Chrome):</b> Menü → „App installieren“ oder „Zum Startbildschirm hinzufügen“.<br><b>iPhone/iPad (Safari):</b> Teilen → „Zum Home-Bildschirm“.<br><b>PC:</b> Installationssymbol in der Adressleiste, wenn angeboten.</p>${appButtons()}<p>Die ZIP enthält die PWA für einen Webserver oder GitHub Pages. Zum lokalen Starten verwende das beiliegende Startprogramm; dafür wird Python 3 benötigt.</p></div><div class="panel"><h2>Deinen Spielstand sichern</h2><p>Der Fortschritt bleibt in diesem Browser. Unter „Erwachsene“ kannst du alle Profile als JSON sichern und wiederherstellen. Ein Gerätewechsel übernimmt den Spielstand nicht automatisch.</p><p>Die PWA hat keine Werbung, Tracker oder externen Schriftdateien. Die private Online-Vorschau kann eine ChatGPT-Anmeldung verlangen. Die heruntergeladene PWA benötigt kein Konto.</p></div></section>`;}
