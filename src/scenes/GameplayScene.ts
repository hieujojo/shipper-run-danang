import { Application, Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";

export class GameplayScene {
  container: Container;
  private app: Application;
  private player!: PlayerEntity;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.container.addChild(bg);

    // Road
    const road = new Graphics();
    road.rect(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT);
    road.fill(0x2d2d2d);
    this.container.addChild(road);

    // Player
    this.player = new PlayerEntity();
    this.player.init(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8);
    this.container.addChild(this.player.container);
  }

  update(deltaTime: number): void {
    this.player?.update(deltaTime);
  }

  destroy(): void {
    this.player?.destroy();
    this.container.removeChildren();
  }
}