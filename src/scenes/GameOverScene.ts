import { Container, Graphics } from "pixi.js";
import { audioManager } from "../utils/audioManager";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";

export class GameOverScene {
  container: Container;
  onRestart: (() => void) | null = null;

  constructor(_app: unknown) {
    void _app;
    this.container = new Container();
  }

  init(): void {
    this.container.removeChildren();

    // Dark overlay
    const overlay = new Graphics();
    overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    overlay.fill(0x000000);
    overlay.alpha = 0.8;
    this.container.addChild(overlay);
    
    audioManager.playBGM();
    audioManager.stopEngine();
    
    // Restart on Space
    window.addEventListener("keydown", this.onKeyDown.bind(this), { once: true });
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code === "Space" || e.code === "Enter") {
      this.onRestart?.();
    }
  }

  update(_deltaTime: number): void {
    void _deltaTime;
  }

  destroy(): void {
    this.container.removeChildren();
  }
}