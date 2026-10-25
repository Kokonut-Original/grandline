// client/js/09-predict.js
// Xu ly du doan phia client (prediction), sua sai (reconciliation) va noi suy thuc the (interpolation).
// Phu thuoc: client/js/00-boot.js, shared/01-constants.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  const S = OP.S || (typeof globalThis !== 'undefined' ? globalThis.OP_SHARED : {});

  const pendingInputs = [];
  const entityBuffers = new Map(); // id -> [{ time, x, y, a, ... }]

  let serverPos = { x: 240, y: 135 };
  let predictedPos = { x: 240, y: 135 };
  let lastAck = 0;

  OP.PRED = {
    init: function () {
      pendingInputs.length = 0;
      entityBuffers.clear();
      serverPos = { x: 240, y: 135 };
      predictedPos = { x: 240, y: 135 };
      lastAck = 0;
    },

    addInput: function (inputObj) {
      // inputObj: { seq, mx, my, aim, btn, dt }
      pendingInputs.push(inputObj);

      // Du doan ngay lap tuc vi tri tren client
      const moveSpeed = (S.CONST && S.CONST.MOVE_SPEED) ? S.CONST.MOVE_SPEED : 90;
      let mx = inputObj.mx;
      let my = inputObj.my;
      const len = Math.hypot(mx, my);
      if (len > 1) {
        mx /= len;
        my /= len;
      }

      predictedPos.x += mx * moveSpeed * inputObj.dt;
      predictedPos.y += my * moveSpeed * inputObj.dt;

      if (OP.GAME && OP.GAME.state) {
        if (!OP.GAME.state.me) {
          OP.GAME.state.me = { x: predictedPos.x, y: predictedPos.y, aim: inputObj.aim };
        } else {
          OP.GAME.state.me.x = predictedPos.x;
          OP.GAME.state.me.y = predictedPos.y;
          OP.GAME.state.me.aim = inputObj.aim;
        }
      }
    },

    onSnapshot: function (snap) {
      if (!snap || !snap.me) return;

      const now = Date.now();
      lastAck = snap.ack;
      serverPos.x = snap.me.x;
      serverPos.y = snap.me.y;

      // 1. Loc bo cac input da duoc server ack
      while (pendingInputs.length > 0 && pendingInputs[0].seq <= lastAck) {
        pendingInputs.shift();
      }

      // 2. Reconciliation: Chay lai cac input chua duoc server ack tu vi tri server xac nhan
      const moveSpeed = (S.CONST && S.CONST.MOVE_SPEED) ? S.CONST.MOVE_SPEED : 90;
      predictedPos.x = serverPos.x;
      predictedPos.y = serverPos.y;

      for (let i = 0; i < pendingInputs.length; i++) {
        const inp = pendingInputs[i];
        let mx = inp.mx;
        let my = inp.my;
        const len = Math.hypot(mx, my);
        if (len > 1) {
          mx /= len;
          my /= len;
        }
        predictedPos.x += mx * moveSpeed * inp.dt;
        predictedPos.y += my * moveSpeed * inp.dt;
      }

      if (OP.GAME && OP.GAME.state) {
        if (!OP.GAME.state.me) {
          OP.GAME.state.me = Object.assign({}, snap.me);
        }
        OP.GAME.state.me.x = predictedPos.x;
        OP.GAME.state.me.y = predictedPos.y;
        OP.GAME.state.me.hp = snap.me.hp;
        OP.GAME.state.me.hm = snap.me.hm;
        OP.GAME.state.me.stamina = snap.me.stamina;
      }

      // 3. Luu buffer cho cac entity khac de noi suy
      if (Array.isArray(snap.ents)) {
        for (let i = 0; i < snap.ents.length; i++) {
          const e = snap.ents[i];
          if (!entityBuffers.has(e.i)) {
            entityBuffers.set(e.i, []);
          }
          const buf = entityBuffers.get(e.i);
          buf.push({
            time: now,
            x: e.x,
            y: e.y,
            a: e.a,
            hp: e.hp,
            hm: e.hm,
            n: e.n,
            c: e.c
          });

          // Giu toi da 15 snapshot gan nhat
          while (buf.length > 15) {
            buf.shift();
          }
        }
      }
    },

    update: function () {
      const now = Date.now();
      const interpMs = (S.CONST && S.CONST.INTERP_MS) ? S.CONST.INTERP_MS : 100;
      const renderTime = now - interpMs;

      const state = OP.GAME && OP.GAME.state;
      if (!state || !state.ents) return;

      // Noi suy vi tri cua tung entity
      for (const [id, buf] of entityBuffers.entries()) {
        if (!buf || buf.length === 0) continue;

        let ent = state.ents.get(id);
        if (!ent) {
          ent = { i: id, k: 'PLAYER' };
          state.ents.set(id, ent);
        }

        // Truong hop chi co 1 snapshot
        if (buf.length === 1 || buf[0].time >= renderTime) {
          ent.x = buf[0].x;
          ent.y = buf[0].y;
          ent.a = buf[0].a;
          ent.hp = buf[0].hp;
          ent.hm = buf[0].hm;
          ent.n = buf[0].n;
          ent.c = buf[0].c;
          continue;
        }

        // Truong hop renderTime vuot qua snapshot cuoi
        if (buf[buf.length - 1].time <= renderTime) {
          const last = buf[buf.length - 1];
          ent.x = last.x;
          ent.y = last.y;
          ent.a = last.a;
          ent.hp = last.hp;
          ent.hm = last.hm;
          ent.n = last.n;
          ent.c = last.c;
          continue;
        }

        // Tim 2 snapshot bao quanh renderTime de lerp
        let s0 = null;
        let s1 = null;
        for (let i = 0; i < buf.length - 1; i++) {
          if (buf[i].time <= renderTime && buf[i + 1].time >= renderTime) {
            s0 = buf[i];
            s1 = buf[i + 1];
            break;
          }
        }

        if (s0 && s1) {
          const total = s1.time - s0.time;
          const ratio = total > 0 ? (renderTime - s0.time) / total : 0;

          ent.x = s0.x + (s1.x - s0.x) * ratio;
          ent.y = s0.y + (s1.y - s0.y) * ratio;

          // Noi suy goc ngam
          let da = s1.a - s0.a;
          while (da < -Math.PI) da += Math.PI * 2;
          while (da > Math.PI) da -= Math.PI * 2;
          ent.a = s0.a + da * ratio;

          ent.hp = s1.hp;
          ent.hm = s1.hm;
          ent.n = s1.n;
          ent.c = s1.c;
        }
      }
    }
  };
})();
