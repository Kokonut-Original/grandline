// server/snapshot.js
// Loc thuc the theo vung quan tam (AOI) va dong goi snapshot cho tung client.
// Phu thuoc: shared/01-constants.js, shared/03-protocol.js.

'use strict';

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/03-protocol.js');

const S = globalThis.OP_SHARED;

function isInAOI(px, py, ex, ey, radius) {
  const r = radius || S.CONST.AOI_RADIUS || 560;
  const dx = ex - px;
  const dy = ey - py;
  return (dx * dx + dy * dy) <= (r * r);
}

function packPlayerMe(p) {
  return {
    id: p.id,
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    vx: Math.round(p.vx * 10) / 10,
    vy: Math.round(p.vy * 10) / 10,
    aim: Math.round(p.aim * 100) / 100,
    hp: p.hp,
    hm: p.hpMax,
    stamina: p.stamina !== undefined ? Math.round(p.stamina) : 100,
    sprint: !!p.isSprinting,
    name: p.name,
    colors: p.colors
  };
}

function packSnapshot(player, allEnts, tick, zone = null, events = [], aoiRadius) {
  const r = aoiRadius || S.CONST.AOI_RADIUS || 560;
  const visibleEnts = [];

  for (let i = 0; i < allEnts.length; i++) {
    const e = allEnts[i];
    if (e.i === player.id) continue;

    if (isInAOI(player.x, player.y, e.x, e.y, r)) {
      visibleEnts.push(e);
    }
  }

  return {
    t: S.MSG.SNAP,
    tick: tick,
    ack: player.lastInputSeq || 0,
    me: packPlayerMe(player),
    ents: visibleEnts,
    zone: zone,
    ev: events || []
  };
}

module.exports = {
  isInAOI,
  packSnapshot,
  packPlayerMe
};
