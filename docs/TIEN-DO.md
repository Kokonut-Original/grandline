# TIẾN ĐỘ & KẾ HOẠCH

## TASK HIỆN TẠI: M03B-T03

## Quyết định đã chốt

- Vanilla JS, tự host, chơi qua Radmin. Không Next.js.
- Server-authoritative, Node + ws.
- Vào trận bằng bắn đại bác từ chiến hạm (không nhảy dù).
- Ăn trái có hộp xác nhận. Đã ăn rồi thì chỉ hiện thông báo, không ăn thêm được.
- Cao su nhận ×1.3 sát thương chém.
- 16 trái (chia nguồn rơi theo bậc, xem CONTEXT mục 5). Trận khoảng 22 phút, bo 7 pha, bo cuối 70% đảo / 30% biển.
- Có: Thức tỉnh (buff chung, không chiêu riêng), Tứ Hoàng, khán giả + biểu cảm, bục vinh danh Vua Hải Tặc + lệnh truy nã. KHÔNG có Buster Call.
- Khoảng 10 người chơi + 22 bot = 32. Bot 2 mức normal/hard (mặc định 60% hard), hạ bot được truy nã như người thật.
- View 480×270 cố định, phóng to theo số nguyên (có viền nếu tỉ lệ màn hình khác). Không chạy nhanh bằng Shift.
- Không làm phần bảo mật chuyên sâu.
- Nhà nhiều ô (tường HOUSE_WALL, cửa 2 ô, mái che mờ khi vào trong). Thùng crate/barrel trong nhà hiện chỉ là trang trí; chặn đường/phá được để M05.

## Bug tồn đọng

| ID | Task | Mô tả | Trạng thái |
|---|---|---|---|
| B01 | M01-T04 | Reconnect nhân đôi nhân vật, chạy gấp đôi | Đã sửa M03B-T01e |
| B02 | M03B-T01c | Lệnh `tp` chạy được khi không `--dev`, `/tp __proto__` làm tọa độ NaN | Đã sửa M03B-T01e |
| B03 | M00-T01 | Đọc được file ngoài `client/`, `shared/` (kể cả `.git`) | Đã sửa M03B-T01e |
| B04 | M03-T01 | Seed 2: pháo đài bị tường bao kín, không có lối ra | Đã sửa M03B-T01f |
| B05 | M01-T01 | `botMix` không đặt được giá trị 0 | Đã sửa (thu gọn phạm vi) |

---

## KẾ HOẠCH

**Tag mức khó** ghi sau tên task: `[Opus]` khung khó, sai sẽ kéo theo nhiều thứ; `[Sonnet]` việc rõ ràng theo mẫu; `[Flash]` việc nhỏ lặp lại. Cách dùng tag: xem 00-QUY-TRINH-AI.md mục 0.

**Quy ước mỗi task:**
- **Mục tiêu:** làm gì.
- **Xong khi:** điều kiện để coi là hoàn thành.
- Mọi task đều phải PASS `run_all.py` và có report.

### M00 – Nền móng

- [x] **T01 Khung dự án**
  - Mục tiêu: tạo thư mục, package.json, server.js phát file tĩnh. index.html có 3 lớp hiển thị và nạp đủ script (file client lúc này chỉ đăng ký namespace).
  - Xong khi: mở localhost:8080 thấy chữ "OP-BR READY" bằng font VT323 trên uiCanvas, console không lỗi.
- [x] **T02 Shared nền**
  - Mục tiêu: shared 00–05 đúng BIEN-CHUNG.
  - Xong khi: `node -e "require('./shared/...')"` chạy được, trên trình duyệt `OP.S.CONST.TILE === 16`.
- [x] **T03 Bộ test**
  - Mục tiêu: viết requirements.txt, run_all.py, check_static.py, check_data.js, tests/run.js (kèm 1 test mẫu), smoke_test.py.
  - Xong khi: run_all PASS. Cố tình thêm `import` vào 1 file client thì check_static báo FAIL.

### M01 – Server host & mạng

- [x] **T01 Lobby**
  - Mục tiêu: join, đặt tên/màu, danh sách lobby, chọn host, host chỉnh bot, Start, chat, đọc cờ khởi động, in IP (đánh dấu 26.x).
  - Xong khi: 2 tab trình duyệt thấy nhau trong lobby.
- [x] **T02 Vòng lặp server**
  - Mục tiêu: tick 30Hz, input bitmask, di chuyển trên nền phẳng tạm, snapshot 20Hz, ping.
