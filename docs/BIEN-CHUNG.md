# BIẾN CHUNG – HỢP ĐỒNG GIỮA CÁC FILE

**Nguồn sự thật:** giá trị thật nằm trong `shared/*.js`. File này mô tả tên, kiểu và ý nghĩa.

**Hai file phải luôn khớp nhau.** Sửa một bên thì sửa cả bên kia, và ghi vào mục 15 (lịch sử thay đổi).

---

## 1. Namespace

### Shared – dùng chung server + client

Mọi file trong `shared/` bọc như sau, không bao giờ dùng `export`:

```js
(function (root) {
  'use strict';
  const S = root.OP_SHARED = root.OP_SHARED || {};
  S.CONST = Object.freeze({ /* ... */ });
})(typeof globalThis !== 'undefined' ? globalThis : window);
```

Server nạp shared như sau:

```js
require('../shared/01-constants.js');
const S = globalThis.OP_SHARED;
```

### Client

Mọi file trong `client/js/` đăng ký vào `window.OP`:

| Namespace | File | Nhiệm vụ |
|---|---|---|
| `OP.S` | — | Bí danh của `window.OP_SHARED` |
| `OP.NET` | 01 | Kết nối, gửi, nhận |
| `OP.PX` | 02a | Lõi pixel |
| `OP.PAL` | 02b | Bảng màu |
| `OP.SPR` | 02c–02f | Sprite |
| `OP.IN` | 03 | Input |
| `OP.CAM` | 04 | Camera |
| `OP.R` | 05a–05c | Render thế giới |
| `OP.HUD` | 06 | HUD |
| `OP.UI` | 07a–07f | Giao diện DOM |
| `OP.SFX` | 08 | Âm thanh |
| `OP.PRED` | 09 | Dự đoán, nội suy |
| `OP.GAME` | 10 | Vòng lặp chính, trạng thái client |

**Thứ tự nạp:** file nạp sau được dùng file nạp trước. Khi file vừa chạy chỉ ĐĂNG KÝ hàm, việc khởi tạo thật nằm trong `OP.GAME.boot()`.

### Server

CommonJS. Mỗi file `module.exports = { ... }`.

---

## 2. Quy ước

**Đặt tên**
- Biến, hàm: `camelCase`.
- Hằng: `UPPER_SNAKE`.
- id dữ liệu: `lower_snake`, dạng chuỗi (`'mera'`, `'yoru'`).

**Đơn vị**
- Tọa độ: pixel thế giới (float).
- Tile: `CONST.TILE` = 16px.
- Góc: radian, 0 là hướng sang phải.
- Thời gian trong data: **giây** (float).
- Thời gian mạng: `tick` (int).

**Giá trị số**
- Sát thương, máu: số nguyên sau khi làm tròn.
- Hệ số kháng: `1` là bình thường, `0` là miễn, `>1` là yếu.

---

## 3. CONST (`shared/01-constants.js`)

**Bản đồ & hiển thị**

| Tên | Giá trị | Ý nghĩa |
|---|---|---|
| TILE | 16 | Kích thước tile (px) |
| MAP_TILES | 320 | Map là 320×320 tile |
| VIEW_W / VIEW_H | 480 / 270 | Kích thước worldCanvas logic |

**Mạng & server**

| Tên | Giá trị | Ý nghĩa |
|---|---|---|
| PORT | 8080 | Cổng mặc định |
| TICK_HZ | 30 | Tick mô phỏng server |
| SNAP_HZ | 20 | Snapshot mỗi giây |
| BOT_HZ | 10 | Tần suất cập nhật bot |
| INTERP_MS | 100 | Độ trễ nội suy phía client |
| AOI_RADIUS | 560 | Bán kính vùng quan tâm (px) |
| MAX_PLAYERS | 32 | Số người tối đa |
| RECONNECT_SEC | 30 | Giữ nhân vật khi rớt mạng |
| INPUT_MAX_PER_SEC | 60 | Server bỏ qua input vượt mức này |

