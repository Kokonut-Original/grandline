// shared/21-mapgen.js
// Sinh ban do tu seed, dong nhat giua server va client.
// Phu thuoc: shared/00-namespace.js, shared/05-rng.js.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.MAPGEN = S.MAPGEN || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
