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

  const S = window.OP_SHARED || {};
  const VIEW_W = (S.CONST && S.CONST.VIEW_W) || 480;
  const VIEW_H = (S.CONST && S.CONST.VIEW_H) || 270;

  // So pixel thiet bi cho 1 pixel game (luon nguyen) va dpr dang dung
  let pixelScale = 1;
  let currentDpr = 1;

  OP.GAME = {
    state: {
      me: null,
      ents: new Map(),
      zone: null,
      phase: 'LOBBY',
      dev: false,
      seed: null,
      map: null,
      lastTick: 0
    },

    boot: function () {
      worldCanvas = document.getElementById('worldCanvas');
      if (worldCanvas) worldCtx = worldCanvas.getContext('2d');

      uiCanvas = document.getElementById('uiCanvas');
      if (uiCanvas) uiCtx = uiCanvas.getContext('2d');

      OP.GAME.updateLayout();

      if (OP.UI && OP.UI.initLobby) OP.UI.initLobby();
      if (OP.UI && OP.UI.initChat) OP.UI.initChat();
      if (OP.IN && OP.IN.init) OP.IN.init();
      if (OP.NET && OP.NET.connect) OP.NET.connect();

      // Lang nghe message tu server
      if (OP.NET && OP.NET.on) {
        OP.NET.on('welcome', function (msg) {
          // Vao moi hoac reconnect: server dem seq input lai tu dau
          if (OP.PRED && OP.PRED.reset) OP.PRED.reset();
          OP.GAME.state.dev = !!(msg && msg.dev);
          if (msg && msg.seed !== undefined) {
            OP.GAME.state.seed = msg.seed;
            const S = OP.S || window.OP_SHARED;
            if (S && S.MAPGEN && S.MAPGEN.generate) {
              OP.GAME.state.map = S.MAPGEN.generate(msg.seed);
              if (OP.R && OP.R.initMap) {
                OP.R.initMap(OP.GAME.state.map);
              }
            }
          }
        });

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

      // Du doan + gui input theo buoc co dinh, roi noi suy cac thuc the khac
      if (OP.PRED) {
        OP.PRED.frame(performance.now());
        OP.PRED.update();
      }

      // Camera bam thang vi tri hien thi (da noi suy muot), khong lerp de tranh truot/rung pixel
      if (OP.GAME.state.me && OP.CAM && OP.CAM.follow) {
        OP.CAM.follow(OP.GAME.state.me.x, OP.GAME.state.me.y, 1);
      }

      // Kiem tra dpr thay doi (keo cua so sang man hinh khac, zoom trinh duyet)
      if ((window.devicePixelRatio || 1) !== currentDpr) {
        OP.GAME.updateLayout();
      }

      // Xoa man hinh worldCanvas
      worldCtx.clearRect(0, 0, VIEW_W, VIEW_H);

      // Render the gioi & thuc the co su dung camera
      if (OP.CAM && OP.CAM.apply) {
        OP.CAM.apply(worldCtx);
      }

      // Render ban do dia hinh theo chunk
      if (OP.R && OP.R.renderMap) {
        OP.R.renderMap(worldCtx);
      }

      if (OP.R && OP.R.renderEntities) {
        OP.R.renderEntities(worldCtx);
      }

      if (OP.CAM && OP.CAM.restore) {
        OP.CAM.restore(worldCtx);
      }

      // Lop anh sang ve o toa do man hinh (sau CAM.restore)
      if (OP.R && OP.R.renderLight) {
        OP.R.renderLight(worldCtx);
      }

      // Overlay nguoi choi (thanh mau, the luc, nhan ten) ve tren lop anh sang
      if (OP.CAM && OP.CAM.apply) {
        OP.CAM.apply(worldCtx);
      }
      if (OP.R && OP.R.renderOverlays) {
        OP.R.renderOverlays(worldCtx);
      }
      if (OP.CAM && OP.CAM.restore) {
        OP.CAM.restore(worldCtx);
      }

      // Render HUD va bang debug F3 (toa do logic VIEW_W x VIEW_H, da setTransform theo pixelScale)
      if (uiCtx) {
        uiCtx.clearRect(0, 0, VIEW_W, VIEW_H);
        if (OP.HUD && OP.HUD.render) {
          OP.HUD.render(uiCtx);
        }
      }
    },

    // He so phong nguyen theo pixel thiet bi (ART-REF F1 hang 3), tach rieng de test duoc
    computeScale: function (winW, winH, dpr) {
      const d = dpr || 1;
      return Math.max(1, Math.floor(Math.min(winW * d / VIEW_W, winH * d / VIEW_H)));
    },

    getPixelScale: function () {
      return pixelScale;
    },

    updateLayout: function () {
      const container = document.getElementById('game-container');
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const k = OP.GAME.computeScale(winW, winH, dpr);
      pixelScale = k;
      currentDpr = dpr;

      // Kich thuoc va vi tri tinh bang pixel thiet bi roi doi ra CSS, de khong lech nua pixel
      const devW = VIEW_W * k;
      const devH = VIEW_H * k;
      const left = Math.floor((winW * dpr - devW) / 2) / dpr;
      const top = Math.floor((winH * dpr - devH) / 2) / dpr;

      container.style.width = (devW / dpr) + 'px';
      container.style.height = (devH / dpr) + 'px';
      container.style.left = Math.max(0, left) + 'px';
      container.style.top = Math.max(0, top) + 'px';
      container.style.setProperty('--ui-scale', String(k / dpr));

      // uiCanvas co do phan giai that, HUD van ve theo toa do logic
      if (uiCanvas && uiCtx) {
        uiCanvas.width = devW;
        uiCanvas.height = devH;
        uiCtx.setTransform(k, 0, 0, k, 0, 0);
        uiCtx.imageSmoothingEnabled = false;
      }
      if (worldCtx) {
        worldCtx.imageSmoothingEnabled = false;
      }
    },

    renderReady: function () {
      if (!uiCanvas || !uiCtx) return;
      uiCtx.clearRect(0, 0, VIEW_W, VIEW_H);
      uiCtx.fillStyle = '#ffffff';
      uiCtx.font = '32px VT323, monospace';
      uiCtx.textAlign = 'center';
      uiCtx.textBaseline = 'middle';
      uiCtx.fillText('OP-BR READY', VIEW_W / 2, VIEW_H / 2);
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
