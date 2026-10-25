// server/world.js
// Quan ly ban do server sinh tu shared/21-mapgen.js: tra cuu tile, va cham, trang thai nuoc va diem spawn.
// Phu thuoc: shared/00 -> 05, shared/14-data-islands.js, shared/21-mapgen.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/02-enums');
require('../shared/05-rng');
require('../shared/14-data-islands');
require('../shared/21-mapgen');

const S = globalThis.OP_SHARED;
const T = S.TILE;
const MAP_W = S.CONST.MAP_TILES || 320;
const MAP_H = S.CONST.MAP_TILES || 320;
const TILE_PX = S.CONST.TILE || 16;

class World {
  constructor(seed = 1) {
    this.seed = seed;
    this.map = null;
    this.init(seed);
  }

  init(seed) {
    this.seed = (typeof seed === 'number') ? seed : 1;
    this.map = S.MAPGEN.generate(this.seed);
  }

  getTile(tx, ty) {
    if (!this.map || !this.map.tiles) return T.DEEP;
    if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return T.DEEP;
    return this.map.tiles[ty * MAP_W + tx];
  }

  getTileAtPixel(px, py) {
    const tx = Math.floor(px / TILE_PX);
    const ty = Math.floor(py / TILE_PX);
    return this.getTile(tx, ty);
  }

  isWater(tx, ty) {
    const tile = this.getTile(tx, ty);
    if (tile === T.DEEP) return S.WATER.DEEP; // 2
    if (tile === T.SHALLOW) return S.WATER.SHALLOW; // 1
    return S.WATER.LAND; // 0
  }

  isWaterAtPixel(px, py) {
    const tx = Math.floor(px / TILE_PX);
    const ty = Math.floor(py / TILE_PX);
    return this.isWater(tx, ty);
  }

  isBlocking(tx, ty) {
    if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return true;
    const tile = this.getTile(tx, ty);
    return S.TILE_BLOCKING.indexOf(tile) !== -1;
  }

  isBlockingAtPixel(px, py, radius = 6) {
    const minTx = Math.floor((px - radius) / TILE_PX);
    const maxTx = Math.floor((px + radius) / TILE_PX);
    const minTy = Math.floor((py - radius) / TILE_PX);
    const maxTy = Math.floor((py + radius) / TILE_PX);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (this.isBlocking(tx, ty)) {
          return true;
        }
      }
    }
    return false;
  }

  getSpawns() {
    return this.map ? this.map.spawns : [];
  }

  getRandomSpawn(rng) {
    const spawns = this.getSpawns();
    if (!spawns || spawns.length === 0) {
      return { x: 160 * TILE_PX, y: 160 * TILE_PX };
    }
    const idx = rng ? Math.floor(rng.next() * spawns.length) : Math.floor(Math.random() * spawns.length);
    return spawns[idx];
  }

  getDocks() {
    return this.map ? this.map.docks : [];
  }

  getTrees() {
    return this.map ? this.map.trees : [];
  }

  getHouses() {
    return this.map ? this.map.houses : [];
  }

  getChests() {
    return this.map ? this.map.chests : [];
  }

  getBosses() {
    return this.map ? this.map.bosses : [];
  }

  getIslands() {
    return this.map ? this.map.islands : {};
  }

  getHash() {
    return this.map ? this.map.hash : '';
  }
}

module.exports = World;