**Chỉ số người chơi**

| Tên | Giá trị | Ý nghĩa |
|---|---|---|
| HP_BASE | 100 | Máu cơ bản |
| STAMINA_MAX | 100 | Thể lực tối đa |
| STAMINA_REGEN | 15 | Hồi thể lực mỗi giây |
| HAKI_MAX | 100 | Haki tối đa |
| HAKI_REGEN | 6 | Hồi Haki mỗi giây |
| MOVE_SPEED | 90 | Tốc độ đi (px/giây) |
| PLAYER_RADIUS | 6 | Bán kính va chạm người chơi |

**Nước**

| Tên | Giá trị | Ý nghĩa |
|---|---|---|
| SWIM_MULT | 0.5 | Hệ số tốc độ bơi |
| SHALLOW_MULT_FRUIT | 0.7 | Tốc độ người có trái ở nước nông |
| SHALLOW_MULT | 0.8 | Tốc độ người thường ở nước nông |
| DROWN_PCT_PER_SEC | 0.17 | % máu tối đa mất mỗi giây khi chìm |
| SWIM_STAMINA_COST | 6 | Thể lực tốn mỗi giây khi bơi |

**Inventory**

| Tên | Giá trị |
|---|---|
| BAG_SLOTS | 6 |
| ROKU_SLOTS | 2 |
| ROKU_SLOTS_NOFRUIT | 3 |

**Luồng trận**

| Tên | Giá trị | Ý nghĩa |
|---|---|---|
| LAUNCH_SEC | 60 | Thời gian giai đoạn bắn đại bác |
| LAUNCH_SCATTER_TILES | 6 | Độ lệch tối đa khi nhả lực sai |
| LAND_INVULN_SEC | 2 | Bất tử sau khi đáp |
| AIRDROP_START_SEC | 180 | Thính đầu tiên |
| AIRDROP_EVERY_SEC | 150 | Chu kỳ thính |
| AIRDROP_OPEN_SEC | 3 | Thời gian mở thính |
| BUSTER_AT_SEC | [480, 900] | Thời điểm 2 lần Buster Call |
| BUSTER_WARN_SEC | 30 | Thời gian cảnh báo |
| BUSTER_DUR_SEC | 20 | Thời gian pháo kích |
| BUSTER_DMG | 35 | Sát thương mỗi phát |
| YONKO_UPDATE_SEC | 30 | Chu kỳ cập nhật Tứ Hoàng |
| YONKO_REVEAL_EVERY | 45 | Chu kỳ lộ vị trí |
| YONKO_REVEAL_SEC | 5 | Thời gian lộ vị trí |
| BOSS_RESPAWN_SEC | 240 | Hồi sinh boss |
| FRUIT_REBIRTH_SEC | 20 | Trái tái sinh sau khi chủ chết |

**Tiền truy nã**

| Tên | Giá trị |
|---|---|
| BOUNTY_KILL | 10 |
| BOUNTY_STEAL_PCT | 0.25 |
| BOUNTY_BOSS | 5 |
| YONKO_STEAL_PCT | 0.5 |

**Thức tỉnh**

| Tên | Giá trị |
|---|---|
| AWAKEN_KILLS | 3 |
| AWAKEN_R_CD_MULT | 0.7 |
| AWAKEN_R_DMG_MULT | 1.5 |

**Nạp R:** `R_CHARGE_DMG` = 150, `R_CHARGE_PASSIVE_SEC` = 60.

---

## 4. ENUM (`shared/02-enums.js`)

Mọi enum dùng `Object.freeze`, giá trị là chuỗi.

