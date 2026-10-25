// client/js/05a-render-map.js
// Render ban do theo chunk 16x16 tile (256x256 px), co tu nhien bo vien luoi, chi tiet 15-20%, bo bien chuyen tiep mem.
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
    0: '#163e77',  // DEEP (Lum: 57.61)
    1: '#287ea6',  // SHALLOW (Lum: 110.60)
    2: '#e2c275',  // SAND (Lum: 195.24)
    3: '#4f8f3c',  // GRASS (Lum: 123.40)
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

  // Ham bam xac dinh 2 chieu tu ART-REF muc 11 (chi dung o client)
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

  // Ve chi tiet nho tren bai co (khom co, hoa li ti, chi ~15-20% o co)
  function drawGrassDetails(ctx, px, py, r) {
    const detailType = Math.floor((r / 0.18) * 4);
    const ox = px + 4 + Math.floor((r * 1000) % 7);
    const oy = py + 4 + Math.floor((r * 777) % 7);

    if (detailType === 0) {
      // Kieu 0: Khom 2 cong co nghieng
      ctx.fillStyle = '#68a94a';
      ctx.fillRect(ox, oy, 1, 2);
      ctx.fillRect(ox + 1, oy - 1, 1, 2);
      ctx.fillStyle = '#437a33';
      ctx.fillRect(ox, oy + 2, 2, 1);
    } else if (detailType === 1) {
      // Kieu 1: Bong hoa trang li ti
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(ox, oy, 2, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(ox, oy + 1, 1, 1);
    } else if (detailType === 2) {
      // Kieu 2: Cum 3 cong co tu nhien
      ctx.fillStyle = '#68a94a';
      ctx.fillRect(ox, oy + 1, 1, 2);
      ctx.fillRect(ox + 2, oy, 1, 3);
      ctx.fillRect(ox + 3, oy + 1, 1, 2);
      ctx.fillStyle = '#437a33';
      ctx.fillRect(ox, oy + 3, 4, 1);
    } else {
      // Kieu 3: Dom hoa vang dai nho
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(ox, oy, 2, 1);
      ctx.fillStyle = '#437a33';
      ctx.fillRect(ox + 1, oy + 1, 1, 1);
    }
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

        const r = hash2(tx, ty);

        // 1. Ve nen tile (Neu la vat can TREE thi lay tile nen dia hinh lân can de khong bi vuong xanh)
        let renderTile = tileType;
        if (tileType === 14) {
          if (tiles) {
            const neighbors = [
              getTileSafe(tiles, tx, ty - 1),
              getTileSafe(tiles, tx, ty + 1),
              getTileSafe(tiles, tx - 1, ty),
              getTileSafe(tiles, tx + 1, ty)
            ];
            for (let ni = 0; ni < neighbors.length; ni++) {
              const nt = neighbors[ni];
              if (nt !== 0 && nt !== 1 && nt !== 14 && nt !== 15) {
                renderTile = nt;
                break;
              }
            }
          }
          if (renderTile === 14) renderTile = 3;
        }

        if (renderTile === 3) { // GRASS
          // Nen co min mang hoan toan khong co duong luoi ca-ro tho
          ctx.fillStyle = '#4f8f3c';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);

          // Mep tren sang rat nhe rgba(255,255,255,.04)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(px, py, TILE_PX, 1);

          // Mep duoi va phai toi rat nhe rgba(0,0,0,.06)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1);
          ctx.fillRect(px + TILE_PX - 1, py, 1, TILE_PX);

          // Chi ~15-20% o co co chi tiet (ngon co, hoa li ti), 82% con lai la co tron
          if (r < 0.18) {
            drawGrassDetails(ctx, px, py, r);
          }
        } else {
          // Cac tile khac (Nuoc, Cat, Da, Go, Tuong): dung sprite co bien the
          const v = Math.floor(r * 3);
          const spriteId = 'tile_' + (TILE_NAMES[renderTile] || renderTile);
          const spr = (OP.SPR && OP.SPR.get) ? (OP.SPR.get(spriteId) || OP.SPR.get('tile_' + renderTile)) : null;

          if (spr && spr.frames && spr.frames.length > 0) {
            const frame = spr.frames[v % spr.frames.length] || spr.frames[0];
            ctx.drawImage(frame, px, py, TILE_PX, TILE_PX);
          } else {
            ctx.fillStyle = TILE_COLORS[renderTile] || '#163e77';
            ctx.fillRect(px, py, TILE_PX, TILE_PX);
          }
        }

        // 2. Vien chuyen tiep bo bien (Coastal Transition Edge)
        if (tiles) {
          const up = getTileSafe(tiles, tx, ty - 1);
          const down = getTileSafe(tiles, tx, ty + 1);
          const left = getTileSafe(tiles, tx - 1, ty);
          const right = getTileSafe(tiles, tx + 1, ty);

          // Cát giáp biển (Nước nông hoặc Biển sâu): bọt sóng trắng và cát ẩm mềm
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
          // Nước nông giáp biển sâu: gradient xanh sẫm làm mềm ranh giới
          else if (tileType === 1) { // SHALLOW
            if (up === 0) {
              ctx.fillStyle = 'rgba(22, 62, 119, 0.45)';
              ctx.fillRect(px, py, TILE_PX, 2);
            }
            if (down === 0) {
              ctx.fillStyle = 'rgba(22, 62, 119, 0.45)';
              ctx.fillRect(px, py + TILE_PX - 2, TILE_PX, 2);
            }
            if (left === 0) {
              ctx.fillStyle = 'rgba(22, 62, 119, 0.45)';
              ctx.fillRect(px, py, 2, TILE_PX);
            }
            if (right === 0) {
              ctx.fillStyle = 'rgba(22, 62, 119, 0.45)';
              ctx.fillRect(px + TILE_PX - 2, py, 2, TILE_PX);
            }
          }
          // Cỏ giáp cát hoặc giáp nước
          else if (tileType === 3) { // GRASS
            if (up === 2) {
              ctx.fillStyle = 'rgba(67, 122, 51, 0.35)';
              ctx.fillRect(px, py, TILE_PX, 1);
            } else if (up === 0 || up === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(px, py, TILE_PX, 1);
            }
            if (down === 2) {
              ctx.fillStyle = 'rgba(67, 122, 51, 0.35)';
              ctx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1);
            } else if (down === 0 || down === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1);
            }
            if (left === 2) {
              ctx.fillStyle = 'rgba(67, 122, 51, 0.35)';
              ctx.fillRect(px, py, 1, TILE_PX);
            } else if (left === 0 || left === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(px, py, 1, TILE_PX);
            }
            if (right === 2) {
              ctx.fillStyle = 'rgba(67, 122, 51, 0.35)';
              ctx.fillRect(px + TILE_PX - 1, py, 1, TILE_PX);
            } else if (right === 0 || right === 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
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
