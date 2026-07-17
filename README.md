# 🛵 Shipper Run Đà Nẵng

> Hyper-casual endless runner — giao hàng qua các địa danh biểu tượng của Đà Nẵng.

![PixiJS](https://img.shields.io/badge/PixiJS-v8-e72264?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

## 🎮 Giới thiệu

**Shipper Run Đà Nẵng** là game đua xe giao hàng thể loại Endless Runner chạy trên trình duyệt web (góc nhìn 2.5D Isometric), xây dựng bằng **PixiJS v8** và **Vite**.

Người chơi vào vai một shipper luồn lách qua giao thông hỗn loạn trên các tuyến đường biểu tượng của Đà Nẵng — từ Đại lộ Phạm Văn Đồng đến Cầu Rồng huyền thoại.

## 🗺️ Địa danh trong game

| Địa danh | Độ khó | Đặc điểm |
|---|---|---|
| Đại lộ Phạm Văn Đồng | ⭐ Thấp | Đường rộng, nhập môn |
| Ngã tư Mẹ Nhu | ⭐⭐⭐ Cao | Đường hẹp, giao thông hỗn loạn |
| Cầu Rồng | 🐉 Sự kiện | Rồng phun lửa/nước, ảnh hưởng tầm nhìn |

## 🕹️ Điều khiển

| Phím | Hành động |
|---|---|
| `←` `→` | Đổi làn / né xe |
| `↑` | Nhảy qua chướng ngại thấp |
| `↓` | Trượt qua chướng ngại cao |
| `Space` | Phanh gấp / Tăng tốc |

## 🛠️ Tech Stack

- **Rendering:** PixiJS v8 (WebGL/Canvas)
- **Build Tool:** Vite 5.x
- **Audio:** Howler.js
- **Deploy:** Vercel
- **Graphics:** PIXI.Graphics (vector, không dùng ảnh)

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
shipper-run-danang/
├── src/
│   ├── core/          # Game loop, State machine
│   ├── scenes/        # Start, Gameplay, GameOver
│   ├── entities/      # Player, Vehicle, Package
│   ├── components/    # Movement, Collision, Input
│   ├── data/          # levelData.json
│   └── utils/         # Object pooling, helpers
├── public/
├── RULES.md           # AI coding rules
└── index.html
