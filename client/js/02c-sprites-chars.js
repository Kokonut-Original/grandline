// client/js/02c-sprites-chars.js
// Dinh nghia sprite nguoi choi chibi 16x24, 3 huong, cac hoat anh walk/bounce va bo doi mau.
// Phu thuoc: client/js/00-boot.js, client/js/02a-pixel-core.js, client/js/02b-palette.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const PAL = OP.PAL || {};
  const SPR = OP.SPR = OP.SPR || {};

  // ==========================================
  // KHUNG MA TRAN PIXEL 16x24 CUA NGUOI CHOI
  // ==========================================

  // 1. HUONG XUONG (DOWN) - MAT PHIA TRUOC
  // Frame 0: Di chuyen chan trai
  const CHAR_DOWN_WALK_0 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTKKKKKKTT.  ',
    '  .TKKKKKKKKT.  ',
    '  .TKEWKKEWKT.  ',
    '  .TKKKKKKKKT.  ',
    '   .kKKkkKKk.   ',
    '   .TTkKKkTT.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '    .PP..PP.    ',
    '    .PP..pp.    ',
    '    .BB..bb.    ',
    '   .BBB. .bb.   ',
    '   .BB.         ',
    '                '
  ];

  // Frame 1: Dung yen (Neutral / Bounce)
  const CHAR_DOWN_IDLE_0 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTKKKKKKTT.  ',
    '  .TKKKKKKKKT.  ',
    '  .TKEWKKEWKT.  ',
    '  .TKKKKKKKKT.  ',
    '   .kKKkkKKk.   ',
    '   .TTkKKkTT.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '     .PPPP.     ',
    '    .PP..PP.    ',
    '    .BB..BB.    ',
    '   .BBB..BBB.   ',
    '                ',
    '                '
  ];

  // Frame 2: Di chuyen chan phai
  const CHAR_DOWN_WALK_2 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTKKKKKKTT.  ',
    '  .TKKKKKKKKT.  ',
    '  .TKEWKKEWKT.  ',
    '  .TKKKKKKKKT.  ',
    '   .kKKkkKKk.   ',
    '   .TTkKKkTT.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '    .pp..PP.    ',
    '    .pp..PP.    ',
    '    .bb..BB.    ',
    '   .bb. .BBB.   ',
    '         .BB.   ',
    '                '
  ];

  // 2. HUONG LEN (UP) - LUNG PHIA SAU
  const CHAR_UP_WALK_0 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .tTTTTTTTTt.  ',
    '   .TTttttTT.   ',
    '   .tTTTTTTt.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '    .PP..PP.    ',
    '    .PP..pp.    ',
    '    .BB..bb.    ',
    '   .BBB. .bb.   ',
    '   .BB.         ',
    '                '
  ];

  const CHAR_UP_IDLE_0 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .tTTTTTTTTt.  ',
    '   .TTttttTT.   ',
    '   .tTTTTTTt.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '     .PPPP.     ',
    '    .PP..PP.    ',
    '    .BB..BB.    ',
    '   .BBB..BBB.   ',
    '                ',
    '                '
  ];

  const CHAR_UP_WALK_2 = [
    '    ..HHHH..    ',
    '   ..HHHHHH..   ',
    '  ..HHHHHHHH..  ',
    ' ..HHHHHHHHHH.. ',
    ' .hhhhhhhhhhhh. ',
    '   .TTTTTTTT.   ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .TTTTTTTTTT.  ',
    '  .tTTTTTTTTt.  ',
    '   .TTttttTT.   ',
    '   .tTTTTTTt.   ',
    '  ..SSSSSSSS..  ',
    ' .KK.SSSSSS.KK. ',
    ' .KK.SSssSS.KK. ',
    ' .k..SSssSS..k. ',
    '     .SSSS.     ',
    '     .PPPP.     ',
    '    .pp..PP.    ',
    '    .pp..PP.    ',
    '    .bb..BB.    ',
    '   .bb. .BBB.   ',
    '         .BB.   ',
    '                '
  ];

  // 3. HUONG NGANG (SIDE) - NHIN SANG PHAI (Sang trai thi flip horizontal)
  const CHAR_SIDE_WALK_0 = [
    '   ..HHHH..     ',
    '  ..HHHHHH..    ',
    ' ..HHHHHHHH..   ',
    '..HHHHHHHHHH..  ',
    '.hhhhhhhhhhhh.  ',
    '  .TTTTTTTT.    ',
    '  .TTKKKKKT.    ',
    '  .TKKKKKKT.    ',
    '  .TKKEWKT..    ',
    '  .TKKKKK.      ',
    '  .tKKKK.       ',
    '   .TTtt.       ',
    '   ..SSSS..     ',
    '   .SSSSSS.K.   ',
    '  .K.SSssS.KK.  ',
    '  .k.SSSS..K.   ',
    '    .SSSS.      ',
    '    .PPPP.      ',
    '    .PP.PP.     ',
    '   .PP. .PP.    ',
    '   .BB. .BB.    ',
    '  .BBB.  .BB.   ',
    '  .BB.          ',
    '                '
  ];

  const CHAR_SIDE_IDLE_0 = [
    '   ..HHHH..     ',
    '  ..HHHHHH..    ',
    ' ..HHHHHHHH..   ',
    '..HHHHHHHHHH..  ',
    '.hhhhhhhhhhhh.  ',
    '  .TTTTTTTT.    ',
    '  .TTKKKKKT.    ',
    '  .TKKKKKKT.    ',
    '  .TKKEWKT..    ',
    '  .TKKKKK.      ',
    '  .tKKKK.       ',
    '   .TTtt.       ',
    '   ..SSSS..     ',
    '   .SSSSSS.K.   ',
    '  .K.SSssS.KK.  ',
    '  .k.SSSS..K.   ',
    '    .SSSS.      ',
    '    .PPPP.      ',
    '    .PPPP.      ',
    '    .PP.PP.     ',
    '    .BB.BB.     ',
    '   .BBB.BBB.    ',
    '                ',
    '                '
  ];

  const CHAR_SIDE_WALK_2 = [
    '   ..HHHH..     ',
    '  ..HHHHHH..    ',
    ' ..HHHHHHHH..   ',
    '..HHHHHHHHHH..  ',
    '.hhhhhhhhhhhh.  ',
    '  .TTTTTTTT.    ',
    '  .TTKKKKKT.    ',
    '  .TKKKKKKT.    ',
    '  .TKKEWKT..    ',
    '  .TKKKKK.      ',
    '  .tKKKK.       ',
    '   .TTtt.       ',
    '   ..SSSS..     ',
    '   .SSSSSS.K.   ',
    '  .K.SSssS.KK.  ',
    '  .k.SSSS..K.   ',
    '    .SSSS.      ',
    '    .PPPP.      ',
    '    .pp.PP.     ',
    '   .pp. .PP.    ',
    '   .bb. .BB.    ',
    '  .bb.  .BBB.   ',
    '         .BB.   ',
    '                '
  ];

  // Helper xay dung bang mau dong cho nguoi choi
  function buildPalette(colors) {
    const c = colors || {};
    const hat = c.hat || '#d9534f';
    const shirt = c.shirt || '#337ab7';
    const hair = c.hair || '#292b2c';

    return {
      H: hat,
      h: PAL.tintColor ? PAL.tintColor(hat, 0.72) : '#a93330',
      T: hair,
      t: PAL.tintColor ? PAL.tintColor(hair, 0.65) : '#151617',
      K: PAL.SKIN_LIGHT || '#ffd1a4',
      k: PAL.SKIN_SHADOW || '#c98a58',
      E: PAL.EYE_BLACK || '#181818',
      W: PAL.EYE_WHITE || '#fdfdfd',
      S: shirt,
      s: PAL.tintColor ? PAL.tintColor(shirt, 0.72) : '#205584',
      P: '#2b3a4a',
      p: '#1b2530',
      B: '#59351f',
      b: '#381f0f'
    };
  }

  // Tao va cache toan bo sprite cho 1 bo mau cua nguoi choi
  SPR.player = function (colors) {
    const c = colors || { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' };
    const hatClean = (c.hat || 'hat').replace('#', '');
    const shirtClean = (c.shirt || 'shirt').replace('#', '');
    const hairClean = (c.hair || 'hair').replace('#', '');
    const baseId = `player_${hatClean}_${shirtClean}_${hairClean}`;

    if (SPR.get(`${baseId}_down_walk`)) {
      return baseId;
    }

    const pal = buildPalette(c);

    // 1. Huong Down
    SPR.define(`${baseId}_down_walk`, {
      frames: [CHAR_DOWN_WALK_0, CHAR_DOWN_IDLE_0, CHAR_DOWN_WALK_2],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'walk',
      fps: 6
    });

    SPR.define(`${baseId}_down_idle`, {
      frames: [CHAR_DOWN_IDLE_0],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'static'
    });

    // 2. Huong Up
    SPR.define(`${baseId}_up_walk`, {
      frames: [CHAR_UP_WALK_0, CHAR_UP_IDLE_0, CHAR_UP_WALK_2],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'walk',
      fps: 6
    });

    SPR.define(`${baseId}_up_idle`, {
      frames: [CHAR_UP_IDLE_0],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'static'
    });

    // 3. Huong Side
    SPR.define(`${baseId}_side_walk`, {
      frames: [CHAR_SIDE_WALK_0, CHAR_SIDE_IDLE_0, CHAR_SIDE_WALK_2],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'walk',
      fps: 6
    });

    SPR.define(`${baseId}_side_idle`, {
      frames: [CHAR_SIDE_IDLE_0],
      palette: pal,
      w: 16,
      h: 24,
      originX: 8,
      originY: 22,
      anim: 'static'
    });

    return baseId;
  };

})(typeof window !== 'undefined' ? window : globalThis);
