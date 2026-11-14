/* Ziehen und Legen mit Finger, Stift oder Maus (Pointer Events).
   Ziehbar ist jedes Element mit data-drag, Ziel jedes Element mit data-drop.
   Ein kurzes Antippen ohne Bewegung bleibt ein normaler Klick – so geht alles auch ohne Ziehen. */
export function enableDrag(root, { signal, onDrop }) {
  let src = null, ghost = null, sx = 0, sy = 0, moved = false, pid = null;
  const target = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]') || null;
  const clearHot = (keep) => root.querySelectorAll('.drop-hot').forEach((x) => { if (x !== keep) x.classList.remove('drop-hot'); });
  const reset = () => { ghost?.remove(); src?.classList.remove('dragging'); clearHot(null); src = null; ghost = null; moved = false; };
  root.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-drag]');
    if (!el || el.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    src = el; sx = e.clientX; sy = e.clientY; moved = false; pid = e.pointerId;
  }, { signal });
  addEventListener('pointermove', (e) => {
    if (!src || e.pointerId !== pid) return;
    if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
    if (!moved) {
      moved = true;
      const r = src.getBoundingClientRect();
      ghost = src.cloneNode(true); ghost.removeAttribute('data-drag'); ghost.classList.add('dz-ghost');
      ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
      document.body.appendChild(ghost); src.classList.add('dragging');
    }
    ghost.style.transform = `translate(${e.clientX - ghost.offsetWidth / 2}px, ${e.clientY - ghost.offsetHeight / 2}px) scale(1.12)`;
    const t = target(e); clearHot(t); t?.classList.add('drop-hot');
    e.preventDefault();
  }, { signal, passive: false });
  addEventListener('pointerup', (e) => {
    if (!src || e.pointerId !== pid) return;
    if (!moved) { src = null; return; }
    const from = src, t = target(e);
    reset();
    /* Nach echtem Ziehen darf kein Klick hinterherkommen (sonst legt ein Antippen gleich noch etwas dazu). */
    const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    addEventListener('click', stop, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', stop, { capture: true }), 60);
    if (t) onDrop(from, t, e);
  }, { signal });
  addEventListener('pointercancel', reset, { signal });
  signal?.addEventListener('abort', reset);
}
