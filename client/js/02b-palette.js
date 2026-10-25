// client/js/02b-palette.js
// Bang mau co ban 4 tong (Shadow, Mid, Highlight, Accent) theo nhom vat lieu, he mau sat thuong va vien sprite #160e22.
// Phu thuoc: client/js/00-boot.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};

  const PAL = {
    // Mau vien co dinh cho moi sprite thuc the (theo ART-REF muc 7 & CONTEXT muc 12)
    OUTLINE: '#160e22',

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

    // ==========================================
    // NHOM 1. DIA HINH & MOI TRUONG (Moi loai 4 tong: Shadow, Mid, High, Accent)
    // Rang buoc do sang: DEEP (67.77) < SHALLOW (138.99) < GRASS (152.37) < SAND (195.24)
    // ==========================================
    TERRAIN: {
      DEEP: {
        shadow: '#133667',
        mid: '#1a498b',
        high: '#2563b0',
        accent: '#3b82d6',
        name: 'Biển sâu'
      },
      SHALLOW: {
        shadow: '#22789f',
        mid: '#369ec9',
        high: '#5ec3ec',
        accent: '#a2e4ff',
        name: 'Nước nông'
      },
      SAND: {
        shadow: '#b59247',
        mid: '#e2c275',
        high: '#fae49e',
        accent: '#fff6d6',
        name: 'Cát biển'
      },
      GRASS: {
        shadow: '#327c24',
        mid: '#4eb83a',
        high: '#70d654',
        accent: '#bbf797',
        name: 'Đồng cỏ'
      },
      DIRT: {
        shadow: '#543217',
        mid: '#825127',
        high: '#a86e39',
        accent: '#caa074',
        name: 'Đất'
      },
      STONE: {
        shadow: '#4a5568',
        mid: '#6b7a90',
        high: '#94a4ba',
        accent: '#c6d2e2',
        name: 'Đá'
      },
      WALL: {
        shadow: '#272d38',
        mid: '#424d5d',
        high: '#67768c',
        accent: '#98a7bc',
        name: 'Tường đá'
      },
      WOOD: {
        shadow: '#42220e',
        mid: '#733f1b',
        high: '#9e5f2e',
        accent: '#ca874f',
        name: 'Gỗ'
      },
      ICE: {
        shadow: '#6baecf',
        mid: '#96d0ea',
        high: '#c6ecfa',
        accent: '#ffffff',
        name: 'Băng trơn'
      },
      LAVA: {
        shadow: '#68150d',
        mid: '#b32b13',
        high: '#eb4f1f',
        accent: '#ffd642',
        name: 'Dung nham'
      },
      SNOW: {
        shadow: '#a6c5dc',
        mid: '#d2e7f5',
        high: '#edf6fc',
        accent: '#ffffff',
        name: 'Tuyết'
      },
      QUICKSAND: {
        shadow: '#856422',
        mid: '#b38b34',
        high: '#dbae4a',
        accent: '#f5d58c',
        name: 'Cát lún'
      },
      DOCK: {
        shadow: '#381c0b',
        mid: '#663516',
        high: '#8f5024',
        accent: '#be7743',
        name: 'Bến thuyền'
      },
      BRIDGE: {
        shadow: '#4d2810',
        mid: '#80461c',
        high: '#ab652f',
        accent: '#d4965e',
        name: 'Cầu gỗ'
      },
      TREE: {
        shadow: '#1b541e',
        mid: '#298230',
        high: '#44b04d',
        accent: '#74d97d',
        name: 'Tán cây'
      },
      HOUSE_WALL: {
        shadow: '#2e1f18',
        mid: '#523727',
        high: '#75523d',
        accent: '#9e755b',
        name: 'Vách nhà'
      },
      FLOOR: {
        shadow: '#383848',
        mid: '#545468',
        high: '#73738e',
        accent: '#9898b4',
        name: 'Sàn gạch'
      }
    },

    // ==========================================
    // NHOM 2. NHAN VAT & NPC (4 tong)
    // ==========================================
    SKIN: {
      light: { shadow: '#c98a58', mid: '#ffd1a4', high: '#ffebd4', spec: '#ffffff' },
      warm: { shadow: '#d9946c', mid: '#f6c69c', high: '#ffe2ce', spec: '#ffffff' },
      tanned: { shadow: '#9e6238', mid: '#c98a58', high: '#e8b088', spec: '#fff0e4' }
    },
    HAIR: {
      black: { shadow: '#160e22', mid: '#282236', high: '#443b56', spec: '#726788' },
      orange: { shadow: '#8f2e10', mid: '#d85820', high: '#f4853a', spec: '#ffd294' },
      blonde: { shadow: '#946f1a', mid: '#d4a832', high: '#f6cf56', spec: '#fff3a8' },
      white: { shadow: '#707086', mid: '#a4a4be', high: '#d6d6ea', spec: '#ffffff' }
    },
    EYE: {
      black: '#160e22',
      white: '#ffffff',
      shine: '#e0e7ff'
    },

    // ==========================================
    // NHOM 3. VAT THE, RUONG BAU & THUYEN (4 tong)
    // ==========================================
    PROPS: {
      CHEST_WOOD: { shadow: '#3b1c09', mid: '#6e3814', high: '#9e5927', accent: '#f4b842' },
      CHEST_IRON: { shadow: '#242a34', mid: '#475363', high: '#728298', accent: '#cbd5e1' },
      CHEST_GOLD: { shadow: '#805908', mid: '#c28e14', high: '#f2bd2e', accent: '#fffaad' },
      CRATE: { shadow: '#422410', mid: '#76431e', high: '#a3622f', accent: '#d7965f' },
      BARREL: { shadow: '#33373e', mid: '#555b66', high: '#7c8594', accent: '#b8c0cc' },
      LANTERN: { shadow: '#8f3e0d', mid: '#e06b19', high: '#ffaa2b', accent: '#fff3a8' }
    },

    // Alias tuong thich nguoc de code cu van chay muot ma
    SKIN_LIGHT: '#ffd1a4',
    SKIN_MID: '#eab080',
    SKIN_SHADOW: '#c98a58',
    EYE_BLACK: '#160e22',
    EYE_WHITE: '#ffffff',
    WATER_DEEP: '#1a498b',
    WATER_SHALLOW: '#369ec9',
    SAND_LIGHT: '#fae49e',
    SAND_DARK: '#e2c275',
    GRASS_LIGHT: '#70d654',
    GRASS_DARK: '#4eb83a',
    ROCK_LIGHT: '#94a4ba',
    ROCK_DARK: '#6b7a90',
    WOOD_LIGHT: '#9e5f2e',
    WOOD_DARK: '#733f1b',

    // ==========================================
    // TIEN ICH XU LY MAU & DO SANG
    // ==========================================
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

    // Do sang tuong doi (Relative luminance theo chuan W3C WCAG)
    luminance: function (hex) {
      const rgb = PAL.hexToRgb(hex);
      return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
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
