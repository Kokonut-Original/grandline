// server/physics.js
// Vat ly phia server: ap 1 input di chuyen (qua shared/22-move.js, giong het client du doan)
// va tick moi truong moi tick (the luc, boi, chet duoi). Ten truong theo BIEN-CHUNG muc 6.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js, shared/22-move.js, server/world.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/02-enums');
require('../shared/22-move');

const S = globalThis.OP_SHARED;
const C = S.CONST;
const W = S.WATER;

function moveOpts(player) {
  return {
    hasFruit: !!player.fruitId,
    onBoat: player.onBoatId !== null && player.onBoatId !== undefined
  };
}

// Ap 1 lenh input (1 buoc STEP_DT) len nguoi choi. Dung cho hang doi input cua match.js.
function applyInput(player, input, world) {
  if (!player || !player.alive) return;
  S.MOVE.step(player, input, world ? world.map : null, moveOpts(player));
}

// Trang thai nuoc hien tai (dung cho moi truong va snapshot)
function getWaterState(player, world) {
  if (moveOpts(player).onBoat) return W.LAND;
  return S.MOVE.waterAt(world ? world.map : null, player.x, player.y);
}

/**
 * Tick moi truong theo thoi gian (khong phu thuoc input):
 * - Nuoc sau, co trai: chim, mat DROWN_PCT_PER_SEC mau toi da moi giay.
 * - Nuoc sau, khong trai: boi ton SWIM_STAMINA_COST the luc/giay, het the luc mat SWIM_EXHAUST_DPS mau/giay.
 * - Tren can: hoi STAMINA_REGEN/giay. Nuoc nong: hoi SHALLOW_STAMINA_REGEN/giay.
 * opts.safe = true (phong cho): khong mat mau.
 */
function tickEnv(player, world, dt, opts) {
  if (!player || !player.alive) return;
  const safe = !!(opts && opts.safe);
  const water = getWaterState(player, world);
  const hasFruit = !!player.fruitId;
  player.water = water;
  player.drowning = false;

  if (water === W.DEEP) {
    if (hasFruit) {
      player.drowning = true;
      if (!safe) player.hp = Math.max(0, player.hp - player.hpMax * C.DROWN_PCT_PER_SEC * dt);
    } else {
      player.stamina = Math.max(0, player.stamina - C.SWIM_STAMINA_COST * dt);
      if (player.stamina <= 0 && !safe) {
        player.hp = Math.max(0, player.hp - C.SWIM_EXHAUST_DPS * dt);
      }
    }
  } else if (water === W.SHALLOW) {
    player.stamina = Math.min(C.STAMINA_MAX, player.stamina + C.SHALLOW_STAMINA_REGEN * dt);
  } else {
    player.stamina = Math.min(C.STAMINA_MAX, player.stamina + C.STAMINA_REGEN * dt);
  }
}

module.exports = {
  applyInput: applyInput,
  tickEnv: tickEnv,
  getWaterState: getWaterState
};
