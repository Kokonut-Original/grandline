// client/js/05c-render-fx.js
// Render hieu ung (stub renderFx) va lop anh sang kieu ART-REF: lightmap offscreen phu mau toi theo vung dao,
// khoet sang quanh nguon sang bang destination-out, quang am bang lighter. Ambient chuyen muot khi doi vung.
// Phu thuoc: client/js/00-boot.js (OP.S), client/js/04-camera.js (OP.CAM), shared/14-data-islands.js (OP.S.ISLANDS).

(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  OP.R = OP.R || {};
  OP.R.renderFx = function () {};

  // Bang anh sang theo vung: mau toi r,g,b; a = do phu; cut = do khoet quanh nguoi 0..1; glow = alpha quang am
  const LIGHT_ZONES = {
    sea: { r: 8, g: 14, b: 34, a: 0.14, cut: 0.5, glow: 0.05 },
    fortress: { r: 12, g: 8, b: 24, a: 0.16, cut: 0.5, glow: 0.06 },
    desert: { r: 40, g: 20, b: 0, a: 0.08, cut: 0.4, glow: 0.06 },
    winter: { r: 10, g: 24, b: 48, a: 0.16, cut: 0.5, glow: 0.04 },
    jungle: { r: 4, g: 20, b: 10, a: 0.30, cut: 0.7, glow: 0.06 },
    canal_city: { r: 16, g: 12, b: 30, a: 0.14, cut: 0.5, glow: 0.06 },
    fire_ice: { r: 40, g: 6, b: 0, a: 0.22, cut: 0.6, glow: 0.14 },
    ghost: { r: 14, g: 6, b: 30, a: 0.45, cut: 0.85, glow: 0.03 },
    mangrove: { r: 4, g: 18, b: 16, a: 0.24, cut: 0.6, glow: 0.05 },
    samurai: { r: 24, g: 8, b: 20, a: 0.16, cut: 0.5, glow: 0.06 },
    giant: { r: 8, g: 16, b: 8, a: 0.20, cut: 0.6, glow: 0.05 }
  };

  const LIGHT_R = 96;
  const GLOW_COLOR = '#ffb35a';

  // Gia tri anh sang hien tai (lerp ve vung dich)
  const cur = { r: 0, g: 0, b: 0, a: 0, cut: 0, glow: 0 };
  let curZone = 'sea';
  let started = false;
  let lastTime = 0;

  let islandKeys = null;
  let lightCanvas = null;
  let lightCtx = null;
  const holeCache = new Map();
  const glowCache = new Map();
  const lights = [];
  const lightPool = [];

  function getConst() {
    return (OP.S && OP.S.CONST) || {};
  }

  // Sprite gradient tron (alpha 1 o tam -> 0 o ria), cache theo ban kinh nguyen
  function getGradientSprite(cache, radius, rgb) {
    const r = Math.max(1, Math.round(radius));
    let c = cache.get(r);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = r * 2;
    c.height = r * 2;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, r * 2, r * 2);
    cache.set(r, c);
    return c;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  const GLOW_RGB = hexToRgb(GLOW_COLOR);

  // Xac dinh vung theo tile duoi nguoi choi (khong co me thi tam camera)
  function detectZone(state) {
    const map = state && state.map;
    if (!map || !map.owner) return 'sea';
    let wx;
    let wy;
    if (state.me) {
      wx = state.me.x;
      wy = state.me.y;
    } else if (OP.CAM) {
      wx = OP.CAM.x;
      wy = OP.CAM.y;
    } else {
      return 'sea';
    }
    const tile = getConst().TILE || 16;
    const tx = Math.floor(wx / tile);
    const ty = Math.floor(wy / tile);
    const w = map.width || 0;
    const h = map.height || w;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return 'sea';
    const owner = map.owner[ty * w + tx];
    if (!owner || owner >= 11) return 'sea';
    if (!islandKeys) islandKeys = Object.keys((OP.S && OP.S.ISLANDS) || {});
    const key = islandKeys[owner - 1];
    return (key && LIGHT_ZONES[key]) ? key : 'sea';
  }

  function ensureCanvas() {
    if (lightCanvas) return;
    const C = getConst();
    lightCanvas = document.createElement('canvas');
    lightCanvas.width = C.VIEW_W || 480;
    lightCanvas.height = C.VIEW_H || 270;
    lightCtx = lightCanvas.getContext('2d');
  }

  function setLight(i, x, y, r) {
    let l = lightPool[i];
    if (!l) {
      l = { x: 0, y: 0, r: 0 };
      lightPool[i] = l;
    }
    l.x = x;
    l.y = y;
    l.r = r;
    lights[i] = l;
  }

  OP.R.renderLight = function (ctx) {
    if (!ctx) return;
    const state = OP.GAME && OP.GAME.state;

    // 1. Do dt va lerp gia tri hien tai ve vung dich
    const now = performance.now();
    let dt = started ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    dt = Math.max(0, Math.min(0.1, dt));

    curZone = detectZone(state);
    const target = LIGHT_ZONES[curZone];
    if (!started) {
      cur.r = target.r;
      cur.g = target.g;
      cur.b = target.b;
      cur.a = target.a;
      cur.cut = target.cut;
      cur.glow = target.glow;
      started = true;
    } else {
      const k = 1 - Math.exp(-dt * 3);
      cur.r += (target.r - cur.r) * k;
      cur.g += (target.g - cur.g) * k;
      cur.b += (target.b - cur.b) * k;
      cur.a += (target.a - cur.a) * k;
      cur.cut += (target.cut - cur.cut) * k;
      cur.glow += (target.glow - cur.glow) * k;
    }

    // 2. Nguon sang (hien chi co nguoi choi minh; task sau them duoc)
    let n = 0;
    if (state && state.me && OP.CAM && OP.CAM.worldToScreen) {
      const s = OP.CAM.worldToScreen(state.me.x, state.me.y - 8);
      setLight(n++, s.x, s.y, LIGHT_R);
    }
    lights.length = n;

    // 3. Lightmap: phu mau toi, khoet sang tai nguon sang
    ensureCanvas();
    const L = lightCtx;
    const W = lightCanvas.width;
    const H = lightCanvas.height;
    L.clearRect(0, 0, W, H);
    L.fillStyle = `rgba(${Math.round(cur.r)}, ${Math.round(cur.g)}, ${Math.round(cur.b)}, ${cur.a.toFixed(3)})`;
    L.fillRect(0, 0, W, H);
    L.globalCompositeOperation = 'destination-out';
    L.globalAlpha = Math.max(0, Math.min(1, cur.cut));
    for (let i = 0; i < n; i++) {
      const l = lights[i];
      const spr = getGradientSprite(holeCache, l.r, '255, 255, 255');
      const half = spr.width / 2;
      L.drawImage(spr, Math.round(l.x - half), Math.round(l.y - half));
    }
    L.globalCompositeOperation = 'source-over';
    L.globalAlpha = 1;

    ctx.drawImage(lightCanvas, 0, 0);

    // 4. Quang am cong sang
    if (cur.glow > 0.001 && n > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = cur.glow;
      for (let i = 0; i < n; i++) {
        const l = lights[i];
        const spr = getGradientSprite(glowCache, l.r * 0.5, GLOW_RGB);
        const half = spr.width / 2;
        ctx.drawImage(spr, Math.round(l.x - half), Math.round(l.y - half));
      }
      ctx.restore();
    }
  };

  OP.R.getLightInfo = function () {
    return { zone: curZone, a: Math.round(cur.a * 100) / 100 };
  };
})();
