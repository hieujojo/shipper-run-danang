import { Container, Graphics } from "pixi.js";
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
  private graphics: Graphics;
  private movement: MovementComponent;
  collision: CollisionComponent;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.movement = new MovementComponent(0, 0);
    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT * 1.5);
  }

  init(x: number, y: number, speed: number): void {
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.movement.speedY = speed;

    // Draw vehicle (xe buýt/xe máy AI)
    this.graphics.clear();
    // Thân xe
    this.graphics.rect(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT * 1.5);
    this.graphics.fill(0x3498db);
    // Bánh xe
    this.graphics.ellipse(-PLAYER_WIDTH / 2 + 5, PLAYER_HEIGHT - 5, 6, 8);
    this.graphics.fill(0x2c3e50);
    this.graphics.ellipse(PLAYER_WIDTH / 2 - 5, PLAYER_HEIGHT - 5, 6, 8);
    this.graphics.fill(0x2c3e50);

    this.container.addChild(this.graphics);
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.container.y += this.movement.speedY * deltaTime;

    // Sync collision bounds
    this.collision.bounds.x = this.container.x - PLAYER_WIDTH / 2;
    this.collision.bounds.y = this.container.y - PLAYER_HEIGHT / 2;
  }

  reset(): void {
    this.active = false;
    this.container.x = -999;
    this.container.y = -999;
    this.movement.speedY = 0;
    this.graphics.clear();
  }
}