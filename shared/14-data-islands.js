// shared/14-data-islands.js
// Du lieu dinh nghia 10 dao tren ban do (toa do tam, ban kinh, biome, boss va dac diem).
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;

  // Tam ban do 320x320 la (160, 160)
  const CENTER_X = 160;
  const CENTER_Y = 160;
  const ORBIT_RADIUS = 105;

  // 9 dao ve tinh xep vong quanh tam ban do
  const SATELLITE_DEFS = [
    { id: 'desert', name: 'Đảo Sa Mạc', radius: 18, baseTile: T.SAND, subTile: T.QUICKSAND, boss: 'giant_croc', desc: 'Cát lún đi chậm, ít chỗ nấp' },
    { id: 'winter', name: 'Đảo Băng', radius: 17, baseTile: T.SNOW, subTile: T.ICE, boss: 'snow_rabbit', desc: 'Mặt băng trơn trượt có quán tính' },
    { id: 'jungle', name: 'Rừng Cổ Đại', radius: 20, baseTile: T.GRASS, subTile: T.DIRT, boss: 'trex', desc: 'Cây rậm rạp che khuất tầm nhìn' },
    { id: 'canal_city', name: 'Thành phố Kênh', radius: 19, baseTile: T.FLOOR, subTile: T.WOOD, boss: 'cp_agent', desc: 'Kênh nước nông xen kẽ phố xá' },
    { id: 'fire_ice', name: 'Đảo Lửa-Băng', radius: 18, baseTile: T.LAVA, subTile: T.ICE, boss: 'dragon', desc: 'Nửa dung nham rực cháy, nửa băng giá' },
    { id: 'ghost', name: 'Đảo Ma', radius: 16, baseTile: T.DIRT, subTile: T.STONE, boss: 'zombie_general', desc: 'Sương mù dày đặc che giảm tầm nhìn' },
    { id: 'mangrove', name: 'Quần đảo Rễ Cây', radius: 21, baseTile: T.GRASS, subTile: T.SHALLOW, boss: 'pacifista', desc: 'Nhiều đảo nhỏ kết nối bằng cầu' },
    { id: 'samurai', name: 'Đảo Samurai', radius: 17, baseTile: T.GRASS, subTile: T.WOOD, boss: 'samurai', desc: 'Đền cổ kính và cầu gỗ hoa anh đào' },
    { id: 'giant', name: 'Đảo Khổng Lồ', radius: 20, baseTile: T.GRASS, subTile: T.STONE, boss: 'giant_warrior', desc: 'Cây cối và công trình khổng lồ' }
  ];

  const ISLANDS = {
    // 1. Dao trung tam o chinh giua
    fortress: {
      id: 'fortress',
      name: 'Pháo đài Trung Tâm',
      cx: CENTER_X,
      cy: CENTER_Y,
      radius: 22,
      baseTile: T.STONE,
      subTile: T.FLOOR,
      boss: 'vice_admiral',
      desc: 'Tường thành kiên cố và quảng trường trung tâm'
    }
  };

  // 2. Tinh toan toa do cho 9 dao ve tinh
  const stepAngle = (Math.PI * 2) / 9;
  for (let i = 0; i < SATELLITE_DEFS.length; i++) {
    const def = SATELLITE_DEFS[i];
    const angle = i * stepAngle;
    const cx = Math.round(CENTER_X + Math.cos(angle) * ORBIT_RADIUS);
    const cy = Math.round(CENTER_Y + Math.sin(angle) * ORBIT_RADIUS);

    ISLANDS[def.id] = {
      id: def.id,
      name: def.name,
      cx: cx,
      cy: cy,
      radius: def.radius,
      baseTile: def.baseTile,
      subTile: def.subTile,
      boss: def.boss,
      desc: def.desc
    };
  }

  S.ISLANDS = Object.freeze(ISLANDS);

})(typeof globalThis !== 'undefined' ? globalThis : window);
