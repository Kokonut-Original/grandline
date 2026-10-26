// client/js/03-input.js
// Lang nghe ban phim va chuot, tinh toan vector di chuyen, goc ngam va bitmask input.
// Phu thuoc: client/js/00-boot.js, shared/01-constants.js, shared/04-keybinds.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  const S = OP.S || (typeof globalThis !== 'undefined' ? globalThis.OP_SHARED : {});

  let seq = 0;
  const keysDown = new Set();
  let mouseScreenX = 240;
  let mouseScreenY = 135;
  let mouseButtons = 0;
  let sendInterval = null;

  OP.IN = {
    init: function () {
      if (sendInterval) return;

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

      // Dinh thoi gui input 30Hz
      const tickHz = (S.CONST && S.CONST.TICK_HZ) ? S.CONST.TICK_HZ : 30;
      const intervalMs = Math.floor(1000 / tickHz);

      sendInterval = setInterval(function () {
        if (!OP.NET || !OP.NET.isConnected || !OP.NET.isConnected()) return;

        const inputState = OP.IN.getState();
        seq++;
        const dt = intervalMs / 1000;

        // Du doan vi tri ngay tren may client
        if (OP.PRED && OP.PRED.addInput) {
          OP.PRED.addInput({
            seq: seq,
            mx: inputState.mx,
            my: inputState.my,
            aim: inputState.aim,
            btn: inputState.btn,
            sprint: inputState.sprint,
            dt: dt
          });
        }

        OP.NET.send({
          t: 'in',
          seq: seq,
          mx: inputState.mx,
          my: inputState.my,
          aim: inputState.aim,
          btn: inputState.btn,
          sprint: inputState.sprint
        });
      }, intervalMs);
    },

    getState: function () {
      let mx = 0;
      let my = 0;

      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) my -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) my += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;

      // Giu Shift de chay nhanh
      const isShift = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');
      const isSprint = isShift && (mx !== 0 || my !== 0);

      // Tinh goc ngam tu vi tri nhan vat toi chuot trong toa do the gioi
      // (nhan vat khong luon o tam man hinh: camera bi chan o mep map)
      let aim = 0;
      const me = OP.GAME && OP.GAME.state && OP.GAME.state.me;
      if (me && OP.CAM && OP.CAM.screenToWorld) {
        const mw = OP.CAM.screenToWorld(mouseScreenX, mouseScreenY);
        aim = Math.atan2(mw.y - (me.y - 12), mw.x - me.x);
      } else {
        const viewW = (S.CONST && S.CONST.VIEW_W) || 480;
        const viewH = (S.CONST && S.CONST.VIEW_H) || 270;
        aim = Math.atan2(mouseScreenY - viewH / 2, mouseScreenX - viewW / 2);
      }

      // Bitmask nut bam
      let btn = 0;
      const BTN = S.BTN || {};
      if (mouseButtons & 1) btn |= (BTN.ATTACK || 1);
      if (mouseButtons & 2) btn |= (BTN.BLOCK || 2);
      if (keysDown.has('KeyQ')) btn |= (BTN.Q || 4);
      if (keysDown.has('KeyE')) btn |= (BTN.E || 8);
      if (keysDown.has('KeyR')) btn |= (BTN.R || 16);
      if (isSprint) btn |= (BTN.SPRINT || 32768);

      return { mx, my, aim, btn, sprint: isSprint };
    }
  };
})();
