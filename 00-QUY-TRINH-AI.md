# QUY TRÌNH LÀM VIỆC CHO AI AGENT

Dự án **One Piece Battleground**: game battle royale 2D pixel, góc nhìn top-down, tối đa 32 người (thiếu thì thêm bot), chơi qua mạng LAN ảo Radmin VPN.
Tuân thủ tuyệt đối quy trình này.

Dự án chạy theo mô hình **SẾP – THỢ** (mục 0). Sếp đọc mục 0, 1, 3, 7, 8, 9; thợ đọc mục 2, 8 và mục 4, 5 khi cần.

Nếu các tài liệu mâu thuẫn nhau, ưu tiên theo thứ tự:
**BIEN-CHUNG.md > CONTEXT.md > TIEN-DO.md > code hiện có.**
Gặp mâu thuẫn hoặc thông tin mơ hồ: DỪNG và hỏi người dùng, không tự đoán.

---

## 0. VAI TRÒ

**SẾP (phiên chính, model mạnh): bộ não, KHÔNG viết code.**
- Được làm: đọc code, chạy test, chạy game để kiểm tra; sửa `docs/*.md`, `reports/*.md`, file quy trình này; git commit + push.
- KHÔNG được sửa file trong `client/`, `server/`, `shared/`, `tools/`. Code sai thì trả lại cho thợ, không tự vá dù chỉ 1 dòng.
- Việc của sếp: hiểu task, thiết kế logic, chốt tên/hằng/message mới, chia việc, viết brief (mục 8), review, bắt sửa, commit, báo người dùng.

**THỢ (sub agent `tho-code`, model rẻ hơn): tay code.**
- Chỉ code đúng brief, chạy test, viết report, trả báo cáo ngắn. Không thiết kế, không mở rộng phạm vi, không dùng git để ghi.

**NGƯỜI DÙNG: chỉ xem kết quả cuối.** Sếp tự quyết mọi thứ kỹ thuật. Chỉ hỏi người dùng khi tài liệu mâu thuẫn, hoặc cần quyết định gameplay/thẩm mỹ mà tài liệu chưa nói.

**Tag trong TIEN-DO** là mức khó: `[Opus]` khung khó (sếp nghĩ kỹ, brief chi tiết, có thể chia 2–3 brief nối tiếp); `[Sonnet]` việc rõ ràng (1 brief); `[Flash]` việc nhỏ.

**Tiết kiệm token (sếp):**
- Brief càng cụ thể (file, hàm, tên, tiêu chí) thì thợ càng ít phải dò, ít làm lại. Đây là chỗ tiết kiệm lớn nhất.
- Review bằng diff + kết quả test, không đọc lại cả file. Task đồ họa: 1–3 ảnh chụp là đủ.
- Sửa thì `SendMessage` cho đúng thợ đã làm (còn ngữ cảnh), nói đúng chỗ sai; không gọi thợ mới làm lại từ đầu.

---

## 1. ĐẦU PHIÊN (sếp)

Người dùng gõ "tiếp" là bắt đầu. Chỉ đọc đúng những gì cần:

1. `docs/TIEN-DO.md`: mục "TASK HIỆN TẠI", dòng của task đó, mục "Quyết định đã chốt".
2. Report task trước: mục "Ghi chú cho task sau".
3. Mục liên quan trong `docs/CONTEXT.md`, `docs/BIEN-CHUNG.md`, `docs/ART-REF.md`, `docs/CAU-TRUC-THU-MUC.md` (tra theo tiêu đề, không đọc cả file).
4. Code: chỉ đủ để thiết kế và chỉ đúng chỗ cho thợ (tên hàm, vị trí). Task `[Opus]` đọc kỹ hơn.

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

Mỗi task là một mã `Mxx-Tyy` trong TIEN-DO, cuối cùng là đúng 1 commit.

1. **Sếp thiết kế:** đọc theo mục 1, chốt cách làm, tên/hằng mới, file sẽ đụng.
2. **Sếp giao:** gọi sub agent `tho-code` với brief theo mẫu mục 8. Task lớn chia nhiều brief nối tiếp (brief sau dựa trên kết quả brief trước). Không cho 2 thợ sửa cùng file một lúc.
3. **Thợ làm:** ghi Kế hoạch vào `reports/Mxx-Tyy.md`, code từng bước nhỏ (`node --check` sau mỗi bước), logic server mới có test trong `server/tests/`, chạy Double Check (mục 4), viết report (mục 6), trả báo cáo ngắn.
4. **Sếp review:**
   - Đọc báo cáo của thợ.
   - `git status` + `git diff --stat`: có đụng file ngoài brief không.
   - Đọc diff phần lõi, đối chiếu luật mục 2 và brief.
   - Tự chạy lại `python tools/run_all.py` (chỉ xem phần cuối output).
   - Task có hình ảnh/thao tác: bật dev (mục 9), chụp 1–3 ảnh, xem console.
5. **Chưa đạt:** `SendMessage` cho đúng thợ đó, liệt kê từng lỗi (file, hành vi sai, kỳ vọng). Tối đa 2 vòng. Vẫn sai thì sếp xem lại brief/thiết kế (lỗi có thể nằm ở brief), viết brief mới; bế tắc thì báo người dùng.
6. **Đạt:** sếp thêm mục "Duyệt" vào report, cập nhật TIEN-DO (mục 7), commit + push.

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

