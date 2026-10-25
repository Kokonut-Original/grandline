// client/js/05b-render-entities.js
// Render thuc the nguoi choi chibi 16x24, huong ngam, bong do va thanh mau len worldCanvas.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02c-sprites-chars.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.R = OP.R || {};

  OP.R.renderEntities = function (ctx) {
    if (!ctx) return;

    const state = OP.GAME && OP.GAME.state;
    if (!state) return;

    const me = state.me;

    // 1. Ve cac thuc the khac
    if (state.ents) {
      for (const ent of state.ents.values()) {
        if (ent.k === 'PLAYER') {
          drawPlayer(ctx, ent, false);
        }
      }
    }

    // 2. Ve chinh minh (me)
    if (me) {
      drawPlayer(ctx, me, true);
    }
  };

  function getDirectionAndFlip(aim) {
    let a = (typeof aim === 'number') ? aim : Math.PI / 2;
    // Chuan hoa goc ve [-PI, PI]
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;

    const absA = Math.abs(a);

    // Huong ngang sang trai
    if (absA > (Math.PI * 0.75)) {
      return { dir: 'side', flip: true };
    }
    // Huong ngang sang phai
    if (absA < (Math.PI * 0.25)) {
      return { dir: 'side', flip: false };
    }
    // Huong xuong (duoi)
    if (a >= (Math.PI * 0.25) && a <= (Math.PI * 0.75)) {
      return { dir: 'down', flip: false };
    }
    // Huong len (tren)
    return { dir: 'up', flip: false };
  }

  function drawPlayer(ctx, p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const colors = p.colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' };

    // 1. Ve bong do duoi chan nhan vat
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Lay hoac khoi tao sprite nguoi choi
    let baseId = null;
    if (OP.SPR && OP.SPR.player) {
      baseId = OP.SPR.player(colors);
    }

    const dirInfo = getDirectionAndFlip(p.aim);
    const isMoving = Math.hypot(p.vx || 0, p.vy || 0) > 1.0;

    if (baseId && OP.SPR && OP.SPR.draw) {
      const animType = isMoving ? 'walk' : 'idle';
      const spriteId = `${baseId}_${dirInfo.dir}_${animType}`;
      const frameIndex = isMoving ? Math.floor(Date.now() / 150) % 3 : 0;

      OP.SPR.draw(ctx, spriteId, frameIndex, x, y, {
        flip: dirInfo.flip
      });
    } else {
      // Fallback ve khoi pixel neu sprite chua san sang
      ctx.fillStyle = colors.shirt || '#337ab7';
      ctx.fillRect(x - 6, y - 18, 12, 16);
    }

    // 3. Tia huong ngam
    if (typeof p.aim === 'number') {
      const aimLen = 16;
      const targetX = x + Math.cos(p.aim) * aimLen;
      const targetY = (y - 12) + Math.sin(p.aim) * aimLen;

      ctx.strokeStyle = isMe ? '#4ade80' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    }

    // 4. Ten nguoi choi
    ctx.fillStyle = isMe ? '#4ade80' : '#ffffff';
    ctx.font = '12px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.name || 'Hai tac', x, y - 28);

    // 5. Thanh mau nho
    const hp = p.hp !== undefined ? p.hp : 100;
    const hpMax = p.hm !== undefined ? p.hm : 100;
    const pct = Math.max(0, Math.min(1, hp / hpMax));

    ctx.fillStyle = '#111111';
    ctx.fillRect(x - 10, y - 26, 20, 3);
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.2 ? '#eab308' : '#ef4444');
    ctx.fillRect(x - 10, y - 26, 20 * pct, 3);
  }
})();
