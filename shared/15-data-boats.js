// shared/15-data-boats.js
// Du lieu 4 loai thuyen chien va chien ham trong One Piece Battleground.
// Phu thuoc: shared/00-namespace.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  const BOATS = {
    dinghy: { id: 'dinghy', name: 'Xuồng nhỏ', seats: 1, speed: 120, hp: 80, desc: 'Xuồng 1 người gọn nhẹ' },
    waver: { id: 'waver', name: 'Ván lướt sóng', seats: 1, speed: 190, hp: 50, desc: 'Cần nhiên liệu, tốc độ rất cao' },
    sloop: { id: 'sloop', name: 'Thuyền buồm', seats: 4, speed: 100, hp: 200, desc: 'Chở tối đa 4 người, kẻ địch cũng lên được' },
    warship: { id: 'warship', name: 'Tàu chiến', seats: 2, speed: 70, hp: 400, desc: 'Ghế 2 bắn đại bác 40 sát thương AoE' }
  };

  S.BOATS = Object.freeze(BOATS);

})(typeof globalThis !== 'undefined' ? globalThis : window);
