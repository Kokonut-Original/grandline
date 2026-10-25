// shared/04-keybinds.js
// Dinh nghia bitmask phim bam S.BTN va ban phim mac dinh S.KEYS.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  S.BTN = Object.freeze({
    ATTACK: 1,
    BLOCK: 2,
    Q: 4,
    E: 8,
    R: 16,
    ROKU1: 32,
    ROKU2: 64,
    ROKU3: 128,
    HAKI_ARM: 256,
    HAKI_OBS: 512,
    HAKI_CONQ: 1024,
    INTERACT: 2048,
    DIAL: 4096,
    W1: 8192,
    W2: 16384
  });

  S.KEYS = Object.freeze({
    ATTACK: 'Mouse0',
    BLOCK: 'Mouse2',
    Q: 'KeyQ',
    E: 'KeyE',
    R: 'KeyR',
    ROKU1: 'ShiftLeft',
    ROKU2: 'Space',
    ROKU3: 'KeyC',
    HAKI_ARM: 'KeyH',
    HAKI_OBS: 'KeyV',
    HAKI_CONQ: 'KeyG',
    INTERACT: 'KeyF',
    DIAL: 'KeyX',
    W1: 'Digit1',
    W2: 'Digit2',
    BAG: Object.freeze(['Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8']),
    INV: 'KeyI',
    MAP: 'Tab',
    CHAT: 'Enter',
    DEBUG: 'F3'
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
