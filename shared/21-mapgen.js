// shared/21-mapgen.js
// Sinh ban do 320x320 tile tu seed gom 10 dao, dai nuoc nong, bo bien gon va ben thuyen.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js, shared/05-rng.js, shared/14-data-islands.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;
  const CONST = S.CONST || { MAP_TILES: 320 };

  const MAP_W = CONST.MAP_TILES || 320;
  const MAP_H = CONST.MAP_TILES || 320;

  // Thuat toan bam FNV-1a 32-bit de kiem tra tinh dong nhat giua Node va Browser
  function fnv1a(uint8Arr) {
    let hash = 2166136261;
    for (let i = 0; i < uint8Arr.length; i++) {
      hash ^= uint8Arr[i];
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function generate(seed) {
    const s = (typeof seed === 'number') ? seed : 1;
    const rng = (S.RNG && S.RNG.create) ? S.RNG.create(s) : {
      next: function () { return 0.5; }
    };

    const totalTiles = MAP_W * MAP_H;
    const tiles = new Uint8Array(totalTiles);
    // Mac dinh toan bo ban do la bien sau (DEEP = 0)
    tiles.fill(T.DEEP);

    const islands = S.ISLANDS || {};
    const docks = [];
    const spawns = [];

    // Duyet qua tung dao va tao dia hinh
    for (const key in islands) {
      const isl = islands[key];
      const cx = isl.cx;
      const cy = isl.cy;
      const baseR = isl.radius;

      // Cac he so pha gon song bo bien
      const p1 = rng.next() * Math.PI * 2;
      const p2 = rng.next() * Math.PI * 2;
      const p3 = rng.next() * Math.PI * 2;
      const shallowWidth = 3; // Dai nuoc nong rong 3 tile quanh dao

      const boundR = Math.ceil(baseR + shallowWidth + 4);
      const minX = Math.max(1, cx - boundR);
      const maxX = Math.min(MAP_W - 2, cx + boundR);
      const minY = Math.max(1, cy - boundR);
      const maxY = Math.min(MAP_H - 2, cy + boundR);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const angle = Math.atan2(dy, dx);

          // Ban kinh bien doi tao gon bo bien tu nhien
          const wave = 1.0 +
            0.14 * Math.sin(3 * angle + p1) +
            0.08 * Math.cos(5 * angle + p2) +
            0.04 * Math.sin(7 * angle + p3);

          const rCoast = baseR * wave;
          const dist = Math.hypot(dx, dy);
          const idx = y * MAP_W + x;

          if (dist <= rCoast) {
            // Vung dat lien cua dao
            let tileType = isl.baseTile;

            // Xử lý tiểu vùng đặc trưng (biome)
            if (isl.id === 'fire_ice') {
              tileType = (dx > 0) ? T.LAVA : T.ICE;
            } else if (isl.id === 'canal_city') {
              if (Math.abs(dx) <= 1 || Math.abs(dy) <= 1) {
                tileType = T.SHALLOW; // Kenh nuoc nong
              } else if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
                tileType = T.BRIDGE; // Cau bac qua kenh
              } else {
                tileType = T.FLOOR;
              }
            } else if (isl.id === 'fortress') {
              // Tuong thanh quanh ria dao
              if (dist >= rCoast - 2 && dist <= rCoast) {
                tileType = T.WALL;
              } else {
                tileType = (dist <= baseR * 0.4) ? T.FLOOR : T.STONE;
              }
            } else if (isl.id === 'desert') {
              tileType = (dist <= baseR * 0.35) ? T.QUICKSAND : T.SAND;
            } else if (isl.id === 'mangrove') {
              tileType = (dist >= baseR * 0.4 && dist <= baseR * 0.6) ? T.SHALLOW : T.GRASS;
            } else if (isl.subTile && dist <= baseR * 0.45) {
              tileType = isl.subTile;
            }

            tiles[idx] = tileType;

          } else if (dist <= rCoast + shallowWidth) {
            // Dai nuoc nong bao quanh dao (neu chua bi ghi de boi dat)
            if (tiles[idx] === T.DEEP) {
              tiles[idx] = T.SHALLOW;
            }
          }
        }
      }

      // Diem spawn tren dao (vi tri tam dao hoac canh tam)
      spawns.push({
        islandId: isl.id,
        tx: cx,
        ty: cy,
        x: cx * 16 + 8,
        y: cy * 16 + 8
      });

      // Tao ben thuyen (1-2 ben huong ra bien ngoai)
      const dockAngle = (isl.id === 'fortress') ? (Math.PI / 2) : Math.atan2(cy - 160, cx - 160);
      const dockDist = baseR;
      const dockX = Math.round(cx + Math.cos(dockAngle) * (dockDist + 1));
      const dockY = Math.round(cy + Math.sin(dockAngle) * (dockDist + 1));

      // Dat tile ben thuyen 2x2
      for (let dy = 0; dy <= 1; dy++) {
        for (let dx = 0; dx <= 1; dx++) {
          const dtx = dockX + dx;
          const dty = dockY + dy;
          if (dtx >= 0 && dtx < MAP_W && dty >= 0 && dty < MAP_H) {
            tiles[dty * MAP_W + dtx] = T.DOCK;
          }
        }
      }

      docks.push({
        islandId: isl.id,
        tx: dockX,
        ty: dockY,
        x: dockX * 16 + 8,
        y: dockY * 16 + 8
      });
    }

    const hash = fnv1a(tiles);

    return {
      seed: s,
      width: MAP_W,
      height: MAP_H,
      tiles: tiles,
      hash: hash,
      islands: islands,
      docks: docks,
      spawns: spawns
    };
  }

  S.MAPGEN = Object.freeze({
    generate: generate,
    hash: fnv1a
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
