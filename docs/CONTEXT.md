# CONTEXT – ONE PIECE BATTLEGROUND

Dự án chơi riêng với bạn bè qua LAN. Không public, không thương mại.
Không có nhân vật One Piece để chọn: người chơi là hải tặc chibi tự tùy chỉnh màu. Sức mạnh đến từ trái ác quỷ, vũ khí, Haki, Lục Thức nhặt được trong trận.

---

## 1. Công nghệ & cách chạy

**Client**
- HTML5 Canvas 2D + Vanilla JS, nạp bằng thẻ `<script>` theo thứ tự.
- Không module, không fetch, không engine.

**Ba lớp hiển thị:**
1. `worldCanvas` (logic 480×270, phóng to theo số nguyên, `image-rendering: pixelated`): thế giới, nhân vật, quái, đòn đánh, ánh sáng procedural.
2. `uiCanvas`: chữ font pixel VT323 (file local), thanh máu, số sát thương nảy lên, HUD.
3. `#ui-root` (DOM HTML/CSS): lobby, túi đồ, hộp xác nhận, chat, màn kết trận.

**Server**
- Node.js + `ws`.
- Server-authoritative: 30 tick/giây mô phỏng, 20 snapshot/giây.
- Mỗi client chỉ nhận thực thể trong vùng quan tâm (AOI).
- Bot chạy trên server.

**Map**
- Sinh từ `seed` bằng `shared/21-mapgen.js`, chạy giống hệt nhau ở server và client.
- Server chỉ gửi seed, không gửi tile.

**Chơi qua Radmin**
1. Máy host cài Node 20+, chạy `npm install` rồi `npm start`.
2. Server in ra các địa chỉ IP, đánh dấu IP Radmin (dạng 26.x.x.x).
3. Host mở firewall một lần:
   `netsh advfirewall firewall add rule name="OPBR" dir=in action=allow protocol=TCP localport=8080`
4. Bạn bè vào cùng mạng Radmin, mở trình duyệt `http://<IP-Radmin-host>:8080`.

---

## 2. Luồng trận (khoảng 22 phút)

**LOBBY**
- Nhập tên, chọn màu nón / áo / tóc. Có chat.
- Host (người vào đầu tiên, hoặc máy localhost) chỉnh số bot và độ khó, rồi bấm Bắt đầu.
- Server lấp bot cho đủ 32.

**LAUNCH – Bắn đại bác từ chiến hạm (60 giây)**
- Mọi người đứng trên một chiến hạm lớn chạy vòng tròn ngoài rìa map. Không đánh nhau được.
- Mở bản đồ, click chọn điểm muốn đáp (phải là đất liền).
- Giữ chuột trái để nạp lực. Thanh lực có vùng "hoàn hảo": nhả đúng vùng thì rơi gần sát điểm chọn, nhả lệch thì rơi lệch ngẫu nhiên tối đa 6 tile.
- Bay theo đường vòng cung, bóng đổ dưới đất, không va chạm khi đang bay.
- Đáp xuống thì lăn 0.5s và bất tử 2s.
- Hết 60 giây ai chưa bắn bị bắn tự động tới một đảo ngẫu nhiên.

**PLAY**
- Loot, đánh nhau, bo thu hẹp, thính, Buster Call, Tứ Hoàng (chi tiết bên dưới).

**END**
- Còn 1 người sống thì kết thúc trận.
- Hiện bục vinh danh Vua Hải Tặc, lệnh truy nã, bảng thống kê.
- Host bấm "Trận mới" để về lobby.

**Bo (vòng an toàn) – 7 pha**

| Pha | Chờ | Thu trong | Bán kính còn (% ban đầu) | Sát thương/giây |
|---|---|---|---|---|
| 1 | 3:00 | 1:30 | 75% | 1 |
| 2 | 2:30 | 1:20 | 55% | 2 |
| 3 | 2:00 | 1:10 | 38% | 4 |
| 4 | 1:45 | 1:00 | 24% | 6 |
| 5 | 1:30 | 0:50 | 12% | 9 |
| 6 | 1:15 | 0:40 | 5% | 12 |
| 7 | 1:00 | 0:40 | 0% | 16 |

