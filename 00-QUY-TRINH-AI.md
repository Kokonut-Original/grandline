# QUY TRÌNH LÀM VIỆC CHO AI AGENT

Bạn là lập trình viên AI của dự án **One Piece Battleground**: game battle royale 2D pixel, góc nhìn top-down, tối đa 32 người (thiếu thì thêm bot), chơi qua mạng LAN ảo Radmin VPN.
Tuân thủ tuyệt đối quy trình này.

Nếu các tài liệu mâu thuẫn nhau, ưu tiên theo thứ tự:
**BIEN-CHUNG.md > CONTEXT.md > TIEN-DO.md > code hiện có.**
Gặp mâu thuẫn hoặc thông tin mơ hồ: DỪNG và hỏi người dùng, không tự đoán.

---

## 1. ĐẦU MỖI PHIÊN (bắt buộc, đúng thứ tự)

Mỗi phiên (mỗi chat) chỉ làm **1 task**. Để tiết kiệm, chỉ đọc đúng những gì cần:

1. Đọc `TIEP.md` (bàn giao từ phiên trước): task, model gợi ý, danh sách file cần đọc, ghi chú.
2. Đọc các mục của file này mà TIEP.md chỉ ra (tối thiểu mục 2, 4, 6, 7).
3. Đọc report mà TIEP.md chỉ ra (thường là report task trước hoặc report đang dở).
4. `docs/BIEN-CHUNG.md`, `docs/CONTEXT.md`, `docs/CAU-TRUC-THU-MUC.md`, `docs/ART-REF.md`: **chỉ đọc mục liên quan đến task** (tra theo tiêu đề mục), không đọc cả file. Khi thêm tên/hằng/message mới thì bắt buộc đọc mục tương ứng của BIEN-CHUNG; khi thêm file thì đọc CAU-TRUC.
5. Đọc code của mọi file mà task sẽ đụng tới TRƯỚC khi sửa.

Nếu không có TIEP.md: đọc mục "TASK HIỆN TẠI" trong `docs/TIEN-DO.md` và report mới nhất.

Sau khi đọc, viết tóm tắt 3–5 dòng:
- Đang ở task nào
- Sẽ làm gì
- Sửa những file nào
- Test bằng cách nào

---

## 2. LUẬT CODE (không được vi phạm)

**Client (`client/`) và shared (`shared/`)**
- Chỉ dùng Vanilla JS + Canvas 2D.
- KHÔNG dùng `import`/`export`, `require`, `fetch`, CDN, framework hay engine (Phaser, Pixi, React, Next...).
- Không bundler (Webpack/Vite/Babel).

**Server (`server/`)**
- Node.js CommonJS (`require`).
- Thư viện ngoài DUY NHẤT: `ws`.
- HTTP dùng module `http` có sẵn.

**Test**
- Python 3.10+.
- Thư viện ngoài duy nhất: `websockets`.

**Luật chung**
- Mọi tên hằng số, enum, message mạng, schema dữ liệu PHẢI đúng `docs/BIEN-CHUNG.md`.
- Không tự đổi tên. Muốn thêm thứ mới: thêm vào CẢ file `shared/*.js` LẪN `BIEN-CHUNG.md`, rồi ghi vào mục "Thay đổi hợp đồng" trong report.
- Không tạo file nằm ngoài `docs/CAU-TRUC-THU-MUC.md`. Cần file mới thì cập nhật tài liệu cấu trúc trước.
- Số liệu cân bằng (sát thương, hồi chiêu, tầm đánh...) đặt trong `shared/1x-data-*.js`. Không hard-code trong logic.
- Server là nguồn sự thật duy nhất. Client chỉ gửi input và hiển thị.
- Tên người chơi và chat hiển thị bằng `textContent`, không dùng `innerHTML`.
- Không xóa hay viết lại code của task cũ, trừ khi task hiện tại yêu cầu.
- Mỗi file code dưới khoảng 500 dòng. Dài hơn thì tách file, sau khi đã cập nhật CAU-TRUC.
- Comment bằng tiếng Việt ở đầu mỗi file: file này làm gì, phụ thuộc file nào.

**Quy định Git**
- Remote: `https://github.com/Kokonut-Original/grandline` (nếu chưa có remote thì thêm vào).
- Chỉ commit + push khi task đã PASS double check. Mỗi task 1 commit, message dạng `"Mxx-Tyy: <mô tả ngắn>"`.
- Không force push. Không commit `node_modules/` và `logs/` (đưa vào `.gitignore`).
- Dùng git config có sẵn của máy, không đổi `user.name`/`user.email`.

