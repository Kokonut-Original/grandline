// server/match.js
// May trang thai tran dau (LOBBY, LAUNCH, PLAY, END), vong tick 30Hz mo phong va snapshot 20Hz.
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

    this.botsCount = (typeof flags.bots === 'number') ? flags.bots : (S.CONST.MAX_PLAYERS - 1);
    this.botMix = {
      easy: 0.4,
      normal: 0.4,
      hard: 0.2
    };

    this.net = null;
    this.currentTick = 0;
    this.tickInterval = null;
    this.snapInterval = null;

    this.dt = 1 / S.CONST.TICK_HZ;
  }

  setNet(net) {
    this.net = net;
  }

  startLoop() {
    if (this.tickInterval) return;

    // Vong tick 30Hz
    const tickMs = Math.floor(1000 / S.CONST.TICK_HZ);
    this.tickInterval = setInterval(() => {
      this.tick(this.dt);
    }, tickMs);

    // Vong snapshot 20Hz
    const snapMs = Math.floor(1000 / S.CONST.SNAP_HZ);
    this.snapInterval = setInterval(() => {
      this.broadcastSnapshot();
    }, snapMs);
  }

  stopLoop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.snapInterval) {
      clearInterval(this.snapInterval);
      this.snapInterval = null;
    }
  }

  tick(dt) {
    this.currentTick++;

    // Cap nhat di chuyen cho toan bo player
    for (const player of this.players.values()) {
      let mx = player.currentInput.mx;
      let my = player.currentInput.my;

      // Chuan hoa vector huong
      const len = Math.hypot(mx, my);
      if (len > 1) {
        mx /= len;
        my /= len;
      }

      player.vx = mx * S.CONST.MOVE_SPEED;
      player.vy = my * S.CONST.MOVE_SPEED;

      player.x += player.vx * dt;
      player.y += player.vy * dt;

      // Gioi han trong ban do 0 -> MAP_TILES * TILE
      const maxCoord = S.CONST.MAP_TILES * S.CONST.TILE;
      player.x = Math.max(16, Math.min(maxCoord - 16, player.x));
      player.y = Math.max(16, Math.min(maxCoord - 16, player.y));

      player.aim = player.currentInput.aim;
    }
  }

  broadcastSnapshot() {
    if (!this.net) return;

    // Dong goi danh sach tat ca entity nguoi choi
    const allEnts = [];
    for (const p of this.players.values()) {
      allEnts.push({
        i: p.id,
        k: 'PLAYER',
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        a: Math.round(p.aim * 100) / 100,
        hp: p.hp,
        hm: p.hpMax,
        n: p.name,
        c: p.colors
      });
    }

    for (const player of this.players.values()) {
      const otherEnts = allEnts.filter(e => e.i !== player.id);

      const snapMsg = {
        t: S.MSG.SNAP,
        tick: this.currentTick,
        ack: player.lastInputSeq,
        me: {
          id: player.id,
          x: Math.round(player.x * 10) / 10,
          y: Math.round(player.y * 10) / 10,
          vx: Math.round(player.vx * 10) / 10,
          vy: Math.round(player.vy * 10) / 10,
          aim: Math.round(player.aim * 100) / 100,
          hp: player.hp,
          hm: player.hpMax,
          stamina: player.stamina,
          name: player.name,
          colors: player.colors
        },
        ents: otherEnts,
        zone: null,
        ev: []
      };

      this.net.send(player.client, snapMsg);
    }
  }

  onClientConnect(client) {
    if (this.hostId === null || client.isLocal) {
      if (this.hostId === null) {
        this.hostId = client.id;
      }
    }

    const isHost = (this.hostId === client.id);
    const defaultName = `Hai tac #${client.id}`;

    // Vi tri xuat phat tam tren nen phang (240, 135)
    const player = {
      id: client.id,
      name: defaultName,
      colors: { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' },
      isHost: isHost,
      client: client,
      joined: false,

      // Vat ly & di chuyen
      x: 240,
      y: 135,
      vx: 0,
      vy: 0,
      aim: 0,
      hp: S.CONST.HP_BASE,
      hpMax: S.CONST.HP_BASE,
      stamina: S.CONST.STAMINA_MAX,
      lastInputSeq: 0,
      currentInput: { mx: 0, my: 0, aim: 0, btn: 0 }
    };

    this.players.set(client.id, player);

    this.net.send(client, {
      t: S.MSG.WELCOME,
      you: client.id,
      seed: this.seed,
      isHost: isHost,
      reconnectKey: client.reconnectKey,
      cfgHash: 'init_cfg',
      dev: !!this.flags.dev
    });

    this.broadcastLobby();
  }

  onClientDisconnect(client) {
    this.players.delete(client.id);

    if (this.hostId === client.id) {
      const remaining = Array.from(this.players.values());
      if (remaining.length > 0) {
        this.hostId = remaining[0].id;
        remaining[0].isHost = true;
      } else {
        this.hostId = null;
      }
    }

    this.broadcastLobby();
  }

  onClientMessage(client, msg) {
    const player = this.players.get(client.id);
    if (!player) return;

    switch (msg.t) {
      case S.MSG.JOIN:
        this.handleJoin(player, msg);
        break;

      case S.MSG.IN:
        this.handleInput(player, msg);
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

  handleInput(player, msg) {
    player.lastInputSeq = typeof msg.seq === 'number' ? msg.seq : player.lastInputSeq;

    let mx = Number(msg.mx) || 0;
    let my = Number(msg.my) || 0;
    let aim = Number(msg.aim) || 0;
    let btn = Number(msg.btn) || 0;

    // Kẹp mx, my trong khoang -1..1
    mx = Math.max(-1, Math.min(1, mx));
    my = Math.max(-1, Math.min(1, my));

    player.currentInput = { mx, my, aim, btn };
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
