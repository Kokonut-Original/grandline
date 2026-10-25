// server/tests/aoi.test.js
// Unit test loc thuc the theo ban kinh AOI va co che giu nhan vat khi rot mang (reconnectKey).
// Phu thuoc: server/tests/assert.js, server/snapshot.js, server/match.js.

'use strict';

const assert = require('./assert.js');
const { isInAOI, packSnapshot } = require('../snapshot.js');
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
  name: 'AOI Filtering & Reconnection Test',
  run: function () {
    // 1. Test AOI math
    assert.ok(isInAOI(100, 100, 200, 200, 560), 'Khoang cach 141px phai nam trong AOI 560px');
    assert.strictEqual(isInAOI(100, 100, 800, 800, 560), false, 'Khoang cach 990px khong duoc nam trong AOI 560px');

    // 2. Test packSnapshot loc bo entity ngoai tam
    const player = { id: 1, x: 100, y: 100, hp: 100, hpMax: 100, stamina: 100, lastInputSeq: 5, name: 'P1' };
    const allEnts = [
      { i: 2, k: 'PLAYER', x: 200, y: 200, hp: 100 }, // trong tam
      { i: 3, k: 'PLAYER', x: 800, y: 800, hp: 100 }, // ngoai tam
      { i: 4, k: 'ITEM', x: 120, y: 110 }             // trong tam
    ];

    const snap = packSnapshot(player, allEnts, 10, null, [], 560);
    assert.strictEqual(snap.ents.length, 2, 'Snapshot chi duoc chua 2 entity nam trong ban kinh AOI');
    assert.strictEqual(snap.ents.some(e => e.i === 3), false, 'Entity cach 990px phai bi loai bo');
    assert.strictEqual(snap.ents.some(e => e.i === 2), true, 'Entity cach 141px phai ton tai');

    // 3. Test Reconnection giu lai vi tri va thong tin
    const net = new MockNet();
    const match = new MatchManager();
    match.setNet(net);

    const client1 = { id: 1, isLocal: false, reconnectKey: 'secret_key_abc' };
    match.onClientConnect(client1);

    const p1 = match.players.get(1);
    p1.x = 777;
    p1.y = 888;
    p1.hp = 85;

    // Ngat ket noi
    match.onClientDisconnect(client1);
    assert.ok(p1.disconnectedAt !== null, 'Player 1 phai co moc thoi gian disconnectedAt');
    assert.strictEqual(p1.client, null, 'Client phai bi go bo');
    assert.ok(match.players.has(1), 'Player 1 van phai duoc luu trong match.players');

    // Client ket noi lai voi cung reconnectKey
    const newClient = { id: 2, isLocal: false, reconnectKey: 'new_temp_key' };
    match.onClientConnect(newClient);

    // Gui join kem reconnectKey cu
    net.sent = [];
    match.onClientMessage(newClient, {
      t: 'join',
      reconnectKey: 'secret_key_abc'
    });

    assert.strictEqual(p1.disconnectedAt, null, 'disconnectedAt phai duoc xoa sau khi reconnect');
    assert.strictEqual(p1.x, 777, 'Toa do x phai duoc giu nguyen 777');
    assert.strictEqual(p1.y, 888, 'Toa do y phai duoc giu nguyen 888');
    assert.strictEqual(p1.hp, 85, 'Chi so hp phai duoc giu nguyen 85');

    // Clear timer de tranh treo tien trinh test
    if (p1.disconnectTimer) clearTimeout(p1.disconnectTimer);
  }
};
