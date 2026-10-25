// server/tests/island_objects.test.js
// Unit test kiem tra do vat tren 10 dao (cay, nha, ruong, boss, ben), he thong entities.js va loot.js.
// Phu thuoc: server/tests/assert.js, shared/21-mapgen.js, server/entities.js, server/loot.js, server/world.js.

'use strict';

const assert = require('./assert');

require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/12-data-items');
require('../../shared/14-data-islands');
require('../../shared/21-mapgen');

const S = globalThis.OP_SHARED;
const World = require('../world');
const entities = require('../entities');
const LootManager = require('../loot');

function run() {
  console.log('- Dang chay: Island Objects, Entities & Loot System Test...');

  // 1. Kiem tra do vat tren 10 dao qua mapgen
  const mapData = S.MAPGEN.generate(1);

  assert.ok(Array.isArray(mapData.trees) && mapData.trees.length >= 25, 'Phai co it nhat 25 cay tren cac dao');
  assert.ok(Array.isArray(mapData.houses) && mapData.houses.length >= 10, 'Phai co it nhat 10 ngoi nha tren cac dao');
  assert.ok(Array.isArray(mapData.chests) && mapData.chests.length >= 20, 'Phai co it nhat 20 ruong bau tren cac dao');
  assert.ok(Array.isArray(mapData.bosses) && mapData.bosses.length === 10, 'Phai co dung 10 diem spawn boss tren 10 dao');

  // Kiem tra du 10 loai boss
  const expectedBosses = [
    'vice_admiral', 'giant_croc', 'snow_rabbit', 'trex', 'cp_agent',
    'dragon', 'zombie_general', 'pacifista', 'samurai', 'giant_warrior'
  ];
  for (const bId of expectedBosses) {
    const found = mapData.bosses.find(b => b.id === bId);
    assert.ok(found, `Phai co diem spawn cho boss: ${bId}`);
  }

  // 2. Kiem tra module entities.js
  entities.resetEntityId(2000);
  const id1 = entities.nextEntityId();
  const id2 = entities.nextEntityId();
  assert.strictEqual(id2, id1 + 1, 'ID thuc the phai tang lien tuc');

  const chest = entities.createChest(100, 100, 'gold', 'fortress');
  assert.strictEqual(chest.k, S.ENT.CHEST, 'Loai thuc the phai la CHEST');
  assert.strictEqual(chest.tier, 'gold', 'Tier ruong phai la gold');

  const item = entities.createItem('fruit_mera', 200, 200, 1);
  assert.strictEqual(item.k, S.ENT.ITEM, 'Loai thuc the phai la ITEM');
  assert.strictEqual(item.itemId, 'fruit_mera', 'ItemId phai dung');

  const boss = entities.createBoss('dragon', 300, 300, 'fire_ice');
  assert.strictEqual(boss.k, S.ENT.BOSS, 'Loai thuc the phai la BOSS');
  assert.strictEqual(boss.bossId, 'dragon', 'BossId phai la dragon');

  // 3. Kiem tra module loot.js
  const world = new World(1);
  const loot = new LootManager(world);

  assert.ok(loot.chests.size >= 20, 'LootManager phai khoi tao du ruong tu world');

  // Lay 1 ruong bat ky de mo
  const firstChestId = loot.chests.keys().next().value;
  const openedChest = loot.chests.get(firstChestId);
  assert.strictEqual(openedChest.opened, false, 'Ban dau ruong chua mo');

  const droppedItems = loot.openChest(firstChestId);
  assert.strictEqual(openedChest.opened, true, 'Sau khi mo ruong phai co opened = true');
  assert.ok(Array.isArray(droppedItems) && droppedItems.length >= 2, 'Ruong phai roi it nhat 2 vat pham');

  // Mo lai ruong da mo thi khong roi them
  const secondOpen = loot.openChest(firstChestId);
  assert.strictEqual(secondOpen.length, 0, 'Ruong da mo khong duoc roi them do');

  loot.clear();

  console.log('PASS');
}

module.exports = {
  name: 'Island Objects, Entities & Loot System Test (island_objects.test.js)',
  run: run
};