- Bo bắt đầu đếm sau khi giai đoạn LAUNCH kết thúc.
- Tâm bo cuối: 70% nằm ở đảo trung tâm, 30% ở một điểm ngẫu nhiên ngoài biển. Mỗi vòng bo luôn nằm lọt trong vòng trước.
- Nếu bo cuối ngoài biển: khi bắt đầu pha 5, server sinh 6 bè gỗ (đứng được, không di chuyển) và 4 xuồng trong vùng bo.

**Thính**
- Bắt đầu từ phút thứ 3, cứ 150 giây rơi 1 thính.
- Chỉ rơi xuống đảo có ít nhất 1 người còn sống và đảo nằm trong bo.
- Thả bằng dù từ tàu tiếp tế, có khói tím nhìn thấy từ xa. Mở mất 3 giây, bị đánh thì bị ngắt.
- Đồ bên trong: trái bậc S hoặc Huyền Thoại, Mảnh Haki (có thể là Bá Vương), kiếm Saijo, Mảnh Thức Tỉnh.

**Buster Call**
- Xảy ra 2 lần, ở phút 8 và phút 15.
- Chọn ngẫu nhiên 1 đảo đang có người, không phải đảo chứa tâm bo cuối.
- Cảnh báo 30 giây (đỏ trên bản đồ + thông báo lớn), sau đó pháo kích 20 giây: đạn rơi ngẫu nhiên, có vòng báo trước 1 giây, mỗi phát 35 sát thương.

**Tứ Hoàng & tiền truy nã**
- Đơn vị tiền là Berry (฿), hiển thị theo triệu.
- Hạ người chơi hoặc bot: +10 triệu + 25% truy nã của nạn nhân. Hạ boss: +5 triệu.
- Mỗi 30 giây, 4 người truy nã cao nhất (truy nã > 0) nhận danh hiệu **Tứ Hoàng**: vương miện trên đầu, và mỗi 45 giây bị hiện vị trí trên minimap của mọi người trong 5 giây.
- Hạ một Tứ Hoàng: cướp 50% truy nã và cướp luôn danh hiệu.

**Thức tỉnh trái**
- Điều kiện: (3 kill trở lên VÀ Haki Vũ Trang cấp 3) HOẶC dùng vật phẩm Mảnh Thức Tỉnh (chỉ có trong thính).
- Hiệu ứng: R hồi nhanh hơn 30%, R mạnh hơn 50%, R đổi sang dạng riêng (cột "Thức tỉnh" ở mục 5), nhân vật có hào quang.

**Khán giả**
- Chết thì vào chế độ xem. Mặc định xem kẻ đã hạ mình. ←/→ để đổi người xem.
- Phím 1–4 gửi biểu cảm (cười, sốc, khóc, vỗ tay), hiện thành bong bóng trên đầu người đang được xem.

**Bục vinh danh Vua Hải Tặc**
- Cảnh pixel có bục 1-2-3.
- Hạng 1 là người sống sót cuối, đội vương miện Vua Hải Tặc, có pháo hoa pixel.
- Hạng 2 và 3 là hai người chết cuối cùng.
- Mỗi người trên bục có một **lệnh truy nã pixel**: ảnh nhân vật, tên, số tiền truy nã, trái đã ăn.
- Bên dưới là bảng thống kê: hạng, kill, sát thương gây ra, truy nã, trái, thời gian sống.
- Mỗi người còn được xem lệnh truy nã của chính mình.

---

## 3. Bản đồ

- Kích thước 320×320 tile, tile 16px.
- Đảo trung tâm (Pháo đài) ở chính giữa với bán kính 32 tile. 9 đảo còn lại xếp vòng quanh, tâm cách tâm map 110 tile, bán kính mỗi đảo cố định từ 24–30 tile (ghost: 24, winter: 25, samurai: 26, fire_ice: 27, canal_city: 27.5, desert: 28, giant: 28.5, jungle: 29, mangrove: 30). Mở rộng diện tích đảo ~2.1–2.4 lần so với bản cũ (14–22 tile) để đủ không gian khám phá, loot và giao tranh cho 32 người chơi.
- Đường bờ biển gợn ngẫu nhiên theo seed.
- Quanh mỗi đảo có dải nước nông rộng 2–4 tile, còn lại là biển sâu.
- Mỗi đảo có 1–2 bến thuyền.

