// shared/05-rng.js
// Bo sinh so ngau nhien co seed (mulberry32), ham bam chuoi va toa do.
// Phu thuoc: shared/00-namespace.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  // Thuat toan mulberry32 tao bo sinh so ngau nhien 32-bit tu mot seed
  function mulberry32(seed) {
    let a = (seed >>> 0);
    return function () {
      let t = (a = (a + 0x6D2B79F5) >>> 0);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Ham bam chuoi FNV-1a tra ve so nguyen duong 32-bit
  function hashString(str) {
    let h = 2166136261 >>> 0;
    const len = str.length;
    for (let i = 0; i < len; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  // Ham bam 2D toa do (x, y) va seed cho sinh map va dia hinh
  function hash2(x, y, seed) {
    let h = ((seed || 0) ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  // Tao doi tuong RNG voi cac tien ich tien dung
  function createRNG(seed) {
    const s = (typeof seed === 'string') ? hashString(seed) : ((seed !== undefined ? seed : 0) >>> 0);
    const next = mulberry32(s);

    return {
      next: next,
      nextFloat: function (min, max) {
        if (max === undefined) { max = min; min = 0; }
        return min + next() * (max - min);
      },
      nextInt: function (min, max) {
        if (max === undefined) { max = min; min = 0; }
        return Math.floor(min + next() * (max - min + 1));
      },
      choice: function (arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(next() * arr.length)];
      },
      shuffle: function (arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          const temp = copy[i];
          copy[i] = copy[j];
          copy[j] = temp;
        }
        return copy;
      }
    };
  }

  S.RNG = Object.freeze({
    create: createRNG,
    mulberry32: mulberry32,
    hash: hashString,
    hash2: hash2
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = S;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
