// server/tests/water.test.js
// Unit test trang thai nuoc, boi, the luc, chet duoi, cat lun, bang tron va va cham
// (di chuyen qua shared/22-move.js, moi truong qua physics.tickEnv).
// Phu thuoc: server/tests/assert.js, server/physics.js, shared/22-move.js.

'use strict';

const assert = require('./assert');

require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/22-move');

const S = globalThis.OP_SHARED;
const C = S.CONST;
const physics = require('../physics');

const N = C.MAP_TILES;
const DT = 1 / C.TICK_HZ;

// The gioi gia: toan bo map la 1 loai tile (tuy chon dat 1 o khac tai (tx, ty))
function makeWorld(tile, extra) {
  const tiles = new Uint8Array(N * N).fill(tile);
  if (extra) tiles[extra.ty * N + extra.tx] = extra.tile;
  return { map: { tiles: tiles } };
}

function makePlayer(over) {
  return Object.assign({
    x: 100, y: 100, vx: 0, vy: 0, hp: 100, hpMax: 100, stamina: 100,
    alive: true, fruitId: null, onBoatId: null, water: 0
  }, over || {});
}

// Mo phong 1 giay: moi tick 1 input + 1 lan tick moi truong
function runSecond(p, world, input) {
  for (let i = 0; i < C.TICK_HZ; i++) {
    physics.applyInput(p, input, world);
    physics.tickEnv(p, world, DT, {});
  }
}

function run() {
  console.log('- Dang chay: Water, Drowning, Stamina & Ice Physics Test...');
  const right = { mx: 1, my: 0 };

  // 1. Nguoi khong co trai boi o bien sau
  const deep = makeWorld(S.TILE.DEEP);
  const swimmer = makePlayer();
  runSecond(swimmer, deep, right);
  assert.strictEqual(Math.round(swimmer.vx), 45, 'Toc do boi phai bang MOVE_SPEED * SWIM_MULT (45 px/s)');
  assert.strictEqual(Math.round(swimmer.x - 100), 45, 'Quang duong boi 1 giay phai la 45px');
  assert.strictEqual(Math.round(swimmer.stamina), 94, 'The luc phai giam 6 sau 1 giay boi');
  assert.strictEqual(swimmer.hp, 100, 'Con the luc thi khong bi mat mau');

  // 2. Het the luc thi mat SWIM_EXHAUST_DPS mau/giay
  swimmer.stamina = 0;
  runSecond(swimmer, deep, right);
  assert.strictEqual(Math.round(swimmer.hp), 95, 'Het the luc boi phai mat 5 mau/s');

  // 3. Nguoi CO TRAI chim o bien sau
  const fruitUser = makePlayer({ fruitId: 'mera' });
  runSecond(fruitUser, deep, right);
  assert.strictEqual(fruitUser.drowning, true, 'Nguoi co trai phai o trang thai drowning khi o bien sau');
  assert.strictEqual(Math.round(fruitUser.hp), 83, 'Nguoi co trai phai mat 17% mau toi da sau 1 giay chim');
  assert.strictEqual(Math.round(fruitUser.vx), Math.round(C.MOVE_SPEED * C.SINK_MULT), 'Nguoi co trai o bien sau di theo SINK_MULT');

  // 3b. Phong cho (safe) thi khong mat mau
  const lobbyFruit = makePlayer({ fruitId: 'mera' });
  physics.tickEnv(lobbyFruit, deep, 1, { safe: true });
  assert.strictEqual(lobbyFruit.hp, 100, 'Trong phong cho khong duoc mat mau vi nuoc');

  // 4. Nuoc nong
  const shallow = makeWorld(S.TILE.SHALLOW);
  const normalShallow = makePlayer();
  physics.applyInput(normalShallow, right, shallow);
  assert.strictEqual(Math.round(normalShallow.vx), 72, 'Nguoi thuong o nuoc nong: 90 * 0.8 = 72 px/s');

  const fruitShallow = makePlayer({ fruitId: 'gomu' });
  physics.applyInput(fruitShallow, right, shallow);
  physics.tickEnv(fruitShallow, shallow, DT, {});
  assert.strictEqual(Math.round(fruitShallow.vx), 63, 'Nguoi co trai o nuoc nong: 90 * 0.7 = 63 px/s');
  assert.strictEqual(fruitShallow.drowning, false, 'Nuoc nong khong gay chim');

  // 5. Cau, ben va thuyen tinh la tren can
  const bridge = makeWorld(S.TILE.BRIDGE);
  const onBridge = makePlayer({ fruitId: 'mera', stamina: 50 });
  physics.tickEnv(onBridge, bridge, 1, {});
  assert.strictEqual(onBridge.water, S.WATER.LAND, 'Dung tren cau phai xem nhu o tren can');
  assert.strictEqual(onBridge.drowning, false, 'Dung tren cau khong bi chim');
  assert.ok(onBridge.stamina > 50, 'Dung tren cau phai duoc hoi the luc');

  const onBoat = makePlayer({ fruitId: 'mera', onBoatId: 7 });
  physics.tickEnv(onBoat, deep, 1, {});
  assert.strictEqual(onBoat.drowning, false, 'Dung tren thuyen o bien sau khong bi chim');

  // 6. Bang tron co quan tinh
  const ice = makeWorld(S.TILE.ICE);
  const skater = makePlayer({ vx: 90 });
  physics.applyInput(skater, { mx: 0, my: 0 }, ice);
  assert.ok(skater.vx > 50, 'Tren bang tha phim van truot theo quan tinh (vx > 50)');

  // 7. Cat lun lam cham
  const sand = makeWorld(S.TILE.QUICKSAND);
  const walker = makePlayer();
  physics.applyInput(walker, right, sand);
  assert.strictEqual(Math.round(walker.vx), Math.round(C.MOVE_SPEED * C.QUICKSAND_MULT), 'Cat lun di cham theo QUICKSAND_MULT');

  // 8. Va cham: cay ngay ben phai thi khong di xuyen qua
  const tx = Math.floor(100 / C.TILE) + 1;
  const ty = Math.floor(100 / C.TILE);
  const forest = makeWorld(S.TILE.GRASS, { tx: tx, ty: ty, tile: S.TILE.TREE });
  const blocked = makePlayer();
  runSecond(blocked, forest, right);
  assert.ok(blocked.x + C.PLAYER_RADIUS <= tx * C.TILE, 'Khong duoc di xuyen qua o cay TREE');
  assert.strictEqual(blocked.vx, 0, 'Van toc phai bi triet tieu khi va vao cay');

  console.log('PASS');
}

module.exports = {
  name: 'Water, Drowning, Stamina & Ice Physics Test (water.test.js)',
  run: run
};
