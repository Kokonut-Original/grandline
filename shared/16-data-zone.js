// shared/16-data-zone.js
// Du lieu 7 pha bo thu hep (thoi gian cho, thoi gian thu, ban kinh, sat thuong).
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.ZONE = S.ZONE || [];
})(typeof globalThis !== 'undefined' ? globalThis : window);
