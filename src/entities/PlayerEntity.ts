import { Container, Sprite, Texture } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "../core/constants";
import { CollisionComponent } from "../components/CollisionComponent";
import { InputComponent } from "../components/InputComponent";
import { EffectsManager } from "../utils/effectsManager";

export interface IPlayerEntity {
  container: Container;
  init(x: number, y: number): void;
  update(deltaTime: number, roadLeft: number, roadRight: number): void;
  destroy(): void;
}

export class PlayerEntity implements IPlayerEntity {
  container: Container;
  private sprite: Sprite;
  collision: CollisionComponent;
  private input: InputComponent;
  // Invincible frames sau va chạm
  private invincibleTimer: number = 0;
  private effectsManager: EffectsManager | null = null;
  private readonly INVINCIBLE_DURATION = 120; // 2 giây @ 60fps

  constructor() {
    this.container = new Container();
    this.sprite = new Sprite(Texture.from("/assets/player_shipper.png"));
    this.sprite.anchor.set(0.5); // Canh giữa hình ảnh
    
    // Scale ảnh sao cho phù hợp với kích thước bounding box
    // Giả sử ảnh khá to, ta cần scale nó vừa với PLAYER_WIDTH, PLAYER_HEIGHT
    // Hoặc giữ nguyên tỉ lệ tùy thuộc vào file ảnh
    // Mình sẽ ép kích thước cho an toàn:
    this.sprite.width = PLAYER_WIDTH * 1.5;
    this.sprite.height = PLAYER_HEIGHT * 1.5;

    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.input = new InputComponent();
    this.container.addChild(this.sprite);
  }

  init(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
    this.invincibleTimer = 0;
    this.container.alpha = 1;
    this.collision.updateBounds(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  update(deltaTime: number, boundTop: number, boundBottom: number): void {
    let dy = 0;
    let dx = 0;
    
    const state = this.input.getState();

    // Đổi làn: lên/xuống
    if (state.up) dy -= 1;
    if (state.down) dy += 1;
    // Tăng/giảm tốc độ trong giới hạn: trái/phải
    if (state.left) dx -= 1;
    if (state.right) dx += 1;

    // Di chuyển Y
    if (dy !== 0) {
      this.container.y += dy * 5 * deltaTime; // PLAYER_SPEED
      // Kẹp Y trong phạm vi đường
      if (this.container.y < boundTop + PLAYER_HEIGHT / 2) {
        this.container.y = boundTop + PLAYER_HEIGHT / 2;
      }
      if (this.container.y > boundBottom - PLAYER_HEIGHT / 2) {
        this.container.y = boundBottom - PLAYER_HEIGHT / 2;
      }
    }

    // Di chuyển X (giới hạn một khoảng nhỏ)
    if (dx !== 0) {
      this.container.x += dx * 5 * deltaTime;
      if (this.container.x < 100) this.container.x = 100;
      if (this.container.x > 500) this.container.x = 500;
    }

    // Animation: Nhún nhảy nhẹ hoặc nghiêng xe khi di chuyển
    if (dy !== 0) {
      this.sprite.rotation = dy * 0.15; // Nghiêng lên xuống khi chuyển làn
    } else {
      this.sprite.rotation = Math.sin(Date.now() / 100) * 0.05; // Rung nhẹ liên tục
    }

    // Invincible blink — nhấp nháy khi đang bất tử
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
      // Nhấp nháy: alpha dao động nhanh theo sin wave
      const blink = Math.sin(this.invincibleTimer * 0.5);
      this.container.alpha = blink > 0 ? 1.0 : 0.2;
      if (this.invincibleTimer <= 0) {
        this.invincibleTimer = 0;
        this.container.alpha = 1.0;
      }
    }

    this.collision.updateBounds(this.container.x, this.container.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

setEffectsManager(em: EffectsManager): void {
    this.effectsManager = em;
  }

  /** Bắt đầu invincible frames sau khi bị đâm */
  takeDamage(): void {
    this.invincibleTimer = this.INVINCIBLE_DURATION;
    this.container.alpha = 0.2;
  }

  isInvincible(): boolean {
    return this.invincibleTimer > 0;
  }

  resetPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  destroy(): void {
    this.input.destroy();
    this.container.removeChildren();
  }
}