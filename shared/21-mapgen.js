// shared/21-mapgen.js
// Sinh ban do 320x320 tile tu seed gom 10 dao, cay coi, nha cua, ruong bau, boss spawn va ben thuyen.
// Phu thuoc: shared/00-namespace.js, shared/01-constants.js, shared/02-enums.js, shared/05-rng.js, shared/14-data-islands.js.

(function (root) {
  'use strict';

  const S = root.OP_SHARED = root.OP_SHARED || {};
  const T = S.TILE;
  const CONST = S.CONST || { MAP_TILES: 320 };

  const MAP_W = CONST.MAP_TILES || 320;
  const MAP_H = CONST.MAP_TILES || 320;

  function fnv1a(uint8Arr) {
    let hash = 2166136261;
    for (let i = 0; i < uint8Arr.length; i++) {
      hash ^= uint8Arr[i];
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function generate(seed) {
    const s = (typeof seed === 'number') ? seed : 1;
    const rng = (S.RNG && S.RNG.create) ? S.RNG.create(s) : {
      next: function () { return 0.5; }
    };

    const totalTiles = MAP_W * MAP_H;
    const tiles = new Uint8Array(totalTiles);
    tiles.fill(T.DEEP);

    const islands = S.ISLANDS || {};
    const docks = [];
    const spawns = [];
    const trees = [];
    const houses = [];
    const chests = [];
    const bosses = [];

    // Duyet qua tung dao va tao dia hinh
    for (const key in islands) {
      const isl = islands[key];
      const cx = isl.cx;
      const cy = isl.cy;
      const baseR = isl.radius;

      const p1 = rng.next() * Math.PI * 2;
      const p2 = rng.next() * Math.PI * 2;
      const p3 = rng.next() * Math.PI * 2;
      const shallowWidth = 3;

      const boundR = Math.ceil(baseR + shallowWidth + 4);
      const minX = Math.max(1, cx - boundR);
      const maxX = Math.min(MAP_W - 2, cx + boundR);
      const minY = Math.max(1, cy - boundR);
      const maxY = Math.min(MAP_H - 2, cy + boundR);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const angle = Math.atan2(dy, dx);

          const wave = 1.0 +
            0.14 * Math.sin(3 * angle + p1) +
            0.08 * Math.cos(5 * angle + p2) +
            0.04 * Math.sin(7 * angle + p3);

          const rCoast = baseR * wave;
          const dist = Math.hypot(dx, dy);
          const idx = y * MAP_W + x;

          if (dist <= rCoast) {
            let tileType = isl.baseTile;

            if (isl.id === 'fire_ice') {
              tileType = (dx > 0) ? T.LAVA : T.ICE;
            } else if (isl.id === 'canal_city') {
              if (Math.abs(dx) <= 1 || Math.abs(dy) <= 1) {
                tileType = T.SHALLOW;
              } else if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
                tileType = T.BRIDGE;
              } else {
                tileType = T.FLOOR;
              }
            } else if (isl.id === 'fortress') {
              if (dist >= rCoast - 2 && dist <= rCoast) {
                tileType = T.WALL;
              } else {
                tileType = (dist <= baseR * 0.4) ? T.FLOOR : T.STONE;
              }
            } else if (isl.id === 'desert') {
              tileType = (dist <= baseR * 0.35) ? T.QUICKSAND : T.SAND;
            } else if (isl.id === 'mangrove') {
              if (dist >= baseR * 0.4 && dist <= baseR * 0.6) {
                if (Math.abs(dx) <= 1 || Math.abs(dy) <= 1) {
                  tileType = T.BRIDGE;
                } else {
                  tileType = T.SHALLOW;
                }
              } else {
                tileType = T.GRASS;
              }
            } else if (isl.subTile && dist <= baseR * 0.45) {
              tileType = isl.subTile;
            }

            tiles[idx] = tileType;

          } else if (dist <= rCoast + shallowWidth) {
            if (tiles[idx] === T.DEEP) {
              tiles[idx] = T.SHALLOW;
            }
          }
        }
      }

      // 1. Diem spawn nguoi choi
      spawns.push({
        islandId: isl.id,
        tx: cx,
        ty: cy,
        x: cx * 16 + 8,
        y: cy * 16 + 8
      });

      // 2. Diem spawn Boss cua dao
      if (isl.boss) {
        const bAngle = rng.next() * Math.PI * 2;
        const bDist = baseR * 0.45;
        const btx = Math.round(cx + Math.cos(bAngle) * bDist);
        const bty = Math.round(cy + Math.sin(bAngle) * bDist);
        bosses.push({
          id: isl.boss,
          islandId: isl.id,
          tx: btx,
          ty: bty,
          x: btx * 16 + 8,
          y: bty * 16 + 8
        });
      }

      // 3. Ben thuyen (dock) - Dat dung o ria bo bien
      const dockAngles = (isl.id === 'fortress')
        ? [Math.PI / 2, -Math.PI / 2]
        : [Math.atan2(cy - 160, cx - 160)];

      for (let di = 0; di < dockAngles.length; di++) {
        const dAng = dockAngles[di];
        const wDock = 1.0 +
          0.14 * Math.sin(3 * dAng + p1) +
          0.08 * Math.cos(5 * dAng + p2) +
          0.04 * Math.sin(7 * dAng + p3);
        const dockDist = Math.round(baseR * wDock);
        const dockX = Math.round(cx + Math.cos(dAng) * dockDist);
        const dockY = Math.round(cy + Math.sin(dAng) * dockDist);

        for (let dy = 0; dy <= 1; dy++) {
          for (let dx = 0; dx <= 1; dx++) {
            const dtx = dockX + dx;
            const dty = dockY + dy;
            if (dtx >= 0 && dtx < MAP_W && dty >= 0 && dty < MAP_H) {
              tiles[dty * MAP_W + dtx] = T.DOCK;
            }
          }
        }

        docks.push({
          islandId: isl.id,
          tx: dockX,
          ty: dockY,
          x: dockX * 16 + 8,
          y: dockY * 16 + 8
        });
      }

      // 4. Cay coi theo biome (scale theo dien tich moi: 8-11 cay moi dao)
      let treeType = 'tree_palm';
      if (isl.id === 'winter') treeType = 'tree_pine';
      else if (isl.id === 'jungle' || isl.id === 'giant') treeType = 'tree_jungle';

      const treeCount = (isl.props && isl.props.trees) ? isl.props.trees : Math.round(baseR * 0.35);
      for (let i = 0; i < treeCount; i++) {
        const tAng = (i / treeCount) * Math.PI * 2 + rng.next() * 0.4;
        let tDist = baseR * (0.35 + rng.next() * 0.4);
        if (isl.id === 'mangrove' && tDist >= baseR * 0.38 && tDist <= baseR * 0.62) {
          tDist = (i % 2 === 0) ? (baseR * 0.25) : (baseR * 0.75);
        }
        const ttx = Math.round(cx + Math.cos(tAng) * tDist);
        const tty = Math.round(cy + Math.sin(tAng) * tDist);
        const tidx = tty * MAP_W + ttx;

        // Chi dat cay tren dat lien
        if (tiles[tidx] !== T.DEEP && tiles[tidx] !== T.SHALLOW && tiles[tidx] !== T.WALL && tiles[tidx] !== T.DOCK) {
          tiles[tidx] = T.TREE; // Dat vat can TREE vao ma tran
          trees.push({
            type: treeType,
            islandId: isl.id,
            tx: ttx,
            ty: tty,
            x: ttx * 16 + 8,
            y: tty * 16 + 8
          });
        }
      }

      // 5. Nha cua (2-3 nha moi dao theo dien tich moi)
      let houseType = 'house_wood';
      if (isl.id === 'fortress') houseType = 'house_stone';
      else if (isl.id === 'canal_city' || isl.id === 'samurai') houseType = 'house_small';

      const houseCount = (isl.props && isl.props.houses) ? isl.props.houses : ((isl.id === 'fortress' || isl.id === 'canal_city' || isl.id === 'giant') ? 3 : 2);
      for (let i = 0; i < houseCount; i++) {
        const hAng = (i / houseCount) * Math.PI * 2 + rng.next() * 0.4;
        let hDist = baseR * (0.28 + rng.next() * 0.35);
        if (isl.id === 'mangrove' && hDist >= baseR * 0.38 && hDist <= baseR * 0.62) {
          hDist = (i === 0) ? (baseR * 0.25) : (baseR * 0.75);
        }
        const htx = Math.round(cx + Math.cos(hAng) * hDist);
        const hty = Math.round(cy + Math.sin(hAng) * hDist);
        const hidx = hty * MAP_W + htx;

        if (tiles[hidx] !== T.DEEP && tiles[hidx] !== T.SHALLOW && tiles[hidx] !== T.WALL && tiles[hidx] !== T.DOCK && tiles[hidx] !== T.TREE) {
          tiles[hidx] = T.HOUSE_WALL;
          houses.push({
            type: houseType,
            islandId: isl.id,
            tx: htx,
            ty: hty,
            x: htx * 16 + 8,
            y: hty * 16 + 8
          });
        }
      }

      // 6. Ruong bau tren dao (scale theo dien tich: fortress 9 ruong, cac dao khac 5 ruong)
      const chestCount = (isl.props && isl.props.chests) ? isl.props.chests : ((isl.id === 'fortress') ? 9 : 5);
      for (let i = 0; i < chestCount; i++) {
        const cAng = (i / chestCount) * Math.PI * 2 + rng.next() * 0.4;
        let cDist = baseR * (0.25 + rng.next() * 0.45);
        if (isl.id === 'mangrove' && cDist >= baseR * 0.38 && cDist <= baseR * 0.62) {
          cDist = (i % 2 === 0) ? (baseR * 0.25) : (baseR * 0.75);
        }
        const ctx = Math.round(cx + Math.cos(cAng) * cDist);
        const cty = Math.round(cy + Math.sin(cAng) * cDist);
        const cidx = cty * MAP_W + ctx;

        if (tiles[cidx] !== T.DEEP && tiles[cidx] !== T.SHALLOW && tiles[cidx] !== T.WALL && tiles[cidx] !== T.DOCK && tiles[cidx] !== T.TREE && tiles[cidx] !== T.HOUSE_WALL) {
          let tier = 'wood';
          if (isl.id === 'fortress') {
            tier = (i === 0) ? 'gold' : ((i <= 4) ? 'iron' : 'wood');
          } else {
            tier = (i < 2) ? 'iron' : 'wood';
          }

          chests.push({
            id: `chest_${isl.id}_${i}`,
            tier: tier,
            islandId: isl.id,
            tx: ctx,
            ty: cty,
            x: ctx * 16 + 8,
            y: cty * 16 + 8,
            opened: false
          });
        }
      }
    }

    const hash = fnv1a(tiles);

    return {
      seed: s,
      width: MAP_W,
      height: MAP_H,
      tiles: tiles,
      hash: hash,
      islands: islands,
      docks: docks,
      spawns: spawns,
      trees: trees,
      houses: houses,
      chests: chests,
      bosses: bosses
    };
  }

  S.MAPGEN = Object.freeze({
    generate: generate,
    hash: fnv1a
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
