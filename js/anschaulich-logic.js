// Wiederholbare, deterministisch testbare Aufgaben für anschauliches Lernen.
export const MODES = ['punkte','zahlenstrahl','geld'];
const rand = (max, rng) => Math.floor(rng() * max);
export function makeTask(mode, grade=1, rng=Math.random) {
  const g=Math.max(1,Math.min(6,Number(grade)||1));
  if(mode==='punkte') {
    const cap=g===1?10:20;
    const a=1+rand(Math.floor(cap/2),rng), b=1+rand(cap-a,rng);
    return {mode,a,b,answer:a+b,cap,question:`${a} + ${b} = ?`,hint:`Lege zuerst ${a} Punkte und dann ${b} weitere dazu. Zähle alle Punkte.`};
  }
  if(mode==='zahlenstrahl') {
    const cap=g===1?20:g===2?100:100;
    const step=g===1?1:g===2?5:10;
    const a=rand(Math.floor(cap/step)-5,rng)*step;
    const delta=(1+rand(5,rng))*step;
    return {mode,a,b:delta,answer:a+delta,cap,step,question:`Starte bei ${a}. Gehe ${delta} weiter. Wo landest du?`,hint:`Beginne bei ${a} und gehe ${delta/step} Schritte zu je ${step} nach rechts.`};
  }
  if(mode==='geld') {
    const price=1+rand(g===1?9:19,rng), paid=price+1+rand(10,rng);
    return {mode,a:price,b:paid,answer:paid-price,cap:paid,question:`Ein Gegenstand kostet ${price} €. Du gibst ${paid} €. Wie viel Euro bekommst du zurück?`,hint:`Zähle von ${price} € bis ${paid} € weiter. Jeder Schritt ist 1 €.`};
  }
  throw new Error('Unbekannter Modus');
}
export function evaluateTask(task, value) { return Number.isInteger(Number(value)) && String(value).trim()!=='' && Number(value)===task.answer; }