| id | Đảo | Đặc điểm | Boss |
|---|---|---|---|
| fortress | Pháo đài Trung Tâm | Tường thành, quảng trường | vice_admiral |
| desert | Đảo Sa Mạc | Cát lún (đi chậm), ít chỗ nấp | giant_croc |
| winter | Đảo Băng | Mặt băng trơn (có quán tính) | snow_rabbit |
| jungle | Rừng Cổ Đại | Cây rậm che tầm nhìn | trex |
| canal_city | Thành phố Kênh | Nhà cửa, kênh nước nông, xưởng tàu | cp_agent |
| fire_ice | Đảo Lửa-Băng | Nửa dung nham, nửa băng | dragon |
| ghost | Đảo Ma | Sương mù (tầm nhìn −30%) | zombie_general |
| mangrove | Quần đảo Rễ Cây | Nhiều đảo con nối bằng cầu | pacifista |
| samurai | Đảo Samurai | Đền, cầu gỗ | samurai |
| giant | Đảo Khổng Lồ | Cây và nhà cỡ lớn | giant_warrior |

**Luật nước (theo truyện)**

| Trạng thái | Người có trái | Người không có trái |
|---|---|---|
| Nước nông | Không dùng được Q/E/R, tốc độ ×0.7 | Tốc độ ×0.8 |
| Nước sâu | Chìm: mất 17% máu tối đa mỗi giây, không dùng chiêu | Bơi tốc độ ×0.5, tốn 6 thể lực/giây; hết thể lực mất 5 máu/giây |

- Logia đang bay/lướt bằng chiêu (Pika E, Moku E...) không bị tính là ở dưới nước.
- Đứng trên thuyền, bè, cầu thì không tính là ở dưới nước.

**Thuyền**

| id | Tên | Chỗ | Tốc độ | Máu | Ghi chú |
|---|---|---|---|---|---|
| dinghy | Xuồng | 1 | 120 | 80 | |
| waver | Ván lướt sóng | 1 | 190 | 50 | Cần nhiên liệu, 60 giây mỗi bình |
| sloop | Thuyền buồm | 4 | 100 | 200 | Kẻ địch cũng lên được |
| warship | Tàu chiến | 2 | 70 | 400 | Ghế 2 bắn pháo (40 sát thương, AoE) |

- Thuyền về 0 máu thì chìm, mọi người trên thuyền rơi xuống nước sâu.
- Có 3 Hải Vương (sea_king) đi tuần ngoài biển, húc thuyền gây 60 sát thương.

---

## 4. Hệ sát thương & luật trái ác quỷ

**Loại sát thương:** SLASH (chém), BLUNT (cùn), BULLET (đạn), EXPLOSION (nổ), FIRE, ICE, LIGHTNING, POISON, MAGMA, LIGHT, SAND, SMOKE, SNOW, PURE (bỏ qua mọi kháng).

**Logia**
- Miễn hoàn toàn SLASH / BLUNT / BULLET / EXPLOSION.
- Bị đánh trúng nếu kẻ tấn công đang bật Haki Vũ Trang, dùng vũ khí hoặc đạn Hải Lâu Thạch, hoặc đòn đó là nguyên tố khắc chế.
- Khi bị đánh xuyên qua: nhấp nháy, không mất máu.

**Paramecia:** kháng hoặc yếu riêng theo từng trái (xem bảng mục 5).

**Zoan:** bấm R lần đầu để biến hình nếu trái có dạng biến hình. Khi biến hình +40 máu tối đa tạm thời và cận chiến ×1.3. Không có vô hình.

**Hải Lâu Thạch:** trúng người có trái thì khóa trái (không Q/E/R, mất vô hình) 1–3 giây tùy vũ khí.

**Luật trái**
- Mỗi trận mỗi loại trái chỉ có **1 quả**.
- Nhặt trái lần đầu: hiện hộp xác nhận "Ăn trái <tên>? Ăn rồi sẽ không đổi được" với 2 nút [Ăn] [Để sau]. Chọn "Để sau" thì trái nằm trong túi.
- Đã ăn trái rồi: vẫn nhặt được trái khác để giữ hoặc vứt, nhưng bấm ăn chỉ hiện thông báo "Bạn đã ăn trái ác quỷ rồi".
- Người có trái chết: trái đó tái sinh ở một điểm loot ngẫu nhiên trên một đảo trong bo, sau 20 giây.
- Người không ăn trái được bù: bơi được, có 3 ô Lục Thức thay vì 2, và vũ khí Hải Lâu Thạch gây thêm 10% sát thương.