| Enum | Giá trị |
|---|---|
| DMG | SLASH, BLUNT, BULLET, EXPLOSION, FIRE, ICE, LIGHTNING, POISON, MAGMA, LIGHT, SAND, SMOKE, SNOW, PURE |
| PHYSICAL (mảng) | [SLASH, BLUNT, BULLET, EXPLOSION] |
| FRUIT_CLASS | LOGIA, PARAMECIA, ZOAN |
| TIER | C, B, A, S, MYTHIC |
| TIER_COLOR | C `#cfcfcf`, B `#5ac54f`, A `#3e8edf`, S `#a34fd8`, MYTHIC `#f4c430` |
| TIER_MULT | C 0.9, B 1.0, A 1.1, S 1.2, MYTHIC 1.3 |
| SWORD_GRADE | NORMAL, WAZAMONO, RYO, O, SAIJO |
| WEAPON_KIND | SWORD, BLUNT, GUN, SPECIAL |
| ITEM_KIND | FRUIT, WEAPON, CONSUMABLE, ARMOR, DIAL, HAKI_SHARD, SCROLL, AWAKEN |
| HAKI | ARM, OBS, CONQ |
| ROKU | soru, geppo, tekkai, shigan, rankyaku, kamie |
| ENT | PLAYER, PROJ, ITEM, CHEST, BOSS, MOB, BOAT, AIRDROP, HAZARD |
| WATER | LAND = 0, SHALLOW = 1, DEEP = 2 (số) |
| PHASE | LOBBY, LAUNCH, PLAY, END |
| CROSS | NONE, SHORT, FLY, TELEPORT |
| STATUS | burn, slow, stun, root, poison, fruitLock, wet, invuln, silence, negative, airborne, intangibleOff |
| BOT_LEVEL | easy, normal, hard |
| EMOTE | laugh, shock, cry, clap |

**TILE (số, dùng trong map)**

| Giá trị | Tên |
|---|---|
| 0 | DEEP |
| 1 | SHALLOW |
| 2 | SAND |
| 3 | GRASS |
| 4 | DIRT |
| 5 | STONE |
| 6 | WALL |
| 7 | WOOD |
| 8 | ICE |
| 9 | LAVA |
| 10 | SNOW |
| 11 | QUICKSAND |
| 12 | DOCK |
| 13 | BRIDGE |
| 14 | TREE |
| 15 | HOUSE_WALL |
| 16 | FLOOR |

**Tile chặn di chuyển:** WALL, TREE, HOUSE_WALL.

---

## 5. Schema dữ liệu (shared/1x-data-*.js)

Mỗi file dữ liệu xuất ra một object, key là id.

```js
// S.FRUITS (10-data-fruits.js)
mera: {
  id: 'mera', name: 'Mera Mera', cls: 'LOGIA', tier: 'A',
  intangible: true,                 // chỉ Logia (yami = false)
  cross: 'NONE',                    // khả năng qua biển, theo CROSS
  resist: { MAGMA: 2 },             // hệ số nhận sát thương theo loại
  passive: { desc: '...', burnSec: 3 },
  q: { name: '...', cd: 5, dmg: 14, dmgType: 'FIRE', range: 160, desc: '...' },
  e: { ... }, r: { ... },
  awaken: { desc: '...' },
  sfx: { q: 'fire', e: 'fire', r: 'explosion' },
  color: '#ff6a00',                 // màu chủ đạo cho hiệu ứng / icon
}

// S.WEAPONS (11)
yoru: {
  id, name, kind: 'SWORD', tier: 'MYTHIC', grade: 'SAIJO',
  dmg, dmgType: 'SLASH', rate, range, heavy: { mult: 2, stamina: 15 },
  seastone: 0,                      // số giây khóa trái (0 = không)
  ammo: null | { mag, reload },
  special: { ... }, sfx: 'slash',
}

// S.ITEMS (12): consumable, armor, dial, haki shard, scroll, awaken
meat:      { id, name, kind: 'CONSUMABLE', tier: 'C', useSec: 2, heal: 40, stack: 3 }
armor_2:   { id, name, kind: 'ARMOR', tier: 'B', absorb: 0.35, durability: 75 }
haki_shard_arm: { id, name, kind: 'HAKI_SHARD', tier: 'A', haki: 'ARM' }
scroll_soru:    { id, name, kind: 'SCROLL', tier: 'B', roku: 'soru',
                  stamina: 20, cd: 3, params: { dist: 64, invuln: 0.2 } }

// S.BOSSES (13)
{ id, name, hp, speed, radius, attacks: [ { id, telegraph, dmg, dmgType, range, cd } ],
  drops: [ { pool: 'A', chance: 1 }, ... ], island }

// S.ISLANDS (14)
{ id, name, center: [tx, ty], radius, biome, boss, docks: 2,
  props: { trees, houses, chests } }

// S.BOATS (15)
{ id, name, seats, speed, hp, fuel: null | 60, cannon: null | { dmg, cd, aoe } }

// S.ZONE (16)
[ { wait, shrink, radiusPct, dps }, ... ]   // 7 pha

// S.LOOT_POOLS (12)
{ C: [ids], B: [ids], A: [...], S: [...], MYTHIC: [...] }
```

