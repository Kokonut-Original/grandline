# BÁO CÁO PHÂN TÍCH ĐỒ HỌA & KỸ THUẬT ART MINI DUNGEON SLAYER
> Tài liệu kỹ thuật chi tiết dành riêng cho việc áp dụng vào dự án **One Piece Battleground (grandline)**.  
> 100% đối chiếu từ mã nguồn thật của Mini Dungeon Slayer. Không suy đoán, trích dẫn chính xác từng dòng code và file gốc.

---

## PHẦN A. NGUỒN ART

### 1. Bản chất Sprite & Tile trong Game
- **Sprite nhân vật, quái vật, vũ khí, icon:** 100% được dựng hoàn toàn bằng **code JavaScript thuần** (ma trận mảng chuỗi ký tự kết hợp bảng màu `pal` và thuật toán sinh viền tự động). Không nạp từ file ảnh ngoài tại thời gian chạy (runtime).
- **Tile sàn, tường, cửa, mái nhà, đuốc:** 100% được vẽ trực tiếp bằng các lệnh Canvas 2D (`fillRect`, `beginPath`, `ellipse`, `drawImage`) kết hợp thuật toán băm toạ độ giả ngẫu nhiên.
- **Về file Atlas / Sprite sheet:** File `js/02b-atlas.js` được gán cố định `const ATLAS = null; const ATLAS_IMAGE = null;`. Toàn bộ logic nạp atlas ở `js/02-assets.js` đều bỏ qua và chuyển hướng trực tiếp sang renderer sinh bằng code trong `js/02c-pixel-sprites.js`.

#### Ví dụ nguyên văn 1: Nhân vật chính (`knight_m`)
*Trích từ `js/02c-pixel-sprites.js` (dòng 9–35):*
```javascript
  knight_m: { anim: "walk",
    pal: { y: "#ffb35c", h: "#e0662a", H: "#a83c1c", S: "#f6c69c", s: "#d9946c", E: "#24182e", W: "#ffffff",
      L: "#d7e2f5", a: "#6c7fb4", A: "#3c4672", G: "#f2b234", B: "#2a2e48", b: "#4a5078" },
    body: [
      "....hyyh.yh...",
      "..hhhyhhhhhh..",
      ".hhhhhhhhhhhh.",
      "hhHhhhhhhhhHhh",
      "hHhSSSSSSSShHh",
      ".HSSSSSSSSSSH.",
      ".HSWESSSSWESH.",
      ".HSEESSSSEESH.",
      ".HsSSSssSSSsH.",
      ".HhhhSSSShhhH.",
      "..HhhhhhhhhH..",
      "...HhhhhhhH...",
      "..AaHHhhHHaA..",
      ".SAaLLLLLLaAS.",
      ".SAaLLaaLLaAS.",
      "..AGGGGGGGGA..",
      "..AaaaAAaaaA..",
    ],
    legs: {
      stand: ["...AAa..aAA...", "..BBBb..bBBB.."],
      a:     ["..AAa...aAA...", ".BBBb.....BBB."],
      b:     ["...AAa...aAA..", ".BBB.....bBBB."],
    } },
```

#### Ví dụ nguyên văn 2: Tile sàn hầm ngục (`drawTileAt`)
*Trích từ `js/32-render.js` (dòng 76–83):*
```javascript
    // sàn lát đá
    if (!drawTile(g, "floor_" + (1 + Math.floor(r * 3)), px, py)) {
      g.fillStyle = th.floor[Math.floor(r * th.floor.length)]; g.fillRect(px, py, T, T);
      g.fillStyle = th.floorLine; g.fillRect(px, py + T - 1, T, 1); g.fillRect(px + T - 1, py, 1, T);
      g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(px, py, T - 1, 1);
      if (r > 0.78) { g.fillStyle = "rgba(0,0,0,.22)"; const cx = 3 + Math.floor(r * 50) % 9; g.fillRect(px + cx, py + 6, 3, 1); g.fillRect(px + cx + 2, py + 7, 2, 1); }
      if (r < 0.08) { g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(px + 5, py + 9, 2, 2); }
    }
```

#### Ví dụ nguyên văn 3: Chân đuốc & Ngọn lửa đuốc
*Trích từ `js/32-render.js` (dòng 121 & dòng 381–388):*
```javascript
  drawTorchBase(g, px, py) {
    g.fillStyle = "#000"; g.fillRect(px + 6, py + 6, 4, 8);
    g.fillStyle = "#6a4a2a"; g.fillRect(px + 7, py + 7, 2, 6);
  },
  drawFlame(ctx, x, y) {
    const t = GAME.time;
    for (let i = 0; i < 3; i++) {
      const h = 3 + Math.sin(t * 14 + i * 2 + x) * 1.5;
      ctx.fillStyle = ["#ff6a1a", "#ffb32a", "#fff2a0"][i];
      ctx.fillRect(Math.round(x - 2 + i * 0.5), Math.round(y - h + i), 4 - i, Math.round(h + 2 - i));
    }
  },
```

---

### 2. Nguồn gốc ảnh & Giấy phép
- **Tình trạng:** **không có**.
- Game đang chạy **hoàn toàn 100% không nạp bất kỳ file ảnh nào** (`.png`, `.jpg`, `.webp`).
- Trong code có chuẩn bị sẵn cấu trúc nạp gói mã nguồn mở `0x72_DungeonTilesetII_v1.7` (tác giả 0x72, giấy phép CC0 - Public Domain, ô 16×16px), nhưng tại runtime biến `ATLAS` và `ATLAS_IMAGE` được đặt là `null`, game tự sinh toàn bộ đồ hoạ qua mã nguồn JS độc lập.

