import { Container, Sprite, Texture } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "../core/constants";
import { MovementComponent } from "../components/MovementComponent";
import { CollisionComponent } from "../components/CollisionComponent";

export interface IVehicleEntity {
  container: Container;
  active: boolean;
  init(x: number, y: number, speed: number): void;
  update(deltaTime: number): void;
  reset(): void;
}

export class VehicleEntity implements IVehicleEntity {
  container: Container;
  active: boolean = false;
  private sprite: Sprite;
  private movement: MovementComponent;
  collision: CollisionComponent;
  speed: number = 0;

  constructor() {
    this.container = new Container();
    this.sprite = new Sprite(Texture.from("/assets/vehicle_car.png"));
    this.sprite.anchor.set(0.5);
    this.sprite.width = 75; // Kích thước xe cộ
    this.sprite.height = 45;

    this.movement = new MovementComponent(0, 0);
    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT * 1.5);
    this.container.addChild(this.sprite);
  }

  init(x: number, y: number, speed: number): void {
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.movement.speedY = speed;

    this.speed = speed;
    this.speed = speed;
    this.draw();
    this.collision.updateBounds(x, y, 60, 30);
  }

  private draw(): void {
    // Bỏ qua vì đã dùng Sprite
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.container.x += this.speed * deltaTime;
    
    // Animation: Xe cộ cũng nhún nhảy theo Y
    this.sprite.y = Math.sin(Date.now() / 150 + this.container.x) * 2;

    this.collision.updateBounds(this.container.x, this.container.y, 60, 30);
  }

  reset(x: number = 0, y: number = 0, speed: number = 0): void {
    this.active = false;
    this.container.x = x;
    this.container.y = y;
    this.speed = speed;
  }
}