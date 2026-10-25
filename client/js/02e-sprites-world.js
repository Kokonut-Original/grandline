// client/js/02e-sprites-world.js
// Sprite cho tile ban do, cay coi, nha cua, ruong bau, ben thuyen, thuyen chien va chien ham.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02b-palette.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const SPR = OP.SPR = OP.SPR || {};
  const PAL = OP.PAL || {};

  // ==========================================
  // 1. TILE BAN DO PIXEL 16x16
  // ==========================================
  const TILE_PATTERNS = {
    // Nuoc sau / Nuoc nong (gon song nhe)
    water: [
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~..~~~~~~~~~~~~',
      '~~~~..~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~..~~~~',
      '~~~~~~~~~~~~..~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~..~~~~~~~~~~~~',
      '~~~~..~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~..~~~~',
      '~~~~~~~~~~~~..~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~'
    ],
    // Dat, cat, co, tuyet, bang (hat pixel ket cau)
    ground: [
      '................',
      '..xx........xx..',
      '.xxxx......xxxx.',
      '..xx........xx..',
      '................',
      '......xx........',
      '.....xxxx.......',
      '......xx........',
      '................',
      '..xx........xx..',
      '.xxxx......xxxx.',
      '..xx........xx..',
      '................',
      '......xx........',
      '.....xxxx.......',
      '................'
    ],
    // Go, cau, ben thuyen (cac van van go song song)
    wood: [
      '================',
      '=..===..===..==.',
      '================',
      '=..===..===..==.',
      '----------------',
      '================',
      '=..===..===..==.',
      '================',
      '----------------',
      '================',
      '=..===..===..==.',
      '================',
      '----------------',
      '================',
      '=..===..===..==.',
      '================'
    ],
    // Tuong thanh kien co
    wall: [
      '################',
      '#...##...##...##',
      '################',
      '##...##...##...#',
      '################',
      '#...##...##...##',
      '################',
      '##...##...##...#',
      '################',
      '#...##...##...##',
      '################',
      '##...##...##...#',
      '################',
      '#...##...##...##',
      '################',
      '################'
    ]
  };

  const TILE_PALETTES = {
    deep: { '~': '#1d4ed8', '.': '#1e40af' },
    shallow: { '~': '#38bdf8', '.': '#0284c7' },
    sand: { '.': '#fde047', 'x': '#eab308' },
    grass: { '.': '#22c55e', 'x': '#16a34a' },
    rock: { '.': '#94a3b8', 'x': '#64748b' },
    dirt: { '.': '#a16207', 'x': '#78350f' },
    ice: { '.': '#bae6fd', 'x': '#7dd3fc' },
    snow: { '.': '#f8fafc', 'x': '#e2e8f0' },
    lava: { '.': '#dc2626', 'x': '#ea580c' },
    wood: { '=': '#b45309', '.': '#78350f', '-': '#451a03' },
    bridge: { '=': '#d97706', '.': '#92400e', '-': '#78350f' },
    dock: { '=': '#92400e', '.': '#78350f', '-': '#451a03' },
    wall: { '#': '#475569', '.': '#1e293b' }
  };

  function registerTiles() {
    for (const key in TILE_PALETTES) {
      let pattern = TILE_PATTERNS.ground;
      if (key === 'deep' || key === 'shallow') pattern = TILE_PATTERNS.water;
      else if (key === 'wood' || key === 'bridge' || key === 'dock') pattern = TILE_PATTERNS.wood;
      else if (key === 'wall') pattern = TILE_PATTERNS.wall;

      SPR.define(`tile_${key}`, {
        frames: [pattern],
        palette: TILE_PALETTES[key],
        w: 16,
        h: 16,
        options: { noOutline: true },
        anim: 'static'
      });
    }
  }

  // ==========================================
  // 2. RUONG BAU PIXEL 16x16
  // ==========================================
  const CHEST_ROWS = [
    '                ',
    '   ..........   ',
    '  .WWWWWWWWWW.  ',
    ' .WWWWWWWWWWWW. ',
    ' .WWMMMMMMMMWW. ',
    '.WWMMMMMMMMMMWW.',
    '.WWMMMMMMMMMMWW.',
    '................',
    '.WWMMMMMMMMMMWW.',
    '.WWMMMMGGMMMMWW.',
    '.WWMMMMGGMMMMWW.',
    '.WWMMMMMMMMMMWW.',
    '.WWMMMMMMMMMMWW.',
    ' .WWWWWWWWWWWW. ',
    '  ............  ',
    '                '
  ];

  function registerChests() {
    const types = {
      wood: { W: '#78350f', M: '#b45309', G: '#f59e0b' },
      iron: { W: '#334155', M: '#64748b', G: '#cbd5e1' },
      gold: { W: '#b45309', M: '#eab308', G: '#fef08a' }
    };
    for (const t in types) {
      SPR.define(`chest_${t}`, {
        frames: [CHEST_ROWS],
        palette: types[t],
        w: 16,
        h: 16,
        anim: 'static'
      });
    }
  }

  // ==========================================
  // 3. CAY COI (24x32)
  // ==========================================
  const TREE_PALM_ROWS = [
    '       ......       ',
    '    ...GGGGGG...    ',
    '  ..GGGGGGGGGGGG..  ',
    ' .GGGGGGGGGGGGGGGG. ',
    '.GGGG..GGGGGG..GGGG.',
    '.GGG.  .GGGG.  .GGG.',
    ' ..     .GG.     .. ',
    '        .TT.        ',
    '        .TT.        ',
    '        .tt.        ',
    '        .TT.        ',
    '       .TT.         ',
    '       .TT.         ',
    '       .tt.         ',
    '       .TT.         ',
    '      .TT.          ',
    '      .TT.          ',
    '      .tt.          ',
    '      .TT.          ',
    '     .TT.           ',
    '     .TT.           ',
    '    ..TT..          ',
    '   .TTTTTT.         ',
    '    ......          '
  ];

  function registerTrees() {
    SPR.define('tree_palm', {
      frames: [TREE_PALM_ROWS],
      palette: { G: '#22c55e', T: '#b45309', t: '#78350f' },
      w: 20,
      h: 24,
      originX: 10,
      originY: 22,
      anim: 'static'
    });

    SPR.define('tree_pine', {
      frames: [TREE_PALM_ROWS],
      palette: { G: '#047857', T: '#78350f', t: '#451a03' },
      w: 20,
      h: 24,
      originX: 10,
      originY: 22,
      anim: 'static'
    });

    SPR.define('tree_jungle', {
      frames: [TREE_PALM_ROWS],
      palette: { G: '#15803d', T: '#854d0e', t: '#543007' },
      w: 20,
      h: 24,
      originX: 10,
      originY: 22,
      anim: 'static'
    });
  }

  // ==========================================
  // 4. NHA CUA (32x32)
  // ==========================================
  const HOUSE_ROWS = [
    '            ....            ',
    '          ..RRRR..          ',
    '        ..RRRRRRRR..        ',
    '      ..RRRRRRRRRRRR..      ',
    '    ..RRRRRRRRRRRRRRRR..    ',
    '  ..RRRRRRRRRRRRRRRRRRRR..  ',
    '..RRRRRRRRRRRRRRRRRRRRRRRR..',
    '............................',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WW..WWWWWWWWWWWWWW..WWWW. ',
    ' .WW..WWWWWWWWWWWWWW..WWWW. ',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .......................... '
  ];

  function registerHouses() {
    SPR.define('house_small', {
      frames: [HOUSE_ROWS],
      palette: { R: '#dc2626', W: '#e2e8f0', D: '#78350f', '.': '#111111' },
      w: 28,
      h: 21,
      originX: 14,
      originY: 20,
      anim: 'static'
    });

    SPR.define('house_wood', {
      frames: [HOUSE_ROWS],
      palette: { R: '#b45309', W: '#d97706', D: '#451a03', '.': '#111111' },
      w: 28,
      h: 21,
      originX: 14,
      originY: 20,
      anim: 'static'
    });

    SPR.define('house_stone', {
      frames: [HOUSE_ROWS],
      palette: { R: '#475569', W: '#94a3b8', D: '#1e293b', '.': '#111111' },
      w: 28,
      h: 21,
      originX: 14,
      originY: 20,
      anim: 'static'
    });
  }

  // ==========================================
  // 5. THUYEN BE & CHIEN HAM (16x24 den 32x48)
  // ==========================================
  const BOAT_DINGHY_ROWS = [
    '     ......     ',
    '    .WWWWWW.    ',
    '   .WWwwwwWW.   ',
    '  .WWwwwwwwWW.  ',
    ' .WWwwwwwwwwWW. ',
    ' .WWwwwwwwwwWW. ',
    ' .WWwwWWWWwwWW. ',
    ' .WWwwWWWWwwWW. ',
    ' .WWwwwwwwwwWW. ',
    ' .WWwwwwwwwwWW. ',
    ' .WWwwwwwwwwWW. ',
    ' .WWwwwwwwwwWW. ',
    '  .WWwwwwwwWW.  ',
    '   .WWWWWWWW.   ',
    '    ........    ',
    '                '
  ];

  const WARSHIP_ROWS = [
    '          ......          ',
    '        ..WWWWWW..        ',
    '       .WWWWWWWWWW.       ',
    '      .WWWWwwwwWWWW.      ',
    '     .WWWWwwwwwwWWWW.     ',
    '    .WWWWwwwwwwwwWWWW.    ',
    '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ',
    '    .WWWWwwwwwwwwWWWW.    ',
    '     .WWWWwwwwwwWWWW.     ',
    '      .WWWWWWWWWWWW.      ',
    '        ..........        '
  ];

  function registerBoats() {
    SPR.define('boat_dinghy', {
      frames: [BOAT_DINGHY_ROWS],
      palette: { W: '#b45309', w: '#78350f' },
      w: 16,
      h: 16,
      originX: 8,
      originY: 8,
      anim: 'static'
    });

    SPR.define('boat_waver', {
      frames: [BOAT_DINGHY_ROWS],
      palette: { W: '#0284c7', w: '#0369a1' },
      w: 16,
      h: 16,
      originX: 8,
      originY: 8,
      anim: 'static'
    });

    SPR.define('boat_sloop', {
      frames: [BOAT_DINGHY_ROWS],
      palette: { W: '#e2e8f0', w: '#b45309' },
      w: 16,
      h: 16,
      originX: 8,
      originY: 8,
      anim: 'static'
    });

    SPR.define('boat_warship', {
      frames: [WARSHIP_ROWS],
      palette: { W: '#334155', w: '#64748b', C: '#1e293b' },
      w: 26,
      h: 19,
      originX: 13,
      originY: 9,
      anim: 'static'
    });

    // Chien ham dai bac lon luc xuat phat (warship_launch)
    SPR.define('warship_launch', {
      frames: [WARSHIP_ROWS],
      palette: { W: '#1e293b', w: '#475569', C: '#dc2626' },
      w: 26,
      h: 19,
      originX: 13,
      originY: 9,
      anim: 'static'
    });
  }

  registerTiles();
  registerChests();
  registerTrees();
  registerHouses();
  registerBoats();

})(typeof window !== 'undefined' ? window : globalThis);
