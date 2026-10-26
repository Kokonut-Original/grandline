// client/js/03-input.js
// Lang nghe ban phim va chuot, tinh vector di chuyen, goc ngam va bitmask input (khong tu gui mang).
// Phu thuoc: client/js/00-boot.js, client/js/04-camera.js, shared/01-constants.js, shared/04-keybinds.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  const S = OP.S || (typeof globalThis !== 'undefined' ? globalThis.OP_SHARED : {});

  const keysDown = new Set();
  let mouseScreenX = S.CONST.VIEW_W / 2;
  let mouseScreenY = S.CONST.VIEW_H / 2;
  let mouseButtons = 0;
  let initialized = false;

  OP.IN = {
    init: function () {
      if (initialized) return;

      window.addEventListener('keydown', function (e) {
        // Khong bat phim khi dang go trong input/textarea
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
          return;
        }
        keysDown.add(e.code);
      });

      window.addEventListener('keyup', function (e) {
        keysDown.delete(e.code);
      });

      const container = document.getElementById('game-container') || window;

      container.addEventListener('mousemove', function (e) {
        const rect = container.getBoundingClientRect ? container.getBoundingClientRect() : { left: 0, top: 0, width: 480, height: 270 };
        const scaleX = 480 / (rect.width || 480);
        const scaleY = 270 / (rect.height || 270);

        mouseScreenX = (e.clientX - rect.left) * scaleX;
        mouseScreenY = (e.clientY - rect.top) * scaleY;
      });

      container.addEventListener('mousedown', function (e) {
        if (e.button === 0) mouseButtons |= 1; // Left click
        if (e.button === 2) mouseButtons |= 2; // Right click
      });

      container.addEventListener('mouseup', function (e) {
        if (e.button === 0) mouseButtons &= ~1;
        if (e.button === 2) mouseButtons &= ~2;
      });

      window.addEventListener('contextmenu', function (e) {
        // Chan menu chuot phai trong game
        if (e.target && e.target.closest('#game-container')) {
          e.preventDefault();
        }
      });

      // Mat focus (alt-tab, click ra ngoai): tha het phim, tranh nhan vat tu chay mai
      window.addEventListener('blur', function () {
        keysDown.clear();
        mouseButtons = 0;
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          keysDown.clear();
          mouseButtons = 0;
        }
      });

      // Input duoc lay va gui theo buoc co dinh trong OP.PRED.frame (09-predict.js)
      initialized = true;
    },

    // Goc ngam tu than nhan vat toi chuot, trong toa do the gioi
    // (nhan vat khong luon o tam man hinh: camera bi chan o mep map)
    getAim: function () {
      const me = OP.GAME && OP.GAME.state && OP.GAME.state.me;
      if (me && OP.CAM && OP.CAM.screenToWorld) {
        const mw = OP.CAM.screenToWorld(mouseScreenX, mouseScreenY);
        return Math.atan2(mw.y - (me.y - 12), mw.x - me.x);
      }
      return Math.atan2(mouseScreenY - S.CONST.VIEW_H / 2, mouseScreenX - S.CONST.VIEW_W / 2);
    },

    getState: function () {
      let mx = 0;
      let my = 0;

      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) my -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) my += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;

      // Bitmask nut bam theo S.BTN / S.KEYS (BIEN-CHUNG muc 8)
      let btn = 0;
      const BTN = S.BTN;
      const KEYS = S.KEYS;
      if (mouseButtons & 1) btn |= BTN.ATTACK;
      if (mouseButtons & 2) btn |= BTN.BLOCK;
      for (const name in BTN) {
        if (name === 'ATTACK' || name === 'BLOCK') continue;
        const code = KEYS[name];
        if (typeof code === 'string' && keysDown.has(code)) btn |= BTN[name];
      }

      return { mx: mx, my: my, aim: OP.IN.getAim(), btn: btn };
    }
  };
})();
