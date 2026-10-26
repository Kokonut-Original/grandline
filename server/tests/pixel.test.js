// server/tests/pixel.test.js
// Unit test cho he thong pixelGrid, tu sinh vien den, sprite cache va camera.
// Phu thuoc: server/tests/assert.js, client/js/02b-palette.js, client/js/02a-pixel-core.js, client/js/04-camera.js.

'use strict';

const assert = require('./assert');

// Khoi tao moi truong gia lap cho client tren Node
globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../client/js/02b-palette');
require('../../client/js/02a-pixel-core');
require('../../client/js/04-camera');

const OP = globalThis.OP;

function run() {
  console.log('- Dang chay: Pixel Core & Outline Generation Test...');

  // 1. Kiem tra thuat toan tu sinh vien den 1px (pixelMatrix)
  const rows = [
    '.#.',
    '###',
    '.#.'
  ];
  const palette = { '#': '#ff0000' };

  const mat = OP.PX.pixelMatrix(rows, palette, { expand: true });
  // Ban dau la 3x3, expand true thi thanh 5x5
  assert.strictEqual(mat.width, 5, 'Chieu rong ma tran sau khi expand phai la 5');
  assert.strictEqual(mat.height, 5, 'Chieu cao ma tran sau khi expand phai la 5');

  // Tam giua (2, 2) phai la mau do cua '#'
  assert.strictEqual(mat.pixels[2][2], '#ff0000', 'Tam giua phai la pixel mau do');

  // O tren tam (1, 2) la phan tu thuoc dau '+' nen la mau do
  assert.strictEqual(mat.pixels[1][2], '#ff0000', 'Dinh chu thap phai la mau do');

  // O ngoai cung tiep giap dinh chu thap (0, 2) phai la vien den tu sinh (#160e22 theo chuan ART-REF)
  assert.strictEqual(mat.pixels[0][2], '#160e22', 'Vien den 1px ngoai cung phai tu dong duoc sinh ra voi mau #160e22');

  // Goc ngoai cung (0, 0) khong tiep giap 4 huong voi pixel mau nao thi phai la null
  assert.strictEqual(mat.pixels[0][0], null, 'Goc ngoai cung khong co vien phai giu nguyen null');

  // 2. Kiem tra PixelGrid va bo nho dem cache
  OP.PX.clearCache();
  const cvs1 = OP.PX.pixelGrid(rows, palette);
  const cvs2 = OP.PX.pixelGrid(rows, palette);
  assert.strictEqual(cvs1, cvs2, 'pixelGrid phai tra ve canvas duoc cache, khong tao moi trung lap');

  // 3. Kiem tra he thong Sprite OP.SPR
  const spriteDef = OP.SPR.define('test_icon', {
    frames: [rows],
    palette: palette,
    w: 3,
    h: 3,
    anim: 'static'
  });

  assert.ok(spriteDef, 'Sprite define phai tra ve object hop le');
  const retrieved = OP.SPR.get('test_icon');
  assert.strictEqual(retrieved.id, 'test_icon', 'OP.SPR.get phai lay dung sprite da dang ky');
  assert.strictEqual(retrieved.frames.length, 1, 'Sprite phai chua dung so luong frames');

  // 4. Kiem tra he thong Camera OP.CAM
  const S = globalThis.OP_SHARED;
  const mapMax = S.CONST.MAP_TILES * S.CONST.TILE; // 320 * 16 = 5120

  // Camera thay dung VIEW 480x270, khong con scale le (M03B-T01d)
  assert.strictEqual(OP.CAM.w, S.CONST.VIEW_W, 'Camera phai rong dung VIEW_W');
  assert.strictEqual(OP.CAM.h, S.CONST.VIEW_H, 'Camera phai cao dung VIEW_H');
  assert.strictEqual(OP.CAM.visionScale, undefined, 'Khong duoc con he so tam nhin le');

  OP.CAM.follow(1000.4, 1000.6, 1.0);
  const fakeCtx = {
    calls: [],
    save: function () { this.calls.push(['save']); },
    translate: function (x, y) { this.calls.push(['translate', x, y]); },
    scale: function () { this.calls.push(['scale']); }
  };
  OP.CAM.apply(fakeCtx);
  assert.ok(!fakeCtx.calls.some(c => c[0] === 'scale'), 'Camera khong duoc scale canvas');
  const tr = fakeCtx.calls.find(c => c[0] === 'translate');
  assert.ok(Number.isInteger(tr[1]) && Number.isInteger(tr[2]), 'Dich camera phai la so nguyen');
  const centerScreen = OP.CAM.worldToScreen(OP.CAM.x, OP.CAM.y);
  assert.ok(Math.abs(centerScreen.x - S.CONST.VIEW_W / 2) <= 0.5, 'Tam camera phai o giua man hinh (x)');
  assert.ok(Math.abs(centerScreen.y - S.CONST.VIEW_H / 2) <= 0.5, 'Tam camera phai o giua man hinh (y)');

  OP.CAM.follow(1000, 1000, 1.0);
  assert.strictEqual(OP.CAM.x, 1000, 'Camera phai di chuyen dung toa do muc tieu');
  assert.strictEqual(OP.CAM.y, 1000, 'Camera phai di chuyen dung toa do muc tieu');

  // Kiem tra tinh toan toa do nghich dao world <-> screen
  const wx = 1050;
  const wy = 980;
  const screenPos = OP.CAM.worldToScreen(wx, wy);
  const backToWorld = OP.CAM.screenToWorld(screenPos.x, screenPos.y);
  assert.strictEqual(backToWorld.x, wx, 'screenToWorld phai la ham nghich dao chinh xac cua worldToScreen (x)');
  assert.strictEqual(backToWorld.y, wy, 'screenToWorld phai la ham nghich dao chinh xac cua worldToScreen (y)');

  // Kiem tra gioi han clamp bien ban do cua camera
  OP.CAM.follow(-100, -100, 1.0);
  assert.strictEqual(OP.CAM.x, OP.CAM.w / 2, 'Camera phai bi chan khong vuot ra ngoai bien trai');
  assert.strictEqual(OP.CAM.y, OP.CAM.h / 2, 'Camera phai bi chan khong vuot ra ngoai bien tren');

  OP.CAM.follow(10000, 10000, 1.0);
  assert.strictEqual(OP.CAM.x, mapMax - OP.CAM.w / 2, 'Camera phai bi chan khong vuot ra ngoai bien phai');
  assert.strictEqual(OP.CAM.y, mapMax - OP.CAM.h / 2, 'Camera phai bi chan khong vuot ra ngoai bien duoi');

  // 5. Kiem tra tien ich bang mau OP.PAL
  const rgb = OP.PAL.hexToRgb('#ff8000');
  assert.strictEqual(rgb.r, 255, 'hexToRgb r');
  assert.strictEqual(rgb.g, 128, 'hexToRgb g');
  assert.strictEqual(rgb.b, 0, 'hexToRgb b');

  const hex = OP.PAL.rgbToHex(255, 128, 0);
  assert.strictEqual(hex, '#ff8000', 'rgbToHex phai tra ve dung hex');

  console.log('PASS');
}

module.exports = {
  name: 'Pixel Core & Outline Generation Test (pixel.test.js)',
  run: run
};
