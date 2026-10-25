// shared/11-data-weapons.js
// Du lieu dinh nghia 13 loai vu khi trong One Piece Battleground.
// Phu thuoc: shared/00-namespace.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  const WEAPONS = {
    sword_marine: { id: 'sword_marine', name: 'Kiếm Hải Quân', type: 'sword', tier: 'C', dmg: 12, rate: 0.45, range: 24, desc: 'Cân bằng' },
    kitetsu3: { id: 'kitetsu3', name: 'Sandai Kitetsu', type: 'sword', tier: 'B', dmg: 16, rate: 0.45, range: 26, desc: 'Sát thương +15%, 5% tự chém 5 máu' },
    yubashiri: { id: 'yubashiri', name: 'Yubashiri', type: 'sword', tier: 'A', dmg: 18, rate: 0.35, range: 25, desc: 'Nhẹ, chém rất nhanh' },
    wado: { id: 'wado', name: 'Wado Ichimonji', type: 'sword', tier: 'S', dmg: 22, rate: 0.40, range: 28, desc: 'Chém nhanh, tầm xa hơn' },
    shusui: { id: 'shusui', name: 'Shusui', type: 'sword', tier: 'S', dmg: 26, rate: 0.50, range: 26, desc: 'Đao nặng, sát thương cao' },
    enma: { id: 'enma', name: 'Enma', type: 'sword', tier: 'S', dmg: 28, rate: 0.45, range: 28, desc: 'Hút 5 Haki/s, bật Vũ Trang ×1.5' },
    habakiri: { id: 'habakiri', name: 'Ame no Habakiri', type: 'sword', tier: 'MYTHIC', dmg: 32, rate: 0.35, range: 30, desc: 'Chém cực nhanh' },
    yoru: { id: 'yoru', name: 'Yoru (Hắc Đao)', type: 'sword', tier: 'MYTHIC', dmg: 38, rate: 0.55, range: 34, desc: 'Đòn mạnh bắn sóng kiếm xa nhất' },
    murakumogiri: { id: 'murakumogiri', name: 'Murakumogiri', type: 'sword', tier: 'MYTHIC', dmg: 40, rate: 0.60, range: 36, desc: 'Đại đao, chém quét 360 độ' },
    kanabo: { id: 'kanabo', name: 'Gậy sắt Kanabo', type: 'blunt', tier: 'A', dmg: 24, rate: 0.60, range: 28, desc: 'Đánh choáng 0.3s' },
    jitte_kairoseki: { id: 'jitte_kairoseki', name: 'Jitte Hải Lâu Thạch', type: 'blunt', tier: 'A', dmg: 20, rate: 0.50, range: 26, desc: 'Khóa trái 2s' },
    clima_tact: { id: 'clima_tact', name: 'Gậy thời tiết', type: 'special', tier: 'A', dmg: 18, rate: 0.45, range: 32, desc: 'Mây sét và ảo ảnh' },
    pistol: { id: 'pistol', name: 'Súng lục', type: 'gun', tier: 'C', dmg: 15, rate: 0.65, range: 120, desc: 'Bắn đạn tầm gần/trung' }
  };

  S.WEAPONS = Object.freeze(WEAPONS);

})(typeof globalThis !== 'undefined' ? globalThis : window);
