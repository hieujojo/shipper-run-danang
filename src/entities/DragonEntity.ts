import { Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";

export type DragonBreath = "fire" | "water";

export class DragonEntity {
  container: Container;
  private body: Graphics;
  private breathContainer: Container;
  breathType: DragonBreath = "fire";
  isBreathing: boolean = false;
  private breathTimer: number = 0;
  private readonly BREATH_INTERVAL = 180; // frames
  private readonly BREATH_DURATION = 60;  // frames

  onBreathStart: ((type: DragonBreath) => void) | null = null;
  onBreathEnd: (() => void) | null = null;

  constructor() {
    this.container = new Container();
    this.body = new Graphics();
    this.breathContainer = new Container();
    this.container.addChild(this.body);
    this.container.addChild(this.breathContainer);
  }

  init(): void {
    this.container.x = CANVAS_WIDTH - 200; // Đặt rồng bên phải màn hình
    this.container.y = CANVAS_HEIGHT / 2; // Giữa màn hình theo trục Y
    this.breathType = Math.random() > 0.5 ? "fire" : "water";
    this.drawDragon();
  }

  private drawDragon(): void {
    this.body.clear();

    // Thân rồng
    this.body.ellipse(0, 0, 60, 25);
    this.body.fill(0x27ae60);

    // Đầu rồng (quay trái)
    this.body.ellipse(-50, -5, 25, 18);
    this.body.fill(0x2ecc71);

    // Mắt
    this.body.circle(-60, -10, 5);
    this.body.fill(0xff0000);
    this.body.circle(-62, -10, 2);
    this.body.fill(0xffffff);

    // Sừng
    this.body.moveTo(-45, -18);
    this.body.lineTo(-40, -35);
    this.body.lineTo(-50, -20);
    this.body.fill(0xf39c12);

    // Cánh trái
    this.body.moveTo(10, -5);
    this.body.lineTo(50, -40);
    this.body.lineTo(20, -5);
    this.body.fill(0x1a8a45);

    // Cánh phải
    this.body.moveTo(10, 5);
    this.body.lineTo(50, 40);
    this.body.lineTo(20, 5);
    this.body.fill(0x1a8a45);

    // Đuôi (bên phải)
    this.body.moveTo(60, 0);
    this.body.lineTo(90, -15);
    this.body.lineTo(80, 5);
    this.body.fill(0x27ae60);
  }

  private drawBreath(): void {
    this.breathContainer.removeChildren();
    const color = this.breathType === "fire" ? 0xe74c3c : 0x3498db;
    const secondColor = this.breathType === "fire" ? 0xf39c12 : 0x85c1e9;

    // Hạt nhỏ phun sang trái
    for (let i = 0; i < 8; i++) {
      const g = new Graphics();
      const size = 15 + i * 12;
      const x = -70 - i * 20; // Phun sang trái
      const y = -5 + (Math.random() - 0.5) * 20;
      g.circle(x, y, size / 2);
      g.fill(i % 2 === 0 ? color : secondColor);
      g.alpha = 1 - i * 0.1;
      this.breathContainer.addChild(g);
    }

    // Efect lan tỏa hết màn hình sang trái
    const beam = new Graphics();
    beam.rect(-CANVAS_WIDTH, -50, CANVAS_WIDTH, 100);
    beam.fill(this.breathType === "fire" ? 0xe74c3c : 0x3498db);
    beam.alpha = 0.15;
    this.breathContainer.addChild(beam);
  }

  update(deltaTime: number): void {
    this.breathTimer += deltaTime;

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

    // Bay lên xuống nhẹ
    this.container.y = (CANVAS_HEIGHT / 2) + Math.sin(Date.now() / 500) * 20;
  }

  destroy(): void {
    this.container.removeChildren();
  }
}