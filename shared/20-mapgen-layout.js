// shared/20-mapgen-layout.js
// Phan bo tri cua mapgen: nhieu gia tri co seed, hinh dang dao (elip xoay, keo dai, lech toa do tao vinh/mui dat),
// bo tri 10 dao theo seed (phao dai o tam, 9 dao rai khap map, co eo bien hep), 8-15 dao nho giua bien,
// va got bo de khoang cach bo that luon dat toi thieu. Chi so hoc + Math.floor/sqrt/imul, khong luong giac.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js. Dung boi shared/21-mapgen.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;
  const CONST = S.CONST || { MAP_TILES: 320 };

  const MAP_W = CONST.MAP_TILES || 320;
  const MAP_H = CONST.MAP_TILES || 320;
  // Bien do gon bo bien (ty le ban kinh) va do rong dai nuoc nong (tile)
  const COAST_MIN = 0.9;
  const COAST_SPAN = 0.22;
  const SHALLOW_MIN = 2;
  const SHALLOW_SPAN = 2;

  // Bo tri dao: le mep map, khoang cach bo toi thieu, eo bien hep (gap 8-12), dao nho giua bien
  const EDGE_MARGIN = 20;
  const GAP_MIN = 8;
  const STRAIT_EST = 3;      // eo bien: khoang trong uoc luong 3-7 (bo that thuong 8-12 sau khi got)
  const STRAIT_SPAN = 4;
  const STRAIT_CHANCE = 0.45;
  const STRETCH_SPAN = 0.3;  // he so keo dai k trong [1, 1.3]: truc lon R*k, truc nho R/k
  const WARP_F = 0.18;       // do lech toa do (ty le ban kinh) tao vinh va mui dat
  const LAYOUT_TRIES = 400;
  const LAYOUT_PICK = 16;    // so ung vien hop le so sanh moi dao (che do rai)
  const LAYOUT_RESTARTS = 500;
  const ISLET_MIN = 8;
  const ISLET_SPAN = 8;      // 8..15 dao nho
  const ISLET_GAP = 4;
  const OWNER_ISLET = 11;    // owner >= 11 la dao nho, 1..10 la dao lon
  const REACH_COAST = 0.7;   // phan bien do bo tinh vao uoc luong tam voi
  const REACH_WARP = 0.6;    // phan warp tinh vao uoc luong tam voi

  // Vi tri du phong neu lay mau that bai (vong cu, tinh san thanh so nguyen)
  const FALLBACK_POS = [[270, 160], [244, 231], [179, 268], [105, 255], [57, 198], [57, 122], [105, 65], [179, 52], [244, 89]];


  // Bam so nguyen (x, y, seed) -> [0, 1)
  function hashInt(x, y, seed) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // Nhieu gia tri 2D noi suy muot (smoothstep), tan so theo 'cell' tile
  function valueNoise(x, y, cell, seed) {
    const fx = x / cell;
    const fy = y / cell;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = hashInt(x0, y0, seed);
    const b = hashInt(x0 + 1, y0, seed);
    const c = hashInt(x0, y0 + 1, seed);
    const d = hashInt(x0 + 1, y0 + 1, seed);
    const top = a + (b - a) * sx;
    const bot = c + (d - c) * sx;
    return top + (bot - top) * sy;
  }

  // 2 tang nhieu: dang lon + chi tiet nho
  function fbm(x, y, cell, seed) {
    return valueNoise(x, y, cell, seed) * 0.65 + valueNoise(x, y, cell / 2.5, seed + 101) * 0.35;
  }

  function distOf(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ----- Hinh dang dao: elip xoay (ux, uy), keo dai k, lech toa do 'warp' tile -----

  // Khoang cach chuan hoa: bang R tren duong elip goc, chua tinh nhieu bo
  function shapeDist(isl, x, y, seed) {
    let dx = x - isl.cx;
    let dy = y - isl.cy;
    if (isl.warp > 0) {
      dx += (fbm(x, y, 16, seed + 71) - 0.5) * 2 * isl.warp;
      dy += (fbm(x, y, 16, seed + 89) - 0.5) * 2 * isl.warp;
    }
    const p = dx * isl.ux + dy * isl.uy;
    const q = dy * isl.ux - dx * isl.uy;
    return distOf(p / isl.k, q * isl.k);
  }

  // Gap toi thieu giua dat lien 2 dao (owner a, b): 2 dao lon GAP_MIN, co dao nho ISLET_GAP
  function gapOf(a, b) {
    return (a < OWNER_ISLET && b < OWNER_ISLET) ? GAP_MIN : ISLET_GAP;
  }

  // Got bo: o dat cua dao owner lon hon nam gan dat dao khac hon gap -> thanh nuoc nong.
  // Bao dam khoang cach bo that (khong chi uoc luong) luon dat GAP_MIN / ISLET_GAP.
  function carveGaps(tiles, owner) {
    const r = GAP_MIN - 1;
    for (let y = 1; y < MAP_H - 1; y++) {
      for (let x = 1; x < MAP_W - 1; x++) {
        const b = owner[y * MAP_W + x];
        if (!b) continue;
        let hit = false;
        for (let yy = Math.max(0, y - r); yy <= Math.min(MAP_H - 1, y + r) && !hit; yy++) {
          for (let xx = Math.max(0, x - r); xx <= Math.min(MAP_W - 1, x + r); xx++) {
            const a = owner[yy * MAP_W + xx];
            if (!a || a >= b) continue;
            const ddx = xx - x;
            const ddy = yy - y;
            const g = gapOf(a, b);
            if (ddx * ddx + ddy * ddy < g * g) {
              hit = true;
              break;
            }
          }
        }
        if (hit) {
          tiles[y * MAP_W + x] = T.SHALLOW;
          owner[y * MAP_W + x] = 0;
        }
      }
    }
  }

  // Tam voi uoc luong cua dat lien theo huong don vi (vx, vy): ham ho tro cua elip + bo + warp.
  // Uoc luong hoi lac quan (bo hiem khi cham bien do toi da); carveGaps sua cho hep hon thuc te.
  function reach(isl, vx, vy) {
    const a = isl.radius * isl.k * (vx * isl.ux + vy * isl.uy);
    const b = isl.radius / isl.k * (vy * isl.ux - vx * isl.uy);
    return distOf(a, b) * (COAST_MIN + COAST_SPAN * REACH_COAST) + isl.warp * REACH_WARP;
  }

  // 2 dao tach nhau it nhat 'gap' tile (chieu len duong noi tam la dieu kien du)
  function apart(a, b, gap) {
    const vx = b.cx - a.cx;
    const vy = b.cy - a.cy;
    const d = distOf(vx, vy);
    if (d < 1) return false;
    return d >= reach(a, vx / d, vy / d) + reach(b, vx / d, vy / d) + gap;
  }

  function insideMap(isl) {
    const rx = reach(isl, 1, 0);
    const ry = reach(isl, 0, 1);
    return isl.cx - rx >= EDGE_MARGIN && isl.cx + rx <= MAP_W - 1 - EDGE_MARGIN &&
      isl.cy - ry >= EDGE_MARGIN && isl.cy + ry <= MAP_H - 1 - EDGE_MARGIN;
  }

  // Huong ngau nhien da chuan hoa bang sqrt (khong luong giac)
  function randomDir(rng) {
    for (let i = 0; i < 50; i++) {
      const vx = rng.next() * 2 - 1;
      const vy = rng.next() * 2 - 1;
      const d = distOf(vx, vy);
      if (d > 0.2 && d <= 1) return [vx / d, vy / d];
    }
    return [1, 0];
  }

  // Ban sao dao kem vi tri + hinh dang (khong sua S.ISLANDS)
  function makeShape(def, cx, cy, dir, k, warp) {
    const o = {};
    for (const key in def) o[key] = def[key];
    o.cx = cx;
    o.cy = cy;
    o.ux = dir[0];
    o.uy = dir[1];
    o.k = k;
    o.warp = warp;
    return o;
  }

  // Khoang trong nho nhat (tile) giua dao moi va cac dao da dat; < gap la khong hop le
  function clearance(isl, placed) {
    let best = 1e9;
    for (let j = 0; j < placed.length; j++) {
      const a = placed[j];
      const vx = isl.cx - a.cx;
      const vy = isl.cy - a.cy;
      const d = distOf(vx, vy);
      if (d < 1) return -1;
      const c = d - reach(a, vx / d, vy / d) - reach(isl, vx / d, vy / d);
      if (c < best) best = c;
    }
    return best;
  }

  // Thu dat 1 dao. Che do eo bien: sat 1 dao da co, cach bo 8-12 tile.
  // Che do rai: lay vai ung vien hop le, chon cai thoang nhat (dao lan ra ca goc map).
  function tryPlace(rng, def, placed) {
    const strait = placed.length > 1 && rng.next() < STRAIT_CHANCE;
    let best = null;
    let bestC = -1;
    let found = 0;
    for (let t = 0; t < LAYOUT_TRIES && found < LAYOUT_PICK; t++) {
      const k = 1 + rng.next() * STRETCH_SPAN;
      const isl = makeShape(def, 0, 0, randomDir(rng), k, Math.round(def.radius * WARP_F));
      if (strait && t < LAYOUT_TRIES / 2) {
        const nb = placed[1 + Math.floor(rng.next() * (placed.length - 1))];
        const v = randomDir(rng);
        const gap = STRAIT_EST + 0.5 + rng.next() * STRAIT_SPAN;
        const d = reach(nb, v[0], v[1]) + reach(isl, v[0], v[1]) + gap;
        isl.cx = Math.round(nb.cx + v[0] * d);
        isl.cy = Math.round(nb.cy + v[1] * d);
        if (insideMap(isl) && clearance(isl, placed) >= STRAIT_EST) return isl;
        continue;
      }
      isl.cx = Math.round(EDGE_MARGIN + rng.next() * (MAP_W - 2 * EDGE_MARGIN));
      isl.cy = Math.round(EDGE_MARGIN + rng.next() * (MAP_H - 2 * EDGE_MARGIN));
      if (!insideMap(isl)) continue;
      const c = clearance(isl, placed);
      if (c < GAP_MIN) continue;
      found++;
      if (c > bestC) {
        bestC = c;
        best = isl;
      }
    }
    return best;
  }

  // Bo tri 10 dao: phao dai o tam, 9 dao lay mau theo seed; that bai het thi dung vi tri du phong
  function layoutIslands(rng, islands, keys) {
    const fort = makeShape(islands.fortress, MAP_W / 2, MAP_H / 2, [1, 0], 1, 0);
    const others = keys.filter(function (k) { return k !== 'fortress'; });
    for (let r = 0; r < LAYOUT_RESTARTS; r++) {
      const placed = [fort];
      for (let i = 0; i < others.length; i++) {
        const isl = tryPlace(rng, islands[others[i]], placed);
        if (!isl) break;
        placed.push(isl);
      }
      if (placed.length === others.length + 1) return placed;
    }
    const placed = [fort];
    for (let i = 0; i < others.length; i++) {
      const pos = FALLBACK_POS[i % FALLBACK_POS.length];
      placed.push(makeShape(islands[others[i]], pos[0], pos[1], [1, 0], 1, 0));
    }
    return placed;
  }

  // Dao nho (da hoac bai cat) giua bien, cach dao khac >= ISLET_GAP tile
  function layoutIslets(rng, big) {
    const count = ISLET_MIN + Math.floor(rng.next() * ISLET_SPAN);
    const list = [];
    for (let t = 0; t < count * 80 && list.length < count; t++) {
      const def = { id: 'islet', radius: 3 + rng.next() * 3, rock: rng.next() < 0.5 };
      const isl = makeShape(def, 0, 0, randomDir(rng), 1 + rng.next() * 0.3, 1);
      isl.cx = Math.round(EDGE_MARGIN + rng.next() * (MAP_W - 2 * EDGE_MARGIN));
      isl.cy = Math.round(EDGE_MARGIN + rng.next() * (MAP_H - 2 * EDGE_MARGIN));
      if (!insideMap(isl)) continue;
      let ok = true;
      for (let j = 0; j < big.length && ok; j++) ok = apart(big[j], isl, ISLET_GAP);
      for (let j = 0; j < list.length && ok; j++) ok = apart(list[j], isl, ISLET_GAP + 2);
      if (ok) list.push(isl);
    }
    return list;
  }


  S.MAPLAYOUT = Object.freeze({
    COAST_MIN: COAST_MIN,
    COAST_SPAN: COAST_SPAN,
    SHALLOW_MIN: SHALLOW_MIN,
    SHALLOW_SPAN: SHALLOW_SPAN,
    OWNER_ISLET: OWNER_ISLET,
    noise: valueNoise,
    fbm: fbm,
    dist: distOf,
    shapeDist: shapeDist,
    reach: reach,
    layoutIslands: layoutIslands,
    layoutIslets: layoutIslets,
    carveGaps: carveGaps
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
