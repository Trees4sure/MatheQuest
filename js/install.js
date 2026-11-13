// „App installieren“: Der Browser meldet mit beforeinstallprompt, dass er die Installation
// anbieten kann. Wir merken uns das Angebot und zeigen dafür einen eigenen Knopf.
// Ohne dieses Angebot (iPhone/iPad, Firefox) erklärt der Knopf den Weg über das Browser-Menü.
import {modal, toast} from './ui.js';

let offer = null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const refresh = () => document.querySelectorAll('[data-install]').forEach((b) => { b.hidden = standalone(); });

addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); offer = e; refresh(); });
addEventListener('appinstalled', () => { offer = null; refresh(); toast('MatheQuest ist installiert ✓'); });

// Knopf als HTML; verschwindet, wenn das Spiel schon als App läuft.
export const installButton = () => `<button class="v-share" data-install ${standalone() ? 'hidden' : ''}><span>📲</span>Als App installieren</button>`;

function explain() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const steps = ios
    ? '<p><b>iPhone / iPad:</b> In Safari unten auf „Teilen“ tippen (Kästchen mit Pfeil), dann „Zum Home-Bildschirm“.</p>'
    : '<p><b>Android:</b> Im Browser oben rechts das Menü ⋮ öffnen, dann „App installieren“ oder „Zum Startbildschirm hinzufügen“.</p><p><b>Computer:</b> In Chrome oder Edge das Installieren-Symbol rechts in der Adressleiste anklicken.</p>';
  modal(`<h2>MatheQuest installieren</h2>${steps}<p class="muted">Das geht nur über die Internetadresse des Spiels (https), nicht in einem privaten Fenster und nicht im Browser einer anderen App.</p><button class="btn big" data-close>Verstanden</button>`);
}

document.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-install]')) return;
  if (!offer) return explain();
  const o = offer; offer = null;
  o.prompt();
  await o.userChoice.catch(() => null);
  refresh();
});
