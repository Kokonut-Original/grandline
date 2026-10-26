# CẤU TRÚC THƯ MỤC

Không tạo file ngoài danh sách này. Muốn thêm file: cập nhật tài liệu này trước, ghi lý do vào report.

```
onepiece-br/
├── 00-QUY-TRINH-AI.md
├── package.json              deps: ws | scripts: start, dev, test
├── .gitignore                node_modules, logs
├── docs/
│   ├── CONTEXT.md
│   ├── BIEN-CHUNG.md
│   ├── CAU-TRUC-THU-MUC.md
│   ├── ART-REF.md
│   └── TIEN-DO.md
├── reports/                  Mxx-Tyy.md, Mxx-TONG-KET.md
├── logs/                     server tự sinh
│
├── shared/                   dùng chung server + client (UMD, xem BIEN-CHUNG mục 1)
│   ├── 00-namespace.js       tạo OP_SHARED
│   ├── 01-constants.js       CONST
│   ├── 02-enums.js           DMG, TIER, TILE, ENT, STATUS...
│   ├── 03-protocol.js        MSG, mô tả trường của message
│   ├── 04-keybinds.js        BTN, KEYS
│   ├── 05-rng.js             RNG có seed (mulberry32), hàm hash
│   ├── 10-data-fruits.js     29 trái
│   ├── 11-data-weapons.js
│   ├── 12-data-items.js      tiêu hao, giáp, dial, mảnh haki, bí kíp, awaken + LOOT_POOLS
│   ├── 13-data-bosses.js
│   ├── 14-data-islands.js
│   ├── 15-data-boats.js
│   ├── 16-data-zone.js
│   ├── 20-rules-damage.js    hàm tính hệ số thuần (không có side effect), dùng cho test + tooltip
│   ├── 21-mapgen.js          sinh map từ seed, cho kết quả giống hệt nhau ở cả 2 phía
│   └── 22-move.js            S.MOVE: công thức di chuyển dùng chung server + client dự đoán
│
├── server/
│   ├── server.js             entry: đọc cờ, HTTP phát file tĩnh (client/, shared/), WS, in IP
│   ├── net.js                quản lý client, parse + validate message, giới hạn tốc độ input
│   ├── match.js              máy trạng thái LOBBY → LAUNCH → PLAY → END, vòng tick, onDeath
│   ├── world.js              map từ mapgen, tra tile, va chạm, điểm spawn
│   ├── entities.js           hàm tạo player/proj/item/boss/boat/hazard, cấp id
│   ├── physics.js            di chuyển, va chạm, trạng thái nước, chết đuối, băng trơn
│   ├── combat.js             applyDamage (pipeline), đòn vũ khí, cập nhật projectile, hazard
│   ├── status.js             áp dụng và tick hiệu ứng trạng thái
│   ├── inventory.js          nhặt, ăn, xác nhận ăn, dùng, vứt, đổi ô, hòm xác
│   ├── haki.js
│   ├── rokushiki.js
│   ├── loot.js               đặt loot ban đầu, bảng drop, trái tái sinh
│   ├── launch.js             chiến hạm + bắn đại bác
│   ├── zone.js
│   ├── airdrop.js
│   ├── bosses.js
│   ├── boats.js              thuyền + Hải Vương
│   ├── events.js             Buster Call, truy nã, Tứ Hoàng, thức tỉnh
│   ├── endgame.js            thứ hạng, bục vinh danh, lệnh truy nã, thống kê
│   ├── snapshot.js           AOI + đóng gói snap
│   ├── devcmd.js
│   ├── log.js
│   ├── fruits/
│   │   ├── index.js          nạp và kiểm tra đủ 29 file
│   │   ├── _helpers.js       tia, nón, vòng tròn, dash, tạo vùng... dùng chung
│   │   └── <id>.js × 29      mera.js, magu.js, ... tori_falcon.js
│   ├── bots/
│   │   ├── brain.js          máy trạng thái bot
│   │   ├── nav.js            dò đường trên lưới tile (A* thô, có cache)
│   │   └── names.js
│   └── tests/
│       ├── run.js            chạy mọi *.test.js, không dùng framework
│       ├── assert.js
│       └── *.test.js         damage.test.js, water.test.js, fruits_*.test.js...
│
├── client/
│   ├── index.html            3 lớp hiển thị + <script> đúng thứ tự bên dưới
│   ├── style.css             @font-face VT323, UI DOM
│   ├── fonts/VT323.ttf       (nếu AI không tải được: người dùng tải từ Google Fonts, giấy phép OFL)
│   └── js/
│       ├── 00-boot.js        tạo OP, overlay hiện lỗi JS, đọc ?debug=1
│       ├── 01-net.js
│       ├── 02a-pixel-core.js pixelGrid, cache, bộ đổi màu
│       ├── 02b-palette.js
│       ├── 02c-sprites-chars.js   người chơi, Zoan, boss, mob
│       ├── 02d-sprites-items.js   vũ khí, trái, đồ, icon
│       ├── 02e-sprites-world.js   tile, cây, nhà, rương, bến, thuyền, chiến hạm
│       ├── 02f-sprites-fx.js      hạt, đòn đánh, vùng
│       ├── 03-input.js
│       ├── 04-camera.js
│       ├── 05a-render-map.js      cache chunk 16×16 tile
│       ├── 05b-render-entities.js
│       ├── 05c-render-fx.js       hiệu ứng theo fruit/behavior, bo, ánh sáng
│       ├── 06-render-hud.js       uiCanvas: thanh chỉ số, minimap, kill feed, số sát thương
│       ├── 07a-ui-lobby.js
│       ├── 07b-ui-inventory.js
│       ├── 07c-ui-dialogs.js      xác nhận ăn trái, toast
│       ├── 07d-ui-chat.js
│       ├── 07e-ui-spectate.js
│       ├── 07f-ui-endscreen.js    bục vinh danh, lệnh truy nã
│       ├── 08-audio.js
│       ├── 09-predict.js
│       └── 10-main.js             OP.GAME.boot, vòng requestAnimationFrame
│
└── tools/
    ├── requirements.txt      websockets
    ├── run_all.py            chạy mọi bước kiểm tra, in PASS/FAIL tổng
    ├── check_static.py       luật code, file tồn tại, thứ tự script, node --check
    ├── check_data.js         nạp shared bằng node, kiểm tra dữ liệu (29 trái, enum hợp lệ, id khớp file)
    ├── smoke_test.py         bật server --dev --seed 1 --headless-test, 4 client giả chơi 20s
    ├── stress_test.py        32 client giả chơi 90s, đọc dòng perf trong log
    └── sprite-viewer.html    xem toàn bộ sprite (nạp shared + 02*.js)
```

