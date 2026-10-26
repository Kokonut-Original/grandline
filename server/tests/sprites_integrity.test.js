// server/tests/sprites_integrity.test.js
// Unit test kiem tra tinh day du cua toan bo sprite so voi du lieu trong shared.
// Phu thuoc: server/tests/assert.js, shared/*.js, client/js/02*.js.

'use strict';

const assert = require('./assert');

// Khoi tao gia lap client tren Node
globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/10-data-fruits');
require('../../shared/11-data-weapons');
require('../../shared/12-data-items');
require('../../shared/15-data-boats');

require('../../client/js/02b-palette');
require('../../client/js/02a-pixel-core');
require('../../client/js/02c-sprites-chars');
require('../../client/js/02d-sprites-items');
require('../../client/js/02e-sprites-world');
require('../../client/js/02f-sprites-fx');

const S = globalThis.OP_SHARED;
const OP = globalThis.OP;

function run() {
  console.log('- Dang chay: Sprites & Data Integrity Verification Test...');

  // 1. Kiem tra du 16 trai ac quy
  const fruits = S.FRUITS || {};
  const fruitKeys = Object.keys(fruits);
  assert.strictEqual(fruitKeys.length, 16, 'Phai co du 16 trai ac quy trong data');

  for (const fId of fruitKeys) {
    const spr = OP.SPR.get(`fruit_${fId}`);
    assert.ok(spr, `Thieu sprite cho trai ac quy: fruit_${fId}`);
    assert.strictEqual(spr.w, 16, `Kich thuoc fruit_${fId} phai la 16`);
    assert.strictEqual(spr.h, 16, `Kich thuoc fruit_${fId} phai la 16`);
  }

  // 2. Kiem tra du 13 vu khi
  const weapons = S.WEAPONS || {};
  const weaponKeys = Object.keys(weapons);
  assert.strictEqual(weaponKeys.length, 13, 'Phai co du 13 vu khi trong data');

  for (const wId of weaponKeys) {
    const spr = OP.SPR.get(`weapon_${wId}`);
    assert.ok(spr, `Thieu sprite cho vu khi: weapon_${wId}`);
    assert.strictEqual(spr.w, 16, `Kich thuoc weapon_${wId} phai la 16`);
  }

  // 3. Kiem tra du 14 vat pham do dung
  const items = S.ITEMS || {};
  const itemKeys = Object.keys(items);
  assert.strictEqual(itemKeys.length, 14, 'Phai co du 14 vat pham trong data');

  for (const iId of itemKeys) {
    const spr = OP.SPR.get(`item_${iId}`);
    assert.ok(spr, `Thieu sprite cho vat pham: item_${iId}`);
    assert.strictEqual(spr.w, 16, `Kich thuoc item_${iId} phai la 16`);
  }

  // 4. Kiem tra du 4 loai thuyen va chien ham xuat phat
  const boats = S.BOATS || {};
  const boatKeys = Object.keys(boats);
  assert.strictEqual(boatKeys.length, 4, 'Phai co du 4 thuyen trong data');

  for (const bId of boatKeys) {
    const spr = OP.SPR.get(`boat_${bId}`);
    assert.ok(spr, `Thieu sprite cho thuyen: boat_${bId}`);
  }
  assert.ok(OP.SPR.get('warship_launch'), 'Thieu sprite chien ham xuat phat warship_launch');

  // 5. Kiem tra tile, cay coi, nha cua, ruong
  const worldSprites = [
    'tile_deep', 'tile_shallow', 'tile_sand', 'tile_grass', 'tile_rock',
    'tile_dirt', 'tile_ice', 'tile_snow', 'tile_lava', 'tile_wood', 'tile_bridge', 'tile_dock', 'tile_wall',
    'tree_palm', 'tree_pine', 'tree_jungle',
    'house_small', 'house_wood', 'house_stone',
    'chest_wood', 'chest_iron', 'chest_gold'
  ];

  for (const wId of worldSprites) {
    assert.ok(OP.SPR.get(wId), `Thieu sprite the gioi: ${wId}`);
  }

  // 6. Kiem tra hieu ung chien dau va bieu cam khan gia
  const fxSprites = [
    'fx_slash', 'fx_bullet', 'fx_explosion', 'fx_fire', 'fx_ice', 'fx_spark',
    'emote_laugh', 'emote_shock', 'emote_cry', 'emote_clap'
  ];

  for (const fxId of fxSprites) {
    assert.ok(OP.SPR.get(fxId), `Thieu sprite hieu ung: ${fxId}`);
  }

  console.log('PASS');
}

module.exports = {
  name: 'Sprites & Data Integrity Verification Test (sprites_integrity.test.js)',
  run: run
};