---

## 6. Entity phía server

```js
player = {
  id, kind: 'PLAYER', isBot, botLevel, name, colors: { hat, shirt, hair },
  x, y, vx, vy, aim, facing,
  alive, hp, hpMax, stamina, haki, shield,
  water,                            // WATER: 0 | 1 | 2
  onBoatId: null,
  fruitId: null, fruitAwakened: false,
  zoanForm: false,
  weapons: [id | null, id | null], activeWeapon: 0,
  ammo: [n, n],
  armor: { id, durability } | null,
  dial: id | null,
  bag: [ { id, n } | null ...6 ],
  hakiLv: { ARM: 0, OBS: 0, CONQ: 0 },
  hakiArmOn: false,
  roku: [id | null, ...],
  cd: { q, e, r, soru, ... },       // giây còn lại
  rCharge: 0,                       // 0..1
  status: { burn: { t, src, dps }, ... },
  bounty: 0, kills: 0, dmgDealt: 0,
  title: null | 'YONKO',
  placement: null, deathTime: null,
  lastInputSeq: 0,
}
```

**Các entity khác**

| Entity | Trường chính |
|---|---|
| proj | id, kind:'PROJ', owner, x, y, vx, vy, life, dmg, dmgType, behavior, radius, pierce, hakiCoated, seastone |
| item | id, kind:'ITEM', itemId, n, x, y |
| boss | id, kind:'BOSS', bossId, x, y, hp, state, target, home |
| boat | id, kind:'BOAT', boatId, x, y, angle, hp, fuel, seats: [pid...] |
| airdrop | id, kind:'AIRDROP', x, y, landed, openBy, openT |
| hazard | id, kind:'HAZARD', type, x, y, r, life, dps, dmgType, owner (vũng dung nham, Room, vùng độc, lồng chim...) |

---

## 7. Giao thức mạng (`shared/03-protocol.js`)

Mọi message là JSON có trường `t`. Tên `t` lấy từ `S.MSG`.

### Client → Server

| t | Trường | Khi nào |
|---|---|---|
| `join` | name, colors, reconnectKey? | Mở kết nối |
| `chat` | text (≤ 120 ký tự) | Gửi chat |
| `cfg` | bots, botMix | Host chỉnh trong lobby |
| `start` | — | Host bắt đầu |
| `aim_launch` | tx, ty | Chọn điểm đáp |
| `fire_launch` | power (0..1) | Bắn đại bác |
| `in` | seq, mx, my (−1..1), aim, btn (bitmask) | 30 lần/giây |
| `act` | a, arg | Hành động rời rạc |
| `ping` | c (giờ client) | Đo ping |

**Các giá trị `act.a`:**
- `pickup` (arg = entId)
- `eat` (arg = vị trí ô túi)
- `eat_confirm` (arg = vị trí ô túi)
- `drop` (arg = ô)
- `use` (arg = ô)
- `swap` (arg = { from, to })
- `board` (arg = boatId)
- `leave_boat`
- `emote` (arg = EMOTE)
- `spectate` (arg = +1 | −1)
- `dev` (arg = chuỗi lệnh, chỉ hoạt động khi server chạy `--dev`)

