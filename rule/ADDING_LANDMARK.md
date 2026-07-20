# 🗺️ Hướng dẫn thêm địa danh mới

## Tổng quan hệ thống

Game dùng hệ thống `LandmarkEventScene` generic — mỗi địa danh chỉ cần khai báo trong `levelData.json` và cung cấp asset PNG. Engine tự xử lý render, scroll, effects.

```
levelData.json
    └── levels[]
            ├── key, name, difficulty...     ← config gameplay
            └── landmarkEvent{}              ← config visual event
                    ├── assetTop             ← PNG dải trên
                    ├── assetBottom          ← PNG dải dưới (null = flip assetTop)
                    ├── breathType           ← "fire" | "water" | null
                    ├── scaleMultiplier      ← scale ảnh (1.0 = mặc định)
                    └── yOffsetRatio         ← căn vị trí dọc (0.25 = mặc định)
```

---

## Bước 1 — Chuẩn bị PNG asset

### Yêu cầu ảnh
- **Định dạng:** PNG với nền trong suốt (transparent background)
- **Tỉ lệ khuyến nghị:** 16:9 hoặc ngang hơn (panoramic)
- **Kích thước tối thiểu:** 1280px chiều rộng
- **Nội dung:** Chỉ công trình, không có trời/nước/người

### Prompt AI tạo ảnh (template)
```
[Tên công trình] in Da Nang Vietnam,
ultra-wide panoramic side view,
full structure visible from left to right edge,
[mô tả màu sắc đặc trưng] illuminated,
night scene, transparent background PNG,
no sky, no water, no reflections, no people,
structure fills entire horizontal frame,
clean cutout isolated only
```

### Xóa nền
1. Upload lên **remove.bg**
2. Click "Chỉnh sửa trong Canva"
3. Download PNG full size từ Canva (miễn phí)

### Đặt file
```
public/assets/<key>_landmark.png
```
Ví dụ: `public/assets/cau-song-han_landmark.png`

---

## Bước 2 — Thêm vào `levelData.json`

Mở `src/data/levelData.json`, thêm object mới vào mảng `levels[]`:

```json
{
  "id": 4,
  "key": "cau-song-han",
  "name": "Cầu Sông Hàn",
  "isDragonEvent": true,
  "assetPath": "/assets/cau-song-han_landmark.png",
  "difficulty": "medium",
  "laneCount": 3,
  "baseSpeed": 4,
  "trafficDensity": 0.5,
  "rushHourMultiplier": 2.0,
  "initialMultiplier": 0.7,
  "speedIncreaseRate": 0.022,
  "maxSpeedMultiplier": 3.0,
  "landmarkEvent": {
    "scaleMultiplier": 1.3,
    "yOffsetRatio": 0.25,
    "breathEffect": "fire"
  }
}
```

### Giải thích các field

| Field | Mô tả | Giá trị mặc định |
|---|---|---|
| `isDragonEvent` | Có hiển thị landmark sprite không | `false` |
| `assetPath` | Đường dẫn PNG | `""` |
| `landmarkEvent.scaleMultiplier` | Nhân thêm vào scale (1.0 = vừa canvas) | `1.3` |
| `landmarkEvent.yOffsetRatio` | Đẩy ảnh lên bao nhiêu % scaledH | `0.25` |
| `landmarkEvent.breathEffect` | Loại hiệu ứng: `"fire"`, `"water"`, `null` | `null` |

---

## Bước 3 — Preload asset

Mở `src/main.tsx`, tìm `Assets.load([...])`, thêm path mới:

```typescript
await Assets.load([
  "/assets/player_shipper.png",
  "/assets/vehicle_car.png",
  "/assets/package_box.png",
  "/assets/dragon_bridge.png",
  "/assets/cau-song-han_landmark.png",  // ← thêm dòng này
]);
```

---

## Bước 4 — Xong!

Không cần sửa thêm file nào. Engine sẽ tự:
- Load PNG từ `assetPath`
- Render dải trên + dải dưới (flip Y)
- Apply `ColorMatrixFilter` theo `breathEffect`
- Scroll parallax cùng tốc độ đường

---

## Ví dụ các địa danh có thể thêm

| Địa danh | Key | breathEffect | Ghi chú |
|---|---|---|---|
| Cầu Sông Hàn | `cau-song-han` | `"water"` | Cầu quay, đèn LED xanh |
| Bà Nà Hills | `ba-na-hills` | `"fire"` | Cầu Vàng, mây mù |
| Chợ Hàn | `cho-han` | `null` | Không có breath effect |
| Ngũ Hành Sơn | `ngu-hanh-son` | `"water"` | Núi đá huyền bí |
| Sân bay Đà Nẵng | `san-bay` | `null` | Máy bay bay qua |

---

## Troubleshooting

| Vấn đề | Nguyên nhân | Fix |
|---|---|---|
| Ảnh không hiện | Chưa preload | Thêm vào `Assets.load()` trong `main.tsx` |
| Ảnh quá nhỏ | `scaleMultiplier` thấp | Tăng lên `1.5` hoặc `2.0` |
| Ảnh che đường | `yOffsetRatio` thấp | Tăng lên `0.35` hoặc `0.4` |
| Ảnh bay lên trên | `yOffsetRatio` cao | Giảm xuống `0.1` hoặc `0.15` |
| Nền ảnh đen | Chưa xóa nền | Dùng remove.bg + Canva |