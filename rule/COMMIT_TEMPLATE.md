# 📝 Commit Message Convention

## Format
<type>(<scope>): <subject>

## Allowed Types
| Type | Khi nào dùng |
|---|---|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor code, không thay đổi logic |
| `chore` | Cập nhật package, cấu hình, gitignore |
| `opt` | Tối ưu hiệu năng, FPS, memory |
| `test` | Thêm/sửa test |

## Allowed Scopes
| Scope | Mô tả |
|---|---|
| `core` | Game loop, FSM, constants |
| `scene` | StartScene, GameplayScene, GameOverScene |
| `player` | Player entity, movement |
| `traffic` | Vehicle AI, spawn logic |
| `collision` | AABB collision detection |
| `input` | Keyboard input handler |
| `ui` | React UI: HUD, menu, game over screen |
| `audio` | Howler.js, sound effects, music |
| `level` | levelData.json, level progression |
| `pool` | Object pooling |
| `render` | PIXI.Graphics, visual effects |
| `config` | Vite config, tsconfig, env |

## Examples
feat(player): thêm cơ chế nhảy vượt chướng ngại thấp
fix(collision): sửa AABB không detect đúng khi xe đổi làn
opt(pool): tối ưu object pool cho Vehicle giảm GC spike
refactor(scene): tách GameplayScene thành các method nhỏ hơn
chore(config): cập nhật vite.config.ts thêm path alias
feat(ui): thêm HUD hiển thị điểm và timer
test(collision): thêm test case cho AABB boundary edge cases

## Rules
1. Subject dùng tiếng Anh, nhất quán trong 1 PR
2. Subject KHÔNG viết hoa chữ đầu
3. Subject KHÔNG có dấu chấm cuối