### Server → Client

| t | Trường |
|---|---|
| `welcome` | you, seed, isHost, reconnectKey, cfgHash, dev |
| `lobby` | players: [{ id, name, colors, isHost }], bots, botMix |
| `phase` | phase, t0, data (LAUNCH: shipPath; END: kết quả) |
| `snap` | tick, ack, me: {...}, ents: [...], zone, ev: [...] |
| `toast` | text, kind ('info' / 'warn' / 'big') |
| `confirm_eat` | slot, fruitId |
| `chat` | from, text |
| `pong` | c, s |
| `end` | podium: [pid × 3], posters: [...], stats: [...] |

**Snapshot**

`me` chứa đầy đủ trạng thái của chính người chơi đó (giống entity player, bỏ trường nội bộ).

`ents` là mảng object gọn. Mọi entity đều có `i` (id), `k` (kind), `x`, `y`. Trường riêng theo loại:

| Kind | Trường riêng |
|---|---|
| PLAYER | a (aim), hp, hm (hpMax), n (name), c (colors), f (fruitId), z (zoanForm), w (id vũ khí đang cầm), ar (hakiArmOn), aw (awakened), st (danh sách status đang hiện), tt (title), b (onBoatId), wa (water) |
| PROJ | vx, vy, bh (behavior), o (owner) |
| ITEM | id (itemId), n |
| BOSS | bid, hp, hm, s (state) |
| BOAT | bid, an (angle), hp |
| HAZARD | ty, r |
| AIRDROP | l (landed), op (đang được mở) |

`zone`: { cx, cy, r, ncx, ncy, nr, phase, tLeft, dps }

### Sự kiện `ev` (nằm trong snap)

```
{ e: 'hit',   src, dst, dmg, type, x, y, crit? }
{ e: 'cast',  src, fruit, slot: 'q' | 'e' | 'r', x, y, a }
{ e: 'atk',   src, weapon, heavy, x, y, a }
{ e: 'kill',  src, dst, weapon | fruit }
{ e: 'eat',   src, fruit }
{ e: 'awaken', src, fruit }
{ e: 'haki',  src, type: 'ARM' | 'OBS' | 'CONQ', on }
{ e: 'roku',  src, id }
{ e: 'land',  src, x, y }
{ e: 'airdrop', x, y, stage: 'incoming' | 'landed' | 'opened' }
{ e: 'buster', island, stage: 'warn' | 'start' | 'end' }
{ e: 'shell', x, y, tLand }
{ e: 'yonko', ids: [...] }
{ e: 'reveal', ids: [...], pos: [[x, y]...] }
{ e: 'boat_sink', boat }
{ e: 'emote', src, emote }
{ e: 'zone', stage: 'wait' | 'shrink', phase }
{ e: 'drown', src }
{ e: 'sfx', name, x, y }
```

---

## 8. Input bitmask (`S.BTN` trong 04-keybinds.js)

| Tên | Bit |
|---|---|
| ATTACK | 1 |
| BLOCK | 2 |
| Q | 4 |
| E | 8 |
| R | 16 |
| ROKU1 | 32 |
| ROKU2 | 64 |
| ROKU3 | 128 |
| HAKI_ARM | 256 |
| HAKI_OBS | 512 |
| HAKI_CONQ | 1024 |
| INTERACT | 2048 |
| DIAL | 4096 |
| W1 | 8192 |
| W2 | 16384 |

**Phím mặc định (`S.KEYS`):**

```
ATTACK: Mouse0, BLOCK: Mouse2, Q: KeyQ, E: KeyE, R: KeyR,
ROKU1: ShiftLeft, ROKU2: Space, ROKU3: KeyC,
HAKI_ARM: KeyH, HAKI_OBS: KeyV, HAKI_CONQ: KeyG,
INTERACT: KeyF, DIAL: KeyX, W1: Digit1, W2: Digit2,
BAG: Digit3–Digit8, INV: KeyI, MAP: Tab, CHAT: Enter, DEBUG: F3
```

