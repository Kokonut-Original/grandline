// server/tests/water.test.js
// Unit test kiem tra trang thai nuoc, boi, the luc, chet duoi, cat lun, bang tron va va cham.
// Phu thuoc: server/tests/assert.js, server/physics.js, server/world.js.

'use strict';

const assert = require('./assert');

require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/02-enums');
require('../../shared/05-rng');
require('../../shared/14-data-islands');
require('../../shared/21-mapgen');

const S = globalThis.OP_SHARED;
const physics = require('../physics');

// Mock World de test doc lap cac loai dia hinh
class MockWorld {
  constructor(tileType = S.TILE.DEEP) {
    this.tileType = tileType;
  }
  getTileAtPixel() {
    return this.tileType;
  }
  isWater() {
    if (this.tileType === S.TILE.DEEP) return S.WATER.DEEP;
    if (this.tileType === S.TILE.SHALLOW) return S.WATER.SHALLOW;
    return S.WATER.LAND;
  }
  isBlockingAtPixel() {
    return this.tileType === S.TILE.WALL;
  }
}

function run() {
  console.log('- Dang chay: Water, Drowning, Stamina & Ice Physics Test...');

  // 1. Test nguoi khong co trai boi o bien sau (DEEP)
  const swimmer = {
    x: 100, y: 100,
    vx: 0, vy: 0,
    hp: 100, hpMax: 100,
    stamina: 100,
    fruit: null,
    currentInput: { mx: 1, my: 0, aim: 0 }
  };
  const deepWorld = new MockWorld(S.TILE.DEEP);

  // Chay 1 giay (30 tick dt = 1/30)
  for (let i = 0; i < 30; i++) {
    physics.tickPlayer(swimmer, deepWorld, 1 / 30);
  }

  // Toc do boi phai la 90 * 0.5 = 45 px/s
  assert.strictEqual(Math.round(swimmer.vx), 45, 'Toc do boi phai bang MOVE_SPEED * SWIM_MULT (45 px/s)');
  // The luc tieu hao 6/giay -> con 94
  assert.strictEqual(Math.round(swimmer.stamina), 94, 'The luc phai giam 6 sau 1 giay boi');
  assert.strictEqual(swimmer.hp, 100, 'Con the luc thi khong bi mat mau');

  // 2. Test nguoi khong co trai het the luc thi mat 5 mau/s
  swimmer.stamina = 0;
  for (let i = 0; i < 30; i++) {
    physics.tickPlayer(swimmer, deepWorld, 1 / 30);
  }
  assert.strictEqual(Math.round(swimmer.hp), 95, 'Het the luc boi phai mat 5 mau/s');

  // 3. Test nguoi CO TRAI chim o bien sau -> mat 17% mau toi da/s
  const fruitUser = {
    x: 100, y: 100,
    vx: 0, vy: 0,
    hp: 100, hpMax: 100,
    stamina: 100,
    fruit: 'mera',
    currentInput: { mx: 1, my: 0, aim: 0 }
  };

  for (let i = 0; i < 30; i++) {
    physics.tickPlayer(fruitUser, deepWorld, 1 / 30);
  }
  assert.strictEqual(fruitUser.drowning, true, 'Nguoi co trai phai o trang thai drowning khi o bien sau');
  assert.strictEqual(Math.round(fruitUser.hp), 83, 'Nguoi co trai phai mat 17% mau toi da sau 1 giay chim');

  // 4. Test o nuoc nong (SHALLOW)
  const shallowWorld = new MockWorld(S.TILE.SHALLOW);
  const normalShallow = {
    x: 100, y: 100, vx: 0, vy: 0, hp: 100, hpMax: 100, stamina: 100, fruit: null,
    currentInput: { mx: 1, my: 0, aim: 0 }
  };
  physics.tickPlayer(normalShallow, shallowWorld, 1 / 30);
  assert.strictEqual(Math.round(normalShallow.vx), 72, 'Toc do nguoi thuong o nuoc nong phai la 90 * 0.8 = 72 px/s');

  const fruitShallow = {
    x: 100, y: 100, vx: 0, vy: 0, hp: 100, hpMax: 100, stamina: 100, fruit: 'gomu',
    currentInput: { mx: 1, my: 0, aim: 0 }
  };
  physics.tickPlayer(fruitShallow, shallowWorld, 1 / 30);
  assert.strictEqual(Math.round(fruitShallow.vx), 63, 'Toc do nguoi co trai o nuoc nong phai la 90 * 0.7 = 63 px/s');
  assert.strictEqual(fruitShallow.drowning, false, 'Nuoc nong khong gay chim');

  // 5. Test dung tren cau (BRIDGE) hoac ben (DOCK) hoac thuyen
  const bridgeWorld = new MockWorld(S.TILE.BRIDGE);
  const onBridge = {
    x: 100, y: 100, vx: 0, vy: 0, hp: 100, hpMax: 100, stamina: 50, fruit: 'mera',
    currentInput: { mx: 0, my: 0, aim: 0 }
  };
  physics.tickPlayer(onBridge, bridgeWorld, 1.0);
  assert.strictEqual(onBridge.waterState, S.WATER.LAND, 'Dung tren cau phai xem nhu o tren can');
  assert.strictEqual(onBridge.drowning, false, 'Dung tren cau khong bi chim');
  assert.ok(onBridge.stamina > 50, 'Dung tren cau phai duoc hoi the luc');

  // 6. Test bang tron (ICE) co quan tinh
  const iceWorld = new MockWorld(S.TILE.ICE);
  const skater = {
    x: 100, y: 100, vx: 90, vy: 0, hp: 100, hpMax: 100, stamina: 100, fruit: null,
    currentInput: { mx: 0, my: 0, aim: 0 } // Nguoi choi buong tay khong bam phim
  };
  physics.tickPlayer(skater, iceWorld, 1 / 30);
  assert.ok(skater.vx > 50, 'Tren bang tron khi tha phim van phai truot theo quan tinh (vx > 50)');

  // 7. Test va cham voi tuong chan (WALL)
  const wallWorld = new MockWorld(S.TILE.WALL);
  const wallTester = {
    x: 100, y: 100, vx: 90, vy: 0, hp: 100, hpMax: 100, stamina: 100, fruit: null,
    currentInput: { mx: 1, my: 0, aim: 0 }
  };
  const startX = wallTester.x;
  physics.tickPlayer(wallTester, wallWorld, 1 / 30);
  assert.strictEqual(wallTester.x, startX, 'Khong duoc di xuyen qua tuong chan WALL');
  assert.strictEqual(wallTester.vx, 0, 'Van toc phai bi triet tieu khi va vao tuong');

  console.log('PASS');
}

module.exports = {
  name: 'Water, Drowning, Stamina & Ice Physics Test (water.test.js)',
  run: run
};
