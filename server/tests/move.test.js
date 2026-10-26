// server/tests/move.test.js
// Test di chuyen dung chung (M03B-T01e): server ra dung vi tri client du doan du goi tin den don cuc,
// khong chay nhanh hon bang cach gui nhieu input, reconnect khong nhan doi nhan vat,
// lenh dev /tp chi chay khi --dev va khong lam hong toa do.
// Phu thuoc: server/tests/assert.js, server/match.js, shared/22-move.js.

'use strict';

const assert = require('./assert.js');
const MatchManager = require('../match.js');

require('../../shared/00-namespace');
require('../../shared/01-constants');
require('../../shared/22-move');

const S = globalThis.OP_SHARED;
const C = S.CONST;
const DT = 1 / C.TICK_HZ;

class MockNet {
  constructor() {
    this.sent = [];
    this.broadcasts = [];
  }
  send(client, msg) {
    this.sent.push({ to: client.id, msg });
  }
  broadcast(msg) {
    this.broadcasts.push(msg);
  }
}

function newMatch(flags) {
  const net = new MockNet();
  const match = new MatchManager(Object.assign({ seed: 1 }, flags || {}));
  match.setNet(net);
  return { net, match };
}

function connect(match, id) {
  const client = { id: id, isLocal: false, reconnectKey: 'key_' + id };
  match.onClientConnect(client);
  return client;
}

function clearTimers(match) {
  for (const p of match.players.values()) {
    if (p.disconnectTimer) clearTimeout(p.disconnectTimer);
  }
}

// 1. Server == client du doan, ke ca khi goi tin den don cuc (giat mang)
function testDeterministicBursts() {
  const { match } = newMatch();
  const client = connect(match, 1);
  const player = match.players.get(1);

  // Dat gan bo bien dao Rung (co, nuoc nong, nuoc sau, cay) de di qua nhieu loai dia hinh
  const isl = S.ISLANDS.jungle;
  const start = match.world.freeSpot((isl.cx + 20) * C.TILE, (isl.cy - 10) * C.TILE);
  match.teleportPlayer(player, start.x, start.y);

  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [1, -1], [0, -1], [1, 0.5]];
  const inputs = [];
  for (let i = 0; i < 150; i++) {
    const d = dirs[Math.floor(i / 20) % dirs.length];
    inputs.push({ seq: i + 1, mx: d[0], my: d[1], aim: 0, btn: 0 });
  }

  // Client du doan: ap tung input bang cung ham
  const predicted = { x: start.x, y: start.y, vx: 0, vy: 0 };
  for (const inp of inputs) S.MOVE.step(predicted, inp, match.world.map, { hasFruit: false, onBoat: false });

  // Server nhan theo nhom 0..4 goi moi tick, trung binh dung 1 goi/tick (13 goi / 13 tick)
  // nhu khi mang giat: goi bi giu lai roi den don cuc
  const pattern = [2, 0, 1, 3, 0, 0, 4, 0, 1, 1, 0, 1, 0];
  let k = 0;
  let sent = 0;
  for (let t = 0; sent < inputs.length; t++) {
    const n = Math.min(pattern[t % pattern.length], inputs.length - sent);
    for (let j = 0; j < n; j++) {
      match.onClientMessage(client, Object.assign({ t: 'in' }, inputs[sent++]));
    }
    match.tick(DT);
    k++;
  }
  for (let t = 0; t < 20 && player.inputQueue.length > 0; t++) match.tick(DT);

  assert.strictEqual(player.lastInputSeq, inputs.length, 'Server phai xu ly het moi input');
  assert.ok(Math.abs(player.x - predicted.x) < 1e-9 && Math.abs(player.y - predicted.y) < 1e-9,
    `Vi tri server phai trung du doan client: server (${player.x}, ${player.y}) / client (${predicted.x}, ${predicted.y})`);
  assert.ok(k > 0, 'Phai chay it nhat 1 tick');
}

// 2. Gui nhieu input hon 30/giay khong lam chay nhanh hon
function testNoSpeedHack() {
  const { match } = newMatch();
  const client = connect(match, 1);
  const player = match.players.get(1);
  const N = C.MAP_TILES;
  match.world.map = { tiles: new Uint8Array(N * N).fill(S.TILE.GRASS) };
  match.teleportPlayer(player, 1000, 1000);

  let seq = 0;
  for (let t = 0; t < C.TICK_HZ; t++) {
    for (let j = 0; j < 3; j++) {
      seq++;
      match.onClientMessage(client, { t: 'in', seq: seq, mx: 1, my: 0, aim: 0, btn: 0 });
    }
    match.tick(DT);
  }
  const maxSteps = C.TICK_HZ + C.INPUT_BURST;
  const maxDist = maxSteps * C.MOVE_SPEED * DT;
  assert.ok(player.x - 1000 <= maxDist + 1e-6, `1 giay khong duoc di qua ${maxDist}px, thuc te ${player.x - 1000}`);

  // Goi seq cu hoac trung bi bo
  const before = player.inputQueue.length;
  match.onClientMessage(client, { t: 'in', seq: 1, mx: 1, my: 0, aim: 0, btn: 0 });
  assert.strictEqual(player.inputQueue.length, before, 'Input seq cu phai bi bo qua');
}

