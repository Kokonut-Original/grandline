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

  // Camera thay dung VIEW_W x VIEW_H pixel the gioi (1 pixel the gioi = 1 pixel worldCanvas).
  // Phong to len man hinh do 10-main.js lam theo so nguyen, khong scale trong canvas.
  const CAM = {
    x: (CONST.MAP_TILES * CONST.TILE) / 2,
    y: (CONST.MAP_TILES * CONST.TILE) / 2,
    targetX: (CONST.MAP_TILES * CONST.TILE) / 2,
    targetY: (CONST.MAP_TILES * CONST.TILE) / 2,
    w: CONST.VIEW_W || 480,
    h: CONST.VIEW_H || 270,

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

    // Goc tren trai cua khung nhin. Lam tron TAM camera (giong cach 05b lam tron vi tri nhan vat)
    // de nhan vat camera dang bam luon dung yen o giua man hinh, khong rung 1px.
    offsetX: function () {
      return Math.floor(this.w / 2) - Math.round(this.x);
    },

    offsetY: function () {
      return Math.floor(this.h / 2) - Math.round(this.y);
    },

    worldToScreen: function (wx, wy) {
      return { x: wx + this.offsetX(), y: wy + this.offsetY() };
    },

    screenToWorld: function (sx, sy) {
      return { x: sx - this.offsetX(), y: sy - this.offsetY() };
    },

    apply: function (ctx) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(this.offsetX(), this.offsetY());
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
