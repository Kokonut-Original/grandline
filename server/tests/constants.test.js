// server/tests/constants.test.js
// Test mau kiem tra tinh toan ven cua hang so CONST va tinh xac dinh cua RNG.
// Phu thuoc: server/tests/assert.js, shared/01-constants.js, shared/05-rng.js.

'use strict';

const assert = require('./assert.js');
require('../../shared/00-namespace.js');
require('../../shared/01-constants.js');
require('../../shared/02-enums.js');
require('../../shared/05-rng.js');

const S = globalThis.OP_SHARED;

module.exports = {
  name: 'Constants and RNG Integrity Test',
  run: function () {
    // 1. Kiem tra hang so ban do va kich thuoc
    assert.strictEqual(S.CONST.TILE, 16, 'CONST.TILE phai la 16');
    assert.strictEqual(S.CONST.MAP_TILES, 320, 'CONST.MAP_TILES phai la 320');
    assert.strictEqual(S.CONST.VIEW_W, 480, 'CONST.VIEW_W phai la 480');
    assert.strictEqual(S.CONST.VIEW_H, 270, 'CONST.VIEW_H phai la 270');

    // 2. Kiem tra tinh dong bang khong the sua doi
    assert.ok(Object.isFrozen(S.CONST), 'S.CONST phai bi dong bang');
    assert.throws(() => {
      'use strict';
      S.CONST.TILE = 32;
    }, 'S.CONST khong the bi sua doi');

    // 3. Kiem tra RNG co tinh xac dinh
    const rng1 = S.RNG.create(12345);
    const rng2 = S.RNG.create(12345);

    const seq1 = [rng1.next(), rng1.nextFloat(10, 20), rng1.nextInt(1, 100)];
    const seq2 = [rng2.next(), rng2.nextFloat(10, 20), rng2.nextInt(1, 100)];

    assert.deepStrictEqual(seq1, seq2, 'Hai bo sinh so voi cung seed phai sinh ra chuoi giong het nhau');

    // 4. Kiem tra ham bam hash2
    const h1 = S.RNG.hash2(10, 20, 999);
    const h2 = S.RNG.hash2(10, 20, 999);
    assert.strictEqual(h1, h2, 'hash2 phai co tinh xac dinh voi cung toa do va seed');
  }
};
