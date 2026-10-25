// client/js/05a-render-map.js
// Render ban do toi uu theo chunk 16x16 tile (256x256 px), cache canvas phu va view frustum culling.
// Phu thuoc: client/js/00-boot.js, client/js/04-camera.js, shared/01-constants.js, shared/02-enums.js.

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

  const TILE_COLORS = {
    0: '#1d4ed8',  // DEEP
    1: '#38bdf8',  // SHALLOW
    2: '#fde047',  // SAND
    3: '#22c55e',  // GRASS
    4: '#a16207',  // DIRT
    5: '#94a3b8',  // STONE
    6: '#475569',  // WALL
    7: '#b45309',  // WOOD
    8: '#bae6fd',  // ICE
    9: '#dc2626',  // LAVA
    10: '#f8fafc', // SNOW
    11: '#ca8a04', // QUICKSAND
    12: '#78350f', // DOCK
    13: '#d97706', // BRIDGE
    14: '#15803d', // TREE
    15: '#334155', // HOUSE_WALL
    16: '#cbd5e1'  // FLOOR
  };

  const TILE_NAMES = {
    0: 'deep', 1: 'shallow', 2: 'sand', 3: 'grass',
    4: 'dirt', 5: 'rock', 6: 'wall', 7: 'wood',
    8: 'ice', 9: 'lava', 10: 'snow', 11: 'sand',
    12: 'dock', 13: 'bridge', 16: 'wall'
  };

  let currentMap = null;
  const chunkCache = new Map();

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

        // Thu ve sprite tile neu da dinh nghia
        const spriteId = 'tile_' + (TILE_NAMES[tileType] || 'sand');
        const spr = (OP.SPR && OP.SPR.get) ? OP.SPR.get(spriteId) : null;

        if (spr && spr.frames && spr.frames[0]) {
          ctx.drawImage(spr.frames[0], px, py, TILE_PX, TILE_PX);
        } else {
          // Fallback ve pixel mau nen
          ctx.fillStyle = TILE_COLORS[tileType] || '#1d4ed8';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
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
