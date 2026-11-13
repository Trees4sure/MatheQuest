// Ein gemeinsamer Denkzettel je Profil. Keine Verbindung zur Antwortbewertung.
import {current,save} from './store.js';

const MAX_POINTS=20000, MAX_STROKES=300;
function clean(value={}) {
  const n={text:typeof value?.text==='string'?value.text.slice(0,20000):'',mode:value?.mode==='draw'?'draw':'text',
    // Standardmäßig zugeklappt: Aufgeklappt schob der Zettel das Antwortfeld anderthalb Bildschirme nach unten.
    // Neuer Feldname, damit das früher automatisch gespeicherte „offen“ nicht weiterwirkt.
    open:value?.shown===true,shown:value?.shown===true,strokes:[]};
  let count=0;
  for(const line of (Array.isArray(value?.strokes)?value.strokes:[]).slice(0,MAX_STROKES)){
    if(!Array.isArray(line))continue;
    const points=line.filter(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1)).slice(0,MAX_POINTS-count);
    if(points.length)n.strokes.push(points);
    count+=points.length;if(count>=MAX_POINTS)break;
  }
  return n;
}

export function installNotebook(root){
  let active=null;
  // Diese stabilen Antwortbereiche decken Kampagne, Lernorte, Erkundung,
  // Klasse-7-Labor, Werkstatt und klassische Trainingsrunden ab.
  const targets='[data-form],.rm-response,.ex-label,.wk-input,.answer[data-ans]';
  const find=()=>root.querySelector(targets);
  function sync(){
    const anchor=find(),profile=current();
    if(active?.anchor===anchor&&active?.profile===profile&&active?.node.isConnected)return;
    active?.dispose();active=null;
    if(anchor&&profile)active=mount(anchor,profile);
  }
  const observer=new MutationObserver(sync);
  observer.observe(root,{childList:true,subtree:true});sync();
  return ()=>{observer.disconnect();active?.dispose();};
}

function mount(anchor,profile){
  const n=clean(profile.notebook);profile.notebook=n;
  const node=document.createElement('details');node.className='notebook';node.open=n.open;
  node.innerHTML=`<summary><span>✎ Mein Denkzettel</span><small>Platz für deinen Rechenweg</small></summary>
    <div class="np-body"><p class="np-intro">Probiere, schreibe und rechne in Ruhe. Nur deine Antwort darunter wird geprüft.</p>
    <div class="np-tabs" role="group" aria-label="Denkzettel verwenden"><button type="button" data-np-mode="text">Tippen</button><button type="button" data-np-mode="draw">Mit Finger oder Stift schreiben</button></div>
    <label class="np-text"><span>Meine Notizen und Nebenrechnungen</span><textarea data-np-text rows="5" maxlength="20000" spellcheck="false" autocomplete="off" placeholder="Hier ist Platz für deinen Rechenweg …"></textarea></label>
    <div class="np-drawing" hidden><p>Schreibe mit Finger, Stift oder Maus auf das karierte Blatt. Außerhalb des Blatts kannst du die Seite verschieben.</p><canvas aria-label="Karierter Denkzettel zum freien Schreiben. Alternativ kannst du deine Notizen im Bereich Tippen eingeben."></canvas><span class="np-strokes"></span></div>
    <div class="np-tools"><button type="button" data-np-undo>Letzten Strich zurück</button><button type="button" data-np-clear>Neues leeres Blatt</button></div>
    <p class="np-status" role="status"></p><small class="np-memory">Dein Blatt bleibt beim Aufgabenwechsel erhalten. Mit „Neues leeres Blatt“ fängst du neu an.</small></div>`;
  anchor.before(node);
  const q=s=>node.querySelector(s),area=q('textarea'),canvas=q('canvas'),ctx=canvas.getContext('2d');
  area.value=n.text;
  let drawing=null,pointer=null,backup=null,disposed=false;
  const pointCount=()=>n.strokes.reduce((s,line)=>s+line.length,0);
  function persist(){profile.notebook=n;const ok=save();q('.np-status').textContent=ok===false?'Speichern auf diesem Gerät ist gerade nicht möglich. Lass diese Seite geöffnet.':'Auf diesem Gerät gespeichert · wird nicht bewertet';}
  function render(){
    const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height||!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#fffef8';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#dce6db';ctx.lineWidth=1;
    for(let x=20;x<w;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=20;y<h;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.strokeStyle='#253e36';ctx.fillStyle='#253e36';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';
    for(const line of [...n.strokes,...(drawing?[drawing]:[])]){
      if(line.length===1){ctx.beginPath();ctx.arc(line[0][0]*w,line[0][1]*h,1.5,0,Math.PI*2);ctx.fill();continue;}
      ctx.beginPath();line.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke();
    }
  }
  function controls(){
    q('.np-text').hidden=n.mode!=='text';q('.np-drawing').hidden=n.mode!=='draw';
    node.querySelectorAll('[data-np-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.npMode===n.mode)));
    q('[data-np-undo]').textContent=backup?'Leeres Blatt rückgängig':'Letzten Strich zurück';
    q('[data-np-undo]').hidden=!backup&&n.mode!=='draw';
    q('[data-np-undo]').disabled=!backup&&!n.strokes.length;
    q('.np-strokes').textContent=`${n.strokes.length} ${n.strokes.length===1?'Strich':'Striche'} auf deinem Blatt`;
    render();
  }
  const pos=e=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
  function end(){if(!drawing)return;n.strokes.push(drawing);drawing=null;pointer=null;persist();controls();}
  canvas.addEventListener('pointerdown',e=>{
    if(pointer!==null||!e.isPrimary||e.button!==0)return;
    if(n.strokes.length>=MAX_STROKES||pointCount()>=MAX_POINTS){q('.np-status').textContent='Dein Zeichenblatt ist voll. Beginne ein neues Blatt oder nutze den Bereich Tippen.';return;}
    e.preventDefault();backup=null;pointer=e.pointerId;drawing=[pos(e)];canvas.setPointerCapture(pointer);render();
  });
  canvas.addEventListener('pointermove',e=>{
    if(e.pointerId!==pointer||!drawing)return;e.preventDefault();
    if(pointCount()+drawing.length>=MAX_POINTS)return;
    const p=pos(e),last=drawing.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])<.002)return;
    drawing.push(p);render();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===pointer)end();});
  area.addEventListener('input',()=>{n.text=area.value;backup=null;persist();controls();});
  // Klassische Runden hören auf Tastaturereignisse am Fenster. Notizen dürfen
  // weder Ziffern in die Antwort schreiben noch mit Enter eine Prüfung auslösen.
  node.addEventListener('keydown',e=>e.stopPropagation());
  node.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.npMode){end();n.mode=b.dataset.npMode;persist();controls();}
    if(b.hasAttribute('data-np-clear')){end();backup={text:n.text,strokes:n.strokes};n.text='';n.strokes=[];area.value='';persist();controls();}
    if(b.hasAttribute('data-np-undo')){end();if(backup){n.text=backup.text;n.strokes=backup.strokes;area.value=n.text;backup=null;}else n.strokes.pop();persist();controls();}
  });
  node.addEventListener('toggle',()=>{if(disposed)return;n.open=n.shown=node.open;persist();controls();});
  const resize=new ResizeObserver(render);resize.observe(canvas);
  const hide=()=>end();window.addEventListener('pagehide',hide);
  q('.np-status').textContent='Notizen bleiben auf diesem Gerät · werden nicht bewertet';controls();
  return {anchor,profile,node,dispose(){disposed=true;end();resize.disconnect();window.removeEventListener('pagehide',hide);node.remove();}};
}
