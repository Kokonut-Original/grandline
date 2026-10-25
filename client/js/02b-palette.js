// client/js/02b-palette.js
// Bang mau co ban, he mau theo loai sat thuong va cac tien ich xu ly mau pixel.
// Phu thuoc: client/js/00-boot.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};

  const PAL = {
    // Mau vien mac dinh cho moi thuc the pixel
    OUTLINE: '#111111',

    // Bang mau theo loai sat thuong (khop docs/BIEN-CHUNG.md muc 12)
    DMG: {
      SLASH: '#ffffff',
      BLUNT: '#ffd27a',
      BULLET: '#e0e0e0',
      EXPLOSION: '#ff8a00',
      FIRE: '#ff5a1f',
      ICE: '#8fe3ff',
      LIGHTNING: '#fff35a',
      POISON: '#9be564',
      MAGMA: '#c2185b',
      LIGHT: '#fffbd0',
      SAND: '#e2c275',
      SMOKE: '#b0b0b0',
      SNOW: '#f0faff',
      PURE: '#ff2d55'
    },

    // Mau theo bac do vat / vu khi
    TIER: (S.TIER_COLOR) || {
      C: '#b0b0b0',
      B: '#4caf50',
      A: '#2196f3',
      S: '#9c27b0',
      MYTHIC: '#ff9800'
    },

    // Mau co ban cho nhan vat chibi
    SKIN_LIGHT: '#ffd1a4',
    SKIN_MID: '#eab080',
    SKIN_SHADOW: '#c98a58',
    EYE_BLACK: '#181818',
    EYE_WHITE: '#fdfdfd',

    // Mau moi truong the gioi
    WATER_DEEP: '#1d4ed8',
    WATER_SHALLOW: '#38bdf8',
    SAND_LIGHT: '#fde047',
    SAND_DARK: '#ca8a04',
    GRASS_LIGHT: '#4ade80',
    GRASS_DARK: '#15803d',
    ROCK_LIGHT: '#9ca3af',
    ROCK_DARK: '#4b5563',
    WOOD_LIGHT: '#b45309',
    WOOD_DARK: '#78350f',

    hexToRgb: function (hex) {
      if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0, a: 255 };
      let c = hex.replace('#', '').trim();
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const num = parseInt(c, 16);
      if (isNaN(num)) return { r: 0, g: 0, b: 0, a: 255 };
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: 255
      };
    },

    rgbToHex: function (r, g, b) {
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
      const hexR = clamp(r).toString(16).padStart(2, '0');
      const hexG = clamp(g).toString(16).padStart(2, '0');
      const hexB = clamp(b).toString(16).padStart(2, '0');
      return '#' + hexR + hexG + hexB;
    },

    tintColor: function (hex, factor) {
      const rgb = PAL.hexToRgb(hex);
      return PAL.rgbToHex(
        rgb.r * factor,
        rgb.g * factor,
        rgb.b * factor
      );
    }
  };

  OP.PAL = PAL;
})(typeof window !== 'undefined' ? window : globalThis);
