// shared/01-constants.js
// Dinh nghia cac hang so toan cuc CONST cua tro choi.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  S.CONST = Object.freeze({
    // Ban do & hien thi
    TILE: 16,
    MAP_TILES: 320,
    VIEW_W: 480,
    VIEW_H: 270,

    // Mang & server
    PORT: 8080,
    TICK_HZ: 30,
    SNAP_HZ: 20,
    BOT_HZ: 10,
    INTERP_MS: 100,
    AOI_RADIUS: 560,
    MAX_PLAYERS: 32,
    RECONNECT_SEC: 30,
    INPUT_MAX_PER_SEC: 60,
    INPUT_QUEUE_MAX: 10,
    INPUT_BURST: 6,
    MSG_MAX_BYTES: 16384,
    MSG_MAX_PER_SEC: 120,
    CHAT_MAX_PER_SEC: 2,

    // Chi so nguoi choi
    HP_BASE: 100,
    STAMINA_MAX: 100,
    STAMINA_REGEN: 15,
    HAKI_MAX: 100,
    HAKI_REGEN: 6,
    MOVE_SPEED: 90,
    PLAYER_RADIUS: 6,

    // Nuoc
    SWIM_MULT: 0.5,
    SHALLOW_MULT_FRUIT: 0.7,
    SHALLOW_MULT: 0.8,
    DROWN_PCT_PER_SEC: 0.17,
    SWIM_STAMINA_COST: 6,
    SINK_MULT: 0.2,
    SWIM_EXHAUST_DPS: 5,
    SHALLOW_STAMINA_REGEN: 5,

    // Dia hinh dac biet (he so quan tinh tinh theo moi buoc 1/TICK_HZ)
    QUICKSAND_MULT: 0.5,
    ICE_KEEP: 0.94,
    ICE_ACCEL: 0.08,

    // Inventory
    BAG_SLOTS: 6,
    ROKU_SLOTS: 2,
    ROKU_SLOTS_NOFRUIT: 3,

    // Luong tran
    LAUNCH_SEC: 60,
    LAUNCH_SCATTER_TILES: 6,
    LAND_INVULN_SEC: 2,
    AIRDROP_START_SEC: 180,
    AIRDROP_EVERY_SEC: 150,
    AIRDROP_OPEN_SEC: 3,
    YONKO_UPDATE_SEC: 30,
    YONKO_REVEAL_EVERY: 45,
    YONKO_REVEAL_SEC: 5,
    BOSS_RESPAWN_SEC: 240,
    FRUIT_REBIRTH_SEC: 20,

    // Tien truy na
    BOUNTY_KILL: 10,
    BOUNTY_STEAL_PCT: 0.25,
    BOUNTY_BOSS: 5,
    YONKO_STEAL_PCT: 0.5,

    // Thuc tinh
    AWAKEN_KILLS: 3,
    AWAKEN_R_CD_MULT: 0.7,
    AWAKEN_R_DMG_MULT: 1.5,

    // Nap R
    R_CHARGE_DMG: 150,
    R_CHARGE_PASSIVE_SEC: 60
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
