// server/entities.js
// Ham cap phat ID va khoi tao cac thuc the co ban trong the gioi (Player, Chest, Item, Boss, Boat).
// Phu thuoc: shared/01-constants.js, shared/02-enums.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/02-enums');

const S = globalThis.OP_SHARED;
const ENT = S.ENT || {};
const CONST = S.CONST || {};

let currentEntityId = 1000;

function nextEntityId() {
  return currentEntityId++;
}

function resetEntityId(start = 1000) {
  currentEntityId = start;
}

function createPlayer(id, name, colors, x, y) {
  return {
    id: id,
    k: ENT.PLAYER,
    name: name || `Hai tac #${id}`,
    colors: colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' },
    x: x || 2560,
    y: y || 2560,
    vx: 0,
    vy: 0,
    aim: 0,
    hp: CONST.HP_BASE || 100,
    hpMax: CONST.HP_BASE || 100,
    stamina: CONST.STAMINA_MAX || 100,
    fruit: null,
    alive: true
  };
}

function createChest(x, y, tier = 'wood', islandId = null) {
  return {
    id: nextEntityId(),
    k: ENT.CHEST,
    tier: tier,
    x: x,
    y: y,
    islandId: islandId,
    opened: false
  };
}

function createItem(itemId, x, y, count = 1) {
  return {
    id: nextEntityId(),
    k: ENT.ITEM,
    itemId: itemId,
    count: count,
    x: x,
    y: y
  };
}

function createBoss(bossId, x, y, islandId = null) {
  return {
    id: nextEntityId(),
    k: ENT.BOSS,
    bossId: bossId,
    islandId: islandId,
    x: x,
    y: y,
    hp: 400,
    hpMax: 400,
    alive: true
  };
}

function createBoat(boatType, x, y) {
  return {
    id: nextEntityId(),
    k: ENT.BOAT,
    boatType: boatType || 'dinghy',
    x: x,
    y: y,
    hp: 100,
    hpMax: 100,
    alive: true
  };
}

module.exports = {
  nextEntityId: nextEntityId,
  resetEntityId: resetEntityId,
  createPlayer: createPlayer,
  createChest: createChest,
  createItem: createItem,
  createBoss: createBoss,
  createBoat: createBoat
};
