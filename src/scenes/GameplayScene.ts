import { Container, Graphics } from "pixi.js";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT, SPAWN_INTERVAL, TARGET_FPS,
  BASE_SCROLL_SPEED, INITIAL_MULTIPLIER, SPEED_INCREASE_RATE, MAX_SPEED_MULTIPLIER,
  MIN_VEHICLE_SPEED, MAX_VEHICLE_SPEED, PLAYER_WIDTH
} from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";
import { VehicleEntity } from "../entities/VehicleEntity";
import { ObjectPool } from "../utils/objectPool";
import { audioManager } from "../utils/audioManager";
import { ParticleSystem } from "../utils/particleSystem";
import { PackageEntity } from "../entities/PackageEntity";
import { DeliveryPointEntity } from "../entities/DeliveryPointEntity";
import { DragonEventScene } from "./DragonEventScene";
import levelData from "../data/levelData.json";

export class GameplayScene {
  container: Container;
  private player!: PlayerEntity;
  private vehiclePool!: ObjectPool<VehicleEntity>;
  private activeVehicles: VehicleEntity[] = [];
  private spawnTimer: number = 0;
  private laneWidth: number = 0;
  private lanePositions: number[] = [];
  private baseEnvironment!: Container;
  private roadContainer!: Container;
  private buildingContainer!: Container;
  private roadOffset: number = 0;
  private package: PackageEntity | null = null;
  private deliveryPoint: DeliveryPointEntity | null = null;
  private hasPackage: boolean = false;
  private deliveryTimer: number = 0;
  private readonly DELIVERY_INTERVAL = 120; // frames (rút ngắn lại để ra nhanh hơn)
  onScoreDelivery: ((bonus: number) => void) | null = null;
  onPackageChange: ((hasPackage: boolean) => void) | null = null;
  private particles!: ParticleSystem;
  private dragonEvent!: DragonEventScene;
  private isDragonEvent: boolean = false;
  private dragonEventTimer: number = 0;
  private readonly DRAGON_EVENT_DURATION = 60 * 60; // 60 giây
  private speedOverride: number = 1.0;
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
    void _app;
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();
    this.activeVehicles = [];
    this.spawnTimer = 0;
    this.lives = 3;
    audioManager.stopBGM();
    audioManager.playEngine();
    this.hasPackage = false;
    this.deliveryTimer = 0;
    this.package = new PackageEntity();
    this.deliveryPoint = new DeliveryPointEntity();
    
    // Đọc config tốc độ từ levelData (level 1 mặc định)
    const levelCfg = levelData.levels[0];
    this.initialMultiplier = levelCfg.initialMultiplier;
    this.speedIncreaseRate = levelCfg.speedIncreaseRate;
    this.maxSpeedMultiplier = levelCfg.maxSpeedMultiplier;
    this.speedMultiplier = this.initialMultiplier;
    this.elapsedTime = 0;
    this.roadOffset = 0;

    // Chiều rộng mỗi làn theo trục Y
    this.laneWidth = (CANVAS_HEIGHT * 0.6) / LANE_COUNT;
    this.lanePositions = Array.from({ length: LANE_COUNT }, (_, i) =>
      CANVAS_HEIGHT * 0.2 + this.laneWidth * i + this.laneWidth / 2
    );

    this.baseEnvironment = new Container();
    this.container.addChild(this.baseEnvironment);

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.baseEnvironment.addChild(bg);

    // Vỉa hè trên
    const sidewalkTop = new Graphics();
    sidewalkTop.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkTop.fill(0x3d3d5c);
    this.baseEnvironment.addChild(sidewalkTop);