---

## PHẦN B. ĐỘ PHÂN GIẢI VÀ ZOOM

### 3. Thông số kỹ thuật độ phân giải & Khử nhòe Pixel
- **Kích thước tile gốc:** `16 × 16` pixel.  
  *Trích `js/00-config.js` dòng 3:* `TILE: 16`.
- **Kích thước Canvas logic:** Chiều cao cố định `270` pixel; chiều rộng co giãn theo tỷ lệ màn hình (thông thường là `480 × 270`, tỷ lệ 16:9).  
  *Trích `js/00-config.js` dòng 3:* `VIEW_W: 480, VIEW_H: 270`.
- **Hệ số phóng to lên màn hình:**  
  Tính toán phóng to theo **bội số nguyên điểm ảnh thiết bị (integer scale)** để triệt tiêu hiện tượng méo hay rung giật pixel:
  ```javascript
  // Trích js/99-main.js dòng 28-36 (hàm resizeView):
  const dpr = Math.min(3, devicePixelRatio || 1), cw = innerWidth || 480, ch = innerHeight || 270;
  const scale = Math.max(1, Math.round(ch * dpr / CONFIG.VIEW_H)); // số pixel màn hình cho 1 pixel game
  const vw = Math.ceil(cw * dpr / scale), vh = Math.ceil(ch * dpr / scale);
  worldCanvas.width = vw; worldCanvas.height = vh;
  worldCanvas.style.width = (vw * scale / dpr) + "px";
  worldCanvas.style.height = (vh * scale / dpr) + "px";
  Object.assign(GAME.view, { w: vw, h: vh, scale: scale / dpr, dpr, offX: 0, offY: 0 });
  ```
- **Cách bật hiển thị pixel sắc nét (Crisp Pixel):**
  - Trong **CSS** (`css/style.css` dòng 7):
    ```css
    #worldCanvas { position: absolute; image-rendering: pixelated; image-rendering: crisp-edges; }
    ```
  - Trong **JavaScript** khi lấy context 2D (`js/99-main.js` dòng 35 và `js/32-render.js` dòng 14):
    ```javascript
    wctx.imageSmoothingEnabled = false;
    ```

---

### 4. Kích thước nhân vật và NPC so với Tile
- **Kích thước tính theo pixel gốc (đã bao gồm viền tự động 1px):**
  - Nhân vật chính / NPC người (`knight_m`, `npc_smith`, `hoa`):
    - Khung thân: 14 cột ký tự, 17 hàng + chân 2 hàng = 19 hàng.
    - Sau khi thêm viền 1px (`w = max_len + 2, h = rows.length + 2`):  
      **16 × 21 pixel** (Rộng bằng đúng 1 tile = 16px, Cao = 1.31 tile = 21px).
  - Quái nhỏ (`goblin`, `skelet`):
    - Goblin: 12 cột × 13 hàng -> Sau viền: **14 × 15 pixel** (~0.88 × 0.94 tile).
    - Skelet: 12 cột × 14 hàng -> Sau viền: **14 × 16 pixel**.
  - Đạo cụ / Vũ khí cầm tay:
    - Kiếm (`weapon_rusty_sword`): 5 cột × 12 hàng -> Sau viền: **7 × 14 pixel**.
    - Rìu lớn (`weapon_hammer`): 7 cột × 10 hàng -> Sau viền: **9 × 12 pixel**.
  - Boss / Quái khổng lồ: Vẽ bằng kích thước ma trận lớn hơn hoặc áp dụng hệ số scale (`scale: 1.5 - 2.0`).

---

## PHẦN C. MÀU SẮC (PALETTE)

### 5. Toàn bộ bảng màu Hex đang dùng theo nhóm

