import { Application, Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";

export class GameOverScene {
  container: Container;
  private _app: Application;

  constructor(app: Application) {
    this._app = app;
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();

    // Background overlay
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x000000);
    bg.alpha = 0.8;
    this.container.addChild(bg);
  }

  update(_deltaTime: number): void {
    // Static scene
  }

  destroy(): void {
    this.container.removeChildren();
  }
}