    // Vỉa hè dưới
    const sidewalkBottom = new Graphics();
    sidewalkBottom.rect(0, CANVAS_HEIGHT * 0.8, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkBottom.fill(0x3d3d5c);
    this.baseEnvironment.addChild(sidewalkBottom);

    // Road
    const road = new Graphics();
    road.rect(0, CANVAS_HEIGHT * 0.2, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
    road.fill(0x2d2d2d);
    this.baseEnvironment.addChild(road);

    // Scrolling buildings
    this.buildingContainer = new Container();
    this.baseEnvironment.addChild(this.buildingContainer);
    this.buildBuildings();

    // Scrolling road container
    this.roadContainer = new Container();
    this.baseEnvironment.addChild(this.roadContainer);
    this.buildRoadMarkings();

    // Vehicle pool
    this.vehiclePool = new ObjectPool<VehicleEntity>(
      () => {
        const v = new VehicleEntity();
        this.container.addChild(v.container);
        return v;
      },
      (v) => v.reset(0, 0, 0), // fake reset to clear state
      6
    );

    // Package và delivery point thêm trước player
    this.container.addChild(this.deliveryPoint.container);
    this.container.addChild(this.package.container);

    this.spawnPackage();

    // Player (render trên cùng)
    this.player = new PlayerEntity();
    this.player.init(CANVAS_WIDTH * 0.2, CANVAS_HEIGHT / 2); // Cố định ở 20% màn hình bên trái
    this.container.addChild(this.player.container);
    
    // Particle system (render trên cùng nhất)
    this.particles = new ParticleSystem();
    this.container.addChild(this.particles.container);
    
    // Dragon event
    this.dragonEvent = new DragonEventScene();
    this.isDragonEvent = false;
    this.dragonEventTimer = 0;
    this.speedOverride = 1.0;
  }

  private startDragonEvent(): void {
    this.isDragonEvent = true;

    // Ẩn background gốc đi
    this.baseEnvironment.visible = false;
    
    this.dragonEvent.init();
    // Thêm cầu rồng vào background (ngay trên baseEnvironment đã bị ẩn)
    this.container.addChildAt(this.dragonEvent.container, 1);

    this.dragonEvent.onSpeedChange = (m: number) => {
      this.speedOverride = m;
    };
    this.dragonEvent.onVisibilityChange = (a: number) => {
      this.container.alpha = a;
    };
  }

  private stopDragonEvent(): void {
    this.isDragonEvent = false;
    this.speedOverride = 1.0;
    this.container.alpha = 1.0;
    this.dragonEvent.destroy();
    this.baseEnvironment.visible = true;
  }

  private spawnPackage(): void {
    if (!this.package) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const y = this.lanePositions[lane];
    const x = CANVAS_WIDTH + 100; // Xuất hiện bên ngoài màn hình bên phải
    this.package.init(x, y);
  }

  private spawnDeliveryPoint(): void {
    if (!this.deliveryPoint) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const y = this.lanePositions[lane];
    const x = CANVAS_WIDTH + 100;
    this.deliveryPoint.init(x, y);
  }

  private updateDelivery(deltaTime: number): void {
    if (!this.package || !this.deliveryPoint) return;
    
    const envSpeed = BASE_SCROLL_SPEED * this.speedMultiplier * this.speedOverride * deltaTime;

    // Cuộn package từ phải sang trái
    if (!this.hasPackage && this.package.active) {
      this.package.container.x -= envSpeed;
      if (this.package.container.x < -100) {
        this.package.reset(); // Đi quá biên trái -> respawn
        this.spawnPackage();
      } else if (this.player.collision.checkCollision(this.package.collision.bounds)) {
        this.hasPackage = true;
        this.package.reset();
        audioManager.playCoin();
        this.spawnDeliveryPoint();
        this.particles.emitPickup(this.player.container.x, this.player.container.y);
        this.onPackageChange?.(true);
      }
    }

    // Cuộn điểm giao hàng từ phải sang trái
    if (this.hasPackage && this.deliveryPoint.active) {
      this.deliveryPoint.container.x -= envSpeed;
      if (this.deliveryPoint.container.x < -100) {
        this.deliveryPoint.reset(); // Đi quá biên trái -> respawn
        this.spawnDeliveryPoint();
      } else if (this.player.collision.checkCollision(this.deliveryPoint.collision.bounds)) {
        this.hasPackage = false;
        this.deliveryPoint.reset();
        audioManager.playCoin();
        this.onScoreDelivery?.(100);
        this.particles.emitDelivery(this.player.container.x, this.player.container.y);
        this.deliveryTimer = 0;
        this.onPackageChange?.(false);
      }
    }

    // Spawn package mới sau khi giao xong
    if (!this.hasPackage && !this.package?.active) {
      this.deliveryTimer += deltaTime;
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

    // Tòa nhà dãy trên
    let xTop = -200;
    while (xTop < CANVAS_WIDTH + 200) {
      const w = 60 + Math.random() * 100;
      const h = CANVAS_HEIGHT * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      b.rect(xTop, GAP, w, h);
      b.fill(color);
      // Cửa sổ
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < Math.floor(w / 20); col++) {
          b.rect(xTop + 8 + col * 18, GAP + 8 + row * 18, 10, 12);
          b.fill(Math.random() > 0.4 ? 0xffee88 : 0x2a2a3a);
        }
      }
      this.buildingContainer.addChild(b);
      xTop += w + GAP;
    }

    // Tòa nhà dãy dưới
    let xBottom = -150;
    while (xBottom < CANVAS_WIDTH + 200) {
      const w = 60 + Math.random() * 100;
      const h = CANVAS_HEIGHT * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      b.rect(xBottom, CANVAS_HEIGHT * 0.8 + GAP, w, h);
      b.fill(color);
      // Cửa sổ
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < Math.floor(w / 20); col++) {
          b.rect(xBottom + 8 + col * 18, CANVAS_HEIGHT * 0.8 + GAP + 8 + row * 18, 10, 12);
          b.fill(Math.random() > 0.4 ? 0xffee88 : 0x2a2a3a);
        }
      }
      this.buildingContainer.addChild(b);
      xBottom += w + GAP;
    }
  }

  private buildRoadMarkings(): void {
    this.roadContainer.removeChildren();
    for (let i = 1; i < LANE_COUNT; i++) {
      const y = CANVAS_HEIGHT * 0.2 + this.laneWidth * i;
      for (let x = -40; x < CANVAS_WIDTH + 40; x += 40) {
        const mark = new Graphics();
        mark.rect(x, y - 2, 20, 4);
        mark.fill(0xffffff);
        mark.alpha = 0.3;
        this.roadContainer.addChild(mark);
      }
    }
  }

  update(deltaTime: number): void {
    const roadTop = CANVAS_HEIGHT * 0.2;
    const roadBottom = CANVAS_HEIGHT * 0.8;
    this.player?.update(deltaTime, roadTop, roadBottom); // Bây giờ là roadTop, roadBottom để giới hạn trục Y

    // Tăng tốc dần theo thời gian
    this.elapsedTime += deltaTime / TARGET_FPS;
    this.speedMultiplier = Math.min(
      this.initialMultiplier + this.elapsedTime * this.speedIncreaseRate,
      this.maxSpeedMultiplier
    );

    this.updateDelivery(deltaTime);
    this.particles.update(deltaTime);
    
    // Dragon event trigger
    this.dragonEventTimer += deltaTime;
    if (!this.isDragonEvent && this.dragonEventTimer >= 120 * 60) {
      this.startDragonEvent();
    }
    if (this.isDragonEvent) {
      this.dragonEvent.update(deltaTime);
      if (this.dragonEventTimer >= 120 * 60 + this.DRAGON_EVENT_DURATION) {
        this.stopDragonEvent();
        this.dragonEventTimer = 0;
      }
    }

    // Scroll đường (Sang trái -> X giảm)
    const currentScrollSpeed = BASE_SCROLL_SPEED * this.speedMultiplier * this.speedOverride * deltaTime;
    this.roadOffset -= currentScrollSpeed;
    
    // Scroll buildings chậm hơn đường (parallax)
    this.buildingContainer.x = this.roadOffset * 0.6;
    if (this.buildingContainer.x <= -CANVAS_WIDTH) { // Xóa và render lại khi trôi qua hết
      this.buildingContainer.x = 0;
      this.roadOffset += CANVAS_WIDTH / 0.6; // Bù đắp lại roadOffset
      this.buildBuildings();
    }
    
    // Scroll road markings
    this.roadContainer.x = this.roadOffset % 40; // Lặp lại vạch kẻ đường mỗi 40px

    // Spawn vehicles
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

      // Check collision
      if (this.player.collision.checkCollision(vehicle.collision.bounds)) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
        this.lives--;
        this.onLivesChange?.(this.lives);
        audioManager.playCrash();
        this.particles.emitCrash(this.player.container.x, this.player.container.y);
        
        if (this.lives <= 0) {
          audioManager.stopEngine();
          this.onGameOver?.();
          return;
        }
        
        // Hồi sinh ở 20% bên trái, giữa đường
        this.player.resetPosition(CANVAS_WIDTH * 0.2, CANVAS_HEIGHT / 2);
        continue;
      }

      // Return to pool if off screen (qua trái màn hình)
      if (vehicle.container.x < -100) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
      }
    }

    // AI Giữ khoảng cách cố định giữa các xe cùng lane
    const MIN_GAP = 20;
    const MIN_CENTER_DIST = PLAYER_WIDTH * 1.5 + MIN_GAP; // Tính theo chiều X
    const SAME_LANE = 10;

    // Sort xe theo X giảm dần (càng xa bên phải càng đứng trước mảng)
    this.activeVehicles.sort((a, b) => b.container.x - a.container.x);

    for (let i = 0; i < this.activeVehicles.length - 1; i++) {
      const rightVeh = this.activeVehicles[i];     // Xe phía sau (bên phải)
      const leftVeh = this.activeVehicles[i + 1]; // Xe phía trước (bên trái)
      
      // Chỉ xét cùng lane
      if (Math.abs(rightVeh.container.y - leftVeh.container.y) > SAME_LANE) continue;
      
      // Nếu xe sau tiến quá gần xe trước, đẩy xe sau lùi lại
      if (rightVeh.container.x - leftVeh.container.x < MIN_CENTER_DIST) {
        rightVeh.container.x = leftVeh.container.x + MIN_CENTER_DIST;
        rightVeh.collision.bounds.x = rightVeh.container.x - PLAYER_WIDTH / 2;
      }
    }
  }

  private spawnVehicle(): void {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const y = this.lanePositions[lane];
    const x = CANVAS_WIDTH + 100;
    
    // Speed di chuyển TỪ PHẢI SANG TRÁI -> speed mang dấu âm
    const baseSpeed = MIN_VEHICLE_SPEED + Math.random() * (MAX_VEHICLE_SPEED - MIN_VEHICLE_SPEED);
    const speed = baseSpeed * this.speedMultiplier;

    // Tránh spawn đè nhau
    const tooClose = this.activeVehicles.some(
      (v) => Math.abs(v.container.y - y) < 10 && Math.abs(v.container.x - x) < PLAYER_WIDTH * 1.5 + 20
    );
    if (tooClose) return;

    const vehicle = this.vehiclePool.get();
    vehicle.init(x, y, -speed); // truyền speed âm
    this.activeVehicles.push(vehicle);
  }

  destroy(): void {
    this.player?.destroy();
    this.particles.clear();
    this.dragonEvent?.destroy();
    audioManager.stopEngine();
    this.container.removeChildren();
  }
}