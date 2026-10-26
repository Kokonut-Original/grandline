// shared/03-protocol.js
// Dinh nghia giao thuc mang: ten message S.MSG, hanh dong S.ACT va su kien snapshot S.EV.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  S.MSG = Object.freeze({
    // Client -> Server
    JOIN: 'join',
    CHAT: 'chat',
    CFG: 'cfg',
    START: 'start',
    AIM_LAUNCH: 'aim_launch',
    FIRE_LAUNCH: 'fire_launch',
    IN: 'in',
    ACT: 'act',
    PING: 'ping',

    // Server -> Client
    WELCOME: 'welcome',
    LOBBY: 'lobby',
    PHASE: 'phase',
    SNAP: 'snap',
    TOAST: 'toast',
    CONFIRM_EAT: 'confirm_eat',
    PONG: 'pong',
    END: 'end'
  });

  S.ACT = Object.freeze({
    PICKUP: 'pickup',
    EAT: 'eat',
    EAT_CONFIRM: 'eat_confirm',
    DROP: 'drop',
    USE: 'use',
    SWAP: 'swap',
    BOARD: 'board',
    LEAVE_BOAT: 'leave_boat',
    EMOTE: 'emote',
    SPECTATE: 'spectate',
    DEV: 'dev'
  });

  S.EV = Object.freeze({
    HIT: 'hit',
    CAST: 'cast',
    ATK: 'atk',
    KILL: 'kill',
    EAT: 'eat',
    AWAKEN: 'awaken',
    HAKI: 'haki',
    ROKU: 'roku',
    LAND: 'land',
    AIRDROP: 'airdrop',
    SHELL: 'shell',
    YONKO: 'yonko',
    REVEAL: 'reveal',
    BOAT_SINK: 'boat_sink',
    EMOTE: 'emote',
    ZONE: 'zone',
    DROWN: 'drown',
    SFX: 'sfx'
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
