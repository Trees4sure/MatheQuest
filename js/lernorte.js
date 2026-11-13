// Sechs wiederbesuchbare Lernräume mit jeweils fünf eigenständigen Aufgabenhandlungen.
// Keine Pflichtabfolge: Kinder wählen jederzeit die Tätigkeit und üben beliebig oft.
import { ROOMS, createTask, isCorrect } from './lernorte-logic.js';
import * as store from './store.js';
import { rec, update, scheduleReview } from './competence.js';
import { esc, toast } from './ui.js';
import { sound, speak, stopSpeaking, canSpeak } from './fx.js';

const items=(n,emo,removed=0)=>`<div class="rm-items" role="img" aria-label="${n} Gegenstände${removed?`, davon ${removed} weggenommen`:''}">${Array.from({length:Math.min(90,n)},(_,i)=>`<span class="rm-item${i>=n-removed?' gone':''}" aria-hidden="true">${emo}</span>`).join('')}</div>`;
const showMoney= n=>(n/100).toFixed(2).replace('.',',')+' €';
// Kleine, abgeschlossene Dorfaufträge als sichtbare Konsequenz des Übens.
// Nach fünf gelösten Aufgaben ist der Dorfauftrag erledigt. Weitere Aufgaben bleiben offen.
const MISSIONS={
 w1:{name:'Der Hof braucht Hilfe',actor:'Bäuerin Hoppe',goal:'Hilf bei fünf kleinen Hofarbeiten.',finished:'Die Arbeit auf dem Hof ist geschafft. Das Gemüse kann zum Fest!',symbol:'🥚'},
 w2:{name:'Vorbereitung für den Markt',actor:'Bäckerin Bettina',goal:'Rechne fünf Bestellungen für den Markt aus.',finished:'Die Bestellungen sind bereit. Der Markt kann öffnen.',symbol:'🥨'},
 w3:{name:'Alles für den Bahnhof',actor:'Schaffner Schulz',goal:'Löse fünf Aufgaben rund um die Zugfahrt.',finished:'Alles vorbereitet – der Zug kann pünktlich starten.',symbol:'🚆'},
 w4:{name:'Planung im Rathaus',actor:'Feuerwehrfrau Fiete',goal:'Hilf mit fünf Rechenaufträgen.',finished:'Wasser, Wege und Zahlen sind geprüft. Gut vorbereitet!',symbol:'🚒'},
 w5:{name:'Der neue Spielplatz',actor:'Schreinermeister Brumm',goal:'Löse fünf Bauaufträge.',finished:'Der Bauplan steht. Der Spielplatz nimmt Form an.',symbol:'🔨'},
 w6:{name:'Der Festtag kann kommen',actor:'Bürgermeisterin Nolte',goal:'Hilf mit fünf Rechnungen am Feststand.',finished:'Alles ist berechnet – die Gäste können kommen!',symbol:'🎪'},
};