| Nhóm | Các mã Hex đang dùng trong code | Tác dụng / Vị trí |
|---|---|---|
| **Sàn (Floors)** | `#2a2238`, `#2e2540`, `#272034` (Theme hầm)<br>`#3a3a4a`, `#3e3e50`, `#363646` (Thị trấn)<br>`#3a2e2a`, `#40332d`, `#362a26` (Hầm mỏ)<br>`#1e1828`, `#2a2a38`, `#2a201c` (Đường ron sàn)<br>`#140f1e`, `#181210`, `#1a1622` (Nền vũ trụ/vực ngoài map) | 3 biến thể màu gạch sàn ngẫu nhiên, ron sàn, nền hầm rỗng |
| **Tường (Walls)** | `#4a3d63`, `#6a5444`, `#8a6a5a` (Đỉnh tường - `wallTop`)<br>`#362b4c`, `#4e3d33`, `#6a4a3e` (Mặt tường - `wallFace`)<br>`#281f3a`, `#362820`, `#4a3028` (Chỉ mạch gạch - `wallLine`) | Mặt đứng của tường, mạch vữa gạch và mặt đỉnh tường hứng sáng |
| **Gạch đỏ & Mái ngói** | `#9a3a2e` (Mái chính - `c1`)<br>`#6a2420` (Bóng rãnh ngói - `c2`)<br>`#c86a4a` (Gờ nóc mái sáng)<br>`#e63946`, `#9d0208`, `#ffb703` (Hộp quà đỏ vàng) | Mái ngói nhà thị trấn, hòm vật phẩm đặc biệt |
| **Gỗ (Wood)** | `#7a4a24`, `#8a5a2e` (Màu thân gỗ chính)<br>`#a8743c` (Vân gỗ sáng / gờ hộp gỗ)<br>`#5e3b1c`, `#4e2e14`, `#2a1a10` (Gỗ góc tối, rãnh khuyết)<br>`#6a4a2a` (Cán đuốc gỗ)<br>`#4a3426` (Tà vẹt đường ray mỏ) | Cửa gỗ, hòm gỗ vỡ (`drawCrate`), cán vũ khí, đuốc |
| **Da (Skin)** | `#f6c69c` (Da người sáng), `#d9946c` (Da người bóng tối)<br>`#e8b088`, `#c08860` (Bác Đồng thợ rèn rám nắng)<br>`#f5b0c0`, `#d87a90`, `#ffc8d4` (Da Heo Bướng hồng)<br>`#b8c0c8`, `#8a92a0` (Da thợ mỏ ma quái nhợt nhạt)<br>`#a8e070`, `#6fbf4a`, `#3f8a34`, `#2a5e28` (Da xanh Goblin) | Da nhân vật, NPC và các chủng tộc quái vật |
| **Tóc (Hair)** | `#ffb35c`, `#e0662a`, `#a83c1c` (Tóc cam Hiệp sĩ)<br>`#ffffff`, `#d8d8e8`, `#9a9ab0` (Tóc bạc Pháp sư)<br>`#fff6b0`, `#f2c84a`, `#b0862a` (Tóc vàng Cung thủ)<br>`#2a2438` (Tóc đen Cô Mực)<br>`#f2c9a0` (Đầu trọc Sư Nến - trùng tone da) | Các kiểu tóc và râu của nhân vật / NPC |
| **Đuốc & Lửa (Flame)** | `#ff6a1a` (Lớp lửa ngoài đỏ cam)<br>`#ffb32a` (Lớp lửa giữa cam vàng)<br>`#fff2a0` (Lõi lửa trong cùng vàng sáng)<br>`#ffb35a` (Ánh sáng tỏa ấm vầng đuốc) | Ngọn lửa đuốc lập lòe và vầng sáng tán xạ |
| **UI & HUD** | `#000000`, `#160e22` (Màu viền chữ và viền sprite)<br>`#e8384f`, `#ff3a4a`, `#3a0a14` (Thanh máu: đỏ thường, nguy cấp, nền tối)<br>`#ffd23d`, `#ffe9a8` (Màu vàng kim: tiền, EXP, level, sao)<br>`#9fd0ff`, `#7af0ff` (Màu khiên giáp, dash, miniboss)<br>`rgba(20,80,110,.45)`, `rgba(120,240,255,.8)` (Panel Hologram NPC) | Giao diện HUD, thanh máu, chữ số sát thương, khung thoại |

---

### 6. Cấu trúc Tông màu & Hướng sáng Giả định
- **Số tông cho mỗi vật thể:** Luôn tuân thủ nghiêm ngặt **3 đến 4 tông**:
  1. *Tông bóng tối (Shadow):* Đậm nhất, dùng cho nếp gấp, phần khuất bên dưới (`#a83c1c`, `#3c4672`, `#d9946c`).
  2. *Tông vừa (Mid-tone):* Màu nhận diện chính của vật liệu (`#e0662a`, `#6c7fb4`, `#f6c69c`).
  3. *Tông sáng (Highlight):* Điểm đón sáng trực diện (`#ffb35c`, `#d7e2f5`, `#ffffff`).
  4. *Tông điểm nhấn (Accent/Spec):* Khóa đai kim loại, mắt sáng, đá quý đính kèm (`#f2b234`, `#ff3a3a`).
- **Nguồn sáng giả định:**
  - Hướng chiếu: **Từ trên dội xuống, hơi chếch từ trên đỉnh (Top-Down Oblique Lighting)**.
  - Thể hiện trực tiếp trong code:
    - Đỉnh tường luôn sáng hơn thân (`wallTop` dày 2px kết hợp dải highlight trắng `rgba(255,255,255,.07)` ở hàng trên cùng).
    - Chân tường tiếp giáp sàn luôn có vệt tối `rgba(0,0,0,.35)` dày 2px.
    - Mái nhà có gờ nóc sáng `"#c86a4a"`, cạnh bên trái bị khuất tối `rgba(0,0,0,.3)`, cạnh bên phải viền phản xạ `rgba(255,255,255,.12)`.
    - Gạch sàn có mép trên phản xạ sáng `rgba(255,255,255,.04)`, mép đáy và mép phải chìm vào rãnh vữa tối `floorLine`.

---

### 7. Viền (Outline)
- **Có viền đen không:** **CÓ**, toàn bộ thực thể hiển thị đều có viền.
- **Độ dày:** Cố định đúng **1 pixel gốc (1px)**.
- **Màu viền:** Sử dụng **màu cố định**, KHÔNG làm mờ theo màu thân.
  - Giá trị màu viền sprite: `const OUTLINE = "#160e22";` (*màu tím đen than cực tối, giúp sprite hòa quyện vào không gian hầm ngục mà không bị sắc nhọn thô kệch như màu đen `#000000` thuần*).