---

## 5. 29 trái ác quỷ

Bậc: C, B, A, S, MYTHIC (Huyền Thoại).
"Qua biển" là khả năng vượt nước của trái.

### Logia (10)

| id | Tên | Bậc | Nội tại | Q | E | R | Thức tỉnh | Kháng / Yếu |
|---|---|---|---|---|---|---|---|---|
| mera | Mera Mera (Lửa) | A | Đòn gây bỏng 3s | Hỏa quyền dạng tia thẳng | Bắn 3 viên đạn lửa | Cầu lửa lớn AoE | Biển lửa diện rộng, để lại nền cháy | Nhận ×2 từ MAGMA |
| magu | Magu Magu (Dung nham) | S | Để lại vũng dung nham 4s | Nắm đấm dung nham | Rải vũng dung nham | Mưa thiên thạch dung nham (ra chiêu 1s) | Mặt đất quanh mình thành dung nham 20s | Ra chiêu chậm |
| hie | Hie Hie (Băng) | A | Đòn làm chậm 30% | Giáo băng | Đóng băng mặt biển thành đường băng 20s (qua biển) | Đóng băng mục tiêu 1.5s | Đóng băng cả vùng lớn | FIRE ×1.5, MAGMA ×2 |
| goro | Goro Goro (Sét) | S | Đòn đánh nhanh | Tia sét | Dịch chuyển ngắn bằng sét | Cột sét lớn | Sét lan sang 3 mục tiêu | Không gây sát thương lên gomu |
| pika | Pika Pika (Ánh sáng) | S | Nhanh nhất game | Laser từ ngón tay | Dịch chuyển xa bằng ánh sáng (qua biển) | Mưa đạn ánh sáng | Chùm laser quét | Sát thương mỗi viên thấp |
| suna | Suna Suna (Cát) | A | Đòn trúng giảm hồi máu 50% | Lốc cát đẩy lùi | Lưỡi cát chạy dọc mặt đất | Vùng cát lún rút máu | Cát lún hút cả thuyền | Bị ướt (vừa ra khỏi nước) thì mất vô hình 5s |
| moku | Moku Moku (Khói) | B | Đòn trói làm chậm | Tay khói trói | Hóa khói bay lơ lửng 2s (qua biển ngắn) | Màn khói che tầm nhìn | Khói thành vòng giam | Sát thương thấp |
| gasu | Gasu Gasu (Khí độc) | A | Đòn gây độc | Đám khí độc | Ném bom khí | Vùng độc lớn | Vùng độc to hơn, khóa chiêu 2s | Bị FIRE trúng thì khí của mình phát nổ |
| yuki | Yuki Yuki (Tuyết) | B | Đòn làm chậm | Bão tuyết hình nón | Tường tuyết | Đàn thỏ tuyết lao tới | Bão tuyết làm chậm 60% cả vùng | FIRE ×1.5 |
| yami | Yami Yami (Bóng tối) | MYTHIC | KHÔNG vô hình, nhận ×1.2 mọi sát thương | Hố đen hút địch lại gần | Chạm vào địch: vô hiệu trái địch 4s | Nhả lại toàn bộ đòn đã hút | Hút cả vùng lớn + vô hiệu trái 6s | Dễ bị dồn sát thương |

### Paramecia (13)

