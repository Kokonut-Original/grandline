// shared/12-data-items.js
// Du lieu dinh nghia 14 loai vat pham, tieu hao, dial, manh haki va bang drop LOOT_POOLS.
// Phu thuoc: shared/00-namespace.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  const ITEMS = {
    // Tieu hao
    meat_small: { id: 'meat_small', name: 'Thịt nhỏ', type: 'consumable', tier: 'C', stack: 3, desc: 'Hồi 25 máu' },
    meat_big: { id: 'meat_big', name: 'Đùi thịt lớn', type: 'consumable', tier: 'B', stack: 2, desc: 'Hồi 60 máu' },
    cola: { id: 'cola', name: 'Nước ngọt Cola', type: 'consumable', tier: 'C', stack: 3, desc: 'Hồi 50 thể lực' },

    // Giap / Khien
    shield_wood: { id: 'shield_wood', name: 'Khiên gỗ', type: 'shield', tier: 'C', maxHp: 30, desc: 'Hấp thụ 30 sát thương vật lý' },
    shield_iron: { id: 'shield_iron', name: 'Khiên sắt', type: 'shield', tier: 'B', maxHp: 70, desc: 'Hấp thụ 70 sát thương vật lý' },

    // Dial (4 loai)
    dial_flame: { id: 'dial_flame', name: 'Flame Dial', type: 'dial', tier: 'B', cd: 15, desc: 'Phun ngọn lửa gây bỏng' },
    dial_impact: { id: 'dial_impact', name: 'Impact Dial', type: 'dial', tier: 'A', cd: 20, desc: 'Hấp thụ và phản ngược đòn đánh' },
    dial_breath: { id: 'dial_breath', name: 'Breath Dial', type: 'dial', tier: 'B', cd: 12, desc: 'Lướt nhanh về phía trước' },
    dial_flash: { id: 'dial_flash', name: 'Flash Dial', type: 'dial', tier: 'B', cd: 18, desc: 'Chớp sáng làm mù kẻ địch 1.5s' },

    // Manh Haki & Bi kip
    haki_shard_arm: { id: 'haki_shard_arm', name: 'Mảnh Vũ Trang', type: 'haki', tier: 'A', desc: 'Tăng 1 cấp Haki Vũ Trang' },
    haki_shard_obs: { id: 'haki_shard_obs', name: 'Mảnh Quan Sát', type: 'haki', tier: 'A', desc: 'Tăng 1 cấp Haki Quan Sát' },
    haki_shard_conq: { id: 'haki_shard_conq', name: 'Mảnh Bá Vương', type: 'haki', tier: 'MYTHIC', desc: 'Mở khóa hoặc nâng cấp Bá Vương' },
    scroll_roku: { id: 'scroll_roku', name: 'Bí kíp Lục Thức', type: 'scroll', tier: 'B', desc: 'Học một chiêu Lục Thức ngẫu nhiên' },
    awaken_core: { id: 'awaken_core', name: 'Mảnh Thức Tỉnh', type: 'awaken', tier: 'MYTHIC', desc: 'Thức tỉnh ngay trái ác quỷ đang có' }
  };

  S.ITEMS = Object.freeze(ITEMS);

  S.LOOT_POOLS = Object.freeze({
    CHEST_WOOD: ['meat_small', 'cola', 'shield_wood', 'sword_marine', 'pistol'],
    CHEST_IRON: ['meat_big', 'shield_iron', 'dial_flame', 'dial_breath', 'kitetsu3', 'scroll_roku'],
    CHEST_GOLD: ['dial_impact', 'haki_shard_arm', 'haki_shard_obs', 'wado', 'yubashiri'],
    AIRDROP: ['haki_shard_conq', 'awaken_core', 'habakiri', 'yoru', 'murakumogiri']
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
