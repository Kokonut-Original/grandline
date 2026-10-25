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
    assert.strictEqual(player.x, 240, 'Toa do x ban dau phai la 240');
    assert.strictEqual(player.y, 135, 'Toa do y ban dau phai la 135');

    // 1. Test di chuyen sang phai (mx = 1, my = 0) trong 1 giay (30 tick)
    match.onClientMessage(client, {
      t: 'in',
      seq: 1,
      mx: 1,
      my: 0,
      aim: 0,
      btn: 0
    });

    const dt = 1 / 30;
    for (let i = 0; i < 30; i++) {
      match.tick(dt);
    }

    // Toc do 90px/s -> sau 1s di chuyen 90px -> 240 + 90 = 330
    assert.ok(Math.abs(player.x - 330) < 0.001, `X phai bang 330 sau 30 tick, thuc te: ${player.x}`);
    assert.strictEqual(player.y, 135, 'Y khong duoc thay doi khi my = 0');
    assert.strictEqual(player.lastInputSeq, 1, 'lastInputSeq phai la 1');

    // 2. Test chuan hoa vector di chuyen duong cheo (mx = 1, my = 1)
    const prevX = player.x;
    const prevY = player.y;

    match.onClientMessage(client, {
      t: 'in',
      seq: 2,
      mx: 1,
      my: 1,
      aim: 0,
      btn: 0
    });

    for (let i = 0; i < 30; i++) {
      match.tick(dt);
    }

    const dx = player.x - prevX;
    const dy = player.y - prevY;
    const totalDist = Math.hypot(dx, dy);

    // Khoang cach di chuyen trong 1 giay khong duoc vuot qua 90px (do da chuan hoa)
    assert.ok(Math.abs(totalDist - 90) < 0.001, `Tong quang duong di chuyen phai bang 90px, thuc te: ${totalDist}`);

    // 3. Test dong goi snapshot
    net.sent = [];
    match.broadcastSnapshot();

    assert.ok(net.sent.length > 0, 'Phai gui snapshot toi client');
    const snap = net.sent[0].msg;
    assert.strictEqual(snap.t, 'snap', 'Message phai la snap');
    assert.strictEqual(snap.tick, 60, 'Tick phai bang 60 sau 60 lan tick');
    assert.strictEqual(snap.ack, 2, 'ack phai bang lastInputSeq la 2');
    assert.ok(snap.me && typeof snap.me.x === 'number', 'me phai chua toa do x');
    assert.ok(Array.isArray(snap.ents), 'ents phai la mang');
  }
};