---

## Thứ tự `<script>` trong index.html (bắt buộc)

1. `/shared/00` → `05`
2. `/shared/10` → `16`
3. `/shared/20`, `/shared/21`, `/shared/22`
4. `/client/js/00` → `10`, theo đúng thứ tự tên file ở trên

`check_static.py` kiểm tra thứ tự này.

---

## Gặp lỗi thì xem ở đâu

| Triệu chứng | Xem đầu tiên |
|---|---|
| Màn trắng / không vào được | Overlay lỗi (00-boot), console trình duyệt, thứ tự script |
| Không kết nối được | server.js (in IP), firewall, net.js, 01-net.js |
| Người chơi giật, kéo ngược | 22-move.js (phải giống hệt 2 phía), 09-predict.js, hàng đợi input trong match.js, `move.test.js`, dòng `perf` trong log |
| Sát thương sai | combat.js (pipeline), 20-rules-damage.js, test damage |
| Trái lỗi | server/fruits/<id>.js, 10-data-fruits.js, 05c-render-fx.js |
| Map khác nhau giữa 2 máy | 21-mapgen.js, 05-rng.js (cấm dùng Math.random trong mapgen) |
| Sprite sai | tools/sprite-viewer.html, 02a-pixel-core.js |
| Bot đứng im | bots/brain.js, bots/nav.js, log tag `bot` |
| Server lag | dòng `perf` trong log, stress_test.py |

---

## Lệnh

```
npm install                                   # lần đầu
pip install -r tools/requirements.txt         # lần đầu
npm start                                     # node server/server.js
npm run dev                                   # node server/server.js --dev --seed 1
python tools/run_all.py                       # double check
```