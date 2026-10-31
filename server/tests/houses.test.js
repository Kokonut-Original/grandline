// server/tests/houses.test.js
// Test nha nhieu o (M03B-T02): kich thuoc, tuong/cua/san, them cua, khong dat cay/ruong/boss de len nha,
// noi that nam trong nha, tu spawn di bo toi duoc moi o trong nha; va do mo mai nha phia client (05b).
// Phu thuoc: server/tests/assert.js, shared/21-mapgen.js, client/js/04-camera.js, client/js/05b-render-entities.js.

'use strict';

const assert = require('./assert');

globalThis.window = globalThis;
require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/14-data-islands');
require('../../shared/20-mapgen-layout');
require('../../shared/21-mapgen');
require('../../client/js/04-camera');
require('../../client/js/05b-render-entities');

const S = globalThis.OP_SHARED;
const T = S.TILE;
const W = S.CONST.MAP_TILES || 320;
const SIZE = { house_small: [6, 5], house_wood: [8, 6], house_stone: [10, 7] };

function blocking(t) {
  return S.TILE_BLOCKING.indexOf(t) !== -1;
}

function isWater(t) {
  return t === T.DEEP || t === T.SHALLOW;
}

function inRect(h, pad, tx, ty) {
  return tx >= h.tx - pad && tx < h.tx + h.w + pad && ty >= h.ty - pad && ty < h.ty + h.h + pad;
}

function isDoorCell(h, tx, ty) {
  return h.doors.some(d => ty === d.ty && tx >= d.tx && tx < d.tx + 2);
}

// BFS tu spawn qua o khong chan (nuoc cho di qua)
function reachable(map, sp) {
  const seen = new Uint8Array(W * W);
  const q = [sp.ty * W + sp.tx];
  seen[q[0]] = 1;
  for (let head = 0; head < q.length; head++) {
    const cur = q[head];
    const cx = cur % W;
    const cy = (cur - cx) / W;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i = 0; i < 4; i++) {
      const nx = cx + nb[i][0];
      const ny = cy + nb[i][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= W) continue;
      const ni = ny * W + nx;
      if (seen[ni] || blocking(map.tiles[ni])) continue;
      seen[ni] = 1;
      q.push(ni);
    }
  }
  return seen;
}

function checkSeed(seed) {
  const map = S.MAPGEN.generate(seed);
  const tag = `seed ${seed}`;
  assert.ok(map.houses.length >= 18, `${tag}: so nha >= 18`);

  for (const h of map.houses) {
    const sz = SIZE[h.type];
    assert.ok(sz, `${tag}: loai nha la ${h.type}`);
    assert.strictEqual(h.w, sz[0], `${tag}: rong nha ${h.type}`);
    assert.strictEqual(h.h, sz[1], `${tag}: cao nha ${h.type}`);
    assert.strictEqual(h.doors.length, h.type === 'house_stone' ? 2 : 1, `${tag}: so cua ${h.type}`);

    for (let ty = h.ty; ty < h.ty + h.h; ty++) {
      for (let tx = h.tx; tx < h.tx + h.w; tx++) {
        const t = map.tiles[ty * W + tx];
        const edge = tx === h.tx || tx === h.tx + h.w - 1 || ty === h.ty || ty === h.ty + h.h - 1;
        if (edge && !isDoorCell(h, tx, ty)) {
          assert.strictEqual(t, T.HOUSE_WALL, `${tag}: vien nha phai la HOUSE_WALL (${tx},${ty})`);
        } else {
          assert.ok(!blocking(t), `${tag}: o cua/trong nha khong duoc chan (${tx},${ty})`);
          assert.strictEqual(t, h.type === 'house_stone' ? T.FLOOR : T.WOOD, `${tag}: san nha (${tx},${ty})`);
        }
      }
    }

    for (const d of h.doors) {
      assert.ok(d.side === 'S' || d.side === 'N', `${tag}: side cua`);
      assert.strictEqual(d.ty, d.side === 'S' ? h.ty + h.h - 1 : h.ty, `${tag}: hang cua`);
      assert.strictEqual(d.tx, h.tx + h.w / 2 - 1, `${tag}: cot cua`);
      const sy = d.ty + (d.side === 'S' ? 1 : -1);
      for (let k = 0; k < 2; k++) {
        const t = map.tiles[sy * W + d.tx + k];
        assert.ok(!blocking(t) && !isWater(t), `${tag}: o them cua khong chan va khong phai nuoc`);
      }
    }

    // Khong co cay/ruong/boss/spawn/ben trong nha mo rong 1 o
    const lists = [map.trees, map.chests, map.bosses, map.spawns, map.docks];
    for (const list of lists) {
      for (const o of list) {
        assert.ok(!inRect(h, 1, o.tx, o.ty), `${tag}: vat the de len nha tai (${o.tx},${o.ty})`);
      }
    }

    // Noi that: trong nha, khong o cot cua, khong trung o
    const used = new Set();
    for (const p of h.props) {
      assert.ok(p.kind === 'crate' || p.kind === 'barrel', `${tag}: loai prop`);
      assert.ok(p.tx > h.tx && p.tx < h.tx + h.w - 1 && p.ty > h.ty && p.ty < h.ty + h.h - 1, `${tag}: prop phai nam trong phan ben trong`);
      assert.ok(p.tx !== h.doors[0].tx && p.tx !== h.doors[0].tx + 1, `${tag}: prop khong o cot cua`);
      assert.strictEqual(p.x, p.tx * 16 + 8, `${tag}: prop.x`);
      assert.strictEqual(p.y, p.ty * 16 + 8, `${tag}: prop.y`);
      const key = p.tx + ',' + p.ty;
      assert.ok(!used.has(key), `${tag}: prop trung o`);
      used.add(key);
    }
  }

  // Tu spawn cua dao toi duoc moi o trong nha cua dao do
  for (const sp of map.spawns) {
    const seen = reachable(map, sp);
    for (const h of map.houses) {
      if (h.islandId !== sp.islandId) continue;
      for (let ty = h.ty + 1; ty < h.ty + h.h - 1; ty++) {
        for (let tx = h.tx + 1; tx < h.tx + h.w - 1; tx++) {
          assert.ok(seen[ty * W + tx], `${tag}: khong toi duoc o trong nha (${tx},${ty}) tu spawn ${sp.islandId}`);
        }
      }
    }
  }
}

