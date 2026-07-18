import { Container, Graphics } from "pixi.js";
import { audioManager } from "../utils/audioManager";
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

    // Vỉa hè trên
    const sidewalkTop = new Graphics();
    sidewalkTop.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkTop.fill(0x3d3d5c);
    this.container.addChild(sidewalkTop);

    // Vỉa hè dưới
    const sidewalkBottom = new Graphics();
    sidewalkBottom.rect(0, CANVAS_HEIGHT * 0.8, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2);
    sidewalkBottom.fill(0x3d3d5c);
    this.container.addChild(sidewalkBottom);

    // Road (phần giữa)
    const road = new Graphics();
    road.rect(0, CANVAS_HEIGHT * 0.2, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
    road.fill(0x2d2d2d);
    this.container.addChild(road);
    audioManager.playBGM();

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