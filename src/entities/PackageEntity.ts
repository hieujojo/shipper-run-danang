import { Container, Graphics } from "pixi.js";
import { CollisionComponent } from "../components/CollisionComponent";

const PACKAGE_SIZE = 20;

export class PackageEntity {
  container: Container;
  collision: CollisionComponent;
  active: boolean = false;

  constructor() {
    this.container = new Container();
    this.collision = new CollisionComponent(0, 0, PACKAGE_SIZE, PACKAGE_SIZE);
  }

  init(x: number, y: number): void {
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;

    const g = new Graphics();
    // Hộp hàng
    g.rect(-PACKAGE_SIZE / 2, -PACKAGE_SIZE / 2, PACKAGE_SIZE, PACKAGE_SIZE);
    g.fill(0xf39c12);
    // Dây buộc ngang
    g.rect(-PACKAGE_SIZE / 2, -2, PACKAGE_SIZE, 4);
    g.fill(0xe74c3c);
    // Dây buộc dọc
    g.rect(-2, -PACKAGE_SIZE / 2, 4, PACKAGE_SIZE);
    g.fill(0xe74c3c);

    this.container.addChild(g);
    this.syncBounds();
  }

  syncBounds(): void {
    this.collision.bounds.x = this.container.x - PACKAGE_SIZE / 2;
    this.collision.bounds.y = this.container.y - PACKAGE_SIZE / 2;
  }

  reset(): void {
    this.active = false;
    this.container.visible = false;
    this.container.removeChildren();
  }
}