- **Thuật toán tạo viền tự động** (*trích `js/02c-pixel-sprites.js` dòng 361–366*):
  ```javascript
  // viền: ô trống kề (4 hướng) một ô có màu thì tô màu viền
  const out = px.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (px[y][x]) continue;
    if ((px[y - 1] && px[y - 1][x]) || (px[y + 1] && px[y + 1][x]) || px[y][x - 1] || px[y][x + 1]) out[y][x] = OUTLINE;
  }
  return { w, h, px: out };
  ```

---

## PHẦN D. CHIỀU SÂU VÀ ÁNH SÁNG

### 8. Bóng đổ dưới chân thực thể (Shadow)
- **Hình dạng:** Hình elip dẹp nằm ngang (Flat horizontal ellipse).
- **Màu sắc & Độ mờ:** `rgba(0,0,0,.35)` (đen, alpha 35%).
- **Cách vẽ và kích thước:**
  *Trích nguyên văn từ `js/32-render.js` dòng 176–179:*
  ```javascript
  shadow(ctx, e) {
    const r = (e.kind === "pickup" ? 3 : e.kind === "prop" ? 7 : e.r + 1) * (e.scale || 1);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(Math.round(e.x), Math.round(e.y), r, r * 0.45, 0, 0, TAU); ctx.fill();
  },
  ```
  - Bán kính ngang: `r` (với nhân vật là `e.r + 1 = 7px`).
  - Bán kính dọc: `r * 0.45` (tỷ lệ ép dẹp 45% tạo góc nhìn phối cảnh 2.5D nghiêng).
  - Tọa độ làm tròn số nguyên `Math.round()` để bóng không bị nhòe pixel.

---

### 9. Quầng sáng quanh đuốc và Hệ thống Lightmap
- **Cơ chế hoạt động:** Kết hợp **Lightmap Offscreen Canvas**, phép trộn **`destination-out`**, và **`lighter` (Additive Glow)**.
  1. Sử dụng 1 canvas phụ `Light.canvas` kích thước logic `480 × 270`.
  2. **Phủ bóng tối toàn màn hình:**
     `L.fillStyle = 'rgba(6,3,14,' + ambient + ')'; L.fillRect(0, 0, w, h);`
     (`ambient` trong hầm ngục từ `0.85` đến `0.92`).
  3. **"Khoét" lỗ sáng xuyên qua lớp tối:**
     Chuyển chế độ trộn: `L.globalCompositeOperation = "destination-out";`
     Vẽ sprite gradient tròn màu trắng vào vị trí các nguồn sáng để trừ (đục thủng) lớp tối.
  4. **Áp lớp tối đã khoét lên màn hình game:**
     `ctx.drawImage(this.canvas, 0, 0);`
  5. **Cộng hưởng vầng sáng ấm (Additive Warm Tint):**
     Chuyển sang `ctx.globalCompositeOperation = "lighter";`
     Vẽ gradient màu cam ấm `"#ffb35a"` với độ mờ nhẹ `globalAlpha = 0.16` và bán kính `r * 0.5`.

*Trích đoạn code nguyên văn từ `js/31-light.js` (dòng 9–43):*
```javascript
  /** sprite gradient tròn (cache theo bán kính) */
  sprite(r) {
    r = Math.max(4, Math.round(r / 4) * 4);
    let c = this.grads.get(r); if (c) return c;
    c = document.createElement("canvas"); c.width = c.height = r * 2;
    const g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.45, "rgba(255,255,255,.75)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); this.grads.set(r, c); return c;
  },

  render(ctx, world, camX, camY, ambient) {
    const L = this.ctx, w = this.canvas.width, h = this.canvas.height, t = GAME.time;
    L.globalCompositeOperation = "source-over"; L.clearRect(0, 0, w, h);
    L.fillStyle = `rgba(6,3,14,${ambient})`; L.fillRect(0, 0, w, h);
    L.globalCompositeOperation = "destination-out";
    
    // Thu thập nguồn sáng: người chơi, đuốc, đạn phép, hiệu ứng
    const all = [];
    if (world.player) all.push({ x: world.player.x, y: world.player.y - 6, r: CONFIG.PLAYER_LIGHT * (world.player.lightMult || 1) });
    for (const l of world.lights) all.push(l);

    for (const l of all) {
      // Công thức nhấp nháy đuốc:
      const r = l.r * (l.flicker ? 0.92 + Math.sin(t * 9 + l.x) * 0.05 + Math.random() * 0.03 : 1);
      const sx = l.x - camX, sy = l.y - camY;
      if (sx < -r || sy < -r || sx > w + r || sy > h + r) continue;
      L.drawImage(this.sprite(r), Math.round(sx - r), Math.round(sy - r), r * 2, r * 2);
    }
    ctx.drawImage(this.canvas, 0, 0);

    // vầng sáng màu cộng thêm (đuốc ấm, đạn phép)
    if (FX.quality !== "low") {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const l of world.lights) {
        const s = this.sprite(l.r * 0.5);
        ctx.globalAlpha = 0.16;
        ctx.drawImage(tintGlow(s, l.color || "#ffb35a"), Math.round(l.x - camX - l.r * 0.5), Math.round(l.y - camY - l.r * 0.5));
      }
      ctx.restore();
    }
  }
```
- **Thông số bán kính đuốc:** `r = 75` pixel (người chơi: `110` pixel).
- **Công thức nhấp nháy (Flicker):**  
  `r * (0.92 + Math.sin(t * 9 + l.x) * 0.05 + Math.random() * 0.03)` -> Dao động sin tần số 9 rad/s kết hợp biến thiên ngẫu nhiên 3%.