Q/E/R/ROKU/HAKI/DIAL kích hoạt ở **cạnh lên** của phím (server tự so sánh với btn của tick trước). ATTACK và BLOCK tính theo trạng thái đang giữ.

---

## 9. Pipeline sát thương – `combat.applyDamage(target, info, ctx)`

```js
info = {
  amount, type, src,       // src: id kẻ tấn công hoặc null
  hakiCoated,              // tự lấy từ src.hakiArmOn nếu không truyền
  seastone,                // số giây khóa trái
  aoe, pierceArmor, ignoreShield, isPure,
}
```

Thứ tự xử lý **cố định**, không được đảo:

1. `target.alive` = false, hoặc đang có `status.invuln`: return 0.
2. **Né đòn:** Quan Sát cấp 2 còn lượt né, Kami-e, Bara R, Mochi nội tại (15%). Né được thì emit `hit` với dmg = 0, return 0.
3. **Vô hình Logia:** target có trái `intangible`, chưa bị khóa trái, không bị `status.intangibleOff`, và type thuộc PHYSICAL, và không hakiCoated, và seastone = 0. Return 0, emit `hit` với dmg = 0 (client vẽ nhấp nháy).
4. **Hệ số kháng của trái** (`fruit.resist[type]`, mặc định 1). Gomu phản đạn xử lý tại đây.
5. **Bậc của kẻ tấn công:** đòn từ trái nhân `TIER_MULT[fruit.tier]`; nếu trái đã thức tỉnh và slot là r thì nhân thêm `AWAKEN_R_DMG_MULT`.
6. **Vũ Trang của kẻ tấn công:** ×1.15 / ×1.25 / ×1.4 theo cấp.
7. **Vũ Trang của mục tiêu** (đang bật, đòn PHYSICAL): ×0.85 (cấp 2) / ×0.7 (cấp 3).
8. **Tekkai** ×0.4, **chặn bằng block** ×0.5 (đòn đến từ phía trước), **Yami** ×1.2.
9. **Giáp:** chỉ với PHYSICAL, không pierceArmor, không phải Vũ Trang cấp 3: trừ theo `absorb`, giảm độ bền.
10. **Khiên** (shield, Bari, Doru, dial_impact): trừ vào khiên trước. Bỏ qua nếu ignoreShield hoặc Vũ Trang cấp 3.
11. Làm tròn, trừ máu, cộng `src.dmgDealt`, cộng nạp R cho src.
12. Có seastone: gán `status.fruitLock`.
13. Máu ≤ 0: gọi `match.onDeath(target, src, info)` (hòm xác, kill feed, truy nã, Tứ Hoàng, trái tái sinh, thứ hạng).
14. Emit `hit`. Return lượng sát thương thực.

**`isPure` = true:** bỏ qua bước 2–10 (dùng cho bo và chết đuối).

---

## 10. Module trái ác quỷ phía server (`server/fruits/<id>.js`)

```js
module.exports = {
  id: 'mera',
  onEat(p, ctx) {},              // tùy chọn
  onTick(p, dt, ctx) {},         // tùy chọn (nội tại)
  castQ(p, ctx) {}, castE(p, ctx) {}, castR(p, ctx) {},
  castRAwaken(p, ctx) {},        // bắt buộc từ M11-T05
  onHitDealt(p, target, dmgInfo, ctx) {},   // tùy chọn
  onDamaged(p, info, ctx) { return info; }, // tùy chọn, chạy ở bước 4
};
```

Biến `ctx`:

```js
ctx = { world, match, combat, ents, now, dt, spawnProj, spawnHazard, emit, rng, S }
```

`fruits/index.js` nạp đủ 29 file theo `Object.keys(S.FRUITS)`. Thiếu file nào thì server báo lỗi khi khởi động.

---

## 11. API client chính

