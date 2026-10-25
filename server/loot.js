// server/loot.js
// Dat loot ban dau tren 10 dao, mo ruong bau, bang drop vat pham va co che trai ac quy tai sinh sau 20 giay.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js, shared/12-data-items.js, server/entities.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/02-enums');
require('../shared/12-data-items');

const S = globalThis.OP_SHARED;
const entities = require('./entities');

class LootManager {
  constructor(world) {
    this.world = world;
    this.chests = new Map(); // id -> chest entity
    this.items = new Map();  // id -> item entity
    this.rebirthTimers = [];

    if (this.world) {
      this.initWorldLoot();
    }
  }

  initWorldLoot() {
    this.chests.clear();
    this.items.clear();

    const worldChests = this.world.getChests ? this.world.getChests() : [];
    for (const c of worldChests) {
      const chestEnt = entities.createChest(c.x, c.y, c.tier, c.islandId);
      this.chests.set(chestEnt.id, chestEnt);
    }
  }

  openChest(chestId, rng) {
    const chest = this.chests.get(chestId);
    if (!chest || chest.opened) return [];

    chest.opened = true;
    const tier = (chest.tier || 'wood').toUpperCase();
    const poolKey = `CHEST_${tier}`;
    const pool = (S.LOOT_POOLS && S.LOOT_POOLS[poolKey]) ? S.LOOT_POOLS[poolKey] : S.LOOT_POOLS.CHEST_WOOD;

    if (!pool || pool.length === 0) return [];

    const dropCount = (tier === 'GOLD') ? 3 : 2;
    const droppedItems = [];

    for (let i = 0; i < dropCount; i++) {
      const idx = rng ? Math.floor(rng.next() * pool.length) : Math.floor(Math.random() * pool.length);
      const itemId = pool[idx];

      const offX = (i === 0) ? -12 : (i === 1 ? 12 : 0);
      const offY = (i === 2) ? 14 : 6;
      const itemEnt = entities.createItem(itemId, chest.x + offX, chest.y + offY, 1);

      this.items.set(itemEnt.id, itemEnt);
      droppedItems.push(itemEnt);
    }

    return droppedItems;
  }

  scheduleFruitRebirth(fruitId, onReborn) {
    if (!fruitId) return;

    const delayMs = (S.CONST.FRUIT_REBIRTH_SEC || 20) * 1000;
    const timer = setTimeout(() => {
      const spawn = this.world ? this.world.getRandomSpawn() : { x: 2560, y: 2560 };
      const itemEnt = entities.createItem(`fruit_${fruitId}`, spawn.x, spawn.y, 1);
      this.items.set(itemEnt.id, itemEnt);

      if (typeof onReborn === 'function') {
        onReborn(itemEnt);
      }
    }, delayMs);

    this.rebirthTimers.push(timer);
  }

  clear() {
    for (const t of this.rebirthTimers) {
      clearTimeout(t);
    }
    this.rebirthTimers = [];
    this.chests.clear();
    this.items.clear();
  }
}

module.exports = LootManager;
