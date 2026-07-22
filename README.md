# 🛵 Shipper Run Đà Nẵng

> Hyper-casual endless runner — giao hàng qua các địa danh biểu tượng của Đà Nẵng.

![PixiJS](https://img.shields.io/badge/PixiJS-v8-e72264?style=flat-square)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

---

## 🎮 Giới thiệu

**Shipper Run Đà Nẵng** là game đua xe giao hàng thể loại Endless Runner cuộn ngang (Side-scroller) mang phong cách **Pixel Art**, chạy trên trình duyệt web. Game kết hợp sức mạnh render của **PixiJS v8** cho gameplay và **React** cho lớp giao diện người dùng.

Người chơi vào vai một shipper luồn lách qua giao thông hỗn loạn trên các cầu biểu tượng của Đà Nẵng — từ Cầu Sông Hàn lung linh đến Cầu Rồng huyền thoại.

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Rendering | PixiJS v8 (WebGL/Canvas) |
| Visual Effects | PixiJS v8 Built-in Filters |
| UI Layer | React 18 + react-icons v5 |
| Build Tool | Vite 5.x + TypeScript |
| Audio | Howler.js |
| Deploy | Vercel |

---

## 🚀 Chạy local

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

---

## 🕹️ Điều khiển

| Phím | Hành động |
|---|---|
| `←` | Di chuyển sang trái |
| `→` | Di chuyển sang phải |
| `↑` | Di chuyển lên trên |
| `↓` | Di chuyển xuống dưới |
| `Space` | Boost tăng tốc — giữ để duy trì |

---

## 🗺️ Địa danh trong game

| Địa danh 
|---|---|
| Cầu Rồng 
| Cầu Sông Hàn 
| Cầu Trần Thị Lý 

---

## 🚗 Loại xe trong game

| Loại xe | Tốc độ | Tỷ lệ xuất hiện |
|---|---|---|
| 🚗 Xe con (Car) | 1.0x | ~60% |
| 🏍️ Xe máy (Motorbike) | 1.0x | ~30% — đi ngược chiều |
| 🚌 Xe buýt (Bus) | 1.0x | ~8% — chiếm cả làn |

Xe xuất hiện theo **wave-based spawning** (1–4 xe/wave), tạo khoảng thở cho người chơi. Tỷ lệ và tốc độ cấu hình trong `levelData.json`.

---

## ✨ Visual Effects

| Effect | Trigger | Mô tả |
|---|---|---|
| Invincible Blink | Va chạm xe | Player blink 120 frames, miễn nhiễm va chạm |
| Speed Trail | `speedMultiplier > 1.1` | Khói xám phía sau xe khi boost |
| Motion Blur | `speedMultiplier > 1.2` | Blur ngang nhẹ trên tất cả xe khi tốc độ cao |
| Fire Tint | Cầu Rồng phun lửa | ColorMatrixFilter đỏ cam toàn cảnh + spawn xe x2 |
| Water Tint | Cầu Rồng phun nước | ColorMatrixFilter xanh lạnh toàn cảnh + package x3 |

---

## ⚡ Cơ chế tốc độ tăng dần

| Thời gian | Multiplier | Cảm giác |
|---|---|---|
| 0s | 0.3x | Chậm, học cách chơi |
| 20s | ~0.7x | Đang vào nhịp |
| 60s | ~1.5x | Tốc độ chuẩn |
| ~110s | 2.5x (MAX) | Tốc độ tối đa, giữ nguyên |

Tốc độ khởi đầu, tốc độ tăng và ngưỡng tối đa đều cấu hình trong `levelData.json`.

---

## 🗺️ Thêm địa danh mới

Chỉ cần thêm vào `src/data/levelData.json` — không cần sửa engine:

```json
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
    "yOffsetRatio": -0.1,
    "seamlessTile": "mirror",
    "breathEffect": null
  }
}
```

Sau đó thêm asset vào `public/assets/` và khai báo trong `Assets.load()` ở `src/main.tsx`.

> `laneCount` luôn cố định **3**.

---

## 📁 Cấu trúc thư mục

```
shipper-run-danang/
├── public/
│   └── assets/              # Sprite PNG, background, landmark images
├── src/
│   ├── components/          # InputComponent và các logic component
│   ├── core/                # GameLoop, GameState, Constants
│   ├── data/                # levelData.json
│   ├── entities/            # PlayerEntity, VehicleEntity, PackageEntity, DeliveryPointEntity
│   ├── scenes/              # GameplayScene, LandmarkEventScene, GameOverScene
│   ├── ui/                  # StartScreen, HudOverlay, LandmarkBanner, GameOverScreen
│   └── utils/               # Object pooling, particleSystem, effectsManager
├── RULES.md
└── index.html
```

---

## 📊 Debug & Hiệu suất

### Stats.js — FPS Overlay

Thêm `?debug=1` vào URL để bật bảng thống kê FPS/MS/MB:

```
http://localhost:5173/?debug=1
```

Click vào bảng để chuyển giữa các tab: **FPS**, **MS**, **MB**.

**Benchmark tham khảo:**

| Chỉ số | Mức lý tưởng |
|---|---|
| FPS | 60 – 100+ |
| MS | < 16ms |
| MB | < 100MB |

### PixiJS DevTools — Scene Inspector

1. Cài extension **PixiJS DevTools** cho [Chrome](https://chrome.google.com/webstore/detail/pixijs-devtools/dlkffcaaoccbofklocbjcmppahjjboce)
2. Chạy `npm run dev`, mở game trên Chrome
3. Bấm `F12` → chọn tab **PixiJS**

Game tự động kết nối với extension thông qua `__PIXI_APP__` ở môi trường DEV.

**Benchmark tham khảo:**

| Chỉ số | Mức lý tưởng |
|---|---|
| Scene Nodes | < 200 nodes |
| GPU Memory | < 50MB |
| Draw Calls | < 50 (hiện tại ~3) |

---

## 📜 Nguyên tắc phát triển

Mọi đóng góp **bắt buộc** tuân thủ quy ước trong `RULES.md`.