// pwa-mobile.js
(() => {
  const KEY = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
  const fire = (type, key) => document.dispatchEvent(new KeyboardEvent(type,{key,code:key,bubbles:true}));

  // D-pad
  const dpad = document.getElementById('dpad');
  if (dpad) {
    const held = new Set();
    const press = d => { if (!held.has(d)) { held.add(d); fire('keydown', KEY[d]); } };
    const release = d => { if (held.delete(d)) fire('keyup', KEY[d]); };

    dpad.querySelectorAll('button[data-dir]').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); press(dir); });
      btn.addEventListener('pointerup',   e => { e.preventDefault(); release(dir); });
      btn.addEventListener('pointercancel', () => release(dir));
      btn.addEventListener('pointerleave',  () => release(dir));
    });
    window.addEventListener('pointerup', () => [...held].forEach(release));
  }

  // Optional swipe anywhere on the canvas
  const el = document.querySelector('canvas') || document.body;
  let start=null, dir=null; const TH=24;
  const which=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');

  el.addEventListener('touchstart', e => {
    if (!e.touches[0]) return;
    start={x:e.touches[0].clientX,y:e.touches[0].clientY};
    if (dir){ fire('keyup', KEY[dir]); dir=null; }
  }, {passive:true});

  el.addEventListener('touchmove', e => {
    if (!start || !e.touches[0]) return;
    const dx=e.touches[0].clientX-start.x, dy=e.touches[0].clientY-start.y;
    if (Math.abs(dx)<TH && Math.abs(dy)<TH) return;
    const d=which(dx,dy);
    if (d!==dir){ if (dir) fire('keyup', KEY[dir]); dir=d; fire('keydown', KEY[dir]); }
  }, {passive:true});

  const end=()=>{ if (dir) fire('keyup', KEY[dir]); start=null; dir=null; };
  el.addEventListener('touchend', end, {passive:true});
  el.addEventListener('touchcancel', end, {passive:true});
})();
