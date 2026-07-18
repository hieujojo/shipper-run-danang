import { Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT } from "../core/constants";
import { DragonEntity, type DragonBreath } from "../entities/DragonEntity";

export class DragonEventScene {
  container: Container;
  private dragon!: DragonEntity;
  private overlay!: Graphics;
  active: boolean = false;

  onSpeedChange: ((multiplier: number) => void) | null = null;
  onVisibilityChange: ((alpha: number) => void) | null = null;

  constructor() {
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();
    this.active = true;

    // Cầu Rồng background
    const bridge = new Graphics();
    // Mặt cầu
    bridge.rect(CANVAS_WIDTH * 0.15, 0, CANVAS_WIDTH * 0.7, CANVAS_HEIGHT);
    bridge.fill(0x5d6d7e);
    // Lan can trái
    bridge.rect(CANVAS_WIDTH * 0.15, 0, 15, CANVAS_HEIGHT);
    bridge.fill(0x85929e);
    // Lan can phải
    bridge.rect(CANVAS_WIDTH * 0.75, 0, 15, CANVAS_HEIGHT);
    bridge.fill(0x85929e);
    // Đèn cầu
    for (let y = 0; y < CANVAS_HEIGHT; y += 80) {
      bridge.circle(CANVAS_WIDTH * 0.15 + 7, y, 5);
      bridge.fill(0xf1c40f);
      bridge.circle(CANVAS_WIDTH * 0.75 + 7, y, 5);
      bridge.fill(0xf1c40f);
    }
    // Vạch làn
    const laneWidth = (CANVAS_WIDTH * 0.6) / LANE_COUNT;
    for (let i = 1; i < LANE_COUNT; i++) {
      const x = CANVAS_WIDTH * 0.2 + laneWidth * i;
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        bridge.rect(x - 2, y, 4, 20);
        bridge.fill(0xffffff);
      }
    }
    this.container.addChild(bridge);

    // Overlay hiệu ứng lửa/nước
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.overlay.fill(0x000000);
    this.overlay.alpha = 0;
    this.container.addChild(this.overlay);

    // Dragon
    this.dragon = new DragonEntity();
    this.dragon.init();
    this.dragon.onBreathStart = (type: DragonBreath) => this.handleBreathStart(type);
    this.dragon.onBreathEnd = () => this.handleBreathEnd();
    this.container.addChild(this.dragon.container);
  }

  private handleBreathStart(type: DragonBreath): void {
    if (type === "fire") {
      this.overlay.clear();
      this.overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.overlay.fill(0xe74c3c);
      this.overlay.alpha = 0.3;
      this.onSpeedChange?.(0.5); // Lửa → giảm tốc
    } else {
      this.overlay.clear();
      this.overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.overlay.fill(0x3498db);
      this.overlay.alpha = 0.25;
      this.onSpeedChange?.(1.8); // Nước → tăng tốc
    }
    this.onVisibilityChange?.(0.4);
  }

  private handleBreathEnd(): void {
    this.overlay.alpha = 0;
    this.onSpeedChange?.(1.0);
    this.onVisibilityChange?.(1.0);
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.dragon?.update(deltaTime);
  }

  destroy(): void {
    this.active = false;
    this.dragon?.destroy();
    this.container.removeChildren();
  }
}