| id | Tên | Bậc | Nội tại | Q | E | R | Thức tỉnh | Kháng / Yếu |
|---|---|---|---|---|---|---|---|---|
| gomu | Gomu Gomu (Cao su) | B | Đạn nảy ngược lại | Đấm dãn tay | Tự bắn mình qua eo biển hẹp ~6 tile (qua biển) | Gear 2: tốc độ & sát thương +30% trong 8s | Dạng trắng: địa hình quanh hóa cao su (địch đi chậm, mình nảy nhanh) | Miễn BLUNT, LIGHTNING, BULLET; SLASH ×1.3 |
| bara | Bara Bara (Chia cắt) | C | — | Phóng tay ra xa | Tách thân bay ngắn (qua biển ngắn) | Né toàn bộ đòn trong 2s | Thân thể tách ra đánh 6 hướng | Miễn SLASH; EXPLOSION ×1.2 |
| ope | Ope Ope (Phòng mổ) | S | Mạnh hơn khi đứng trong Room | Tạo Room bán kính 5 tile, tồn tại 6s | Đổi chỗ với vật hoặc địch trong Room | Đòn xuyên giáp, bỏ qua khiên | Room to gấp đôi, Shambles đổi được cả thính | Mỗi chiêu tốn thêm 10 thể lực |
| gura | Gura Gura (Chấn động) | MYTHIC | Đòn đẩy lùi | Sóng chấn động hình nón | Đấm nứt không khí | Động đất cả vùng (ngoài biển: sóng thần lật thuyền) | Động đất toàn bộ đảo đang đứng | Hồi chiêu dài |
| hana | Hana Hana (Mọc tay) | B | Trói từ xa | Mọc tay trói 1s | Quật ngã | Bàn tay khổng lồ | Mạng tay trói cả vùng | Máu tối đa −10 |
| bomu | Bomu Bomu (Bom) | C | Miễn sát thương nổ của chính mình | Chạm vào là nổ | Ném mũi nổ | Tự nổ AoE (mất 15% máu) | Bất tử 3s rồi nổ cực lớn | Tự gây hại |
| supa | Supa Supa (Lưỡi dao) | B | — | Xoay thân thép | Lao tới đâm | Bão lưỡi dao | Lưỡi dao quét 360° liên tục | SLASH ×0.5; BLUNT ×1.2 |
| doru | Doru Doru (Sáp) | B | Có khiên | Dựng tường sáp | Áo giáp sáp (khiên 40) | Áo giáp sáp lớn | Dựng pháo đài sáp quanh mình | Khiên sáp nhận ×2 từ FIRE |
| ito | Ito Ito (Chỉ) | A | Đi trên mây | Dây chỉ chém | Bám mây đi trên không 3s (qua biển) | Lồng chim thu hẹp | Lồng to, thu nhỏ nhanh | Hồi chiêu dài |
| nikyu | Nikyu Nikyu (Bàn tay đẩy) | A | Phản đạn | Đẩy bật đòn đánh / đạn | Tự phóng mình sang đảo khác (hồi chiêu 45s, qua biển) | Bom khí nén | Hất văng mọi địch trong vùng ra xa | E hồi rất lâu |
| bari | Bari Bari (Rào chắn) | B | Chắn phía trước | Khiên chắn đạn phía trước 3s | Rào chắn đẩy lùi | Lao tới bằng rào chắn | Bọc kín bản thân, miễn nhiễm 3s | Bị đánh từ sau lưng |
| mochi | Mochi Mochi (Bánh dày) | A | Né đòn bằng biến dạng (15%) | Nắm đấm bánh dày | Dính chân địch 1.5s | Biến mặt đất thành bánh dày | Cả vùng thành bánh dày | Hồi chiêu dài |
| horo | Horo Horo (Bóng ma) | B | Do thám | Ma tiêu cực: địch đứng yên 2s | Ma phát nổ | Ma xuyên tường bay đi do thám | 6 ma tiêu cực tự đuổi mục tiêu | Sát thương thấp |

### Zoan (6)

| id | Tên | Bậc | Nội tại | Q | E | R | Thức tỉnh | Kháng / Yếu |
|---|---|---|---|---|---|---|---|---|
| neko_leopard | Neko Neko – Báo | A | Chạy +15%, Lục Thức hồi nhanh hơn 20% | Vồ mồi | Dạng lai 8s | Chém liên hoàn | Thêm 3 nhát chém, chạy +30% | Không có đòn xa |
| ryu_allosaurus | Ryu Ryu – Khủng long | A | Máu tối đa +30 | Cắn | Lao húc | Biến thành khủng long | Biến hình hồi 30% máu | Thân to, dễ trúng |
| hito_reindeer | Hito Hito – Tuần lộc | B | Tự hồi 1 máu/giây | Đấm mạnh | Chạy nhanh 4s | Dạng quái vật (cần và tiêu 1 Rumble Ball) | Không cần Rumble Ball | Sát thương thường |
| tori_phoenix | Tori Tori – Phượng hoàng | MYTHIC | Tự hồi 3 máu/giây khi không bị đánh trong 3s | Đá lửa xanh | Bay (qua biển, tốn 8 thể lực/giây) | Hồi đầy máu (1 lần mỗi trận) | Hồi sinh 1 lần với 40% máu | Sát thương trung bình |
| uo_seiryu | Uo Uo – Thanh Long | MYTHIC | Máu tối đa +40 | Phun lửa | Bay rồng (qua biển) | Lốc xoáy | Bay lâu gấp đôi, phun lửa liên tục | Thân rất to |
| tori_falcon | Tori Tori – Chim ưng | B | Bay ngắn | Bổ nhào | Bay 3s (qua biển ngắn) | Lốc cánh | Bay không tốn thể lực 10s | Máu tối đa −10 |

