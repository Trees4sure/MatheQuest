// Rechenbach-Kampagne: altersgerechte, deterministisch prüfbare Rechengeschichten.
export const CHAPTERS = [
 {id:'w1',name:'Auf dem Bauernhof',short:'Bauernhof',person:'Frau Hoppe',item:'Eier',icon:'🥚',x:23,y:76,intro:'Das Dorffest rückt näher. Frau Hoppe braucht Hilfe beim Packen für den Kuchenstand.',steps:['Die Körbe zählen','Vorräte prüfen','Die Bestellung ergänzen','Kisten packen','Alles bereitstellen'],end:'Die Eier sind sicher verpackt. Frau Hoppe bringt sie zur Bäckerei.',reward:'Hofhelfer'},
 {id:'w2',name:'Duft aus der Bäckerei',short:'Bäckerei',person:'Bäckerin Mehl',item:'Brötchen',icon:'🥨',x:23,y:34,intro:'In der Backstube duftet es schon. Hilf beim Vorbereiten des Festbuffets.',steps:['Die Bleche zählen','Die Auslage prüfen','Die Bestellung ergänzen','Tüten packen','Den Verkauf planen'],end:'Das Gebäck ist fertig. Jetzt können die Gäste mit dem Zug kommen.',reward:'Backstubenprofi'},
 {id:'w3',name:'Gäste am Bahnhof',short:'Bahnhof',person:'Schaffner Schulz',item:'Fahrkarten',icon:'🎫',x:54,y:22,intro:'Die ersten Festgäste sind unterwegs. Am kleinen Bahnhof wird jede helfende Hand gebraucht.',steps:['Fahrkarten zählen','Vorräte prüfen','Die Bestellung ergänzen','Umschläge packen','Die Ankunft vorbereiten'],end:'Alle Gäste haben ihre Fahrkarten. Der Weg zum Fest ist frei.',reward:'Bahnhofshelfer'},
 {id:'w4',name:'Gemeinsam anpacken',short:'Feuerwehr',person:'Feuerwehrfrau Fiete',item:'Trinkflaschen',icon:'💧',x:85,y:32,intro:'Die Feuerwehr sorgt beim Fest für Trinkwasser. Bereite die Vorräte für die Helfer vor.',steps:['Die Vorräte zählen','Flaschen ausgeben','Den Vorrat ergänzen','Kisten packen','Die Versorgung prüfen'],end:'Das Wasser steht bereit. Fiete bedankt sich für deine Unterstützung.',reward:'Wasserwächter'},
 {id:'w5',name:'Brumms Werkstatt',short:'Schreinerei',person:'Schreinermeister Brumm',item:'Holzklötze',icon:'🪵',x:82,y:71,intro:'Brumm baut eine Spielecke für das Dorffest. Hilf ihm, die Bauteile vorzubereiten.',steps:['Das Holz zählen','Bauteile abgeben','Die Bestellung ergänzen','Bausätze packen','Die Spielecke planen'],end:'Die Bausätze sind fertig. Brumm stellt die Spielecke auf dem Dorfplatz auf.',reward:'Werkstattprofi'},
 {id:'w6',name:'Unser großes Dorffest',short:'Dorfplatz',person:'Bürgermeisterin Nolte',item:'Kuchenstücke',icon:'🍰',x:53,y:49,intro:'Die Wimpel hängen, die Gäste sind da. Nur der Kuchenstand wartet noch auf deine Hilfe.',steps:['Die Kuchenstücke zählen','Kuchen servieren','Das Buffet ergänzen','Teller vorbereiten','Den Feststand eröffnen'],end:'Geschafft! Rechenbach feiert. Du hast an allen sechs Orten geholfen.',reward:'Dorffestfreund'}
];
const rnd=(a,b,rng)=>a+Math.floor(rng()*(b-a+1));
export const fmt=n=>String(Math.round(n*100)/100).replace('.',',');
export const chapterCount=p=>CHAPTERS.filter(c=>p.campaign?.chapters?.[c.id]?.completed).length;
export const nextChapter=p=>CHAPTERS.find(c=>!p.campaign?.chapters?.[c.id]?.completed)||CHAPTERS[5];
export function createJourneyTask(id,step,grade=1,level=1,rng=Math.random){
 const c=CHAPTERS.find(c=>c.id===id)||CHAPTERS[0];
 grade=Math.max(1,Math.min(7,Number(grade)||1));level=Math.max(1,Math.min(5,Number(level)||1));step=Math.max(0,Math.min(4,step));
 let op=['add','sub','missing','mul','div'][step];
 if(grade===1&&step>2)op=step===3?'add':'sub';
 if(grade===5)op=['frac','decimal','missing','mul','area'][step];
 if(grade>=6)op=['frac','percent','decimal',grade===7?'equation':'ratio','area'][step];
 let a,b,answer,question,explain,hints,visual,unit='';
 if(['add','sub','missing'].includes(op)){
  const max=grade===1?(level<3?10:20):grade===2?100:grade===3?1000:10000;
  const scale=grade<=2?1:grade===3?10:100;
  a=rnd(2,Math.floor(max/scale/2),rng)*scale;b=rnd(1,Math.floor((max-a)/scale),rng)*scale;
  if(op==='add'){answer=a+b;question=`Es sind ${a} ${c.item} bereit. ${b} kommen dazu. Wie viele sind es zusammen?`;explain=`${a} + ${b} = ${answer}. Zähle beide Mengen zusammen.`;visual={kind:'add',a,b};hints=['Die zweite Menge kommt dazu. Rechne plus.',`Starte bei ${a} und zähle ${b} weiter.`];}
  else if(op==='sub'){answer=a;a+=b;question=`${a} ${c.item} sind da. ${b} werden gebraucht. Wie viele bleiben übrig?`;explain=`${a} − ${b} = ${answer}. Ziehe die gebrauchte Menge ab.`;visual={kind:'sub',a,b};hints=['Ein Teil wird weggenommen. Rechne minus.',`Starte bei ${a} und gehe ${b} zurück.`];}
  else{answer=b;question=`Wir brauchen ${a+b} ${c.item}. ${a} sind schon da. Wie viele fehlen noch?`;explain=`${a+b} − ${a} = ${b}. Kontrolle: ${a} + ${b} = ${a+b}.`;visual={kind:'missing',a,total:a+b};hints=['Gesucht ist der Unterschied zwischen Ziel und Vorrat.',`Zähle von ${a} bis ${a+b} weiter.`];}
 }else if(op==='mul'||op==='div'){
  a=grade===2?[2,5,10][rnd(0,2,rng)]:rnd(2,grade===3?9:12,rng);b=rnd(2,grade<=3?10:20,rng);
  if(op==='mul'){answer=a*b;question=`In jeder Gruppe liegen ${b} ${c.item}. Es gibt ${a} gleich große Gruppen. Wie viele sind es insgesamt?`;explain=`${a} · ${b} = ${answer}. Nimm die Gruppengröße ${a}-mal.`;visual={kind:'array',a,b};hints=['Gleich große Gruppen kannst du malnehmen.',`Addiere die Zahl ${b} insgesamt ${a}-mal.`];}
  else{answer=b;question=`Verteile ${a*b} ${c.item} gleichmäßig auf ${a} Gruppen. Wie viele kommen in jede Gruppe?`;explain=`${a*b} : ${a} = ${b}. Jede Gruppe bekommt ${b}.`;visual={kind:'divide',a,total:a*b};hints=['Teilen heißt: gleich große Gruppen bilden.',`Welche Zahl ergibt mal ${a} genau ${a*b}?`];}
 }else if(op==='frac'){
  const den=[2,3,4,5,8][rnd(0,4,rng)],num=rnd(1,den-1,rng),part=rnd(2,12,rng);a=part*den;b=num;answer=part*num;
  question=`${num}/${den} von ${a} ${c.item} werden für das Fest gebraucht. Wie viele sind das?`;explain=`${a} : ${den} = ${part}. Das ist ein Teil. ${part} · ${num} = ${answer}.`;hints=[`Teile die ganze Menge in ${den} gleich große Gruppen.`,`Nimm dann ${num} dieser Gruppen.`];visual={kind:'fraction',den,num,total:a};
 }else if(op==='decimal'){
  a=rnd(100,1500,rng);b=rnd(100,1000,rng);answer=(a+b)/100;unit='€';question=`Zwei Bestellungen kosten ${fmt(a/100)} € und ${fmt(b/100)} €. Wie viel kosten sie zusammen?`;explain=`${a} + ${b} = ${a+b} Cent. Das sind ${fmt(answer)} €.`;hints=['Schreibe Euro unter Euro und Cent unter Cent.','Rechne zuerst beide Preise in Cent um.'];visual={kind:'prices',a:a/100,b:b/100};
 }else if(op==='percent'){
  a=rnd(2,20,rng)*20;b=[5,10,20,25,50][rnd(0,4,rng)];answer=a*b/100;question=`${b} % von ${a} ${c.item} sind für die Helfer reserviert. Wie viele sind das?`;explain=`1 % sind ${fmt(a/100)}. ${b} % sind ${fmt(a/100)} · ${b} = ${answer}.`;hints=['Prozent heißt „von hundert“.',`Teile ${a} durch 100 und nimm das Ergebnis mal ${b}.`];visual={kind:'percent',a,b};
 }else if(op==='ratio'){
  a=rnd(2,8,rng);b=rnd(2,8,rng);const price=rnd(2,6,rng);answer=b*price;unit='€';question=`${a} Eintrittskarten kosten ${a*price} €. Wie viel kosten ${b} Karten zum gleichen Stückpreis?`;explain=`Eine Karte: ${a*price} : ${a} = ${price} €. ${b} Karten: ${b} · ${price} = ${answer} €.`;hints=['Rechne zuerst den Preis für eine Karte aus.','Multipliziere den Einzelpreis mit der neuen Kartenanzahl.'];visual={kind:'ratio',a,b,total:a*price};
 }else if(op==='equation'){
  answer=rnd(2,15,rng);a=rnd(2,8,rng);b=rnd(2,20,rng);const total=a*answer+b;question=`Auf dem Bestellzettel steht: ${a} · x + ${b} = ${total}. Welche Zahl ist x?`;explain=`Ziehe ${b} ab: ${a} · x = ${total-b}. Teile durch ${a}: x = ${answer}.`;hints=['Mache die Addition zuerst rückgängig.','Teile dann beide Seiten durch die Zahl vor x.'];visual={kind:'equation',a,b,total};
 }else{
  a=rnd(3,12,rng);b=rnd(2,9,rng);answer=a*b;unit='m²';question=`Ein rechteckiger Platz ist ${a} m lang und ${b} m breit. Wie groß ist seine Fläche in m²?`;explain=`Fläche = Länge · Breite = ${a} · ${b} = ${answer} m².`;hints=['Fläche meint das Innere, nicht den Rand.',`Es gibt ${b} Reihen mit je ${a} Quadratmetern.`];visual={kind:'area',a,b};
 }
 return {id:`${id}-${step}-${grade}-${Math.floor(rng()*1e9)}`,op,a,b,answer,unit,type:'number',question,explain,hints,visual,grade,level,skill:`reise-k${grade}-${op}`};
}
export function awardStep(p,id,taskId){
 p.campaign||={chapters:{}};p.campaign.chapters||={};
 const s=p.campaign.chapters[id]||={step:0,done:false,completed:false,claimed:[]};s.claimed||=[];
 if(s.claimed.includes(taskId)||s.step>=5)return false;
 s.claimed.push(taskId);s.claimed=s.claimed.slice(-50);s.step++;s.task=null;
 if(s.step===5){s.done=true;s.completed=true;}
 return true;
}
