import * as store from './store.js';
import {CHAPTERS,createJourneyTask,awardStep,chapterCount,nextChapter,fmt} from './journey-logic.js';
import {esc} from './ui.js';
import {check} from './answer.js';
import {update,rec} from './competence.js';
import {sound,confetti,speak,stopSpeaking} from './fx.js';
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
 <section class="v-extras"><button data-go="#/adv/bridge"><span>🌉</span><b>Die kaputte Brücke</b><small>Ein Mitmach-Abenteuer mit Brumm →</small></button><button data-go="#/adv/hoppel"><span>🐇</span><b>Hoppel ist ausgebüxt</b><small>Finde den richtigen Trittstein →</small></button><button data-go="#/explore/wald"><span>🌳</span><b>Unterwegs am Waldbach</b><small>Entdecken & weiterüben →</small></button></section><footer class="v-foot"><span data-offline-status>Offline-Dateien werden vorbereitet …</span><span>Spielstand auf diesem Gerät · <a href="#/hilfe">Spielhilfe & Installation</a></span></footer></div>`;
 const status=root.querySelector('[data-offline-status]');
 if(!('serviceWorker'in navigator)||location.protocol==='file:')status.textContent='Offline-Modus benötigt einen Webserver.';
 else navigator.serviceWorker.ready.then(()=>{if(status.isConnected)status.textContent='✓ Für das Offline-Spielen bereit';});
}
function visual(t,c){
 const v=t.visual;
 const dots=(n,taken=0)=>Array.from({length:n},(_,i)=>`<button type="button" class="j-counter ${i>=n-taken?'taken':''}" data-count aria-label="Gegenstand ${i+1}${i>=n-taken?', weggenommen':''}" aria-pressed="false">${c.icon}</button>`).join('');
 if(['add','sub','missing'].includes(v.kind)&&Math.max(v.total||0,v.a+(v.kind==='add'?v.b:0))<=30){
  if(v.kind==='add')return `<div class="j-groups"><div>${dots(v.a)}<b>${v.a}</b></div><strong>+</strong><div>${dots(v.b)}<b>${v.b}</b></div></div><p class="j-vis-note">Tippe Gegenstände an, um beim Zählen den Überblick zu behalten.</p>`;
  if(v.kind==='sub')return `<div class="j-counters">${dots(v.a,v.b)}</div><p class="j-vis-note">Durchgestrichene Gegenstände sind schon weg.</p>`;
  return `<div class="j-counters">${dots(v.a)}${Array.from({length:v.total-v.a},()=>'<span class="j-empty">?</span>').join('')}</div><p class="j-vis-note">Ziel: ${v.total}. Wie viele Plätze sind noch leer?</p>`;
 }
 if(v.kind==='array'&&v.a*v.b<=100)return `<div class="j-array" style="--cols:${v.b}">${Array.from({length:v.a*v.b},()=>`<i>${c.icon}</i>`).join('')}</div><p class="j-vis-note">${v.a} Reihen · ${v.b} in jeder Reihe</p>`;
 if(v.kind==='fraction')return `<div class="j-frbar">${Array.from({length:v.den},(_,i)=>`<span class="${i<v.num?'selected':''}">${i<v.num?'✓':''}</span>`).join('')}</div><p class="j-vis-note">${v.num} von ${v.den} gleich großen Teilen · zusammen ${v.total}</p>`;
 if(v.kind==='percent')return `<div class="j-percent">${Array.from({length:100},(_,i)=>`<i class="${i<v.b?'selected':''}"></i>`).join('')}</div><p class="j-vis-note">${v.b} von 100 Kästchen · ganze Menge: ${v.a}</p>`;
 if(v.kind==='area')return `<div class="j-area"><span>${v.a} m</span><div class="j-array" style="--cols:${v.a}">${Array.from({length:v.a*v.b},()=>'<i></i>').join('')}</div><b>${v.b} m</b></div>`;
 const text=({add:`${v.a} + ${v.b} = ?`,sub:`${v.a} − ${v.b} = ?`,missing:`${v.a} + ? = ${v.total}`,array:`${v.a} · ${v.b} = ?`,divide:`${v.total} : ${v.a} = ?`,prices:`${fmt(v.a)} € + ${fmt(v.b)} €`,ratio:`${v.a} Karten → ${v.total} €\n${v.b} Karten → ?`,equation:`${v.a} · x + ${v.b} = ${v.total}`})[v.kind];
 return `<div class="j-equation">${esc(text||'')}</div>`;
}
export function run(root,{go,onBadges},id){
 const c=CHAPTERS.find(c=>c.id===id);if(!c)return go('#/map');
 const p=store.current();p.campaign||={chapters:{}};p.campaign.chapters||={};
 const s=p.campaign.chapters[id]||={step:0,done:false,completed:false,claimed:[]};
 let task=null,attempts=0,hint=0,solved=false,revealed=false; const ctl=new AbortController();
 const q=x=>root.querySelector(x),index=CHAPTERS.indexOf(c);
 root.addEventListener('cleanup',()=>{ctl.abort();stopSpeaking();},{once:true,signal:ctl.signal});
 function frame(){root.innerHTML=`<section class="j-shell"><header class="j-header"><button class="ghost" data-go="#/map">← Dorfkarte</button><div><small>KAPITEL ${index+1} · KLASSE ${s.practiceGrade||p.grade}</small><h1>${c.name}</h1></div><span class="j-xp">${p.xp} Punkte</span></header><div class="j-stage"><img class="j-background" src="assets/scenes/erkundung-${id}.webp" alt="${c.name}"><div class="j-scene-label">${c.person} wartet auf dich</div><div class="j-actors" style="left:${18+s.step*12}%"><img src="${hero(p)}" alt="${p.hero==='ben'?'Ben':'Lina'}"><img src="assets/chars/fips-froh.webp" alt="Fips"></div><div class="j-delivery" aria-label="${s.step} von 5 Vorbereitungen erledigt">${Array.from({length:5},(_,i)=>`<span class="${i<s.step?'ready':''}" title="${c.steps[i]}">${i<s.step?'✓':i+1}</span>`).join('')}</div></div><div class="j-layout"><aside class="j-story"><p class="v-eyebrow">UNSER AUFTRAG</p><h2>${c.person}</h2><p>${c.intro}</p><ol>${c.steps.map((x,i)=>`<li class="${i<s.step?'done':i===s.step?'current':''}"><span>${i<s.step?'✓':i+1}</span>${x}</li>`).join('')}</ol><button class="ghost small" data-go="#/ort/${id}">Hier frei weiterüben</button></aside><section class="j-task" aria-label="Deine Aufgabe"><div data-task></div></section></div></section>`;}
 function newTask(scroll=false){
  if(s.task&&s.task.grade!==(s.practiceGrade||p.grade))s.task=null;
  solved=false;revealed=false;attempts=s.attempts||0;hint=s.hint||0;
  if(!s.task){const grade=s.practiceGrade||p.grade,trial=createJourneyTask(id,s.step,grade,1);s.task=createJourneyTask(id,s.step,grade,rec(p,trial.skill).level);s.attempts=0;s.hint=0;attempts=0;hint=0;store.save();}
  task=s.task;frame();q('[data-task]').innerHTML=`<div class="j-task-top"><p class="v-eyebrow">AUFTRAG ${s.step+1} VON 5</p><button class="j-read" data-read aria-label="Aufgabe vorlesen">♪ Vorlesen</button></div><h2>${c.steps[s.step]}</h2><p class="j-question">${esc(task.question)}</p><div class="j-visual">${visual(task,c)}</div><form data-form><label class="j-answer-label" for="journey-answer">Deine Antwort${task.unit?' in '+task.unit:''}</label><div class="j-answer-row"><input id="journey-answer" data-answer type="text" inputmode="decimal" autocomplete="off" placeholder="?" aria-describedby="j-feedback"><button class="v-primary" type="submit" data-check>Prüfen ✓</button></div></form><p id="j-feedback" class="j-feedback" role="status"></p><div class="j-tip" data-tip-panel ${hint?'':'hidden'}>${hint?esc(task.hints[hint-1]):''}</div><div class="j-tools"><button class="ghost" data-hint>Tipp ${hint?hint+'/2':''}</button><button class="ghost" data-explain>Zeig mir den Weg</button><button class="ghost small" data-easier>Leichter</button></div><button class="v-primary j-next" data-next hidden>Weiter →</button>`;
  if(scroll)q('.j-task').scrollIntoView({block:'start'});
 }
 function result(scroll=false){frame();const next=CHAPTERS[index+1];q('[data-task]').innerHTML=`<div class="j-complete"><span class="j-medal">✓</span><p class="v-eyebrow">KAPITEL ABGESCHLOSSEN</p><h2>${c.reward}!</h2><p>${c.end}</p><div class="v-stamps">${stamps(p)}</div><p>Dein Fortschritt ist gespeichert.</p><button class="v-primary" data-go="${chapterCount(p)===6?'#/dorffest':next?`#/reise/${next.id}`:'#/map'}">${chapterCount(p)===6?'Das Dorffest eröffnen':next?'Zum nächsten Ort':'Zur Dorfkarte'} →</button><button class="ghost" data-replay>Noch einmal mit neuen Zahlen</button></div>`;if(scroll)q('.j-task').scrollIntoView({block:'start'});}
 function respond(){
  if(solved||revealed)return;const value=q('[data-answer]').value;if(!value.trim()){q('#j-feedback').textContent='Trage erst deine Antwort ein.';return;}
  attempts++;s.attempts=attempts;
  if(!check(task,value)){q('#j-feedback').textContent=attempts===1?'Noch nicht ganz. Probiere es mit den Gegenständen oder einem Tipp.':'Du darfst weiterprobieren. „Zeig mir den Weg“ erklärt die Rechnung.';store.save();return;}
  solved=true;
  if(awardStep(p,id,task.id)){
   store.recordAnswer({correct:true,attempts,hint:hint>0,combo:0});update(p,task.skill,{correct:true,attempts,hint:hint>0});store.reward(10,4);
   if(s.done&&!s.rewarded){s.rewarded=true;store.addShard();store.reward(40,15);}
   s.attempts=0;s.hint=0;store.save();onBadges?.(store.checkBadges());
  }
  sound('right');if(s.done)confetti(35);q('#j-feedback').textContent=`${attempts>1?'Gut drangeblieben.':'Das stimmt!'} +10 Entdeckerpunkte`;
  q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.explain;q('[data-answer]').disabled=true;q('[data-check]').hidden=true;q('.j-tools').hidden=true;q('[data-next]').hidden=false;q('[data-next]').textContent=s.done?'Kapitel abschließen →':'Nächster Auftrag →';q('.j-xp').textContent=p.xp+' Punkte';q('.j-actors').style.left=(18+s.step*12)+'%';
  q('.j-delivery').setAttribute('aria-label',`${s.step} von 5 Vorbereitungen erledigt`);q('.j-delivery').innerHTML=Array.from({length:5},(_,i)=>`<span class="${i<s.step?'ready':''}">${i<s.step?'✓':i+1}</span>`).join('');q('[data-next]').focus({preventScroll:true});
 }
 root.addEventListener('submit',e=>{if(e.target.matches('[data-form]')){e.preventDefault();respond();}},{signal:ctl.signal});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-count')){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));return;}
  if(b.hasAttribute('data-read'))return speak(task.question,true);
  if(b.hasAttribute('data-hint')){hint=Math.min(2,hint+1);s.hint=hint;store.save();q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.hints[hint-1];b.textContent=`Tipp ${hint}/2`;return;}
  if(b.hasAttribute('data-explain')){revealed=true;q('[data-tip-panel]').hidden=false;q('[data-tip-panel]').textContent=task.explain;q('#j-feedback').textContent='Schau dir den Rechenweg an. Danach übst du denselben Auftrag mit neuen Zahlen.';q('[data-check]').hidden=true;q('[data-answer]').disabled=true;q('.j-tools').hidden=true;q('[data-next]').hidden=false;q('[data-next]').textContent='Mit neuen Zahlen probieren →';s.task=null;s.attempts=0;s.hint=0;store.save();return;}
  if(b.hasAttribute('data-next'))return s.done?result(true):newTask(true);
  if(b.hasAttribute('data-easier')){s.practiceGrade=Math.max(1,(s.practiceGrade||p.grade)-1);s.task=null;s.attempts=0;s.hint=0;newTask(true);q('#j-feedback').textContent='Eine einfachere Aufgabe. Deine Klassenstufe im Profil bleibt erhalten.';return;}
  if(b.hasAttribute('data-replay')){s.step=0;s.done=false;s.task=null;s.attempts=0;s.hint=0;s.claimed=[];store.save();return newTask(true);}
 },{signal:ctl.signal});
 if(s.done)result();else newTask();
}
export function finale(root,{go}){
 const p=store.current();if(chapterCount(p)!==6)return go('#/map');
 root.innerHTML=`<section class="v-finale"><img class="v-finale-art" src="assets/scenes/rechenbach-karte.webp" alt="Rechenbach feiert sein Dorffest"><div class="v-certificate"><p class="v-eyebrow">MATHEQUEST · DORF RECHENBACH</p><h1>Du hast das Dorf zusammengebracht.</h1><p class="v-cert-name">${esc(p.name)}</p><p>hat auf dem Bauernhof, in der Bäckerei, am Bahnhof, bei der Feuerwehr, in der Schreinerei und auf dem Dorfplatz geholfen.</p><div class="v-stamps">${stamps(p)}</div><strong>30 Aufträge. Sechs Orte. Ein gemeinsames Fest.</strong><p>Danke fürs Mitdenken, Ausprobieren und Dranbleiben.</p><small>${new Date().toLocaleDateString('de-DE')}</small></div><div class="row-actions"><button class="v-primary" data-print>Urkunde drucken / als PDF speichern</button><button class="ghost" data-go="#/map">Weiter im Dorf spielen</button></div></section>`;
 root.querySelector('[data-print]').onclick=()=>window.print();confetti(40);
}
export function help(root){root.innerHTML=`<section class="screen help-screen"><button class="ghost" data-go="#/map">← Dorfkarte</button><h1>So spielst du MatheQuest</h1><div class="panel"><h2>Dein Abenteuer</h2><p>Wähle einen der sechs Orte. Löse dort fünf Aufträge. Die Aufgaben richten sich nach deiner Klasse. Für jeden Ort bekommst du einen Stempel. Mit sechs Stempeln beginnt das Dorffest.</p><p>Du darfst zählen, Tipps nutzen und vorlesen lassen. „Zeig mir den Weg“ erklärt die Rechnung. Danach probierst du neue Zahlen. Es gibt kein Zeitlimit.</p></div><div class="panel"><h2>Noch mehr entdecken</h2><p>Unter „Üben“ warten 47 Trainingsthemen, 30 Mitmachspiele, begehbare Lernorte, ein Klasse-7-Labor und die lokale Rangliste. Die Brücke und der Gemüsegarten sind eigenständige Abenteuer.</p></div><div class="panel"><h2>Installieren & offline spielen</h2><p>Öffne die Spieladresse einmal mit Internet und warte auf „Für das Offline-Spielen bereit“. Danach kannst du ohne Internet weiterspielen.</p><p><b>Android (Chrome):</b> Menü → „App installieren“ oder „Zum Startbildschirm hinzufügen“.<br><b>iPhone/iPad (Safari):</b> Teilen → „Zum Home-Bildschirm“.<br><b>PC:</b> Installationssymbol in der Adressleiste, wenn angeboten.</p><p>Die ZIP enthält die PWA für einen Webserver oder GitHub Pages. Zum lokalen Starten verwende das beiliegende Startprogramm; dafür wird Python 3 benötigt.</p></div><div class="panel"><h2>Deinen Spielstand sichern</h2><p>Der Fortschritt bleibt in diesem Browser. Unter „Erwachsene“ kannst du alle Profile als JSON sichern und wiederherstellen. Ein Gerätewechsel übernimmt den Spielstand nicht automatisch.</p><p>Die PWA hat keine Werbung, Tracker oder externen Schriftdateien. Die private Online-Vorschau kann eine ChatGPT-Anmeldung verlangen. Die heruntergeladene PWA benötigt kein Konto.</p></div></section>`;}
