// server/tests/lobby.test.js
// Unit test may trang thai Lobby, chi dinh Host, cau hinh bot va chat.
// Phu thuoc: server/tests/assert.js, server/match.js, server/net.js.

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
  name: 'Lobby & Host Management Test',
  run: function () {
    const net = new MockNet();
    const match = new MatchManager({ bots: 15 });
    match.setNet(net);

    assert.strictEqual(match.phase, 'LOBBY', 'Phase khoi tao phai la LOBBY');
    assert.strictEqual(match.botsCount, 15, 'So bot phai nhan tu cờ');

    // 1. Client 1 ket noi -> phai la Host
    const client1 = { id: 1, isLocal: false, reconnectKey: 'rec_1' };
    match.onClientConnect(client1);

    assert.strictEqual(match.hostId, 1, 'Client 1 phai tro thanh host');
    const p1 = match.players.get(1);
    assert.ok(p1 && p1.isHost, 'Player 1 phai co isHost = true');

    // 2. Client 2 ket noi -> khong phai Host
    const client2 = { id: 2, isLocal: false, reconnectKey: 'rec_2' };
    match.onClientConnect(client2);

    assert.strictEqual(match.hostId, 1, 'HostId van phai la 1');
    const p2 = match.players.get(2);
    assert.strictEqual(p2.isHost, false, 'Player 2 khong phai la host');

    // 3. Client 2 thu doi config -> bi tu choi
    net.broadcasts = [];
    match.onClientMessage(client2, {
      t: 'cfg',
      bots: 5
    });
    assert.strictEqual(match.botsCount, 15, 'Non-host khong the thay doi bots');
    assert.strictEqual(net.broadcasts.length, 0, 'Khong duoc broadcast khi non-host doi cfg');

    // 4. Client 1 (Host) doi config -> thanh cong
    match.onClientMessage(client1, {
      t: 'cfg',
      bots: 8,
      botMix: { hard: 0.7 }
    });
    assert.strictEqual(match.botsCount, 8, 'Host phai doi duoc so bot');
    assert.strictEqual(match.botMix.hard, 0.7, 'Host phai doi duoc botMix');
    assert.strictEqual(match.botMix.normal, 0.3, 'normal phai la phan con lai');
    assert.ok(net.broadcasts.length > 0, 'Phai broadcast lobby sau khi doi cfg');

    // 5. Test chat
    net.broadcasts = [];
    match.onClientMessage(client2, {
      t: 'chat',
      text: 'Xin chao dong doi!'
    });
    const lastBroadcast = net.broadcasts[net.broadcasts.length - 1];
    assert.ok(lastBroadcast && lastBroadcast.t === 'chat', 'Phai broadcast chat');
    assert.strictEqual(lastBroadcast.text, 'Xin chao dong doi!');

    // 6. Host thoat -> chuyen host sang Client 2
    match.onClientDisconnect(client1);
    assert.strictEqual(match.hostId, 2, 'Host phai duoc chuyen sang Client 2');
    assert.strictEqual(match.players.get(2).isHost, true, 'Client 2 phai co isHost = true');
  }
};
