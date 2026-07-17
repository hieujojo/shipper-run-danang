import { Application, Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT } from "../core/constants";
import { PlayerEntity } from "../entities/PlayerEntity";

export class GameplayScene {
  container: Container;
  private player!: PlayerEntity;

  constructor(_app: Application) {
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.container.addChild(bg);

    // Road background
    const road = new Graphics();
    road.rect(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT);
    road.fill(0x2d2d2d);
    this.container.addChild(road);

    // Lane dividers
    const laneWidth = (CANVAS_WIDTH * 0.6) / LANE_COUNT;
    for (let i = 1; i < LANE_COUNT; i++) {
      const divider = new Graphics();
      const x = CANVAS_WIDTH * 0.2 + laneWidth * i;
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        divider.rect(x - 2, y, 4, 20);
      }
      divider.fill(0xffffff);
      divider.alpha = 0.3;
      this.container.addChild(divider);
    }

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