---

## 6. Vũ khí, đồ dùng, ô đồ

**Cấp kiếm theo truyện:** NORMAL (C) < WAZAMONO (B) < RYO (A) < O (S) < SAIJO (MYTHIC)

| id | Tên | Loại | Bậc | Đặc điểm |
|---|---|---|---|---|
| sword_marine | Kiếm Hải Quân | sword | C | Cân bằng |
| kitetsu3 | Sandai Kitetsu | sword | B | Sát thương +15%, 5% tự chém mình 5 máu |
| yubashiri | Yubashiri | sword | A | Nhẹ, chém nhanh |
| wado | Wado Ichimonji | sword | S | Chém nhanh, tầm xa hơn |
| shusui | Shusui | sword | S | Sát thương cao |
| enma | Enma | sword | S | Hút 5 Haki mỗi giây khi cầm; khi bật Vũ Trang sát thương ×1.5 |
| habakiri | Ame no Habakiri | sword | MYTHIC | Chém cực nhanh |
| yoru | Yoru (Hắc Đao) | sword | MYTHIC | Đòn mạnh bắn sóng kiếm xa nhất game |
| murakumogiri | Murakumogiri | sword | MYTHIC | Đại đao, quét vòng 360° |
| kanabo | Gậy sắt Kanabo | blunt | A | Đánh choáng 0.3s |
| jitte_kairoseki | Jitte Hải Lâu Thạch | blunt | A | Khóa trái 2s |
| clima_tact | Gậy thời tiết | special | A | Mây sét (LIGHTNING) / ảo ảnh gây nhầm lẫn |
| pistol | Súng lục | gun | C | Tầm gần |
| musket | Súng hỏa mai | gun | B | Tầm xa, 1 viên/băng |
| bazooka | Bazooka | gun | A | Nổ AoE |
| kabuto | Ná Kabuto | gun | B | Bắn hạt cây trói 1s |

- **Tam kiếm:** túi có đủ 3 kiếm (2 ô vũ khí + 1 trong túi) thì chiêu mạnh của kiếm đổi thành Tam Kiếm (×1.4 sát thương, quét rộng).
- **Đòn đánh:** chuột trái là đòn thường, giữ chuột trái 0.6s là đòn mạnh (sát thương ×2, tốn 15 thể lực), chuột phải là đỡ đòn (giảm 50% sát thương phía trước, tốn thể lực).
- **Dial:** dial_impact (hấp thụ 1 đòn trong 2s rồi trả lại), dial_flame (phun lửa), dial_reject (300% sát thương, tự mất 30 máu), dial_breath (thổi gió đẩy người hoặc đẩy thuyền).
- **Tiêu hao:** meat (hồi 40 máu, ăn trong 2s), bandage (hồi 15, 1s), rumble_ball, ammo_kairoseki (6 viên đạn khóa trái 1s), boat_fuel.
- **Giáp:** armor_1 / armor_2 / armor_3, hấp thụ 25 / 35 / 45% sát thương SLASH, BLUNT, BULLET, độ bền 50 / 75 / 100.
- **Thức tỉnh:** awaken_core.

**Ô đồ**
- 1 trái (đã ăn)
- 2 vũ khí
- 2 Lục Thức (3 ô nếu không ăn trái)
- Haki (3 loại, mỗi loại có cấp)
- 1 Dial
- 1 Giáp
- 6 ô túi (tiêu hao, trái chưa ăn, kiếm thứ 3...)

---

## 7. Haki

Haki nhặt được dưới dạng Mảnh Haki. Nhặt thêm mảnh cùng loại thì lên cấp.

**Thanh Haki:** tối đa 100, tự hồi 6/giây khi không bật Vũ Trang.

