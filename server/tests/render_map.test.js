// server/tests/render_map.test.js
// Unit test cho thuat toan phan chia chunk 16x16 tile, camera culling, ban do do sau nuoc va logic minimap / ban do lon.
// Phu thuoc: server/tests/assert.js, shared/20-mapgen-layout.js, shared/21-mapgen.js, client/js/05a-render-map.js.

'use strict';

const assert = require('./assert');

// Khoi tao gia lap client tren Node
globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/14-data-islands');
require('../../shared/20-mapgen-layout');
require('../../shared/21-mapgen');
require('../../client/js/04-camera');
require('../../client/js/05a-render-map');

const S = globalThis.OP_SHARED;
const OP = globalThis.OP;

function run() {
  console.log('- Dang chay: Map Chunk Rendering & Minimap Logic Test...');

  // 1. Kiem tra thong so chia chunk
  const mapTiles = S.CONST.MAP_TILES || 320;
  const chunkTiles = 16;
  const chunkPx = 256;
  const chunksCount = mapTiles / chunkTiles; // 20

  assert.strictEqual(chunksCount, 20, 'Ban do 320 tile chia thanh dung 20 chunk moi chieu');
  assert.strictEqual(chunksCount * chunksCount, 400, 'Tong so chunk toan ban do phai la 400');

  // 2. Kiem tra thuat toan View Frustum Culling cho Camera
  const cam = OP.CAM;
  cam.w = 480;
  cam.h = 270;

  // Dat camera o tam ban do (2560, 2560)
  cam.follow(2560, 2560, 1.0);

  const left = cam.x - cam.w / 2; // 2560 - 240 = 2320
  const right = cam.x + cam.w / 2; // 2560 + 240 = 2800
  const top = cam.y - cam.h / 2; // 2560 - 135 = 2425
  const bottom = cam.y + cam.h / 2; // 2560 + 135 = 2695

  const minCx = Math.max(0, Math.floor(left / chunkPx));
  const maxCx = Math.min(chunksCount - 1, Math.floor(right / chunkPx));
  const minCy = Math.max(0, Math.floor(top / chunkPx));
  const maxCy = Math.min(chunksCount - 1, Math.floor(bottom / chunkPx));

  const visibleChunksCount = (maxCx - minCx + 1) * (maxCy - minCy + 1);

  // Tai vi tri nay chi nhin thay khoang 6 den 9 chunk thay vi ca 400 chunk
  assert.ok(visibleChunksCount <= 9, `So chunk can ve trong mot frame phai <= 9 (hien tai: ${visibleChunksCount})`);
  assert.ok(visibleChunksCount >= 4, `So chunk can ve phai >= 4 de phu kin man hinh (hien tai: ${visibleChunksCount})`);

  // 3. Kiem tra khoi tao map tren client va hash dong nhat
  const mapData = S.MAPGEN.generate(1);
  OP.R.initMap(mapData);
  assert.ok(mapData.hash, 'MapData phai co ma hash');

  // Ban do do sau nuoc (M03B-T01f): nuoc nong 0..2, nuoc sau 3..5, bien khoi = 5, sat bo = 0
  const W = mapTiles;
  let nearShore = false;
  for (let i = 0; i < W * W; i++) {
    const t = mapData.tiles[i];
    const d = OP.R.getDepth(i % W, Math.floor(i / W));
    if (t === S.TILE.SHALLOW) assert.ok(d >= 0 && d <= 2, `Do sau nuoc nong phai 0..2, thuc te ${d}`);
    if (t === S.TILE.DEEP) assert.ok(d >= 3 && d <= 5, `Do sau nuoc sau phai 3..5, thuc te ${d}`);
    if (t === S.TILE.SHALLOW && !nearShore) {
      const x = i % W;
      const land = [mapData.tiles[i - 1], mapData.tiles[i + 1], mapData.tiles[i - W], mapData.tiles[i + W]]
        .some(n => n !== S.TILE.DEEP && n !== S.TILE.SHALLOW);
      if (land && x > 0 && x < W - 1) {
        assert.strictEqual(d, 0, 'O nuoc nong sat dat phai co do sau 0');
        nearShore = true;
      }
    }
  }
  assert.ok(nearShore, 'Phai tim thay o nuoc nong sat bo');
  assert.strictEqual(OP.R.getDepth(5, 5), 5, 'Bien khoi (5, 5) phai co do sau 5');

  // 4. Kiem tra he so scale ban do lon (Big Map Tab)
  const mapAreaSize = 192;
  const scale = mapAreaSize / mapTiles; // 0.6 px / tile
  assert.strictEqual(scale, 0.6, 'Ti le scale ban do lon phai la 0.6 px/tile');

  // Toa do dao trung tam (160, 160) khi scale len ban do lon phai o giua mapAreaSize (96, 96)
  const centerMapX = 160 * scale;
  const centerMapY = 160 * scale;
  assert.strictEqual(centerMapX, 96, 'Toa do tam dao trung tam tren ban do lon phai o giua (96)');
  assert.strictEqual(centerMapY, 96, 'Toa do tam dao trung tam tren ban do lon phai o giua (96)');

  console.log('PASS');
}

module.exports = {
  name: 'Map Chunk Rendering & Minimap Logic Test (render_map.test.js)',
  run: run
};
