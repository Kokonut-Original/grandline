// client/js/02g-tiles-paint.js
// Ve tile nen bang thu tuc (ky thuat Mini Dungeon, ART-REF F1 hang 4 va 6): mau nen gan don sac thay doi
// theo vung lon (nhieu), chi tiet thua theo hash2, chi tiet rieng tung biome, nuoc nhieu dai do sau,
// va chieu sau 2.5D: vach bo + bong do xuong nuoc, tuong co mat dung, ria sang/toi theo nguon sang tren-trai.
// Ket qua duoc 05a nuong vao chunk 16x16 tile; phan chuyen dong (gon song, bot) ve moi khung o 05a.
// Phu thuoc: client/js/02b-palette.js, shared/02-enums.js, shared/21-mapgen.js (S.MAPGEN.noise).

(function (root) {
  'use strict';

  const OP = root.OP = root.OP || {};
  const S = root.OP_SHARED || {};
  const T = S.TILE || {};
  const PAL = OP.PAL || {};
  const TER = PAL.TERRAIN || {};
  const SPR = OP.SPR = OP.SPR || {};

  const TP = 16;
  const N = (S.CONST && S.CONST.MAP_TILES) || 320;

  // Hash 2D giong ART-REF muc 31 (chi dung o client)
  function hash2(x, y) {
    let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function tint(hex, f) {
    return PAL.tintColor ? PAL.tintColor(hex, f) : hex;
  }

  function pal(name) {
    return TER[name] || { shadow: '#333333', mid: '#555555', high: '#777777', accent: '#999999' };
  }

  // Mau nuoc theo dai do sau (0 = sat bo ... 5 = bien khoi): tu nong sang toi dan
  const WATER_BANDS = [
    tint(pal('SHALLOW').high, 0.92),
    pal('SHALLOW').mid,
    tint(pal('SHALLOW').mid, 0.8),
    pal('DEEP').high,
    pal('DEEP').mid,
    tint(pal('DEEP').mid, 0.86)
  ];

  // Mat vach bo theo loai dat (mau dat lo ra khi nhin tu tren xuong)
  function cliffColors(t) {
    if (t === T.STONE || t === T.FLOOR || t === T.WALL) return [pal('STONE').shadow, tint(pal('STONE').shadow, 0.7)];
    if (t === T.SNOW || t === T.ICE) return [pal('SNOW').shadow, tint(pal('SNOW').shadow, 0.78)];
    if (t === T.LAVA) return [tint(pal('STONE').shadow, 0.8), tint(pal('STONE').shadow, 0.55)];
    return [pal('DIRT').mid, pal('DIRT').shadow];
  }

  function isWater(t) {
    return t === T.DEEP || t === T.SHALLOW;
  }

  function tileAt(map, tx, ty) {
    if (!map || tx < 0 || ty < 0 || tx >= N || ty >= N) return T.DEEP;
    return map.tiles[ty * N + tx];
  }

  // O cay/nha la vat the (ve o 05b); nen duoi chung lay theo o dat ben canh
  function groundUnder(map, tx, ty) {
    const nb = [tileAt(map, tx, ty + 1), tileAt(map, tx - 1, ty), tileAt(map, tx + 1, ty), tileAt(map, tx, ty - 1)];
    for (let i = 0; i < nb.length; i++) {
      const t = nb[i];
      if (!isWater(t) && t !== T.TREE && t !== T.HOUSE_WALL && t !== T.WALL && t !== T.DOCK && t !== T.BRIDGE) return t;
    }
    return T.GRASS;
  }

  // ---------- Nen dat ----------

  // Nen gan don sac: 2 sac do theo nhieu vung lon (khong theo tung o) -> mat dat khong bi o vuong
  function baseFill(g, p, px, py, tx, ty) {
    const macro = S.MAPGEN && S.MAPGEN.noise ? S.MAPGEN.noise(tx, ty, 6, 911) : 0.5;
    g.fillStyle = macro > 0.62 ? tint(p.mid, 1.05) : (macro < 0.36 ? tint(p.mid, 0.95) : p.mid);
    g.fillRect(px, py, TP, TP);
  }

  function dot(g, color, x, y, w, h) {
    g.fillStyle = color;
    g.fillRect(x, y, w || 1, h || 1);
  }

  function paintGrass(g, px, py, tx, ty, r) {
    const p = pal('GRASS');
    baseFill(g, p, px, py, tx, ty);
    const ox = px + 3 + Math.floor(r * 97) % 9;
    const oy = py + 4 + Math.floor(r * 53) % 8;
    if (r < 0.14) {
      // Khom co: 2-3 ngon, ngon sang, goc toi
      dot(g, p.high, ox, oy, 1, 2);
      dot(g, p.high, ox + 2, oy - 1, 1, 3);
      dot(g, p.shadow, ox, oy + 2, 3, 1);
    } else if (r > 0.965) {
      // Hoa nho
      dot(g, '#f6f2e8', ox, oy, 2, 1);
      dot(g, p.accent, ox, oy + 1, 1, 1);
    } else if (r > 0.92) {
      dot(g, p.shadow, ox, oy, 2, 1);
    }
  }

  function paintSand(g, px, py, tx, ty, r) {
    const p = pal('SAND');
    baseFill(g, p, px, py, tx, ty);
    if (r < 0.18) {
      // Gon cat do gio
      const y = py + 4 + Math.floor(r * 61) % 9;
      const x = px + 2 + Math.floor(r * 37) % 6;
      dot(g, p.high, x, y, 5, 1);
      dot(g, p.shadow, x + 1, y + 1, 4, 1);
    } else if (r > 0.95) {
      dot(g, p.shadow, px + 6 + Math.floor(r * 17) % 5, py + 9, 2, 1);
      dot(g, p.accent, px + 6 + Math.floor(r * 17) % 5, py + 8, 1, 1);
    }
  }

  function paintDirt(g, px, py, tx, ty, r) {
    const p = pal('DIRT');
    baseFill(g, p, px, py, tx, ty);
    if (r < 0.2) {
      const x = px + 2 + Math.floor(r * 113) % 11;
      const y = py + 3 + Math.floor(r * 71) % 10;
      dot(g, p.high, x, y, 2, 1);
      dot(g, p.shadow, x, y + 1, 2, 1);
    } else if (r > 0.9) {
      dot(g, p.shadow, px + 4, py + 7 + Math.floor(r * 29) % 5, 3, 1);
      dot(g, p.shadow, px + 6, py + 8 + Math.floor(r * 29) % 5, 2, 1);
    }
  }

  // Da lat: vien gach so le theo hang, mau gach doi nhe theo hash
  function paintStone(g, px, py, tx, ty, r, p) {
    baseFill(g, p, px, py, tx, ty);
    const off = (ty % 2) ? 8 : 0;
    g.fillStyle = tint(p.shadow, 1.08);
    g.fillRect(px, py + 7, TP, 1);
    g.fillRect(px, py + 15, TP, 1);
    g.fillRect(px + ((off + 4) % TP), py, 1, 7);
    g.fillRect(px + ((off + 12) % TP), py + 8, 1, 7);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.fillRect(px, py, TP, 1);
    g.fillRect(px, py + 8, TP, 1);
    if (r > 0.86) dot(g, p.shadow, px + 2 + Math.floor(r * 43) % 10, py + 3, 2, 1);
  }

  function paintSnow(g, px, py, tx, ty, r) {
    const p = pal('SNOW');
    baseFill(g, p, px, py, tx, ty);
    if (r < 0.12) dot(g, p.shadow, px + 3 + Math.floor(r * 91) % 9, py + 5 + Math.floor(r * 37) % 7, 3, 1);
    else if (r > 0.94) dot(g, '#ffffff', px + 4 + Math.floor(r * 23) % 8, py + 4, 1, 1);
  }

  function paintIce(g, px, py, tx, ty, r) {
    const p = pal('ICE');
    baseFill(g, p, px, py, tx, ty);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    const k = Math.floor(r * 7);
    for (let i = 0; i < 4; i++) g.fillRect(px + k + i * 2, py + 10 - i * 2, 2, 1);
    if (r > 0.85) {
      dot(g, p.shadow, px + 3, py + 4, 4, 1);
      dot(g, p.shadow, px + 6, py + 5, 1, 2);
    }
  }

  function paintLava(g, px, py, tx, ty, r) {
    const p = pal('LAVA');
    baseFill(g, p, px, py, tx, ty);
    g.fillStyle = p.high;
    g.fillRect(px + 2 + Math.floor(r * 5), py + 3 + Math.floor(r * 7) % 4, 5, 3);
    dot(g, p.accent, px + 3 + Math.floor(r * 5), py + 4 + Math.floor(r * 7) % 4, 2, 1);
    if (r > 0.6) dot(g, p.shadow, px + 9, py + 10, 4, 2);
  }

  function paintQuicksand(g, px, py, tx, ty, r) {
    const p = pal('QUICKSAND');
    baseFill(g, p, px, py, tx, ty);
    // Vong xoay lun
    g.strokeStyle = p.shadow;
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(px + 8.5, py + 8.5, 4 + Math.floor(r * 2), 2.5, 0, 0, Math.PI * 2);
    g.stroke();
    dot(g, p.high, px + 7, py + 7, 2, 1);
  }

  // Van go (san go, ben, cau): huong van theo truc, khe toi giua cac tam
  function paintPlanks(g, px, py, tx, ty, r, p, vertical) {
    g.fillStyle = p.mid;
    g.fillRect(px, py, TP, TP);
    g.fillStyle = p.shadow;
    for (let i = 0; i < 4; i++) {
      if (vertical) g.fillRect(px + i * 4 + 3, py, 1, TP);
      else g.fillRect(px, py + i * 4 + 3, TP, 1);
    }
    g.fillStyle = p.high;
    for (let i = 0; i < 4; i++) {
      if (vertical) g.fillRect(px + i * 4, py, 1, TP);
      else g.fillRect(px, py + i * 4, TP, 1);
    }
    // Dinh
    g.fillStyle = p.shadow;
    if (vertical) g.fillRect(px + 1 + Math.floor(r * 3) * 4, py + 7, 1, 1);
    else g.fillRect(px + 7, py + 1 + Math.floor(r * 3) * 4, 1, 1);
  }

  // ---------- Nuoc ----------

  function paintWater(g, px, py, tx, ty, r, depth) {
    const band = Math.min(WATER_BANDS.length - 1, depth);
    g.fillStyle = WATER_BANDS[band];
    g.fillRect(px, py, TP, TP);
    // Dai chuyen tiep: ria 2px cua o sang hon tran sang o dai sau hon (dithering nhe kieu pixel art)
    if (band > 0 && r < 0.35) {
      g.fillStyle = WATER_BANDS[band - 1];
      g.fillRect(px + Math.floor(r * 40) % 12, py + Math.floor(r * 70) % 14, 3, 1);
    }
  }

  // ---------- Tuong ----------

  // Tuong nhin tu tren: mat tren sang; neu o duoi khong phai tuong thi lo mat dung gach (2.5D)
  function paintWall(g, map, px, py, tx, ty) {
    const p = pal('WALL');
    const below = tileAt(map, tx, ty + 1);
    const faceVisible = below !== T.WALL;
    g.fillStyle = p.high;
    g.fillRect(px, py, TP, TP);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(px, py, TP, 1);
    if (faceVisible) {
      g.fillStyle = p.mid;
      g.fillRect(px, py + 7, TP, 9);
      g.fillStyle = p.shadow;
      g.fillRect(px, py + 11, TP, 1);
      g.fillRect(px + ((tx % 2) ? 5 : 11), py + 7, 1, 4);
      g.fillRect(px + ((tx % 2) ? 11 : 5), py + 12, 1, 4);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(px, py + 14, TP, 2);
    }
    if (tileAt(map, tx - 1, ty) !== T.WALL) {
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(px, py, 1, TP);
    }
  }

  // ---------- Chieu sau o mep ----------

  // Vach bo: o dat co nuoc ngay ben duoi -> 5px duoi la mat vach dat (nguon sang tu tren nen mat vach toi)
  function paintEdges(g, map, px, py, tx, ty, t) {
    const up = tileAt(map, tx, ty - 1);
    const down = tileAt(map, tx, ty + 1);
    const left = tileAt(map, tx - 1, ty);
    const right = tileAt(map, tx + 1, ty);

    if (isWater(t)) {
      // Bong cua vach/bo do xuong mat nuoc (o nuoc ngay duoi dat)
      if (!isWater(up) && up !== T.DOCK && up !== T.BRIDGE) {
        g.fillStyle = 'rgba(8,16,40,0.32)';
        g.fillRect(px, py, TP, 3);
      }
      if (!isWater(left) && left !== T.DOCK && left !== T.BRIDGE) {
        g.fillStyle = 'rgba(8,16,40,0.18)';
        g.fillRect(px, py, 2, TP);
      }
      return;
    }
    if (t === T.DOCK || t === T.BRIDGE || t === T.WALL) return;

    const beach = (t === T.SAND || t === T.QUICKSAND);
    if (isWater(down)) {
      if (beach) {
        // Bai cat thoai: cat uot sam hon sat mep nuoc
        g.fillStyle = pal('SAND').shadow;
        g.fillRect(px, py + 13, TP, 3);
      } else {
        const c = cliffColors(t);
        g.fillStyle = c[0];
        g.fillRect(px, py + 11, TP, 5);
        g.fillStyle = c[1];
        g.fillRect(px, py + 14, TP, 2);
        g.fillRect(px + 3 + (tx % 3) * 4, py + 12, 1, 2);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fillRect(px, py + 10, TP, 1);
      }
    }
    if (isWater(up)) {
      g.fillStyle = beach ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.22)';
      g.fillRect(px, py, TP, 1);
    }
    if (isWater(left)) {
      g.fillStyle = beach ? pal('SAND').shadow : 'rgba(255,255,255,0.14)';
      g.fillRect(px, py, beach ? 2 : 1, TP);
    }
    if (isWater(right)) {
      g.fillStyle = beach ? pal('SAND').shadow : 'rgba(0,0,0,0.28)';
      g.fillRect(px + TP - 2, py, 2, TP);
    }

    // Co phu xuong bai cat: o cat co co ngay tren -> ria co rang cua
    if (beach && up === T.GRASS) {
      const gp = pal('GRASS');
      g.fillStyle = gp.mid;
      for (let i = 0; i < TP; i += 2) {
        const h = 1 + Math.floor(hash2(tx * 16 + i, ty) * 3);
        g.fillRect(px + i, py, 2, h);
      }
      g.fillStyle = gp.shadow;
      g.fillRect(px, py, TP, 1);
    }
  }

  /**
   * Ve 1 tile nen tai (px, py) tren canvas chunk g.
   * depth: khoang cach toi dat (chi dung cho o nuoc), tinh san o 05a.
   */
  SPR.paintTile = function (g, map, tx, ty, px, py, depth) {
    let t = tileAt(map, tx, ty);
    const r = hash2(tx, ty);
    if (t === T.TREE || t === T.HOUSE_WALL) t = groundUnder(map, tx, ty);

    switch (t) {
      case T.DEEP:
      case T.SHALLOW:
        paintWater(g, px, py, tx, ty, r, depth || 0);
        break;
      case T.GRASS: paintGrass(g, px, py, tx, ty, r); break;
      case T.SAND: paintSand(g, px, py, tx, ty, r); break;
      case T.DIRT: paintDirt(g, px, py, tx, ty, r); break;
      case T.STONE: paintStone(g, px, py, tx, ty, r, pal('STONE')); break;
      case T.FLOOR: paintStone(g, px, py, tx, ty, r, pal('FLOOR')); break;
      case T.SNOW: paintSnow(g, px, py, tx, ty, r); break;
      case T.ICE: paintIce(g, px, py, tx, ty, r); break;
      case T.LAVA: paintLava(g, px, py, tx, ty, r); break;
      case T.QUICKSAND: paintQuicksand(g, px, py, tx, ty, r); break;
      case T.WOOD: paintPlanks(g, px, py, tx, ty, r, pal('WOOD'), false); break;
      case T.WALL: paintWall(g, map, px, py, tx, ty); break;
      case T.DOCK:
      case T.BRIDGE: {
        // Van chay theo huong cau: hang xom doc la cau/ben thi van doc
        const vert = [T.DOCK, T.BRIDGE].indexOf(tileAt(map, tx, ty - 1)) !== -1 ||
          [T.DOCK, T.BRIDGE].indexOf(tileAt(map, tx, ty + 1)) !== -1;
        paintPlanks(g, px, py, tx, ty, r, pal(t === T.DOCK ? 'DOCK' : 'BRIDGE'), !vert);
        // Mep cau tren nuoc co bong ben duoi
        if (isWater(tileAt(map, tx, ty + 1))) {
          g.fillStyle = 'rgba(0,0,0,0.35)';
          g.fillRect(px, py + 14, TP, 2);
        }
        break;
      }
      default:
        paintGrass(g, px, py, tx, ty, r);
    }

    paintEdges(g, map, px, py, tx, ty, t);
  };

  SPR.hash2 = hash2;
  SPR.WATER_BANDS = WATER_BANDS;
})(typeof window !== 'undefined' ? window : globalThis);
