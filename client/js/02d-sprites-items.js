// client/js/02d-sprites-items.js
// Sprite icon pixel 16x16 cho 29 trai ac quy, 13 vu khi va 14 vat pham do dung.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02b-palette.js, shared/10 -> 12.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};
  const SPR = OP.SPR = OP.SPR || {};
  const PAL = OP.PAL || {};

  // ==========================================
  // 1. TEMPLATE TRAI AC QUY PIXEL 16x16 (HOA VAN XOAY)
  // ==========================================
  const FRUIT_ICON_ROWS = [
    '     ..SS..     ',
    '    ..sSSS..    ',
    '      .SS.      ',
    '   ...CCCC...   ',
    '  .CCCxxxxCCC.  ',
    ' .CCxxCCCCxxCC. ',
    ' .CxxxCddCxxxC. ',
    '.CCxCCddddCCxCC.',
    '.CCxCddddddCxCC.',
    '.CCxCCddddCCxCC.',
    ' .CxxxCddCxxxC. ',
    ' .CCxxCCCCxxCC. ',
    '  .CCCxxxxCCC.  ',
    '   ...CCCC...   ',
    '      ....      ',
    '                '
  ];

  function registerFruits() {
    const fruits = S.FRUITS || {};
    const stemColor = '#22c55e';
    const stemDark = '#15803d';

    for (const id in fruits) {
      const f = fruits[id];
      const mainColor = f.color || '#e11d48';
      const darkColor = PAL.tintColor ? PAL.tintColor(mainColor, 0.7) : '#9f1239';
      const lightColor = PAL.tintColor ? PAL.tintColor(mainColor, 1.25) : '#fb7185';

      const pal = {
        S: stemColor,
        s: stemDark,
        C: mainColor,
        d: darkColor,
        x: lightColor
      };

      SPR.define(`fruit_${id}`, {
        frames: [FRUIT_ICON_ROWS],
        palette: pal,
        w: 16,
        h: 16,
        anim: 'static'
      });
    }
  }

  // ==========================================
  // 2. TEMPLATE VU KHI PIXEL 16x16
  // ==========================================
  // Kiếm / Đao chéo góc 16x16
  const SWORD_ROWS = [
    '              ..',
    '             .B.',
    '            .BB.',
    '           .BB. ',
    '          .Bb.  ',
    '         .Bb.   ',
    '        .Bb.    ',
    '       .Bb.     ',
    '      .Bb.      ',
    '     .GG.       ',
    '    .rGG.       ',
    '   .rG.G.       ',
    '  .HH.  ..      ',
    ' .HH.           ',
    '.P.             ',
    '..              '
  ];

  // Gậy / Jitte / Kanabo
  const BLUNT_ROWS = [
    '            ....',
    '           .BBB.',
    '          .BBBB.',
    '         .BBBB. ',
    '        .BBBb.  ',
    '       .BBBb.   ',
    '      .BBBb.    ',
    '     .BBBb.     ',
    '    .GGGb.      ',
    '   .rGG.        ',
    '  .HH.          ',
    ' .HH.           ',
    '.P.             ',
    '..              ',
    '                ',
    '                '
  ];

  // Súng lục
  const PISTOL_ROWS = [
    '                ',
    '   ..........   ',
    '  .MMMMMMMMMM.  ',
    '  .MMmmmmmmMM.  ',
    '  .MM.    .MM.  ',
    '  .MM.    ....  ',
    '  .MM.          ',
    '  .WWWW.        ',
    '   .WWWW.       ',
    '    .WWWW.      ',
    '     .WWWW.     ',
    '      ....      ',
    '                ',
    '                ',
    '                ',
    '                '
  ];

  function registerWeapons() {
    const weapons = S.WEAPONS || {};

    for (const id in weapons) {
      const w = weapons[id];
      let rows = SWORD_ROWS;
      let pal = {};

      if (w.type === 'gun') {
        rows = PISTOL_ROWS;
        pal = {
          M: '#94a3b8',
          m: '#475569',
          W: '#854d0e'
        };
      } else if (w.type === 'blunt') {
        rows = BLUNT_ROWS;
        pal = {
          B: (id === 'kanabo') ? '#334155' : '#cbd5e1',
          b: (id === 'kanabo') ? '#0f172a' : '#64748b',
          G: '#eab308',
          r: '#ca8a04',
          H: '#78350f',
          P: '#f59e0b'
        };
      } else {
        // Kiem (sword, special)
        let bladeColor = '#f8fafc';
        let bladeShadow = '#94a3b8';
        let guardColor = '#eab308';
        let hiltColor = '#78350f';

        if (id === 'yoru') {
          bladeColor = '#18181b';
          bladeShadow = '#3f3f46';
          guardColor = '#f59e0b';
        } else if (id === 'enma') {
          bladeColor = '#c084fc';
          bladeShadow = '#7e22ce';
          guardColor = '#fbbf24';
        } else if (id === 'shusui') {
          bladeColor = '#dc2626';
          bladeShadow = '#7f1d1d';
        }

        pal = {
          B: bladeColor,
          b: bladeShadow,
          G: guardColor,
          r: '#b45309',
          H: hiltColor,
          P: '#fbbf24'
        };
      }

      SPR.define(`weapon_${id}`, {
        frames: [rows],
        palette: pal,
        w: 16,
        h: 16,
        anim: 'static'
      });
    }
  }

  // ==========================================
  // 3. TEMPLATE VAT PHAM PIXEL 16x16
  // ==========================================
  const MEAT_ROWS = [
    '     ....       ',
    '   ..RRRR..     ',
    '  .RRrrrrRR.    ',
    ' .RRrrrrrrRR.   ',
    '.RRrrrrrrrrRR.  ',
    '.RRrrrrrrrrRR.  ',
    ' .RRrrrrrrRR.   ',
    '  .RRrrrrRR.    ',
    '   ..RRRR..WW.  ',
    '     .... .WW.  ',
    '         .WW.   ',
    '         .WW.   ',
    '        .WWWW.  ',
    '        .W..W.  ',
    '         ....   ',
    '                '
  ];

  const DIAL_ROWS = [
    '    ......      ',
    '   .SSDDSS.     ',
    '  .SDddddDS.    ',
    ' .SDdDDDDdDS.   ',
    ' .DdDDDDDDdD.   ',
    '.DdDDddddDDdD.  ',
    '.DdDdSSSSdDdD.  ',
    '.DdDdSSSSdDdD.  ',
    '.DdDDddddDDdD.  ',
    ' .DdDDDDDDdD.   ',
    ' .SDdDDDDdDS.   ',
    '  .SDddddDS.    ',
    '   .SSDDSS.     ',
    '    ......      ',
    '                ',
    '                '
  ];

  const SHIELD_ROWS = [
    '  ............  ',
    ' .SSSSSSSSSSSS. ',
    '.SSssssssssssSS.',
    '.SSsWWWWWWWWsSS.',
    '.SSsWwwwwwwWsSS.',
    '.SSsWwGGGGwWsSS.',
    '.SSsWwGGGGwWsSS.',
    ' .SSsWwGGwWsSS. ',
    ' .SSsWwwwwWsSS. ',
    '  .SSsWWWWsSS.  ',
    '  .SSssssssSS.  ',
    '   .SSSSSSSS.   ',
    '    .SSSSSS.    ',
    '     .SSSS.     ',
    '      .SS.      ',
    '       ..       '
  ];

  const SHARD_ROWS = [
    '       ..       ',
    '      .HH.      ',
    '     .HHHH.     ',
    '    .HHhhHH.    ',
    '   .HHhhhhHH.   ',
    '  .HHhhhhhhHH.  ',
    '   .HHhhhhHH.   ',
    '    .HHhhHH.    ',
    '     .HHHH.     ',
    '      .HH.      ',
    '       ..       ',
    '                ',
    '                ',
    '                ',
    '                ',
    '                '
  ];

  const SCROLL_ROWS = [
    '   ..........   ',
    '  .YYYYYYYYYY.  ',
    ' .YYyyyyyyyyYY. ',
    '.YYy........yYY.',
    '.YYy.RRRRRR.yYY.',
    '.YYy.RrrrrR.yYY.',
    '.YYy.RRRRRR.yYY.',
    '.YYy........yYY.',
    ' .YYyyyyyyyyYY. ',
    '  .YYYYYYYYYY.  ',
    '   ..........   ',
    '                ',
    '                ',
    '                ',
    '                ',
    '                '
  ];

  function registerItems() {
    const items = S.ITEMS || {};

    for (const id in items) {
      let rows = MEAT_ROWS;
      let pal = {};

      if (id.startsWith('meat') || id === 'cola') {
        rows = MEAT_ROWS;
        pal = {
          R: (id === 'cola') ? '#0284c7' : '#e11d48',
          r: (id === 'cola') ? '#0369a1' : '#9f1239',
          W: '#f8fafc'
        };
      } else if (id.startsWith('dial')) {
        rows = DIAL_ROWS;
        let dialColor = '#f59e0b';
        if (id === 'dial_flame') dialColor = '#ef4444';
        if (id === 'dial_breath') dialColor = '#06b6d4';
        if (id === 'dial_flash') dialColor = '#fef08a';

        pal = {
          D: dialColor,
          d: PAL.tintColor ? PAL.tintColor(dialColor, 0.7) : '#b45309',
          S: '#fde047'
        };
      } else if (id.startsWith('shield')) {
        rows = SHIELD_ROWS;
        const isIron = id === 'shield_iron';
        pal = {
          S: isIron ? '#94a3b8' : '#b45309',
          s: isIron ? '#475569' : '#78350f',
          W: isIron ? '#cbd5e1' : '#d97706',
          w: isIron ? '#64748b' : '#92400e',
          G: '#fbbf24'
        };
      } else if (id.startsWith('haki') || id === 'awaken_core') {
        rows = SHARD_ROWS;
        let shardColor = '#c084fc';
        if (id === 'haki_shard_arm') shardColor = '#18181b';
        if (id === 'haki_shard_obs') shardColor = '#ef4444';
        if (id === 'haki_shard_conq') shardColor = '#f59e0b';
        if (id === 'awaken_core') shardColor = '#ec4899';

        pal = {
          H: shardColor,
          h: PAL.tintColor ? PAL.tintColor(shardColor, 0.6) : '#581c87'
        };
      } else {
        rows = SCROLL_ROWS;
        pal = {
          Y: '#fef08a',
          y: '#ca8a04',
          R: '#dc2626',
          r: '#991b1b'
        };
      }

      SPR.define(`item_${id}`, {
        frames: [rows],
        palette: pal,
        w: 16,
        h: 16,
        anim: 'static'
      });
    }
  }

  // Tu dong dang ky moi sprite khi nạp file
  registerFruits();
  registerWeapons();
  registerItems();

})(typeof window !== 'undefined' ? window : globalThis);
