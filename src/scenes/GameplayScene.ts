import { Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT, SPAWN_INTERVAL } from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";
import { VehicleEntity } from "../entities/VehicleEntity";
import { ObjectPool } from "../utils/objectPool";

export class GameplayScene {
  container: Container;
  private player!: PlayerEntity;
  private vehiclePool!: ObjectPool<VehicleEntity>;
  private activeVehicles: VehicleEntity[] = [];
  private spawnTimer: number = 0;
  private laneWidth: number = 0;
  private lanePositions: number[] = [];
  onGameOver: (() => void) | null = null;
  onLivesChange: ((lives: number) => void) | null = null;
  private lives: number = 3;

  constructor(_app: unknown) {
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();
    this.activeVehicles = [];
    this.spawnTimer = 0;
    this.lives = 3;
    this.laneWidth = (CANVAS_WIDTH * 0.6) / LANE_COUNT;
    this.lanePositions = Array.from({ length: LANE_COUNT }, (_, i) =>
      CANVAS_WIDTH * 0.2 + this.laneWidth * i + this.laneWidth / 2
    );

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.container.addChild(bg);

    // Road
    const road = new Graphics();
    road.rect(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT);
    road.fill(0x2d2d2d);
    this.container.addChild(road);

    // Lane dividers
    for (let i = 1; i < LANE_COUNT; i++) {
      const divider = new Graphics();
      const x = CANVAS_WIDTH * 0.2 + this.laneWidth * i;
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        divider.rect(x - 2, y, 4, 20);
      }
      divider.fill(0xffffff);
      divider.alpha = 0.3;
      this.container.addChild(divider);
    }

    // Vehicle pool
    this.vehiclePool = new ObjectPool<VehicleEntity>(
      () => {
        const v = new VehicleEntity();
        this.container.addChild(v.container);
        return v;
      },
      (v) => v.reset(),
      6
    );

    // Player
    this.player = new PlayerEntity();
    this.player.init(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8);
    this.container.addChild(this.player.container);
  }

  update(deltaTime: number): void {
    const roadLeft = CANVAS_WIDTH * 0.2;
    const roadRight = CANVAS_WIDTH * 0.8;
    this.player?.update(deltaTime, roadLeft, roadRight);

    // Spawn vehicles
    this.spawnTimer++;
    if (this.spawnTimer >= SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      this.spawnVehicle();
    }

    // Update vehicles
    for (let i = this.activeVehicles.length - 1; i >= 0; i--) {
      const vehicle = this.activeVehicles[i];
      vehicle.update(deltaTime);

      // Check collision
      if (this.player.collision.checkCollision(vehicle.collision.bounds)) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
        this.lives--;
        this.onLivesChange?.(this.lives);
        if (this.lives <= 0) {
          this.onGameOver?.();
          return;
        }
        // Reset player về giữa đường
        this.player.resetPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8);
      }

      // Return to pool if off screen
      if (vehicle.container.y > CANVAS_HEIGHT + 100) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
      }
    }
  }

  private spawnVehicle(): void {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = this.lanePositions[lane];
    const speed = 3 + Math.random() * 3;
    const vehicle = this.vehiclePool.get();
    vehicle.init(x, -80, speed);
    this.activeVehicles.push(vehicle);
  }

  destroy(): void {
    this.player?.destroy();
    this.container.removeChildren();
  }
}