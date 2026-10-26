# TIẾP – BÀN GIAO CHO PHIÊN MỚI

Người dùng chỉ cần nói "tiếp" (hoặc "đọc TIEP.md"). Phiên mới làm đúng các bước dưới đây, KHÔNG đọc thêm tài liệu ngoài danh sách nếu không cần.

## 1. Việc của phiên này

- **Task:** M03B-T01g – Sắp theo y + ánh sáng (một danh sách vẽ sắp theo y, lớp ánh sáng ambient theo vùng)
- **Model gợi ý:** Sonnet. Nếu đang chạy model khác, báo người dùng một câu rồi vẫn làm.
- **Đọc (theo thứ tự, chỉ những file này):**
  1. `00-QUY-TRINH-AI.md` mục 2, 4, 6, 7
  2. `docs/TIEN-DO.md` dòng T01g (mục tiêu)
  3. `reports/M03B-T01f.md` mục "Ghi chú cho task sau"
  4. Code: `client/js/10-main.js` (đoạn vẽ khung, quanh dòng 130), `client/js/05b-render-entities.js`, `client/js/05a-render-map.js` (chỉ `R.renderMap`)
  5. `docs/ART-REF.md` chỉ mục C8 (thứ tự lớp), C9 (cache ánh sáng), F1 hạng 2 (lớp ánh sáng)
- **Không cần đọc:** CONTEXT.md, BIEN-CHUNG.md (trừ khi thêm hằng số mới: khi đó đọc mục 3 và 15).

## 2. Ghi chú từ phiên trước (quan trọng)

- **Không commit:** `docs/ART-REF.md` (người dùng sửa, có nhắc tên công cụ AI) và `reports/REVIEW-*.md`.
- **Vị trí đảo** không còn trong `S.ISLANDS`; đọc `map.islands` (server: `world.getIslands()`). Ambient theo vùng có thể dùng `map.owner` (0 nước, 1..10 đảo lớn theo thứ tự S.ISLANDS, ≥ 11 đảo nhỏ) để biết người chơi đang ở đảo nào (ví dụ Đảo Ma tối hơn).
- **Thứ tự vẽ hiện tại:** `R.renderMap` (chunk + lớp nước động) → `R.renderEntities`. Lớp ánh sáng phải vẽ sau cả hai, trước HUD.
- **Người dùng rất để ý chi phí token:** chọn cách ít tốn nhất mà vẫn đúng (đọc ít file, ít ảnh chụp). Task đồ họa: chụp màn hình vài lần là đủ.
- **Viết file:** công cụ ghi file có thể biến chuỗi `\uXXXX` thành ký tự thật. Tránh ` `/` ` trong regex literal.
- **Chạy test:** `python tools/run_all.py` (đã cài `websockets` cho Python 3.12 hệ thống).
- **Chạy dev:** `node server/server.js --dev --seed 1 --port 8098` (8080 có thể bị chiếm). Trong trận: chat `/tp <đảo>` hoặc `/tp <tx> <ty>`; Tab bật/tắt bản đồ lớn (bấm phím qua công cụ có thể bị bật 2 lần, dùng `window.dispatchEvent(new KeyboardEvent('keydown',{code:'Tab'}))`).

## 3. Khi xong task (bắt buộc)

1. `python tools/run_all.py` PASS, viết đủ report theo mẫu (mục 6 quy trình), có mục "Ghi chú cho task sau".
2. Cập nhật `docs/TIEN-DO.md`: tick `[x]`, đổi TASK HIỆN TẠI.
3. **Viết lại file `TIEP.md` này** cho task kế tiếp:
   - Task + model gợi ý (lấy tag `[Opus]`/`[Sonnet]`/`[Flash]` trong TIEN-DO).
   - Danh sách file cần đọc (ít nhất có thể).
   - Ghi chú: những gì phiên sau phải biết.
4. Commit 1 lần dạng `Mxx-Tyy: ...` (không Co-authored-by, không tên AI), push.
5. DỪNG, báo người dùng tóm tắt 5 dòng và nhắc: "Mở chat mới, gõ 'tiếp'."
