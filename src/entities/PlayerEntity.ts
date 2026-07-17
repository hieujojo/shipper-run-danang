import { Container, Graphics } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "../core/constants";
import { MovementComponent } from "../components/MovementComponent";
import { CollisionComponent } from "../components/CollisionComponent";
import { InputComponent } from "../components/InputComponent";

export interface IPlayerEntity {
  container: Container;
  init(x: number, y: number): void;
  update(deltaTime: number): void;
  destroy(): void;
}

export class PlayerEntity implements IPlayerEntity {
  container: Container;
  private graphics: Graphics;
  private _movement: MovementComponent;
  private collision: CollisionComponent;
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

  update(deltaTime: number): void {
    const inputState = this.input.getState();
    const speed = 5;

    if (inputState.left) this.container.x -= speed * deltaTime;
    if (inputState.right) this.container.x += speed * deltaTime;
    if (inputState.up) this.container.y -= speed * deltaTime;
    if (inputState.down) this.container.y += speed * deltaTime;

    // Sync collision bounds
    this.collision.bounds.x = this.container.x - PLAYER_WIDTH / 2;
    this.collision.bounds.y = this.container.y - PLAYER_HEIGHT / 2;
  }

  destroy(): void {
    this.input.destroy();
    this.container.removeChildren();
  }
}