// shared/20-rules-damage.js
// Ham tinh he so sat thuong thuan khong side effect.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.RULES_DAMAGE = S.RULES_DAMAGE || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
