// client/js/10-main.js
// Entry point phia client: khoi tao OP.GAME, phong to man hinh pixel, render OP-BR READY.
// Phu thuoc: client/js/00 -> client/js/09.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};

  OP.GAME = {
    state: {
      me: null,
      ents: new Map(),
      zone: null,
      phase: null,
      seed: null,
      map: null
    },

    boot: function () {
      OP.GAME.updateLayout();

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          OP.GAME.renderReady();
        });
      } else {
        OP.GAME.renderReady();
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
      const uiCanvas = document.getElementById('uiCanvas');
      if (!uiCanvas) return;

      const ctx = uiCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '32px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OP-BR READY', uiCanvas.width / 2, uiCanvas.height / 2);
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