---

### 10. Vignette ở rìa màn hình
- **Thông số:** **không có**.
- Game không áp dụng bất kỳ lớp vignette, shader hay gradient tối nhân tạo nào ở 4 góc màn hình. Hiệu ứng tối ở rìa hoàn toàn sinh ra tự nhiên từ việc người chơi di chuyển ra xa các nguồn sáng và bị lớp bóng tối `rgba(6,3,14, ambient)` bao trùm.

---

### 11. Sàn có vân và vết nứt (Procedural Flooring)
- **Cách sinh:** Sử dụng **hàm băm xác định 2 chiều (deterministic hash)** dựa trên tọa độ nguyên `(x, y)` của ô gạch:
  *Trích `js/32-render.js` dòng 5:*
  ```javascript
  const hash2 = (x, y) => {
    let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  ```
  Hàm trả về giá trị `r` thuộc `[0, 1)`. Giá trị này không bao giờ thay đổi giữa các frame, không cần mảng lưu trữ:
  - Chọn 1 trong 3 màu gạch ngẫu nhiên: `th.floor[Math.floor(r * th.floor.length)]`.
  - Vết nứt xuất hiện khi `r > 0.78` (xác suất 22%): Vẽ vệt gãy hình chữ L bằng màu `rgba(0,0,0,.22)`.
  - Đốm sáng cuội xuất hiện khi `r < 0.08` (xác suất 8%): Vẽ đốm 2×2px màu `rgba(255,255,255,.08)`.
- **Số biến thể:** 3 biến thể màu nền kết hợp vị trí nứt động tạo nên hàng chục dạng tile sàn tự nhiên.
- **Cache tối ưu:** Toàn bộ sàn và tường được nướng sẵn vào một Offscreen Canvas tĩnh (`Render.floorCache`) khi bắt đầu tầng, chỉ tốn 1 lệnh `drawImage` duy nhất trong vòng lặp game.

---

### 12. Xử lý Mặt sáng / Mặt tối của Tường và Mái
- **Khối tường (`#`):**
  - **Mặt đỉnh tường (`wallTop`):** Dày 2px hứng sáng trực diện từ trên xuống.
  - **Đường gờ phản quang:** 1 hàng pixel trắng mờ `rgba(255,255,255,.07)` ngay dưới đỉnh tường.
  - **Mặt trước tường (`wallFace`):** Tông màu sẫm hơn, kẻ mạch gạch `wallLine`.
  - **Chân tường:** Dải tối `rgba(0,0,0,.35)` dày 2px ở chân tường.
  - **Bóng đổ của tường xuống sàn:** Nếu ô trên là tường (`above === "#"`), vẽ bóng đổ dày 4px màu `rgba(0,0,0,.3)` trùm lên ô sàn bên dưới (*`js/32-render.js` dòng 94*).
- **Mái ngói thị trấn (`H`):**
  - Mép sườn bên trái có dải bóng tối `rgba(0,0,0,.3)` rộng 2px.
  - Mép sườn bên phải có dải sáng viền `rgba(255,255,255,.12)` rộng 2px.
  - Đỉnh nóc mái có viền đỏ gạch sáng `"#c86a4a"` dày 2px.

---

## PHẦN E. ANIMATION

### 13. Khung chuyển động, Tốc độ và Hiệu ứng Nhún
- **Animation Bước đi (Walk / Run):**
  - Số khung: **4 khung** tuần hoàn theo thứ tự chân: `["a", "stand", "b", "stand"]`.
  - Tốc độ chuyển khung: **12 FPS**.  
    *Trích `js/32-render.js` dòng 183:* `const fr = animFrame(base, p.animT, moving ? 12 : 6);`
- **Animation Đứng yên (Idle) & Hiệu ứng Nhún Thở (Breathing Squash):**
  - Số khung: **4 khung** theo chu kỳ: `["stand", "stand", "squash", "stand"]`.
  - Tốc độ chuyển khung: **6 FPS**.
  - **Hiệu ứng Nhún (`squash`):** Không dùng scale toán học làm mờ pixel, mà dùng thuật toán dời hàng pixel trong ma trận:
    *Trích `js/02c-pixel-sprites.js` dòng 357:*
    ```javascript
    if (variant === "squash") rows = [rows[0].replace(/./g, ".")].concat(rows.slice(0, 1), rows.slice(2)); // bẹp 1 hàng
    ```
    Thuật toán xóa bỏ hàng đỉnh và đè hàng 0 xuống hàng 1, nén thân hình thấp xuống đúng 1px ở nhịp thở thứ 3, tạo cảm giác nhân vật thở phập phồng cực kỳ sống động.
- **Ngọn lửa đuốc nhấp nháy:**
  - Vẽ 3 khối chữ nhật lồng nhau với chiều cao dao động:  
    `h = 3 + Math.sin(t * 14 + i * 2 + x) * 1.5` (tần số nhanh 14 rad/s).
  - Vòng lặp màu từ ngoài vào trong: `["#ff6a1a", "#ffb32a", "#fff2a0"]`.

---

## PHẦN F. CHỮ VÀ GIAO DIỆN (UI)

