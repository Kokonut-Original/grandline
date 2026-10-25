// shared/00-namespace.js
// Khoi tao namespace OP_SHARED dung chung giua server va client.
// Phu thuoc: khong co.

(function (root) {
  'use strict';
  root.OP_SHARED = root.OP_SHARED || {};
})(typeof globalThis !== 'undefined' ? globalThis : window);
