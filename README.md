# 🛵 Shipper Run Đà Nẵng

> Hyper-casual endless runner — giao hàng qua các địa danh biểu tượng của Đà Nẵng.

![PixiJS](https://img.shields.io/badge/PixiJS-v8-e72264?style=flat-square)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

## 🎮 Giới thiệu

**Shipper Run Đà Nẵng** là game đua xe giao hàng thể loại Endless Runner chạy trên trình duyệt web (góc nhìn 2.5D Isometric). Game kết hợp sức mạnh render mượt mà của **PixiJS v8** cho phần gameplay và **React** cho lớp giao diện người dùng (UI Layer).

Người chơi vào vai một shipper luồn lách qua giao thông hỗn loạn trên các tuyến đường biểu tượng của Đà Nẵng — từ Đại lộ Phạm Văn Đồng đến Cầu Rồng huyền thoại.

## 🗺️ Địa danh trong game

| Địa danh | Độ khó | Đặc điểm |
|---|---|---|
| Đại lộ Phạm Văn Đồng | ⭐ Thấp | Đường rộng, nhập môn |
| Ngã tư Ngô Quyền | ⭐⭐⭐ Cao | Đường hẹp, giao thông hỗn loạn |
| Cầu Rồng | 🐉 Sự kiện | Rồng phun lửa/nước, ảnh hưởng tầm nhìn |

## 🕹️ Điều khiển

| Phím | Hành động |
|---|---|
| `←` `→` | Đổi làn / né xe |
| `↑` | Nhảy qua chướng ngại thấp |
| `↓` | Trượt qua chướng ngại cao |
| `Space` | Phanh gấp / Tăng tốc |

## 🛠️ Tech Stack

- **Rendering:** PixiJS v8 (WebGL/Canvas cho Gameplay)
- **UI Layer:** React (Menu, HUD, Game Over Screen)
- **Build Tool:** Vite 5.x + TypeScript
- **Audio:** Howler.js
- **Deploy:** Vercel
- **Graphics:** PIXI.Graphics (Vector hoàn toàn, không dùng asset ảnh)

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
│   │   ├── game/         # Movement, Collision, Input (PixiJS)
│   │   └── ui/           # HUD, MainMenu, GameOver (React)
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