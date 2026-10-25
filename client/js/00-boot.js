// client/js/00-boot.js
// Khoi tao namespace OP, overlay bat loi Javascript, doc co ?debug=1.
// Phu thuoc: window.OP_SHARED (shared/00).

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.S = window.OP_SHARED || {};

  const params = new URLSearchParams(window.location.search);
  OP.debug = params.get('debug') === '1';

  // Hien thi overlay loi de de dang phat hien va sua loi
  function showError(msg, source, lineno, colno) {
    const overlay = document.getElementById('error-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    const errorText = `[LOI RUNTIME]\n${msg}\nTai: ${source || 'khong ro'}:${lineno || 0}:${colno || 0}\n`;
    overlay.textContent += errorText + '\n';
  }

  window.addEventListener('error', function (e) {
    showError(e.message, e.filename, e.lineno, e.colno);
  });

  window.addEventListener('unhandledrejection', function (e) {
    showError(e.reason ? (e.reason.stack || e.reason.message || e.reason) : 'Promise rejection');
  });
})();