function checkRoofs() {
  const OP = globalThis.OP;
  assert.strictEqual(typeof OP.R.renderRoofs, 'function', 'Phai co OP.R.renderRoofs');
  assert.strictEqual(typeof OP.R.roofAlphaAt, 'function', 'Phai co OP.R.roofAlphaAt');

  const map = S.MAPGEN.generate(1);
  const h = map.houses[0];
  const oldGame = OP.GAME;
  const oldCam = OP.CAM;
  OP.CAM = null; // khong cull
  const ctx = { globalAlpha: 1, drawImage: function () {} };
  const cx = (h.tx + h.w / 2) * 16;
  const cy = (h.ty + h.h / 2) * 16;
  try {
    // Ngoai nha: mai hien nguyen
    OP.GAME = { state: { map: map, me: { x: cx, y: (h.ty + h.h + 3) * 16 } } };
    OP.R.renderRoofs(ctx);
    assert.strictEqual(OP.R.roofAlphaAt(cx, cy), 1, 'Dung ngoai nha: mai alpha 1');
    assert.strictEqual(OP.R.roofAlphaAt(-5, -5), 0, 'Diem ngoai moi nha: 0');

    // Buoc vao nha: alpha giam dan (khung dau dt=0 hoac nho), cuoi cung ve 0
    OP.GAME.state.me = { x: cx, y: cy };
    OP.R.renderRoofs(ctx);
    const start = new Date().getTime();
    while (new Date().getTime() - start < 400) { /* cho qua 0.4s that */ }
    OP.R.renderRoofs(ctx);
    const a1 = OP.R.roofAlphaAt(cx, cy);
    assert.ok(a1 < 1, 'Vao trong nha: mai bat dau mo');
    const start2 = new Date().getTime();
    while (new Date().getTime() - start2 < 300) { /* them thoi gian */ }
    OP.R.renderRoofs(ctx);
    OP.R.renderRoofs(ctx);
    assert.ok(OP.R.roofAlphaAt(cx, cy) <= a1, 'Trong nha: alpha khong tang');
    assert.strictEqual(ctx.globalAlpha, 1, 'globalAlpha phai tra ve 1');
  } finally {
    OP.GAME = oldGame;
    OP.CAM = oldCam;
  }
}

function run() {
  console.log('- Dang chay: Houses Test...');
  for (let sd = 1; sd <= 5; sd++) checkSeed(sd);
  checkRoofs();
}

module.exports = {
  name: 'Houses multi-tile, props, reachability & roof alpha Test (houses.test.js)',
  run: run
};
