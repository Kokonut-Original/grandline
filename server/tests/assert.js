// server/tests/assert.js
// Thu vien assert tu viet khong dung framework ngoai phuc vu test server logic.
// Phu thuoc: khong co.

'use strict';

function formatVal(v) {
  try {
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

const assert = {
  ok: function (value, msg) {
    if (!value) {
      throw new Error(msg || `Gia tri khong phai truthy: ${formatVal(value)}`);
    }
  },

  strictEqual: function (actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Ky vong ${formatVal(expected)}, nhung nhan duoc ${formatVal(actual)}`);
    }
  },

  notStrictEqual: function (actual, expected, msg) {
    if (actual === expected) {
      throw new Error(msg || `Gia tri khong duoc bang ${formatVal(expected)}`);
    }
  },

  deepStrictEqual: function (actual, expected, msg) {
    if (!deepEqual(actual, expected)) {
      throw new Error(msg || `So sanh sau khong khop:\n  Nhan duoc: ${formatVal(actual)}\n  Ky vong:   ${formatVal(expected)}`);
    }
  },

  throws: function (fn, msg) {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(msg || 'Ham duoc ky vong se nem ra loi nhung khong xay ra.');
    }
  }
};

module.exports = assert;
