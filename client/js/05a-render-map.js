// client/js/05a-render-map.js
// Render ban do theo chunk 16x16 tile (256x256 px), bien the hash2(tx, ty), vien chuyen tiep bo bien va frustum culling.
// Phu thuoc: client/js/00-boot.js, client/js/04-camera.js, client/js/02b-palette.js, shared/01-constants.js, shared/02-enums.js.

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

  // Bang mau fallback theo chuan do sang moi (DEEP < SHALLOW < GRASS < SAND)
  const TILE_COLORS = {
    0: '#1a498b',  // DEEP (Lum: 67.77)
    1: '#369ec9',  // SHALLOW (Lum: 138.99)
    2: '#e2c275',  // SAND (Lum: 195.24)
    3: '#4eb83a',  // GRASS (Lum: 152.37)
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

  const TILE_NAMES = {
    0: 'deep', 1: 'shallow', 2: 'sand', 3: 'grass',
    4: 'dirt', 5: 'stone', 6: 'wall', 7: 'wood',
    8: 'ice', 9: 'lava', 10: 'snow', 11: 'quicksand',
    12: 'dock', 13: 'bridge', 14: 'tree', 15: 'house_wall', 16: 'floor'
  };

  // Ham bam xac dinh 2 chieu tu ART-REF muc 11 (chi dung o client, khong dung trong shared/mapgen)
  function hash2(x, y) {
    let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  let currentMap = null;
  const chunkCache = new Map();

  function getTileSafe(tiles, tx, ty) {
    if (!tiles || tx < 0 || tx >= MAP_TILES || ty < 0 || ty >= MAP_TILES) return 0;
    return tiles[ty * MAP_TILES + tx];
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

    for (let lty = 0; lty < CHUNK_TILES; lty++) {
      for (let ltx = 0; ltx < CHUNK_TILES; ltx++) {
        const tx = startTx + ltx;
        const ty = startTy + lty;
        const tIndex = ty * MAP_TILES + tx;
        const tileType = (tiles && tIndex >= 0 && tIndex < tiles.length) ? tiles[tIndex] : 0;

        const px = ltx * TILE_PX;
        const py = lty * TILE_PX;

        // 1. Chon bien the xac dinh 0, 1 hoac 2 bang hash2(tx, ty)
        const v = Math.floor(hash2(tx, ty) * 3);

        // 2. Ve sprite tile theo bien the v
        const spriteId = 'tile_' + (TILE_NAMES[tileType] || tileType);
        const spr = (OP.SPR && OP.SPR.get) ? (OP.SPR.get(spriteId) || OP.SPR.get('tile_' + tileType)) : null;

        if (spr && spr.frames && spr.frames.length > 0) {
          const frame = spr.frames[v % spr.frames.length] || spr.frames[0];
          ctx.drawImage(frame, px, py, TILE_PX, TILE_PX);
        } else {
          // Fallback ve mau don
          ctx.fillStyle = TILE_COLORS[tileType] || '#1a498b';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
        }

        // 3. Vien chuyen tiep o bo bien (Coastal Transition Edge)
        if (tiles) {
          const up = getTileSafe(tiles, tx, ty - 1);
          const down = getTileSafe(tiles, tx, ty + 1);
          const left = getTileSafe(tiles, tx - 1, ty);
          const right = getTileSafe(tiles, tx + 1, ty);

          // Cát giáp biển (Nước nông hoặc Biển sâu): dải ẩm & bọt sóng trắng
          if (tileType === 2) { // SAND
            if (up === 0 || up === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(px, py, TILE_PX, 1);
              ctx.fillStyle = 'rgba(181, 146, 71, 0.5)';
              ctx.fillRect(px, py + 1, TILE_PX, 1);
            }
            if (down === 0 || down === 1) {
              ctx.fillStyle = 'rgba(181, 146, 71, 0.5)';
              ctx.fillRect(px, py + TILE_PX - 2, TILE_PX, 1);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1);
            }
            if (left === 0 || left === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(px, py, 1, TILE_PX);
              ctx.fillStyle = 'rgba(181, 146, 71, 0.5)';
              ctx.fillRect(px + 1, py, 1, TILE_PX);
            }
            if (right === 0 || right === 1) {
              ctx.fillStyle = 'rgba(181, 146, 71, 0.5)';
              ctx.fillRect(px + TILE_PX - 2, py, 1, TILE_PX);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(px + TILE_PX - 1, py, 1, TILE_PX);
            }
          }
          // Nước nông giáp biển sâu: gradient xanh sẫm
          else if (tileType === 1) { // SHALLOW
            if (up === 0) {
              ctx.fillStyle = 'rgba(26, 73, 139, 0.45)';
              ctx.fillRect(px, py, TILE_PX, 2);
            }
            if (down === 0) {
              ctx.fillStyle = 'rgba(26, 73, 139, 0.45)';
              ctx.fillRect(px, py + TILE_PX - 2, TILE_PX, 2);
            }
            if (left === 0) {
              ctx.fillStyle = 'rgba(26, 73, 139, 0.45)';
              ctx.fillRect(px, py, 2, TILE_PX);
            }
            if (right === 0) {
              ctx.fillStyle = 'rgba(26, 73, 139, 0.45)';
              ctx.fillRect(px + TILE_PX - 2, py, 2, TILE_PX);
            }
          }
          // Cỏ giáp cát: viền cỏ rủ
          else if (tileType === 3) { // GRASS
            if (up === 2) {
              ctx.fillStyle = 'rgba(50, 124, 36, 0.5)';
              ctx.fillRect(px, py, TILE_PX, 1);
            }
            if (down === 2) {
              ctx.fillStyle = 'rgba(50, 124, 36, 0.5)';
              ctx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1);
            }
            if (left === 2) {
              ctx.fillStyle = 'rgba(50, 124, 36, 0.5)';
              ctx.fillRect(px, py, 1, TILE_PX);
            }
            if (right === 2) {
              ctx.fillStyle = 'rgba(50, 124, 36, 0.5)';
              ctx.fillRect(px + TILE_PX - 1, py, 1, TILE_PX);
            }
          }
        }
      }
    }

    chunkCache.set(key, canvas);
    return canvas;
  }

  const R = OP.R = OP.R || {};

  R.initMap = function (mapData) {
    currentMap = mapData;
    chunkCache.clear();
  };

  R.renderMap = function (ctx) {
    if (!ctx || !currentMap) return;

    const cam = OP.CAM || { x: 2560, y: 2560, w: 480, h: 270 };

    // Tinh pham vi cac chunk nhin thay trong Camera
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
  };

  R.clearMapCache = function () {
    chunkCache.clear();
  };

})(typeof window !== 'undefined' ? window : globalThis);
