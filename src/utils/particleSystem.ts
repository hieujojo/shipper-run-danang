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

  emitSpeedTrail(x: number, y: number, speedMultiplier: number, isVehicle: boolean = false, xOffset: number = 30, yOffset: number = 0): void {
    if (speedMultiplier <= 1.1) return;
    
    // Mỗi khung hình chỉ tạo 1 hạt khói (nhỏ và ít)
    const count = 1;
    for (let i = 0; i < count; i++) {
      const size = 5 + Math.random() * 5; // Kích thước nhỏ lại để không bị dính cục
      const gfx = new Graphics();
      gfx.circle(0, 0, size);
      gfx.fill(0xcccccc);
      
      const dir = isVehicle ? 1 : -1;
      gfx.x = x + dir * (xOffset + Math.random() * 10);
      gfx.y = y + yOffset + (Math.random() - 0.5) * 12;
      gfx.alpha = 0.45 + Math.random() * 0.2;
      this.container.addChild(gfx);
      this.particles.push({
        gfx,
        vx: dir * (2 + Math.random() * 3), // drift theo chiều ngược lại
        vy: (Math.random() - 0.5) * 0.8,
        life: 6 + Math.random() * 4,
        maxLife: 10,
        color: 0xcccccc,
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