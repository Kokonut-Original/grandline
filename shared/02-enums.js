// shared/02-enums.js
// Dinh nghia cac enum he thong (DMG, TIER, TILE, ENT, STATUS, WATER...).
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  S.DMG = Object.freeze({
    SLASH: 'SLASH',
    BLUNT: 'BLUNT',
    BULLET: 'BULLET',
    EXPLOSION: 'EXPLOSION',
    FIRE: 'FIRE',
    ICE: 'ICE',
    LIGHTNING: 'LIGHTNING',
    POISON: 'POISON',
    MAGMA: 'MAGMA',
    LIGHT: 'LIGHT',
    SAND: 'SAND',
    SMOKE: 'SMOKE',
    SNOW: 'SNOW',
    PURE: 'PURE'
  });

  S.PHYSICAL = Object.freeze([
    S.DMG.SLASH,
    S.DMG.BLUNT,
    S.DMG.BULLET,
    S.DMG.EXPLOSION
  ]);

  S.FRUIT_CLASS = Object.freeze({
    LOGIA: 'LOGIA',
    PARAMECIA: 'PARAMECIA',
    ZOAN: 'ZOAN'
  });

  S.TIER = Object.freeze({
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
    MYTHIC: 'MYTHIC'
  });

  S.TIER_COLOR = Object.freeze({
    C: '#cfcfcf',
    B: '#5ac54f',
    A: '#3e8edf',
    S: '#a34fd8',
    MYTHIC: '#f4c430'
  });

  S.TIER_MULT = Object.freeze({
    C: 0.9,
    B: 1.0,
    A: 1.1,
    S: 1.2,
    MYTHIC: 1.3
  });

  S.SWORD_GRADE = Object.freeze({
    NORMAL: 'NORMAL',
    WAZAMONO: 'WAZAMONO',
    RYO: 'RYO',
    O: 'O',
    SAIJO: 'SAIJO'
  });

  S.WEAPON_KIND = Object.freeze({
    SWORD: 'SWORD',
    BLUNT: 'BLUNT',
    GUN: 'GUN',
    SPECIAL: 'SPECIAL'
  });

  S.ITEM_KIND = Object.freeze({
    FRUIT: 'FRUIT',
    WEAPON: 'WEAPON',
    CONSUMABLE: 'CONSUMABLE',
    ARMOR: 'ARMOR',
    DIAL: 'DIAL',
    HAKI_SHARD: 'HAKI_SHARD',
    SCROLL: 'SCROLL',
    AWAKEN: 'AWAKEN'
  });

  S.HAKI = Object.freeze({
    ARM: 'ARM',
    OBS: 'OBS',
    CONQ: 'CONQ'
  });

  S.ROKU = Object.freeze({
    soru: 'soru',
    geppo: 'geppo',
    tekkai: 'tekkai',
    shigan: 'shigan',
    rankyaku: 'rankyaku',
    kamie: 'kamie'
  });

  S.ENT = Object.freeze({
    PLAYER: 'PLAYER',
    PROJ: 'PROJ',
    ITEM: 'ITEM',
    CHEST: 'CHEST',
    BOSS: 'BOSS',
    MOB: 'MOB',
    BOAT: 'BOAT',
    AIRDROP: 'AIRDROP',
    HAZARD: 'HAZARD'
  });

  S.WATER = Object.freeze({
    LAND: 0,
    SHALLOW: 1,
    DEEP: 2
  });

  S.PHASE = Object.freeze({
    LOBBY: 'LOBBY',
    LAUNCH: 'LAUNCH',
    PLAY: 'PLAY',
    END: 'END'
  });

  S.CROSS = Object.freeze({
    NONE: 'NONE',
    SHORT: 'SHORT',
    FLY: 'FLY',
    TELEPORT: 'TELEPORT'
  });

  S.STATUS = Object.freeze({
    burn: 'burn',
    slow: 'slow',
    stun: 'stun',
    root: 'root',
    poison: 'poison',
    fruitLock: 'fruitLock',
    wet: 'wet',
    invuln: 'invuln',
    silence: 'silence',
    negative: 'negative',
    airborne: 'airborne',
    intangibleOff: 'intangibleOff'
  });

  S.BOT_LEVEL = Object.freeze({
    normal: 'normal',
    hard: 'hard'
  });

  S.EMOTE = Object.freeze({
    laugh: 'laugh',
    shock: 'shock',
    cry: 'cry',
    clap: 'clap'
  });

  S.TILE = Object.freeze({
    DEEP: 0,
    SHALLOW: 1,
    SAND: 2,
    GRASS: 3,
    DIRT: 4,
    STONE: 5,
    WALL: 6,
    WOOD: 7,
    ICE: 8,
    LAVA: 9,
    SNOW: 10,
    QUICKSAND: 11,
    DOCK: 12,
    BRIDGE: 13,
    TREE: 14,
    HOUSE_WALL: 15,
    FLOOR: 16
  });

  S.TILE_BLOCKING = Object.freeze([
    S.TILE.WALL,
    S.TILE.TREE,
    S.TILE.HOUSE_WALL
  ]);

  S.DMG_COLOR = Object.freeze({
    SLASH: '#ffffff',
    BLUNT: '#ffd27a',
    BULLET: '#e0e0e0',
    EXPLOSION: '#ff8a00',
    FIRE: '#ff5a1f',
    ICE: '#8fe3ff',
    LIGHTNING: '#fff35a',
    POISON: '#9be564',
    MAGMA: '#c2185b',
    LIGHT: '#fffbd0',
    SAND: '#e2c275',
    SMOKE: '#b0b0b0',
    SNOW: '#f0faff',
    PURE: '#ff2d55'
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
