import { Container, Graphics } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT, CANVAS_HEIGHT, CANVAS_WIDTH } from "../core/constants";
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
  private graphics: Graphics;
  private _movement: MovementComponent;
  collision: CollisionComponent;
  private input: InputComponent;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this._movement = new MovementComponent(0, 0);
    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.input = new InputComponent();
  }

  init(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;

    // Draw shipper (xe máy đơn giản)
    this.graphics.clear();
    // Thân xe
    this.graphics.rect(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.graphics.fill(0xe74c3c);
    // Bánh xe
    this.graphics.ellipse(-PLAYER_WIDTH / 2 + 5, PLAYER_HEIGHT / 2 - 5, 6, 8);
    this.graphics.fill(0x2c3e50);
    this.graphics.ellipse(PLAYER_WIDTH / 2 - 5, PLAYER_HEIGHT / 2 - 5, 6, 8);
    this.graphics.fill(0x2c3e50);

    this.container.addChild(this.graphics);
  }

  update(deltaTime: number, roadLeft: number, roadRight: number): void {
    const inputState = this.input.getState();
    const speed = 5;

    if (inputState.left) this.container.x -= speed * deltaTime;
    if (inputState.right) this.container.x += speed * deltaTime;
    if (inputState.up) this.container.y -= speed * deltaTime;
    if (inputState.down) this.container.y += speed * deltaTime;

    // Giới hạn trong làn đường
    const halfW = PLAYER_WIDTH / 2;
    if (this.container.x - halfW < roadLeft) this.container.x = roadLeft + halfW;
    if (this.container.x + halfW > roadRight) this.container.x = roadRight - halfW;

    // Giới hạn trên dưới màn hình
    const halfH = PLAYER_HEIGHT / 2;
    if (this.container.y - halfH < 0) this.container.y = halfH;
    if (this.container.y + halfH > CANVAS_HEIGHT) this.container.y = CANVAS_HEIGHT - halfH;

    // Sync collision bounds
    this.collision.bounds.x = this.container.x - halfW;
    this.collision.bounds.y = this.container.y - halfH;
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