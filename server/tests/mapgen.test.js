// server/tests/mapgen.test.js
// Unit test cho thuat toan sinh ban do mapgen 10 dao, tinh dong nhat cua seed hash va module world.js.
// Phu thuoc: server/tests/assert.js, shared/20-mapgen-layout.js, shared/21-mapgen.js, shared/14-data-islands.js, server/world.js.

'use strict';

const assert = require('./assert');

// Khoi tao moi truong shared tren Node
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/14-data-islands');
require('../../shared/20-mapgen-layout');
require('../../shared/21-mapgen');

const S = globalThis.OP_SHARED;
const World = require('../world');

const W = 320;
const T = S.TILE;

// Rang buoc bo tri tren 1 ban do: 10 dao, 8-15 dao nho, dat cach mep >= 20,
// bo that giua 2 dao lon >= 8, dao nho voi dao khac >= 4, moi diem spawn ra duoc bien sau
function checkLayout(map, sd) {
  assert.strictEqual(Object.keys(map.islands).length, 10, `Seed ${sd}: phai co 10 dao trong map.islands`);
  assert.ok(map.islets.length >= 8 && map.islets.length <= 15, `Seed ${sd}: so dao nho phai 8-15, thuc te ${map.islets.length}`);

  const o = map.owner;
  let minBig = 1e9;
  let minIslet = 1e9;
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const b = o[y * W + x];
      if (!b) continue;
      assert.ok(x >= 20 && x <= 299 && y >= 20 && y <= 299, `Seed ${sd}: dat (${x}, ${y}) qua sat mep map`);
      for (let yy = Math.max(0, y - 8); yy <= Math.min(W - 1, y + 8); yy++) {
        for (let xx = Math.max(0, x - 8); xx <= Math.min(W - 1, x + 8); xx++) {
          const a = o[yy * W + xx];
          if (!a || a === b) continue;
          const d = Math.hypot(xx - x, yy - y);
          if (a <= 10 && b <= 10) minBig = Math.min(minBig, d);
          else minIslet = Math.min(minIslet, d);
        }
      }
    }
  }
  assert.ok(minBig >= 8, `Seed ${sd}: bo that giua 2 dao lon phai >= 8 tile, thuc te ${minBig}`);
  assert.ok(minIslet >= 4, `Seed ${sd}: dao nho cach dao khac phai >= 4 tile, thuc te ${minIslet}`);

  // BFS 4 huong qua o khong chan tu diem spawn, phai cham nuoc sau (dao khong bi kin)
  map.spawns.forEach(sp => {
    const seen = new Uint8Array(W * W);
    const queue = [sp.ty * W + sp.tx];
    seen[queue[0]] = 1;
    let out = false;
    for (let h = 0; h < queue.length && !out; h++) {
      const i = queue[h];
      if (map.tiles[i] === T.DEEP) { out = true; break; }
      const x = i % W;
      const y = (i - x) / W;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(dv => {
        const nx = x + dv[0];
        const ny = y + dv[1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= W) return;
        const j = ny * W + nx;
        if (seen[j] || S.TILE_BLOCKING.indexOf(map.tiles[j]) !== -1) return;
        seen[j] = 1;
        queue.push(j);
      });
    }
    assert.ok(out, `Seed ${sd}: dao ${sp.islandId} bi kin, khong ra duoc bien sau`);
  });
}

