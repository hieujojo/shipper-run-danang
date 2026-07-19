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
| Cầu Rồng | 🐉 Sự kiện | Rồng phun lửa/nước, ảnh hưởng tầm nhìn |

## 🕹️ Điều khiển

| Phím | Hành động |
|---|---|
| `↑` `↓` | Đổi làn (Né xe) |
| `←` `→` | Phanh lại / Tăng tốc tiến lên |
| `Space` | Kỹ năng đặc biệt (nếu có) |

## 🛠️ Tech Stack

- **Rendering:** PixiJS v8 (WebGL/Canvas cho Gameplay)
- **UI Layer:** React (Menu, HUD, Game Over Screen)
- **Build Tool:** Vite 5.x + TypeScript
- **Audio:** Howler.js
- **Deploy:** Vercel
- **Graphics:** PIXI.Sprite (Pixel Art assets) kết hợp PIXI.Graphics

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