- [x] **T03 Mượt phía client**
  - Mục tiêu: dự đoán + reconciliation + nội suy, bảng debug F3 (fps, ping, tick, số entity).
  - Xong khi: 2 tab di chuyển mượt, không kéo ngược.
- [x] **T04 AOI & rớt mạng**
  - Mục tiêu: AOI, vào lại bằng reconnectKey trong 30 giây, log perf.
  - Xong khi: smoke test 8 client PASS.
- [x] **T05 Double Check lớn**
  - Mục tiêu: người dùng test thật 2 máy qua Radmin.

### M02 – Pixel art & render

- [x] **T01 Lõi pixel**
  - Mục tiêu: pixelGrid tự sinh viền đen, cache, OP.SPR, camera, phóng to theo số nguyên.
- [x] **T02 Sprite người chơi**
  - Mục tiêu: chibi 16×24, 3 hướng, walk/bounce, đổi màu nón/áo/tóc.
- [x] **T03 Sprite thế giới & đồ**
  - Mục tiêu: sprite tile, cây, nhà, rương, bến, thuyền, chiến hạm, icon vũ khí/trái/đồ, và sprite-viewer.html.
  - Xong khi: sprite-viewer hiện đủ, không thiếu id nào có trong data.

### M03 – Bản đồ

- [x] **T01 mapgen**
  - Mục tiêu: 10 đảo, bờ biển gợn, nông/sâu, biome, bến thuyền.
  - Xong khi: hash map giống nhau giữa node và trình duyệt với cùng seed (có test).
- [x] **T02 Render map**
  - Mục tiêu: render map theo chunk, minimap, bản đồ lớn (Tab).
- [x] **T03 Va chạm & nước**
  - Mục tiêu: va chạm, trạng thái nước, bơi, chết đuối, thể lực, cát lún, băng trơn.
  - Xong khi: test water.test.js PASS.
- [x] **T04 Đồ vật trên đảo**
  - Mục tiêu: nhà, cây, điểm loot/rương/boss/bến theo từng đảo.

### M03B – Nâng cấp đồ họa (Mini Dungeon Slayer Reference)

- [x] **T01 Nền tảng màu, tile, bóng, font**
  - Mục tiêu: Palette 4 tông chuẩn ART-REF, độ sáng DEEP < SHALLOW < GRASS < SAND, tile 17 loại có 3 biến thể hash2, viền #160e22, bóng elip rgba(0,0,0,.35), font tiếng Việt có dấu 2 lượt stroke+fill.
  - Xong khi: run_all PASS, kiểm tra độ sáng & biến thể tile PASS, bóng elip hiện trên cỏ, text có dấu không lỗi.
- [x] **T01b Chỉnh màu và tile cỏ, bỏ viền lưới, tối ưu HUD**
  - Mục tiêu: GRASS giảm bão hòa ~#4f8f3c, bỏ viền lưới ca-rô, chi tiết 15-20% với 4 kiểu nhỏ, bờ biển mềm, HUD F3 gọn, xóa chữ thử font.
  - Xong khi: run_all PASS, độ sáng DEEP < SHALLOW < GRASS < SAND, F3 chỉ hiện khi bật.
- [x] **T01c Mở rộng đảo & scale vật phẩm**
  - Mục tiêu: Mở rộng bán kính fortress = 32, 9 đảo = 24-30 tile, khoảng cách tâm 110 tile; scale số lượng cây, rương, nhà theo diện tích mới (~2.1-2.4 lần); sửa render nền ô cây không còn ô vuông xanh; kiểm tra liên thông mangrove và các ràng buộc bản đồ.
  - Xong khi: run_all PASS, test ràng buộc bản đồ PASS, cây hiển thị đẹp trên mọi biome.
- [x] **T01d Hiển thị pixel chuẩn**
  - Mục tiêu: bỏ tầm nhìn 1.5x (scale lẻ), giữ VIEW 480×270 cố định, phóng to theo số nguyên pixel thiết bị (có tính dpr), uiCanvas vẽ ở độ phân giải thật, UI DOM to theo game, tia ngắm chỉ hiện khi F3.
  - Xong khi: run_all PASS; toàn màn hình mọi dpr pixel đều nhau, không lưới mờ giữa chunk, chữ HUD nét.
