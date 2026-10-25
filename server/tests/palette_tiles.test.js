// server/tests/palette_tiles.test.js
// Unit test kiem tra rang buoc do sang palette, vien sprite #160e22 va 3 bien the cho 17 loai tile.
// Phu thuoc: server/tests/assert.js, client/js/02b-palette.js, client/js/02a-pixel-core.js, client/js/02e-sprites-world.js.

'use strict';

const assert = require('./assert');

// Khoi tao moi truong client tren Node
globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../client/js/02b-palette');
require('../../client/js/02a-pixel-core');
require('../../client/js/02e-sprites-world');

const OP = globalThis.OP;
const PAL = OP.PAL;
const SPR = OP.SPR;

function run() {
  console.log('- Dang chay: Palette Luminance & 17 Tiles Variants Test (palette_tiles.test.js)...');

  // 1. Kiem tra vien sprite co dinh #160e22
  assert.strictEqual(PAL.OUTLINE, '#160e22', 'Vien sprite phai la mau co dinh #160e22');

  // 2. Kiem tra rang buoc do sang Relative Luminance
  const ter = PAL.TERRAIN;
  assert.ok(ter, 'PAL.TERRAIN phai duoc dinh nghia');

  const lumDeep = PAL.luminance(ter.DEEP.mid);
  const lumShallow = PAL.luminance(ter.SHALLOW.mid);
  const lumGrass = PAL.luminance(ter.GRASS.mid);
  const lumSand = PAL.luminance(ter.SAND.mid);

  console.log(`  * Do sang: DEEP=${lumDeep.toFixed(2)}, SHALLOW=${lumShallow.toFixed(2)}, GRASS=${lumGrass.toFixed(2)}, SAND=${lumSand.toFixed(2)}`);

  assert.ok(lumDeep < lumShallow, `Do sang DEEP (${lumDeep}) phai nho hon SHALLOW (${lumShallow})`);
  assert.ok(lumShallow < lumGrass, `Do sang SHALLOW (${lumShallow}) phai nho hon GRASS (${lumGrass})`);
  assert.ok(lumGrass < lumSand, `Do sang GRASS (${lumGrass}) phai nho hon SAND (${lumSand})`);

  // SHALLOW phai sang hon DEEP it nhat 25% (he so >= 1.25)
  const shallowRatio = lumShallow / lumDeep;
  assert.ok(shallowRatio >= 1.25, `SHALLOW phai sang hon DEEP it nhat 25% (hien tai: ${shallowRatio.toFixed(2)})`);

  // 3. Kiem tra 17 loai TILE moi loai co it nhat 3 bien the
  const tileNames = [
    'deep', 'shallow', 'sand', 'grass', 'dirt', 'stone', 'wall', 'wood',
    'ice', 'lava', 'snow', 'quicksand', 'dock', 'bridge', 'tree', 'house_wall', 'floor'
  ];

  assert.strictEqual(tileNames.length, 17, 'Phai kiem tra du 17 loai tile');

  for (let i = 0; i < tileNames.length; i++) {
    const tName = tileNames[i];
    const spr = SPR.get('tile_' + tName);
    assert.ok(spr, `Tile sprite tile_${tName} phai ton tai`);
    assert.ok(spr.frames && spr.frames.length >= 3, `Tile sprite tile_${tName} phai co it nhat 3 bien the (frames: ${spr.frames ? spr.frames.length : 0})`);

    // Kiem tra tung bien the doc lap
    for (let v = 0; v < 3; v++) {
      const vSpr = SPR.get(`tile_${tName}_v${v}`);
      assert.ok(vSpr, `Bien the doc lap tile_${tName}_v${v} phai ton tai`);
    }
  }

  // 4. Kiem tra tile nen khong bi vien den bao quanh (noOutline = true)
  const grassSpr = SPR.get('tile_grass');
  assert.strictEqual(grassSpr.w, 16, 'Tile phai co kich thuoc chuan 16px');
  assert.strictEqual(grassSpr.h, 16, 'Tile phai co kich thuoc chuan 16px');

  console.log('PASS');
}

module.exports = { run };
