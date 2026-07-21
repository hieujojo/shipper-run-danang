import { Container, Sprite, Texture, Graphics, BlurFilter } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "../core/constants";
import { MovementComponent } from "../components/MovementComponent";
import { CollisionComponent } from "../components/CollisionComponent";

export enum VehicleType {
  CAR = "car",
  MOTORBIKE = "motorbike",
  BUS = "bus",
}

interface VehicleConfig {
  assetKey: string;
  width: number;
  height: number;
  collisionW: number;
  collisionH: number;
  speedFactor: number; // Nhân với currentVehicleSpeed
}

const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  [VehicleType.CAR]: {
    assetKey: "/assets/vehicle_car.png",
    width: 75,
    height: 45,
    collisionW: 65,
    collisionH: 32,
    speedFactor: 1.0,
  },
  [VehicleType.MOTORBIKE]: {
    assetKey: "/assets/vehicle_motorbike.png",
    width: 48,
    height: 30,
    collisionW: 40,
    collisionH: 22,
    speedFactor: 1.3,
  },
  [VehicleType.BUS]: {
    assetKey: "/assets/vehicle_bus.png",
    width: 110,
    height: 52,
    collisionW: 100,
    collisionH: 42,
    speedFactor: 0.7,
  },
};

export interface IVehicleEntity {
  container: Container;
  active: boolean;
  vehicleType: VehicleType;
  init(x: number, y: number, speed: number, type?: VehicleType): void;
  update(deltaTime: number, currentSpeed?: number): void;
  reset(): void;
}

export class VehicleEntity implements IVehicleEntity {
  container: Container;
  active: boolean = false;
  vehicleType: VehicleType = VehicleType.CAR;

  private sprite: Sprite;
  private headlightLeft: Graphics;
  private headlightRight: Graphics;
  private headlightFilter: BlurFilter;
  private movement: MovementComponent;
  collision: CollisionComponent;
  speed: number = 0;
  private speedFactor: number = 1.0;

  constructor() {
    this.container = new Container();

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);

    // Headlight glow — tạo 1 lần, hiển thị khi active
    this.headlightFilter = new BlurFilter({ strength: 6, quality: 2 });
    this.headlightLeft = new Graphics();
    this.headlightRight = new Graphics();
    this.headlightLeft.filters = [this.headlightFilter];
    this.headlightRight.filters = [this.headlightFilter];

    this.movement = new MovementComponent(0, 0);
    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT * 1.5);

    this.container.addChild(this.sprite);
    this.container.addChild(this.headlightLeft);
    this.container.addChild(this.headlightRight);
  }

  init(x: number, y: number, speed: number, type: VehicleType = VehicleType.CAR): void {
    this.active = true;
    this.vehicleType = type;
    const cfg = VEHICLE_CONFIGS[type];
    this.speedFactor = cfg.speedFactor;

    // Load đúng texture theo loại xe
    this.sprite.texture = Texture.from(cfg.assetKey);
    this.sprite.width = cfg.width;
    this.sprite.height = cfg.height;

    this.container.x = x;
    this.container.y = y;
    this.movement.speedY = speed;
    this.speed = speed;

    this.collision.updateBounds(x, y, cfg.collisionW, cfg.collisionH);

    // Vẽ lại headlight theo kích thước xe
    this._drawHeadlights(cfg);
  }

  private _drawHeadlights(cfg: VehicleConfig): void {
    const isSmall = cfg.width < 60;
    const glowW = isSmall ? 6 : 8;
    const glowH = isSmall ? 4 : 5;
    const color = 0xffffaa;
    const alpha = 0.85;

    // Đèn phía trên thân xe (góc trên-trái so với sprite centre)
    this.headlightLeft.clear();
    this.headlightLeft.rect(0, 0, glowW, glowH);
    this.headlightLeft.fill({ color, alpha });
    this.headlightLeft.x = -cfg.width / 2 - glowW + 2;
    this.headlightLeft.y = -cfg.height / 4;

    // Đèn phía dưới
    this.headlightRight.clear();
    this.headlightRight.rect(0, 0, glowW, glowH);
    this.headlightRight.fill({ color, alpha });
    this.headlightRight.x = -cfg.width / 2 - glowW + 2;
    this.headlightRight.y = cfg.height / 4 - glowH;
  }

  update(deltaTime: number, currentSpeed?: number): void {
    if (!this.active) return;
    const baseSpeed = currentSpeed !== undefined ? currentSpeed : this.speed;
    const s = baseSpeed * this.speedFactor;
    this.container.x += s * deltaTime;

    // Nhún nhẹ theo trục Y cho cảm giác sống động
    this.sprite.y = Math.sin(Date.now() / 150 + this.container.x) * 1.5;

    const cfg = VEHICLE_CONFIGS[this.vehicleType];
    this.collision.updateBounds(this.container.x, this.container.y, cfg.collisionW, cfg.collisionH);
  }

  reset(x: number = 0, y: number = 0, speed: number = 0): void {
    this.active = false;
    this.container.x = x;
    this.container.y = y;
    this.speed = speed;
  }
}