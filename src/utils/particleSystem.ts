import { Container, Graphics } from "pixi.js";

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  container: Container;

  constructor() {
    this.container = new Container();
  }

  emit(x: number, y: number, color: number = 0xe74c3c, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const gfx = new Graphics();
      const size = 3 + Math.random() * 4;
      gfx.rect(-size / 2, -size / 2, size, size);
      gfx.fill(color);
      gfx.x = x;
      gfx.y = y;
      this.container.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
      });
    }
  }

  emitCrash(x: number, y: number): void {
    // Mảnh vỡ đỏ
    this.emit(x, y, 0xe74c3c, 10);
    // Tia lửa vàng
    this.emit(x, y, 0xf39c12, 8);
    // Khói trắng
    this.emit(x, y, 0xcccccc, 6);
  }

  emitPickup(x: number, y: number): void {
    // Hiệu ứng nhặt hàng — xanh lá
    this.emit(x, y, 0x2ecc71, 8);
    this.emit(x, y, 0xf39c12, 6);
  }

  emitDelivery(x: number, y: number): void {
    // Hiệu ứng giao hàng thành công — vàng rực
    this.emit(x, y, 0xf1c40f, 15);
    this.emit(x, y, 0x2ecc71, 10);
  }

  emitSpeedTrail(x: number, y: number, speedMultiplier: number): void {
    if (speedMultiplier < 1.0) return;
    // Khói nhẹ phía sau xe, count tăng theo tốc độ
    const count = Math.min(3, Math.floor(speedMultiplier));
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 0.5; // Hướng sang trái
      const speed = 0.5 + Math.random() * 1.5;
      const gfx = new Graphics();
      const size = 2 + Math.random() * 3;
      gfx.circle(0, 0, size);
      gfx.fill(0xbbbbbb); // Xám khói
      gfx.x = x - 20 + (Math.random() - 0.5) * 10;
      gfx.y = y + (Math.random() - 0.5) * 8;
      this.container.addChild(gfx);
      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.3,
        life: 10 + Math.random() * 8,
        maxLife: 18,
        color: 0xbbbbbb,
      });
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;
      p.gfx.x += p.vx * deltaTime;
      p.gfx.y += p.vy * deltaTime;
      p.vy += 0.2 * deltaTime; // gravity
      p.gfx.alpha = Math.max(0, p.life / p.maxLife);
      p.gfx.scale.set(p.life / p.maxLife);

      if (p.life <= 0) {
        this.container.removeChild(p.gfx);
        this.particles.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.particles = [];
    this.container.removeChildren();
  }
}