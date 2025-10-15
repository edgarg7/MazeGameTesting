
(() => {
  
  const fireKey = (type, key, code = key, keyCode = undefined) => {
    const evtInit = {
      key, code, bubbles: true, cancelable: true,
      
      keyCode: keyCode ?? (key.length === 1 ? key.charCodeAt(0) : undefined),
      which: keyCode ?? (key.length === 1 ? key.charCodeAt(0) : undefined)
    };
    
    window.dispatchEvent(new KeyboardEvent(type, evtInit));
    document.dispatchEvent(new KeyboardEvent(type, evtInit));
    const cnv = document.querySelector('canvas');
    if (cnv) cnv.dispatchEvent(new KeyboardEvent(type, evtInit));
  };

  const SPACE = { key: ' ', code: 'Space', keyCode: 32 };

  const pressSpaceOnce = () => {
    focusCanvas();
    fireKey('keydown', SPACE.key, SPACE.code, SPACE.keyCode);
    setTimeout(() => fireKey('keyup', SPACE.key, SPACE.code, SPACE.keyCode), 60);
  };

  const focusCanvas = () => {
    const cnv = document.querySelector('canvas');
    if (cnv) {
      try { cnv.focus({ preventScroll: true }); } catch {}
    }
    try { window.focus(); } catch {}
  };

  // ---------- D-pad wiring ----------
  const KEY = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
  const dpad = document.getElementById('dpad');

  if (dpad) {
    const held = new Set();
    const press = d => { if (!held.has(d)) { held.add(d); fireKey('keydown', KEY[d], KEY[d]); } };
    const release = d => { if (held.delete(d)) fireKey('keyup', KEY[d], KEY[d]); };

    // one handler for mouse & touch
    dpad.querySelectorAll('button[data-dir]').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); focusCanvas(); press(dir); });
      btn.addEventListener('pointerup',   e => { e.preventDefault(); release(dir); });
      btn.addEventListener('pointercancel', () => release(dir));
      btn.addEventListener('pointerleave',  () => release(dir));
    });

    // if user lifts finger elsewhere, release any held direction
    window.addEventListener('pointerup', () => { [...held].forEach(release); });
  }

  // ---------- Tap-to-Start overlay (sends Space) ----------
  (function tapToStart() {
    
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    
    const css = `
      #tapToStart{position:fixed;inset:0;background:rgba(0,0,0,.6);
        display:flex;align-items:center;justify-content:center;z-index:9998}
      #tapToStart button{background:#1c8c2c;color:#fff;border:0;padding:14px 20px;
        font-size:18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
    `;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

    const overlay = document.createElement('div'); overlay.id = 'tapToStart';
    const btn = document.createElement('button'); btn.textContent = 'Tap to Start';
    overlay.appendChild(btn); document.body.appendChild(overlay);

    const start = () => {
      overlay.remove();
      pressSpaceOnce();  
    };

    overlay.addEventListener('pointerdown', (e) => { e.preventDefault(); start(); }, { once: true });
  })();

  
  window.addEventListener('pointerdown', (e) => {
    const cnv = document.querySelector('canvas');
    if (cnv && cnv.contains(e.target)) {
      pressSpaceOnce();
    }
  });
})();
