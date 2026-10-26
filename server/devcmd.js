// server/devcmd.js
// Lenh dev (BIEN-CHUNG muc 14). Chi chay khi server bat --dev; goi tu chat "/..." hoac act { a: 'dev', arg }.
// Hien co: /tp <islandId> | /tp <tx> <ty>. Cac lenh khac them dan theo milestone.
// Phu thuoc: shared/01-constants.js, shared/14-data-islands.js, shared/22-move.js.

'use strict';

require('../shared/00-namespace');
require('../shared/01-constants');
require('../shared/14-data-islands');
require('../shared/22-move');

const S = globalThis.OP_SHARED;
const C = S.CONST;

function hasIsland(id) {
  return !!S.ISLANDS && Object.prototype.hasOwnProperty.call(S.ISLANDS, id);
}

// Dich chuyen toi tam dao hoac toi tile; tra ve chuoi thong bao hoac null neu sai cu phap
function cmdTeleport(match, player, args) {
  if (args.length < 1) return null;

  let x;
  let y;
  let label;
  const key = String(args[0]).toLowerCase();

  if (hasIsland(key)) {
    const spot = match.world.getIslandSpawn(key);
    x = spot.x;
    y = spot.y;
    label = S.ISLANDS[key].name;
  } else if (args.length >= 2) {
    const tx = Number(args[0]);
    const ty = Number(args[1]);
    if (!Number.isInteger(tx) || !Number.isInteger(ty)) return null;
    const maxT = C.MAP_TILES - 2;
    const cx = Math.max(1, Math.min(maxT, tx)) * C.TILE + C.TILE / 2;
    const cy = Math.max(1, Math.min(maxT, ty)) * C.TILE + C.TILE / 2;
    const spot = match.world.freeSpot(cx, cy);
    x = spot.x;
    y = spot.y;
    label = `tile ${Math.floor(x / C.TILE)}, ${Math.floor(y / C.TILE)}`;
  } else {
    return null;
  }

  match.teleportPlayer(player, x, y);
  return `Đã dịch chuyển tới ${label}`;
}

const COMMANDS = {
  tp: cmdTeleport
};

/**
 * Chay 1 lenh dev dang chuoi "/tp jungle".
 * Tra ve { ok, text } de match gui toast cho nguoi go lenh.
 */
function run(match, player, line) {
  if (!match.flags || !match.flags.dev) {
    return { ok: false, text: 'Lệnh dev chỉ dùng khi server chạy --dev' };
  }
  if (typeof line !== 'string') return { ok: false, text: 'Lệnh không hợp lệ' };

  const parts = line.trim().replace(/^\//, '').split(/\s+/).filter(Boolean);
  const name = (parts.shift() || '').toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(COMMANDS, name)) {
    return { ok: false, text: `Không có lệnh /${name}` };
  }

  const text = COMMANDS[name](match, player, parts);
  if (!text) return { ok: false, text: `Sai cú pháp lệnh /${name}` };
  return { ok: true, text: text };
}

module.exports = { run: run };
