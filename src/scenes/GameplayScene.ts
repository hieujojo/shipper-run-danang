import { Container, Graphics } from "pixi.js";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT, SPAWN_INTERVAL, TARGET_FPS,
  BASE_SCROLL_SPEED, INITIAL_MULTIPLIER, SPEED_INCREASE_RATE, MAX_SPEED_MULTIPLIER,
  MIN_VEHICLE_SPEED, MAX_VEHICLE_SPEED, PLAYER_HEIGHT
} from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";
import { VehicleEntity } from "../entities/VehicleEntity";
import { ObjectPool } from "../utils/objectPool";
import { audioManager } from "../utils/audioManager";
import { PackageEntity } from "../entities/PackageEntity";
import { DeliveryPointEntity } from "../entities/DeliveryPointEntity";
import levelData from "../data/levelData.json";

export class GameplayScene {
  container: Container;
  private player!: PlayerEntity;
  private vehiclePool!: ObjectPool<VehicleEntity>;
  private activeVehicles: VehicleEntity[] = [];
  private spawnTimer: number = 0;
  private laneWidth: number = 0;
  private lanePositions: number[] = [];
  private roadMarkings: { y: number }[] = [];
  private roadContainer!: Container;
  private buildingContainer!: Container;
  private roadOffset: number = 0;
  private package: PackageEntity | null = null;
  private deliveryPoint: DeliveryPointEntity | null = null;
  private hasPackage: boolean = false;
  private deliveryTimer: number = 0;
  private readonly DELIVERY_INTERVAL = 300; // frames
  onScoreDelivery: ((bonus: number) => void) | null = null;
  // Speed scaling (Subway Surfers style)
  private elapsedTime: number = 0;
  private speedMultiplier: number = INITIAL_MULTIPLIER;
  private initialMultiplier: number = INITIAL_MULTIPLIER;
  private speedIncreaseRate: number = SPEED_INCREASE_RATE;
  private maxSpeedMultiplier: number = MAX_SPEED_MULTIPLIER;
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
    audioManager.playEngine();
    this.hasPackage = false;
    this.deliveryTimer = 0;
    this.package = new PackageEntity();
    this.deliveryPoint = new DeliveryPointEntity();
    this.spawnPackage();
    this.container.addChild(this.deliveryPoint.container);
    this.container.addChild(this.package.container);
    // Đọc config tốc độ từ levelData (level 1 mặc định)
    const levelCfg = levelData.levels[0];
    this.initialMultiplier  = levelCfg.initialMultiplier;
    this.speedIncreaseRate  = levelCfg.speedIncreaseRate;
    this.maxSpeedMultiplier = levelCfg.maxSpeedMultiplier;
    this.speedMultiplier    = this.initialMultiplier;
    this.elapsedTime        = 0;
    this.roadOffset         = 0;

    this.laneWidth = (CANVAS_WIDTH * 0.6) / LANE_COUNT;
    this.lanePositions = Array.from({ length: LANE_COUNT }, (_, i) =>
      CANVAS_WIDTH * 0.2 + this.laneWidth * i + this.laneWidth / 2
    );

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.container.addChild(bg);

    // Vỉa hè trái
    const sidewalkLeft = new Graphics();
    sidewalkLeft.rect(0, 0, CANVAS_WIDTH * 0.2, CANVAS_HEIGHT);
    sidewalkLeft.fill(0x3d3d5c);
    this.container.addChild(sidewalkLeft);

    // Vỉa hè phải
    const sidewalkRight = new Graphics();
    sidewalkRight.rect(CANVAS_WIDTH * 0.8, 0, CANVAS_WIDTH * 0.2, CANVAS_HEIGHT);
    sidewalkRight.fill(0x3d3d5c);
    this.container.addChild(sidewalkRight);

    // Road
    const road = new Graphics();
    road.rect(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT);
    road.fill(0x2d2d2d);
    this.container.addChild(road);

    // Scrolling buildings
    this.buildingContainer = new Container();
    this.container.addChild(this.buildingContainer);
    this.buildBuildings();

    // Scrolling road container
    this.roadContainer = new Container();
    this.container.addChild(this.roadContainer);
    this.buildRoadMarkings();

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

    // Package và delivery point thêm trước player
    this.container.addChild(this.deliveryPoint.container);
    this.container.addChild(this.package.container);

