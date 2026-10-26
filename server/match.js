// server/match.js
// May trang thai tran dau, vong tick 30Hz (bo tich luy thoi gian), hang doi input theo seq,
// AOI snapshot 20Hz, giu nhan vat 30s khi rot mang, lenh dev va log perf.
// Phu thuoc: shared/01-constants.js, shared/02-enums.js, shared/03-protocol.js, shared/05-rng.js,
//            shared/14-data-islands.js, server/snapshot.js, server/log.js, server/world.js,
//            server/physics.js, server/devcmd.js, server/net.js (ham lam sach du lieu).

'use strict';

require('../shared/00-namespace.js');
require('../shared/01-constants.js');
require('../shared/02-enums.js');
require('../shared/03-protocol.js');
require('../shared/05-rng.js');
require('../shared/14-data-islands.js');

const S = globalThis.OP_SHARED;
const C = S.CONST;
const { packSnapshot } = require('./snapshot.js');
const logger = require('./log.js');
const World = require('./world.js');
const physics = require('./physics.js');
const devcmd = require('./devcmd.js');
const NetManager = require('./net.js');

class MatchManager {
  constructor(flags = {}) {
    this.flags = flags;
    this.phase = S.PHASE.LOBBY;
    this.seed = flags.seed !== null && flags.seed !== undefined ? flags.seed : 1;
    this.world = new World(this.seed);
    this.rng = S.RNG.create((this.seed * 31 + 7) >>> 0);
    this.players = new Map(); // player.id -> player (moi nhan vat dung 1 key duy nhat)
    this.hostId = null;

    this.botsCount = (typeof flags.bots === 'number') ? flags.bots : (C.MAX_PLAYERS - 1);
    this.botMix = { easy: 0.4, normal: 0.4, hard: 0.2 };

    this.net = null;
    this.currentTick = 0;
    this.tickInterval = null;
    this.snapInterval = null;
    this.perfInterval = null;
    this.dt = 1 / C.TICK_HZ;
    this.accMs = 0;
    this.lastLoopT = 0;

    this.tickTimes = [];
    this.maxTickMs = 0;
  }

  setNet(net) {
    this.net = net;
  }

  startLoop() {
    if (this.tickInterval) return;

    // Bo tich luy: setInterval cua Node lech vai ms, nen cong don thoi gian that
    // va chay du so tick de trung binh dung TICK_HZ (khop nhip 30 input/giay cua client)
    const tickMs = 1000 / C.TICK_HZ;
    this.lastLoopT = performance.now();
    this.tickInterval = setInterval(() => {
      const now = performance.now();
      this.accMs += Math.min(250, now - this.lastLoopT);
      this.lastLoopT = now;
      let n = 0;
      while (this.accMs >= tickMs && n < 5) {
        this.accMs -= tickMs;
        this.safeTick();
        n++;
      }
      if (n >= 5) this.accMs = 0;
    }, 5);

    this.snapInterval = setInterval(() => {
      try {
        this.broadcastSnapshot();
      } catch (e) {
        logger.error('match', 'Loi khi gui snapshot', { err: String(e && e.stack || e) });
      }
    }, Math.floor(1000 / C.SNAP_HZ));

    // Ghi log perf moi 10 giay
    this.perfInterval = setInterval(() => {
      if (this.tickTimes.length === 0) return;
      const sum = this.tickTimes.reduce((a, b) => a + b, 0);
      logger.perf({
        tickAvgMs: Math.round((sum / this.tickTimes.length) * 100) / 100,
        tickMaxMs: Math.round(this.maxTickMs * 100) / 100,
        entityCount: this.players.size,
        clientCount: this.net ? this.net.clients.size : 0
      });
      this.tickTimes = [];
      this.maxTickMs = 0;
    }, 10000);
  }

  stopLoop() {
    for (const k of ['tickInterval', 'snapInterval', 'perfInterval']) {
      if (this[k]) {
        clearInterval(this[k]);
        this[k] = null;
      }
    }
  }

  // Loi trong 1 tick chi ghi log, khong lam sap ca tran
  safeTick() {
    const t0 = performance.now();
    try {
      this.tick(this.dt);
    } catch (e) {
      logger.error('match', 'Loi trong tick', { tick: this.currentTick, err: String(e && e.stack || e) });
    }
    const elapsed = performance.now() - t0;
    this.tickTimes.push(elapsed);
    if (elapsed > this.maxTickMs) this.maxTickMs = elapsed;
  }

  tick(dt) {
    this.currentTick++;
    const safe = (this.phase === S.PHASE.LOBBY);
    for (const p of this.players.values()) {
      if (p.disconnectedAt) continue;
      this.processInputs(p);
      physics.tickEnv(p, this.world, dt, { safe: safe });
    }
  }