| Haki | Cấp 1 | Cấp 2 | Cấp 3 |
|---|---|---|---|
| Vũ Trang (H bật/tắt, tốn 8 Haki/giây) | Đánh trúng Logia, sát thương ×1.15 | ×1.25, nhận sát thương vật lý ×0.85 | ×1.4, nhận ×0.7, đánh xuyên khiên và giáp |
| Quan Sát (V) | Bị động: thấy kẻ địch trong 12 tile trên minimap | Tự né 1 đòn mỗi 8 giây | V: 4s thấy trước đường đi đòn đánh của địch (tốn 30) |
| Bá Vương (G) | Choáng 1.5s mọi bot, boss yếu và người có tổng cấp Haki thấp hơn mình trong 7 tile (tốn 60, hồi 40s) | Thêm hiệu ứng phủ Bá Vương: 5s sát thương ×1.2 và miễn choáng | — |

Haki Vũ Trang áp dụng cho tay không, vũ khí và đạn.

---

## 8. Lục Thức (bí kíp scroll_*)

| id | Kỹ năng | Tác dụng | Thể lực | Hồi |
|---|---|---|---|---|
| soru | Soru | Lướt 4 tile, bất tử 0.2s | 20 | 3s |
| geppo | Geppo | Bay lên không vượt tối đa 3 tile nước | 25 | 5s |
| tekkai | Tekkai | Giữ phím: đứng yên, nhận sát thương ×0.4 | 15/giây | — |
| shigan | Shigan | Đâm ngón tay 22 sát thương, xuyên giáp | 15 | 4s |
| rankyaku | Rankyaku | Chém gió bay xa 18 sát thương | 20 | 5s |
| kamie | Kami-e | Bị động: bị đánh 3 lần trong 2s thì né đòn kế tiếp | — | 10s |

Phím: Shift = ô 1, Space = ô 2, C = ô 3.

---

## 9. Loot, boss, bot

**Nguồn loot**

| Nguồn | Bậc |
|---|---|
| Mặt đất, trong nhà | C–B |
| Rương | B–A |
| Boss | A–S (hồi sinh sau 4 phút) |
| Hòm xác người chết | Toàn bộ đồ của người đó |
| Thính | S–MYTHIC |

**Boss**
- Mỗi boss có máu, 2–3 chiêu có vùng báo trước 0.6–1s, và bảng drop riêng.
- vice_admiral: máu nhiều nhất, gọi 4 lính, drop có tỉ lệ ra Mảnh Haki Bá Vương.
- Boss thường kéo sự chú ý của người gây sát thương lớn nhất, đi ra xa ổ quá 15 tile thì quay về.

**Bot**
- Máy trạng thái: LAUNCH → LOOT → ROAM → FIGHT → FLEE (máu dưới 30%) → ZONE (chạy vào bo) → BOAT (khi cần qua biển).
- Độ khó: easy (phản xạ 600ms, ngắm lệch nhiều), normal (350ms), hard (180ms, biết né, dùng Haki Quan Sát).
- Tỉ lệ mặc định 40% easy / 40% normal / 20% hard, host chỉnh được.
- Tên bot kiểu hải tặc, tạo ngẫu nhiên.

---

## 10. Điều khiển

| Phím | Chức năng |
|---|---|
| WASD | Di chuyển |
| Chuột | Ngắm |
| Chuột trái | Đánh (giữ = đòn mạnh) |
| Chuột phải | Đỡ đòn |
| Q / E / R | Chiêu trái |
| Shift / Space / C | Lục Thức ô 1 / 2 / 3 |
| H / V / G | Haki Vũ Trang / Quan Sát / Bá Vương |
| F | Nhặt đồ, mở rương, lên/xuống thuyền |
| X | Dùng Dial |
| 1 / 2 | Chọn vũ khí |
| 3–8 | Dùng ô túi |
| I | Túi đồ |
| Tab | Bản đồ lớn |
| Enter | Chat |
| F3 | Bảng debug |

Khi xem trận: ←/→ đổi người xem, 1–4 gửi biểu cảm.

---

## 11. UI/UX

