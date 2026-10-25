// tools/check_data.js
// Nap shared bang Node.js, kiem tra tinh hop le cua CONST, ENUM, PROTOCOL, KEYBINDS, RNG.
// Phu thuoc: shared/*.js.

'use strict';

const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..');

// Nap toan bo file shared
const sharedFiles = [
  '00-namespace.js',
  '01-constants.js',
  '02-enums.js',
  '03-protocol.js',
  '04-keybinds.js',
  '05-rng.js',
  '10-data-fruits.js',
  '11-data-weapons.js',
  '12-data-items.js',
  '13-data-bosses.js',
  '14-data-islands.js',
  '15-data-boats.js',
  '16-data-zone.js',
  '20-rules-damage.js',
  '21-mapgen.js'
];

for (const file of sharedFiles) {
  require(path.join(ROOT_DIR, 'shared', file));
}

const S = globalThis.OP_SHARED;
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

console.log('=== DANG CHAY CHECK_DATA.JS ===');

// 1. Kiem tra S.CONST
console.log('1. Kiem tra S.CONST...');
assert(S.CONST !== undefined, 'S.CONST chua duoc dinh nghia');
assert(Object.isFrozen(S.CONST), 'S.CONST chua duoc Object.freeze');
assert(S.CONST.TILE === 16, `S.CONST.TILE = ${S.CONST.TILE}, ky vong 16`);
assert(S.CONST.MAP_TILES === 320, `S.CONST.MAP_TILES = ${S.CONST.MAP_TILES}, ky vong 320`);
assert(S.CONST.VIEW_W === 480 && S.CONST.VIEW_H === 270, 'S.CONST VIEW_W/VIEW_H khong dung 480/270');
assert(S.CONST.PORT === 8080, 'S.CONST.PORT khong dung 8080');
assert(S.CONST.TICK_HZ === 30, 'S.CONST.TICK_HZ khong dung 30');
assert(S.CONST.SNAP_HZ === 20, 'S.CONST.SNAP_HZ khong dung 20');
assert(S.CONST.MAX_PLAYERS === 32, 'S.CONST.MAX_PLAYERS khong dung 32');
assert(Array.isArray(S.CONST.BUSTER_AT_SEC) && S.CONST.BUSTER_AT_SEC.length === 2, 'S.CONST.BUSTER_AT_SEC khong hop le');

// 2. Kiem tra S.DMG & S.PHYSICAL
console.log('2. Kiem tra S.DMG va S.PHYSICAL...');
assert(S.DMG && Object.isFrozen(S.DMG), 'S.DMG chua freeze hoac chua ton tai');
const expectedDmgs = ['SLASH', 'BLUNT', 'BULLET', 'EXPLOSION', 'FIRE', 'ICE', 'LIGHTNING', 'POISON', 'MAGMA', 'LIGHT', 'SAND', 'SMOKE', 'SNOW', 'PURE'];
for (const d of expectedDmgs) {
  assert(S.DMG[d] === d, `Thieu loai sat thuong S.DMG.${d}`);
}
assert(Array.isArray(S.PHYSICAL) && Object.isFrozen(S.PHYSICAL), 'S.PHYSICAL khong phai mang freeze');
assert(S.PHYSICAL.length === 4, `S.PHYSICAL co do dai ${S.PHYSICAL.length}, ky vong 4`);

// 3. Kiem tra S.TIER & S.TIER_COLOR
console.log('3. Kiem tra S.TIER va S.TIER_COLOR...');
const expectedTiers = ['C', 'B', 'A', 'S', 'MYTHIC'];
for (const t of expectedTiers) {
  assert(S.TIER[t] === t, `Thieu S.TIER.${t}`);
  assert(typeof S.TIER_COLOR[t] === 'string' && S.TIER_COLOR[t].startsWith('#'), `S.TIER_COLOR.${t} khong hop le`);
  assert(typeof S.TIER_MULT[t] === 'number', `S.TIER_MULT.${t} khong hop le`);
}

// 4. Kiem tra S.TILE
console.log('4. Kiem tra S.TILE...');
assert(S.TILE && Object.isFrozen(S.TILE), 'S.TILE chua freeze');
assert(S.TILE.DEEP === 0, 'S.TILE.DEEP phai bang 0');
assert(S.TILE.SHALLOW === 1, 'S.TILE.SHALLOW phai bang 1');
assert(S.TILE.FLOOR === 16, 'S.TILE.FLOOR phai bang 16');
assert(Array.isArray(S.TILE_BLOCKING) && S.TILE_BLOCKING.includes(S.TILE.WALL), 'S.TILE_BLOCKING khong dung');

// 5. Kiem tra S.WATER, S.PHASE, S.ENT, S.STATUS
console.log('5. Kiem tra WATER, PHASE, ENT, STATUS, BOT_LEVEL, EMOTE...');
assert(S.WATER.LAND === 0 && S.WATER.SHALLOW === 1 && S.WATER.DEEP === 2, 'S.WATER khong dung gia tri 0, 1, 2');
assert(S.PHASE.LOBBY && S.PHASE.LAUNCH && S.PHASE.PLAY && S.PHASE.END, 'S.PHASE thieu cac trang thai');
assert(S.ENT.PLAYER && S.ENT.PROJ && S.ENT.ITEM && S.ENT.BOSS && S.ENT.BOAT, 'S.ENT thieu thuc the co ban');
assert(S.STATUS.burn && S.STATUS.slow && S.STATUS.stun && S.STATUS.fruitLock, 'S.STATUS thieu trang thai');
assert(S.BOT_LEVEL.easy && S.BOT_LEVEL.normal && S.BOT_LEVEL.hard, 'S.BOT_LEVEL thieu cap do');

// 6. Kiem tra Giao thuc mang & Input
console.log('6. Kiem tra S.MSG, S.BTN, S.KEYS...');
assert(S.MSG.JOIN === 'join' && S.MSG.SNAP === 'snap' && S.MSG.PING === 'ping', 'S.MSG khong dung');
assert(S.BTN.ATTACK === 1 && S.BTN.BLOCK === 2 && S.BTN.Q === 4, 'S.BTN khong dung bitmask');
assert(S.KEYS.ATTACK === 'Mouse0' && S.KEYS.Q === 'KeyQ', 'S.KEYS khong dung phim mac dinh');

// 7. Kiem tra S.RNG
console.log('7. Kiem tra S.RNG...');
assert(typeof S.RNG.create === 'function', 'S.RNG.create khong phai la ham');
assert(typeof S.RNG.hash === 'function', 'S.RNG.hash khong phai la ham');
assert(typeof S.RNG.hash2 === 'function', 'S.RNG.hash2 khong phai la ham');

const rngA = S.RNG.create(123);
const rngB = S.RNG.create(123);
const valA = rngA.next();
const valB = rngB.next();
assert(valA === valB, 'RNG khong cho ra ket qua dong nhat voi cung mot seed');
assert(valA >= 0 && valA < 1, 'RNG.next() khong nam trong khoang [0, 1)');

console.log('='.repeat(35));
if (errors.length > 0) {
  console.log(`CHECK_DATA: FAIL (${errors.length} loi):`);
  for (const err of errors) {
    console.log(`  FAIL: ${err}`);
  }
  process.exit(1);
} else {
  console.log('CHECK_DATA: PASS (Moi du lieu shared co ban deu hop le va duoc dong bang)');
  process.exit(0);
}