### 14. Font chữ & Hiển thị Tiếng Việt
- **Tên font:** `VT323` (font pixel monospaced phong cách retro).
- **Cách tải:** Tải trực tiếp qua Google Fonts CDN trong thẻ `<head>` của `index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
  ```
- **Lý do hiển thị trọn vẹn tiếng Việt có dấu:** Bản phân phối của Google Fonts cho `VT323` có sẵn đầy đủ bộ ký tự **Vietnamese Latin Subset** (đầy đủ các chữ cái tiếng Việt với các dấu huyền, sắc, hỏi, ngã, nặng, mũ, móc). Do đó font không bị vỡ hay rơi về font hệ thống sans-serif.
- **Cách vẽ chữ có viền đen sắc nét:**
  Không dùng `shadowBlur` (gây mờ). Vẽ 2 lượt: Lớp 1 vẽ viền bằng `strokeText()`, Lớp 2 đè ruột bằng `fillText()`:
  *Trích `js/40-ui-hud.js` dòng 22–26:*
  ```javascript
  text(txt, x, y, size, color = "#fff", align = "left") {
    const g = this.g; g.font = `${Math.round(size)}px VT323, monospace`; g.textAlign = align; g.textBaseline = "middle";
    g.lineWidth = Math.max(3, size / 6); g.strokeStyle = "#000"; g.lineJoin = "round"; g.strokeText(txt, x, y);
    g.fillStyle = color; g.fillText(txt, x, y);
  },
  ```

---

### 15. Panel Hologram Nhãn NPC trên đầu
- **Cách vẽ:** Vẽ trực tiếp bằng **Canvas 2D** trên `uiCanvas` (không dùng thẻ DOM HTML).
- **Kích thước:** Chiều rộng tự co giãn `tw = max(width(role), width(name)) + u`; Chiều cao `u * 1.75` (với `u` là hệ số kích thước theo màn hình, `u ≈ min(w, h) * 0.035`).
- **Màu sắc & Alpha:**
  - Nền: `rgba(20,80,110,.45)` (xanh biển pha lục trong suốt, alpha 0.45).
  - Viền mỏng 1px: `rgba(120,240,255,.8)`.
  - Mũi tên chỉ xuống đỉnh đầu NPC: Tam giác cân đáy 6px màu `rgba(120,240,255,.8)`.
  - Bo góc: **0px** (vuông vức hoàn toàn theo phong cách pixel).
- **Hiệu ứng động:**
  - Trôi nổi lơ lửng: `sy = sy0 + Math.sin(t * 2 + i) * u * 0.15`.
  - Nhấp nháy glitch: `a = 0.75 + 0.15 * Math.sin(t * 7 + i * 3) + (Math.random() < 0.02 ? -0.4 : 0)`.
  - 4 vạch quét radar chạy dọc (scanlines): 4 đường ngang cao 1px lướt từ trên xuống.

*Trích đoạn code nguyên văn từ `js/53-scene-town.js` dòng 206–223:*
```javascript
    // bảng hologram trên đầu NPC: tên + việc NPC làm (nhấp nháy nhẹ, trôi lên xuống)
    const t = GAME.time, holo = [...w.npcs.map(n => ({ x: n.x, y: n.y - 30, p: n.place })), ...w.props.filter(pr => pr.place).map(pr => ({ x: pr.x, y: pr.y - 18, p: pr.place }))];
    holo.forEach((h, i) => {
      const [sx, sy0] = toScreen(h.x, h.y), sy = sy0 + Math.sin(t * 2 + i) * u * 0.15;
      const a = 0.75 + 0.15 * Math.sin(t * 7 + i * 3) + (Math.random() < 0.02 ? -0.4 : 0);
      g.save(); g.globalAlpha = Math.max(0.2, a);
      g.font = `${Math.round(u * 0.8)}px VT323, monospace`;
      const tw = Math.max(g.measureText(h.p.role).width, g.measureText(h.p.who || h.p.name).width) + u;
      g.fillStyle = "rgba(20,80,110,.45)"; g.fillRect(sx - tw / 2, sy - u * 1.15, tw, u * 1.75);
      g.strokeStyle = "rgba(120,240,255,.8)"; g.lineWidth = 1; g.strokeRect(sx - tw / 2 + 0.5, sy - u * 1.15 + 0.5, tw, u * 1.75);
      g.fillStyle = "rgba(120,240,255,.12)"; for (let k = 0; k < 4; k++) g.fillRect(sx - tw / 2, sy - u * 1.15 + ((t * 20 + k * u * 0.45) % (u * 1.75)), tw, 1);  // vạch quét
      g.beginPath(); g.moveTo(sx - 3, sy + u * 0.6); g.lineTo(sx + 3, sy + u * 0.6); g.lineTo(sx, sy + u * 0.95); g.fillStyle = "rgba(120,240,255,.8)"; g.fill();
      g.restore();
      g.globalAlpha = Math.max(0.3, a);
      UI.text(h.p.who || h.p.name, sx, sy - u * 0.6, u * 0.85, "#aaf6ff", "center");
      UI.text(h.p.role, sx, sy + u * 0.15, u * 0.75, "#e6fdff", "center");
      g.globalAlpha = 1;
    });
```

---

