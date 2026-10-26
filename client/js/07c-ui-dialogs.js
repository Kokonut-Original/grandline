// client/js/07c-ui-dialogs.js
// Hop thoai xac nhan an trai ac quy (lam o M05) va thong bao toast (message 'toast' tu server).
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js, client/js/07a-ui-lobby.js.

(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  OP.UI = OP.UI || {};

  const TOAST_MS = 2600;
  let toastWrap = null;

  function ensureWrap() {
    if (toastWrap) return toastWrap;
    const uiRoot = document.getElementById('ui-root');
    if (!uiRoot) return null;
    toastWrap = document.createElement('div');
    toastWrap.id = 'toast-wrap';
    uiRoot.appendChild(toastWrap);
    return toastWrap;
  }

  // kind: 'info' | 'warn' | 'big' (BIEN-CHUNG muc 7). Noi dung dung textContent.
  OP.UI.toast = function (text, kind) {
    const wrap = ensureWrap();
    if (!wrap || !text) return;
    const el = document.createElement('div');
    el.className = 'toast toast-' + (kind === 'warn' || kind === 'big' ? kind : 'info');
    el.textContent = String(text);
    wrap.appendChild(el);
    while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, TOAST_MS);
  };

  OP.UI.confirmEat = function () {};

  if (OP.NET && OP.NET.on) {
    OP.NET.on('toast', function (msg) {
      OP.UI.toast(msg.text, msg.kind);
    });
  }
})();