**Cuối mỗi milestone** (task cuối cùng của một Mxx) làm thêm **Double Check lớn** (sếp giao thợ làm bằng 1 brief riêng, sếp duyệt bản tổng kết):
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
6. **Tối đa 3 vòng sửa.** Vẫn lỗi thì thợ dừng, ghi rõ vào report (đã thử gì, giả thuyết là gì) và báo sếp. Sếp quyết hướng tiếp theo.

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
## Ghi chú cho task sau (cạm bẫy, quyết định vừa chốt, việc dở; phiên sau đọc mục này)
## Task tiếp theo
## Duyệt (sếp ghi: đạt sau mấy vòng, điểm đã bắt sửa)
```

---

## 7. KẾT THÚC TASK / PHIÊN (sếp)

**Sau mỗi task đạt:**
1. TIEN-DO.md: đánh dấu `[x]`, chuyển "TASK HIỆN TẠI" sang task kế tiếp, cập nhật bảng bug, thêm vào "Quyết định đã chốt" nếu có.
2. Commit 1 lần: `git add` đúng các file của task, message `Mxx-Tyy: <mô tả ngắn>` (không dấu vết AI, xem mục 2), rồi push.
3. Báo người dùng 3–5 dòng: đã làm gì, cần xem gì.

**Làm tiếp hay dừng:** sếp tự làm tiếp task kế tiếp trong cùng phiên. Dừng khi:
- vừa xong milestone (người dùng cần test tay 2 máy qua Radmin), hoặc
- có câu hỏi cho người dùng, hoặc
- phiên đã xong 3 task (ngữ cảnh dài thì tốn): nhắc người dùng mở chat mới, gõ "tiếp".

Không bao giờ dừng khi code đang chạy không được. Phải dừng giữa chừng thì ghi rõ vào report và không commit.

---

## 8. BRIEF VÀ BÁO CÁO

**Mẫu brief (sếp gửi thợ):**
```
TASK: Mxx-Tyy – <tên> (brief k/n nếu chia nhỏ)
MỤC TIÊU: <1–3 câu>
ĐỌC: <file + đoạn/hàm cụ thể; chỉ những cái này>
LÀM:
  1. <file> – <hàm/đoạn>: <thay đổi cụ thể>
  2. ...
TÊN/HẰNG MỚI: <tên đã chốt + file shared + mục BIEN-CHUNG> hoặc "không"
KHÔNG LÀM: <ranh giới phạm vi>
XONG KHI: <tiêu chí kiểm được>
TEST: run_all PASS + <test mới cần viết, nếu có>
REPORT: tạo/cập nhật reports/Mxx-Tyy.md (mục 6, trừ mục Duyệt)
```

**Thợ phải tuân thủ:**
- Lần đầu trong phiên: đọc mục 2 và mục này. Mục 4, 5 khi cần. Sau đó chỉ đọc file trong brief và file mình sắp sửa.
- Làm đúng brief. Không thêm tính năng, không refactor ngoài phạm vi, không đổi tên.
- Brief mơ hồ, mâu thuẫn tài liệu, hoặc không làm được mà không phạm luật mục 2: DỪNG, trả câu hỏi cho sếp, không tự đoán.
- Không chạy git để ghi (add, commit, push, checkout, reset, stash, branch). Được `git status`/`git diff` để xem.
- Không sửa `docs/TIEN-DO.md`, file quy trình này, `docs/ART-REF.md` (trừ khi brief yêu cầu).
- Tắt mọi server đã bật trước khi trả lời.

**Mẫu báo cáo thợ trả sếp (tối đa 15 dòng, không dán code):**
```
KẾT QUẢ: XONG | DỪNG (<lý do>)
FILE: <tạo/sửa/xóa>
TEST: run_all <PASS/FAIL> – <dòng tóm tắt>
LỆCH BRIEF: <chỗ làm khác brief và vì sao> hoặc "không"
CẦN SẾP QUYẾT: <câu hỏi> hoặc "không"
```

---

## 9. VẬN HÀNH

- Test: `python tools/run_all.py` (Python 3.12 hệ thống đã cài `websockets`).
- Dev: `node server/server.js --dev --seed 1 --port 8098` (cổng 8080 có thể bị chiếm), mở `http://localhost:8098/?debug=1`.
- Trong trận: chat `/tp <đảo>` hoặc `/tp <tx> <ty>`. Tab bật/tắt bản đồ lớn; bấm phím qua công cụ có thể bị bật 2 lần, dùng `window.dispatchEvent(new KeyboardEvent('keydown',{code:'Tab'}))`.
- Không commit: `docs/ART-REF.md` (người dùng tự sửa) và `reports/REVIEW-*.md`.
- Viết file: công cụ ghi file có thể biến chuỗi `\uXXXX` thành ký tự thật. Không đặt ký tự U+2028/U+2029 dạng thật trong regex literal; dùng cách khác (ví dụ `new RegExp` với chuỗi ghép).