import { Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";

export class StartScene {
  container: Container;
  onStart: (() => void) | null = null;

  constructor(_app: unknown) {
    void _app;
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill(0x1a1a2e);
    this.container.addChild(bg);

    const road = new Graphics();
    road.rect(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT);
    road.fill(0x2d2d2d);
    this.container.addChild(road);

    // Start button area (React sẽ handle UI, đây chỉ là fallback)
    window.addEventListener("keydown", this.onKeyDown.bind(this), { once: true });
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code === "Space" || e.code === "Enter") {
      this.onStart?.();
    }
  }

  update(_deltaTime: number): void {
    void _deltaTime;
  }

  destroy(): void {
    this.container.removeChildren();
  }
}