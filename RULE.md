# 🤖 AI Coding Rules — Shipper Run Đà Nẵng

---

## 🎯 1. Project Architecture & Conventions

1. **Tech Stack cố định** — KHÔNG được thay đổi:
   - **Rendering:** PixiJS v8 (KHÔNG dùng v7, API khác hoàn toàn)
   - **Build Tool:** Vite 5.x (KHÔNG dùng Webpack, CRA, Next.js)
   - **Ngôn ngữ:** TypeScript (KHÔNG dùng JavaScript thuần)
   - **Audio:** Howler.js (KHÔNG dùng Web Audio API trực tiếp)
   - **UI Framework:** React (chỉ dùng cho UI layer: menu, HUD, GameOver screen)
   - **KHÔNG dùng:** Vue, Angular, hay UI framework nào khác ngoài React

2. **Cấu trúc thư mục bắt buộc** — KHÔNG tự ý tạo thư mục ngoài cấu trúc này:

```text
src/
├── core/         # Game loop, FSM (Finite State Machine)
├── scenes/       # StartScene, GameplayScene, GameOverScene
├── entities/     # Player, Vehicle, Package, Coin
├── components/   # MovementComponent, CollisionComponent, InputComponent
├── data/         # levelData.json — cấu hình level
└── utils/        # ObjectPool, helpers
```

3. **Level Data:** Mọi config level (tốc độ, mật độ giao thông, địa danh) BẮT BUỘC đọc từ `levelData.json`. KHÔNG hardcode giá trị trong code.

4. **Update README:** Bất cứ tính năng mới nào được build xong, BẮT BUỘC cập nhật mô tả vào `README.md` ngay sau khi hoàn thành.

---

## 🎮 2. PixiJS v8 Rules (STRICT)

1. **Chỉ dùng PIXI.Graphics để vẽ** — KHÔNG dùng file ảnh sprite (.png, .jpg, .svg).
2. **Tách biệt layer rõ ràng:**
   - React layer: StartScreen, HUD (điểm, timer), GameOverScreen
   - PixiJS layer: Player, Traffic, Map, Collision, Game Loop
   - KHÔNG dùng React để render bất cứ thứ gì trong game canvas
3. **Game loop:** Luôn dùng `app.ticker.add()` cho game loop chính — KHÔNG dùng `requestAnimationFrame` trực tiếp.
4. **Object Pooling bắt buộc** cho: `Coin`, `Package`, `Vehicle` — KHÔNG `new`/`destroy` liên tục trong game loop.
5. **Collision Detection:** Dùng AABB (Axis-Aligned Bounding Box) — KHÔNG dùng thư viện physics nặng.
6. **Container hierarchy:** Mỗi scene là một `PIXI.Container` riêng, add/remove vào `app.stage` khi chuyển scene.

---

## 📝 3. Naming Convention (STRICT)

| Loại | Convention | Ví dụ |
|---|---|---|
| Class / Entity | `PascalCase.ts` | `PlayerEntity.ts` |
| Scene | `PascalCase.ts` | `GameplayScene.ts` |
| Component | `PascalCase.ts` | `MovementComponent.ts` |
| React Component | `PascalCase.tsx` | `HudOverlay.tsx` |
| Util / Helper | `camelCase.ts` | `objectPool.ts` |
| Constants file | `constants.ts` | `src/core/constants.ts` |
| Data file | `camelCase.json` | `levelData.json` |
| Thư mục | `camelCase` | `src/core/`, `src/scenes/` |
| Interface | `IPascalCase` | `IPlayerEntity` |
| Enum | `PascalCase` | `GameState` |
| Hằng số | `UPPER_SNAKE_CASE` | `MAX_SPEED`, `LANE_COUNT` |
| Biến / Hàm | `camelCase` | `rushHourTimer`, `spawnVehicle()` |

---

## ⚙️ 4. TypeScript Rules

1. **Không dùng `any`** — Mọi type BẮT BUỘC phải khai báo rõ ràng.
2. **Interface cho Entity/Component:** Mọi entity và component BẮT BUỘC có interface riêng.
3. **Enum cho State:** State machine dùng `enum` — KHÔNG dùng string literal tự do.

```typescript
// ✅ Đúng
enum GameState {
  START = "START",
  GAMEPLAY = "GAMEPLAY",
  GAME_OVER = "GAME_OVER"
}

// ❌ Sai
let state = "start";
```

4. **Hằng số:** Tập trung vào file `src/core/constants.ts` — KHÔNG khai báo magic number rải rác.

---

## 🏗️ 5. Architecture Rules

1. **Component Pattern bắt buộc:** Mỗi entity tách logic thành các component riêng:
   - `MovementComponent` — xử lý di chuyển
   - `CollisionComponent` — xử lý va chạm AABB
   - `InputComponent` — xử lý input bàn phím

2. **State Machine có đúng 3 state:** `START` → `GAMEPLAY` → `GAME_OVER`. KHÔNG thêm state nếu chưa được yêu cầu.

3. **Scene Management:** Mỗi scene (`StartScene`, `GameplayScene`, `GameOverScene`) là class riêng, có method `init()`, `update(delta)`, `destroy()`.

---

## ⚡ 6. Performance Rules

1. **KHÔNG tạo object mới trong game loop** — gây GC spike, drop FPS.
2. **KHÔNG dùng `console.log` trong production** — chỉ dùng khi debug, xóa trước khi commit.
3. **Target:** Giữ FPS ổn định 60fps trên Chrome, Firefox, Edge.
4. **Tỷ lệ khung hình:** Khóa 9:16, xử lý resize động.

---

## 🔄 7. Git Workflow

Ưu tiên **nhánh cố định** thay vì tạo nhánh mới cho từng thay đổi nhỏ:

| Nhánh | Mục đích |
|---|---|
| `feat/dev` | Tính năng mới |
| `fix/dev` | Bug fix |
| `refactor/dev` | Refactor code |
| `chore/dev` | Cập nhật package, cấu hình |
| `opt/dev` | Tối ưu hiệu năng |
| `test/dev` | Thêm/sửa test |

**Quy tắc:**
1. Chỉ tạo nhánh mới khi đó là module lớn, độc lập. Checkout từ `main`.
2. Tên nhánh dùng chữ thường, ngăn cách bằng dấu `-`.
3. KHÔNG gửi Pull Request trực tiếp vào `main`.
4. LUÔN gửi PR vào nhánh `release`.

---

## 🗺️ 8. Level Design Rules

1. Mỗi level map với 1 địa danh Đà Nẵng thực tế.
2. Độ khó tăng theo `rushHourTimer` — KHÔNG hardcode difficulty.
3. Địa danh hiện tại: `Phạm Văn Đồng`, `Ngã tư Ngô Quyền`, `Cầu Rồng`.
4. Thêm địa danh mới (Hội An, Huế...) chỉ cần thêm vào `levelData.json` — KHÔNG sửa engine.

---

## ✅ 9. Checklist trước khi commit

- [ ] Không có `console.log` thừa
- [ ] Không có `any` type
- [ ] Không tạo object mới trong game loop
- [ ] Level config nằm trong `levelData.json`, không hardcode
- [ ] README.md đã cập nhật nếu có tính năng mới
- [ ] Code chạy được trên Chrome, Firefox, Edge