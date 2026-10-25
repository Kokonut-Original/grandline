// server/physics.js
// Xu ly vat ly di chuyen, va cham vat can, trang thai nuoc, boi, chet duoi, the luc, cat lun va bang tron.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/02-enums');

const S = globalThis.OP_SHARED;
const T = S.TILE || {};
const CONST = S.CONST || {};

function getWaterState(player, world) {
  if (!world || player.inLobby) return S.WATER.LAND;

  // Neu dang tren thuyen thi tinh la tren can
  if (player.boatId) {
    return S.WATER.LAND;
  }

  const tile = world.getTileAtPixel(player.x, player.y);

  // Cau go, ben thuyen khong tinh la o duoi nuoc
  if (tile === T.BRIDGE || tile === T.DOCK) {
    return S.WATER.LAND;
  }

  return world.isWater(Math.floor(player.x / 16), Math.floor(player.y / 16));
}

function tickPlayer(player, world, dt) {
  if (!player || player.disconnectedAt) return;

  const maxCoord = (CONST.MAP_TILES || 320) * (CONST.TILE || 16);
  const input = player.currentInput || { mx: 0, my: 0, aim: 0 };

  // 1. Kiem tra trang thai nuoc va dia hinh
  const waterState = getWaterState(player, world);
  player.waterState = waterState;

  const currentTile = world ? world.getTileAtPixel(player.x, player.y) : T.DEEP;
  const isIce = (currentTile === T.ICE);
  const isQuicksand = (currentTile === T.QUICKSAND);
  const hasFruit = !!player.fruit;

  // 2. Tinh toan he so toc do
  let speedMult = 1.0;
  if (waterState === S.WATER.DEEP) {
    speedMult = hasFruit ? 0.2 : (CONST.SWIM_MULT || 0.5);
  } else if (waterState === S.WATER.SHALLOW) {
    speedMult = hasFruit ? (CONST.SHALLOW_MULT_FRUIT || 0.7) : (CONST.SHALLOW_MULT || 0.8);
  }

  if (isQuicksand) {
    speedMult = Math.min(speedMult, 0.5);
  }

  // Chay nhanh khi giu Shift va con the luc (tang 45% toc do)
  const isSprinting = !!(input.sprint || ((input.btn || 0) & 32768)) && (input.mx !== 0 || input.my !== 0) && (player.stamina > 0) && (waterState !== S.WATER.DEEP);
  player.isSprinting = isSprinting;
  if (isSprinting) {
    speedMult *= 1.45;
  }

  const baseSpeed = (CONST.MOVE_SPEED || 90) * speedMult;

  // 3. Chuan hoa vector input
  let mx = input.mx || 0;
  let my = input.my || 0;
  const len = Math.hypot(mx, my);
  if (len > 1.0) {
    mx /= len;
    my /= len;
  }

  const desiredVx = mx * baseSpeed;
  const desiredVy = my * baseSpeed;

  // 4. Bang tron: truot quan tinh
  if (isIce) {
    player.vx = (player.vx || 0) * 0.94 + desiredVx * 0.08;
    player.vy = (player.vy || 0) * 0.94 + desiredVy * 0.08;
  } else {
    player.vx = desiredVx;
    player.vy = desiredVy;
  }

  // 5. Di chuyen & Va cham (Collision)
  const radius = CONST.PLAYER_RADIUS || 6;

  // Thu truc X
  const nextX = player.x + player.vx * dt;
  if (world && world.isBlockingAtPixel(nextX, player.y, radius)) {
    player.vx = 0;
  } else {
    player.x = nextX;
  }

  // Thu truc Y
  const nextY = player.y + player.vy * dt;
  if (world && world.isBlockingAtPixel(player.x, nextY, radius)) {
    player.vy = 0;
  } else {
    player.y = nextY;
  }

  // Gioi han trong pham vi map
  player.x = Math.max(16, Math.min(maxCoord - 16, player.x));
  player.y = Math.max(16, Math.min(maxCoord - 16, player.y));
  player.aim = input.aim || 0;

  // 6. The luc & Chet duoi (Stamina & Drowning)
  if (waterState === S.WATER.DEEP) {
    if (hasFruit) {
      // Nguoi co trai bi chim: mat 17% mau toi da moi giay
      player.drowning = true;
      const dps = (player.hpMax || 100) * (CONST.DROWN_PCT_PER_SEC || 0.17);
      player.hp = Math.max(0, player.hp - dps * dt);
    } else {
      // Nguoi khong co trai: boi ton 6 the luc/giay
      player.drowning = false;
      const staminaCost = (CONST.SWIM_STAMINA_COST || 6) * dt;
      player.stamina = Math.max(0, player.stamina - staminaCost);

      // Het the luc: mat 5 mau moi giay
      if (player.stamina <= 0) {
        player.hp = Math.max(0, player.hp - 5 * dt);
      }
    }
  } else if (isSprinting) {
    // Dang giu Shift chay nhanh: tieu hao 25 the luc/giay (chay lien tuc duoc 4 giay)
    player.drowning = false;
    const sprintCost = (CONST.SPRINT_STAMINA_COST || 25) * dt;
    player.stamina = Math.max(0, player.stamina - sprintCost);
  } else if (waterState === S.WATER.LAND) {
    // Tren can: tu hoi 15 the luc/giay
    player.drowning = false;
    const regen = (CONST.STAMINA_REGEN || 15) * dt;
    player.stamina = Math.min(CONST.STAMINA_MAX || 100, player.stamina + regen);
  } else {
    // Nuoc nong: hoi the luc cham (5/giay)
    player.drowning = false;
    player.stamina = Math.min(CONST.STAMINA_MAX || 100, player.stamina + 5 * dt);
  }
}

module.exports = {
  getWaterState: getWaterState,
  tickPlayer: tickPlayer
};
