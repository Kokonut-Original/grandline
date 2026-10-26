// server/net.js
// Quan ly ket noi WebSocket: parse JSON, gioi han tan suat (moi message va rieng input),
// bat loi handler de khong sap server, va cac ham lam sach du lieu tu client.
// Phu thuoc: crypto (co san), ws (qua server.js), shared/01-constants.js, shared/03-protocol.js, server/log.js.

'use strict';

const crypto = require('crypto');

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/03-protocol.js');

const S = globalThis.OP_SHARED;
const C = S.CONST;
const logger = require('./log.js');

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
// Ky tu dieu khien (xuong dong, tab, NUL...) khong cho vao ten va chat
const CONTROL_RE = (function () {
  const ranges = [[0x00, 0x1f], [0x7f, 0x9f], [0x200b, 0x200f], [0x2028, 0x202e]];
  // Dung fromCharCode de file nguon chi chua ky tu ASCII (U+2028 trong regex literal lam hong cu phap)
  const cls = ranges.map(r => String.fromCharCode(r[0]) + '-' + String.fromCharCode(r[1])).join('');
  return new RegExp('[' + cls + ']', 'g');
})();

// Dem so message trong cua so 1 giay
function overLimit(counter, max) {
  const sec = Math.floor(Date.now() / 1000);
  if (counter.sec !== sec) {
    counter.sec = sec;
    counter.n = 0;
  }
  counter.n++;
  return counter.n > max;
}

class NetManager {
  constructor() {
    this.clients = new Map(); // id -> client
    this.nextId = 1;
  }

  handleConnection(ws, req, onMessage, onClose) {
    const id = this.nextId++;
    const ip = (req && req.socket && req.socket.remoteAddress) || '';
    const isLocal = (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');

    const client = {
      id,
      ws,
      ip,
      isLocal,
      msgRate: { sec: 0, n: 0 },
      inputRate: { sec: 0, n: 0 },
      reconnectKey: NetManager.makeKey(id)
    };

    this.clients.set(id, client);

    ws.on('message', (raw) => {
      if (overLimit(client.msgRate, C.MSG_MAX_PER_SEC)) return;

      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (e) {
        return;
      }
      if (!msg || typeof msg !== 'object' || Array.isArray(msg) || typeof msg.t !== 'string') return;
      if (msg.t === S.MSG.IN && overLimit(client.inputRate, C.INPUT_MAX_PER_SEC)) return;

      try {
        onMessage(client, msg);
      } catch (e) {
        logger.error('net', 'Loi khi xu ly message', { t: msg.t, client: id, err: String(e && e.stack || e) });
      }
    });

    ws.on('close', () => {
      this.clients.delete(id);
      try {
        onClose(client);
      } catch (e) {
        logger.error('net', 'Loi khi xu ly ngat ket noi', { client: id, err: String(e && e.stack || e) });
      }
    });

    ws.on('error', (e) => {
      logger.warn('net', 'Loi socket', { client: id, err: String(e && e.message || e) });
    });

    return client;
  }

  send(client, msg) {
    if (client && client.ws && client.ws.readyState === 1) {
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

  // Khoa reconnect kho doan (crypto co san cua Node, khong them thu vien)
  static makeKey(id) {
    return 'rec_' + id + '_' + crypto.randomBytes(12).toString('hex');
  }

  // Chuoi tu client: bo ky tu dieu khien, cat khoang trang, gioi han do dai. Sai kieu -> ''
  static cleanText(v, maxLen) {
    if (typeof v !== 'string') return '';
    return v.replace(CONTROL_RE, '').trim().slice(0, maxLen);
  }

  static cleanColor(v, fallback) {
    return (typeof v === 'string' && COLOR_RE.test(v)) ? v : fallback;
  }
}

module.exports = NetManager;