```js
OP.NET.connect(); OP.NET.send(msgObj); OP.NET.on(t, fn)
OP.PX.pixelGrid(rows: string[], palette: {char: '#hex'}) -> HTMLCanvasElement  // có viền đen
OP.SPR.define(id, { frames: [rows...], palette, anim: 'walk' | 'bounce' | 'static', w, h })
OP.SPR.draw(ctx, id, frame, x, y, { flip, scale, tint, colors })
OP.SPR.player(colors) -> spriteId   // tạo và cache sprite theo bộ màu
OP.CAM.worldToScreen(x, y); OP.CAM.follow(x, y)
OP.SFX.play(name, x, y)
OP.UI.toast(text, kind); OP.UI.openInventory(); OP.UI.confirmEat(slot, fruitId)
OP.HUD.damageNumber(x, y, dmg, type)
OP.GAME.state   // { me, ents (Map), zone, phase, seed, map }
```

---

## 12. Màu theo loại sát thương (số nảy lên, hiệu ứng)

| Loại | Màu |
|---|---|
| SLASH | `#ffffff` |
| BLUNT | `#ffd27a` |
| BULLET | `#e0e0e0` |
| EXPLOSION | `#ff8a00` |
| FIRE | `#ff5a1f` |
| ICE | `#8fe3ff` |
| LIGHTNING | `#fff35a` |
| POISON | `#9be564` |
| MAGMA | `#c2185b` |
| LIGHT | `#fffbd0` |
| SAND | `#e2c275` |
| SMOKE | `#b0b0b0` |
| SNOW | `#f0faff` |
| PURE | `#ff2d55` |

---

## 13. Log server (`server/log.js`)

**Định dạng:** JSON Lines, ghi vào `logs/server-YYYYMMDD-HHMM.log`, đồng thời in ra console.

```
{"ts": "...", "lvl": "INFO" | "WARN" | "ERROR" | "DBG", "tag": "net" | "match" | "combat" | ..., "msg": "...", "data": {...}}
```

Mỗi 10 giây ghi một dòng `perf`: thời gian tick trung bình và lớn nhất (ms), số entity, số client.

---

## 14. Lệnh dev & cờ khởi động server

**Cờ khởi động**

| Cờ | Ý nghĩa |
|---|---|
| `--port N` | Đổi cổng |
| `--seed N` | Cố định seed map |
| `--dev` | Bật lệnh dev |
| `--bots N` | Số bot (mặc định: lấp đủ 32) |
| `--fast` | Bo, thính, Buster Call nhanh gấp 4 |
| `--no-launch` | Bỏ qua bắn đại bác, đặt người chơi ở đảo trung tâm |
| `--headless-test` | Tự start trận khi có ≥ 2 client, dùng cho smoke test |

**Lệnh dev** (gõ trong chat, chỉ khi có `--dev`)

| Lệnh | Tác dụng |
|---|---|
| `/fruit <id>` | Ăn ngay trái đó |
| `/give <itemId> [n]` | Nhận vật phẩm |
| `/haki <ARM\|OBS\|CONQ> <lv>` | Đặt cấp Haki |
| `/roku <id>` | Nhận Lục Thức |
| `/tp <tx> <ty>` | Dịch chuyển tới tile |
| `/god` | Bất tử bật/tắt |
| `/heal` | Hồi đầy |
| `/kill bots` | Giết toàn bộ bot |
| `/spawn <bossId\|boatId>` | Tạo boss hoặc thuyền cạnh mình |
| `/zone next` | Chuyển pha bo |
| `/airdrop` | Gọi thính |
| `/buster` | Gọi Buster Call |
| `/awaken` | Thức tỉnh trái ngay |
| `/bounty <n>` | Đặt truy nã |
| `/end` | Kết thúc trận |

---

## 15. Lịch sử thay đổi hợp đồng

| Ngày | Task | Thay đổi |
|---|---|---|
| — | — | Bản đầu |
| 2026-10-26 | M03B-T01 | Đổi chuẩn palette/viền, không đổi tên hay schema |
