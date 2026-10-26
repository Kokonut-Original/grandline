// client/js/06-render-hud.js
// Render giao dien HUD tren uiCanvas voi chu 2 luot (strokeText roi fillText), tieng Viet day du dau, minimap va F3.
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
    0: '#1a498b',  // DEEP
    1: '#369ec9',  // SHALLOW
    2: '#e2c275',  // SAND
    3: '#4eb83a',  // GRASS
    4: '#825127',  // DIRT
    5: '#6b7a90',  // STONE
    6: '#424d5d',  // WALL
    7: '#733f1b',  // WOOD
    8: '#96d0ea',  // ICE
    9: '#b32b13',  // LAVA
    10: '#d2e7f5', // SNOW
    11: '#b38b34', // QUICKSAND
    12: '#663516', // DOCK
    13: '#80461c', // BRIDGE
    14: '#298230', // TREE
    15: '#523727', // HOUSE_WALL
    16: '#545468'  // FLOOR
  };

  // Ham ve chu 2 luot (strokeText roi fillText) theo ART-REF muc 14
  function drawOutlinedText(ctx, text, x, y, size, fill, stroke, align, baseline) {
    ctx.font = `${Math.round(size)}px 'VT323', monospace`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'middle';
    ctx.lineWidth = Math.max(2, Math.round(size / 5));
    ctx.strokeStyle = stroke || '#160e22';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, Math.round(x), Math.round(y));
    ctx.fillStyle = fill || '#ffffff';
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

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

    // 0. Ten nguoi choi tren dau (toa do the gioi -> man hinh), ve o day de chu net
    drawWorldLabels(ctx);

    // 1. Ve Minimap goc tren ben phai
    if (me && map) {
      drawMinimap(ctx, me, map);
    }

    // 2. Ve Ban do toan canh khi nhan Tab
    if (showBigMap && map) {
      drawBigMap(ctx, me, map);
    }

    // 3. Ve thanh the luc (Duration Bar) o goc duoi
    if (me) {
      drawStaminaHud(ctx, me);
    }

    // 4. Ve bang debug F3 neu duoc bat hoac co ?debug=1
    if (showDebug) {
      drawDebugOverlay(ctx, me, state);
    }
  };

  function drawWorldLabels(ctx) {
    if (!OP.R || !OP.R.getWorldLabels || !OP.CAM || !OP.CAM.worldToScreen) return;
    const labels = OP.R.getWorldLabels();
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      const p = OP.CAM.worldToScreen(l.x, l.y);
      drawOutlinedText(ctx, l.text, p.x, p.y, 10, l.color, '#160e22', 'center');
    }
  }

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
        ctx.fillStyle = MINIMAP_TILE_COLORS[tType] || '#1a498b';
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
    const w = 260;
    const h = 250;
    const x = Math.round((480 - w) / 2);
    const y = Math.round((270 - h) / 2);

    ctx.save();
    // Nen toan ban do
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Tieu de tieng Viet 2 luot stroke + fill
    drawOutlinedText(ctx, 'HẢI ĐỒ ĐẠI HẢI TRÌNH (TAB: ĐÓNG)', x + w / 2, y + 14, 15, '#facc15', '#160e22', 'center');

    const mapAreaSize = 192;
    const mapAreaX = x + (w - mapAreaSize) / 2;
    const mapAreaY = y + 26;
    const scale = mapAreaSize / 320; // 0.6 px / tile

    // Nen bien sau
    ctx.fillStyle = '#0f244a';
    ctx.fillRect(mapAreaX, mapAreaY, mapAreaSize, mapAreaSize);

    // Ve 10 dao
    const islands = (S.ISLANDS) || (map.islands) || {};

    for (const key in islands) {
      const isl = islands[key];
      const ix = mapAreaX + isl.cx * scale;
      const iy = mapAreaY + isl.cy * scale;
      const ir = Math.max(3, isl.radius * scale);

      // Dai nuoc nong
      ctx.fillStyle = '#369ec9';
      ctx.beginPath();
      ctx.arc(ix, iy, ir + 2, 0, Math.PI * 2);
      ctx.fill();

      // Dat lien
      ctx.fillStyle = (isl.id === 'desert') ? '#e2c275' : (isl.id === 'winter' ? '#d2e7f5' : (isl.id === 'fortress' ? '#6b7a90' : '#4eb83a'));
      ctx.beginPath();
      ctx.arc(ix, iy, ir, 0, Math.PI * 2);
      ctx.fill();

      // Ten dao tieng Viet co dau
      drawOutlinedText(ctx, isl.name, ix, iy + ir + 7, 10, '#ffffff', '#160e22', 'center');
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(4, 4, 110, 64);

    const fpsColor = fps >= 55 ? '#5ac54f' : (fps >= 30 ? '#f4c430' : '#da3633');
    drawOutlinedText(ctx, `FPS:  ${fps}`, x, y, 12, fpsColor, '#160e22');
    y += 12;

    const pingColor = ping <= 50 ? '#5ac54f' : (ping <= 100 ? '#f4c430' : '#da3633');
    drawOutlinedText(ctx, `PING: ${ping} ms`, x, y, 12, pingColor, '#160e22');
    y += 12;

    drawOutlinedText(ctx, `TICK: ${tick}`, x, y, 12, '#3e8edf', '#160e22');
    y += 12;

    drawOutlinedText(ctx, `ENTS: ${entCount}`, x, y, 12, '#e6edf3', '#160e22');
    y += 12;

    if (me) {
      drawOutlinedText(ctx, `POS:  ${Math.round(me.x)}, ${Math.round(me.y)}`, x, y, 12, '#cfcfcf', '#160e22');
      y += 12;
    }


    ctx.restore();
  }

  function drawStaminaHud(ctx, me) {
    const stamina = (me.stamina !== undefined) ? me.stamina : 100;
    const isSprint = !!me.isSprinting;
    const pct = Math.max(0, Math.min(1, stamina / 100));

    const w = 120;
    const h = 13;
    const x = 8;
    const y = 270 - h - 8;

    ctx.save();

    // Khung vien ngoai
    ctx.fillStyle = '#160e22';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

    // Nen ben trong
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x, y, w, h);

    // Thanh fill the luc
    if (pct > 0) {
      const fillW = Math.round((w - 2) * pct);
      ctx.fillStyle = isSprint ? '#fbbf24' : (stamina <= 15 ? '#ef4444' : '#0284c7');
      ctx.fillRect(x + 1, y + 1, fillW, h - 2);

      // Vet sang nhe tren dau thanh
      if (isSprint) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(x + 1, y + 1, fillW, 2);
      }
    }

    // Chu hien thi 2 luot strokeText + fillText
    let label = `THỂ LỰC [SHIFT]: ${Math.round(stamina)}%`;
    if (stamina <= 5) label = 'KIỆT SỨC!';
    else if (isSprint) label = `CHẠY NHANH: ${Math.round(stamina)}%`;

    const txtColor = (stamina <= 5) ? '#ef4444' : (isSprint ? '#fef08a' : '#ffffff');
    drawOutlinedText(ctx, label, x + w / 2, y + h / 2, 10, txtColor, '#160e22', 'center');

    ctx.restore();
  }

  OP.HUD.drawOutlinedText = drawOutlinedText;

  // Cac lop ve khac (05b) dung de chi hien thong tin go loi khi bat F3
  OP.HUD.isDebug = function () {
    return showDebug;
  };

})();
