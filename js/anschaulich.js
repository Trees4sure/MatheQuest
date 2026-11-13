// Mathe-Werkstatt: mehrere Aufgabenarten am selben Ort, unbegrenzt wiederholbar.
import {makeTask, evaluateTask, MODES} from './anschaulich-logic.js';
import {current,recordAnswer,reward,save,checkBadges} from './store.js';
import {update,scheduleReview} from './competence.js';
const names={punkte:'Punkte legen',zahlenstrahl:'Zahlenstrahl',geld:'Einkaufen'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function run(root,{go}) {
  const grade=Math.max(1,Math.min(6,current()?.grade||1));
  let mode='punkte', task, attempts=0, solved=0, streak=0, session=0, hintUsed=false, ended=false;
  const skillOf={punkte:'k1-plus10',zahlenstrahl:'k1-plus20',geld:'k2-money'};
  const logResult=correct=>{const r={correct,attempts:Math.max(1,attempts),hint:hintUsed};update(current(),skillOf[mode],r);recordAnswer({...r,combo:0});if(correct)reward(8,4);scheduleReview(current(),skillOf[mode],correct?0.85:0.3);save();checkBadges();};
  root.innerHTML=`<section class="workshop"><header><button class="ghost" id="wk-back">← Zurück</button><h1>Die Mathe-Werkstatt</h1><p>Hier kannst du immer wieder üben. Du entscheidest, was du probieren möchtest.</p></header><nav class="wk-modes" aria-label="Aufgabenart">${MODES.map(m=>`<button data-mode="${m}">${names[m]}</button>`).join('')}</nav><div class="wk-card"><h2 id="wk-title"></h2><p class="wk-question" id="wk-question"></p><div id="wk-visual" aria-label="Anschauliche Rechenhilfe"></div><div class="wk-input"><label for="wk-answer">Deine Antwort</label><input id="wk-answer" type="number" inputmode="numeric" autocomplete="off"/><button class="btn" id="wk-check">Prüfen</button></div><p id="wk-feedback" role="status" aria-live="polite"></p><div class="wk-actions"><button class="ghost" id="wk-hint">Zeig mir einen Tipp</button><button class="ghost" id="wk-show">Zeig es mir</button><button class="btn" id="wk-next">Neue Aufgabe</button></div></div><p class="wk-progress" id="wk-progress"></p></section>`;
  const el=id=>root.querySelector('#'+id);
  const dots=(n)=>Array.from({length:n},(_,i)=>`<span class="wk-dot" aria-hidden="true"></span>`).join('');
  function visual(reveal=false) {
    if(mode==='punkte') return `<div class="wk-dotset" aria-label="${task.a} Punkte">${dots(task.a)}</div><strong>+</strong><div class="wk-dotset second" aria-label="${task.b} Punkte">${dots(task.b)}</div>${reveal?`<p>Zusammen sind es <b>${task.answer}</b> Punkte.</p>`:''}`;
    if(mode==='zahlenstrahl') {
      const marks=[];for(let n=0;n<=task.cap;n+=task.step){const active=n===task.a||reveal&&n===task.answer;marks.push(`<span class="wk-tick ${active?'active':''}">${n}</span>`)}
      return `<p>Gehe von ${task.a} aus nach rechts.</p><div class="wk-line">${marks.join('')}</div>${reveal?`<p>${task.a} + ${task.b} = <b>${task.answer}</b></p>`:''}`;
    }
    return `<div class="wk-money"><div>Du bezahlst: <b>${task.b} €</b><div class="wk-coins">${Array.from({length:task.b},()=>'<span aria-hidden="true">1€</span>').join('')}</div></div><div>Preis: <b>${task.a} €</b></div>${reveal?`<p>Rückgeld: <b>${task.answer} €</b></p>`:''}</div>`;
  }
  function next(){task=makeTask(mode,grade);attempts=0;hintUsed=false;ended=false;session++;el('wk-title').textContent=names[mode];el('wk-question').textContent=task.question;el('wk-visual').innerHTML=visual();el('wk-answer').value='';el('wk-feedback').textContent='';el('wk-answer').disabled=false;el('wk-check').disabled=false;el('wk-progress').textContent=`${solved} Aufgaben gelöst · ${session} Aufgaben angesehen. Du kannst jederzeit aufhören.`;}
  function check(){if(ended)return;const val=el('wk-answer').value;if(val.trim()===''){el('wk-feedback').textContent='Gib zuerst eine Zahl ein.';return;}attempts++;if(evaluateTask(task,val)){solved++;streak++;ended=true;logResult(true);el('wk-feedback').textContent=attempts>1?'Geschafft! Du hast einen Weg gefunden.':'Richtig gerechnet!';el('wk-visual').innerHTML=visual(true);el('wk-answer').disabled=true;el('wk-check').disabled=true;el('wk-progress').textContent=`${solved} Aufgaben gelöst. ${solved%5===0?'Fünf Aufgaben – eine gute Gelegenheit für eine Pause!':'Du kannst noch eine Aufgabe versuchen oder aufhören.'}`;}else{streak=0;el('wk-feedback').textContent=attempts===1?'Das passt noch nicht. Schau dir die Darstellung an und versuche es erneut.':task.hint;}}
  root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;root.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));next();}));
  el('wk-check').onclick=check;el('wk-answer').onkeydown=e=>{if(e.key==='Enter')check()};el('wk-hint').onclick=()=>{hintUsed=true;el('wk-feedback').textContent=task.hint};el('wk-show').onclick=()=>{if(ended)return;ended=true;hintUsed=true;logResult(false);el('wk-visual').innerHTML=visual(true);el('wk-feedback').textContent=`Eine mögliche Erklärung: ${task.hint} Die Lösung ist ${task.answer}. Versuch gleich eine ähnliche Aufgabe.`;el('wk-answer').disabled=true;el('wk-check').disabled=true};el('wk-next').onclick=next;el('wk-back').onclick=()=>go('#/map');root.querySelector('[data-mode="punkte"]').setAttribute('aria-pressed','true');next();
}