    // Player (render trên cùng)
    this.player = new PlayerEntity();
    this.player.init(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8);
    this.container.addChild(this.player.container);

    this.spawnPackage();
  }

  private spawnPackage(): void {
    if (!this.package) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = this.lanePositions[lane];
    const y = Math.random() * (CANVAS_HEIGHT * 0.5) + CANVAS_HEIGHT * 0.1;
    this.package.init(x, y);
  }

  private spawnDeliveryPoint(): void {
    if (!this.deliveryPoint) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = this.lanePositions[lane];
    const y = Math.random() * (CANVAS_HEIGHT * 0.4) + CANVAS_HEIGHT * 0.1;
    this.deliveryPoint.init(x, y);
  }

  private updateDelivery(_deltaTime: number): void {
    if (!this.package || !this.deliveryPoint) return;

    if (!this.hasPackage && this.package.active) {
      // Check nhặt package
      if (this.player.collision.checkCollision(this.package.collision.bounds)) {
        this.hasPackage = true;
        this.package.reset();
        audioManager.playCoin();
        this.spawnDeliveryPoint();
      }
    }

    if (this.hasPackage && this.deliveryPoint.active) {
      // Check giao hàng
      if (this.player.collision.checkCollision(this.deliveryPoint.collision.bounds)) {
        this.hasPackage = false;
        this.deliveryPoint.reset();
        audioManager.playCoin();
        this.onScoreDelivery?.(100);
        // Spawn package mới sau 1 lúc
        this.deliveryTimer = 0;
      }
    }

    // Spawn package mới sau khi giao xong
    if (!this.hasPackage && !this.package?.active) {
      this.deliveryTimer++;
      if (this.deliveryTimer >= this.DELIVERY_INTERVAL) {
        this.deliveryTimer = 0;
        this.spawnPackage();
      }
    }
  }

  private buildBuildings(): void {
    this.buildingContainer.removeChildren();
    const buildingColors = [0x4a4a6a, 0x5a3a5a, 0x3a5a4a, 0x5a4a3a, 0x3a4a6a];
    const GAP = 8;

    // Tòa nhà bên trái
    let yLeft = -200;
    while (yLeft < CANVAS_HEIGHT + 200) {
      const h = 60 + Math.random() * 100;
      const w = CANVAS_WIDTH * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      // Thân nhà
      b.rect(GAP, yLeft, w, h);
      b.fill(color);
      // Cửa sổ
      for (let row = 0; row < Math.floor(h / 20); row++) {
        for (let col = 0; col < 2; col++) {
          b.rect(GAP + 8 + col * 18, yLeft + 8 + row * 18, 10, 12);
          b.fill(Math.random() > 0.4 ? 0xffee88 : 0x2a2a3a);
        }
      }
      this.buildingContainer.addChild(b);
      yLeft += h + GAP;
    }

    // Tòa nhà bên phải
    let yRight = -150;
    while (yRight < CANVAS_HEIGHT + 200) {
      const h = 60 + Math.random() * 100;
      const w = CANVAS_WIDTH * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      // Thân nhà
      b.rect(CANVAS_WIDTH * 0.8 + GAP, yRight, w, h);
      b.fill(color);
      // Cửa sổ
      for (let row = 0; row < Math.floor(h / 20); row++) {
        for (let col = 0; col < 2; col++) {
          b.rect(CANVAS_WIDTH * 0.8 + GAP + 8 + col * 18, yRight + 8 + row * 18, 10, 12);
          b.fill(Math.random() > 0.4 ? 0xffee88 : 0x2a2a3a);
        }
      }
      this.buildingContainer.addChild(b);
      yRight += h + GAP;
    }
  }

  private buildRoadMarkings(): void {
    this.roadContainer.removeChildren();
    for (let i = 1; i < LANE_COUNT; i++) {
      const x = CANVAS_WIDTH * 0.2 + this.laneWidth * i;
      for (let y = -40; y < CANVAS_HEIGHT + 40; y += 40) {
        const mark = new Graphics();
        mark.rect(x - 2, y, 4, 20);
        mark.fill(0xffffff);
        mark.alpha = 0.3;
        this.roadContainer.addChild(mark);
      }
    }
  }

  update(deltaTime: number): void {
    const roadLeft = CANVAS_WIDTH * 0.2;
    const roadRight = CANVAS_WIDTH * 0.8;
    this.player?.update(deltaTime, roadLeft, roadRight);

    // Tăng tốc dần theo thời gian (Subway Surfers style)
    this.elapsedTime += deltaTime / TARGET_FPS;
    this.speedMultiplier = Math.min(
      this.initialMultiplier + this.elapsedTime * this.speedIncreaseRate,
      this.maxSpeedMultiplier
    );

    this.updateDelivery(deltaTime);
      
    // Scroll đường theo speedMultiplier
    this.roadOffset += BASE_SCROLL_SPEED * this.speedMultiplier * deltaTime;
    // Scroll buildings
    this.buildingContainer.y = this.roadOffset * 0.6;
    if (this.buildingContainer.y >= CANVAS_HEIGHT) {
      this.buildingContainer.y = 0;
      this.buildBuildings();
    }
    if (this.roadOffset >= 40) {
      this.roadOffset %= 40;
    }
    this.roadContainer.y = this.roadOffset;

    // Spawn vehicles — interval rút ngắn khi tốc độ tăng
    const dynamicInterval = Math.max(20, Math.floor(SPAWN_INTERVAL / this.speedMultiplier));
    this.spawnTimer++;
    if (this.spawnTimer >= dynamicInterval) {
      this.spawnTimer = 0;
      this.spawnVehicle();
    }

    // Update vehicles
    for (let i = this.activeVehicles.length - 1; i >= 0; i--) {
      const vehicle = this.activeVehicles[i];
      vehicle.update(deltaTime);

      // Check collision với player
      if (this.player.collision.checkCollision(vehicle.collision.bounds)) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
        this.lives--;
        this.onLivesChange?.(this.lives);
        audioManager.playCrash();
        if (this.lives <= 0) {
          audioManager.stopEngine();
          this.onGameOver?.();
          return;
        }
        this.player.resetPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8);
        continue;
      }

      // Return to pool if off screen
      if (vehicle.container.y > CANVAS_HEIGHT + 100) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
      }
    }

    // Giữ khoảng cách cố định giữa các xe cùng lane (Subway Surfers style)
    // bottom of vehicle = container.y + PLAYER_HEIGHT (50), top = container.y - PLAYER_HEIGHT/2 (25)
    // → min distance giữa 2 container.y = PLAYER_HEIGHT * 1.5 + MIN_GAP
    const MIN_GAP = 20;
    const MIN_CENTER_DIST = PLAYER_HEIGHT * 1.5 + MIN_GAP; // 95px
    const SAME_LANE = 10; // px threshold để xác định cùng lane

    // Sort xe theo y tăng dần (thấp trên màn hình trước)
    this.activeVehicles.sort((a, b) => a.container.y - b.container.y);

    for (let i = 0; i < this.activeVehicles.length - 1; i++) {
      const upper = this.activeVehicles[i];     // xe phía trên (y nhỏ hơn)
      const lower = this.activeVehicles[i + 1]; // xe phía dưới (y lớn hơn, gần player)
      // Chỉ xét cùng lane
      if (Math.abs(upper.container.x - lower.container.x) > SAME_LANE) continue;
      // Nếu xe trên đã quá gần xe dưới, đẩy xe trên lên để giữ khoảng cách
      if (lower.container.y - upper.container.y < MIN_CENTER_DIST) {
        upper.container.y = lower.container.y - MIN_CENTER_DIST;
        upper.collision.bounds.y = upper.container.y - PLAYER_HEIGHT / 2;
      }
    }
  }

  private spawnVehicle(): void {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = this.lanePositions[lane];
    const baseSpeed = MIN_VEHICLE_SPEED + Math.random() * (MAX_VEHICLE_SPEED - MIN_VEHICLE_SPEED);
    const speed = baseSpeed * this.speedMultiplier;

    // Không spawn nếu đã có xe cùng lane còn ở gần đầu màn hình (< 95px kể từ spawn point)
    const tooClose = this.activeVehicles.some(
      (v) => Math.abs(v.container.x - x) < 10 && v.container.y < PLAYER_HEIGHT * 1.5 + 20
    );
    if (tooClose) return;

    const vehicle = this.vehiclePool.get();
    vehicle.init(x, -80, speed);
    this.activeVehicles.push(vehicle);
  }

  destroy(): void {
    this.player?.destroy();
    audioManager.stopEngine();
    this.container.removeChildren();
  }
}