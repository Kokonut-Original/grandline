// client/js/06-render-hud.js
// Render giao dien HUD tren uiCanvas, bang thong so debug F3 (FPS, Ping, Tick, so entity).
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.HUD = OP.HUD || {};

  let showDebug = false;
  let fps = 0;
  let frameCount = 0;
  let lastFpsTime = performance.now();

  // Lang nghe phim F3
  window.addEventListener('keydown', function (e) {
    if (e.code === 'F3') {
      showDebug = !showDebug;
      e.preventDefault();
    }
  });

  OP.HUD.updateFps = function () {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      frameCount = 0;
      lastFpsTime = now;
    }
  };

  OP.HUD.render = function (ctx) {
    if (!ctx) return;

    OP.HUD.updateFps();

    // Ve bang debug F3 neu duoc bat hoac co ?debug=1
    if (showDebug || OP.debug) {
      drawDebugOverlay(ctx);
    }
  };

  function drawDebugOverlay(ctx) {
    const state = OP.GAME && OP.GAME.state;
    const me = state && state.me;
    const ping = (OP.NET && OP.NET.getPing) ? OP.NET.getPing() : 0;
    const tick = state ? state.lastTick : 0;
    const entCount = 1 + (state && state.ents ? state.ents.size : 0);

    const x = 6;
    let y = 14;

    ctx.save();
    // Nen mo cho bang debug
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(4, 4, 130, 68);

    ctx.font = '12px VT323, monospace';
    ctx.textAlign = 'left';

    // FPS
    ctx.fillStyle = fps >= 55 ? '#5ac54f' : (fps >= 30 ? '#f4c430' : '#da3633');
    ctx.fillText(`FPS:  ${fps}`, x, y);
    y += 12;

    // Ping
    ctx.fillStyle = ping <= 50 ? '#5ac54f' : (ping <= 100 ? '#f4c430' : '#da3633');
    ctx.fillText(`PING: ${ping} ms`, x, y);
    y += 12;

    // Server Tick
    ctx.fillStyle = '#3e8edf';
    ctx.fillText(`TICK: ${tick}`, x, y);
    y += 12;

    // Entity count
    ctx.fillStyle = '#e6edf3';
    ctx.fillText(`ENTS: ${entCount}`, x, y);
    y += 12;

    // Position (x, y)
    if (me) {
      ctx.fillStyle = '#cfcfcf';
      ctx.fillText(`POS:  ${Math.round(me.x)}, ${Math.round(me.y)}`, x, y);
    }

    ctx.restore();
  }
})();
