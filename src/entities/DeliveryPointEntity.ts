import { Container, Graphics } from "pixi.js";
import { CollisionComponent } from "../components/CollisionComponent";

const POINT_SIZE = 65;

export class DeliveryPointEntity {
  container: Container;
  collision: CollisionComponent;
  active: boolean = false;

  constructor() {
    this.container = new Container();
    this.collision = new CollisionComponent(0, 0, POINT_SIZE, POINT_SIZE);
  }

  init(x: number, y: number): void {
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;

    const g = new Graphics();
    // Vùng giao hàng (hình thoi nhấp nháy)
    g.rect(-POINT_SIZE / 2, -POINT_SIZE / 2, POINT_SIZE, POINT_SIZE);
    g.fill(0x2ecc71);
    g.alpha = 0.7;
    // Icon nhà
    g.rect(-10, -5, 20, 15);
    g.fill(0x27ae60);
    g.moveTo(0, -18);
    g.lineTo(-14, -5);
    g.lineTo(14, -5);
    g.closePath();
    g.fill(0x27ae60);

    this.container.addChild(g);
    this.syncBounds();
  }

  syncBounds(): void {
    this.collision.bounds.x = this.container.x - POINT_SIZE / 2;
    this.collision.bounds.y = this.container.y - POINT_SIZE / 2;
  }

  reset(): void {
    this.active = false;
    this.container.visible = false;
    this.container.removeChildren();
  }
}