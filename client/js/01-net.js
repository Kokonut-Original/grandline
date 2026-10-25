// client/js/01-net.js
// Quan ly ket noi mang WebSocket giua client va server, do ping va phan phoi message.
// Phu thuoc: client/js/00-boot.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};

  const handlers = new Map();
  let ws = null;
  let isConnected = false;
  let youId = null;
  let isHost = false;
  let reconnectKey = null;
  let pingMs = 0;
  let pingInterval = null;

  OP.NET = {
    connect: function () {
      if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
        return;
      }

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:8080';
      const url = `${proto}//${host}`;

      ws = new WebSocket(url);

      ws.onopen = function () {
        isConnected = true;

        // Bat dinh thoi do ping 1s/lan
        if (!pingInterval) {
          pingInterval = setInterval(function () {
            if (isConnected) {
              OP.NET.send({ t: 'ping', c: Date.now() });
            }
          }, 1000);
        }

        const savedKey = sessionStorage.getItem('op_reconnectKey');
        const joinMsg = {
          t: 'join',
          name: localStorage.getItem('op_name') || '',
          colors: {
            hat: localStorage.getItem('op_color_hat') || '#d9534f',
            shirt: localStorage.getItem('op_color_shirt') || '#337ab7',
            hair: localStorage.getItem('op_color_hair') || '#292b2c'
          }
        };
        if (savedKey) {
          joinMsg.reconnectKey = savedKey;
        }
        OP.NET.send(joinMsg);
      };

      ws.onmessage = function (event) {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch (e) {
          return;
        }

        if (!msg || !msg.t) return;

        if (msg.t === 'welcome') {
          youId = msg.you;
          isHost = msg.isHost;
          reconnectKey = msg.reconnectKey;
          if (reconnectKey) {
            sessionStorage.setItem('op_reconnectKey', reconnectKey);
          }
        } else if (msg.t === 'lobby') {
          if (Array.isArray(msg.players)) {
            const me = msg.players.find(p => p.id === youId);
            if (me) {
              isHost = !!me.isHost;
            }
          }
        } else if (msg.t === 'pong') {
          if (typeof msg.c === 'number') {
            pingMs = Math.max(0, Date.now() - msg.c);
          }
        }

        const cbs = handlers.get(msg.t);
        if (cbs) {
          for (let i = 0; i < cbs.length; i++) {
            cbs[i](msg);
          }
        }

        const globalCbs = handlers.get('*');
        if (globalCbs) {
          for (let i = 0; i < globalCbs.length; i++) {
            globalCbs[i](msg);
          }
        }
      };

      ws.onclose = function () {
        isConnected = false;
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
      };

      ws.onerror = function () {
        // Socket error
      };
    },

    send: function (msgObj) {
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(msgObj));
      }
    },

    on: function (type, callback) {
      if (!handlers.has(type)) {
        handlers.set(type, []);
      }
      handlers.get(type).push(callback);
    },

    getYouId: function () {
      return youId;
    },

    isHost: function () {
      return isHost;
    },

    isConnected: function () {
      return isConnected;
    },

    getPing: function () {
      return pingMs;
    }
  };
})();
