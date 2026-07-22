import { Container, Sprite, Texture } from "pixi.js";
import { CollisionComponent } from "../components/CollisionComponent";

const PACKAGE_SIZE = 30;

export class PackageEntity {
  container: Container;
  collision: CollisionComponent;
  active: boolean = false;

  private sprite: Sprite;

  constructor() {
    this.container = new Container();
    this.sprite = new Sprite(Texture.from("/assets/package_box.png"));
    this.sprite.anchor.set(0.5);
    this.sprite.width = PACKAGE_SIZE * 1.5;
    this.sprite.height = PACKAGE_SIZE * 1.5;
    
    this.collision = new CollisionComponent(0, 0, PACKAGE_SIZE, PACKAGE_SIZE);
    this.container.addChild(this.sprite);
  }

  init(x: number, y: number): void {
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;

    this.syncBounds();
  }

  syncBounds(): void {
    this.collision.bounds.x = this.container.x - PACKAGE_SIZE / 2;
    this.collision.bounds.y = this.container.y - PACKAGE_SIZE / 2;
  }

  reset(): void {
    this.active = false;
    this.container.visible = false;
  }
}