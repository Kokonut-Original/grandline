// server/tests/predict.test.js
// Unit test logic du doan phia client, sua sai reconciliation va noi suy lerp.
// Phu thuoc: server/tests/assert.js, shared/01-constants.js.

'use strict';

const assert = require('./assert.js');
require('../../shared/00-namespace.js');
require('../../shared/01-constants.js');

const S = globalThis.OP_SHARED;

module.exports = {
  name: 'Client Prediction & Interpolation Logic Test',
  run: function () {
    const moveSpeed = S.CONST.MOVE_SPEED; // 90 px/s

    // 1. Test Reconciliation replay
    const pendingInputs = [
      { seq: 1, dt: 0.1, mx: 1, my: 0 },
      { seq: 2, dt: 0.1, mx: 1, my: 0 },
      { seq: 3, dt: 0.1, mx: 1, my: 0 }
    ];

    // Server bao xac nhan seq: 1 voi toa do x: 249
    const ack = 1;
    let reconciledX = 249;
    let reconciledY = 135;

    // Loc bo cac input da ack
    const remaining = pendingInputs.filter(inp => inp.seq > ack);
    assert.strictEqual(remaining.length, 2, 'Phai con lai 2 pending input sau khi loc ack=1');

    // Replay cac input con lai
    for (const inp of remaining) {
      let mx = inp.mx;
      let my = inp.my;
      const len = Math.hypot(mx, my);
      if (len > 1) {
        mx /= len;
        my /= len;
      }
      reconciledX += mx * moveSpeed * inp.dt;
      reconciledY += my * moveSpeed * inp.dt;
    }

    // 249 + 2 * (1 * 90 * 0.1) = 249 + 18 = 267
    assert.strictEqual(reconciledX, 267, 'Toa do sau khi reconciliation phai la 267');
    assert.strictEqual(reconciledY, 135, 'Toa do y khong duoc thay doi');

    // 2. Test Interpolation Lerp
    const s0 = { time: 1000, x: 100, y: 50 };
    const s1 = { time: 1100, x: 200, y: 150 };
    const renderTime = 1050;

    const total = s1.time - s0.time;
    const ratio = (renderTime - s0.time) / total; // 50 / 100 = 0.5

    const interpolatedX = s0.x + (s1.x - s0.x) * ratio;
    const interpolatedY = s0.y + (s1.y - s0.y) * ratio;

    assert.strictEqual(ratio, 0.5, 'Ty le lerp phai la 0.5');
    assert.strictEqual(interpolatedX, 150, 'Toa do x noi suy phai la 150');
    assert.strictEqual(interpolatedY, 100, 'Toa do y noi suy phai la 100');
  }
};
