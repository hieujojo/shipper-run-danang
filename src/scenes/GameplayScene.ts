import { Container, Graphics } from "pixi.js";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT, TARGET_FPS,
  BASE_SCROLL_SPEED, INITIAL_MULTIPLIER, SPEED_INCREASE_RATE, MAX_SPEED_MULTIPLIER,
  ROAD_TOP, ROAD_BOTTOM
} from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";
import { VehicleEntity, VehicleType, VEHICLE_CONFIGS } from "../entities/VehicleEntity";
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
  // Wave-based traffic
  private waveTimer: number = 0;
  private waveCooldownTimer: number = 0;
  private vehiclesLeftInWave: number = 0;
  private inWaveCooldown: boolean = false;
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
  private baseVehicleSpeed: number = 5;
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
    this.waveTimer = 0;
    this.waveCooldownTimer = 0;
    this.vehiclesLeftInWave = 0;
    this.inWaveCooldown = false;
    this.lives = 3;
    audioManager.stopBGM();
    audioManager.playEngine();
    // Reset delivery state BEFORE creating new entities
    this.hasPackage = false;
    this.deliveryTimer = 0;
    // Create new entity instances
    this.package = new PackageEntity();
    this.deliveryPoint = new DeliveryPointEntity();

    // Ensure entities are reset (active=false, visible=false)
    this.deliveryPoint.reset();
    this.package.reset();
    // Sync hasPackage state to React UI AFTER local state is reset
    this.onPackageChange?.(false);

    const levelCfg = levelData.levels[0];
    this.initialMultiplier = levelCfg.initialMultiplier;
    this.speedIncreaseRate = levelCfg.speedIncreaseRate;
    this.maxSpeedMultiplier = levelCfg.maxSpeedMultiplier;
    this.baseVehicleSpeed = levelCfg.baseSpeed || 5;
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
    this.currentLevelIndex = 0;
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
    this.baseVehicleSpeed = cfg.baseSpeed || 5;
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
      width: level.landmarkEvent?.width,
      yOffsetRatio: level.landmarkEvent?.yOffsetRatio ?? 0.25,
      breathEffect: (level.landmarkEvent?.breathEffect as "fire" | "water" | null) ?? null,
      flipX: level.landmarkEvent?.flipX ?? false,
      seamlessTile: (level.landmarkEvent?.seamlessTile as "mirror" | "repeat") ?? undefined,
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

  private getSafeLaneForEntity(x: number, width: number): number {
    const safeLanes: number[] = [];
    const SPAWN_CHECK_ZONE = 300;

    for (let l = 0; l < LANE_COUNT; l++) {
      const ly = this.lanePositions[l];
      
      const tooClose = this.activeVehicles.some((v) => {
        if (Math.abs(v.container.y - ly) >= 10) return false;
        if (v.container.x < x - SPAWN_CHECK_ZONE) return false;
        
        const existingType = v.vehicleType;
        const existingHalfW = VEHICLE_CONFIGS[existingType].width / 2;
        const minDist = existingHalfW + width / 2 + 50;
        const actualDist = Math.abs(v.container.x - x);
        return actualDist < minDist;
      });

      if (!tooClose) safeLanes.push(l);
    }
    
    if (safeLanes.length > 0) {
       return safeLanes[Math.floor(Math.random() * safeLanes.length)];
    }
    return Math.floor(Math.random() * LANE_COUNT);
  }

  private spawnPackage(): void {
    if (!this.package) return;
    const x = CANVAS_WIDTH + 100;
    const lane = this.getSafeLaneForEntity(x, 45);
    const y = this.lanePositions[lane];
    this.package.init(x, y);
  }

  private spawnDeliveryPoint(): void {
    if (!this.deliveryPoint) return;
    const x = CANVAS_WIDTH + 100;
    const lane = this.getSafeLaneForEntity(x, 65);
    const y = this.lanePositions[lane];
    this.deliveryPoint.init(x, y);
  }

  private updateDelivery(deltaTime: number): void {
    if (!this.package || !this.deliveryPoint) return;

    const envSpeed = BASE_SCROLL_SPEED * this.speedMultiplier * this.speedOverride * deltaTime;

    if (!this.hasPackage && this.package.active) {
      this.package.container.x -= envSpeed;
      this.package.syncBounds();
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
      this.deliveryPoint.syncBounds();
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
    while (xTop < CANVAS_WIDTH * 2 + 200) {
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
    while (xBottom < CANVAS_WIDTH * 2 + 200) {
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
    const roadTop = ROAD_TOP;
    const roadBottom = ROAD_BOTTOM;
    this.player?.update(deltaTime, roadTop, roadBottom);

    this.elapsedTime += deltaTime / TARGET_FPS;
    const baseSpeed = Math.min(
      this.initialMultiplier + this.elapsedTime * this.speedIncreaseRate,
      this.maxSpeedMultiplier
    );
    
    const isDashing = this.player?.getInputState().space ?? false;
    this.speedMultiplier = baseSpeed * (isDashing ? 1.6 : 1.0);

    this.updateDelivery(deltaTime);
    this.particles.update(deltaTime);
    this.effects.update(deltaTime);

    if (this.speedMultiplier > 1.1) {
      this.particles.emitSpeedTrail(
        this.player.container.x,
        this.player.container.y,
        this.speedMultiplier,
        false,
        45,
        15 // yOffset để hạ thấp khói
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

    this._tickWaveSpawner();

    const currentVehicleSpeed = -this.baseVehicleSpeed * this.speedMultiplier;

    // Motion blur theo tốc độ — dùng effectsManager, không rải filter
    this.effects.applyMotionBlur(this.container, this.speedMultiplier);

    for (let i = this.activeVehicles.length - 1; i >= 0; i--) {
      const vehicle = this.activeVehicles[i];
      vehicle.update(deltaTime, currentVehicleSpeed);
      
      if (baseSpeed > 1.1) {
        const vCfg = VEHICLE_CONFIGS[vehicle.vehicleType];
        this.particles.emitSpeedTrail(
          vehicle.container.x,
          vehicle.container.y,
          baseSpeed,
          true,
          vCfg.smokeOffset,
          vCfg.smokeOffsetY || 0
        );
      }

      // Ngăn xe đè nhau trong runtime: nếu xe này sắp đụng xe phía trước thì giảm tốc
      for (let j = 0; j < this.activeVehicles.length; j++) {
        if (j === i) continue;
        const other = this.activeVehicles[j];
        if (Math.abs(other.container.y - vehicle.container.y) >= 10) continue;

        const vCfg = VEHICLE_CONFIGS[vehicle.vehicleType];
        const oCfg = VEHICLE_CONFIGS[other.vehicleType];
        const safeGap = vCfg.width / 2 + oCfg.width / 2 + 10;
        const dist = other.container.x - vehicle.container.x;

        if (dist > -safeGap && dist < safeGap) {
          if (vehicle.container.x > other.container.x) {
            vehicle.container.x = other.container.x + safeGap;
          } else {
            other.container.x = vehicle.container.x + safeGap;
          }
        }
      }
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
      // GameplayScene.ts — trong vòng lặp update activeVehicles
      const halfW = VEHICLE_CONFIGS[vehicle.vehicleType].width / 2;
      if (vehicle.container.x + halfW < 0) {
        this.vehiclePool.release(vehicle);
        this.activeVehicles.splice(i, 1);
      }
    }
  }

  private _tickWaveSpawner(): void {
    const level = levelData.levels[this.currentLevelIndex ?? 0];
    const tc = level.traffic;
    const fireBoost = this.landmarkBreathType === "fire" ? this.DRAGON_FIRE_SPAWN_BOOST : 1;

    if (this.inWaveCooldown) {
      // Đang nghỉ giữa các wave
      this.waveCooldownTimer--;
      if (this.waveCooldownTimer <= 0) {
        this.inWaveCooldown = false;
        // Chọn số xe cho wave tiếp theo
        this.vehiclesLeftInWave = tc.waveMinSize
          + Math.floor(Math.random() * (tc.waveMaxSize - tc.waveMinSize + 1));
        this.vehiclesLeftInWave = Math.round(this.vehiclesLeftInWave * fireBoost);
        this.waveTimer = 0;
      }
      return;
    }

    // Đang trong wave — đếm nhịp nội bộ
    this.waveTimer++;
    const intraGap = Math.max(6, Math.floor(tc.intraWaveGap / this.speedMultiplier));
    if (this.waveTimer < intraGap) return;
    this.waveTimer = 0;

    if (this.vehiclesLeftInWave > 0) {
      this._spawnOneVehicle(tc.speedVariance);
      this.vehiclesLeftInWave--;
    }

    if (this.vehiclesLeftInWave <= 0) {
      // Hết xe trong wave → vào cooldown
      this.inWaveCooldown = true;
      const range = tc.waveCooldownMax - tc.waveCooldownMin;
      this.waveCooldownTimer = Math.floor(
        (tc.waveCooldownMin + Math.random() * range) / this.speedMultiplier
      );
    }
  }

  private _spawnOneVehicle(speedVariance: number): void {
    const x = CANVAS_WIDTH + 100;

    const level = levelData.levels[this.currentLevelIndex ?? 0];
    const weights = level.traffic.vehicleWeights;
    const type = this._pickVehicleType(weights);

    const newVehicleCfg = VEHICLE_CONFIGS[type];
    const newVehicleHalfW = newVehicleCfg.width / 2;

    // Chỉ check xe trong vùng gần điểm spawn
    // Mở rộng zone đủ để cover xe bus (width 200) đang di chuyển
    const SPAWN_CHECK_ZONE = 800;

    const safeLanes: number[] = [];

    for (let l = 0; l < LANE_COUNT; l++) {
      const ly = this.lanePositions[l];

      const tooClose = this.activeVehicles.some((v) => {
        if (Math.abs(v.container.y - ly) >= 10) return false;
        if (v.container.x < x - SPAWN_CHECK_ZONE) return false;

        const existingType = v.vehicleType;
        const existingHalfW = VEHICLE_CONFIGS[existingType].width / 2;
        const buffer = Math.max(
          VEHICLE_CONFIGS[existingType].spawnBuffer,
          newVehicleCfg.spawnBuffer
        );
        const minDist = existingHalfW + newVehicleHalfW + buffer;
        const actualDist = Math.abs(v.container.x - x);
        return actualDist < minDist;
      });
      
      let collidesWithItem = false;
      if (!this.hasPackage && this.package?.active && Math.abs(this.package.container.y - ly) < 10) {
         if (Math.abs(this.package.container.x - x) < 200) collidesWithItem = true;
      }
      if (this.hasPackage && this.deliveryPoint?.active && Math.abs(this.deliveryPoint.container.y - ly) < 10) {
         if (Math.abs(this.deliveryPoint.container.x - x) < 200) collidesWithItem = true;
      }

      if (!tooClose && !collidesWithItem) safeLanes.push(l);
    }

    // Không có lane an toàn → bỏ qua lần spawn này
    if (safeLanes.length === 0) {
      return;
    }

    // Giới hạn tối đa xe cùng làn spawn liên tiếp
    // Ưu tiên lane ít xe nhất để phân bổ đều
    const laneVehicleCounts = safeLanes.map((l) => ({
      lane: l,
      count: this.activeVehicles.filter(
        (v) => Math.abs(v.container.y - this.lanePositions[l]) < 10
      ).length,
    }));
    laneVehicleCounts.sort((a, b) => a.count - b.count);
    const lane = laneVehicleCounts[0].lane;
    const y = this.lanePositions[lane];

    const variance = 1 + (Math.random() * 2 - 1) * speedVariance;
    void variance;

    const vehicle = this.vehiclePool.get();
    vehicle.init(x, y, 0, type);
    this.activeVehicles.push(vehicle);

    if (type === VehicleType.BUS) {
      this.vehiclesLeftInWave = 0;
    }
  }
  private _pickVehicleType(weights: { car: number; motorbike: number; bus: number }): VehicleType {
    const total = weights.car + weights.motorbike + weights.bus;
    const roll = Math.random() * total;
    if (roll < weights.car) return VehicleType.CAR;
    if (roll < weights.car + weights.motorbike) return VehicleType.MOTORBIKE;
    return VehicleType.BUS;
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