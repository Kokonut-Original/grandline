// shared/00-namespace.js
// Khoi tao namespace OP_SHARED dung chung giua server va client.
// Phu thuoc: khong co.

(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
