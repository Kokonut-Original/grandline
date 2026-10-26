// shared/10-data-fruits.js
// Du lieu 16 trai ac quy (giam tu 29 theo quyet dinh 2026-10-26) va bang nguon roi theo bac S.FRUIT_SOURCES.
// Phu thuoc: shared/00-namespace.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  const FRUITS = {
    // 6 Logia
    mera: { id: 'mera', name: 'Mera Mera (Lửa)', type: 'logia', tier: 'A', color: '#ff5a1f', desc: 'Đòn gây bỏng 3s' },
    magu: { id: 'magu', name: 'Magu Magu (Dung nham)', type: 'logia', tier: 'S', color: '#c2185b', desc: 'Để lại vũng dung nham 4s' },
    hie: { id: 'hie', name: 'Hie Hie (Băng)', type: 'logia', tier: 'A', color: '#8fe3ff', desc: 'Đòn làm chậm 30%' },
    goro: { id: 'goro', name: 'Goro Goro (Sét)', type: 'logia', tier: 'S', color: '#fff35a', desc: 'Đòn đánh nhanh, tia sét' },
    pika: { id: 'pika', name: 'Pika Pika (Ánh sáng)', type: 'logia', tier: 'S', color: '#fffbd0', desc: 'Nhanh nhất game, laser' },
    suna: { id: 'suna', name: 'Suna Suna (Cát)', type: 'logia', tier: 'A', color: '#e2c275', desc: 'Đòn trúng giảm hồi máu 50%' },
    yami: { id: 'yami', name: 'Yami Yami (Bóng tối)', type: 'logia', tier: 'MYTHIC', color: '#4a154b', desc: 'Hút địch, vô hiệu trái địch' },

    // 6 Paramecia
    gomu: { id: 'gomu', name: 'Gomu Gomu (Cao su)', type: 'paramecia', tier: 'B', color: '#e11d48', desc: 'Miễn đạn cùn sét, Gear 2' },
    bara: { id: 'bara', name: 'Bara Bara (Chia cắt)', type: 'paramecia', tier: 'C', color: '#f97316', desc: 'Miễn sát thương chém' },
    ope: { id: 'ope', name: 'Ope Ope (Phòng mổ)', type: 'paramecia', tier: 'S', color: '#06b6d4', desc: 'Room, đổi chỗ Shambles' },
    gura: { id: 'gura', name: 'Gura Gura (Chấn động)', type: 'paramecia', tier: 'MYTHIC', color: '#f8fafc', desc: 'Sóng chấn động đấm nứt không khí' },
    bomu: { id: 'bomu', name: 'Bomu Bomu (Bom)', type: 'paramecia', tier: 'C', color: '#ea580c', desc: 'Chạm là nổ, tự nổ AoE' },
    bari: { id: 'bari', name: 'Bari Bari (Rào chắn)', type: 'paramecia', tier: 'B', color: '#22c55e', desc: 'Khiên chắn đạn phía trước' },

    // 4 Zoan
    neko_leopard: { id: 'neko_leopard', name: 'Neko Neko (Báo)', type: 'zoan', tier: 'A', color: '#eab308', desc: 'Tốc độ +15%, vồ mồi chém liên hoàn' },
    hito_reindeer: { id: 'hito_reindeer', name: 'Hito Hito (Tuần lộc)', type: 'zoan', tier: 'B', color: '#854d0e', desc: 'Tự hồi 1 máu/s, dạng quái vật' },
    tori_phoenix: { id: 'tori_phoenix', name: 'Tori Tori (Phượng hoàng)', type: 'zoan', tier: 'MYTHIC', color: '#38bdf8', desc: 'Lửa xanh, bay, hồi đầy máu' }
  };

  S.FRUITS = Object.freeze(FRUITS);

  // Trai roi o dau theo bac (CONTEXT muc 9): mat dat/trong nha C-B, ruong B-A, boss A-S, thinh S-MYTHIC.
  // Moi tran moi trai chi co 1 qua; server chon nguon cho tung trai tu bang nay.
  S.FRUIT_SOURCES = Object.freeze({
    C: Object.freeze(['GROUND']),
    B: Object.freeze(['GROUND', 'CHEST']),
    A: Object.freeze(['CHEST', 'BOSS']),
    S: Object.freeze(['BOSS', 'AIRDROP']),
    MYTHIC: Object.freeze(['AIRDROP'])
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