- [x] **T01e Di chuyển chuẩn**
  - Mục tiêu: bỏ chạy nhanh (Shift về Lục Thức ô 1), `shared/22-move.js` dùng chung server/client, server xếp hàng input theo seq, nội suy hiển thị, camera theo dt, sửa reconnect nhân đôi, khóa `tp` sau `--dev`.
  - Xong khi: run_all PASS; test input dồn gói vẫn đi đúng quãng đường; đi vào cây/nước không bị kéo ngược.
- [x] **T01f Chiều sâu đảo và nước** [Opus]
  - Mục tiêu: vách bờ + bóng đổ, nước gradient + gợn động + bọt bờ, bãi cát, bờ theo nhiễu, texture riêng từng biome.
- [x] **T01g Sắp theo y + ánh sáng** [Sonnet]
  - Mục tiêu: một danh sách vẽ sắp theo y, lớp ánh sáng theo ART-REF (ambient theo vùng).
- [x] **T02 Nhà top-down** [Sonnet]
  - Mục tiêu: Nhà 2D top-down surviv.io, mái che + skylight, thềm gạch, thùng crate, barrel, hiệu ứng biến mất mái khi vào trong.
  - Xong khi: đứng ngoài thấy mái, bước vào trong mái mờ dần thấy nội thất.
- [ ] **T03 Nhân vật & Ánh sáng** [Sonnet]
  - Mục tiêu: Sprite nhân vật 4 tông, animation nhún, lightmap quầng sáng đuốc/đèn lồng.
  - Xong khi: nhân vật có chiều sâu và ánh sáng ban đêm/hầm ngục đẹp mắt.

### M04 – Chiến đấu cơ bản

- [ ] **T01 Pipeline sát thương** [Opus]
  - Mục tiêu: máu, thể lực, giáp, khiên, applyDamage đúng 14 bước.
  - Xong khi: damage.test.js phủ mọi bước.
- [ ] **T02 Cận chiến** [Sonnet]
  - Mục tiêu: vũ khí cận chiến, đòn mạnh, đỡ đòn, animation, số sát thương.
- [ ] **T03 Súng** [Sonnet]
  - Mục tiêu: súng, đạn bay, nạp đạn, Ná Kabuto, đạn Hải Lâu Thạch.
- [ ] **T04 Chết** [Sonnet]
  - Mục tiêu: chết, hòm xác, kill feed, truy nã.

### M05 – Loot & túi đồ

- [ ] **T01 Loot** [Sonnet]
  - Mục tiêu: item trên mặt đất, nhặt bằng F, màu bậc, bảng drop, rương.
- [ ] **T02 Túi đồ** [Sonnet]
  - Mục tiêu: túi đồ DOM, kéo thả, vứt, đổi ô, tooltip.
- [ ] **T03 Đồ dùng** [Sonnet]
  - Mục tiêu: tiêu hao, giáp, 4 loại Dial, Tam kiếm.
- [ ] **T04 Ăn trái** [Sonnet]
  - Mục tiêu: hộp xác nhận ăn trái, chặn trái thứ 2 (thông báo), mỗi trái 1 quả, trái tái sinh.

### M06 – Trái ác quỷ

- [ ] **T01 Khung trái** [Opus]
  - Mục tiêu: Q/E/R, hồi chiêu, nạp R, vô hình Logia, khóa trái, nước vô hiệu trái, Zoan biến hình, fruits/index.js, lệnh `/fruit`, hiệu ứng client cơ bản.
- [ ] **T02 Nhóm 1** [Sonnet]: mera, hie, goro, gomu, bara
- [ ] **T03 Nhóm 2** [Sonnet]: ope, neko_leopard, tori_phoenix, yami, magu
- [ ] **T04 Nhóm 3** [Sonnet]: pika, suna, gura, bomu, bari, hito_reindeer

Mỗi task trái phải có: data đầy đủ, server logic, hiệu ứng client, test kháng/yếu trong fruits_*.test.js, và test tay bằng `/fruit`.

### M07 – Haki & Lục Thức

- [ ] **T01** [Sonnet] Thanh Haki, Vũ Trang 3 cấp, Quan Sát 3 cấp
- [ ] **T02** [Sonnet] Bá Vương 2 cấp
- [ ] **T03** [Sonnet] 6 Lục Thức + bí kíp, đủ 3 ô cho người không ăn trái

### M08 – Biển & thuyền

