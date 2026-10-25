# TỔNG KẾT MILESTONE M01 – SERVER HOST & MẠNG

## 1. Mục tiêu đã hoàn thành
Milestone M01 đã hoàn thiện toàn bộ hạ tầng mạng, vòng lặp mô phỏng server, đồng bộ phía client và khả năng chịu tải:

- **M01-T01 (Lobby, host, chat, giao diện DOM):**
  - Giao diện DOM lobby (`#ui-root`): Tùy chỉnh tên người chơi, màu sắc nón / áo / tóc với ô xem trước trực quan.
  - Phân quyền Host cho người vào đầu tiên (hoặc qua cờ host): Điều chỉnh số lượng bot (0–31), cấp độ bot (`EASY`, `NORMAL`, `HARD`), nút Bắt đầu trận đấu (`start`).
  - Hệ thống chat thời gian thực: Hiển thị an toàn bằng `textContent` (chống XSS), gửi bằng phím Enter, hiển thị thẻ `[HOST]` nổi bật.
  - Xử lý các cờ khởi động CLI: `--port`, `--host-key`, `--dev`, `--seed`, `--headless-test`.

- **M01-T02 (Vòng lặp server):**
  - Vòng lặp mô phỏng server 30Hz (`TICK_HZ = 30`), tích hợp `dt` ổn định.
  - Đóng gói input bitmask (`W`, `A`, `S`, `D`, `SPACE`, `SHIFT`, `Q`, `E`, `R`, `F`, `NUM1-4`) kết hợp góc ngắm `aim`.
  - Giới hạn tốc độ input (`INPUT_RATE_LIMIT = 45`) chống spam flood mạng.
  - Di chuyển người chơi với tốc độ chuẩn (`MOVE_SPEED = 90 px/s`), chuẩn hóa vector di chuyển chéo `hypot(mx, my)`.
  - Vòng lặp phát snapshot 20Hz (`SNAP_HZ = 20`) gửi thông tin vị trí và trạng thái tới client.
  - Cơ chế đo độ trễ RTT và đồng bộ đồng hồ mạng qua `ping`/`pong`.

- **M01-T03 (Mượt phía client):**
  - Client-side Prediction: Client áp dụng input ngay lập tức, lưu lại `history` buffer các frame di chuyển.
  - Server Reconciliation: Khi snapshot server trả về, client đối chiếu và bù trừ sai lệch, chạy lại các input chưa được server xác nhận.
  - Entity Interpolation: Nội suy chuyển động vị trí (lerp) cho các người chơi khác theo độ trễ buffer 50ms, đảm bảo chuyển động mượt mà không giật lắc.
  - Bảng HUD F3 hiển thị thời gian thực: FPS, Ping (RTT/2), Server Tick, số lượng Entity, tọa độ X/Y.

- **M01-T04 (AOI & rớt mạng):**
  - Lọc thực thể theo vùng quan tâm AOI (`AOI_RADIUS = 560px`): Mỗi client chỉ nhận snapshot các thực thể nằm trong bán kính quan sát, tối ưu băng thông khi số lượng người chơi lớn.
  - Cơ chế rớt mạng và kết nối lại: Khi ngắt kết nối WebSocket, server giữ lại nhân vật trong 30 giây (`RECONNECT_SEC = 30`). Client kết nối lại với `reconnectKey` sẽ khôi phục nguyên vẹn trạng thái.
  - Ghi nhận chỉ số hiệu năng `perf` định kỳ 10 giây vào file log JSON Lines (`logs/server-*.log`).

- **M01-T05 (Double Check lớn & Stress Test):**
  - Công cụ `tools/stress_test.py` mô phỏng 32 client kết nối đồng thời, gửi input 30Hz và đo lường thời gian tick server.
  - Rà soát toàn bộ mã nguồn, bảo đảm tuân thủ các quy định về kiến trúc và không có bất kỳ dấu vết AI nào.

---

## 2. Kết quả kiểm tra tổng hợp

### Bộ kiểm tra tự động (`python tools/run_all.py`):
```
============================================================
TONG HOP KET QUA DOUBLE CHECK:
  [OK] 1. Kiem tra tinh & cu phap (check_static.py): PASS
  [OK] 2. Kiem tra du lieu shared (check_data.js): PASS
  [OK] 3. Chay unit test server (server/tests/run.js): PASS (5/5 unit tests)
  [OK] 4. Chay smoke test mang (smoke_test.py): PASS (8 client + reconnect)
Thoi gian thuc thi: 14.04s
KET LUAN: ALL PASS
============================================================
```

### Kiểm tra tải 32 Client (`python tools/stress_test.py --duration 12`):
- Số lượng client kết nối đồng thời: **32 / 32**.
- Tổng số snapshot nhận được: **6240**.
- Tổng số pong phản hồi: **200**.
- Thời gian tick server trung bình (`tickAvgMs`): **0.01ms** (Quy định: < 15ms).
- Thời gian tick server tối đa (`tickMaxMs`): **0.21ms**.
- **Kết luận:** **STRESS_TEST: PASS**.

---

## 3. Hướng dẫn test thật 2 máy qua Radmin VPN

Để kiểm tra trực tiếp giữa 2 máy tính trong mạng Radmin VPN:

1. **Trên máy Host:**
   - Kết nối vào phòng Radmin VPN chung.
   - Mở port firewall (chỉ cần thực hiện 1 lần):
     ```cmd
     netsh advfirewall firewall add rule name="OPBR" dir=in action=allow protocol=TCP localport=8080
     ```
   - Khởi động server:
     ```bash
     npm start
     ```
   - Quan sát địa chỉ IP Radmin được in ra ở console (dạng `26.x.x.x:8080`).
   - Mở trình duyệt trên máy Host tại `http://localhost:8080/`.
   - Đặt tên (ví dụ: `Host_Player`), chọn màu sắc, vào Lobby thấy nhãn `[HOST]` và bảng điều khiển số bot.

2. **Trên máy Khách (Client thứ 2):**
   - Kết nối vào cùng phòng Radmin VPN.
   - Mở trình duyệt và truy cập `http://<IP-Radmin-Host>:8080/`.
   - Đặt tên (ví dụ: `Peer_Player`), chọn màu sắc khác, bấm Tham gia.

3. **Kiểm tra tương tác:**
   - Cả 2 máy đều thấy nhau trong danh sách người chơi phòng chờ.
   - Chat thử từ máy này sang máy kia, tin nhắn xuất hiện tức thì và an toàn.
   - Host bấm **Bắt đầu trận đấu**:
     - Cả 2 máy chuyển sang màn hình trận đấu.
     - Dùng các phím `W`, `A`, `S`, `D` để di chuyển: nhân vật di chuyển tức thì (prediction), chuyển động của đối phương mượt mà nhờ lerp nội suy, không bị giật lùi (reconciliation).
     - Bấm `F3`: Quan sát bảng HUD hiển thị Ping, FPS (~60), Server Tick và tọa độ.
     - Thử tắt tab hoặc ngắt mạng máy Khách trong 10 giây rồi mở lại: nhân vật được khôi phục tại đúng vị trí cũ nhờ cơ chế reconnect 30 giây.

---
*Milestone M01 hoàn thành toàn diện, sẵn sàng chuyển sang Milestone M02 (Pixel art & render).*
