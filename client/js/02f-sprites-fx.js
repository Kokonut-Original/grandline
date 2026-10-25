// client/js/02f-sprites-fx.js
// Sprite cho hat hieu ung, don danh (slash, bullet, explosion, fire) va bieu cam khan gia.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02b-palette.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const SPR = OP.SPR = OP.SPR || {};

  // ==========================================
  // 1. HIEU UNG DON DANH (FX)
  // ==========================================
  // Vet chem hinh trang luoi liem (Slash)
  const SLASH_ROWS = [
    '              ..',
    '           ...WW',
    '        ...WWWW.',
    '      ..WWWWWW. ',
    '    ..WWWWWW..  ',
    '   .WWWWWW..    ',
    '  .WWWWW..      ',
    ' .WWWW..        ',
    '.WWWW.          ',
    '.WWW.           ',
    '.WW.            ',
    '.W.             ',
    '..              ',
    '                ',
    '                ',
    '                '
  ];

  // Dan bay (Bullet)
  const BULLET_ROWS = [
    '                ',
    '                ',
    '                ',
    '                ',
    '                ',
    '                ',
    '      ....      ',
    '     .YYYY.     ',
    '    .YYYYYY.    ',
    '     .YYYY.     ',
    '      ....      ',
    '                ',
    '                ',
    '                ',
    '                ',
    '                '
  ];

  // Vu no (Explosion) 3 frames
  const EXP_0 = [
    '      ....      ',
    '     .FFFF.     ',
    '    .FFFFFF.    ',
    '    .FFFFFF.    ',
    '     .FFFF.     ',
    '      ....      '
  ];
  const EXP_1 = [
    '   ..........   ',
    '  .FFFFFFFFFF.  ',
    ' .FFFFYYYYFFFF. ',
    ' .FFFFYYYYFFFF. ',
    '  .FFFFFFFFFF.  ',
    '   ..........   '
  ];
  const EXP_2 = [
    ' ..   ....   .. ',
    '.FF. .FFFF. .FF.',
    ' .F...FFFF...F. ',
    '  .FFFF..FFFF.  ',
    ' .F...FFFF...F. ',
    '.FF. .FFFF. .FF.',
    ' ..   ....   .. '
  ];

  function registerCombatFx() {
    SPR.define('fx_slash', {
      frames: [SLASH_ROWS],
      palette: { W: '#f8fafc' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('fx_bullet', {
      frames: [BULLET_ROWS],
      palette: { Y: '#facc15' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('fx_explosion', {
      frames: [EXP_0, EXP_1, EXP_2],
      palette: { F: '#ea580c', Y: '#fde047' },
      w: 16,
      h: 8,
      anim: 'walk',
      fps: 10
    });

    SPR.define('fx_fire', {
      frames: [EXP_0, EXP_1],
      palette: { F: '#ef4444', Y: '#fbbf24' },
      w: 16,
      h: 8,
      anim: 'walk',
      fps: 8
    });

    SPR.define('fx_ice', {
      frames: [SLASH_ROWS],
      palette: { W: '#38bdf8' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('fx_spark', {
      frames: [EXP_1, EXP_2],
      palette: { F: '#fde047', Y: '#ffffff' },
      w: 16,
      h: 8,
      anim: 'walk',
      fps: 12
    });
  }

  // ==========================================
  // 2. BIEU CAM KHAN GIA (EMOTES) 16x16
  // ==========================================
  const EMOTE_BG = [
    '   ..........   ',
    '  .YYYYYYYYYY.  ',
    ' .YYYYYYYYYYYY. ',
    '.YYYYYYYYYYYYYY.',
    '.YY..YYYYYY..YY.',
    '.YY..YYYYYY..YY.',
    '.YYYYYYYYYYYYYY.',
    '.YYYYYYYYYYYYYY.',
    '.YY..YYYYYY..YY.',
    '.YY..........YY.',
    ' .YY........YY. ',
    '  .YYYYYYYYYY.  ',
    '   ...YYYY...   ',
    '      .YY.      ',
    '       ..       ',
    '                '
  ];

  function registerEmotes() {
    SPR.define('emote_laugh', {
      frames: [EMOTE_BG],
      palette: { Y: '#fde047', '.': '#111111' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('emote_shock', {
      frames: [EMOTE_BG],
      palette: { Y: '#93c5fd', '.': '#111111' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('emote_cry', {
      frames: [EMOTE_BG],
      palette: { Y: '#60a5fa', '.': '#111111' },
      w: 16,
      h: 16,
      anim: 'static'
    });

    SPR.define('emote_clap', {
      frames: [EMOTE_BG],
      palette: { Y: '#4ade80', '.': '#111111' },
      w: 16,
      h: 16,
      anim: 'static'
    });
  }

  registerCombatFx();
  registerEmotes();

})(typeof window !== 'undefined' ? window : globalThis);
