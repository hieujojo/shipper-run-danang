import { Container, Sprite, Texture } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";
import { DragonEntity, type DragonBreath } from "../entities/DragonEntity";
import { EffectsManager } from "../utils/effectsManager";

export class DragonEventScene {
  container: Container;
  private dragon!: DragonEntity;
  private bridgeTop!: Sprite;
  private bridgeBottom!: Sprite;
  private effects: EffectsManager;
  private dragonPulseTimer: number = 0;
  active: boolean = false;

  onSpeedChange: ((multiplier: number) => void) | null = null;
  onBreathEffect: ((type: DragonBreath | null) => void) | null = null;

  constructor() {
    this.container = new Container();
    this.effects = new EffectsManager();
  }

  init(assetPath: string = "/assets/dragon_bridge.png"): void {
    this.container.removeChildren();
    this.active = true;

    const tex = Texture.from(assetPath);
    const imgW = tex.width;
    const imgH = tex.height;

    const scaleX = CANVAS_WIDTH / imgW;
    const scaledH = imgH * scaleX * 1.5;

    // Cầu Rồng trên
    this.bridgeTop = new Sprite(tex);
    this.bridgeTop.width = CANVAS_WIDTH;
    this.bridgeTop.height = scaledH;
    this.bridgeTop.x = 0;
    this.bridgeTop.y = -scaledH * 0.25;
    this.container.addChild(this.bridgeTop);

    // Cầu Rồng dưới — flip Y
    this.bridgeBottom = new Sprite(tex);
    this.bridgeBottom.width = CANVAS_WIDTH;
    this.bridgeBottom.height = scaledH;
    this.bridgeBottom.anchor.set(0, 1);
    this.bridgeBottom.scale.y = -1;
    this.bridgeBottom.width = CANVAS_WIDTH;
    this.bridgeBottom.x = 0;
    this.bridgeBottom.y = CANVAS_HEIGHT + scaledH * 0.45;
    this.container.addChild(this.bridgeBottom);

    // Dragon — ẩn Graphics, chỉ giữ logic breath
    this.dragon = new DragonEntity();
    this.dragon.init(CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.09);
    this.dragon.container.visible = false;
    this.dragon.onBreathStart = (type: DragonBreath) => this.handleBreathStart(type);
    this.dragon.onBreathEnd = () => this.handleBreathEnd();
    this.container.addChild(this.dragon.container);
  }

  private handleBreathStart(type: DragonBreath): void {
    if (type === "fire") {
      this.effects.applyFireTint(this.container);
      this.onSpeedChange?.(0.5);
    } else {
      this.effects.applyWaterTint(this.container);
      this.onSpeedChange?.(1.8);
    }
    this.onBreathEffect?.(type);
  }

  private handleBreathEnd(): void {
    this.effects.clearDragonEffect(this.container);
    this.onSpeedChange?.(1.0);
    this.onBreathEffect?.(null);
  }

  scroll(roadOffset: number): void {
    const parallax = roadOffset * 0.4;
    this.bridgeTop.x = parallax % CANVAS_WIDTH;
    this.bridgeBottom.x = parallax % CANVAS_WIDTH;
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.dragon?.update(deltaTime);
    this.effects.update(deltaTime);

    this.dragonPulseTimer += deltaTime * 0.05;
    const pulse = 1 + Math.sin(this.dragonPulseTimer) * 0.02;
    this.dragon.container.scale.set(pulse);
  }

  destroy(): void {
    this.active = false;
    this.effects.clearDragonEffect(this.container);
    this.effects.destroy();
    this.dragon?.destroy();
    this.container.removeChildren();
  }
}