// 3. Reconnect khong nhan doi nhan vat, khong di nhanh gap doi
function testReconnectSingle() {
  const { match, net } = newMatch();
  const c1 = connect(match, 1);
  const p1 = match.players.get(1);
  const N = C.MAP_TILES;
  match.world.map = { tiles: new Uint8Array(N * N).fill(S.TILE.GRASS) };
  match.teleportPlayer(p1, 1000, 1000);

  match.onClientDisconnect(c1);
  const c2 = connect(match, 2);
  match.onClientMessage(c2, { t: 'join', reconnectKey: p1.reconnectKey });

  assert.strictEqual(match.players.size, 1, 'Sau reconnect chi duoc con 1 nhan vat');
  assert.strictEqual(p1.client, c2, 'Nhan vat cu phai gan voi socket moi');
  const lobby = net.broadcasts.filter(m => m.t === 'lobby').pop();
  assert.strictEqual(lobby.players.length, 1, 'Danh sach phong khong duoc trung nguoi');

  for (let s = 1; s <= C.TICK_HZ; s++) {
    match.onClientMessage(c2, { t: 'in', seq: s, mx: 1, my: 0, aim: 0, btn: 0 });
    match.tick(DT);
  }
  assert.ok(Math.abs(p1.x - 1000 - C.MOVE_SPEED) < 1e-6, `Sau reconnect 1 giay phai di dung ${C.MOVE_SPEED}px, thuc te ${p1.x - 1000}`);

  // Socket cu dong muon sau khi da reconnect: khong duoc danh dau nhan vat la rot mang
  match.onClientDisconnect(c1);
  assert.strictEqual(p1.disconnectedAt, null, 'Socket cu dong muon khong duoc anh huong nhan vat da reconnect');
  clearTimers(match);
}

// 4. Lenh dev /tp
function testDevTeleport() {
  // Khong --dev: lenh bi tu choi, khong broadcast ra chat
  const a = newMatch({ dev: false });
  const ca = connect(a.match, 1);
  const pa = a.match.players.get(1);
  const x0 = pa.x;
  a.match.onClientMessage(ca, { t: 'chat', text: '/tp jungle' });
  a.match.onClientMessage(ca, { t: 'act', a: 'dev', arg: '/tp jungle' });
  a.match.onClientMessage(ca, { t: 'tp', island: 'jungle', x: 5, y: 5 });
  assert.strictEqual(pa.x, x0, 'Khong bat --dev thi /tp khong duoc chay');
  assert.ok(!a.net.broadcasts.some(m => m.t === 'chat'), 'Lenh /tp khong duoc lo ra chat chung');

  // Co --dev
  const b = newMatch({ dev: true });
  const cb = connect(b.match, 1);
  const pb = b.match.players.get(1);
  b.match.onClientMessage(cb, { t: 'act', a: 'dev', arg: '/tp jungle' });
  const spot = b.match.world.getIslandSpawn('jungle');
  assert.strictEqual(pb.x, spot.x, '/tp jungle phai dua toi diem spawn dao Rung');

  for (const bad of ['/tp __proto__', '/tp constructor', '/tp toString', '/tp 1e9 x']) {
    b.match.onClientMessage(cb, { t: 'act', a: 'dev', arg: bad });
    assert.ok(Number.isFinite(pb.x) && Number.isFinite(pb.y), `${bad} khong duoc lam toa do thanh NaN`);
  }

  b.match.onClientMessage(cb, { t: 'act', a: 'dev', arg: '/tp 99999 -5' });
  const maxPx = C.MAP_TILES * C.TILE;
  assert.ok(pb.x > 0 && pb.x < maxPx && pb.y > 0 && pb.y < maxPx, '/tp toa do ngoai map phai bi kep vao trong map');
}

// 5. Ten va mau tu client duoc lam sach
function testSanitize() {
  const { match } = newMatch();
  const c = connect(match, 1);
  const p = match.players.get(1);
  match.onClientMessage(c, { t: 'join', name: '  Luffy\n\u0000 ' + 'x'.repeat(50), colors: { hat: 'red; background:url(x)', shirt: '#00ff00', hair: 5 } });
  assert.ok(p.name.length <= 24 && !/[\n\u0000]/.test(p.name), 'Ten phai bo ky tu dieu khien va <= 24 ky tu');
  assert.strictEqual(p.colors.shirt, '#00ff00', 'Mau hop le phai duoc nhan');
  assert.ok(/^#[0-9a-f]{6}$/i.test(p.colors.hat) && /^#[0-9a-f]{6}$/i.test(p.colors.hair), 'Mau sai dinh dang phai giu mau cu');
}

module.exports = {
  name: 'Shared Movement, Input Queue, Reconnect & Dev Command Test (move.test.js)',
  run: function () {
    testDeterministicBursts();
    testNoSpeedHack();
    testReconnectSingle();
    testDevTeleport();
    testSanitize();
  }
};
