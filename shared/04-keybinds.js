// shared/04-keybinds.js
// Dinh nghia bitmask phim bam BTN va ban phim mac dinh KEYS.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.BTN = S.BTN || {};
  S.KEYS = S.KEYS || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
