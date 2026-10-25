// server/tests/mapgen.test.js
// Unit test cho thuat toan sinh ban do mapgen 10 dao, tinh dong nhat cua seed hash va module world.js.
// Phu thuoc: server/tests/assert.js, shared/21-mapgen.js, shared/14-data-islands.js, server/world.js.

'use strict';

const assert = require('./assert');

// Khoi tao moi truong shared tren Node
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/14-data-islands');
require('../../shared/21-mapgen');

const S = globalThis.OP_SHARED;
const World = require('../world');

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

  // 2. Kiem tra du 10 hon dao
  const islands = S.ISLANDS || {};
  const islandKeys = Object.keys(islands);
  assert.strictEqual(islandKeys.length, 10, 'Phai co du 10 hon dao');

  // Dao trung tam phai o tam (160, 160)
  assert.ok(islands.fortress, 'Phai co dao trung tam fortress');
  assert.strictEqual(islands.fortress.cx, 160, 'Dao trung tam cx phai la 160');
  assert.strictEqual(islands.fortress.cy, 160, 'Dao trung tam cy phai la 160');

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
