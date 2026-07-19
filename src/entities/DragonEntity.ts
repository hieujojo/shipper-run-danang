import { Container, Graphics } from "pixi.js";

export type DragonBreath = "fire" | "water";

export class DragonEntity {
  container: Container;
  private body: Graphics;
  private breathContainer: Container;
  breathType: DragonBreath = "fire";
  isBreathing: boolean = false;
  private breathTimer: number = 0;
  private scaleTimer: number = 0;
  private readonly BREATH_INTERVAL = 180;
  private readonly BREATH_DURATION = 90;

  onBreathStart: ((type: DragonBreath) => void) | null = null;
  onBreathEnd: (() => void) | null = null;

  constructor() {
    this.container = new Container();
    this.body = new Graphics();
    this.breathContainer = new Container();
    this.container.addChild(this.body);
    this.container.addChild(this.breathContainer);
  }

  init(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
    this.breathType = Math.random() > 0.5 ? "fire" : "water";
    this.drawDragon();
  }

  private drawDragon(): void {
    this.body.clear();
    // Thân
    this.body.ellipse(0, 0, 50, 20);
    this.body.fill(0x27ae60);
    // Đầu (quay trái — hướng vào đường)
    this.body.ellipse(-42, -4, 20, 14);
    this.body.fill(0x2ecc71);
    // Mắt
    this.body.circle(-52, -8, 4);
    this.body.fill(0xff0000);
    this.body.circle(-54, -8, 1.5);
    this.body.fill(0xffffff);
    // Sừng
    this.body.moveTo(-38, -14);
    this.body.lineTo(-34, -28);
    this.body.lineTo(-42, -16);
    this.body.fill(0xf39c12);
    // Cánh
    this.body.moveTo(8, -4);
    this.body.lineTo(40, -32);
    this.body.lineTo(18, -4);
    this.body.fill(0x1a8a45);
    // Đuôi
    this.body.moveTo(50, 0);
    this.body.lineTo(72, -12);
    this.body.lineTo(65, 4);
    this.body.fill(0x27ae60);
  }

  private drawBreath(): void {
    this.breathContainer.removeChildren();
    const color = this.breathType === "fire" ? 0xe74c3c : 0x3498db;
    const color2 = this.breathType === "fire" ? 0xf39c12 : 0x85c1e9;
    // Tia phun xuống đường (hướng xuống dưới từ tòa nhà)
    for (let i = 0; i < 6; i++) {
      const g = new Graphics();
      const size = 10 + i * 8;
      const y = 20 + i * 18;
      const x = (Math.random() - 0.5) * 14;
      g.circle(x, y, size / 2);
      g.fill(i % 2 === 0 ? color : color2);
      g.alpha = 1 - i * 0.13;
      this.breathContainer.addChild(g);
    }
  }

  update(deltaTime: number): void {
    this.breathTimer += deltaTime;
    this.scaleTimer += deltaTime;

    // Pulsating scale — "thở"
    const pulse = 1 + Math.sin(this.scaleTimer * 0.08) * 0.02;
    this.container.scale.set(pulse);

    if (!this.isBreathing && this.breathTimer >= this.BREATH_INTERVAL) {
      this.isBreathing = true;
      this.breathTimer = 0;
      this.breathType = Math.random() > 0.5 ? "fire" : "water";
      this.drawBreath();
      this.onBreathStart?.(this.breathType);
    }

    if (this.isBreathing && this.breathTimer >= this.BREATH_DURATION) {
      this.isBreathing = false;
      this.breathTimer = 0;
      this.breathContainer.removeChildren();
      this.onBreathEnd?.();
    }
  }

  destroy(): void {
    this.container.removeChildren();
  }
}