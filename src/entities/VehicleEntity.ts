import { Container, Sprite, Texture } from "pixi.js";
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "../core/constants";
import { MovementComponent } from "../components/MovementComponent";
import { CollisionComponent } from "../components/CollisionComponent";

export const VehicleType = {
  CAR: "car",
  MOTORBIKE: "motorbike",
  BUS: "bus",
} as const;

export type VehicleType = typeof VehicleType[keyof typeof VehicleType];

interface VehicleConfig {
  assetKey: string;
  width: number;
  height: number;
  collisionW: number;
  collisionH: number;
  speedFactor: number;
  flipX?: boolean;
  spawnBuffer: number;
  smokeOffset: number;
  smokeOffsetY?: number;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  [VehicleType.CAR]: {
    assetKey: "/assets/vehicle_car.png",
    width: PLAYER_WIDTH * 1.5 * 2.5,     
    height: PLAYER_HEIGHT * 1.5 * 2.5, 
    collisionW: 65,
    collisionH: 32,
    speedFactor: 1.0,
    spawnBuffer: 30,
    smokeOffset: 90,
  },
  [VehicleType.MOTORBIKE]: {
    assetKey: "/assets/vehicle_motorbike.png",
    width: PLAYER_WIDTH * 1.5 * 2,     
    height: PLAYER_HEIGHT * 1.5 * 2, 
    collisionW: PLAYER_WIDTH,       
    collisionH: PLAYER_HEIGHT,   
    speedFactor: 1.0,
    flipX: true,
    spawnBuffer: 30,
    smokeOffset: 40,
    smokeOffsetY: 15,
  },
  [VehicleType.BUS]: {
    assetKey: "/assets/vehicle_bus.png",
    width: PLAYER_WIDTH * 1.5 * 5,     
    height: PLAYER_HEIGHT * 1.5 * 5,  
    collisionW: 188, 
    collisionH: 78,
    speedFactor: 1.0,
    spawnBuffer: 60,
    smokeOffset: 150,
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
  private movement: MovementComponent;
  collision: CollisionComponent;
  speed: number = 0;
  private speedFactor: number = 1.0;

  constructor() {
    this.container = new Container();
    this.container.visible = false;
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.movement = new MovementComponent(0, 0);
    this.collision = new CollisionComponent(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT * 1.5);
    this.container.addChild(this.sprite);
  }

  init(x: number, y: number, speed: number, type: VehicleType = VehicleType.CAR): void {
    this.active = true;
    this.container.visible = true;
    this.vehicleType = type;
    const cfg = VEHICLE_CONFIGS[type];
    this.speedFactor = cfg.speedFactor;

    // Load đúng texture theo loại xe
    this.sprite.texture = Texture.from(cfg.assetKey);
    this.sprite.width = cfg.width;
    this.sprite.height = cfg.height;
    // Flip ngang nếu config yêu cầu (ví dụ: xe máy đi ngược chiều)
    this.sprite.scale.x = cfg.flipX ? -Math.abs(this.sprite.scale.x) : Math.abs(this.sprite.scale.x); // ← THÊM

    this.container.x = x;
    this.container.y = y;
    this.movement.speedY = speed;
    this.speed = speed;

    this.collision.updateBounds(
      x - cfg.collisionW / 2,
      y - cfg.collisionH / 2,
      cfg.collisionW,
      cfg.collisionH
    );

  }

  update(deltaTime: number, currentSpeed?: number): void {
  if (!this.active) return;
  const baseSpeed = currentSpeed !== undefined ? currentSpeed : this.speed;
  const s = baseSpeed * this.speedFactor;
  this.container.x += s * deltaTime;

  const cfg = VEHICLE_CONFIGS[this.vehicleType];
  this.collision.updateBounds(
    this.container.x - cfg.collisionW / 2,
    this.container.y - cfg.collisionH / 2,
    cfg.collisionW,
    cfg.collisionH
  );
}

  reset(x: number = 0, y: number = 0, speed: number = 0): void {
    this.active = false;
    this.container.visible = false;
    this.container.x = x;
    this.container.y = y;
    this.speed = speed;
  }
}