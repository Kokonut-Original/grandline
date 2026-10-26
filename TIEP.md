# TIẾP – BÀN GIAO CHO PHIÊN MỚI

Người dùng chỉ cần nói "tiếp" (hoặc "đọc TIEP.md"). Phiên mới làm đúng các bước dưới đây, KHÔNG đọc thêm tài liệu ngoài danh sách nếu không cần.

## 1. Việc của phiên này

- **Task:** M03B-T01f – Chiều sâu đảo và nước (đang dở, làm tiếp từ bước 3) **+ bố trí đảo tự nhiên** (mục "Bổ sung" trong report; nên làm phần bố trí trước, vì nó đổi map rồi mới vẽ)
- **Model gợi ý:** Opus (task đồ họa cần nhìn ảnh và tự đánh giá). Nếu đang chạy model khác, báo người dùng một câu rồi vẫn làm.
- **Đọc (theo thứ tự, chỉ những file này):**
  1. `00-QUY-TRINH-AI.md` mục 2, 4, 6, 7
  2. `reports/M03B-T01f.md` (kế hoạch + trạng thái dở)
  3. Code: `shared/21-mapgen.js`, `client/js/02g-tiles-paint.js`, `client/js/05a-render-map.js`
  4. `docs/ART-REF.md` chỉ mục C7–C9 và F1 (kỹ thuật vẽ)
- **Không cần đọc:** CONTEXT.md, BIEN-CHUNG.md (task này không đổi tên/hợp đồng; nếu buộc phải đổi thì đọc mục liên quan).

## 2. Ghi chú từ phiên trước (quan trọng)

- **Chưa commit:**
  - `shared/21-mapgen.js` đã viết lại: bờ theo nhiễu, không lượng giác; đã kiểm 200 seed, mọi đảo đều ra được biển.
  - `client/js/02g-tiles-paint.js` mới viết, chưa nạp vào `index.html`.
  - `docs/ART-REF.md` do người dùng sửa: KHÔNG commit (có nhắc tên công cụ AI, trái luật dấu vết).
  - `reports/REVIEW-*.md`: KHÔNG commit.
- **Map:** hash đổi so với trước là bình thường. Test `mapgen.test.js` không so hash cố định.
- **File mới `02g`:**
  - Thêm vào `client/index.html` (sau `02f`), `EXPECTED_SCRIPTS` trong `tools/check_static.py`, và `docs/CAU-TRUC-THU-MUC.md`.
  - `server/tests/palette_tiles.test.js` vẫn yêu cầu sprite `tile_*` 3 biến thể ở `02e`: giữ `02e`, chỉ không dùng nó để vẽ nền nữa.
- **Người dùng rất để ý chi phí token:** trước khi làm, chọn cách ít tốn nhất mà vẫn đúng (đọc ít file, ít ảnh chụp, không review lan man). Ảnh xem toàn bản đồ có thể tạo bằng script Node + zlib xuất PNG (không cần mở trình duyệt).
- **Viết file:** công cụ ghi file có thể biến chuỗi `\uXXXX` thành ký tự thật. Tránh ` `/` ` trong regex literal (đã gặp ở `net.js`).
- **Chạy test:** máy này thiếu `websockets` ở Python hệ thống. Chạy `run_all.py` bằng Python có `websockets`, hoặc `pip install -r tools/requirements.txt`.
- **Cổng:** 8080 trên máy này có thể bị chương trình khác chiếm. Chạy dev bằng `node server/server.js --dev --seed 1 --port 8098`.

## 3. Khi xong task (bắt buộc)

1. `python tools/run_all.py` PASS, viết đủ report theo mẫu (mục 6 quy trình), có mục "Ghi chú cho task sau".
2. Cập nhật `docs/TIEN-DO.md`: tick `[x]`, đổi TASK HIỆN TẠI.
3. **Viết lại file `TIEP.md` này** cho task kế tiếp:
   - Task + model gợi ý (lấy tag `[Opus]`/`[Sonnet]`/`[Flash]` trong TIEN-DO).
   - Danh sách file cần đọc (ít nhất có thể).
   - Ghi chú: những gì phiên sau phải biết.
4. Commit 1 lần dạng `Mxx-Tyy: ...` (không Co-authored-by, không tên AI), push.
5. DỪNG, báo người dùng tóm tắt 5 dòng và nhắc: "Mở chat mới, gõ 'tiếp'."
