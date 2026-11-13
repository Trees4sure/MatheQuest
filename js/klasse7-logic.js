// Klasse 7: nachvollziehbare, reproduzierbar testbare Aufgaben ohne Online-KI.
const R=(rand,a,b)=>a+Math.floor(rand()*(b-a+1));
export const TOPICS7 = [
 ['fraction-add','Brüche addieren','🥧'],['fraction-mul','Brüche multiplizieren','✖️'],
 ['fraction-div','Brüche dividieren','➗'],['negative','Rationale Zahlen','🌡️'],
 ['percent','Prozentrechnung','💯'],['ratio','Dreisatz und Zuordnungen','⚖️'],
 ['equation','Gleichungen','🔐'],['area','Flächen berechnen','📐']
];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const frac=(n,d)=>{const g=gcd(n,d);return {n:n/g,d:d/g};};
const ftext=f=>f.d===1?String(f.n):`${f.n}/${f.d}`;
const task=(topic,question,answer,steps,visual={})=>({topic,question,answer,hints:steps.slice(0,2),steps,visual});
export function create7(topic,level=1,rand=Math.random){
  const l=Math.max(1,Math.min(5,level));const n=(a,b)=>R(rand,a,b);
  const d1=n(2,3+l*2),d2=n(2,3+l*2),a=n(1,d1-1),b=n(1,d2-1);
  switch(topic){
  case 'fraction-add':{
    const sign=l>=3&&n(0,1)?-1:1, D=l<=2?d1:d1*d2, A=l<=2?a:a*d2,B=l<=2?n(1,d1-1):b*d1;
    const result=frac(A+sign*B,D),second={n:B,d:D};
    return task(topic,`Berechne ${A}/${D} ${sign===1?'+':'−'} ${B}/${D}. Kürze dein Ergebnis.`,result,[`Beide Brüche haben denselben Nenner ${D}.`,`Rechne die Zähler: ${A} ${sign===1?'+':'−'} ${B} = ${A+sign*B}.`,`Ergebnis: ${A+sign*B}/${D} = ${ftext(result)}.`],{kind:'fraction',num:A,den:D,more:B,op:sign===1?'+':'−'});
  }
  case 'fraction-mul':{
    const res=frac(a*b,d1*d2);
    return task(topic,`Multipliziere ${a}/${d1} · ${b}/${d2}.`,res,[`Multipliziere Zähler mit Zähler: ${a} · ${b} = ${a*b}.`,`Multipliziere Nenner mit Nenner: ${d1} · ${d2} = ${d1*d2}.`,`Gekürzt erhältst du ${ftext(res)}.`],{kind:'fraction',num:a,den:d1,more:b,secondDen:d2,op:'×'});
  }
  case 'fraction-div':{
    const res=frac(a*d2,d1*b);
    return task(topic,`Teile ${a}/${d1} : ${b}/${d2}.`,res,[`Teilen durch einen Bruch heißt: mit seinem Kehrwert multiplizieren.`,`Kehrwert von ${b}/${d2} ist ${d2}/${b}.`,`Ergebnis: ${a*d2}/${d1*b} = ${ftext(res)}.`],{kind:'fraction',num:a,den:d1,more:b,secondDen:d2,op:':'});
  }
  case 'negative':{
    const A=n(-5*l,5*l),B=n(-5*l,5*l),minus=l>=2&&n(0,1),r=minus?A-B:A+B;
    return task(topic,`Berechne (${A}) ${minus?'−':'+'} (${B}).`,r,[`Achte auf die Vorzeichen.`,`Bei Minus vor einer Klammer ändert sich das Vorzeichen in der Klammer.`,`Ergebnis: ${r}.`],{kind:'line',from:A,to:r});
  }
  case 'percent':{
    const pct=[10,20,25,50,75][n(0,Math.min(4,l))],base=n(2,3+l*2)*20,part=base*pct/100;
    return task(topic,`Ein Artikel kostet ${base} €. Wie viel sind ${pct} % davon?`,part,[`100 % sind ${base} €.`,`1 % sind ${base/100} €. Multipliziere mit ${pct}.`,`${pct} % von ${base} € sind ${part} €.`],{kind:'percent',pct});
  }
  case 'ratio':{
    const per=n(2,4+l),from=n(2,5+l),to=n(2,5+l),answer=to*per;
    return task(topic,`${from} Hefte kosten ${from*per} €. Wie viel kosten ${to} Hefte?`,answer,[`Berechne zuerst den Preis für ein Heft: ${from*per} € : ${from} = ${per} €.`,`Dann multipliziere mit der gesuchten Anzahl ${to}.`,`${to} · ${per} = ${answer} €.`],{kind:'groups',from,to,per});
  }
  case 'equation':{
    const X=n(1,4*l+4),m=n(2,2+l),c=n(-6,6),v=m*X+c;
    return task(topic,`Löse: ${m} · x ${c<0?'−':'+'} ${Math.abs(c)} = ${v}.`,X,[`Bringe zunächst ${c<0?'−':'+'} ${Math.abs(c)} auf die andere Seite.`,`Dann gilt: ${m} · x = ${m*X}.`,`Teile durch ${m}: x = ${X}.`],{kind:'equation',expr:`${m}x ${c<0?'-':'+'} ${Math.abs(c)} = ${v}`});
  }
  case 'area':{
    const w=n(3,3+l*2),h=n(2,3+l*2),A=w*h/2;
    return task(topic,`Ein Dreieck hat Grundseite ${w} cm und Höhe ${h} cm. Wie groß ist der Flächeninhalt in cm²?`,A,[`Ein Dreieck ist halb so groß wie ein Rechteck mit gleicher Grundseite und Höhe.`,`Formel: A = g · h : 2.`,`A = ${w} · ${h} : 2 = ${A} cm².`],{kind:'triangle',w,h});
  }
  default: throw Error('Unbekanntes Thema '+topic);
  }
}
export function isCorrect7(t,raw){
  const s=String(raw).trim().replace(/\s+/g,'');
  if(typeof t.answer==='object'){
    if(/^-?\d+\/\d+$/.test(s)){const [n,d]=s.split('/').map(Number);return d!==0&&n*t.answer.d===t.answer.n*d;}
    if(/^-?\d+(?:[,.]\d+)?$/.test(s)){const x=Number(s.replace(',','.'));return Math.abs(x-t.answer.n/t.answer.d)<1e-9;}
    return false;
  }
  if(!/^-?\d+(?:[,.]\d+)?$/.test(s))return false;
  return Math.abs(Number(s.replace(',','.'))-t.answer)<1e-8;
}
