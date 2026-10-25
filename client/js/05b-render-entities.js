// client/js/05b-render-entities.js
// Render thuc the nguoi choi, huong ngam va thanh mau len worldCanvas.
// Phu thuoc: client/js/00-boot.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.R = OP.R || {};

  OP.R.renderEntities = function (ctx) {
    if (!ctx) return;

    const state = OP.GAME && OP.GAME.state;
    if (!state) return;

    const me = state.me;

    // 1. Ve nen phang tam de de quan sat di chuyen
    ctx.fillStyle = '#101a2e';
    ctx.fillRect(0, 0, 480, 270);

    // Luoi pixel 16x16
    ctx.strokeStyle = '#182642';
    ctx.lineWidth = 1;
    for (let x = 0; x < 480; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 270);
      ctx.stroke();
    }
    for (let y = 0; y < 270; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }

    // 2. Ve cac thuc the khac
    if (state.ents) {
      for (const ent of state.ents.values()) {
        if (ent.k === 'PLAYER') {
          drawPlayer(ctx, ent, false);
        }
      }
    }

    // 3. Ve chinh minh (me)
    if (me) {
      drawPlayer(ctx, me, true);
    }
  };

  function drawPlayer(ctx, p, isMe) {
    const x = p.x;
    const y = p.y;
    const colors = p.colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' };

    // Than chibi (hinh chu nhat pixel 12x16)
    ctx.fillStyle = colors.shirt || '#337ab7';
    ctx.fillRect(x - 6, y - 6, 12, 14);

    // Dau / Toc
    ctx.fillStyle = colors.hair || '#292b2c';
    ctx.fillRect(x - 5, y - 14, 10, 8);

    // Non
    ctx.fillStyle = colors.hat || '#d9534f';
    ctx.fillRect(x - 7, y - 16, 14, 4);

    // Tia huong ngam
    if (typeof p.aim === 'number') {
      const aimLen = 14;
      const targetX = x + Math.cos(p.aim) * aimLen;
      const targetY = y + Math.sin(p.aim) * aimLen;

      ctx.strokeStyle = isMe ? '#5ac54f' : '#ff5a1f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 2);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    }

    // Ten nguoi choi
    ctx.fillStyle = isMe ? '#5ac54f' : '#ffffff';
    ctx.font = '12px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.name || 'Hai tac', x, y - 18);

    // Thanh mau nho
    const hp = p.hp !== undefined ? p.hp : 100;
    const hpMax = p.hm !== undefined ? p.hm : 100;
    const pct = Math.max(0, Math.min(1, hp / hpMax));

    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 10, y - 17, 20, 3);
    ctx.fillStyle = pct > 0.5 ? '#2ea043' : (pct > 0.2 ? '#f4c430' : '#da3633');
    ctx.fillRect(x - 10, y - 17, 20 * pct, 3);
  }
})();
