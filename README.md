# 🛵 Shipper Run Đà Nẵng

> Hyper-casual endless runner — giao hàng qua các địa danh biểu tượng của Đà Nẵng.

![PixiJS](https://img.shields.io/badge/PixiJS-v8-e72264?style=flat-square)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

## 🎮 Giới thiệu

**Shipper Run Đà Nẵng** là game đua xe giao hàng thể loại Endless Runner cuộn ngang (Side-scroller) mang phong cách **Pixel Art**, chạy trên trình duyệt web. Game kết hợp sức mạnh render mượt mà của **PixiJS v8** cho phần gameplay và **React** cho lớp giao diện người dùng (UI Layer).

Người chơi vào vai một shipper luồn lách qua giao thông hỗn loạn trên các tuyến đường biểu tượng của Đà Nẵng — từ Đại lộ Phạm Văn Đồng đến Cầu Rồng huyền thoại. Mọi asset hình ảnh đều được tối ưu cho cảm giác retro hoài cổ.

## 🗺️ Địa danh trong game

| Địa danh | Độ khó | Đặc điểm |
|---|---|---|
| Đại lộ Phạm Văn Đồng | ⭐ Thấp | Đường rộng, nhập môn |
| Ngã tư Ngô Quyền | ⭐⭐⭐ Cao | Đường hẹp, giao thông hỗn loạn |
| Cầu Rồng | 🐉 Sự kiện | PNG sprite Cầu Rồng thực tế, rồng phun lửa/nước — lửa tăng xe, nước tăng package |

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
 
## ✨ Visual Effects (PixiJS Filters)

| Effect | Trigger | Mô tả |
|---|---|---|
| Invincible Blink | Va chạm xe | Player blink sáng/tối 120 frames, miễn nhiễm va chạm |
| Speed Trail | `speedMultiplier > 1.2` | Khói xám phía sau shipper, càng nhanh càng dày |
| Fire Tint | Cầu Rồng phun lửa | `ColorMatrixFilter` đỏ cam toàn cảnh + spawn xe x2 |
| Water Tint | Cầu Rồng phun nước | `ColorMatrixFilter` xanh lạnh toàn cảnh + package xuất hiện nhanh x3 |

## 🗺️ Thêm địa danh mới

Chỉ cần thêm vào `src/data/levelData.json` — không cần sửa engine:

\`\`\`json
{
  "id": 4,
  "key": "cau-song-han",
  "name": "Cầu Sông Hàn",
  "isDragonEvent": false,
  "difficulty": "medium",
  "laneCount": 3,
  "baseSpeed": 4,
  "trafficDensity": 0.5,
  "initialMultiplier": 0.8,
  "speedIncreaseRate": 0.022,
  "maxSpeedMultiplier": 3.0
}
\`\`\`

Để thêm **landmark có visual event** (như Cầu Rồng):
1. Tạo PNG asset nền trong suốt → đặt vào `public/assets/`
2. Thêm vào `Assets.load()` trong `src/main.tsx`
3. Khai báo `isDragonEvent: true` và asset path trong `levelData.json`