### 16. Thanh máu, Icon Trái tim, Đồng xu
- **Thanh máu người chơi (HUD):**
  - Rộng `bw = min(260, w * 0.3)` px, cao `u * 0.9` px.
  - Viền đen ngoài dày 3px (`x - 3, y - 3, w + 6, h + 6`).
  - Nền đỏ tối `#3a0a14`. Màu máu đỏ tươi `#e8384f` (dưới 30% đổi sang đỏ cảnh báo `#ff3a4a`).
  - Dải phản quang bóng kính ở nửa trên: `rgba(255,255,255,.25)` cao `h * 0.3`.
  - *Trích `js/40-ui-hud.js` dòng 27–34:*
    ```javascript
    bar(x, y, w, h, k, fg, bg = "#2a0a14", k2 = 0, fg2 = "#9fd0ff") {
      const g = this.g;
      g.fillStyle = "#000"; g.fillRect(x - 3, y - 3, w + 6, h + 6);
      g.fillStyle = bg; g.fillRect(x, y, w, h);
      g.fillStyle = fg; g.fillRect(x, y, w * clamp(k, 0, 1), h);
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x, y, w * clamp(k, 0, 1), h * 0.3);
      if (k2 > 0) { g.fillStyle = fg2; g.fillRect(x, y + h * 0.65, w * clamp(k2, 0, 1), h * 0.35); }
    }
    ```
- **Thanh máu quái vật trên đầu:**
  - Rộng `14 * scale` px, cao 2px, nằm ở vị trí `y - 18 * scale - 3`.
  - Khung viền đen 1px, ruột máu đỏ `#ff4a5a` (quái tinh anh đổi sang vàng `#ffd23d`, miniboss đổi sang xanh lục lam `#7af0ff`).
- **Icon Trái tim & Đồng xu:**
  - **Không nạp file ảnh.** Vẽ bằng ký tự Unicode kết hợp trực tiếp với font pixel `VT323`:
    - Bình máu / Tim: `UI.text("♥ " + potions, x, y, size, "#ff7a9a")` (ký tự `♥`, màu hồng sen).
    - Đồng xu vàng: `UI.text("● " + gold, x, y, size, "#ffd23d")` (ký tự `●`, màu vàng kim).

---

## PHẦN G. TỔNG KẾT VÀ BỘ CODE MẪU CHO DỰ ÁN MỚI

### 17. Top 5 Kỹ thuật Đóng góp Nhiều Nhất vào Độ Đẹp

1. **Thuật toán sinh viền 1px tự động (`#160e22`) trên ma trận ký tự:**
   Mọi sprite nhân vật, chiêu thức, vũ khí luôn sắc nét tuyệt đối trên nền tối, không bao giờ bị chìm vào background hay nhòe cạnh.
2. **Hệ thống ánh sáng 2 lớp (Mặt nạ bóng tối `destination-out` + Vầng ấm `lighter`):**
   Biến một bức vẽ phẳng 2D thành một không gian có chiều sâu huyền bí, ánh lửa đuốc nhấp nháy tạo sự sống động cho toàn bộ màn chơi.
3. **Phối cảnh chiều sâu 2.5D (Bóng đổ elip `rgba(0,0,0,.35)` + Bóng tường đổ xuống sàn 4px):**
   Tạo cảm giác chân thực về độ cao của nhân vật và tách bạch rõ ràng giữa sàn nhà nằm ngang với các vách đá dựng đứng.
4. **Hoa văn sàn tự sinh bằng Hash xác định `hash2(x, y)` & Offscreen Canvas Cache:**
   Sàn đá có vết nứt và đốm sáng biến thiên tự nhiên mà không tốn dung lượng RAM, render 1 lần duy nhất đảm bảo game chạy 60 FPS mượt mà.
5. **Hiển thị pixel chuẩn xác (Integer Scaling + `imageSmoothingEnabled = false` + Font `VT323` có viền `strokeText`):**
   Triệt tiêu hoàn toàn hiện tượng răng cưa méo mó, giữ đúng tinh thần game retro sắc cạnh cao cấp.

---

### 18. Đoạn Code Tối Thiểu Chạy Độc Lập (< 150 Dòng)
Đoạn mã sau được viết bằng **JavaScript thuần (Vanilla JS), Canvas 2D, không fetch, không module, không nạp ảnh ngoài**.  
Bao gồm đầy đủ 3 thành phần cốt lõi:
1. **Dựng sprite từ mảng chuỗi + bảng màu + tự sinh viền 1px.**
2. **Vẽ bóng đổ elip dưới chân.**
3. **Quầng sáng đuốc khoét bóng tối bằng `destination-out` và vầng ấm `lighter`.**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pixel Art Core Demo</title>
  <style>
    body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { image-rendering: pixelated; image-rendering: crisp-edges; width: 960px; height: 540px; }
  </style>
</head>
<body>
<canvas id="c" width="480" height="270"></canvas>
<script>
const cvs = document.getElementById("c"), ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;

// 1. HÀM DỰNG SPRITE TỪ CHUỖI KÝ TỰ + BẢNG MÀU + VIỀN 1PX TỰ ĐỘNG
function buildSprite(rows, pal, outline = "#160e22") {
  const w = Math.max(...rows.map(r => r.length)) + 2, h = rows.length + 2;
  const grid = [];
  for (let y = 0; y < h; y++) {
    grid.push([]);
    for (let x = 0; x < w; x++) {
      const ch = (rows[y - 1] || "")[x - 1];
      grid[y].push(ch && ch !== "." ? pal[ch] || "#ff00ff" : null);
    }
  }
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w; outCanvas.height = h;
  const g = outCanvas.getContext("2d");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x]) { g.fillStyle = grid[y][x]; g.fillRect(x, y, 1, 1); }
      else if ((grid[y - 1] && grid[y - 1][x]) || (grid[y + 1] && grid[y + 1][x]) || grid[y][x - 1] || grid[y][x + 1]) {
        g.fillStyle = outline; g.fillRect(x, y, 1, 1); // Viền 1px quanh pixel có màu
      }
    }
  }
  return outCanvas;
}

