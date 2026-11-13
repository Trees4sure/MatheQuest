// Rechenbach-Kampagne: altersgerechte, deterministisch prüfbare Rechengeschichten.
// Jedes Kapitel hat eine eigene Abfolge aus Rechenart UND Mitmach-Form (tippen, auf Steine springen,
// Felder füllen, verteilen, vergleichen, auswählen) – kein Kapitel gleicht dem anderen.
// item = zählbare Dinge (bis 100), bulk = Menge für große Zahlen, damit die Geschichten glaubwürdig bleiben.
export const CHAPTERS = [
 {id:'w1',name:'Auf dem Bauernhof',short:'Bauernhof',person:'Frau Hoppe',item:'Eier',icon:'🥚',img:'assets/items/ei.webp',bulk:'Kilogramm Heu',pack:'Kartons',packIn:'In jedem Karton',into:'in jeden Karton',gone:'werden zur Bäckerei gebracht',goneBulk:'werden verfüttert',x:23,y:76,intro:'Das Dorffest rückt näher. Frau Hoppe braucht Hilfe beim Packen für den Kuchenstand.',end:'Die Eier sind sicher verpackt. Frau Hoppe bringt sie zur Bäckerei.',reward:'Hofhelfer',
  seq:[['add','number'],['sub','line'],['missing','fill'],['compare','compare'],['add','choice']]},
 {id:'w2',name:'Duft aus der Bäckerei',short:'Bäckerei',person:'Bäckerin Mehl',item:'Brötchen',icon:'🥨',img:'assets/items/brot.webp',bulk:'Gramm Mehl',pack:'Tüten',packIn:'In jeder Tüte',into:'in jede Tüte',gone:'werden verkauft',goneBulk:'werden verbacken',x:23,y:34,intro:'In der Backstube duftet es schon. Hilf beim Vorbereiten des Festbuffets.',end:'Das Gebäck ist fertig. Jetzt können die Gäste mit dem Zug kommen.',reward:'Backstubenprofi',
  seq:[['mul','number'],['div','split'],['add','line'],['compare','compare'],['sub','choice']]},
 {id:'w3',name:'Gäste am Bahnhof',short:'Bahnhof',person:'Schaffner Schulz',item:'Fahrkarten',icon:'🎫',img:'assets/items/fahrkarte.webp',bulk:'Sitzplätze',pack:'Umschläge',packIn:'In jedem Umschlag',into:'in jeden Umschlag',gone:'werden verkauft',goneBulk:'werden besetzt',x:54,y:22,intro:'Die ersten Festgäste sind unterwegs. Am kleinen Bahnhof wird jede helfende Hand gebraucht.',end:'Alle Gäste haben ihre Fahrkarten. Der Weg zum Fest ist frei.',reward:'Bahnhofshelfer',
  seq:[['sub','number'],['add','line'],['compare','compare'],['missing','choice'],['mul','number']]},
 {id:'w4',name:'Gemeinsam anpacken',short:'Feuerwehr',person:'Feuerwehrfrau Fiete',item:'Trinkflaschen',icon:'💧',img:'assets/items/trinkflasche.webp',bulk:'Liter Wasser',pack:'Kisten',packIn:'In jeder Kiste',into:'in jede Kiste',gone:'werden ausgegeben',goneBulk:'werden verbraucht',x:85,y:32,intro:'Die Feuerwehr sorgt beim Fest für Trinkwasser. Bereite die Vorräte für die Helfer vor.',end:'Das Wasser steht bereit. Fiete bedankt sich für deine Unterstützung.',reward:'Wasserwächter',
  seq:[['missing','fill'],['sub','number'],['mul','choice'],['add','line'],['div','split']]},
 {id:'w5',name:'Brumms Werkstatt',short:'Schreinerei',person:'Schreinermeister Brumm',item:'Bauklötze',icon:'🧱',img:'assets/items/bauklotz.webp',bulk:'Schrauben',pack:'Bausätze',packIn:'In jedem Bausatz',into:'in jeden Bausatz',gone:'werden verbaut',goneBulk:'werden verbaut',x:82,y:71,intro:'Brumm baut eine Spielecke für das Dorffest. Hilf ihm, die Bauteile vorzubereiten.',end:'Die Bausätze sind fertig. Brumm stellt die Spielecke auf dem Dorfplatz auf.',reward:'Werkstattprofi',
  seq:[['compare','compare'],['mul','number'],['sub','line'],['div','choice'],['missing','number']]},
 {id:'w6',name:'Unser großes Dorffest',short:'Dorfplatz',person:'Bürgermeisterin Nolte',item:'Kuchenstücke',icon:'🍰',img:'assets/items/kuchenstueck.webp',bulk:'Lose',pack:'Teller',packIn:'Auf jedem Teller',into:'auf jeden Teller',gone:'werden serviert',goneBulk:'werden verkauft',x:53,y:49,intro:'Die Wimpel hängen, die Gäste sind da. Nur der Kuchenstand wartet noch auf deine Hilfe.',end:'Geschafft! Rechenbach feiert. Du hast an allen sechs Orten geholfen.',reward:'Dorffestfreund',
  seq:[['div','split'],['add','choice'],['mul','number'],['sub','number'],['missing','fill']]}
];
// Ab Klasse 5 rechnen alle Kapitel mit denselben Themen, aber in je eigener Reihenfolge.
const UPPER={5:['frac','decimal','missing','mul','area'],6:['frac','percent','decimal','ratio','area'],7:['frac','percent','decimal','equation','area']};
export const MODES=['number','line','fill','split','compare','choice'];
const PACK_SIZES=[6,10,12,15,20,24,25]; // übliche Packungsgrößen statt beliebiger Zahlen
const rnd=(a,b,rng)=>a+Math.floor(rng()*(b-a+1));
const r2=n=>Math.round(n*100)/100;
export const fmt=n=>String(r2(n)).replace('.',',');
export const fmtMoney=n=>r2(n).toFixed(2).replace('.',','); // Preise immer mit zwei Nachkommastellen

