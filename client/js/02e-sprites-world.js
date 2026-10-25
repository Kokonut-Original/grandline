// client/js/02e-sprites-world.js
// Sprite cho tile ban do 17 loai (moi loai 3 bien the), cay coi, nha cua, ruong bau, ben thuyen, thuyen chien.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02b-palette.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const SPR = OP.SPR = OP.SPR || {};
  const PAL = OP.PAL || {};

  // ==========================================
  // 1. TILE BAN DO PIXEL 16x16 (17 LOAI, MOI LOAI 3 BIEN THE)
  // Chuẩn ánh sáng: trên/trái sáng (H), dưới/phải tối (S), điểm nhấn (A), nền (M).
  // ==========================================

  const PATTERNS_WATER = [
    // v0: Song gon em nhe
    [
      'MMMMMMMMMMMMMMMM', 'MMHHMMMMMMMMMMMM',
      'MHHHHMMMMMSSMMMM', 'MMMMMMMMMMSSSSMM',
      'MMMMMMMMMMMMMMMM', 'MMMMMMHHMMMMMMMM',
      'MMMMHHHHMMMMMSSM', 'MMMMMMMMMMMMSSSS',
      'MMMMMMMMMMMMMMMM', 'MMHHMMMMMMMMMMMM',
      'MHHHHMMMMMSSMMMM', 'MMMMMMMMMMSSSSMM',
      'MMMMMMMMMMMMMMMM', 'MMMMMMHHMMMMMMMM',
      'MMMMHHHHMMMMMSSM', 'MMMMMMMMMMMMSSSS'
    ],
    // v1: Bot song trang noi bat
    [
      'MMMMMMMMMMMMMMMM', 'MMAAHHMMMMMMMMMM',
      'MAAAAAHMMMMMSSMM', 'MMAAHHMMMMSSSSMM',
      'MMMMMMMMMMMMMMMM', 'MMMMMMMAAHHMMMMM',
      'MMMMMMAAAAAHMMSS', 'MMMMMMMAAHHMMSSS',
      'MMMMMMMMMMMMMMMM', 'MMAAHHMMMMMMMMMM',
      'MAAAAAHMMMMMSSMM', 'MMAAHHMMMMSSSSMM',
      'MMMMMMMMMMMMMMMM', 'MMMMMMMAAHHMMMMM',
      'MMMMMMAAAAAHMMSS', 'MMMMMMMAAHHMMSSS'
    ],
    // v2: Xoay nuoc / ranh song sau
    [
      'MMMMMMMMMMMMMMMM', 'MMHHMMMMMMSSSSMM',
      'MHHHHMMMMSSSSSSM', 'MMMMMMMMMSSSSSSM',
      'MMMMMMMMMMSSSSMM', 'MMMMMMHHMMMMMMMM',
      'MMMMHHHHMMSSSSMM', 'MMMMMMMMSSSSSSMM',
      'MMMMMMMMMMSSSSMM', 'MMHHMMMMMMSSSSMM',
      'MHHHHMMMMSSSSSSM', 'MMMMMMMMMSSSSSSM',
      'MMMMMMMMMMSSSSMM', 'MMMMMMHHMMMMMMMM',
      'MMMMHHHHMMSSSSMM', 'MMMMMMMMSSSSSSMM'
    ]
  ];

  const P_G0 = new Array(16).fill('MMMMMMMMMMMMMMMM');
  const P_G1 = P_G0.slice(); P_G1[6] = 'MMMMMMMMAAMMMMMM'; P_G1[7] = 'MMMMMMMMAAMMMMMM';
  const P_G2 = P_G0.slice(); P_G2[6] = 'MMMMMMHHMMMMMMMM'; P_G2[7] = 'MMMMMMSHMMMMMMMM';
  const PATTERNS_GRASS = [P_G0, P_G1, P_G2];

  const PATTERNS_GROUND = [
    // v0: Nen tron co mep sang tren/trai, mep toi duoi/phai
    [
      'HHHHHHHHHHHHHHHS', 'HMMMMMMMMMMMMMMS',
      'HMMMMMMMMMMMMMMS', 'HMMMMMSSMMMMMMMS',
      'HMMMMSSMMMMMMMMS', 'HMMMMMMMMMMMMMMS',
      'HMMMSSMMMMMMMMMS', 'HMMMMSSMMMMMMMMS',
      'HMMMMMMMMMMMMMMS', 'HMMMMMMMMHHMMMSS',
      'HMMMMMMMHHHHMMMS', 'HMMMMMMMMHHMMMSS',
      'HMMMMMMMMMMMMMMS', 'HMMMSSMMMMMMMMMS',
      'HMMMMSSMMMMMMMMS', 'SSSSSSSSSSSSSSSS'
    ],
    // v1: Dom sang, hoa nho, soi cuoi
    [
      'HHHHHHHHHHHHHHHS', 'HMMMMMMMMMMMMMMS',
      'HMMAAMMMMMMMMMMS', 'HMAAAAMMMMSSMMMS',
      'HMMAAMMMMSSSMMMS', 'HMMMMMMMMMMMMMMS',
      'HMMMSSMMMMMMMMMS', 'HMMSSSSMMMAAMMSS',
      'HMMMSSMMMAAAAMMS', 'HMMMMMMMMMAAMMSS',
      'HMMMMMMMHHHHMMMS', 'HMMMMMMMMHHMMMSS',
      'HMMMMMMMMMMMMMMS', 'HMMAAMMMMMMMMMMS',
      'HMAAAAMMMMSSMMMS', 'SSSSSSSSSSSSSSSS'
    ],
    // v2: Vet nut, soi ran, nếp gấp tối
    [
      'HHHHHHHHHHHHHHHS', 'HMMMMMMMMMMMMMMS',
      'HMMMMMMMMMMMMMMS', 'HMMMMMSSMMMMMMMS',
      'HMMMMSSAMMMMMMMS', 'HMMMMMSAMMMMMMMS',
      'HMMMSSSAAMMMMMMS', 'HMMMMSSSSAAMMMMS',
      'HMMMMMMMSSAMMMMS', 'HMMMMMMMMSSAMMSS',
      'HMMMMMMMHHHHMMMS', 'HMMMMMMMMHHMMMSS',
      'HMMMMMMMMMMMMMMS', 'HMMMSSMMMMMMMMMS',
      'HMMMMSSMMMMMMMMS', 'SSSSSSSSSSSSSSSS'
    ]
  ];

  const PATTERNS_WOOD = [
    // v0: Cac van go song song
    [
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMSSMMMMMMSSMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMMMMMSSMMMMMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMSSMMMMMMSSMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMMMMMSSMMMMMMM', 'SSSSSSSSSSSSSSSS'
    ],
    // v1: Mat van co chot dinh va gờ phản quang
    [
      'HHHHHHHHHHHHHHHH', 'HAAHMMMMMMMMMAAH',
      'HAAHSSMMMMMMSAAH', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMMMMMSSMMMMMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HAAHMMMMMMMMMAAH',
      'HAAHSSMMMMMMSAAH', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMMMMMSSMMMMMMM', 'SSSSSSSSSSSSSSSS'
    ],
    // v2: Van go co vet ran / khuyet ranh
    [
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMSSMMMSSSSMMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMSSAMMMMMMM',
      'HMMMMMMSSAMMMMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMMMMMMMMM',
      'HMMSSMMMMMMSSMMM', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMSSMMMMMMM',
      'HMMMMMMSSAMMMMMM', 'SSSSSSSSSSSSSSSS'
    ]
  ];

  const PATTERNS_BRICK = [
    // v0: Gach xep so le tieu chuan
    [
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMSHMMMMMS',
      'HMMMMMMMSHMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSHMMMMMMMMMS',
      'HMMMSHMMMMMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMSHMMMMMS',
      'HMMMMMMMSHMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSHMMMMMMMMMS',
      'HMMMSHMMMMMMMMMS', 'SSSSSSSSSSSSSSSS'
    ],
    // v1: Gach co dom soi sang
    [
      'HHHHHHHHHHHHHHHH', 'HMAAMMMMSHMMMMMS',
      'HMAAMMMMSHMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSHMMAAMMMMMS',
      'HMMMSHMMAAMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMSHMAAMMS',
      'HMMMMMMMSHMAAMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMAASHMMMMMMMMMS',
      'HMAASHMMMMMMMMMS', 'SSSSSSSSSSSSSSSS'
    ],
    // v2: Gach co vet nut goc
    [
      'HHHHHHHHHHHHHHHH', 'HMMMMMMMSHMMMMMS',
      'HMMMSSASSHMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSHMMMMMMMMMS',
      'HMMMSHMMMSSAAMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSSASHHMMMMMS',
      'HMMMMMMMSHMMMMMS', 'SSSSSSSSSSSSSSSS',
      'HHHHHHHHHHHHHHHH', 'HMMMSHMMMMMMMMMS',
      'HMMMSHMMMMMMMMMS', 'SSSSSSSSSSSSSSSS'
    ]
  ];

  const TILE_DEFINITIONS = [
    { id: 0, name: 'deep', pal: 'DEEP', style: 'water' },
    { id: 1, name: 'shallow', pal: 'SHALLOW', style: 'water' },
    { id: 2, name: 'sand', pal: 'SAND', style: 'ground' },
    { id: 3, name: 'grass', pal: 'GRASS', style: 'ground' },
    { id: 4, name: 'dirt', pal: 'DIRT', style: 'ground' },
    { id: 5, name: 'stone', pal: 'STONE', style: 'ground' },
    { id: 6, name: 'wall', pal: 'WALL', style: 'brick' },
    { id: 7, name: 'wood', pal: 'WOOD', style: 'wood' },
    { id: 8, name: 'ice', pal: 'ICE', style: 'ground' },
    { id: 9, name: 'lava', pal: 'LAVA', style: 'ground' },
    { id: 10, name: 'snow', pal: 'SNOW', style: 'ground' },
    { id: 11, name: 'quicksand', pal: 'QUICKSAND', style: 'ground' },
    { id: 12, name: 'dock', pal: 'DOCK', style: 'wood' },
    { id: 13, name: 'bridge', pal: 'BRIDGE', style: 'wood' },
    { id: 14, name: 'tree', pal: 'TREE', style: 'ground' },
    { id: 15, name: 'house_wall', pal: 'HOUSE_WALL', style: 'brick' },
    { id: 16, name: 'floor', pal: 'FLOOR', style: 'brick' }
  ];

  function registerTiles() {
    const terrain = (PAL.TERRAIN) || {};

    for (let t = 0; t < TILE_DEFINITIONS.length; t++) {
      const def = TILE_DEFINITIONS[t];
      const ter = terrain[def.pal] || {
        shadow: '#222222',
        mid: '#666666',
        high: '#aaaaaa',
        accent: '#ffffff'
      };

      const palObj = {
        H: ter.high,
        M: ter.mid,
        S: ter.shadow,
        A: ter.accent,
        '.': null
      };

      let patterns = PATTERNS_GROUND;
      if (def.pal === 'GRASS') patterns = PATTERNS_GRASS;
      else if (def.style === 'water') patterns = PATTERNS_WATER;
      else if (def.style === 'wood') patterns = PATTERNS_WOOD;
      else if (def.style === 'brick') patterns = PATTERNS_BRICK;

      // 1. Dang ky sprite tong chua ca 3 frames
      SPR.define('tile_' + def.name, {
        frames: patterns,
        palette: palObj,
        w: 16,
        h: 16,
        options: { noOutline: true },
        anim: 'static'
      });

      SPR.define('tile_' + def.id, {
        frames: patterns,
        palette: palObj,
        w: 16,
        h: 16,
        options: { noOutline: true },
        anim: 'static'
      });

      // 2. Dang ky rieng tung bien the de truy xuat doc lap
      for (let v = 0; v < patterns.length; v++) {
        SPR.define('tile_' + def.name + '_v' + v, {
          frames: [patterns[v]],
          palette: palObj,
          w: 16,
          h: 16,
          options: { noOutline: true },
          anim: 'static'
        });

        SPR.define('tile_' + def.id + '_v' + v, {
          frames: [patterns[v]],
          palette: palObj,
          w: 16,
          h: 16,
          options: { noOutline: true },
          anim: 'static'
        });
      }
    }

    // Alias tuong thich cho rock -> stone
    const stoneSpr = SPR.get('tile_stone');
    if (stoneSpr) {
      SPR.define('tile_rock', {
        frames: stoneSpr.rawFrames || PATTERNS_GROUND,
        palette: stoneSpr.palette,
        w: 16,
        h: 16,
        options: { noOutline: true },
        anim: 'static'
      });
    }
  }

  // 2. RUONG BAU PIXEL 16x16
  // ==========================================
  const CHEST_ROWS = [
    '                ', '   ..........   ',
    '  .WWWWWWWWWW.  ', ' .WWWWWWWWWWWW. ',
    ' .WWMMMMMMMMWW. ', '.WWMMMMMMMMMMWW.',
    '.WWMMMMMMMMMMWW.', '................',
    '.WWMMMMMMMMMMWW.', '.WWMMMMGGMMMMWW.',
    '.WWMMMMGGMMMMWW.', '.WWMMMMMMMMMMWW.',
    '.WWMMMMMMMMMMWW.', ' .WWWWWWWWWWWW. ',
    '  ............  ', '                '
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
    '       ......       ', '    ...GGGGGG...    ',
    '  ..GGGGGGGGGGGG..  ', ' .GGGGGGGGGGGGGGGG. ',
    '.GGGG..GGGGGG..GGGG.', '.GGG.  .GGGG.  .GGG.',
    ' ..     .GG.     .. ', '        .TT.        ',
    '        .TT.        ', '        .tt.        ',
    '        .TT.        ', '       .TT.         ',
    '       .TT.         ', '       .tt.         ',
    '       .TT.         ', '      .TT.          ',
    '      .TT.          ', '      .tt.          ',
    '      .TT.          ', '     .TT.           ',
    '     .TT.           ', '    ..TT..          ',
    '   .TTTTTT.         ', '    ......          '
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
    '            ....            ', '          ..RRRR..          ',
    '        ..RRRRRRRR..        ', '      ..RRRRRRRRRRRR..      ',
    '    ..RRRRRRRRRRRRRRRR..    ', '  ..RRRRRRRRRRRRRRRRRRRR..  ',
    '..RRRRRRRRRRRRRRRRRRRRRRRR..', '............................',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ', ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WW..WWWWWWWWWWWWWW..WWWW. ', ' .WW..WWWWWWWWWWWWWW..WWWW. ',
    ' .WWWWWWWWWWWWWWWWWWWWWWWW. ', ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ', ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ', ' .WWWWWWWW..DD..WWWWWWWWWW. ',
    ' .WWWWWWWW..DD..WWWWWWWWWW. ', ' .WWWWWWWWWWWWWWWWWWWWWWWW. ',
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
    '     ......     ', '    .WWWWWW.    ',
    '   .WWwwwwWW.   ', '  .WWwwwwwwWW.  ',
    ' .WWwwwwwwwwWW. ', ' .WWwwwwwwwwWW. ',
    ' .WWwwWWWWwwWW. ', ' .WWwwWWWWwwWW. ',
    ' .WWwwwwwwwwWW. ', ' .WWwwwwwwwwWW. ',
    ' .WWwwwwwwwwWW. ', ' .WWwwwwwwwwWW. ',
    '  .WWwwwwwwWW.  ', '   .WWWWWWWW.   ',
    '    ........    ', '                '
  ];

  const WARSHIP_ROWS = [
    '          ......          ', '        ..WWWWWW..        ',
    '       .WWWWWWWWWW.       ', '      .WWWWwwwwWWWW.      ',
    '     .WWWWwwwwwwWWWW.     ', '    .WWWWwwwwwwwwWWWW.    ',
    '   .WWWWwwwwwwwwwwWWWW.   ', '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ', '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ', '   .WWWW..CCCC..wwWWWW.   ',
    '   .WWWW..CCCC..wwWWWW.   ', '   .WWWWwwwwwwwwwwWWWW.   ',
    '   .WWWWwwwwwwwwwwWWWW.   ', '    .WWWWwwwwwwwwWWWW.    ',
    '     .WWWWwwwwwwWWWW.     ', '      .WWWWWWWWWWWW.      ',
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
