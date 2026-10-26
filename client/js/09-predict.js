// client/js/09-predict.js
// Du doan phia client (prediction), sua sai (reconciliation) va noi suy thuc the khac (interpolation).
// - Lay input va di chuyen theo buoc co dinh 1/TICK_HZ ngay trong vong ve (requestAnimationFrame),
//   dung CUNG ham S.MOVE.step voi server nen chay lai input chua ack ra dung vi tri server.
// - Hien thi noi suy giua 2 buoc theo thoi gian (man 60/144Hz van muot).
// - Khi bi sua sai, do lech duoc lam mo dan thay vi giat (lech qua xa thi nhay thang).
// Phu thuoc: client/js/00-boot.js, client/js/01-net.js, client/js/03-input.js, shared/01-constants.js, shared/22-move.js.

(function () {
  'use strict';

  const OP = window.OP = window.OP || {};
  const S = OP.S || window.OP_SHARED || {};

  const STEP_MS = 1000 / S.CONST.TICK_HZ;
  const MAX_STEPS_PER_FRAME = 5;
  const SNAP_DIST = 64;          // lech hon so px nay (dich chuyen, reconnect) thi nhay thang
  const SMOOTH_HALF_MS = 60;     // do lech sua sai giam mot nua sau moi 60ms

  const pending = [];            // input da gui, chua duoc server ack: { seq, mx, my, aim, btn }
  const entityBuffers = new Map(); // id -> [{ time, x, y, a, ... }]

  let seq = 0;
  let accMs = 0;
  let lastFrameT = 0;
  let hasServerState = false;
  let pred = { x: 0, y: 0, vx: 0, vy: 0, water: 0 };   // sau buoc moi nhat
  let prev = { x: 0, y: 0 };                           // truoc buoc moi nhat (de noi suy)
  let smooth = { x: 0, y: 0 };                         // do lech dang lam mo
  let moveOpts = { hasFruit: false, onBoat: false };

  function mapNow() {
    return (OP.GAME && OP.GAME.state && OP.GAME.state.map) || null;
  }

  function copyPos(dst, src) {
    dst.x = src.x;
    dst.y = src.y;
  }

  OP.PRED = {
    // Goi khi nhan welcome (vao moi hoac reconnect): server dem seq lai tu dau
    reset: function () {
      pending.length = 0;
      entityBuffers.clear();
      seq = 0;
      accMs = 0;
      lastFrameT = 0;
      hasServerState = false;
      smooth.x = 0;
      smooth.y = 0;
    },

    // Goi moi khung tu 10-main.js. Chay du so buoc 1/TICK_HZ, moi buoc lay input, du doan, gui server.
    frame: function (nowMs) {
      if (!lastFrameT) lastFrameT = nowMs;
      const frameMs = Math.min(250, nowMs - lastFrameT);
      lastFrameT = nowMs;

      // Lam mo do lech sua sai theo thoi gian that
      const k = Math.pow(0.5, frameMs / SMOOTH_HALF_MS);
      smooth.x *= k;
      smooth.y *= k;

      if (!hasServerState || !OP.NET || !OP.NET.isConnected()) {
        accMs = 0;
        return;
      }

      accMs += frameMs;
      let steps = 0;
      while (accMs >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
        accMs -= STEP_MS;
        steps++;

        const inp = OP.IN.getState();
        seq++;
        const cmd = { seq: seq, mx: inp.mx, my: inp.my, aim: inp.aim, btn: inp.btn };
        pending.push(cmd);

        copyPos(prev, pred);
        S.MOVE.step(pred, cmd, mapNow(), moveOpts);

        OP.NET.send({ t: 'in', seq: cmd.seq, mx: cmd.mx, my: cmd.my, aim: cmd.aim, btn: cmd.btn });
      }
      // Tab bi treo lau: bo phan du, khong don hang loat buoc
      if (steps >= MAX_STEPS_PER_FRAME) accMs = 0;

      OP.PRED.applyToState();
    },

    // Ghi vi tri hien thi (noi suy + lam mo) vao OP.GAME.state.me
    applyToState: function () {
      const me = OP.GAME && OP.GAME.state && OP.GAME.state.me;
      if (!me || !hasServerState) return;
      const alpha = Math.max(0, Math.min(1, accMs / STEP_MS));
      me.x = prev.x + (pred.x - prev.x) * alpha + smooth.x;
      me.y = prev.y + (pred.y - prev.y) * alpha + smooth.y;
      me.vx = pred.vx;
      me.vy = pred.vy;
      me.water = pred.water;
      if (OP.IN && OP.IN.getAim) me.aim = OP.IN.getAim();
    },

    onSnapshot: function (snap) {
      if (!snap || !snap.me) return;
      const now = Date.now();
      const state = OP.GAME.state;

      // Cac truong khong du doan (mau, the luc, ten, mau sac...) lay thang tu server
      if (!state.me) state.me = {};
      const keepAim = state.me.aim;
      Object.assign(state.me, snap.me);
      if (typeof keepAim === 'number') state.me.aim = keepAim;
      moveOpts = { hasFruit: !!snap.me.fruitId, onBoat: snap.me.onBoatId !== null && snap.me.onBoatId !== undefined };

      // 1. Bo input server da xu ly
      while (pending.length > 0 && pending[0].seq <= snap.ack) {
        pending.shift();
      }

      // 2. Chay lai input chua ack tu trang thai server, giong het server se lam
      const oldShown = { x: pred.x, y: pred.y };
      const st = { x: snap.me.x, y: snap.me.y, vx: snap.me.vx || 0, vy: snap.me.vy || 0, water: snap.me.water || 0 };
      const map = mapNow();
      let before = { x: st.x, y: st.y };
      for (let i = 0; i < pending.length; i++) {
        before = { x: st.x, y: st.y };
        S.MOVE.step(st, pending[i], map, moveOpts);
      }

      if (!hasServerState) {
        hasServerState = true;
        pred = st;
        copyPos(prev, pending.length > 0 ? before : st);
      } else {
        const dx = oldShown.x - st.x;
        const dy = oldShown.y - st.y;
        if (Math.hypot(dx, dy) > SNAP_DIST) {
          smooth.x = 0;
          smooth.y = 0;
          copyPos(prev, st);
        } else {
          // Giu hinh dang dung yen tren man hinh, roi keo dan ve vi tri dung
          smooth.x += dx;
          smooth.y += dy;
          prev.x += st.x - pred.x;
          prev.y += st.y - pred.y;
        }
        pred = st;
      }
      OP.PRED.applyToState();

      // 3. Luu buffer cho cac entity khac de noi suy
      if (Array.isArray(snap.ents)) {
        for (let i = 0; i < snap.ents.length; i++) {
          const e = snap.ents[i];
          if (!entityBuffers.has(e.i)) entityBuffers.set(e.i, []);
          const buf = entityBuffers.get(e.i);
          buf.push({ time: now, x: e.x, y: e.y, a: e.a, hp: e.hp, hm: e.hm, n: e.n, c: e.c });
          while (buf.length > 15) buf.shift();
        }
      }
    },

    // Noi suy cac entity khac tre INTERP_MS so voi hien tai
    update: function () {
      const now = Date.now();
      const renderTime = now - S.CONST.INTERP_MS;
      const state = OP.GAME && OP.GAME.state;
      if (!state || !state.ents) return;

      for (const [id, buf] of entityBuffers.entries()) {
        if (!buf || buf.length === 0) continue;

        // Ra khoi AOI (khong con trong snapshot) qua 1 giay thi xoa, tranh "bong ma" dung yen
        if (now - buf[buf.length - 1].time > 1000) {
          entityBuffers.delete(id);
          state.ents.delete(id);
          continue;
        }

        let ent = state.ents.get(id);
        if (!ent) {
          ent = { i: id, k: 'PLAYER' };
          state.ents.set(id, ent);
        }

        let s0 = buf[0];
        let s1 = buf[0];
        if (buf[buf.length - 1].time <= renderTime) {
          s0 = s1 = buf[buf.length - 1];
        } else if (buf[0].time < renderTime) {
          for (let i = 0; i < buf.length - 1; i++) {
            if (buf[i].time <= renderTime && buf[i + 1].time >= renderTime) {
              s0 = buf[i];
              s1 = buf[i + 1];
              break;
            }
          }
        }

        const total = s1.time - s0.time;
        const ratio = total > 0 ? (renderTime - s0.time) / total : 0;
        const nx = s0.x + (s1.x - s0.x) * ratio;
        const ny = s0.y + (s1.y - s0.y) * ratio;

        // Toc do de 05b biet dang di hay dung (hoat anh di bo)
        ent.vx = total > 0 ? (s1.x - s0.x) * 1000 / total : 0;
        ent.vy = total > 0 ? (s1.y - s0.y) * 1000 / total : 0;
        ent.x = nx;
        ent.y = ny;

        let da = s1.a - s0.a;
        while (da < -Math.PI) da += Math.PI * 2;
        while (da > Math.PI) da -= Math.PI * 2;
        ent.a = s0.a + da * ratio;
        ent.aim = ent.a;

        ent.hp = s1.hp;
        ent.hm = s1.hm;
        ent.n = s1.n;
        ent.name = s1.n;
        ent.c = s1.c;
        ent.colors = s1.c;
      }
    }
  };
})();
