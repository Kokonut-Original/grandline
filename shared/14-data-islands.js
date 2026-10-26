// shared/14-data-islands.js
// Du lieu tinh cua 10 dao (ten, ban kinh, biome, boss va dac diem).
// Vi tri va hinh dang (cx, cy, ux, uy, k, warp) do shared/21-mapgen.js tinh theo seed, nam trong map.islands.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;

  // 9 dao con lai (ban kinh 24-30 tile), mapgen rai theo seed
  const SATELLITE_DEFS = [
    { id: 'desert', name: 'Đảo Sa Mạc', radius: 28, baseTile: T.SAND, subTile: T.QUICKSAND, boss: 'giant_croc', desc: 'Cát lún đi chậm, ít chỗ nấp' },
    { id: 'winter', name: 'Đảo Băng', radius: 25, baseTile: T.SNOW, subTile: T.ICE, boss: 'snow_rabbit', desc: 'Mặt băng trơn trượt có quán tính' },
    { id: 'jungle', name: 'Rừng Cổ Đại', radius: 29, baseTile: T.GRASS, subTile: T.DIRT, boss: 'trex', desc: 'Cây rậm rạp che khuất tầm nhìn' },
    { id: 'canal_city', name: 'Thành phố Kênh', radius: 27.5, baseTile: T.FLOOR, subTile: T.WOOD, boss: 'cp_agent', desc: 'Kênh nước nông xen kẽ phố xá' },
    { id: 'fire_ice', name: 'Đảo Lửa-Băng', radius: 27, baseTile: T.LAVA, subTile: T.ICE, boss: 'dragon', desc: 'Nửa dung nham rực cháy, nửa băng giá' },
    { id: 'ghost', name: 'Đảo Ma', radius: 24, baseTile: T.DIRT, subTile: T.STONE, boss: 'zombie_general', desc: 'Sương mù dày đặc che giảm tầm nhìn' },
    { id: 'mangrove', name: 'Quần đảo Rễ Cây', radius: 30, baseTile: T.GRASS, subTile: T.SHALLOW, boss: 'pacifista', desc: 'Nhiều đảo nhỏ kết nối bằng cầu' },
    { id: 'samurai', name: 'Đảo Samurai', radius: 26, baseTile: T.GRASS, subTile: T.WOOD, boss: 'samurai', desc: 'Đền cổ kính và cầu gỗ hoa anh đào' },
    { id: 'giant', name: 'Đảo Khổng Lồ', radius: 28.5, baseTile: T.GRASS, subTile: T.STONE, boss: 'giant_warrior', desc: 'Cây cối và công trình khổng lồ' }
  ];

  const ISLANDS = {
    // 1. Dao trung tam (mapgen luon dat o tam ban do)
    fortress: {
      id: 'fortress',
      name: 'Pháo đài Trung Tâm',
      radius: 32,
      baseTile: T.STONE,
      subTile: T.FLOOR,
      boss: 'vice_admiral',
      desc: 'Tường thành kiên cố và quảng trường trung tâm',
      props: { trees: 8, houses: 3, chests: 9 }
    }
  };

  // 2. 9 dao con lai
  for (let i = 0; i < SATELLITE_DEFS.length; i++) {
    const def = SATELLITE_DEFS[i];
    ISLANDS[def.id] = {
      id: def.id,
      name: def.name,
      radius: def.radius,
      baseTile: def.baseTile,
      subTile: def.subTile,
      boss: def.boss,
      desc: def.desc,
      props: {
        trees: Math.round(def.radius * 0.35),
        houses: (def.id === 'canal_city' || def.id === 'giant') ? 3 : 2,
        chests: 5
      }
    };
  }

  S.ISLANDS = Object.freeze(ISLANDS);

})(typeof globalThis !== 'undefined' ? globalThis : window);