function visual(task,selected,reveal=false,bags=[]) {
  const v=task.visual;
  switch(v.kind) {
    case 'groups':return `<div class="rm-two"><div><b>Erste Gruppe: ${v.values[0]}</b>${items(v.values[0],v.icon)}</div><span class="rm-op">+</span><div><b>Zweite Gruppe: ${v.values[1]}</b>${items(v.values[1],v.icon)}</div></div>`;
    case 'take':return `<div class="rm-two"><div><b>Vorher: ${v.count}${v.unit?' × '+v.unit:''}</b>${items(v.count,v.icon,v.take)}</div><div><b>Weg: ${v.take}${v.unit?' × '+v.unit:''}</b><p class="rm-note">Durchgestrichene Gegenstände wurden weggenommen.</p></div></div>`;
    case 'compare':return `<div class="rm-two rm-compare"><div><strong>${v.left} ${v.unit||''}</strong>${v.left<25?items(v.left,v.icon):''}</div><span class="rm-op">?</span><div><strong>${v.right} ${v.unit||''}</strong>${v.right<25?items(v.right,v.icon):''}</div></div>`;
    case 'fill':return `<p class="rm-mini">Es sind schon ${v.initial} Blumen da. ${selected.size} hast du dazugepflanzt.</p><div class="rm-cell-grid" style="--columns:10">${Array.from({length:v.total},(_,i)=>`<button type="button" class="rm-cell${i<v.initial?' fixed':selected.has(i)?' picked':''}" ${i<v.initial||reveal?'disabled':''} data-cell="${i}" aria-pressed="${selected.has(i)}" aria-label="Feld ${i+1}: ${i<v.initial?'bereits bepflanzt':selected.has(i)?'neu bepflanzt':'frei'}">${i<v.initial||selected.has(i)?'🌷':'·'}</button>`).join('')}</div>`;
    case 'line': {const nums=Array.from({length:v.max-v.min+1},(_,i)=>v.min+i);return `<div class="rm-line" role="group" aria-label="Zahlenstrahl. Wähle den Zielstein.">${nums.map(x=>`<button class="rm-tick${x===v.from?' start':''}${selected===x?' picked':''}${reveal&&x===v.to?' solution':''}" type="button" data-pick="${x}" aria-pressed="${selected===x}" ${reveal?'disabled':''}><span>│</span>${x}</button>`).join('')}</div><p class="rm-mini">Start: ${v.from} · Tippe auf deine Zielzahl.</p>`;}
    case 'array':return `<div class="rm-array" style="--columns:${v.cols}" aria-label="${v.rows} Reihen mit jeweils ${v.cols} Gegenständen" role="img">${Array.from({length:v.rows*v.cols},()=>`<span>${v.icon}</span>`).join('')}</div><p class="rm-mini">${v.rows} Reihen · ${v.cols} in jeder Reihe</p>`;
    case 'split':{const remain=v.all-bags.reduce((a,b)=>a+b,0);return `<p class="rm-mini">Noch ${remain} von ${v.all} Brezeln sind zu verteilen. Tippe eine Tüte an, um eine Brezel hineinzulegen.</p><div class="rm-baskets">${Array.from({length:v.groups},(_,i)=>`<button type="button" class="rm-basket" data-bag="${i}" ${reveal||remain<=0?'disabled':''}><span>🧺</span><b>${bags[i]||0} ${v.icon}</b><small>Tüte ${i+1}</small></button>`).join('')}</div>`;}
    case 'coins': {const amount=[...selected].reduce((a,b)=>a+Number(String(b).split(':')[0]),0);return `<div class="rm-money"><div><span>${task.type==='decimal'?'Erster Preis':'Preis'}</span><b>${showMoney(v.price)}</b></div><div><span>${task.type==='decimal'?'Zweiter Preis':'Gegeben'}</span><b>${showMoney(v.paid)}</b></div></div><p class="rm-mini">Lege die Antwort mit Münzen: <strong>${showMoney(amount)}</strong></p><div class="rm-coin-list">${v.denoms.map(d=>`<button type="button" class="rm-coin" data-coin="${d}" ${reveal?'disabled':''} aria-label="Münze ${d>=100?d/100+' Euro':d+' Cent'} hinzufügen">${d>=100?d/100+' €':d+' ct'}</button>`).join('')}</div><div class="rm-coin-tray" aria-label="Deine ausgelegten Münzen">${[...selected].map(id=>{const d=Number(String(id).split(':')[0]);return `<button type="button" data-remove-coin="${id}" ${reveal?'disabled':''} title="Münze zurücknehmen">${d>=100?d/100+' €':d+' ct'} ×</button>`;}).join('')}</div>`;}
    case 'clock': {let angle=(v.m/60)*360;return `<div class="rm-time"><div class="rm-clock" role="img" aria-label="Uhr zeigt ${v.h}:${String(v.m).padStart(2,'0')}"><span class="rm-hour" style="transform:translateX(-50%) rotate(${(v.h%12)*30+v.m/2}deg)"></span><span class="rm-minute" style="transform:translateX(-50%) rotate(${angle}deg)"></span><i>12</i><b>6</b></div><div><b class="rm-time-big">${v.h}:${String(v.m).padStart(2,'0')} Uhr</b><p>+ ${v.duration} Minuten</p></div></div>`;}
    case 'place':return `<div class="rm-place">${[['H',v.hundreds,100],['Z',v.tens,10],['E',v.ones,1]].map(([l,num,w])=>`<div><b>${l}</b><span>${num}</span><small>${num} × ${w}</small></div>`).join('')}</div>`;
    case 'chart':{const max=Math.max(...v.bars.map(x=>x[1]),1);return `<div class="rm-chart" role="img" aria-label="Balkendiagramm: ${v.bars.map(b=>b.join(' ')).join(', ')}">${v.bars.map(([name,n])=>`<div><span>${esc(name)}</span><i style="width:${Math.round(n/max*100)}%"></i><strong>${n}</strong></div>`).join('')}</div>`;}
    case 'segments':return `<div class="rm-segments"><div style="flex:${v.a}">${v.a} ${v.unit}</div><div style="flex:${v.b}">${v.b} ${v.unit}</div></div>`;
    case 'rect':return `<div class="rm-geometry"><span class="rm-top">${v.a} m</span><div style="aspect-ratio:${v.a}/${v.b}"><span>Garten</span></div><span class="rm-side">${v.b} m</span></div><p class="rm-mini">${v.kind2==='perimeter'?'Umfang = alle vier Außenseiten':'Flächeninhalt = Reihen × Spalten'}</p>`;
    case 'round':return `<div class="rm-round"><span>${Math.floor(v.value/v.step)*v.step}</span><div><i style="left:${((v.value%v.step)/v.step)*100}%"></i><b style="left:${((v.value%v.step)/v.step)*100}%">${v.value}</b></div><span>${(Math.floor(v.value/v.step)+1)*v.step}</span></div>`;
    case 'grid':return `<div class="rm-array rm-tiles" style="--columns:${v.cols}" role="img" aria-label="Fliesenfeld mit ${v.rows} Reihen und ${v.cols} Spalten">${Array.from({length:v.rows*v.cols},()=>'<span>▦</span>').join('')}</div>`;
    case 'part':return `<div class="rm-part">${Array.from({length:v.den},(_,i)=>`<div class="${i<v.num?'active':''}"><small>Gruppe ${i+1}</small><div>${items(v.total/v.den,v.icon)}</div></div>`).join('')}</div><p class="rm-mini">${v.num} von ${v.den} Gruppen werden gebraucht.</p>`;
    case 'equation':return `<div class="rm-equation">${esc(v.expr)}</div>`;
    case 'fractions':return `<div class="rm-two"><div><strong>${v.a}/${v.den}</strong><div class="rm-frbar">${Array.from({length:v.den},(_,i)=>`<i class="${i<v.a?'active':''}"></i>`).join('')}</div></div><span class="rm-op">+</span><div><strong>${v.b}/${v.den}</strong><div class="rm-frbar">${Array.from({length:v.den},(_,i)=>`<i class="${i<v.b?'active':''}"></i>`).join('')}</div></div></div><p class="rm-mini">Wie viele Stücke von ${v.den} Stücken sind es zusammen?</p>`;
    case 'percent':return `<p class="rm-mini">${v.percent} von 100 Kästchen sind markiert.</p><div class="rm-percent" role="img" aria-label="Hunderterfeld: ${v.percent} von 100 Kästchen markiert">${Array.from({length:100},(_,i)=>`<i class="${i<v.percent?'active':''}"></i>`).join('')}</div>`;
    case 'volume':return `<div class="rm-cuboid"><div class="rm-face">${v.a} dm × ${v.b} dm<span>Tiefe: ${v.c} dm</span></div></div><p class="rm-mini">Quader: Länge × Breite × Höhe</p>`;
  }
  return '';
}

