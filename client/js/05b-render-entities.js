// client/js/05b-render-entities.js
// Render thuc the nguoi choi chibi 16x24, bong do elip chuan ART-REF (rgba(0,0,0,.35)), vat the the gioi va thanh mau.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02c-sprites-chars.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  OP.R = OP.R || {};

  // Ham ve bong elip tieu chuan theo ART-REF muc 8
  function drawShadow(ctx, x, y, rx) {
    const r = Math.round(rx);
    const ry = Math.round(r * 0.45);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), r, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ham ve chu co vien 2 luot (strokeText roi fillText theo ART-REF muc 14)
  function drawOutlinedText(ctx, text, x, y, size, fill, stroke) {
    ctx.font = `${Math.round(size)}px 'VT323', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, Math.round(size / 5));
    ctx.strokeStyle = stroke || '#000000';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, Math.round(x), Math.round(y));
    ctx.fillStyle = fill || '#ffffff';
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

  OP.R.renderEntities = function (ctx) {
    if (!ctx) return;

    const state = OP.GAME && OP.GAME.state;
    if (!state) return;

    // 1. Ve cay coi, nha cua, ruong tren dao neu co map
    if (state.map) {
      drawWorldObjects(ctx, state.map);
    }

    // 2. Ve cac thuc the khac (nguoi choi khac, bot, item, thuyen)
    if (state.ents) {
      for (const ent of state.ents.values()) {
        if (ent.k === 'PLAYER') {
          drawPlayer(ctx, ent, false);
        } else if (ent.k === 'ITEM') {
          drawItem(ctx, ent);
        } else if (ent.k === 'BOAT') {
          drawBoat(ctx, ent);
        }
      }
    }

    // 3. Ve chinh minh (me)
    if (state.me) {
      drawPlayer(ctx, state.me, true);
    }
  };

  function drawWorldObjects(ctx, map) {
    if (!OP.SPR || !OP.SPR.draw) return;
    const cam = OP.CAM;

    // 1. Ve ruong bau (Ve bong truoc, sprite sau)
    if (map.chests) {
      for (let i = 0; i < map.chests.length; i++) {
        const c = map.chests[i];
        if (!cam || cam.isInView(c.x, c.y, 24)) {
          drawShadow(ctx, c.x, c.y + 6, 8);
          OP.SPR.draw(ctx, `chest_${c.tier || 'wood'}`, 0, c.x, c.y);
        }
      }
    }

    // 2. Ve nha cua
    if (map.houses) {
      for (let i = 0; i < map.houses.length; i++) {
        const h = map.houses[i];
        if (!cam || cam.isInView(h.x, h.y, 40)) {
          drawShadow(ctx, h.x, h.y + 8, 14);
          OP.SPR.draw(ctx, h.type || 'house_wood', 0, h.x, h.y);
        }
      }
    }

    // 3. Ve cay coi (Ve bong truoc, sprite sau)
    if (map.trees) {
      for (let i = 0; i < map.trees.length; i++) {
        const tr = map.trees[i];
        if (!cam || cam.isInView(tr.x, tr.y, 32)) {
          drawShadow(ctx, tr.x, tr.y + 2, 11);
          OP.SPR.draw(ctx, tr.type || 'tree_palm', 0, tr.x, tr.y);
        }
      }
    }
  }

  function drawItem(ctx, it) {
    const x = Math.round(it.x);
    const y = Math.round(it.y);
    drawShadow(ctx, x, y + 4, 5);
    if (OP.SPR && OP.SPR.draw && it.icon) {
      OP.SPR.draw(ctx, it.icon, 0, x, y);
    }
  }

  function drawBoat(ctx, b) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    drawShadow(ctx, x, y + 4, 12);
    if (OP.SPR && OP.SPR.draw) {
      OP.SPR.draw(ctx, b.sprite || 'boat_dinghy', 0, x, y);
    }
  }

  function getDirectionAndFlip(aim) {
    let a = (typeof aim === 'number') ? aim : Math.PI / 2;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;

    const absA = Math.abs(a);
    if (absA > (Math.PI * 0.75)) {
      return { dir: 'side', flip: true };
    }
    if (absA < (Math.PI * 0.25)) {
      return { dir: 'side', flip: false };
    }
    if (a >= (Math.PI * 0.25) && a <= (Math.PI * 0.75)) {
      return { dir: 'down', flip: false };
    }
    return { dir: 'up', flip: false };
  }

  function drawPlayer(ctx, p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const colors = p.colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' };

    // 1. Ve bong do duoi chan nhan vat (VE TRUOC THUC THE, r = 7px, ry = 3px theo ART-REF)
    drawShadow(ctx, x, y - 1, 7);

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

    // 4. Ten nguoi choi co dau va vien chu sac net 2 luot
    const displayName = p.name || 'Hải Tặc';
    drawOutlinedText(ctx, displayName, x, y - 30, 14, isMe ? '#4ade80' : '#ffffff', '#160e22');

    // 5. Thanh mau nho
    const hp = p.hp !== undefined ? p.hp : 100;
    const hpMax = p.hm !== undefined ? p.hm : 100;
    const pct = Math.max(0, Math.min(1, hp / hpMax));

    ctx.fillStyle = '#160e22';
    ctx.fillRect(x - 11, y - 24, 22, 4);
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.2 ? '#eab308' : '#ef4444');
    ctx.fillRect(x - 10, y - 23, 20 * pct, 2);
  }

  OP.R.drawShadow = drawShadow;
  OP.R.drawOutlinedText = drawOutlinedText;

})();
