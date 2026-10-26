// server/tests/loop.test.js
// Unit test vong tick 30Hz, tinh toan di chuyen, chuan hoa vector va dong goi snapshot.
// Phu thuoc: server/tests/assert.js, server/match.js.

'use strict';

const assert = require('./assert.js');
const MatchManager = require('../match.js');

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

module.exports = {
  name: 'Server Loop & Movement Test',
  run: function () {
    const net = new MockNet();
    const match = new MatchManager();
    match.setNet(net);

    const client = { id: 1, isLocal: false, reconnectKey: 'rec_1' };
    match.onClientConnect(client);

    const player = match.players.get(1);
    assert.ok(player, 'Player 1 phai ton tai');
    const spawn = match.world.getIslandSpawn('fortress');
    assert.strictEqual(player.x, spawn.x, 'Nguoi choi moi phai dung o diem spawn dao trung tam');
    assert.strictEqual(player.y, spawn.y, 'Nguoi choi moi phai dung o diem spawn dao trung tam');

    // Map gia toan co de do quang duong chinh xac (khong vuong cay/nha)
    const S = globalThis.OP_SHARED;
    const N = S.CONST.MAP_TILES;
    match.world.map = { tiles: new Uint8Array(N * N).fill(S.TILE.GRASS) };
    player.x = 1000;
    player.y = 1000;

    // 1. Di sang phai: moi tick nhan 1 input (giong client gui 30Hz) -> 30 input = 90px
    const dt = 1 / 30;
    for (let s = 1; s <= 30; s++) {
      match.onClientMessage(client, { t: 'in', seq: s, mx: 1, my: 0, aim: 0, btn: 0 });
      match.tick(dt);
    }
    assert.ok(Math.abs(player.x - 1090) < 0.001, `X phai bang 1090 sau 30 input, thuc te: ${player.x}`);
    assert.strictEqual(player.y, 1000, 'Y khong duoc thay doi khi my = 0');
    assert.strictEqual(player.lastInputSeq, 30, 'lastInputSeq phai la 30');

    // 2. Duong cheo (1, 1) duoc chuan hoa: 30 input -> dung 90px
    const prevX = player.x;
    const prevY = player.y;
    for (let s = 31; s <= 60; s++) {
      match.onClientMessage(client, { t: 'in', seq: s, mx: 1, my: 1, aim: 0, btn: 0 });
      match.tick(dt);
    }
    const totalDist = Math.hypot(player.x - prevX, player.y - prevY);
    assert.ok(Math.abs(totalDist - 90) < 0.001, `Tong quang duong di cheo phai bang 90px, thuc te: ${totalDist}`);

    // 3. Test dong goi snapshot
    net.sent = [];
    match.broadcastSnapshot();

    assert.ok(net.sent.length > 0, 'Phai gui snapshot toi client');
    const snap = net.sent[0].msg;
    assert.strictEqual(snap.t, 'snap', 'Message phai la snap');
    assert.strictEqual(snap.tick, 60, 'Tick phai bang 60 sau 60 lan tick');
    assert.strictEqual(snap.ack, 60, 'ack phai bang lastInputSeq la 60');
    assert.ok(snap.me && typeof snap.me.x === 'number', 'me phai chua toa do x');
    assert.ok(Array.isArray(snap.ents), 'ents phai la mang');
  }
};
