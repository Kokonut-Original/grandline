// shared/10-data-fruits.js
// Du lieu dinh nghia 29 trai ac quy trong One Piece Battleground.
// Phu thuoc: shared/00-namespace.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};

  const FRUITS = {
    // 10 Logia
    mera: { id: 'mera', name: 'Mera Mera (Lửa)', type: 'logia', tier: 'A', color: '#ff5a1f', desc: 'Đòn gây bỏng 3s' },
    magu: { id: 'magu', name: 'Magu Magu (Dung nham)', type: 'logia', tier: 'S', color: '#c2185b', desc: 'Để lại vũng dung nham 4s' },
    hie: { id: 'hie', name: 'Hie Hie (Băng)', type: 'logia', tier: 'A', color: '#8fe3ff', desc: 'Đòn làm chậm 30%' },
    goro: { id: 'goro', name: 'Goro Goro (Sét)', type: 'logia', tier: 'S', color: '#fff35a', desc: 'Đòn đánh nhanh, tia sét' },
    pika: { id: 'pika', name: 'Pika Pika (Ánh sáng)', type: 'logia', tier: 'S', color: '#fffbd0', desc: 'Nhanh nhất game, laser' },
    suna: { id: 'suna', name: 'Suna Suna (Cát)', type: 'logia', tier: 'A', color: '#e2c275', desc: 'Đòn trúng giảm hồi máu 50%' },
    moku: { id: 'moku', name: 'Moku Moku (Khói)', type: 'logia', tier: 'B', color: '#b0b0b0', desc: 'Đòn trói làm chậm' },
    gasu: { id: 'gasu', name: 'Gasu Gasu (Khí độc)', type: 'logia', tier: 'A', color: '#9be564', desc: 'Đòn gây độc diện rộng' },
    yuki: { id: 'yuki', name: 'Yuki Yuki (Tuyết)', type: 'logia', tier: 'B', color: '#f0faff', desc: 'Bão tuyết làm chậm' },
    yami: { id: 'yami', name: 'Yami Yami (Bóng tối)', type: 'logia', tier: 'MYTHIC', color: '#4a154b', desc: 'Hút địch, vô hiệu trái địch' },

    // 13 Paramecia
    gomu: { id: 'gomu', name: 'Gomu Gomu (Cao su)', type: 'paramecia', tier: 'B', color: '#e11d48', desc: 'Miễn đạn cùn sét, Gear 2' },
    bara: { id: 'bara', name: 'Bara Bara (Chia cắt)', type: 'paramecia', tier: 'C', color: '#f97316', desc: 'Miễn sát thương chém' },
    ope: { id: 'ope', name: 'Ope Ope (Phòng mổ)', type: 'paramecia', tier: 'S', color: '#06b6d4', desc: 'Room, đổi chỗ Shambles' },
    gura: { id: 'gura', name: 'Gura Gura (Chấn động)', type: 'paramecia', tier: 'MYTHIC', color: '#f8fafc', desc: 'Sóng chấn động đấm nứt không khí' },
    hana: { id: 'hana', name: 'Hana Hana (Mọc tay)', type: 'paramecia', tier: 'B', color: '#ec4899', desc: 'Mọc tay trói địch từ xa' },
    bomu: { id: 'bomu', name: 'Bomu Bomu (Bom)', type: 'paramecia', tier: 'C', color: '#ea580c', desc: 'Chạm là nổ, tự nổ AoE' },
    supa: { id: 'supa', name: 'Supa Supa (Lưỡi dao)', type: 'paramecia', tier: 'B', color: '#94a3b8', desc: 'Thân thép, bão lưỡi dao' },
    doru: { id: 'doru', name: 'Doru Doru (Sáp)', type: 'paramecia', tier: 'B', color: '#fef08a', desc: 'Tường sáp, áo giáp sáp' },
    ito: { id: 'ito', name: 'Ito Ito (Chỉ)', type: 'paramecia', tier: 'A', color: '#e0e7ff', desc: 'Dây chỉ chém, lồng chim' },
    nikyu: { id: 'nikyu', name: 'Nikyu Nikyu (Bàn tay đẩy)', type: 'paramecia', tier: 'A', color: '#f472b6', desc: 'Đẩy bật đòn đánh, phóng người' },
    bari: { id: 'bari', name: 'Bari Bari (Rào chắn)', type: 'paramecia', tier: 'B', color: '#22c55e', desc: 'Khiên chắn đạn phía trước' },
    mochi: { id: 'mochi', name: 'Mochi Mochi (Bánh dày)', type: 'paramecia', tier: 'A', color: '#fdba74', desc: 'Biến dạng né đòn, dính chân địch' },
    horo: { id: 'horo', name: 'Horo Horo (Bóng ma)', type: 'paramecia', tier: 'B', color: '#d8b4fe', desc: 'Ma tiêu cực làm địch đứng yên' },

    // 6 Zoan
    neko_leopard: { id: 'neko_leopard', name: 'Neko Neko (Báo)', type: 'zoan', tier: 'A', color: '#eab308', desc: 'Tốc độ +15%, vồ mồi chém liên hoàn' },
    ryu_allosaurus: { id: 'ryu_allosaurus', name: 'Ryu Ryu (Khủng long)', type: 'zoan', tier: 'A', color: '#15803d', desc: 'Máu +30, cắn, húc biến hình' },
    hito_reindeer: { id: 'hito_reindeer', name: 'Hito Hito (Tuần lộc)', type: 'zoan', tier: 'B', color: '#854d0e', desc: 'Tự hồi 1 máu/s, dạng quái vật' },
    tori_phoenix: { id: 'tori_phoenix', name: 'Tori Tori (Phượng hoàng)', type: 'zoan', tier: 'MYTHIC', color: '#38bdf8', desc: 'Lửa xanh, bay, hồi đầy máu' },
    uo_seiryu: { id: 'uo_seiryu', name: 'Uo Uo (Thanh Long)', type: 'zoan', tier: 'MYTHIC', color: '#0284c7', desc: 'Máu +40, phun lửa, lốc xoáy' },
    tori_falcon: { id: 'tori_falcon', name: 'Tori Tori (Chim ưng)', type: 'zoan', tier: 'B', color: '#a16207', desc: 'Bay ngắn, bổ nhào, lốc cánh' }
  };

  S.FRUITS = Object.freeze(FRUITS);

})(typeof globalThis !== 'undefined' ? globalThis : window);