- [ ] **T01** [Sonnet] 4 loại thuyền: lên/xuống, lái, nhiên liệu, máu, chìm
- [ ] **T02** [Sonnet] Pháo tàu chiến, 3 Hải Vương đi tuần

### M09 – Boss

- [ ] **T01** [Opus] Khung boss + vice_admiral, giant_croc, snow_rabbit
- [ ] **T02** [Sonnet] trex, cp_agent, dragon, zombie_general, pacifista, samurai, giant_warrior

### M10 – Bot (normal + hard)

- [ ] **T01** [Opus] Não bot kiểu utility AI (chấm điểm hành động) + dò đường A* + rải 22 bot ngẫu nhiên trên các đảo + 2 mức normal/hard (phản xạ, sai số ngắm, né)
- [ ] **T02** [Sonnet] Bot dùng trái (theo khắc chế), Haki, Lục Thức, thuyền, chạy bo, nhặt đồ tốt hơn, ngắm đón đầu

### M11 – Luồng trận

- [ ] **T01** [Sonnet] Chiến hạm + bắn đại bác (chọn điểm, thanh lực, vùng hoàn hảo, bay vòng cung, lăn khi đáp, tự bắn khi hết giờ)
- [ ] **T02** [Sonnet] Bo 7 pha + chốt biển + bè/xuồng
- [ ] **T03** [Sonnet] Thính
- [ ] **T04** [Sonnet] Tứ Hoàng
- [ ] **T05** [Sonnet] Thức tỉnh (buff chung: R ×1.5, hồi R ×0.7, hào quang) + vật phẩm awaken_core

### M12 – Kết trận

- [ ] **T01** [Sonnet] Chế độ khán giả + biểu cảm
- [ ] **T02** [Sonnet] Bục vinh danh Vua Hải Tặc + lệnh truy nã pixel + bảng thống kê + Trận mới

### M13 – Âm thanh & hoàn thiện

- [ ] **T01** [Flash] Âm thanh Web Audio cho mọi chiêu và đòn đánh, nhỏ dần theo khoảng cách
- [ ] **T02** [Opus] Stress test 32 người, tối ưu (tick trung bình < 15ms), sửa lag mạng
- [ ] **T03** [Opus] Cân bằng sau khi chơi thử, double check toàn bộ, viết README hướng dẫn host và luật chơi

---

## Mục lục report

| Task | File | Ngày |
|---|---|---|
| M00-T01 | reports/M00-T01.md | 2026-10-26 |
| M00-T02 | reports/M00-T02.md | 2026-10-26 |
| M00-T03 | reports/M00-T03.md | 2026-10-26 |
| M00-TONG-KET | reports/M00-TONG-KET.md | 2026-10-26 |
| M01-T01 | reports/M01-T01.md | 2026-10-26 |
| M01-T02 | reports/M01-T02.md | 2026-10-26 |
| M01-T03 | reports/M01-T03.md | 2026-10-26 |
| M01-T04 | reports/M01-T04.md | 2026-10-26 |
| M01-T05 | reports/M01-T05.md | 2026-10-26 |
| M01-TONG-KET | reports/M01-TONG-KET.md | 2026-10-26 |
| M02-T01 | reports/M02-T01.md | 2026-10-26 |
| M02-T02 | reports/M02-T02.md | 2026-10-26 |
| M02-T03 | reports/M02-T03.md | 2026-10-26 |
| M02-TONG-KET | reports/M02-TONG-KET.md | 2026-10-26 |
| M03-T01 | reports/M03-T01.md | 2026-10-26 |
| M03-T02 | reports/M03-T02.md | 2026-10-26 |
| M03-T03 | reports/M03-T03.md | 2026-10-26 |
| M03-T04 | reports/M03-T04.md | 2026-10-26 |
| M03-TONG-KET | reports/M03-TONG-KET.md | 2026-10-26 |
| M03B-T01 | reports/M03B-T01.md | 2026-10-26 |
| M03B-T01b | reports/M03B-T01b.md | 2026-10-26 |
| M03B-T01c | reports/M03B-T01c.md | 2026-10-26 |
| M03B-T01d | reports/M03B-T01d.md | 2026-10-26 |
| M03B-T01e | reports/M03B-T01e.md | 2026-10-26 |
| M03B-T01f | reports/M03B-T01f.md | 2026-10-26 |
| M03B-T01g | reports/M03B-T01g.md | 2026-10-31 |
| M03B-T02 | reports/M03B-T02.md | 2026-10-31 |
