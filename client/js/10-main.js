// client/js/10-main.js
// Entry point phia client: khoi tao game, lang nghe snapshot, render vong lap requestAnimationFrame.
// Phu thuoc: client/js/00 -> client/js/09.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};

  let worldCanvas = null;
  let worldCtx = null;
  let uiCanvas = null;
  let uiCtx = null;
  let animId = null;

  OP.GAME = {
    state: {
      me: null,
      ents: new Map(),
      zone: null,
      phase: 'LOBBY',
      seed: null,
      map: null,
      lastTick: 0
    },

    boot: function () {
      OP.GAME.updateLayout();

      worldCanvas = document.getElementById('worldCanvas');
      if (worldCanvas) worldCtx = worldCanvas.getContext('2d');

      uiCanvas = document.getElementById('uiCanvas');
      if (uiCanvas) uiCtx = uiCanvas.getContext('2d');

      if (OP.UI && OP.UI.initLobby) OP.UI.initLobby();
      if (OP.UI && OP.UI.initChat) OP.UI.initChat();
      if (OP.IN && OP.IN.init) OP.IN.init();
      if (OP.NET && OP.NET.connect) OP.NET.connect();

      // Lang nghe snapshot tu server
      if (OP.NET && OP.NET.on) {
        OP.NET.on('snap', function (snap) {
          OP.GAME.state.lastTick = snap.tick;
          if (OP.PRED && OP.PRED.onSnapshot) {
            OP.PRED.onSnapshot(snap);
          } else {
            OP.GAME.state.me = snap.me;
          }
        });

        OP.NET.on('phase', function (msg) {
          OP.GAME.state.phase = msg.phase;
        });
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          OP.GAME.renderReady();
        });
      } else {
        OP.GAME.renderReady();
      }

      // Khoi dong vong lap requestAnimationFrame
      OP.GAME.startLoop();
    },

    startLoop: function () {
      if (animId) return;

      function frame() {
        OP.GAME.render();
        animId = requestAnimationFrame(frame);
      }
      animId = requestAnimationFrame(frame);
    },

    render: function () {
      if (!worldCtx) return;

      // Cap nhat noi suy thuc the
      if (OP.PRED && OP.PRED.update) {
        OP.PRED.update();
      }

      // Render the gioi & thuc the
      if (OP.R && OP.R.renderEntities) {
        OP.R.renderEntities(worldCtx);
      }

      // Render HUD va bang debug F3
      if (uiCtx) {
        uiCtx.clearRect(0, 0, 480, 270);
        if (OP.HUD && OP.HUD.render) {
          OP.HUD.render(uiCtx);
        }
      }
    },

    updateLayout: function () {
      const container = document.getElementById('game-container');
      if (!container) return;

      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const scale = Math.max(1, Math.floor(Math.min(winW / 480, winH / 270)));

      container.style.width = (480 * scale) + 'px';
      container.style.height = (270 * scale) + 'px';
    },

    renderReady: function () {
      if (!uiCanvas || !uiCtx) return;
      uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
      uiCtx.fillStyle = '#ffffff';
      uiCtx.font = '32px VT323, monospace';
      uiCtx.textAlign = 'center';
      uiCtx.textBaseline = 'middle';
      uiCtx.fillText('OP-BR READY', uiCanvas.width / 2, uiCanvas.height / 2);
    }
  };

  window.addEventListener('resize', function () {
    OP.GAME.updateLayout();
    OP.GAME.renderReady();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', OP.GAME.boot);
  } else {
    OP.GAME.boot();
  }
})();
