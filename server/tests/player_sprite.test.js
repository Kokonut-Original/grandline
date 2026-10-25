// server/tests/player_sprite.test.js
// Unit test cho he thong sprite nguoi choi chibi 16x24, 3 huong va bo doi mau.
// Phu thuoc: server/tests/assert.js, client/js/02a-pixel-core.js, client/js/02b-palette.js, client/js/02c-sprites-chars.js.

'use strict';

const assert = require('./assert');

// Khoi tao gia lap client tren Node
globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../client/js/02b-palette');
require('../../client/js/02a-pixel-core');
require('../../client/js/02c-sprites-chars');

const OP = globalThis.OP;

function run() {
  console.log('- Dang chay: Player Chibi Sprite & 3-Directions Test...');

  const customColors = {
    hat: '#ffcc00',
    shirt: '#00ccff',
    hair: '#333333'
  };

  // 1. Khoi tao sprite nguoi choi
  const baseId = OP.SPR.player(customColors);
  assert.ok(baseId, 'OP.SPR.player phai tra ve baseId hop le');
  assert.strictEqual(baseId, 'player_ffcc00_00ccff_333333', 'baseId phai tao dung theo bo mau');

  // 2. Kiem tra du 3 huong (down, up, side) va cac hoat anh (walk, idle)
  const expectedSprites = [
    `${baseId}_down_walk`,
    `${baseId}_down_idle`,
    `${baseId}_up_walk`,
    `${baseId}_up_idle`,
    `${baseId}_side_walk`,
    `${baseId}_side_idle`
  ];

  for (const sId of expectedSprites) {
    const spr = OP.SPR.get(sId);
    assert.ok(spr, `Phai ton tai sprite ${sId}`);
    assert.strictEqual(spr.w, 16, `Chieu rong sprite ${sId} phai la 16px`);
    assert.strictEqual(spr.h, 24, `Chieu cao sprite ${sId} phai la 24px`);

    if (sId.includes('_walk')) {
      assert.strictEqual(spr.frames.length, 3, `Hoat anh walk cua ${sId} phai co 3 frames`);
    } else if (sId.includes('_idle')) {
      assert.strictEqual(spr.frames.length, 1, `Hoat anh idle cua ${sId} phai co 1 frame`);
    }
  }

  // 3. Kiem tra cache: goi lai voi cung bo mau khong duoc tao lai
  const cachedBaseId = OP.SPR.player(customColors);
  assert.strictEqual(cachedBaseId, baseId, 'Goi lai cung bo mau phai tra ve dung baseId tu cache');

  console.log('PASS');
}

module.exports = {
  name: 'Player Chibi Sprite & 3-Directions Test (player_sprite.test.js)',
  run: run
};
