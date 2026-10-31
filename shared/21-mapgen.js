// shared/21-mapgen.js
// Sinh ban do 320x320 tile tu seed: bo tri 10 dao theo seed (phao dai o tam, 9 dao rai khap map,
// hinh elip xoay co vinh/mui dat), 8-15 dao da/bai cat nho giua bien, bai cat, vung biome rai tu nhien,
// cong phao dai, ben thuyen dang cau tau, cay, nha, ruong, diem boss va diem spawn.
// Chi dung phep tinh so hoc + Math.floor/sqrt/imul (ket qua giong het tren moi trinh duyet va Node),
// KHONG dung sin/cos/atan2 (do chinh xac co the khac nhau giua cac engine) va KHONG Math.random.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js, shared/05-rng.js, shared/14-data-islands.js,
//            shared/20-mapgen-layout.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;
  const CONST = S.CONST || { MAP_TILES: 320 };

  const MAP_W = CONST.MAP_TILES || 320;
  const MAP_H = CONST.MAP_TILES || 320;

  // Ham nhieu, hinh dang va bo tri dao lay tu shared/20-mapgen-layout.js
  const L = S.MAPLAYOUT;
  const COAST_MIN = L.COAST_MIN;
  const COAST_SPAN = L.COAST_SPAN;
  const SHALLOW_MIN = L.SHALLOW_MIN;
  const SHALLOW_SPAN = L.SHALLOW_SPAN;
  const OWNER_ISLET = L.OWNER_ISLET;
  const fbm = L.fbm;
  const distOf = L.dist;
  const shapeDist = L.shapeDist;
  const reach = L.reach;

  // Tile dat lien dat duoc cay/nha/ruong
  const PLACEABLE = [T.GRASS, T.SAND, T.SNOW, T.DIRT, T.STONE, T.FLOOR, T.WOOD];

  // Nha nhieu o: [rong, cao] tinh ca tuong; cua Nam rong HOUSE_DOOR_W o (nha da them cua Bac)
  const HOUSE_SIZE = { house_small: [6, 5], house_wood: [8, 6], house_stone: [10, 7] };
  const HOUSE_DOOR_W = 2;

  function fnv1a(uint8Arr) {
    let hash = 2166136261;
    for (let i = 0; i < uint8Arr.length; i++) {
      hash ^= uint8Arr[i];
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  // ----- Dia hinh tung dao -----

  // Tile dat lien tai (x, y) cua dao; dist = khoang cach toi tam, rC = ban kinh bo tai diem nay
  function landTile(isl, x, y, dx, dy, dist, rC, seed) {
    const R = isl.radius;
    const n = fbm(x, y, 7, seed + 7);

    switch (isl.id) {
      case 'islet':
        if (isl.rock) return (dist < R * 0.7) ? T.STONE : T.SAND;
        return (n > 0.72) ? T.STONE : T.SAND;
      case 'fortress': {
        // Tuong thanh day 2 o sat bo, 4 cong rong 3 o (Bac, Nam, Dong, Tay)
        const inGate = (Math.abs(dx) <= 1 || Math.abs(dy) <= 1);
        if (dist >= rC - 2) return inGate ? T.STONE : T.WALL;
        return (dist <= R * 0.4) ? T.FLOOR : T.STONE;
      }
      case 'desert':
        return (dist < R * 0.8 && n > 0.66) ? T.QUICKSAND : T.SAND;
      case 'winter':
        return (n > 0.64) ? T.ICE : T.SNOW;
      case 'fire_ice': {
        // Ranh gioi gon theo nhieu; nua Dong da nui lua co vung dung nham, nua Tay tuyet co mat bang
        const side = dx + (fbm(x, y, 9, seed + 31) - 0.5) * 10;
        if (side > 0) return (n > 0.6) ? T.LAVA : T.STONE;
        return (n > 0.62) ? T.ICE : T.SNOW;
      }
      case 'canal_city': {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        // Kenh doc va ngang rong 3 o, cau bac qua kenh moi 8 o, ke da 1 o hai ben kenh
        if (ax <= 1) return (ay % 8 === 4) ? T.BRIDGE : T.SHALLOW;
        if (ay <= 1) return (ax % 8 === 4) ? T.BRIDGE : T.SHALLOW;
        if (ax === 2 || ay === 2) return T.STONE;
        return (n > 0.7) ? T.STONE : T.FLOOR;
      }
      case 'mangrove': {
        // Dao con o giua va cac cum dao ngoai, xen nuoc nong; cau go chu thap noi tu tam ra bo
        const middle = dist >= R * 0.4 && dist <= R * 0.62;
        const islet = dist < R * 0.4 || (dist > R * 0.62 && n > 0.36);
        if (middle || !islet) {
          if (Math.abs(dx) <= 1 || Math.abs(dy) <= 1) return T.BRIDGE;
          return T.SHALLOW;
        }
        return (dist >= rC - 2) ? T.SAND : T.GRASS;
      }
      default: {
        // Dao co (jungle, samurai, giant) va dao Ma (dat): bai cat 1-3 o quanh bo, mang biome phu
        const beachW = 1 + fbm(x, y, 6, seed + 53) * 2;
        if (isl.baseTile === T.GRASS && dist >= rC - beachW) return T.SAND;
        if (isl.subTile !== undefined && isl.subTile !== T.SHALLOW && dist < R * 0.85 && n > 0.66) return isl.subTile;
        return isl.baseTile;
      }
    }
  }

  // Ve 1 dao vao mang tiles; owner ghi dat lien thuoc dao nao (1..10 dao lon, >= 11 dao nho)
  function paintIsland(tiles, owner, ownerId, isl, seed) {
    const cx = isl.cx;
    const cy = isl.cy;
    const R = isl.radius;
    const pad = SHALLOW_MIN + SHALLOW_SPAN + 1;
    const bx = Math.ceil(reach(isl, 1, 0) + pad);
    const by = Math.ceil(reach(isl, 0, 1) + pad);

    for (let y = Math.max(1, cy - by); y <= Math.min(MAP_H - 2, cy + by); y++) {
      for (let x = Math.max(1, cx - bx); x <= Math.min(MAP_W - 2, cx + bx); x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = shapeDist(isl, x, y, seed);
        const rC = R * (COAST_MIN + COAST_SPAN * fbm(x, y, 9, seed));
        const idx = y * MAP_W + x;

        if (dist <= rC) {
          tiles[idx] = landTile(isl, x, y, dx, dy, dist, rC, seed);
          owner[idx] = ownerId;
        } else if (dist <= rC + SHALLOW_MIN + SHALLOW_SPAN * fbm(x, y, 5, seed + 17)) {
          if (tiles[idx] === T.DEEP) tiles[idx] = T.SHALLOW;
        }
      }
    }
  }

  function isWaterTile(t) {
    return t === T.DEEP || t === T.SHALLOW;
  }

  // Ben thuyen dang cau tau: di tu tam theo huong (ux, uy) toi mep bo,
  // roi lat 2 o rong, dai toi khi cham nuoc sau (toi da 6 o). Tra ve o dau cau tau tren bo.
  function buildPier(tiles, cx, cy, ux, uy) {
    let lastLand = null;
    for (let s = 0; s < 60; s++) {
      const tx = Math.round(cx + ux * s);
      const ty = Math.round(cy + uy * s);
      if (tx < 1 || ty < 1 || tx >= MAP_W - 1 || ty >= MAP_H - 1) break;
      const t = tiles[ty * MAP_W + tx];
      if (!isWaterTile(t)) {
        lastLand = { tx: tx, ty: ty, s: s };
      } else if (lastLand) {
        break;
      }
    }
    if (!lastLand) return null;

    // Vuong goc de cau tau rong 2 o
    const px = Math.abs(ux) >= Math.abs(uy) ? 0 : 1;
    const py = 1 - px;
    for (let k = 1; k <= 6; k++) {
      const tx = Math.round(cx + ux * (lastLand.s + k));
      const ty = Math.round(cy + uy * (lastLand.s + k));
      const i0 = ty * MAP_W + tx;
      const i1 = (ty + py) * MAP_W + (tx + px);
      if (tiles[i0] === T.DEEP && k > 2) break;
      tiles[i0] = T.DOCK;
      tiles[i1] = T.DOCK;
    }
    return lastLand;
  }

  // Lay mau diem ngau nhien trong dao (khong dung luong giac): thu toi da 'tries' lan
  function sampleSpot(tiles, rng, isl, minF, maxF, okFn, tries) {
    const R = isl.radius;
    for (let i = 0; i < tries; i++) {
      const p = (rng.next() * 2 - 1) * R * maxF;
      const q = (rng.next() * 2 - 1) * R * maxF;
      const d = distOf(p, q);
      if (d < R * minF || d > R * maxF) continue;
      // Doi tu toa do elip (p doc truc lon, q doc truc nho) sang toa do map
      const tx = isl.cx + Math.round(isl.ux * p * isl.k - isl.uy * q / isl.k);
      const ty = isl.cy + Math.round(isl.uy * p * isl.k + isl.ux * q / isl.k);
      if (okFn(tx, ty, tiles[ty * MAP_W + tx])) return { tx: tx, ty: ty };
    }
    return null;
  }

  // Khong dat gan vat da co (khoang cach Chebyshev theo tile)
  function farFrom(list, tx, ty, minGap) {
    for (let i = 0; i < list.length; i++) {
      if (Math.max(Math.abs(list[i].tx - tx), Math.abs(list[i].ty - ty)) < minGap) return false;
    }
    return true;
  }

  function generate(seed) {
    const s = (typeof seed === 'number') ? seed : 1;
    const rng = (S.RNG && S.RNG.create) ? S.RNG.create(s) : { next: function () { return 0.5; } };

    const tiles = new Uint8Array(MAP_W * MAP_H);
    tiles.fill(T.DEEP);

    const defs = S.ISLANDS || {};
    const keys = Object.keys(defs);
    const owner = new Uint8Array(MAP_W * MAP_H);
    const docks = [];
    const spawns = [];
    const trees = [];
    const houses = [];
    const chests = [];
    const bosses = [];
    const reserved = new Uint8Array(MAP_W * MAP_H); // o nha + them cua: cay/ruong khong duoc dat
    const houseRects = [];

    // 1. Bo tri (rng rieng de doi bo tri khong lam lech viec dat vat), roi ve dia hinh (moi dao 1 hat nhieu rieng)
    const layoutRng = (S.RNG && S.RNG.create) ? S.RNG.create((s * 7 + 13) | 0) : rng;
    const placed = L.layoutIslands(layoutRng, defs, keys);
    const islands = {};
    for (let k = 0; k < placed.length; k++) islands[placed[k].id] = placed[k];
    const islets = L.layoutIslets(layoutRng, placed);

    for (let k = 0; k < keys.length; k++) {
      paintIsland(tiles, owner, k + 1, islands[keys[k]], (s * 97 + k * 7919) | 0);
    }
    for (let k = 0; k < islets.length; k++) {
      paintIsland(tiles, owner, OWNER_ISLET + k, islets[k], (s * 131 + k * 3571) | 0);
    }
    L.carveGaps(tiles, owner);

    for (let k = 0; k < keys.length; k++) {
      const isl = islands[keys[k]];
      const cx = isl.cx;
      const cy = isl.cy;
      const placed = []; // moi vat tren dao nay, de giu khoang cach

      // 2. Diem spawn nguoi choi (tam dao)
      spawns.push({ islandId: isl.id, tx: cx, ty: cy, x: cx * 16 + 8, y: cy * 16 + 8 });
      placed.push({ tx: cx, ty: cy });

      // 3. Ben thuyen: phao dai 2 ben qua cong Bac/Nam; dao khac 1 ben huong ve tam ban do
      const dirs = [];
      if (isl.id === 'fortress') {
        dirs.push([0, -1], [0, 1]);
      } else {
        const vx = MAP_W / 2 - cx;
        const vy = MAP_H / 2 - cy;
        const len = distOf(vx, vy) || 1;
        dirs.push([vx / len, vy / len]);
      }
      for (let d = 0; d < dirs.length; d++) {
        const land = buildPier(tiles, cx, cy, dirs[d][0], dirs[d][1]);
        if (land) {
          docks.push({ islandId: isl.id, tx: land.tx, ty: land.ty, x: land.tx * 16 + 8, y: land.ty * 16 + 8 });
          placed.push({ tx: land.tx, ty: land.ty });
        }
      }

      // Phao dai: chua trong 2 truc cong (rong 5 o) de cay/nha khong bit loi ra vao
      const onLand = function (tx, ty, t) {
        if (isl.id === 'fortress' && (Math.abs(tx - cx) <= 2 || Math.abs(ty - cy) <= 2)) return false;
        return PLACEABLE.indexOf(t) !== -1;
      };

      // 4. Boss: vong giua dao
      if (isl.boss) {
        const b = sampleSpot(tiles, rng, isl, 0.35, 0.6, onLand, 200) || { tx: cx, ty: cy };
        bosses.push({ id: isl.boss, islandId: isl.id, tx: b.tx, ty: b.ty, x: b.tx * 16 + 8, y: b.ty * 16 + 8 });
      }

      // 5. Nha nhieu o: tuong HOUSE_WALL bao quanh, san ben trong, cua rong 2 o (Nam; nha da them cua Bac)
      let houseType = 'house_wood';
      if (isl.id === 'fortress') houseType = 'house_stone';
      else if (isl.id === 'canal_city' || isl.id === 'samurai') houseType = 'house_small';
      const hsz = HOUSE_SIZE[houseType];
      const hw = hsz[0];
      const hh = hsz[1];
      const floorTile = (houseType === 'house_stone') ? T.FLOOR : T.WOOD;
      const houseCount = (isl.props && isl.props.houses) || 2;
      for (let i = 0; i < houseCount; i++) {
        const h = sampleSpot(tiles, rng, isl, 0.2, 0.7, function (tx, ty) {
          const hx = tx - Math.floor(hw / 2);
          const hy = ty - Math.floor(hh / 2);
          if (hx - 1 < 1 || hy - 1 < 1 || hx + hw > MAP_W - 2 || hy + hh > MAP_H - 2) return false;
          for (let yy = hy - 1; yy <= hy + hh; yy++) {
            for (let xx = hx - 1; xx <= hx + hw; xx++) {
              if (!onLand(xx, yy, tiles[yy * MAP_W + xx])) return false;
            }
          }
          for (let q = 0; q < placed.length; q++) {
            const pq = placed[q];
            if (pq.tx >= hx - 3 && pq.tx <= hx + hw + 2 && pq.ty >= hy - 3 && pq.ty <= hy + hh + 2) return false;
          }
          for (let q = 0; q < bosses.length; q++) {
            const bq = bosses[q];
            if (bq.islandId === isl.id && bq.tx >= hx - 3 && bq.tx <= hx + hw + 2 && bq.ty >= hy - 3 && bq.ty <= hy + hh + 2) return false;
          }
          for (let q = 0; q < houseRects.length; q++) {
            const r = houseRects[q];
            if (hx - 3 <= r.x1 && hx + hw + 2 >= r.x0 && hy - 3 <= r.y1 && hy + hh + 2 >= r.y0) return false;
          }
          return true;
        }, 400);
        if (!h) continue;

        const x0 = h.tx - Math.floor(hw / 2);
        const y0 = h.ty - Math.floor(hh / 2);
        const doorX = x0 + hw / 2 - 1;
        const doors = [{ tx: doorX, ty: y0 + hh - 1, side: 'S' }];
        if (houseType === 'house_stone') doors.push({ tx: doorX, ty: y0, side: 'N' });

        // Tuong vien, san ben trong va o cua
        for (let yy = y0; yy < y0 + hh; yy++) {
          for (let xx = x0; xx < x0 + hw; xx++) {
            const edge = (xx === x0 || xx === x0 + hw - 1 || yy === y0 || yy === y0 + hh - 1);
            let isDoor = false;
            for (let d = 0; d < doors.length; d++) {
              if (yy === doors[d].ty && xx >= doors[d].tx && xx < doors[d].tx + HOUSE_DOOR_W) isDoor = true;
            }
            tiles[yy * MAP_W + xx] = (edge && !isDoor) ? T.HOUSE_WALL : floorTile;
          }
        }

        // Giu cho: nha + 1 o quanh nha + 2 o them ngoai moi cua
        for (let yy = y0 - 1; yy <= y0 + hh; yy++) {
          for (let xx = x0 - 1; xx <= x0 + hw; xx++) reserved[yy * MAP_W + xx] = 1;
        }
        for (let d = 0; d < doors.length; d++) {
          const dir = (doors[d].side === 'S') ? 1 : -1;
          for (let k = 1; k <= 2; k++) {
            const ry = doors[d].ty + dir * k;
            if (ry < 0 || ry >= MAP_H) continue;
            for (let w2 = 0; w2 < HOUSE_DOOR_W; w2++) reserved[ry * MAP_W + doors[d].tx + w2] = 1;
          }
        }

        // Noi that trang tri: o trong sat tuong, tru 2 cot cua
        const cand = [];
        for (let yy = y0 + 1; yy <= y0 + hh - 2; yy++) {
          for (let xx = x0 + 1; xx <= x0 + hw - 2; xx++) {
            if (xx === doorX || xx === doorX + 1) continue;
            if (tiles[yy * MAP_W + xx - 1] === T.HOUSE_WALL || tiles[yy * MAP_W + xx + 1] === T.HOUSE_WALL ||
                tiles[(yy - 1) * MAP_W + xx] === T.HOUSE_WALL || tiles[(yy + 1) * MAP_W + xx] === T.HOUSE_WALL) {
              cand.push({ tx: xx, ty: yy });
            }
          }
        }
        const crateN = 1 + (hw >= 8 ? 1 : 0);
        const barrelN = 1 + (rng.next() < 0.5 ? 1 : 0);
        const props = [];
        for (let n = 0; n < crateN + barrelN && cand.length > 0; n++) {
          const pick = cand.splice(Math.min(cand.length - 1, Math.floor(rng.next() * cand.length)), 1)[0];
          props.push({
            kind: (n < crateN) ? 'crate' : 'barrel',
            tx: pick.tx, ty: pick.ty, x: pick.tx * 16 + 8, y: pick.ty * 16 + 8
          });
        }

        houses.push({
          type: houseType, islandId: isl.id, tx: x0, ty: y0, w: hw, h: hh,
          x: (x0 + hw / 2) * 16, y: (y0 + hh / 2) * 16, doors: doors, props: props
        });
        houseRects.push({ x0: x0, y0: y0, x1: x0 + hw - 1, y1: y0 + hh - 1 });
        placed.push(h);
      }

      // 6. Cay (cach nhau >= 2 o)
      let treeType = 'tree_palm';
      if (isl.id === 'winter') treeType = 'tree_pine';
      else if (isl.id === 'jungle' || isl.id === 'giant') treeType = 'tree_jungle';
      const treeCount = (isl.props && isl.props.trees) || Math.round(isl.radius * 0.35);
      for (let i = 0; i < treeCount; i++) {
        const t = sampleSpot(tiles, rng, isl, 0.15, 0.85, function (tx, ty, tt) {
          return onLand(tx, ty, tt) && tt !== T.FLOOR && !reserved[ty * MAP_W + tx] && farFrom(placed, tx, ty, 2);
        }, 300);
        if (!t) continue;
        tiles[t.ty * MAP_W + t.tx] = T.TREE;
        trees.push({ type: treeType, islandId: isl.id, tx: t.tx, ty: t.ty, x: t.tx * 16 + 8, y: t.ty * 16 + 8 });
        placed.push(t);
      }

      // 7. Ruong (cach nhau >= 3 o)
      const chestCount = (isl.props && isl.props.chests) || 5;
      for (let i = 0; i < chestCount; i++) {
        const c = sampleSpot(tiles, rng, isl, 0.15, 0.75, function (tx, ty, t) {
          return onLand(tx, ty, t) && !reserved[ty * MAP_W + tx] && farFrom(placed, tx, ty, 3);
        }, 300);
        if (!c) continue;
        let tier = 'wood';
        if (isl.id === 'fortress') tier = (i === 0) ? 'gold' : ((i <= 4) ? 'iron' : 'wood');
        else tier = (i < 2) ? 'iron' : 'wood';
        chests.push({
          id: `chest_${isl.id}_${i}`, tier: tier, islandId: isl.id,
          tx: c.tx, ty: c.ty, x: c.tx * 16 + 8, y: c.ty * 16 + 8, opened: false
        });
        placed.push(c);
      }
    }

    // 8. Dao nho >= 4 o: 1 cay dua lam cho nup, khong co ruong/boss
    for (let k = 0; k < islets.length; k++) {
      const it = islets[k];
      if (it.radius < 4 || PLACEABLE.indexOf(tiles[it.cy * MAP_W + it.cx]) === -1) continue;
      tiles[it.cy * MAP_W + it.cx] = T.TREE;
      trees.push({ type: 'tree_palm', islandId: 'islet', tx: it.cx, ty: it.cy, x: it.cx * 16 + 8, y: it.cy * 16 + 8 });
    }

    return {
      seed: s,
      width: MAP_W,
      height: MAP_H,
      tiles: tiles,
      hash: fnv1a(tiles),
      islands: islands,
      islets: islets,
      owner: owner,
      docks: docks,
      spawns: spawns,
      trees: trees,
      houses: houses,
      chests: chests,
      bosses: bosses
    };
  }

  S.MAPGEN = Object.freeze({
    generate: generate,
    hash: fnv1a,
    noise: L.noise
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
