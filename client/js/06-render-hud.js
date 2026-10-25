// client/js/06-render-hud.js
// Render giao dien HUD: bang debug F3, minimap goc phai va ban do toan canh 10 dao khi bam Tab.
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js, shared/14-data-islands.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  const S = window.OP_SHARED || {};
  OP.HUD = OP.HUD || {};

  let showDebug = false;
  let showBigMap = false;
  let fps = 0;
  let frameCount = 0;
  let lastFpsTime = performance.now();

  const MINIMAP_TILE_COLORS = {
    0: '#1e3a8a',  // DEEP
    1: '#0284c7',  // SHALLOW
    2: '#eab308',  // SAND
    3: '#15803d',  // GRASS
    4: '#854d0e',  // DIRT
    5: '#64748b',  // STONE
    6: '#334155',  // WALL
    7: '#78350f',  // WOOD
    8: '#7dd3fc',  // ICE
    9: '#dc2626',  // LAVA
    10: '#f8fafc', // SNOW
    11: '#ca8a04', // QUICKSAND
    12: '#b45309', // DOCK
    13: '#d97706', // BRIDGE
    16: '#94a3b8'  // FLOOR
  };

  // Lang nghe phim F3 va Tab
  window.addEventListener('keydown', function (e) {
    if (e.code === 'F3') {
      showDebug = !showDebug;
      e.preventDefault();
    } else if (e.code === 'Tab') {
      showBigMap = !showBigMap;
      e.preventDefault();
    }
  });

  OP.HUD.updateFps = function () {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      frameCount = 0;
      lastFpsTime = now;
    }
  };

  OP.HUD.render = function (ctx) {
    if (!ctx) return;

    OP.HUD.updateFps();

    const state = OP.GAME && OP.GAME.state;
    const me = state && state.me;
    const map = state && state.map;

    // 1. Ve Minimap goc tren ben phai
    if (me && map) {
      drawMinimap(ctx, me, map);
    }

    // 2. Ve Ban do lon khi nhan Tab
    if (showBigMap && map) {
      drawBigMap(ctx, me, map);
    }

    // 3. Ve bang debug F3 neu duoc bat hoac co ?debug=1
    if (showDebug || OP.debug) {
      drawDebugOverlay(ctx, me, state);
    }
  };

  function drawMinimap(ctx, me, map) {
    const size = 64;
    const x = 480 - size - 8;
    const y = 8;

    ctx.save();
    // Khung vien
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);

    const centerTx = Math.floor(me.x / 16);
    const centerTy = Math.floor(me.y / 16);
    const viewTiles = 32; // 32x32 tile, moi tile 2x2 px
    const half = viewTiles / 2;
    const tiles = map.tiles;
    const mapW = map.width || 320;

    // Ve tung tile thu nho
    for (let dy = -half; dy < half; dy++) {
      for (let dx = -half; dx < half; dx++) {
        const tx = centerTx + dx;
        const ty = centerTy + dy;
        let tType = 0;
        if (tx >= 0 && tx < mapW && ty >= 0 && ty < mapW && tiles) {
          tType = tiles[ty * mapW + tx];
        }
        ctx.fillStyle = MINIMAP_TILE_COLORS[tType] || '#1e3a8a';
        ctx.fillRect(x + (dx + half) * 2, y + (dy + half) * 2, 2, 2);
      }
    }

    // Ve vi tri cac thuc the khac (cham do)
    const state = OP.GAME && OP.GAME.state;
    if (state && state.ents) {
      ctx.fillStyle = '#ef4444';
      for (const ent of state.ents.values()) {
        const edx = Math.floor(ent.x / 16) - centerTx;
        const edy = Math.floor(ent.y / 16) - centerTy;
        if (Math.abs(edx) < half && Math.abs(edy) < half) {
          ctx.fillRect(x + (edx + half) * 2 - 1, y + (edy + half) * 2 - 1, 3, 3);
        }
      }
    }

    // Ve vi tri ban than (cham vang co tia ngam o tam)
    const myPx = x + half * 2;
    const myPy = y + half * 2;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(myPx, myPy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (typeof me.aim === 'number') {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(myPx, myPy);
      ctx.lineTo(myPx + Math.cos(me.aim) * 6, myPy + Math.sin(me.aim) * 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBigMap(ctx, me, map) {
    const w = 240;
    const h = 240;
    const x = Math.round((480 - w) / 2);
    const y = Math.round((270 - h) / 2);

    ctx.save();
    // Nen toan ban do
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Tieu de
    ctx.font = '14px VT323, monospace';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText('HAI DO DAI HAI TRINH (TAB: DONG)', x + w / 2, y + 16);

    const mapAreaSize = 192;
    const mapAreaX = x + (w - mapAreaSize) / 2;
    const mapAreaY = y + 26;
    const scale = mapAreaSize / 320; // 0.6 px / tile

    // Nen bien sau
    ctx.fillStyle = '#0f244a';
    ctx.fillRect(mapAreaX, mapAreaY, mapAreaSize, mapAreaSize);

    // Ve 10 dao
    const islands = (S.ISLANDS) || (map.islands) || {};
    ctx.font = '10px VT323, monospace';

    for (const key in islands) {
      const isl = islands[key];
      const ix = mapAreaX + isl.cx * scale;
      const iy = mapAreaY + isl.cy * scale;
      const ir = Math.max(3, isl.radius * scale);

      // Dai nuoc nong
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(ix, iy, ir + 2, 0, Math.PI * 2);
      ctx.fill();

      // Dat lien
      ctx.fillStyle = (isl.id === 'desert') ? '#ca8a04' : (isl.id === 'winter' ? '#bae6fd' : (isl.id === 'fortress' ? '#64748b' : '#15803d'));
      ctx.beginPath();
      ctx.arc(ix, iy, ir, 0, Math.PI * 2);
      ctx.fill();

      // Ten dao
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(isl.name.split(' ')[0], ix, iy + ir + 9);
    }

    // Ve cham vi tri ban than (xanh la nhap nhay)
    if (me) {
      const myMapX = mapAreaX + (me.x / 16) * scale;
      const myMapY = mapAreaY + (me.y / 16) * scale;
      const pulse = 3 + Math.sin(Date.now() / 150) * 1.5;

      ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.beginPath();
      ctx.arc(myMapX, myMapY, pulse + 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(myMapX, myMapY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawDebugOverlay(ctx, me, state) {
    const ping = (OP.NET && OP.NET.getPing) ? OP.NET.getPing() : 0;
    const tick = state ? state.lastTick : 0;
    const entCount = 1 + (state && state.ents ? state.ents.size : 0);

    const x = 6;
    let y = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(4, 4, 130, 68);

    ctx.font = '12px VT323, monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = fps >= 55 ? '#5ac54f' : (fps >= 30 ? '#f4c430' : '#da3633');
    ctx.fillText(`FPS:  ${fps}`, x, y);
    y += 12;

    ctx.fillStyle = ping <= 50 ? '#5ac54f' : (ping <= 100 ? '#f4c430' : '#da3633');
    ctx.fillText(`PING: ${ping} ms`, x, y);
    y += 12;

    ctx.fillStyle = '#3e8edf';
    ctx.fillText(`TICK: ${tick}`, x, y);
    y += 12;

    ctx.fillStyle = '#e6edf3';
    ctx.fillText(`ENTS: ${entCount}`, x, y);
    y += 12;

    if (me) {
      ctx.fillStyle = '#cfcfcf';
      ctx.fillText(`POS:  ${Math.round(me.x)}, ${Math.round(me.y)}`, x, y);
    }

    ctx.restore();
  }
})();