// Rechenart und Mitmach-Form für einen Auftrag. Klasse 1 kennt noch kein Mal und Geteilt.
export function stepPlan(id,step,grade){
 const index=Math.max(0,CHAPTERS.findIndex(c=>c.id===id)),c=CHAPTERS[index];
 // Fünf Themen, sechs Kapitel: die ersten fünf verschieben die Reihenfolge, das sechste dreht sie um.
 if(grade>=5)return index<5?[UPPER[grade][(step+index)%5],step===(index+2)%5?'choice':'number']:[UPPER[grade][4-step],step===1?'choice':'number'];
 let [op,mode]=c.seq[step];
 if(grade===1){if(op==='mul')op='add';if(op==='div'){op='sub';if(mode==='split')mode='line';}}
 return [op,mode];
}
const TITLES={add:()=>'Alles zusammenzählen',sub:()=>'Den Vorrat prüfen',missing:()=>'Die Bestellung ergänzen',compare:()=>'Zwei Lieferungen vergleichen',mul:c=>`${c.pack} packen`,div:()=>'Gerecht verteilen',frac:()=>'Einen Anteil abmessen',decimal:()=>'Die Kasse rechnen',percent:()=>'Für die Helfer zurücklegen',ratio:()=>'Eintrittskarten berechnen',equation:()=>'Den Bestellzettel lösen',area:()=>'Den Platz ausmessen'};
export const stepTitles=(c,grade)=>[0,1,2,3,4].map(step=>TITLES[stepPlan(c.id,step,grade)[0]](c));

export const chapterCount=p=>CHAPTERS.filter(c=>p.campaign?.chapters?.[c.id]?.completed).length;
export const nextChapter=p=>CHAPTERS.find(c=>!p.campaign?.chapters?.[c.id]?.completed)||CHAPTERS[5];

// Zwei plausible falsche Antworten neben der richtigen, in zufälliger Reihenfolge.
function makeOptions(answer,stepSize,rng){
 const pool=[1,-1,2,-2,10,-10].map(k=>r2(answer+k*stepSize)).filter((v,i,all)=>v>=0&&v!==answer&&all.indexOf(v)===i);
 const wrong=[];
 while(wrong.length<2&&pool.length)wrong.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);
 const options=[...wrong];options.splice(Math.floor(rng()*3),0,answer);
 return options;
}

