// server/net.js
// Quan ly ket noi mang WebSocket, parse va validate message, gioi han tan suat input.
// Phu thuoc: ws, shared/01-constants.js, shared/03-protocol.js.

'use strict';

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/03-protocol.js');

const S = globalThis.OP_SHARED;

class NetManager {
  constructor() {
    this.clients = new Map(); // id -> { ws, id, ip, isLocal, lastInputTime, inputCount, reconnectKey }
    this.nextId = 1;
  }

  handleConnection(ws, req, onMessage, onClose) {
    const id = this.nextId++;
    const ip = req.socket.remoteAddress || '';
    const isLocal = (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');

    const client = {
      id,
      ws,
      ip,
      isLocal,
      lastInputSec: 0,
      inputRateCount: 0,
      reconnectKey: 'rec_' + id + '_' + Math.random().toString(36).slice(2, 8)
    };

    this.clients.set(id, client);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (e) {
        return; // Bo qua JSON hong
      }

      if (!msg || typeof msg !== 'object' || typeof msg.t !== 'string') {
        return;
      }

      // Gioi han toc do input
      if (msg.t === S.MSG.IN) {
        const nowSec = Math.floor(Date.now() / 1000);
        if (nowSec !== client.lastInputSec) {
          client.lastInputSec = nowSec;
          client.inputRateCount = 1;
        } else {
          client.inputRateCount++;
          if (client.inputRateCount > S.CONST.INPUT_MAX_PER_SEC) {
            return; // Vuot nguong
          }
        }
      }

      onMessage(client, msg);
    });

    ws.on('close', () => {
      this.clients.delete(id);
      onClose(client);
    });

    ws.on('error', () => {
      // Socket error
    });

    return client;
  }

  send(client, msg) {
    if (client && client.ws && client.ws.readyState === 1) { // OPEN
      client.ws.send(JSON.stringify(msg));
    }
  }

  broadcast(msg, filterFn) {
    const raw = JSON.stringify(msg);
    for (const client of this.clients.values()) {
      if (client.ws && client.ws.readyState === 1) {
        if (!filterFn || filterFn(client)) {
          client.ws.send(raw);
        }
      }
    }
  }
}

module.exports = NetManager;
