// client/js/04-camera.js
// Dieu khien camera di chuyen theo nguoi choi, gioi han bien ban do va chuyen doi toa do world/screen.
// Phu thuoc: client/js/00-boot.js, shared/01-constants.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};
  const CONST = S.CONST || {
    TILE: 16,
    MAP_TILES: 320,
    VIEW_W: 480,
    VIEW_H: 270
  };

  const VISION_SCALE = 1.5;

  const CAM = {
    x: (CONST.MAP_TILES * CONST.TILE) / 2,
    y: (CONST.MAP_TILES * CONST.TILE) / 2,
    targetX: (CONST.MAP_TILES * CONST.TILE) / 2,
    targetY: (CONST.MAP_TILES * CONST.TILE) / 2,
    visionScale: VISION_SCALE,
    w: Math.round((CONST.VIEW_W || 480) * VISION_SCALE),
    h: Math.round((CONST.VIEW_H || 270) * VISION_SCALE),

    follow: function (tx, ty, smooth) {
      if (typeof tx === 'number') this.targetX = tx;
      if (typeof ty === 'number') this.targetY = ty;

      const factor = (typeof smooth === 'number') ? smooth : 1.0;

      if (factor >= 1.0) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        this.x += (this.targetX - this.x) * factor;
        this.y += (this.targetY - this.y) * factor;
      }

      // Gioi han trong pham vi ban do
      const mapW = CONST.MAP_TILES * CONST.TILE;
      const mapH = CONST.MAP_TILES * CONST.TILE;

      const halfW = this.w / 2;
      const halfH = this.h / 2;

      if (mapW > this.w) {
        this.x = Math.max(halfW, Math.min(mapW - halfW, this.x));
      }
      if (mapH > this.h) {
        this.y = Math.max(halfH, Math.min(mapH - halfH, this.y));
      }
    },

    worldToScreen: function (wx, wy) {
      const sx = (wx - this.x) / this.visionScale + 240;
      const sy = (wy - this.y) / this.visionScale + 135;
      return { x: sx, y: sy };
    },

    screenToWorld: function (sx, sy) {
      const wx = (sx - 240) * this.visionScale + this.x;
      const wy = (sy - 135) * this.visionScale + this.y;
      return { x: wx, y: wy };
    },

    apply: function (ctx) {
      if (!ctx) return;
      ctx.save();
      // Dua tam ve chinh giua viewport logic 480x270 va phong to tam nhin 1.5x
      ctx.translate(240, 135);
      ctx.scale(1 / this.visionScale, 1 / this.visionScale);
      ctx.translate(-Math.round(this.x), -Math.round(this.y));
    },

    restore: function (ctx) {
      if (!ctx) return;
      ctx.restore();
    },

    isInView: function (wx, wy, radius) {
      const r = radius || 16;
      const left = this.x - this.w / 2;
      const right = this.x + this.w / 2;
      const top = this.y - this.h / 2;
      const bottom = this.y + this.h / 2;

      return (
        wx + r >= left &&
        wx - r <= right &&
        wy + r >= top &&
        wy - r <= bottom
      );
    }
  };

  OP.CAM = CAM;

})(typeof window !== 'undefined' ? window : globalThis);