function run() {
  console.log('- Dang chay: Mapgen 10 Islands & Seed Hash Integrity Test...');

  // 1. Kiem tra tinh dong nhat cua mapgen voi cung 1 seed
  const seed = 12345;
  const mapA = S.MAPGEN.generate(seed);
  const mapB = S.MAPGEN.generate(seed);

  assert.ok(mapA && mapB, 'Mapgen phai tra ve object ban do hop le');
  assert.strictEqual(mapA.width, 320, 'Chieu rong ban do phai la 320 tile');
  assert.strictEqual(mapA.height, 320, 'Chieu cao ban do phai la 320 tile');
  assert.strictEqual(mapA.tiles.length, 320 * 320, 'Tong so tile phai la 102400');

  // Hash phai giong het nhau voi cung seed
  assert.strictEqual(mapA.hash, mapB.hash, 'Moi lan sinh cung seed phai cho ra ma hash dong nhat tuyet doi');

  // Hai seed khac nhau phai cho ra ban do khac nhau
  const mapOther = S.MAPGEN.generate(99999);
  assert.notStrictEqual(mapA.hash, mapOther.hash, 'Hai seed khac nhau phai co hash khac nhau');

  // 2. Kiem tra du 10 hon dao va cac rang buoc mo rong dao (M03B-T01c)
  const islands = S.ISLANDS || {};
  const islandKeys = Object.keys(islands);
  assert.strictEqual(islandKeys.length, 10, 'Phai co du 10 hon dao');

  // Dao trung tam ban kinh 32 tile; vi tri do mapgen dat o tam (160, 160)
  assert.ok(islands.fortress, 'Phai co dao trung tam fortress');
  assert.strictEqual(islands.fortress.radius, 32, 'Fortress radius phai la 32 tile');
  assert.strictEqual(mapA.islands.fortress.cx, 160, 'Dao trung tam cx phai la 160');
  assert.strictEqual(mapA.islands.fortress.cy, 160, 'Dao trung tam cy phai la 160');

  // 9 dao ve tinh phai co ban kinh trong khoang [24, 30] va khong trung lap
  const satKeys = islandKeys.filter(k => k !== 'fortress');
  const satRadii = new Set();
  satKeys.forEach(k => {
    const r = islands[k].radius;
    assert.ok(r >= 24 && r <= 30, `Dao ${k} radius phai trong [24, 30], thuc te: ${r}`);
    assert.ok(!satRadii.has(r), `Dao ${k} khong duoc co radius trung voi dao khac: ${r}`);
    satRadii.add(r);
  });

  // Bo tri theo seed (M03B-T01f): kiem tra tren dat that cua nhieu seed
  for (let sd = 1; sd <= 20; sd++) checkLayout(S.MAPGEN.generate(sd), sd);

  // Rang buoc d: Moi dao co 1-2 ben thuyen (docks)
  assert.ok(mapA.docks && mapA.docks.length >= 10, 'Phai co it nhat 10 ben thuyen');

  // Scale vat pham: cay >= 70, ruong >= 45, nha >= 18
  assert.ok(mapA.trees && mapA.trees.length >= 70, `So cay phai scale theo dien tich moi (>= 70), thuc te: ${mapA.trees.length}`);
  assert.ok(mapA.chests && mapA.chests.length >= 45, `So ruong phai scale theo dien tich moi (>= 45), thuc te: ${mapA.chests.length}`);
  assert.ok(mapA.houses && mapA.houses.length >= 18, `So nha phai scale theo dien tich moi (>= 18), thuc te: ${mapA.houses.length}`);

  // 3. Kiem tra dia hinh: bien sau, nuoc nong, dat lien
  // Goc ngoai ria map (5, 5) phai la bien sau (DEEP = 0)
  const outerTile = mapA.tiles[5 * 320 + 5];
  assert.strictEqual(outerTile, S.TILE.DEEP, 'Goc ria ngoai xa phai la bien sau (DEEP)');

  // Tam dao trung tam (160, 160) phai la dat lien (khong phai bien sau DEEP va khong phai SHALLOW)
  const centerTile = mapA.tiles[160 * 320 + 160];
  assert.notStrictEqual(centerTile, S.TILE.DEEP, 'Tam dao trung tam khong duoc la bien sau');
  assert.notStrictEqual(centerTile, S.TILE.SHALLOW, 'Tam dao trung tam khong duoc la nuoc nong');

  // Kiem tra ton tai nuoc nong tren ban do
  let hasShallow = false;
  let hasDock = false;
  for (let i = 0; i < mapA.tiles.length; i++) {
    if (mapA.tiles[i] === S.TILE.SHALLOW) hasShallow = true;
    if (mapA.tiles[i] === S.TILE.DOCK) hasDock = true;
    if (hasShallow && hasDock) break;
  }
  assert.ok(hasShallow, 'Ban do phai co dai nuoc nong SHALLOW');
  assert.ok(hasDock, 'Ban do phai co ben thuyen DOCK');

  // 4. Kiem tra module World cua server
  const world = new World(seed);
  assert.strictEqual(world.getHash(), mapA.hash, 'World getHash phai khop hash cua mapgen');

  // Kiem tra tra cuu tile
  assert.strictEqual(world.getTile(5, 5), S.TILE.DEEP, 'world.getTile bien sau');
  assert.strictEqual(world.isWater(5, 5), S.WATER.DEEP, 'world.isWater phai tra ve 2 (DEEP)');
  assert.strictEqual(world.isWater(160, 160), S.WATER.LAND, 'world.isWater tam dao phai tra ve 0 (LAND)');

  // Kiem tra chan va cham (blocking)
  assert.strictEqual(world.isBlocking(-1, -1), true, 'Ngoai bien map phai bi chan');
  assert.strictEqual(world.isBlocking(320, 320), true, 'Ngoai bien map phai bi chan');

  // Kiem tra danh sach spawn
  const spawns = world.getSpawns();
  assert.ok(Array.isArray(spawns) && spawns.length === 10, 'Phai co du 10 diem spawn tren cac dao');

  console.log('PASS');
}

module.exports = {
  name: 'Mapgen 10 Islands & Seed Hash Integrity Test (mapgen.test.js)',
  run: run
};