/* prev = Ergebnisse der bisherigen Aufträge dieses Kapitels (Lieferschein). Der letzte Auftrag rechnet damit weiter. */
export function createJourneyTask(id,step,grade=1,level=1,rng=Math.random,prev=[]){
 let chain=null;
 const c=CHAPTERS.find(c=>c.id===id)||CHAPTERS[0];
 grade=Math.max(1,Math.min(7,Number(grade)||1));level=Math.max(1,Math.min(5,Number(level)||1));step=Math.max(0,Math.min(4,step));
 let [op,mode]=stepPlan(c.id,step,grade);
 let a,b,answer,question,explain,hints,visual,unit='',type='number',optionStep=1;
 if(['add','sub','missing','compare'].includes(op)){
  const max=grade===1?(level<3?10:20):grade===2?100:grade===3?1000:10000;
  const scale=grade<=2?1:grade===3?10:100;
  optionStep=scale;
  a=rnd(2,Math.floor(max/scale/2),rng)*scale;b=rnd(1,Math.floor((max-a)/scale),rng)*scale;
  /* Verkettung: Zahlen vom Lieferschein, aber nur wenn sie in den Zahlenraum der Klasse passen. */
  if(step===4&&grade<=4){
   const ok=prev.filter(n=>Number.isInteger(n)&&n>0&&n%scale===0).reverse();
   if(op==='add'){for(let i=0;i<ok.length&&!chain;i++)for(let j=i+1;j<ok.length&&!chain;j++)if(ok[i]+ok[j]<=max){a=ok[i];b=ok[j];chain=[a,b];}}
   else if(op==='missing'){const v=ok.find(n=>n+b<=max&&n>=2*scale);if(v!==undefined){a=v;chain=[a];}}
   else if(op==='sub'){const v=ok.find(n=>n>=2*scale);if(v!==undefined){b=Math.max(scale,Math.min(b,v-scale));a=v-b;chain=[v];}}
  }
  // Große Zahlen bekommen eine Menge, zu der sie passen (Heu, Mehl, Wasser …) statt Tausender von Eiern.
  // Einzahl beachten: „1 kommt dazu“, „1 wird verkauft“.
  const X=a+b>100?c.bulk:c.item,gone=(a+b>100?c.goneBulk:c.gone).replace(/^werden/,b===1?'wird':'werden');
  if(op==='add'){answer=a+b;question=`Es sind ${a} ${X} bereit. ${b} ${b===1?'kommt':'kommen'} dazu. Wie viele sind es zusammen?`;explain=`${a} + ${b} = ${answer}. Zähle beide Mengen zusammen.`;visual={kind:'add',a,b};hints=['Die zweite Menge kommt dazu. Rechne plus.',`Starte bei ${a} und zähle ${b} weiter.`];}
  else if(op==='sub'){answer=a;a+=b;question=`${a} ${X} sind da. ${b} ${gone}. Wie viele bleiben übrig?`;explain=`${a} − ${b} = ${answer}. Ziehe die Menge ab, die weggeht.`;visual={kind:'sub',a,b};hints=['Ein Teil geht weg. Rechne minus.',`Starte bei ${a} und gehe ${b} zurück.`];}
  else if(op==='missing'){answer=b;question=`Wir brauchen ${a+b} ${X}. ${a} sind schon da. Wie viele fehlen noch?`;explain=`${a+b} − ${a} = ${b}. Kontrolle: ${a} + ${b} = ${a+b}.`;visual={kind:'missing',a,total:a+b};hints=['Gesucht ist der Unterschied zwischen Ziel und Vorrat.',`Zähle von ${a} bis ${a+b} weiter.`];}
  else{
   if(rng()<0.15)b=a;
   const Y=Math.max(a,b)>100?c.bulk:c.item;
   answer=a===b?'=':a<b?'<':'>';type='choice';
   question=`In der ersten Lieferung sind ${a} ${Y}, in der zweiten ${b}. Welches Zeichen passt zwischen die beiden Zahlen?`;
   explain=`${a} ${answer} ${b}. ${a===b?'Beide Lieferungen sind gleich groß.':`${Math.max(a,b)} ist mehr als ${Math.min(a,b)}. Die offene Seite des Zeichens zeigt zur größeren Zahl.`}`;
   visual={kind:'compare',a,b};hints=['Welche Lieferung ist größer? Vergleiche zuerst die vorderste Stelle.','Die offene Seite von < oder > zeigt immer zur größeren Zahl.'];
  }
 }else if(op==='mul'||op==='div'){
  a=grade===2?[2,5,10][rnd(0,2,rng)]:rnd(2,grade===3?9:12,rng);
  b=grade<=3?rnd(2,10,rng):PACK_SIZES[rnd(0,PACK_SIZES.length-1,rng)];
  if(op==='mul'){answer=a*b;question=`${c.packIn} liegen ${b} ${c.item}. Es gibt ${a} ${c.pack}. Wie viele ${c.item} sind es insgesamt?`;explain=`${a} · ${b} = ${answer}. Nimm die ${b} genau ${a}-mal.`;visual={kind:'array',a,b};hints=['Gleich große Gruppen kannst du malnehmen.',`Addiere die Zahl ${b} insgesamt ${a}-mal.`];}
  else{answer=b;question=`Verteile ${a*b} ${c.item} gleichmäßig auf ${a} ${c.pack}. Wie viele kommen ${c.into}?`;explain=`${a*b} : ${a} = ${b}. Es kommen ${b} ${c.into}.`;visual={kind:'divide',a,total:a*b};hints=['Teilen heißt: gleich große Gruppen bilden.',`Welche Zahl ergibt mal ${a} genau ${a*b}?`];}
 }else if(op==='frac'){
  const den=[2,3,4,5,8][rnd(0,4,rng)],num=rnd(1,den-1,rng),part=rnd(2,12,rng);a=part*den;b=num;answer=part*num;
  question=`Es gibt ${a} ${c.item}. ${num}/${den} davon ${num===1?'wird':'werden'} für das Fest gebraucht. Wie viele sind das?`;explain=`${a} : ${den} = ${part}. Das ist ein Teil. ${part} · ${num} = ${answer}.`;hints=[`Teile die ganze Menge in ${den} gleich große Gruppen.`,`Nimm dann ${num} dieser Gruppen.`];visual={kind:'fraction',den,num,total:a};
 }else if(op==='decimal'){
  a=rnd(100,1500,rng);b=rnd(100,1000,rng);answer=(a+b)/100;unit='€';optionStep=0.1;question=`Zwei Bestellungen kosten ${fmtMoney(a/100)} € und ${fmtMoney(b/100)} €. Wie viel kosten sie zusammen?`;explain=`${a} + ${b} = ${a+b} Cent. Das sind ${fmtMoney(answer)} €.`;hints=['Schreibe Euro unter Euro und Cent unter Cent.','Rechne zuerst beide Preise in Cent um.'];visual={kind:'prices',a:a/100,b:b/100};
 }else if(op==='percent'){
  a=rnd(2,20,rng)*20;b=[5,10,20,25,50][rnd(0,4,rng)];answer=a*b/100;question=`Es gibt ${a} ${a>100?c.bulk:c.item}. ${b} % davon sind für die Helfer reserviert. Wie viele sind das?`;explain=`1 % sind ${fmt(a/100)}. ${b} % sind ${fmt(a/100)} · ${b} = ${answer}.`;hints=['Prozent heißt „von hundert“.',`Teile ${a} durch 100 und nimm das Ergebnis mal ${b}.`];visual={kind:'percent',a,b};
 }else if(op==='ratio'){
  a=rnd(2,8,rng);b=rnd(2,8,rng);const price=rnd(2,6,rng);answer=b*price;unit='€';question=`${a} Eintrittskarten kosten ${a*price} €. Wie viel kosten ${b} Karten zum gleichen Stückpreis?`;explain=`Eine Karte: ${a*price} : ${a} = ${price} €. ${b} Karten: ${b} · ${price} = ${answer} €.`;hints=['Rechne zuerst den Preis für eine Karte aus.','Multipliziere den Einzelpreis mit der neuen Kartenanzahl.'];visual={kind:'ratio',a,b,total:a*price};
 }else if(op==='equation'){
  answer=rnd(2,15,rng);a=rnd(2,8,rng);b=rnd(2,20,rng);const total=a*answer+b;question=`Auf dem Bestellzettel steht: ${a} · x + ${b} = ${total}. Welche Zahl ist x?`;explain=`Ziehe ${b} ab: ${a} · x = ${total-b}. Teile durch ${a}: x = ${answer}.`;hints=['Mache die Addition zuerst rückgängig.','Teile dann beide Seiten durch die Zahl vor x.'];visual={kind:'equation',a,b,total};
 }else{
  a=rnd(3,12,rng);b=rnd(2,9,rng);answer=a*b;unit='m²';question=`Ein rechteckiger Platz ist ${a} m lang und ${b} m breit. Wie groß ist seine Fläche in m²?`;explain=`Fläche = Länge · Breite = ${a} · ${b} = ${answer} m².`;hints=['Fläche meint das Innere, nicht den Rand.',`Es gibt ${b} Reihen mit je ${a} Quadratmetern.`];visual={kind:'area',a,b};
 }
 // Mitmach-Formen nur dort, wo sie auf den Bildschirm und zu den Zahlen passen – sonst eintippen.
 // Passt der Zahlenweg nicht, wird ausgewählt statt getippt – so bleibt auch mit großen Zahlen Abwechslung.
 if(mode==='line'&&!(['add','sub'].includes(op)&&Math.max(a,answer)<=20))mode='choice';
 if(mode==='fill'&&!(op==='missing'&&a+b<=20))mode='number';
 if(mode==='split'&&!(op==='div'&&a*b<=36&&a<=6))mode='number';
 if(chain)question='Vom Lieferschein: '+question;
 const task={id:`${id}-${step}-${grade}-${Math.floor(rng()*1e9)}`,op,mode,a,b,answer,unit,type,question,explain,hints,visual,grade,level,skill:`reise-k${grade}-${op}`,chain};
 if(mode==='choice')task.options=makeOptions(answer,optionStep,rng);
 return task;
}
export function awardStep(p,id,taskId){
 p.campaign||={chapters:{}};p.campaign.chapters||={};
 const s=p.campaign.chapters[id]||={step:0,done:false,completed:false,claimed:[]};s.claimed||=[];
 if(s.claimed.includes(taskId)||s.step>=5)return false;
 s.claimed.push(taskId);s.claimed=s.claimed.slice(-50);s.step++;s.task=null;
 if(s.step===5){s.done=true;s.completed=true;}
 return true;
}