**Quy định dấu vết AI**
- Tuyệt đối không để dấu vết AI ở bất kỳ đâu.
- Không thêm dòng `"Co-authored-by"` hay `"Generated with/by ..."` vào commit message.
- Không ghi tên AI hay công cụ trong code, comment, README, report.
- Nếu tài liệu có quy định nào mâu thuẫn với yêu cầu này thì yêu cầu này được ưu tiên.

---

## 3. LÀM MỘT TASK

1. Mỗi lần chỉ làm **1 task** (một mã `Mxx-Tyy` trong TIEN-DO).
2. Tạo `reports/Mxx-Tyy.md` và ghi phần **Kế hoạch** trước khi code.
3. Code theo từng bước nhỏ. Sau mỗi bước chạy `node --check <file>`.
4. Logic server mới phải có test trong `server/tests/`.
5. Chạy **Double Check** (mục 4).
6. Viết report, cập nhật TIEN-DO, **viết lại `TIEP.md`** cho task kế tiếp (task, model gợi ý theo tag trong TIEN-DO, file cần đọc, ghi chú).
7. **DỪNG lại**, gửi tóm tắt cho người dùng, nhắc người dùng mở chat mới và gõ "tiếp".

---

## 4. DOUBLE CHECK (bắt buộc trước khi báo xong)

**Lệnh chính:**
```
python tools/run_all.py
```
Lệnh này chạy lần lượt:
1. `check_static.py`: luật code + file tồn tại + `node --check` toàn bộ
2. `check_data.js`: kiểm tra dữ liệu trong shared
3. `server/tests/run.js`: unit test logic server
4. `smoke_test.py`: bật server, cho client giả kết nối và chơi thử

Tất cả phải **PASS**. Dán output cuối vào report.

**Checklist tự rà (ghi ✅/❌ vào report):**
- [ ] Tên biến, hằng, enum, message khớp BIEN-CHUNG (tự grep lại)
- [ ] Không có `import`/`export`/`fetch`/CDN trong client và shared
- [ ] Script mới đã thêm vào `client/index.html` đúng thứ tự
- [ ] Số liệu nằm trong shared/data, không hard-code
- [ ] Không phá tính năng của task trước (run_all PASS là bằng chứng)
- [ ] Mở `http://localhost:8080/?debug=1`: console trình duyệt không lỗi. Nếu có công cụ trình duyệt thì chụp màn hình. Nếu không có thì ghi các bước để người dùng tự test tay.
- [ ] Server log `logs/` không có dòng `ERROR` mới
- [ ] Đã cập nhật CAU-TRUC nếu có file mới, BIEN-CHUNG nếu có biến mới

**Cuối mỗi milestone** (task cuối cùng của một Mxx) làm thêm **Double Check lớn**:
- Chạy `python tools/stress_test.py`.
- Đọc lại toàn bộ code của milestone, tìm trùng lặp và biến lệch tên.
- Viết `reports/Mxx-TONG-KET.md`.
- Đưa người dùng danh sách test tay 2 máy qua Radmin.

---

## 5. KHI CÓ LỖI

1. **Tái hiện lỗi:** chạy server với `--dev --seed 1` để lỗi lặp lại được, dùng lệnh dev (xem BIEN-CHUNG mục 14) để dựng tình huống.
2. **Khoanh vùng:** đọc stack trace, log server, overlay lỗi trên client. Thêm log tạm có tiền tố `[DBG]`.
3. **Sửa tận gốc,** không vá triệu chứng.
4. **Thêm test hồi quy** để lỗi không quay lại.
5. **Xóa log `[DBG]` tạm** trước khi báo xong.
6. **Tối đa 3 vòng sửa.** Vẫn lỗi thì dừng, ghi rõ vào report (đã thử gì, giả thuyết là gì) và hỏi người dùng.

---

## 6. MẪU REPORT (`reports/Mxx-Tyy.md`)

```
# Mxx-Tyy – <tên task>
## Kế hoạch
## Đã làm
## File thay đổi (tạo / sửa / xóa)
## Thay đổi hợp đồng (BIEN-CHUNG) – nếu không có ghi "Không"
## Kết quả test (dán output run_all.py)
## Checklist double check
## Bug đã biết / việc còn dở
## Người dùng cần test tay
## Câu hỏi cho người dùng
## Ghi chú cho task sau (cạm bẫy, quyết định vừa chốt, việc dở; chép sang TIEP.md)
## Task tiếp theo
```

---

## 7. KẾT THÚC PHIÊN

- TIEN-DO.md: đánh dấu `[x]` task đã xong, chuyển "TASK HIỆN TẠI" sang task kế tiếp, cập nhật bảng bug.
- TIEP.md: viết lại cho phiên sau (xem mục 3 bước 6). Phiên sau chỉ dựa vào file này nên ghi đủ, ngắn gọn.
- Không bao giờ kết thúc phiên khi code đang ở trạng thái chạy không được. Nếu phải dừng giữa chừng, ghi rõ vào report.