// Định nghĩa nhân vật Luffy (One Piece chibi): mũ rơm sọc đỏ, tóc đen, áo đỏ
const LUFFY_PAL = { y: "#ffd23d", r: "#e63946", b: "#111111", s: "#f6c69c", d: "#d9946c", w: "#ffffff", B: "#1d3557" };
const LUFFY_FRAMES = [
  // Khung đứng (Stand)
  ["...yyyyyy...", "..yyyyyyyy..", ".yyyrrrryyy.", "....bbbb....", "...bssssb...", "...bswwsb...", "...bssdsb...", "...bbssbb...", "..rrrrrrrr..", ".srrrrrrrrs.", ".ssrrrrrrss.", "...B....B...", "...B....B..."],
  // Khung bước (Step)
  ["...yyyyyy...", "..yyyyyyyy..", ".yyyrrrryyy.", "....bbbb....", "...bssssb...", "...bswwsb...", "...bssdsb...", "...bbssbb...", "..rrrrrrrr..", ".srrrrrrrrs.", ".ssrrrrrrss.", "..B......B..", ".B........B."]
].map(rows => buildSprite(rows, LUFFY_PAL));

// 2. VẼ BÓNG ĐỔ DƯỚI CHÂN
function drawShadow(g, x, y, r) {
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.beginPath();
  g.ellipse(Math.round(x), Math.round(y), r, r * 0.45, 0, 0, Math.PI * 2);
  g.fill();
}

// 3. HỆ THỐNG ÁNH SÁNG & QUẦNG SÁNG ĐUỐC
const lightCanvas = document.createElement("canvas");
lightCanvas.width = 480; lightCanvas.height = 270;
const lctx = lightCanvas.getContext("2d");

function getRadialGradient(r) {
  const c = document.createElement("canvas"); c.width = c.height = r * 2;
  const g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.45, "rgba(255,255,255,0.75)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
  return c;
}
const lightGrad = getRadialGradient(85);

function renderLighting(g, lights, ambient = 0.88) {
  lctx.globalCompositeOperation = "source-over";
  lctx.clearRect(0, 0, 480, 270);
  lctx.fillStyle = `rgba(6,3,14,${ambient})`; // Phủ tối toàn màn hình
  lctx.fillRect(0, 0, 480, 270);
  
  lctx.globalCompositeOperation = "destination-out"; // Khoét thủng lớp tối
  for (const l of lights) {
    const r = l.r * (0.92 + Math.sin(Date.now() * 0.009 + l.x) * 0.05 + Math.random() * 0.03); // Flicker
    lctx.drawImage(lightGrad, Math.round(l.x - r), Math.round(l.y - r), r * 2, r * 2);
  }
  g.drawImage(lightCanvas, 0, 0);

  // Vầng sáng ấm cộng hưởng
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.18;
  for (const l of lights) {
    g.drawImage(lightGrad, Math.round(l.x - l.r * 0.6), Math.round(l.y - l.r * 0.6), l.r * 1.2, l.r * 1.2);
  }
  g.restore();
}

// 4. VÒNG LẶP CHÍNH (GAME LOOP)
let playerX = 240, playerY = 150;
function loop(now) {
  // Sàn đá & Tường
  ctx.fillStyle = "#272034"; ctx.fillRect(0, 0, 480, 270);
  ctx.fillStyle = "#362b4c"; ctx.fillRect(0, 0, 480, 60); // Vách tường
  ctx.fillStyle = "#4a3d63"; ctx.fillRect(0, 0, 480, 4);  // Gờ tường sáng
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 60, 480, 6); // Bóng tường đổ xuống sàn

  // Đuốc gắn tường (vẽ chân đuốc + lửa 3 lớp)
  const torchX = 120, torchY = 50, t = now * 0.01;
  ctx.fillStyle = "#000"; ctx.fillRect(torchX - 2, torchY, 4, 8);
  ctx.fillStyle = "#6a4a2a"; ctx.fillRect(torchX - 1, torchY + 1, 2, 6);
  ["#ff6a1a", "#ffb32a", "#fff2a0"].forEach((col, i) => {
    const h = 3 + Math.sin(t * 1.4 + i * 2) * 1.5;
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(torchX - 2 + i * 0.5), Math.round(torchY - h + i), 4 - i, Math.round(h + 2 - i));
  });

  // Vẽ bóng & nhân vật (đổi khung bước đi 10 FPS)
  const frameIdx = Math.floor(now * 0.01) % 2;
  const spr = LUFFY_FRAMES[frameIdx];
  drawShadow(ctx, playerX, playerY + 2, 8);
  ctx.drawImage(spr, Math.round(playerX - spr.width / 2), Math.round(playerY - spr.height + 2));

  // Phủ ánh sáng bóng tối & quầng sáng
  renderLighting(ctx, [{ x: torchX, y: torchY, r: 85 }, { x: playerX, y: playerY - 8, r: 60 }]);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
</body>
</html>
```
