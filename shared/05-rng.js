// shared/05-rng.js
// Bo sinh so ngau nhien co seed (mulberry32) va ham hash.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.RNG = S.RNG || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