  // Moi tick duoc 1 luot di chuyen, tich toi da INPUT_BURST luot de bu goi tin den don cuc.
  // Trung binh khong qua TICK_HZ buoc/giay nen khong the gui nhieu input de chay nhanh hon.
  processInputs(p) {
    p.moveBudget = Math.min(C.INPUT_BURST, p.moveBudget + 1);
    while (p.inputQueue.length > 0 && p.moveBudget >= 1) {
      const cmd = p.inputQueue.shift();
      physics.applyInput(p, cmd, this.world);
      p.aim = cmd.aim;
      p.btn = cmd.btn;
      p.lastInputSeq = cmd.seq;
      p.moveBudget -= 1;
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
        hp: Math.ceil(p.hp),
        hm: p.hpMax,
        n: p.name,
        c: p.colors,
        wa: p.water
      });
    }

    for (const player of this.players.values()) {
      if (!player.client || player.disconnectedAt) continue;
      const snapMsg = packSnapshot(player, allEnts, this.currentTick, null, [], C.AOI_RADIUS);
      this.net.send(player.client, snapMsg);
    }
  }

  playerOf(client) {
    if (!client) return null;
    const id = (client.playerId !== undefined) ? client.playerId : client.id;
    return this.players.get(id) || null;
  }

  setHost(id) {
    this.hostId = id;
    for (const p of this.players.values()) {
      p.isHost = (p.id === id);
    }
  }

  // Chuyen host cho nguoi dang ket noi dau tien neu host hien tai roi di
  passHostFrom(id) {
    if (this.hostId !== id) return;
    const next = Array.from(this.players.values()).find(p => !p.disconnectedAt && p.id !== id);
    this.setHost(next ? next.id : null);
  }

  createPlayer(client) {
    const spot = this.world.getIslandSpawn('fortress');
    return {
      id: client.id,
      kind: 'PLAYER',
      reconnectKey: client.reconnectKey,
      name: `Hai tac #${client.id}`,
      colors: { hat: '#d9534f', shirt: '#337ab7', hair: '#292b2c' },
      isHost: false,
      client: client,
      joined: false,
      disconnectedAt: null,
      disconnectTimer: null,

      x: spot.x,
      y: spot.y,
      vx: 0,
      vy: 0,
      aim: 0,
      btn: 0,
      alive: true,
      hp: C.HP_BASE,
      hpMax: C.HP_BASE,
      stamina: C.STAMINA_MAX,
      water: S.WATER.LAND,
      onBoatId: null,
      fruitId: null,

      inputQueue: [],
      lastQueuedSeq: 0,
      lastInputSeq: 0,
      moveBudget: C.INPUT_BURST,
      lastChatAt: 0
    };
  }

  sendWelcome(client, player) {
    this.net.send(client, {
      t: S.MSG.WELCOME,
      you: player.id,
      seed: this.seed,
      isHost: (this.hostId === player.id),
      reconnectKey: player.reconnectKey,
      cfgHash: 'init_cfg',
      dev: !!this.flags.dev
    });
    // Client vao giua chung can biet dang o phase nao (an/hien lobby)
    this.net.send(client, { t: S.MSG.PHASE, phase: this.phase, t0: Date.now(), data: {} });
  }

  onClientConnect(client) {
    client.playerId = client.id;
    const player = this.createPlayer(client);
    this.players.set(player.id, player);
    if (this.hostId === null) this.setHost(player.id);
    else player.isHost = false;

    this.sendWelcome(client, player);
    this.broadcastLobby();
  }

  onClientDisconnect(client) {
    const player = this.playerOf(client);
    // Socket cu dong sau khi nguoi choi da reconnect bang socket moi: bo qua
    if (!player || player.client !== client) return;

    player.disconnectedAt = Date.now();
    player.client = null;
    player.inputQueue.length = 0;
    logger.info('match', `Player #${player.id} tam ngat ket noi, cho ${C.RECONNECT_SEC}s de reconnect...`, { id: player.id });

    player.disconnectTimer = setTimeout(() => {
      if (!player.disconnectedAt) return;
      this.players.delete(player.id);
      logger.info('match', `Player #${player.id} het thoi gian reconnect -> xoa nhan vat.`);
      this.passHostFrom(player.id);
      this.broadcastLobby();
    }, C.RECONNECT_SEC * 1000);

    this.passHostFrom(player.id);
    this.broadcastLobby();
  }

  // Gan socket moi vao nhan vat cu (cung reconnectKey). Tra ve true neu thanh cong.
  tryReconnect(client, key) {
    let existing = null;
    for (const p of this.players.values()) {
      if (p.reconnectKey === key && p.disconnectedAt) {
        existing = p;
        break;
      }
    }
    if (!existing) return false;

    if (existing.disconnectTimer) {
      clearTimeout(existing.disconnectTimer);
      existing.disconnectTimer = null;
    }

    // Bo nhan vat tam vua tao cho socket moi
    const temp = this.playerOf(client);
    if (temp && temp !== existing) {
      this.players.delete(temp.id);
      if (this.hostId === temp.id) this.setHost(existing.id);
    }

    client.playerId = existing.id;
    existing.client = client;
    existing.disconnectedAt = null;
    // Client moi dem seq lai tu 1
    existing.inputQueue.length = 0;
    existing.lastQueuedSeq = 0;
    existing.lastInputSeq = 0;
    if (this.hostId === null) this.setHost(existing.id);

    logger.info('match', `Player #${existing.id} reconnect thanh cong!`, { id: existing.id });
    this.sendWelcome(client, existing);
    this.broadcastLobby();
    return true;
  }

  onClientMessage(client, msg) {
    if (msg.t === S.MSG.JOIN && typeof msg.reconnectKey === 'string' && this.tryReconnect(client, msg.reconnectKey)) {
      return;
    }

    const player = this.playerOf(client);
    if (!player || player.client !== client) return;

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
      case S.MSG.ACT:
        this.handleAct(player, msg);
        break;
      case S.MSG.PING:
        this.net.send(client, { t: S.MSG.PONG, c: Number(msg.c) || 0, s: Date.now() });
        break;
    }
  }

  handleInput(player, msg) {
    const seq = Number(msg.seq);
    // Bo goi trung hoac cu (seq phai tang dan)
    if (!Number.isInteger(seq) || seq <= player.lastQueuedSeq) return;
    player.lastQueuedSeq = seq;

    const aim = Number(msg.aim);
    const btn = Number(msg.btn);
    player.inputQueue.push({
      seq: seq,
      mx: msg.mx,
      my: msg.my,
      aim: Number.isFinite(aim) ? aim : 0,
      btn: Number.isInteger(btn) && btn > 0 ? (btn & 0xffff) : 0
    });
    // Client gui nhanh hon server xu ly qua lau: bo lenh cu nhat (client se duoc sua sai)
    while (player.inputQueue.length > C.INPUT_QUEUE_MAX) {
      player.inputQueue.shift();
    }
  }

  handleJoin(player, msg) {
    const name = NetManager.cleanText(msg.name, 24);
    if (name) player.name = name;
    if (msg.colors && typeof msg.colors === 'object') {
      player.colors = {
        hat: NetManager.cleanColor(msg.colors.hat, player.colors.hat),
        shirt: NetManager.cleanColor(msg.colors.shirt, player.colors.shirt),
        hair: NetManager.cleanColor(msg.colors.hair, player.colors.hair)
      };
    }
    player.joined = true;
    this.broadcastLobby();
  }

  handleCfg(player, msg) {
    if (this.hostId !== player.id) return;

    if (typeof msg.bots === 'number' && Number.isFinite(msg.bots)) {
      this.botsCount = Math.max(0, Math.min(C.MAX_PLAYERS - 1, Math.floor(msg.bots)));
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
    if (this.hostId !== player.id) return;
    if (this.phase !== S.PHASE.LOBBY) return;

    // Ban dai bac (LAUNCH) lam o M11. Tam thoi: vao thang PLAY, dat moi nguoi len 1 dao ngau nhien
    // theo seed (--no-launch: dao trung tam nhu BIEN-CHUNG muc 14).
    this.phase = S.PHASE.PLAY;
    for (const p of this.players.values()) {
      const spot = this.flags.noLaunch ? this.world.getIslandSpawn('fortress') : this.world.getRandomSpawn(this.rng);
      this.teleportPlayer(p, spot.x, spot.y);
    }

    logger.info('match', 'Bat dau tran', { players: this.players.size, bots: this.botsCount });
    this.net.broadcast({
      t: S.MSG.PHASE,
      phase: this.phase,
      t0: Date.now(),
      data: { bots: this.botsCount, botMix: this.botMix }
    });
  }

  handleAct(player, msg) {
    if (msg.a === S.ACT.DEV) {
      this.runDev(player, String(msg.arg || ''));
    }
  }

  runDev(player, line) {
    const res = devcmd.run(this, player, line);
    if (player.client) {
      this.net.send(player.client, { t: S.MSG.TOAST, text: res.text, kind: res.ok ? 'info' : 'warn' });
    }
  }

  teleportPlayer(player, x, y) {
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
  }

  handleChat(player, msg) {
    const text = NetManager.cleanText(msg.text, 120);
    if (!text) return;

    // Chong spam: toi da CHAT_MAX_PER_SEC tin moi giay
    const now = Date.now();
    if (now - player.lastChatAt < 1000 / C.CHAT_MAX_PER_SEC) return;
    player.lastChatAt = now;

    if (text.startsWith('/')) {
      this.runDev(player, text);
      return;
    }

    this.net.broadcast({ t: S.MSG.CHAT, from: player.name, text: text });
  }

  broadcastLobby() {
    if (!this.net) return;
    const list = [];
    for (const p of this.players.values()) {
      if (p.disconnectedAt) continue;
      list.push({ id: p.id, name: p.name, colors: p.colors, isHost: (p.id === this.hostId) });
    }
    this.net.broadcast({ t: S.MSG.LOBBY, players: list, bots: this.botsCount, botMix: this.botMix });
  }
}

module.exports = MatchManager;
