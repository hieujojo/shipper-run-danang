import { Container, Sprite, Texture } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_X_MIN, PLAYER_X_MAX } from "../core/constants";
import { MovementComponent } from "../components/MovementComponent";
import { CollisionComponent } from "../components/CollisionComponent";
import { InputComponent } from "../components/InputComponent";

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
  private boostTimer: number = 0;
  private readonly BOOST_DURATION = 120;
  private readonly BOOST_SPEED = 12;
  private readonly NORMAL_SPEED = 5;
  private readonly BRAKE_SPEED = 2;

  constructor() {
    this.container = new Container();
    this.sprite = new Sprite(Texture.from("/assets/player_shipper.png"));
    this.sprite.anchor.set(0.5);

    this.sprite.width = PLAYER_WIDTH * 1.5;
    this.sprite.height = PLAYER_HEIGHT * 1.5;

    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.input = new InputComponent();
    this.container.addChild(this.sprite);
  }

  init(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
    this.draw();
    this.collision.updateBounds(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  private draw(): void {
    // Không cần dùng graphics để vẽ nữa
  }

  update(deltaTime: number, boundTop: number, boundBottom: number): void {
    let dy = 0;
    let dx = 0;

    const state = this.input.getState();

    if (state.up) dy -= 1;
    if (state.down) dy += 1;
    if (state.left) dx -= 1;
    if (state.right) dx += 1;

    if (dy !== 0) {
      this.container.y += dy * 5 * deltaTime;
      if (this.container.y < boundTop + PLAYER_HEIGHT / 2) {
        this.container.y = boundTop + PLAYER_HEIGHT / 2;
      }
      if (this.container.y > boundBottom - PLAYER_HEIGHT / 2) {
        this.container.y = boundBottom - PLAYER_HEIGHT / 2;
      }
    }

    if (dx !== 0) {
      this.container.x += dx * 5 * deltaTime;
      // Trước đây dùng magic number 100/500 — vi phạm RULES.md (Hằng số phải
      // tập trung ở src/core/constants.ts). Nay dùng PLAYER_X_MIN/PLAYER_X_MAX.
      if (this.container.x < PLAYER_X_MIN) this.container.x = PLAYER_X_MIN;
      if (this.container.x > PLAYER_X_MAX) this.container.x = PLAYER_X_MAX;
    }

    if (dy !== 0) {
      this.sprite.rotation = dy * 0.15;
    } else {
      this.sprite.rotation = Math.sin(Date.now() / 100) * 0.05;
    }

    this.collision.updateBounds(this.container.x, this.container.y, PLAYER_WIDTH, PLAYER_HEIGHT);
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