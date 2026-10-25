// server/match.js
// May trang thai tran dau (LOBBY, LAUNCH, PLAY, END), quan ly nguoi choi, bot va chat.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js, shared/03-protocol.js.

'use strict';

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/02-enums.js');
require('../shared/03-protocol.js');

const S = globalThis.OP_SHARED;

class MatchManager {
  constructor(flags = {}) {
    this.flags = flags;
    this.phase = S.PHASE.LOBBY;
    this.seed = flags.seed !== null && flags.seed !== undefined ? flags.seed : 1;
    this.players = new Map(); // id -> player object
    this.hostId = null;

    // Cau hinh bot mac dinh: lap du 32
    this.botsCount = (typeof flags.bots === 'number') ? flags.bots : (S.CONST.MAX_PLAYERS - 1);
    this.botMix = {
      easy: 0.4,
      normal: 0.4,
      hard: 0.2
    };

    this.net = null;
  }

  setNet(net) {
    this.net = net;
  }

  onClientConnect(client) {
    // Neu chua co host, client dau tien la host
    if (this.hostId === null || client.isLocal) {
      if (this.hostId === null) {
        this.hostId = client.id;
      }
    }

    const isHost = (this.hostId === client.id);
    const defaultName = `Hai tac #${client.id}`;

    const player = {
      id: client.id,
      name: defaultName,
      colors: { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' },
      isHost: isHost,
      client: client,
      joined: false
    };

    this.players.set(client.id, player);

    // Gui welcome
    this.net.send(client, {
      t: S.MSG.WELCOME,
      you: client.id,
      seed: this.seed,
      isHost: isHost,
      reconnectKey: client.reconnectKey,
      cfgHash: 'init_cfg',
      dev: !!this.flags.dev
    });

    // Neu dang o lobby thi gui trang thai lobby
    if (this.phase === S.PHASE.LOBBY) {
      this.broadcastLobby();
    }
  }

  onClientDisconnect(client) {
    this.players.delete(client.id);

    // Neu host thoat, chuyen quyen host cho nguoi tiep theo
    if (this.hostId === client.id) {
      const remaining = Array.from(this.players.values());
      if (remaining.length > 0) {
        this.hostId = remaining[0].id;
        remaining[0].isHost = true;
      } else {
        this.hostId = null;
      }
    }

    if (this.phase === S.PHASE.LOBBY) {
      this.broadcastLobby();
    }
  }

  onClientMessage(client, msg) {
    const player = this.players.get(client.id);
    if (!player) return;

    switch (msg.t) {
      case S.MSG.JOIN:
        this.handleJoin(player, msg);
        break;

      case S.MSG.CFG:
        this.handleCfg(player, msg);
        break;

      case S.MSG.START:
        this.handleStart(player);
        break;

      case S.MSG.CHAT:
        this.handleChat(player, msg);
        break;

      case S.MSG.PING:
        this.net.send(client, {
          t: S.MSG.PONG,
          c: msg.c || 0,
          s: Date.now()
        });
        break;
    }
  }

  handleJoin(player, msg) {
    if (typeof msg.name === 'string' && msg.name.trim().length > 0) {
      player.name = msg.name.trim().slice(0, 24);
    }
    if (msg.colors && typeof msg.colors === 'object') {
      player.colors = {
        hat: typeof msg.colors.hat === 'string' ? msg.colors.hat : player.colors.hat,
        shirt: typeof msg.colors.shirt === 'string' ? msg.colors.shirt : player.colors.shirt,
        hair: typeof msg.colors.hair === 'string' ? msg.colors.hair : player.colors.hair
      };
    }
    player.joined = true;
    this.broadcastLobby();
  }

  handleCfg(player, msg) {
    if (!player.isHost) return;

    if (typeof msg.bots === 'number') {
      this.botsCount = Math.max(0, Math.min(S.CONST.MAX_PLAYERS - 1, Math.floor(msg.bots)));
    }
    if (msg.botMix && typeof msg.botMix === 'object') {
      this.botMix = {
        easy: Number(msg.botMix.easy) || 0.4,
        normal: Number(msg.botMix.normal) || 0.4,
        hard: Number(msg.botMix.hard) || 0.2
      };
    }

    this.broadcastLobby();
  }

  handleStart(player) {
    if (!player.isHost) return;
    if (this.phase !== S.PHASE.LOBBY) return;

    // Chuyen trang thai
    if (this.flags.noLaunch) {
      this.phase = S.PHASE.PLAY;
    } else {
      this.phase = S.PHASE.LAUNCH;
    }

    this.net.broadcast({
      t: S.MSG.PHASE,
      phase: this.phase,
      t0: Date.now(),
      data: {
        bots: this.botsCount,
        botMix: this.botMix
      }
    });
  }

  handleChat(player, msg) {
    if (typeof msg.text !== 'string') return;
    const cleanText = msg.text.trim().slice(0, 120);
    if (!cleanText) return;

    this.net.broadcast({
      t: S.MSG.CHAT,
      from: player.name,
      text: cleanText
    });
  }

  broadcastLobby() {
    const list = [];
    for (const p of this.players.values()) {
      list.push({
        id: p.id,
        name: p.name,
        colors: p.colors,
        isHost: (p.id === this.hostId)
      });
    }

    this.net.broadcast({
      t: S.MSG.LOBBY,
      players: list,
      bots: this.botsCount,
      botMix: this.botMix
    });
  }
}

module.exports = MatchManager;
