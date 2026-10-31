// client/js/05b-render-entities.js
// Render thuc the theo MOT danh sach sap theo y chan (vat thap hon tren man hinh de vat cao hon):
// ruong, do noi that nha (thung), cay, nguoi choi, item, thuyen. Luot 1 ve tat ca bong elip (ART-REF rgba(0,0,0,.35)), luot 2 ve sprite.
// Overlay nguoi choi (tia ngam F3, nhan ten, thanh mau, thanh the luc) ve rieng qua OP.R.renderOverlays, sau lop anh sang.
// Mai nha ve rieng qua OP.R.renderRoofs (sau thuc the), mo dan khi nguoi choi buoc vao trong nha.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02c-sprites-chars.js, client/js/04-camera.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.R = OP.R || {};

  // Ham ve bong elip tieu chuan theo ART-REF muc 8
  function drawShadow(ctx, x, y, rx) {
    const r = Math.round(rx);
    const ry = Math.round(r * 0.45);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), r, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ham ve chu co vien 2 luot (strokeText roi fillText theo ART-REF muc 14)
  function drawOutlinedText(ctx, text, x, y, size, fill, stroke) {
    ctx.font = `${Math.round(size)}px 'VT323', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, Math.round(size / 5));
    ctx.strokeStyle = stroke || '#000000';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, Math.round(x), Math.round(y));
    ctx.fillStyle = fill || '#ffffff';
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

  // Nhan chu (ten nguoi choi) theo toa do the gioi, HUD ve len uiCanvas sau moi khung
  const worldLabels = [];

  OP.R.getWorldLabels = function () {
    return worldLabels;
  };

  // Ban kinh bong theo loai thuc the (giu nguyen tham so cu)
  const SHADOW_R = { CHEST: 8, PROP: 6, TREE: 11, PLAYER: 7, ITEM: 5, BOAT: 12 };

  // Danh sach ve dung lai giua cac khung (pool object, khong tao object moi moi khung)
  const drawPool = [];
  const drawList = [];
  let drawCount = 0;

  // Nguoi choi khung nay (me cuoi cung) de ve overlay sau lop anh sang
  const overlayList = [];
  let overlayCount = 0;
  let overlayMe = null;

  function pushDraw(k, ref, x, y, isMe) {
    let e = drawPool[drawCount];
    if (!e) {
      e = { k: '', ref: null, x: 0, y: 0, o: 0, isMe: false };
      drawPool[drawCount] = e;
    }
    e.k = k;
    e.ref = ref;
    e.x = x;
    e.y = y;
    e.o = drawCount;
    e.isMe = isMe;
    drawList[drawCount] = e;
    drawCount++;
  }

  function compareDraw(a, b) {
    return (a.y - b.y) || (a.x - b.x) || (a.o - b.o);
  }

  // Le cull theo tam nha: nua canh dai nhat + 16px
  function houseMargin(h) {
    return Math.max(h.w || 0, h.h || 0) * 8 + 16;
  }

  // Thu thap ruong, do noi that, cay trong khung nhin (y chan = y tam bong)
  function collectMap(map, cam) {
    if (map.chests) {
      for (let i = 0; i < map.chests.length; i++) {
        const c = map.chests[i];
        if (!cam || cam.isInView(c.x, c.y, 24)) pushDraw('CHEST', c, c.x, c.y + 6, false);
      }
    }
    if (map.houses) {
      for (let i = 0; i < map.houses.length; i++) {
        const h = map.houses[i];
        if (!h.props || (cam && !cam.isInView(h.x, h.y, houseMargin(h)))) continue;
        for (let j = 0; j < h.props.length; j++) {
          const p = h.props[j];
          pushDraw('PROP', p, p.x, p.y + 5, false);
        }
      }
    }
    if (map.trees) {
      for (let i = 0; i < map.trees.length; i++) {
        const tr = map.trees[i];
        if (!cam || cam.isInView(tr.x, tr.y, 32)) pushDraw('TREE', tr, tr.x, tr.y + 2, false);
      }
    }
  }

  // Thu thap nguoi choi / item / thuyen trong khung nhin
  function collectEnt(ent, cam, isMe) {
    if (cam && !cam.isInView(ent.x, ent.y, 48)) return;
    const x = Math.round(ent.x);
    const y = Math.round(ent.y);
    if (isMe || ent.k === 'PLAYER') {
      pushDraw('PLAYER', ent, x, y - 1, isMe);
    } else if (ent.k === 'ITEM') {
      pushDraw('ITEM', ent, x, y + 4, false);
    } else if (ent.k === 'BOAT') {
      pushDraw('BOAT', ent, x, y + 4, false);
    }
  }

  function drawSprite(ctx, e) {
    const ref = e.ref;
    if (e.k === 'PLAYER') {
      drawPlayerBody(ctx, ref);
      return;
    }
    if (e.k === 'ITEM') {
      drawItem(ctx, ref);
      return;
    }
    if (e.k === 'BOAT') {
      drawBoat(ctx, ref);
      return;
    }
    if (!OP.SPR || !OP.SPR.draw) return;
    if (e.k === 'CHEST') {
      OP.SPR.draw(ctx, `chest_${ref.tier || 'wood'}`, 0, ref.x, ref.y);
    } else if (e.k === 'PROP') {
      OP.SPR.draw(ctx, ref.kind, 0, ref.x, ref.y);
    } else if (e.k === 'TREE') {
      OP.SPR.draw(ctx, ref.type || 'tree_palm', 0, ref.x, ref.y);
    }
  }

  OP.R.renderEntities = function (ctx) {
    drawCount = 0;
    overlayCount = 0;
    overlayMe = null;

    const state = OP.GAME && OP.GAME.state;
    if (!ctx || !state) {
      drawList.length = 0;
      overlayList.length = 0;
      return;
    }
    const cam = OP.CAM;

    // 1. Thu thap (co cull theo khung nhin)
    if (state.map && OP.SPR && OP.SPR.draw) {
      collectMap(state.map, cam);
    }
    if (state.ents) {
      for (const ent of state.ents.values()) {
        collectEnt(ent, cam, false);
      }
    }
    if (state.me) {
      collectEnt(state.me, cam, true);
    }
    drawList.length = drawCount;

    // 2. Luot 1: ve TAT CA bong truoc moi sprite
    for (let i = 0; i < drawCount; i++) {
      const e = drawList[i];
      drawShadow(ctx, e.x, e.y, SHADOW_R[e.k]);
    }

    // 3. Sap theo y chan roi luot 2: ve sprite
    drawList.sort(compareDraw);
    for (let i = 0; i < drawCount; i++) {
      const e = drawList[i];
      drawSprite(ctx, e);
      if (e.k === 'PLAYER') {
        if (e.isMe) {
          overlayMe = e.ref;
        } else {
          overlayList[overlayCount++] = e.ref;
        }
      }
    }

    // 4. Danh sach overlay: nguoi khac truoc, me cuoi cung
    if (overlayMe) overlayList[overlayCount++] = overlayMe;
    overlayList.length = overlayCount;
  };

  // Ve overlay nguoi choi sau lop anh sang: thanh mau khong bi cay che, khong bi lam toi
  OP.R.renderOverlays = function (ctx) {
    worldLabels.length = 0;
    if (!ctx) return;
    for (let i = 0; i < overlayCount; i++) {
      const p = overlayList[i];
      if (p !== overlayMe && OP.R.roofAlphaAt(p.x, p.y) >= 0.5) continue; // nguoi khac trong nha: mai che
      drawPlayerOverlay(ctx, p, p === overlayMe);
    }
  };

  function drawItem(ctx, it) {
    const x = Math.round(it.x);
    const y = Math.round(it.y);
    if (OP.SPR && OP.SPR.draw && it.icon) {
      OP.SPR.draw(ctx, it.icon, 0, x, y);
    }
  }

  function drawBoat(ctx, b) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    if (OP.SPR && OP.SPR.draw) {
      OP.SPR.draw(ctx, b.sprite || 'boat_dinghy', 0, x, y);
    }
  }

  function getDirectionAndFlip(aim) {
    let a = (typeof aim === 'number') ? aim : Math.PI / 2;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;

    const absA = Math.abs(a);
    if (absA > (Math.PI * 0.75)) {
      return { dir: 'side', flip: true };
    }
    if (absA < (Math.PI * 0.25)) {
      return { dir: 'side', flip: false };
    }
    if (a >= (Math.PI * 0.25) && a <= (Math.PI * 0.75)) {
      return { dir: 'down', flip: false };
    }
    return { dir: 'up', flip: false };
  }

  // Than nguoi choi: sprite chibi hoac khoi pixel du phong (bong da ve o luot 1)
  function drawPlayerBody(ctx, p) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const colors = p.colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' };

    let baseId = null;
    if (OP.SPR && OP.SPR.player) {
      baseId = OP.SPR.player(colors);
    }

    const dirInfo = getDirectionAndFlip(p.aim);
    const isMoving = Math.hypot(p.vx || 0, p.vy || 0) > 1.0;

    if (baseId && OP.SPR && OP.SPR.draw) {
      const animType = isMoving ? 'walk' : 'idle';
      const spriteId = `${baseId}_${dirInfo.dir}_${animType}`;
      const frameIndex = isMoving ? Math.floor(Date.now() / 150) % 3 : 0;

      OP.SPR.draw(ctx, spriteId, frameIndex, x, y, {
        flip: dirInfo.flip
      });
    } else {
      // Fallback ve khoi pixel neu sprite chua san sang
      ctx.fillStyle = colors.shirt || '#337ab7';
      ctx.fillRect(x - 6, y - 18, 12, 16);
    }
  }

  // Overlay nguoi choi: tia ngam F3, nhan ten, thanh mau, thanh the luc
  function drawPlayerOverlay(ctx, p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);

    // 1. Tia huong ngam (chi de go loi, hien khi bat F3)
    const debugOn = !!(OP.HUD && OP.HUD.isDebug && OP.HUD.isDebug());
    if (debugOn && typeof p.aim === 'number') {
      const aimLen = 16;
      const targetX = x + Math.cos(p.aim) * aimLen;
      const targetY = (y - 12) + Math.sin(p.aim) * aimLen;

      ctx.strokeStyle = isMe ? '#4ade80' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    }

    // 2. Ten nguoi choi: dua sang uiCanvas (do phan giai that) de chu net, HUD ve sau
    const displayName = p.name || 'Hải Tặc';
    worldLabels.push({ x: x, y: y - 30, text: displayName, color: isMe ? '#fef08a' : '#ffffff' });

    // 3. Thanh mau nho
    const hp = p.hp !== undefined ? p.hp : 100;
    const hpMax = p.hm !== undefined ? p.hm : 100;
    const pct = Math.max(0, Math.min(1, hp / hpMax));

    ctx.fillStyle = '#160e22';
    ctx.fillRect(x - 11, y - 24, 22, 4);
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.2 ? '#eab308' : '#ef4444');
    ctx.fillRect(x - 10, y - 23, Math.round(20 * pct), 2);

    // 4. Thanh the luc tren dau: chi cua minh (server khong gui the luc nguoi khac), chi khi chua day
    const stamina = p.stamina !== undefined ? p.stamina : 100;
    if (isMe && stamina < 100) {
      const stPct = Math.max(0, Math.min(1, stamina / 100));
      ctx.fillStyle = '#160e22';
      ctx.fillRect(x - 11, y - 20, 22, 3);
      ctx.fillStyle = stamina <= 10 ? '#ef4444' : '#38bdf8';
      ctx.fillRect(x - 10, y - 19, Math.round(20 * stPct), 1);
    }
  }

  // ---------- Mai nha ----------

  const ROOF_COLORS = {
    house_wood: { c1: '#9a3a2e', c2: '#6a2420', ridge: '#c86a4a' },
    house_small: { c1: '#9a3a2e', c2: '#6a2420', ridge: '#c86a4a' },
    house_stone: { c1: '#4a4a5e', c2: '#2e2e3c', ridge: '#7a7a92' }
  };
  const ROOF_FADE_SPEED = 4; // do mo moi giay
  const roofCache = new Map();
  const roofAlpha = new Map(); // chi so nha -> do mo hien tai (khong ghi vao object map)
  let roofMap = null;
  let roofLastTime = 0;

  // Canvas mai theo loai + kich thuoc, ve 1 lan
  function getRoofCanvas(type, w, h) {
    const key = `${type}_${w}x${h}`;
    if (roofCache.has(key)) return roofCache.get(key);
    if (typeof document === 'undefined' || !document.createElement) return null;
    const cv = document.createElement('canvas');
    cv.width = w * 16;
    cv.height = h * 16;
    const g = cv.getContext('2d');
    if (!g) return null;
    g.imageSmoothingEnabled = false;
    const W = cv.width;
    const H = cv.height;
    const col = ROOF_COLORS[type] || ROOF_COLORS.house_wood;

    g.fillStyle = col.c1;
    g.fillRect(0, 0, W, H);
    // Ranh ngoi ngang moi 4px, manh doc moi 6px so le theo hang
    g.fillStyle = col.c2;
    for (let y = 3; y < H; y += 4) g.fillRect(0, y, W, 1);
    for (let band = 0; band * 4 < H; band++) {
      for (let x = (band % 2) * 3; x < W; x += 6) g.fillRect(x, band * 4, 1, 3);
    }
    // Nua tren sang, nua duoi toi
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(0, 0, W, H / 2);
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(0, H / 2, W, H / 2);
    // Noc mai ngang giua
    g.fillStyle = col.ridge;
    g.fillRect(0, H / 2 - 1, W, 2);
    // Mep trai toi, mep phai sang
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.fillRect(0, 0, 2, H);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(W - 2, 0, 2, H);
    // Cua troi o nua tren
    const n = w >= 7 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const sx = Math.round(W * (i + 1) / (n + 1)) - 3;
      const sy = Math.round(H / 4) - 2;
      g.fillStyle = '#5e3b1c';
      g.fillRect(sx, sy, 6, 5);
      g.fillStyle = '#9fd0ff';
      g.fillRect(sx + 1, sy + 1, 4, 3);
      g.fillStyle = '#d7e2f5';
      g.fillRect(sx + 1, sy + 2, 1, 1);
      g.fillRect(sx + 2, sy + 1, 1, 1);
    }
    // Vien den quanh mai
    g.fillStyle = '#160e22';
    g.fillRect(0, 0, W, 1);
    g.fillRect(0, H - 1, W, 1);
    g.fillRect(0, 0, 1, H);
    g.fillRect(W - 1, 0, 1, H);

    roofCache.set(key, cv);
    return cv;
  }

  function meInsideHouse(me, h) {
    if (!me) return false;
    const tx = Math.floor(me.x / 16);
    const ty = Math.floor(me.y / 16);
    return tx >= h.tx && tx < h.tx + h.w && ty >= h.ty && ty < h.ty + h.h;
  }

  // Ve mai moi nha trong khung nhin (toa do the gioi); mai mo dan khi minh dung trong nha
  OP.R.renderRoofs = function (ctx) {
    const state = OP.GAME && OP.GAME.state;
    if (!ctx || !state || !state.map || !state.map.houses) return;
    const map = state.map;
    const cam = OP.CAM;

    if (roofMap !== map) {
      roofMap = map;
      roofAlpha.clear();
    }
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const dt = roofLastTime ? Math.min(0.1, Math.max(0, (now - roofLastTime) / 1000)) : 0;
    roofLastTime = now;

    for (let i = 0; i < map.houses.length; i++) {
      const h = map.houses[i];
      if (!h.w || (cam && !cam.isInView(h.x, h.y, houseMargin(h)))) {
        roofAlpha.delete(i);
        continue;
      }
      const target = meInsideHouse(state.me, h) ? 0 : 1;
      let a = roofAlpha.has(i) ? roofAlpha.get(i) : target;
      if (a < target) a = Math.min(target, a + ROOF_FADE_SPEED * dt);
      else if (a > target) a = Math.max(target, a - ROOF_FADE_SPEED * dt);
      roofAlpha.set(i, a);
      if (a <= 0.01) continue;

      const cv = getRoofCanvas(h.type, h.w, h.h);
      if (!cv) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(cv, h.tx * 16, h.ty * 16);
      ctx.globalAlpha = 1;
    }
  };

  // Do mo mai cua nha chua diem (px the gioi); 0 neu diem khong nam trong nha nao
  OP.R.roofAlphaAt = function (x, y) {
    const state = OP.GAME && OP.GAME.state;
    if (!state || !state.map || !state.map.houses) return 0;
    const tx = Math.floor(x / 16);
    const ty = Math.floor(y / 16);
    const hs = state.map.houses;
    for (let i = 0; i < hs.length; i++) {
      const h = hs[i];
      if (!h.w || tx < h.tx || tx >= h.tx + h.w || ty < h.ty || ty >= h.ty + h.h) continue;
      if (roofMap === state.map && roofAlpha.has(i)) return roofAlpha.get(i);
      return meInsideHouse(state.me, h) ? 0 : 1;
    }
    return 0;
  };

  OP.R.drawShadow = drawShadow;
  OP.R.drawOutlinedText = drawOutlinedText;

})();
