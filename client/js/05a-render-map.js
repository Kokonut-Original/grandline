// client/js/05a-render-map.js
// Render ban do theo chunk 16x16 tile (256x256 px). Nen tile nuong san bang OP.SPR.paintTile (02g) vao chunk,
// ban do do sau nuoc tinh 1 lan khi initMap. Lop dong ve moi khung cho o trong khung nhin:
// gon sang tren nuoc, bot trang nhap nhay doc mep bo, dung nham sang theo nhip.
// Phu thuoc: client/js/00-boot.js, client/js/04-camera.js, client/js/02b-palette.js, client/js/02g-tiles-paint.js,
//            shared/01-constants.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};
  const T = S.TILE || {};

  const CHUNK_TILES = 16;
  const TILE_PX = 16;
  const CHUNK_PX = CHUNK_TILES * TILE_PX; // 256 px
  const MAP_TILES = S.CONST.MAP_TILES || 320;
  const CHUNKS_COUNT = MAP_TILES / CHUNK_TILES; // 20 chunks moi chieu

  // Dai do sau: nuoc nong 0..2 theo khoang cach toi dat, nuoc sau 3..5 theo khoang cach toi nuoc nong
  const SHALLOW_BANDS = 3;
  const DEEP_BANDS = 3;

  // Mau du phong khi chua co 02g (vd chay test tren Node)
  const TILE_COLORS = {
    0: '#163e77', 1: '#287ea6', 2: '#e2c275', 3: '#4f8f3c', 4: '#825127', 5: '#6b7a90',
    6: '#424d5d', 7: '#733f1b', 8: '#96d0ea', 9: '#b32b13', 10: '#d2e7f5', 11: '#b38b34',
    12: '#663516', 13: '#80461c', 14: '#298230', 15: '#523727', 16: '#545468'
  };

  // Ham bam xac dinh 2 chieu tu ART-REF muc 11 (chi dung o client)
  function hash2(x, y) {
    let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  let currentMap = null;
  let depthMap = null;
  const chunkCache = new Map();

  function tileAt(tiles, tx, ty) {
    if (!tiles || tx < 0 || tx >= MAP_TILES || ty < 0 || ty >= MAP_TILES) return T.DEEP;
    return tiles[ty * MAP_TILES + tx];
  }

  function isWater(t) {
    return t === T.DEEP || t === T.SHALLOW;
  }

  // BFS 4 huong tu moi o 'isSource', chi lan qua o 'canPass'; ghi khoang cach (toi da cap) vao out
  function bfsDistance(tiles, isSource, canPass, cap, out, base) {
    const n = MAP_TILES * MAP_TILES;
    const dist = new Uint8Array(n).fill(255);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;
    for (let i = 0; i < n; i++) {
      if (isSource(tiles[i])) {
        dist[i] = 0;
        queue[tail++] = i;
      }
    }
    while (head < tail) {
      const i = queue[head++];
      const d = dist[i];
      if (d >= cap) continue;
      const x = i % MAP_TILES;
      const nb = [x > 0 ? i - 1 : -1, x < MAP_TILES - 1 ? i + 1 : -1, i - MAP_TILES, i + MAP_TILES];
      for (let k = 0; k < 4; k++) {
        const j = nb[k];
        if (j < 0 || j >= n || dist[j] !== 255 || !canPass(tiles[j])) continue;
        dist[j] = d + 1;
        queue[tail++] = j;
      }
    }
    for (let i = 0; i < n; i++) {
      if (canPass(tiles[i])) out[i] = base + Math.min(cap, dist[i] === 255 ? cap : dist[i]) - 1;
    }
  }

  // Ban do dai do sau 0..5 cho moi o nuoc (o dat = 0, khong dung)
  function buildDepthMap(tiles) {
    const out = new Uint8Array(MAP_TILES * MAP_TILES);
    if (!tiles) return out;
    bfsDistance(tiles, function (t) { return !isWater(t); }, function (t) { return t === T.SHALLOW; }, SHALLOW_BANDS, out, 0);
    bfsDistance(tiles, function (t) { return t !== T.DEEP; }, function (t) { return t === T.DEEP; }, DEEP_BANDS, out, SHALLOW_BANDS);
    return out;
  }

  function getChunkCanvas(cx, cy) {
    const key = `${cx}_${cy}`;
    if (chunkCache.has(key)) {
      return chunkCache.get(key);
    }

    if (typeof document === 'undefined' || !document.createElement) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX;
    canvas.height = CHUNK_PX;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = false;

    const startTx = cx * CHUNK_TILES;
    const startTy = cy * CHUNK_TILES;
    const tiles = currentMap ? currentMap.tiles : null;
    const paint = (OP.SPR && OP.SPR.paintTile) || null;

    for (let lty = 0; lty < CHUNK_TILES; lty++) {
      for (let ltx = 0; ltx < CHUNK_TILES; ltx++) {
        const tx = startTx + ltx;
        const ty = startTy + lty;
        const px = ltx * TILE_PX;
        const py = lty * TILE_PX;
        if (paint && currentMap) {
          paint(ctx, currentMap, tx, ty, px, py, depthMap ? depthMap[ty * MAP_TILES + tx] : 0);
        } else {
          ctx.fillStyle = TILE_COLORS[tileAt(tiles, tx, ty)] || '#163e77';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
        }
      }
    }

    chunkCache.set(key, canvas);
    return canvas;
  }

  // ---------- Lop dong (moi khung, chi o trong khung nhin) ----------

  function drawWaterTile(ctx, tiles, tx, ty, px, py, r, t) {
    // Gon sang: ~1/6 o nuoc co 1 vet sang len xuong theo sin(t + hash)
    if (r < 0.16) {
      const a = Math.sin(t * 1.6 + r * 60);
      if (a > 0.2) {
        ctx.fillStyle = `rgba(255,255,255,${(a - 0.2) * 0.4})`;
        ctx.fillRect(px + 2 + Math.floor(r * 70) % 10, py + 3 + Math.floor(r * 130) % 10, 4, 1);
      }
    }

    // Bot trang doc mep bo (canh nuoc giap dat), nhap nhay nhe
    const foam = 0.28 + 0.18 * Math.sin(t * 2.2 + r * 25);
    ctx.fillStyle = `rgba(255,255,255,${foam})`;
    const up = tileAt(tiles, tx, ty - 1);
    const down = tileAt(tiles, tx, ty + 1);
    const left = tileAt(tiles, tx - 1, ty);
    const right = tileAt(tiles, tx + 1, ty);
    const off = Math.floor((Math.sin(t * 1.3 + r * 9) + 1) * 1.2); // bot lui toi theo song
    if (!isWater(up) && up !== T.DOCK && up !== T.BRIDGE) ctx.fillRect(px, py + 3 + off, TILE_PX, 1);
    if (!isWater(down) && down !== T.DOCK && down !== T.BRIDGE) ctx.fillRect(px, py + TILE_PX - 2 - off, TILE_PX, 1);
    if (!isWater(left) && left !== T.DOCK && left !== T.BRIDGE) ctx.fillRect(px + 1 + off, py, 1, TILE_PX);
    if (!isWater(right) && right !== T.DOCK && right !== T.BRIDGE) ctx.fillRect(px + TILE_PX - 2 - off, py, 1, TILE_PX);
  }

  function drawDynamic(ctx, left, top, right, bottom) {
    const tiles = currentMap.tiles;
    const t = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) / 1000;
    const tx0 = Math.max(0, Math.floor(left / TILE_PX));
    const ty0 = Math.max(0, Math.floor(top / TILE_PX));
    const tx1 = Math.min(MAP_TILES - 1, Math.floor(right / TILE_PX));
    const ty1 = Math.min(MAP_TILES - 1, Math.floor(bottom / TILE_PX));

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const tile = tiles[ty * MAP_TILES + tx];
        const px = tx * TILE_PX;
        const py = ty * TILE_PX;
        const r = hash2(tx, ty);
        if (isWater(tile)) {
          drawWaterTile(ctx, tiles, tx, ty, px, py, r, t);
        } else if (tile === T.LAVA) {
          // Dung nham sang theo nhip, lech pha theo o
          ctx.fillStyle = `rgba(255,190,70,${0.1 + 0.1 * Math.sin(t * 2 + r * 6)})`;
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
        }
      }
    }
  }

  const R = OP.R = OP.R || {};

  R.initMap = function (mapData) {
    currentMap = mapData;
    depthMap = buildDepthMap(mapData ? mapData.tiles : null);
    chunkCache.clear();
  };

  // Dai do sau cua o nuoc (0..5), dung cho test va hieu ung
  R.getDepth = function (tx, ty) {
    if (!depthMap || tx < 0 || ty < 0 || tx >= MAP_TILES || ty >= MAP_TILES) return 0;
    return depthMap[ty * MAP_TILES + tx];
  };

  R.renderMap = function (ctx) {
    if (!ctx || !currentMap) return;

    const cam = OP.CAM || { x: 2560, y: 2560, w: 480, h: 270 };

    const left = cam.x - cam.w / 2;
    const right = cam.x + cam.w / 2;
    const top = cam.y - cam.h / 2;
    const bottom = cam.y + cam.h / 2;

    const minCx = Math.max(0, Math.floor(left / CHUNK_PX));
    const maxCx = Math.min(CHUNKS_COUNT - 1, Math.floor(right / CHUNK_PX));
    const minCy = Math.max(0, Math.floor(top / CHUNK_PX));
    const maxCy = Math.min(CHUNKS_COUNT - 1, Math.floor(bottom / CHUNK_PX));

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const chunkCanvas = getChunkCanvas(cx, cy);
        if (chunkCanvas) {
          ctx.drawImage(chunkCanvas, cx * CHUNK_PX, cy * CHUNK_PX);
        }
      }
    }

    drawDynamic(ctx, left, top, right, bottom);
  };

  R.clearMapCache = function () {
    chunkCache.clear();
  };

})(typeof window !== 'undefined' ? window : globalThis);
