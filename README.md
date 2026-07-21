# 🛵 Shipper Run Đà Nẵng

> Hyper-casual endless runner — giao hàng qua các địa danh biểu tượng của Đà Nẵng.

![PixiJS](https://img.shields.io/badge/PixiJS-v8-e72264?style=flat-square)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

## 🎮 Giới thiệu

**Shipper Run Đà Nẵng** là game đua xe giao hàng thể loại Endless Runner cuộn ngang (Side-scroller) mang phong cách **Pixel Art**, chạy trên trình duyệt web. Game kết hợp sức mạnh render mượt mà của **PixiJS v8** cho phần gameplay và **React** cho lớp giao diện người dùng (UI Layer).

Người chơi vào vai một shipper luồn lách qua giao thông hỗn loạn trên các cầu biểu tượng của Đà Nẵng — từ Cầu Sông Hàn lung linh đến Cầu Rồng huyền thoại. Mọi asset hình ảnh đều được tối ưu cho cảm giác retro hoài cổ.

## 🗺️ Địa danh trong game

| Địa danh | Độ khó | Đặc điểm |
|---|---|---|
| Cầu Rồng | 🐉 Sự kiện | PNG sprite thực tế, rồng phun lửa/nước — lửa tăng xe, nước tăng package |
| Cầu Sông Hàn | ⭐⭐ Trung | PNG sprite cầu quay đèn LED xanh, UI landmark event |
| Cầu Trần Thị Lý | ⭐⭐⭐ Cao | PNG sprite tháp cao bất đối xứng, UI landmark event |

## 🕹️ Điều khiển

| Phím | Hành động |
|---|---|
| `←` | Di chuyển sang trái |
| `→` | Di chuyển sang phải |
| `↑` | Di chuyển lên trên |
| `↓` | Di chuyển xuống dưới |
| `Space` (nhấn) | Boost tăng tốc (~2 giây) |
| `Space` (giữ) | Brake giảm tốc |

## 🛠️ Tech Stack

- **Rendering:** PixiJS v8 (WebGL/Canvas cho Gameplay)
- **Visual Effects:** PixiJS v8 Built-in Filters (BlurFilter, ColorMatrixFilter, AlphaFilter)
- **UI Layer:** React (Menu, HUD, Game Over Screen)
- **Build Tool:** Vite 5.x + TypeScript
- **Audio:** Howler.js
- **Deploy:** Vercel
- **Graphics:** PIXI.Sprite (Pixel Art assets) + PIXI.Graphics + PixiJS Filters

## 🚀 Chạy local

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

## 📁 Cấu trúc thư mục

```text
shipper-run-danang/
├── src/
│   ├── components/       # Logic & UI Components
│   ├── core/             # Game loop, State machine, Constants
│   ├── data/             # levelData.json (Cấu hình màn chơi)
│   ├── entities/         # Player, Vehicle, Package, Coin
│   ├── scenes/           # StartScene, GameplayScene, GameOverScene
│   └── utils/            # Object pooling, helpers
├── public/
├── RULES.md              # AI coding rules
└── index.html
```

---

## 📜 Nguyên tắc phát triển (AI Coding Rules)

Mọi hoạt động phát triển, viết code và đóng góp cho dự án này **BẮT BUỘC** phải tuân thủ nghiêm ngặt các nguyên tắc được định nghĩa trong `RULES.md`. Vui lòng đọc kỹ tài liệu này trước khi tiến hành chỉnh sửa hoặc xây dựng tính năng mới.

---

## ⚡ Cơ chế tốc độ tăng dần (Speed Scaling)

Game áp dụng cơ chế tốc độ kiểu **Subway Surfers / Temple Run**:

| Thời gian | Multiplier (Level 1) | Cảm giác |
|---|---|---|
| 0s | 0.3x | Chậm, học cách chơi |
| 20s | ~0.7x | Đang vào nhịp |
| 60s | ~1.5x | Tốc độ chuẩn |
| ~110s | 2.5x (MAX) | Tốc độ tối đa, giữ nguyên |

- **Tốc độ khởi đầu, tốc độ tăng, ngưỡng tối đa** đều cấu hình trong `levelData.json` — không hardcode.
- `speedMultiplier` áp dụng đồng thời lên: scroll đường, tốc độ xe địch, tần suất spawn xe.
 
## 🚗 Loại xe trong game

Game có 3 loại xe với kích thước và tốc độ khác nhau:

| Loại xe | Kích thước | Tốc độ | Tỷ lệ xuất hiện | Đặc điểm |
|---|---|---|---|---|
| 🚗 Xe con (Car) | PLAYER_WIDTH×1.5×2.5 | 1.0x | 55-65% | Xe tiêu chuẩn, dễ lách |
| 🏍️ Xe máy (Motorbike) | PLAYER_WIDTH×1.5×2 | 1.0x | 25-30% | Lớn ngang 1.5x player, đi ngược chiều |
| 🚌 Xe buýt (Bus) | PLAYER_WIDTH×1.5×5 | 1.0x | 8% | Rất to, chiếm cả làn, spawn = 1 wave riêng |

- Tỷ lệ xuất hiện và tốc độ xe cấu hình trong `levelData.json` (traffic.vehicleWeights)
- Xe xuất hiện theo **wave-based spawning** (đợt sóng) thay vì spawn đơn lẻ
- Mỗi wave có 1-4 xe, khoảng cách giữa các wave tạo "khoảng thở" cho người chơi

## ✨ Visual Effects (PixiJS Filters)

| Effect | Trigger | Mô tả |
|---|---|---|
| Invincible Blink | Va chạm xe | Player blink sáng/tối 120 frames, miễn nhiễm va chạm |
| Speed Trail | `speedMultiplier > 1.2` | Khói xám phía sau shipper, càng nhanh càng dày |
| **Motion Blur** | **`speedMultiplier > 1.2`** | **Blur ngang nhẹ trên tất cả xe khi tốc độ cao** |
| Fire Tint | Cầu Rồng phun lửa | `ColorMatrixFilter` đỏ cam toàn cảnh + spawn xe x2 |
| Water Tint | Cầu Rồng phun nước | `ColorMatrixFilter` xanh lạnh toàn cảnh + package xuất hiện nhanh x3 |

## 🗺️ Thêm địa danh mới

Chỉ cần thêm vào `src/data/levelData.json` — không cần sửa engine:

\`\`\`json
{
  "id": 4,
  "key": "ten-dia-danh",
  "name": "Tên Địa Danh",
  "isLandmarkEvent": true,
  "assetPath": "/assets/ten-dia-danh_landmark.png",
  "difficulty": "medium",
  "laneCount": 3,
  "baseSpeed": 4,
  "trafficDensity": 0.5,
  "initialMultiplier": 0.7,
  "speedIncreaseRate": 0.022,
  "maxSpeedMultiplier": 3.0,
  "landmarkEvent": {
    "scaleMultiplier": 1.3,
    "yOffsetRatio": 0.25,
    "breathEffect": null
  }
}
\`\`\`

> **Lưu ý:** `laneCount` luôn cố định **3** — không thay đổi.

Để thêm **landmark có visual event** (như Cầu Rồng):
1. Tạo PNG asset nền trong suốt → đặt vào `public/assets/`
2. Thêm vào `Assets.load()` trong `src/main.tsx`
3. Khai báo `isLandmarkEvent: true` và asset path trong `levelData.json`

## 📊 Đo lường hiệu suất (Performance & Debug)

Dự án có tích hợp sẵn `stats.js` để đo lường FPS và Memory usage trực tiếp trên màn hình.
Để bật bảng thống kê này, bạn chỉ cần thêm tham số `?debug=1` vào cuối URL.

**Ví dụ:**
- Chạy local: `http://localhost:5173/?debug=1`
- Chạy production: `https://shipper-run-danang.vercel.app/?debug=1`

Bảng stats sẽ xuất hiện ở góc trên bên trái màn hình. Click chuột trái vào bảng để chuyển đổi giữa các tab: FPS, MS (thời gian render), và MB (bộ nhớ).

**Tiêu chuẩn Hiệu suất (Benchmark tham khảo):**
Đối với dự án indie hyper-casual này, các thông số lý tưởng khi test (ở giai đoạn ổn định) sẽ rơi vào khoảng:
- **FPS:** 60 - 100+ FPS (tuỳ thuộc vào tần số quét màn hình, mức độ này chứng tỏ game chạy cực kỳ mượt mà).
- **MS:** Dưới 16ms (Ví dụ: ~10ms là xuất sắc, dư sức gánh 60FPS).
- **MB:** Dưới 100MB (Ví dụ: 40MB - 50MB là rất nhẹ, không có dấu hiệu tràn bộ nhớ - memory leak).

### 🔍 Sử dụng PixiJS DevTools
Để kiểm tra chi tiết cấu trúc Scene Graph (đếm số lượng Sprites, kiểm tra toạ độ, thuộc tính hiển thị) trực tiếp trên giao diện:
1. Cài đặt Extension **PixiJS DevTools** cho [Chrome](https://chrome.google.com/webstore/detail/pixijs-devtools/aamddddknhcagpehecnhphigffpjnbgo) hoặc Edge.
2. Mở trình duyệt web ở môi trường Local (chạy lệnh `npm run dev`).
3. Nhấn `F12` (Mở Chrome DevTools) -> Chọn tab **PixiJS** ở góc trên cùng.
4. Tại đây bạn có thể soi từng `Container`, xem thuộc tính `visible`, `alpha`, tắt mở các Node để debug lỗi hiển thị hoặc dọn dẹp các Sprite bị kẹt.
*(Lưu ý: Game đã tự động kết nối với Extension thông qua biến toàn cục `__PIXI_APP__` trong môi trường dev).*

**Tiêu chuẩn WebGL (Tham khảo qua PixiJS DevTools):**
- **Scene Nodes:** Tổng số lượng vật thể (Total) nên giữ ở mức dưới 1000 để đảm bảo chạy mượt trên Mobile. (Mức lý tưởng: ~150 - 200 nodes).
- **GPU Memory:** Lượng VRAM để lưu trữ Texture (hình ảnh). Mức lý tưởng: Dưới 50MB (Game Pixel Art thường ngốn cực kì ít, ví dụ: ~17MB).
- **Draw Calls (Rất quan trọng):** Số lệnh vẽ gửi xuống GPU. Nhờ cơ chế Batching tự động của PixiJS, con số này nên giữ ở mức cực thấp. Mức lý tưởng: Dưới 50 Draw Calls (Thực tế game đang tối ưu cực tốt với chỉ ~3 Draw Calls).