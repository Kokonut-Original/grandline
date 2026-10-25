// server/match.js
// May trang thai tran dau, vong tick 30Hz, AOI snapshot 20Hz, giu nhan vat 30s khi rot mang va log perf.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js, shared/03-protocol.js, server/snapshot.js, server/log.js.

'use strict';

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/02-enums.js');
require('../shared/03-protocol.js');

const S = globalThis.OP_SHARED;
const { packSnapshot } = require('./snapshot.js');
const logger = require('./log.js');
const World = require('./world.js');
const physics = require('./physics.js');

class MatchManager {
  constructor(flags = {}) {
    this.flags = flags;
    this.phase = S.PHASE.LOBBY;
    this.seed = flags.seed !== null && flags.seed !== undefined ? flags.seed : 1;
    this.world = new World(this.seed);
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
    this.perfInterval = null;

    this.dt = 1 / S.CONST.TICK_HZ;

    // Chi so hieu nang perf
    this.tickTimes = [];
    this.maxTickMs = 0;
  }

  setNet(net) {
    this.net = net;
  }

  startLoop() {
    if (this.tickInterval) return;

    // Vong tick 30Hz
    const tickMs = Math.floor(1000 / S.CONST.TICK_HZ);
    this.tickInterval = setInterval(() => {
      const t0 = performance.now();
      this.tick(this.dt);
      const elapsed = performance.now() - t0;
      this.tickTimes.push(elapsed);
      if (elapsed > this.maxTickMs) this.maxTickMs = elapsed;
    }, tickMs);

    // Vong snapshot 20Hz
    const snapMs = Math.floor(1000 / S.CONST.SNAP_HZ);
    this.snapInterval = setInterval(() => {
      this.broadcastSnapshot();
    }, snapMs);

    // Ghi log perf moi 10 giay
    this.perfInterval = setInterval(() => {
      if (this.tickTimes.length === 0) return;
      const sum = this.tickTimes.reduce((a, b) => a + b, 0);
      const avg = Math.round((sum / this.tickTimes.length) * 100) / 100;
      const max = Math.round(this.maxTickMs * 100) / 100;

      logger.perf({
        tickAvgMs: avg,
        tickMaxMs: max,
        entityCount: this.players.size,
        clientCount: this.net ? this.net.clients.size : 0
      });

      this.tickTimes = [];
      this.maxTickMs = 0;
    }, 10000);
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
    if (this.perfInterval) {
      clearInterval(this.perfInterval);
      this.perfInterval = null;
    }
  }

  tick(dt) {
    this.currentTick++;

    const isLobby = (this.phase === S.PHASE.LOBBY);
    for (const player of this.players.values()) {
      player.inLobby = isLobby;
      physics.tickPlayer(player, this.world, dt);
    }
  }

  broadcastSnapshot() {
    if (!this.net) return;

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
      if (!player.client || player.disconnectedAt) continue;

      // Dong goi snapshot loc theo AOI (560px)
      const snapMsg = packSnapshot(player, allEnts, this.currentTick, null, [], S.CONST.AOI_RADIUS);
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

    const player = {
      id: client.id,
      reconnectKey: client.reconnectKey,
      name: defaultName,
      colors: { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' },
      isHost: isHost,
      client: client,
      joined: false,
      disconnectedAt: null,
      disconnectTimer: null,

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
    const player = this.players.get(client.id);
    if (!player) return;

    // Giu nhan vat trong vong RECONNECT_SEC (30 giay) khi rot mang
    player.disconnectedAt = Date.now();
    player.client = null;

    logger.info('match', `Player #${player.id} tam ngat ket noi, cho 30s de reconnect...`, { id: player.id });

    // Hen gio 30s de xoa han neu khong vao lai
    const reconnectTimeoutMs = (S.CONST.RECONNECT_SEC || 30) * 1000;
    player.disconnectTimer = setTimeout(() => {
      if (player.disconnectedAt) {
        this.players.delete(player.id);
        logger.info('match', `Player #${player.id} da het thoi gian reconnect (30s) -> xoa nhan vat.`);

        if (this.hostId === player.id) {
          const remaining = Array.from(this.players.values()).filter(p => !p.disconnectedAt);
          if (remaining.length > 0) {
            this.hostId = remaining[0].id;
            remaining[0].isHost = true;
          } else {
            this.hostId = null;
          }
        }
        this.broadcastLobby();
      }
    }, reconnectTimeoutMs);

    // Chuyen quyen host tam thoi neu can
    if (this.hostId === player.id) {
      const remaining = Array.from(this.players.values()).filter(p => !p.disconnectedAt);
      if (remaining.length > 0) {
        this.hostId = remaining[0].id;
        remaining[0].isHost = true;
      }
    }

    this.broadcastLobby();
  }

  onClientMessage(client, msg) {
    let player = this.players.get(client.id);

    // Kiem tra reconnectKey neu message la join
    if (msg.t === S.MSG.JOIN && msg.reconnectKey) {
      for (const existingPlayer of this.players.values()) {
        if (existingPlayer.reconnectKey === msg.reconnectKey && existingPlayer.disconnectedAt) {
          // Huy bo timer xoa
          if (existingPlayer.disconnectTimer) {
            clearTimeout(existingPlayer.disconnectTimer);
            existingPlayer.disconnectTimer = null;
          }

          // Xoa client tam cu
          this.players.delete(client.id);

          // Gan client moi vao nhan vat cu
          existingPlayer.client = client;
          existingPlayer.disconnectedAt = null;
          this.players.set(client.id, existingPlayer);
          player = existingPlayer;

          logger.info('match', `Player #${existingPlayer.id} reconnect thanh cong!`, { id: existingPlayer.id });

          this.net.send(client, {
            t: S.MSG.WELCOME,
            you: existingPlayer.id,
            seed: this.seed,
            isHost: (this.hostId === existingPlayer.id),
            reconnectKey: existingPlayer.reconnectKey,
            cfgHash: 'init_cfg',
            dev: !!this.flags.dev
          });

          this.broadcastLobby();
          return;
        }
      }
    }

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
      if (p.disconnectedAt) continue; // Khong hien thi nhan vat dang rot mang trong lobby list
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
