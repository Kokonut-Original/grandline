// client/js/02a-pixel-core.js
// Xu ly render pixelGrid, tu sinh vien den 1px, bo dem cache sprite va quan ly sprite OP.SPR.
// Phu thuoc: client/js/00-boot.js, client/js/02b-palette.js.

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const PAL = OP.PAL || {};

  const cache = new Map();

  function makeHash(rows, palette, opts) {
    let key = '';
    if (Array.isArray(rows)) {
      key += rows.join('/');
    }
    if (palette && typeof palette === 'object') {
      const keys = Object.keys(palette).sort();
      for (let i = 0; i < keys.length; i++) {
        key += '|' + keys[i] + ':' + palette[keys[i]];
      }
    }
    if (opts) {
      if (opts.outline) key += '|out:' + opts.outline;
      if (opts.expand) key += '|exp:1';
      if (opts.noOutline) key += '|noout:1';
    }
    return key;
  }

  // Tao ma tran 2D diem anh tu chuoi va palette, tu sinh vien den 1px
  function pixelMatrix(rows, palette, options) {
    const opts = options || {};
    const outlineColor = opts.outline || (PAL.OUTLINE || '#111111');
    const noOutline = !!opts.noOutline;
    const expand = !!opts.expand;

    if (!Array.isArray(rows) || rows.length === 0) {
      return { width: 0, height: 0, pixels: [] };
    }

    const rawH = rows.length;
    let rawW = 0;
    for (let r = 0; r < rawH; r++) {
      if (rows[r] && rows[r].length > rawW) {
        rawW = rows[r].length;
      }
    }

    const offX = expand ? 1 : 0;
    const offY = expand ? 1 : 0;
    const width = rawW + (expand ? 2 : 0);
    const height = rawH + (expand ? 2 : 0);

    // Khoi tao ma tran null
    const matrix = [];
    for (let y = 0; y < height; y++) {
      matrix[y] = new Array(width).fill(null);
    }

    // 1. Quet va dat cac pixel mau chinh
    for (let r = 0; r < rawH; r++) {
      const rowStr = rows[r] || '';
      for (let c = 0; c < rowStr.length; c++) {
        const char = rowStr[c];
        if (char !== ' ' && char !== '.' && palette && palette[char]) {
          matrix[r + offY][c + offX] = palette[char];
        }
      }
    }

    // 2. Tu sinh vien den 1px: quet 4 huong quanh moi pixel co mau
    if (!noOutline) {
      const outlines = [];
      const neighbors = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (matrix[y][x] !== null) {
            // Day la pixel co mau, kiem tra 4 huong lan can
            for (let i = 0; i < neighbors.length; i++) {
              const nx = x + neighbors[i].dx;
              const ny = y + neighbors[i].dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (matrix[ny][nx] === null) {
                  outlines.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
      }

      // Gan mau vien den cho cac o lan can trong
      for (let i = 0; i < outlines.length; i++) {
        const pt = outlines[i];
        if (matrix[pt.y][pt.x] === null) {
          matrix[pt.y][pt.x] = outlineColor;
        }
      }
    }

    return { width, height, pixels: matrix };
  }

  // Tao canvas tu rows va palette co viend den
  function pixelGrid(rows, palette, options) {
    const opts = options || {};
    const key = makeHash(rows, palette, opts);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const mat = pixelMatrix(rows, palette, opts);
    let canvas = null;

    if (typeof document !== 'undefined' && document.createElement) {
      canvas = document.createElement('canvas');
      canvas.width = mat.width;
      canvas.height = mat.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        for (let y = 0; y < mat.height; y++) {
          for (let x = 0; x < mat.width; x++) {
            const color = mat.pixels[y][x];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
    } else {
      // Môi trường Node.js (dành cho test)
      canvas = {
        width: mat.width,
        height: mat.height,
        _matrix: mat.pixels,
        getContext: function () {
          return {
            imageSmoothingEnabled: false,
            fillRect: function () {}
          };
        }
      };
    }

    cache.set(key, canvas);
    return canvas;
  }

  // He thong quan ly Sprite OP.SPR
  const spriteDefs = new Map();

  const SPR = {
    define: function (id, def) {
      if (!id || !def) return;
      const palette = def.palette || {};
      const frames = def.frames || [];
      const canvasFrames = [];

      for (let i = 0; i < frames.length; i++) {
        const frameRows = frames[i];
        const cvs = pixelGrid(frameRows, palette, def.options);
        canvasFrames.push(cvs);
      }

      const spriteObj = {
        id: id,
        frames: canvasFrames,
        rawFrames: frames,
        palette: palette,
        anim: def.anim || 'static',
        w: def.w || (canvasFrames[0] ? canvasFrames[0].width : 16),
        h: def.h || (canvasFrames[0] ? canvasFrames[0].height : 16),
        originX: (typeof def.originX === 'number') ? def.originX : (def.w ? Math.floor(def.w / 2) : 8),
        originY: (typeof def.originY === 'number') ? def.originY : (def.h ? def.h : 16),
        fps: def.fps || 6
      };

      spriteDefs.set(id, spriteObj);
      return spriteObj;
    },

    get: function (id) {
      return spriteDefs.get(id) || null;
    },

    draw: function (ctx, id, frame, x, y, options) {
      if (!ctx) return;
      const spr = spriteDefs.get(id);
      if (!spr || spr.frames.length === 0) return;

      const opts = options || {};
      let frameIndex = 0;

      if (typeof frame === 'number') {
        frameIndex = Math.floor(frame) % spr.frames.length;
        if (frameIndex < 0) frameIndex += spr.frames.length;
      }

      const frameCanvas = spr.frames[frameIndex];
      if (!frameCanvas) return;

      const scale = opts.scale || 1;
      const flip = !!opts.flip;
      const ox = (typeof opts.originX === 'number') ? opts.originX : spr.originX;
      const oy = (typeof opts.originY === 'number') ? opts.originY : spr.originY;

      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));

      if (flip) {
        ctx.scale(-1, 1);
      }
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      ctx.drawImage(frameCanvas, -ox, -oy);
      ctx.restore();
    },

    player: function (colors) {
      // Khoi tao sprite nguoi choi se duoc mo rong o task M02-T02
      const key = 'player_' + (colors ? (colors.hat + '_' + colors.shirt + '_' + colors.hair) : 'default');
      return key;
    }
  };

  OP.PX = {
    pixelGrid: pixelGrid,
    pixelMatrix: pixelMatrix,
    clearCache: function () { cache.clear(); }
  };

  OP.SPR = SPR;

})(typeof window !== 'undefined' ? window : globalThis);
