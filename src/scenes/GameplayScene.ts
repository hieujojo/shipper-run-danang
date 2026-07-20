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
import { EffectsManager } from "../utils/effectsManager";
import { PackageEntity } from "../entities/PackageEntity";
import { DeliveryPointEntity } from "../entities/DeliveryPointEntity";
import { LandmarkEventScene, type LandmarkEventConfig } from "./LandmarkEventScene";
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
  private readonly DELIVERY_INTERVAL = 120;
  onScoreDelivery: ((bonus: number) => void) | null = null;
  onPackageChange: ((hasPackage: boolean) => void) | null = null;
  private particles!: ParticleSystem;
  private effects!: EffectsManager;
  private landmarkEvent!: LandmarkEventScene;
  private isLandmarkEvent: boolean = false;
  private speedOverride: number = 1.0;
  private landmarkBreathType: string | null = null;
  private readonly DRAGON_FIRE_SPAWN_BOOST = 2;
  private readonly DRAGON_WATER_PACKAGE_BOOST = 3;
  private currentLevelIndex: number = 0;
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

    const levelCfg = levelData.levels[0];
    this.initialMultiplier = levelCfg.initialMultiplier;
    this.speedIncreaseRate = levelCfg.speedIncreaseRate;
    this.maxSpeedMultiplier = levelCfg.maxSpeedMultiplier;
    this.speedMultiplier = this.initialMultiplier;
    this.elapsedTime = 0;
    this.roadOffset = 0;

    this.laneWidth = (CANVAS_HEIGHT * 0.6) / LANE_COUNT;
    this.lanePositions = Array.from({ length: LANE_COUNT }, (_, i) =>
      CANVAS_HEIGHT * 0.2 + this.laneWidth * i + this.laneWidth / 2
    );

    this.baseEnvironment = new Container();
    this.container.addChild(this.baseEnvironment);

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.baseEnvironment.addChild(bg);

    const sidewalkTop = new Graphics();
    sidewalkTop.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkTop.fill(0x3d3d5c);
    this.baseEnvironment.addChild(sidewalkTop);

    const sidewalkBottom = new Graphics();
    sidewalkBottom.rect(0, CANVAS_HEIGHT * 0.8, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkBottom.fill(0x3d3d5c);
    this.baseEnvironment.addChild(sidewalkBottom);

    const road = new Graphics();
    road.rect(0, CANVAS_HEIGHT * 0.2, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
    road.fill(0x2d2d2d);
    this.baseEnvironment.addChild(road);

    this.buildingContainer = new Container();
    this.baseEnvironment.addChild(this.buildingContainer);
    this.buildBuildings();

    this.roadContainer = new Container();
    this.container.addChild(this.roadContainer);
    this.buildRoadMarkings();

    this.vehiclePool = new ObjectPool<VehicleEntity>(
      () => {
        const v = new VehicleEntity();
        this.container.addChild(v.container);
        return v;
      },
      (v) => v.reset(0, 0, 0),
      6
    );

    this.container.addChild(this.deliveryPoint.container);
    this.container.addChild(this.package.container);
    this.spawnPackage();

    // Effects khởi tạo trước player
    this.effects = new EffectsManager();

    this.player = new PlayerEntity();
    this.player.init(CANVAS_WIDTH * 0.2, CANVAS_HEIGHT / 2);
    this.player.setEffectsManager(this.effects);
    this.container.addChild(this.player.container);

    this.particles = new ParticleSystem();
    this.container.addChild(this.particles.container);

    this.landmarkEvent = new LandmarkEventScene();
    this.isLandmarkEvent = false;
    this.speedOverride = 1.0;
  }

  setLevel(levelIndex: number): void {
    this.currentLevelIndex = levelIndex;
    const cfg = levelData.levels[levelIndex];
    this.initialMultiplier = cfg.initialMultiplier;
    this.speedIncreaseRate = cfg.speedIncreaseRate;
    this.maxSpeedMultiplier = cfg.maxSpeedMultiplier;
    this.speedMultiplier = cfg.initialMultiplier;
    this.elapsedTime = 0;
  }

  triggerLandmarkEvent(active: boolean): void {
    if (active) {
      if (this.isLandmarkEvent) {
        this.stopLandmarkEvent();
      }
      this.startLandmarkEvent();
    } else if (!active && this.isLandmarkEvent) {
      this.stopLandmarkEvent();
    }
  }

  private startLandmarkEvent(): void {
    this.isLandmarkEvent = true;
    const level = levelData.levels[this.currentLevelIndex ?? 0];
    const cfg: LandmarkEventConfig = {
      assetPath: level.assetPath,
      scaleMultiplier: level.landmarkEvent?.scaleMultiplier ?? 1.3,
      yOffsetRatio: level.landmarkEvent?.yOffsetRatio ?? 0.25,
      breathEffect: (level.landmarkEvent?.breathEffect as "fire" | "water" | null) ?? null,
    };
    this.landmarkEvent.init(cfg);
    const roadIdx = this.container.getChildIndex(this.roadContainer);
    this.container.addChildAt(this.landmarkEvent.container, roadIdx);
    this.landmarkEvent.onBreathEffect = (type) => {
      this.landmarkBreathType = type;
    };
  }

  private stopLandmarkEvent(): void {
    this.isLandmarkEvent = false;
    this.landmarkBreathType = null;
    this.speedOverride = 1.0;
    this.landmarkEvent.destroy();
  }

  private spawnPackage(): void {
    if (!this.package) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const y = this.lanePositions[lane];
    const x = CANVAS_WIDTH + 100;
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

    if (!this.hasPackage && this.package.active) {
      this.package.container.x -= envSpeed;
      if (this.package.container.x < -100) {
        this.package.reset();
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

    if (this.hasPackage && this.deliveryPoint.active) {
      this.deliveryPoint.container.x -= envSpeed;
      if (this.deliveryPoint.container.x < -100) {
        this.deliveryPoint.reset();
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

    if (!this.hasPackage && !this.package?.active) {
      const waterBoost = this.landmarkBreathType === "water" ? this.DRAGON_WATER_PACKAGE_BOOST : 1;
      this.deliveryTimer += deltaTime * waterBoost;
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

    let xTop = -200;
    while (xTop < CANVAS_WIDTH + 200) {
      const w = 60 + Math.random() * 100;
      const h = CANVAS_HEIGHT * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      b.rect(xTop, GAP, w, h);
      b.fill(color);
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < Math.floor(w / 20); col++) {
          b.rect(xTop + 8 + col * 18, GAP + 8 + row * 18, 10, 12);
          b.fill(Math.random() > 0.4 ? 0xffee88 : 0x2a2a3a);
        }
      }
      this.buildingContainer.addChild(b);
      xTop += w + GAP;
    }

    let xBottom = -150;
    while (xBottom < CANVAS_WIDTH + 200) {
      const w = 60 + Math.random() * 100;
      const h = CANVAS_HEIGHT * 0.15;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const b = new Graphics();
      b.rect(xBottom, CANVAS_HEIGHT * 0.8 + GAP, w, h);
      b.fill(color);
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
    this.player?.update(deltaTime, roadTop, roadBottom);

    this.elapsedTime += deltaTime / TARGET_FPS;
    this.speedMultiplier = Math.min(
      this.initialMultiplier + this.elapsedTime * this.speedIncreaseRate,
      this.maxSpeedMultiplier
    );

    this.updateDelivery(deltaTime);
    this.particles.update(deltaTime);
    this.effects.update(deltaTime);

    if (this.speedMultiplier > 0.8) {
      this.particles.emitSpeedTrail(
        this.player.container.x - 25,
        this.player.container.y,
        this.speedMultiplier
      );
    }

    if (this.isLandmarkEvent) {
      this.landmarkEvent.update(deltaTime);
      this.landmarkEvent.scroll(this.roadOffset);
    }

    const currentScrollSpeed = BASE_SCROLL_SPEED * this.speedMultiplier * this.speedOverride * deltaTime;
    this.roadOffset -= currentScrollSpeed;

    this.buildingContainer.x = this.roadOffset * 0.6;
    if (this.buildingContainer.x <= -CANVAS_WIDTH) {
      this.buildingContainer.x = 0;
      this.roadOffset += CANVAS_WIDTH / 0.6;
      this.buildBuildings();
    }

    this.roadContainer.x = this.roadOffset % 40;

    const fireBoost = this.landmarkBreathType === "fire" ? this.DRAGON_FIRE_SPAWN_BOOST : 1;
    const dynamicInterval = Math.max(10, Math.floor(SPAWN_INTERVAL / this.speedMultiplier / fireBoost));
    this.spawnTimer++;
    if (this.spawnTimer >= dynamicInterval) {
      this.spawnTimer = 0;
      this.spawnVehicle();
    }

    for (let i = this.activeVehicles.length - 1; i >= 0; i--) {
      const vehicle = this.activeVehicles[i];
      vehicle.update(deltaTime);

      if (
        this.player.collision.checkCollision(vehicle.collision.bounds) &&
        !this.player.isInvincible()
      ) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
        this.lives--;
        this.onLivesChange?.(this.lives);
        audioManager.playCrash();
        this.particles.emitCrash(this.player.container.x, this.player.container.y);
        this.player.takeDamage();

        if (this.lives <= 0) {
          this.effects.destroy();
          audioManager.stopEngine();
          this.onGameOver?.();
          return;
        }

        this.player.resetPosition(CANVAS_WIDTH * 0.2, CANVAS_HEIGHT / 2);
        continue;
      }

      if (vehicle.container.x < -100) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
      }
    }

    const MIN_GAP = 20;
    const MIN_CENTER_DIST = PLAYER_WIDTH * 1.5 + MIN_GAP;
    const SAME_LANE = 10;

    this.activeVehicles.sort((a, b) => b.container.x - a.container.x);

    for (let i = 0; i < this.activeVehicles.length - 1; i++) {
      const rightVeh = this.activeVehicles[i];
      const leftVeh = this.activeVehicles[i + 1];

      if (Math.abs(rightVeh.container.y - leftVeh.container.y) > SAME_LANE) continue;

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

    const baseSpeed = MIN_VEHICLE_SPEED + Math.random() * (MAX_VEHICLE_SPEED - MIN_VEHICLE_SPEED);
    const speed = baseSpeed * this.speedMultiplier;

    const tooClose = this.activeVehicles.some(
      (v) => Math.abs(v.container.y - y) < 10 && Math.abs(v.container.x - x) < PLAYER_WIDTH * 1.5 + 20
    );
    if (tooClose) return;

    const vehicle = this.vehiclePool.get();
    vehicle.init(x, y, -speed);
    this.activeVehicles.push(vehicle);
  }

  destroy(): void {
    this.player?.destroy();
    this.particles.clear();
    this.effects.destroy();
    this.landmarkEvent?.destroy();
    audioManager.stopEngine();
    this.container.removeChildren();
  }
}