export function run(root,{go,onBadges},roomId){
  const room=ROOMS[roomId];if(!room)return go('#/map');
  const p=store.current();p.rooms||={};p.rooms[roomId]||={};
  const mission=MISSIONS[roomId]; p.rooms[roomId]._mission||={count:0,done:false};
  let action=room.actions[0][0],task,selected=new Set(),bags=[],choice=null,levelAdjust=0,attempts=0,hints=0,finished=false,seen=0,sessionSolved=0,coinSerial=0,previousQuestion='';
  const q=s=>root.querySelector(s);
  const actionsHtml=()=>room.actions.map(([id,name,emo,desc])=>{let progress=p.rooms[roomId][id]?.solved||0;return `<button type="button" data-activity="${id}" aria-pressed="${id===action}" title="${esc(desc)}"><span>${emo}</span><b>${esc(name)}</b><small>${progress?progress+'× geübt':esc(desc)}</small></button>`}).join('');
  root.innerHTML=`<section class="rm-screen" style="--rm-accent:var(--ok)"><header class="rm-top"><button class="ghost" data-room-back>← Dorfkarte</button><div><small>MATHEQUEST · LERNORT</small><h1>${room.emoji} ${esc(room.name)}</h1><p>${esc(room.subtitle)}</p></div><button class="ghost" data-region>Zum Training</button></header><div class="rm-landscape"><img src="assets/scenes/erkundung-${roomId}.webp" alt="Illustrierter Lernort ${esc(room.name)}" loading="eager"><div class="rm-hotspot-nav" aria-label="Tätigkeiten direkt am Ort auswählen">${room.actions.map(([id,name,emoji],i)=>`<button type="button" data-activity="${id}" aria-label="${esc(name)}" aria-pressed="${id===action}" title="${esc(name)}" style="left:${[19,37,54,70,85][i]}%;top:${[69,46,67,46,70][i]}%">${emoji}</button>`).join("")}</div><div class="rm-land-caption"><b>Rechenbach</b><span>Tippe auf ein Symbol oder wähle unten eine Tätigkeit.</span></div></div><nav class="rm-menu" aria-label="Tätigkeit auswählen">${actionsHtml()}</nav><div class="rm-layout"><section class="rm-card" aria-label="Mathematikaufgabe"><div class="rm-card-top"><div><small class="rm-eyebrow">DEINE AUFGABE</small><h2 class="rm-task-name"></h2></div><div class="rm-chip" data-level>Schritt 1 von 5</div></div><p class="rm-prompt" data-prompt></p><div class="rm-visual" data-visual></div><div class="rm-response" data-response></div><p class="rm-feedback" data-feedback role="status" aria-live="polite"></p><div class="rm-help" data-help></div><div class="rm-actions"><button type="button" class="rm-btn primary" data-check>Prüfen</button><button type="button" class="rm-btn" data-tip>Tipp</button>${canSpeak()?`<button type="button" class="rm-btn" data-speak>🔊 Vorlesen</button>`:""}<button type="button" class="rm-btn" data-explain>Zeig es mir</button><button type="button" class="rm-btn" data-easy>Etwas leichter</button><button type="button" class="rm-btn next" data-next hidden>Neue Aufgabe →</button></div></section><aside class="rm-side"><h3>So lernst du</h3><p>Du darfst zählen, ausprobieren und dir etwas erklären lassen. Hilfe ist erlaubt!</p><div class="rm-sum"><b data-count>0</b><span>Aufgaben in dieser Runde verstanden</span></div><div class="rm-mission" data-mission></div><p data-encourage>Jeder Versuch hilft dir beim Lernen.</p><div class="rm-side-bottom"><button type="button" class="ghost" data-region>Weitere Übungen</button><button type="button" class="ghost" data-room-back>Andere Orte</button></div></aside></div></section>`;
  // Das W1-Bild ist die bekannte Brückenszene, die übrigen fünf Kulissen gehören zu den Lernräumen.
  q('.rm-screen').style.setProperty('--rm-accent',({w1:'#528b5f',w2:'#c78349',w3:'#716dc0',w4:'#b54c4b',w5:'#977147',w6:'#418cb0'})[roomId]);
  const mode=()=>task.type==='fill'?'fill':task.type==='line'?'line':task.type==='compare'?'compare':task.type==='coins'?'coins':'input';
  function getVal(){const m=mode();if(m==='fill')return selected.size;if(m==='line'||m==='compare')return choice;if(m==='coins'){const cents=[...selected].reduce((a,b)=>a+Number(String(b).split(':')[0]),0);return task.type==='decimal'?cents/100:cents;}return q('[data-answer]')?.value??'';}
  function response(){const m=mode();if(m==='fill')return '<p>Tippe auf die freien Felder und prüfe dein Beet.</p>';
    if(m==='line')return '<p>Tippe deine Antwort direkt auf dem Zahlenstrahl an.</p>';
    if(m==='compare')return `<div class="rm-symbols">${['<','=','>'].map(s=>`<button type="button" data-choice="${esc(s)}" aria-pressed="${choice===s}">${s==='<'?'&lt;':s==='>'?'&gt;':'='}</button>`).join('')}</div>`;
    if(m==='coins')return '<button type="button" class="rm-small" data-reset>Münzen zurücklegen</button>';
    return `<label class="rm-answer-label">Deine Antwort <input data-answer type="text" inputmode="${task.type==='time'?'text':task.type==='decimal'?'decimal':'numeric'}" autocomplete="off" spellcheck="false" aria-label="Antwort zur Aufgabe" placeholder="${task.type==='time'?'z. B. 14:30':task.type==='decimal'?'z. B. 3,75':'Zahl'}"></label>`;}
  function showMission(){
    const m=p.rooms[roomId]._mission;
    q('[data-mission]').innerHTML=`<h4>${mission.symbol} ${esc(mission.name)}</h4><p><b>${esc(mission.actor)}:</b> ${esc(m.done?mission.finished:mission.goal)}</p><div class="rm-milestones" role="img" aria-label="${Math.min(5,m.count)} von 5 Aufgaben zum Dorfauftrag">${Array.from({length:5},(_,i)=>`<span class="${i<m.count?'complete':''}">${i<m.count?'✓':'·'}</span>`).join('')}</div>${m.done?'<small>Auftrag erledigt · Neue Aufgaben bleiben spielbar.</small>':''}`;
  }
  function newTask(){const act=room.actions.find(a=>a[0]===action);if(!act)return;
    // Zunächst die Kompetenz der thematisch passenden Aufgabe lesen.
    let t=createTask(roomId,action,1);const r=rec(p,t.skill);const lv=Math.max(1,Math.min(5,r.level+levelAdjust));for(let i=0;i<8;i++){t=createTask(roomId,action,lv);if(t.question!==previousQuestion)break;}task=t;previousQuestion=t.question;selected=new Set();bags=task.visual.kind==='split'?Array(task.visual.groups).fill(0):[];choice=null;attempts=0;hints=0;finished=false;seen++;
    p.rooms[roomId][action]||={solved:0,tried:0};p.rooms[roomId][action].tried++;store.save();
    q('.rm-task-name').textContent=act[1];q('[data-prompt]').textContent=task.question;q('[data-level]').textContent=`Lernstufe ${lv} von 5`;
    q('[data-visual]').innerHTML=visual(task,selected,false,bags);q('[data-response]').innerHTML=response();q('[data-feedback]').textContent='';q('[data-help]').innerHTML='';q('[data-check]').hidden=false;q('[data-tip]').hidden=false;q('[data-explain]').hidden=false;q('[data-easy]').hidden=false;q('[data-next]').hidden=true;q('[data-encourage]').textContent='Probiere es in deinem Tempo.';showMission();speak(task.question);
  }
  function redraw(){q('[data-visual]').innerHTML=visual(task,selected,false,bags);if(mode()==='compare')q('[data-response]').innerHTML=response();}
  function finish(ok,wasRevealed=false){if(finished)return;finished=true;
    const result={correct:ok,attempts:Math.max(1,attempts),hint:hints>0};if(!wasRevealed){update(p,task.skill,result);store.recordAnswer({...result,combo:0});}
    if(ok){sessionSolved++;p.rooms[roomId][action].solved++;
      const progress=p.rooms[roomId]._mission;if(!progress.done){progress.count++;if(progress.count>=5){progress.done=true;store.addShard(1);store.reward(30,15);toast('Dorfauftrag erledigt! Ein Sticker für deinen Dorfpass.');}}
      const xp=attempts===1?(hints?8:10):6;store.reward(xp,Math.ceil(xp/2));sound('right');q('[data-feedback]').textContent=attempts>1?'Du hast einen Weg gefunden. Gut drangeblieben!':hints?'Mit dem Tipp gelöst. Gut genutzt!':'Richtig. Das passt!';q('[data-encourage]').textContent=sessionSolved%5===0?'Fünf Aufgaben geschafft. Eine Pause ist eine gute Idee.':'Du kannst noch eine ähnliche Aufgabe machen oder den Lernort wechseln.';
    }else{q('[data-feedback]').textContent='Hier siehst du einen Rechenweg. Du kannst gleich eine ähnliche Aufgabe üben.';}
    if(!wasRevealed&&(p.rooms[roomId][action].solved%4===0||!ok))scheduleReview(p,task.skill,ok?0.85:0.3);
    store.save();if(onBadges)onBadges(store.checkBadges());q('[data-count]').textContent=String(sessionSolved);showMission();q('[data-help]').innerHTML=`<div class="rm-solution"><b>${wasRevealed?'So funktioniert es:':'Erklärung:'}</b> ${esc(task.explanation)}</div>`;
    q('[data-visual]').innerHTML=visual(task,selected,true,bags);q('[data-response]').querySelectorAll('input,button').forEach(x=>x.disabled=true);
    q('[data-check]').hidden=true;q('[data-tip]').hidden=true;q('[data-explain]').hidden=true;q('[data-easy]').hidden=true;q('[data-next]').hidden=false;q('[data-next]').focus();
    q('.rm-menu').innerHTML=actionsHtml();
  }
  function check(){if(finished)return;const a=getVal();if(a===null||String(a).trim()===''){q('[data-feedback]').textContent='Wähle eine Antwort oder gib eine Zahl ein.';return;}attempts++;
    if(isCorrect(task,String(a)))finish(true);
    else{q('[data-feedback]').textContent=attempts===1?'Noch nicht ganz. Schau dir die Zeichnung an.':'Versuche es mit dem Tipp – du darfst in Ruhe zählen.';if(attempts>=2)showTip();}
  }
  function showTip(){if(finished)return;hints=Math.min(2,hints+1);q('[data-help]').innerHTML=`<div class="rm-tip"><b>${hints===1?'Tipp':'Zweiter Tipp'}</b><p>${esc(task.hints[hints-1])}</p></div>`;speak(task.hints[hints-1]);}
  function explain(){if(finished)return;hints=2;attempts=Math.max(1,attempts);finish(false,true);}
  const controller = new AbortController();
  root.addEventListener('cleanup',()=>{controller.abort();stopSpeaking();},{once:true,signal:controller.signal});
  root.addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn||!root.contains(btn))return;
    if(btn.hasAttribute('data-room-back'))return go('#/map');
    if(btn.hasAttribute('data-region'))return go(`#/region/${roomId}`);
    if(btn.dataset.activity){action=btn.dataset.activity;levelAdjust=0; q('.rm-menu').innerHTML=actionsHtml();root.querySelectorAll('.rm-hotspot-nav button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.activity===action)));newTask();return;}
    if(btn.dataset.cell!==undefined&&!finished){const i=+btn.dataset.cell;if(i>=task.visual.initial){selected.has(i)?selected.delete(i):selected.add(i);redraw();}return;}
    if(btn.dataset.pick!==undefined&&!finished){choice=Number(btn.dataset.pick);redraw();return;}
    if(btn.dataset.choice!==undefined&&!finished){choice=btn.dataset.choice;redraw();return;}
    if(btn.dataset.bag!==undefined&&!finished){const i=+btn.dataset.bag;if(bags.reduce((a,b)=>a+b,0)<task.visual.all){bags[i]++;redraw();if(bags.reduce((a,b)=>a+b,0)===task.visual.all){q('[data-feedback]').textContent="Alle verteilt. Sind die Tüten gleich voll?";if(bags.every(x=>x===bags[0]))q('[data-answer]').value=String(bags[0]);}}return;}
    if(btn.dataset.removeCoin!==undefined&&!finished){selected.delete(btn.dataset.removeCoin);redraw();return;}
    if(btn.dataset.coin!==undefined&&!finished){selected.add(btn.dataset.coin+":"+(++coinSerial)); // Münzen gleichen Wertes einzeln zählen
      // Der Spielwert ist die ganzzahlige Cent-Komponente, nicht die interne Identifikationsnummer.
      redraw();return;}
    if(btn.hasAttribute('data-reset')&&!finished){selected=new Set();redraw();return;}
    if(btn.hasAttribute('data-check'))return check();
    if(btn.hasAttribute('data-tip'))return showTip();
    if(btn.hasAttribute('data-speak'))return speak(task.question,true);
    if(btn.hasAttribute('data-explain'))return explain();
    if(btn.hasAttribute('data-easy')){levelAdjust=Math.max(-4,levelAdjust-1);newTask();q('[data-feedback]').textContent='Eine leichtere Aufgabe ist bereit.';return;}
    if(btn.hasAttribute('data-next'))return newTask();
  },{signal:controller.signal});
  root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-answer]')){e.preventDefault();check();}},{signal:controller.signal});
  newTask();
}