**HUD (uiCanvas)**
- Góc dưới trái: máu, thể lực, Haki.
- Giữa dưới: Q/E/R kèm hồi chiêu và thanh nạp R.
- Góc dưới phải: ô vũ khí, Lục Thức, Dial.
- Góc trên phải: minimap.
- Góc trên trái: số người còn sống, số kill, truy nã.
- Giữa trên: đồng hồ bo, thông báo lớn (Buster Call, thính, Tứ Hoàng).
- Bên phải: kill feed.
- Số sát thương nảy lên trên đầu mục tiêu, màu theo loại sát thương.

**Màu bậc**
- C `#cfcfcf`
- B `#5ac54f`
- A `#3e8edf`
- S `#a34fd8`
- MYTHIC `#f4c430`

**DOM (#ui-root)**
- Lobby
- Túi đồ (kéo thả)
- Hộp xác nhận ăn trái
- Chat
- Lớp khán giả
- Màn kết trận

---

## 12. Đồ họa

**Nguyên tắc chung**
- Không dùng sprite sheet ngoài. Mọi thứ vẽ bằng mảng chuỗi ký tự trong `client/js/02*-sprites-*.js`.
- Phong cách chibi đầu to mình nhỏ, sprite có 4 tông (tối, vừa, sáng, điểm nhấn), bóng tối nghiêng về sắc ấm/đậm hơn chứ không chỉ giảm độ sáng; viền màu cố định #160e22; tile nền KHÔNG viền; nguồn sáng giả định từ trên chếch trái.
- Viền đen 1px tự sinh bằng pixelGrid(): quét 4 hướng quanh mỗi pixel có màu với màu viền #160e22.

**Animation:** `walk` (3 khung bước), `bounce` (nhún, squash), `static` (vũ khí, icon).

**Sprite**
- Người chơi: 16×24, 3 hướng (xuống, lên, ngang; trái là ngang lật lại). Nón, áo, tóc đổi màu theo bảng màu người chơi chọn. Không vẽ giống nhân vật nào của One Piece.
- Zoan khi biến hình: sprite riêng.
- Logia: hạt nguyên tố bay quanh người.
- Boss: 32×32 trở lên.
- Chiến hạm: sprite lớn.

---

## 13. Âm thanh

- Chỉ có âm thanh khi ra chiêu và đòn đánh, tạo bằng Web Audio API (oscillator + noise + envelope). Không dùng file âm thanh.
- Các kiểu: fire, ice, lightning, light, magma, sand, smoke, poison, slash, blunt, gun, explosion, haki_arm, haki_conq, rokushiki, cannon, heal.
- Âm thanh nhỏ dần theo khoảng cách.

---

## 14. Cân bằng gốc

- Máu cơ bản 100, thể lực 100 (tự hồi 15/giây).
- Tốc độ đi 90 px/giây.
- Tay không: 6 sát thương / 0.4s.

**Kiếm** (sát thương mỗi nhát / thời gian giữa 2 nhát / tầm đánh)

| Cấp | Sát thương | Tốc độ | Tầm |
|---|---|---|---|
| C | 12 | 0.5s | 22px |
| B | 14 | 0.5s | 22px |
| A | 16 | 0.45s | 24px |
| S | 18 | 0.45s | 26px |
| MYTHIC | 22 | 0.4s | 28px |

**Vũ khí khác**

| Vũ khí | Sát thương | Tốc độ | Tầm | Băng đạn |
|---|---|---|---|---|
| Kanabo | 20 | 0.9s | — | — |
| Súng lục | 10 | 0.35s | 220px | 8 viên, nạp 1.5s |
| Hỏa mai | 28 | 1.2s | 360px | 1 viên |
| Bazooka | 40 (AoE 40px) | 1.8s | — | 1 viên |

**Trái ác quỷ**
- Q: 10–18 sát thương, hồi 4–7s.
- E: chiêu tiện ích, hồi 8–14s.
- R: 35–60 sát thương. Nạp đầy khi gây đủ 150 sát thương, hoặc tự nạp trong 60 giây.
- Hệ số theo bậc: C ×0.9, B ×1.0, A ×1.1, S ×1.2, MYTHIC ×1.3.

---

## 15. Ngoài phạm vi (KHÔNG làm)

- Nhân vật có sẵn để chọn
- Thời tiết, sự kiện Knock Up Stream
- Bản đồ kho báu
- Liên minh
- Va chạm đòn (clash)
- Anti-cheat chuyên sâu
- Đăng nhập, lưu tài khoản
- Nhạc nền
- Tay cầm, mobile