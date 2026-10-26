// shared/22-move.js
// Cong thuc di chuyen DUY NHAT dung chung cho server (mo phong that) va client (du doan).
// Ham thuan, khong side effect ngoai state truyen vao, khong Math.random: cung input + cung map => cung ket qua.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const C = S.CONST;
  const T = S.TILE;
  const W = S.WATER;

  const MAP_TILES = C.MAP_TILES;
  const TILE_PX = C.TILE;
  const STEP_DT = 1 / C.TICK_HZ;
  const MAP_PX = MAP_TILES * TILE_PX;
  const EDGE_PX = TILE_PX;

  // Tra tile tai o (tx, ty). Chua co map (client truoc khi nhan seed) thi coi nhu dat bang.
  function tileAt(map, tx, ty) {
    if (!map || !map.tiles) return T.GRASS;
    if (tx < 0 || ty < 0 || tx >= MAP_TILES || ty >= MAP_TILES) return T.DEEP;
    return map.tiles[ty * MAP_TILES + tx];
  }

  function tileAtPixel(map, x, y) {
    return tileAt(map, Math.floor(x / TILE_PX), Math.floor(y / TILE_PX));
  }

  // Trang thai nuoc tai diem (cau, ben la dat lien vi khong phai DEEP/SHALLOW)
  function waterAt(map, x, y) {
    const t = tileAtPixel(map, x, y);
    if (t === T.DEEP) return W.DEEP;
    if (t === T.SHALLOW) return W.SHALLOW;
    return W.LAND;
  }

  function isBlockingTile(map, tx, ty) {
    if (!map || !map.tiles) return false;
    if (tx < 0 || ty < 0 || tx >= MAP_TILES || ty >= MAP_TILES) return true;
    return S.TILE_BLOCKING.indexOf(map.tiles[ty * MAP_TILES + tx]) !== -1;
  }

  // Hinh tron (x, y, r) co cham o tile chan nao khong (xet hop bao cua hinh tron)
  function blockedAt(map, x, y, r) {
    const minTx = Math.floor((x - r) / TILE_PX);
    const maxTx = Math.floor((x + r) / TILE_PX);
    const minTy = Math.floor((y - r) / TILE_PX);
    const maxTy = Math.floor((y + r) / TILE_PX);
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (isBlockingTile(map, tx, ty)) return true;
      }
    }
    return false;
  }

  // Lam sach input tu mang: so huu han, kep trong [-1, 1], vector dai toi da 1
  function cleanAxis(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(-1, Math.min(1, n));
  }

  function cleanInput(input) {
    let mx = cleanAxis(input && input.mx);
    let my = cleanAxis(input && input.my);
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    return { mx: mx, my: my };
  }

  // He so toc do theo nuoc va dia hinh
  function speedMult(water, tile, hasFruit) {
    let m = 1;
    if (water === W.DEEP) {
      m = hasFruit ? C.SINK_MULT : C.SWIM_MULT;
    } else if (water === W.SHALLOW) {
      m = hasFruit ? C.SHALLOW_MULT_FRUIT : C.SHALLOW_MULT;
    }
    if (tile === T.QUICKSAND) m = Math.min(m, C.QUICKSAND_MULT);
    return m;
  }

  /**
   * Di chuyen 1 buoc co dinh STEP_DT.
   * state: { x, y, vx, vy } (bi sua truc tiep)
   * input: { mx, my }
   * map:   { tiles } tu mapgen (co the null)
   * opts:  { hasFruit, onBoat }
   * Tra ve state, them state.water.
   */
  function step(state, input, map, opts) {
    const o = opts || {};
    const inp = cleanInput(input);
    const tile = tileAtPixel(map, state.x, state.y);
    const water = o.onBoat ? W.LAND : waterAt(map, state.x, state.y);
    const speed = C.MOVE_SPEED * speedMult(water, tile, !!o.hasFruit);

    const wantVx = inp.mx * speed;
    const wantVy = inp.my * speed;

    // Bang tron: giu quan tinh, chi tang toc tu tu ve huong muon di
    if (tile === T.ICE) {
      state.vx = (state.vx || 0) * C.ICE_KEEP + wantVx * C.ICE_ACCEL;
      state.vy = (state.vy || 0) * C.ICE_KEEP + wantVy * C.ICE_ACCEL;
    } else {
      state.vx = wantVx;
      state.vy = wantVy;
    }

    const r = C.PLAYER_RADIUS;

    // Va cham tach 2 truc de truot doc theo tuong
    const nx = state.x + state.vx * STEP_DT;
    if (blockedAt(map, nx, state.y, r)) {
      state.vx = 0;
    } else {
      state.x = nx;
    }

    const ny = state.y + state.vy * STEP_DT;
    if (blockedAt(map, state.x, ny, r)) {
      state.vy = 0;
    } else {
      state.y = ny;
    }

    state.x = Math.max(EDGE_PX, Math.min(MAP_PX - EDGE_PX, state.x));
    state.y = Math.max(EDGE_PX, Math.min(MAP_PX - EDGE_PX, state.y));
    state.water = o.onBoat ? W.LAND : waterAt(map, state.x, state.y);
    return state;
  }

  // Tim diem dung khong bi chan gan (x, y), quet vong vuong dan ra (dung cho spawn, dich chuyen)
  function findFreeSpot(map, x, y, maxTiles) {
    const r = C.PLAYER_RADIUS;
    const limit = maxTiles || 8;
    if (!blockedAt(map, x, y, r)) return { x: x, y: y };
    const tx0 = Math.floor(x / TILE_PX);
    const ty0 = Math.floor(y / TILE_PX);
    for (let d = 1; d <= limit; d++) {
      for (let dy = -d; dy <= d; dy++) {
        for (let dx = -d; dx <= d; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
          const cx = (tx0 + dx) * TILE_PX + TILE_PX / 2;
          const cy = (ty0 + dy) * TILE_PX + TILE_PX / 2;
          if (!blockedAt(map, cx, cy, r)) return { x: cx, y: cy };
        }
      }
    }
    return { x: x, y: y };
  }

  S.MOVE = Object.freeze({
    STEP_DT: STEP_DT,
    tileAt: tileAt,
    tileAtPixel: tileAtPixel,
    waterAt: waterAt,
    blockedAt: blockedAt,
    cleanInput: cleanInput,
    speedMult: speedMult,
    step: step,
    findFreeSpot: findFreeSpot
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
