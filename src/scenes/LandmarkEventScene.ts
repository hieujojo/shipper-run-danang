import { Container, Sprite, Texture } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/constants";
import { DragonEntity, type DragonBreath } from "../entities/DragonEntity";
import { EffectsManager } from "../utils/effectsManager";

export interface LandmarkEventConfig {
  assetPath: string;
  scaleMultiplier?: number;
  yOffsetRatio?: number;
  breathEffect?: "fire" | "water" | null;
}

export class LandmarkEventScene {
  container: Container;
  private dragon!: DragonEntity;
  private spriteTop!: Sprite;
  private spriteBottom!: Sprite;
  private effects: EffectsManager;
  active: boolean = false;

  onBreathEffect: ((type: DragonBreath | null) => void) | null = null;

  constructor() {
    this.container = new Container();
    this.effects = new EffectsManager();
  }

  init(cfg: LandmarkEventConfig): void {
    this.container.removeChildren();
    this.active = true;

    const {
      assetPath,
      scaleMultiplier = 1.3,
      yOffsetRatio = 0.25,
      breathEffect = null,
    } = cfg;

    const tex = Texture.from(assetPath);
    const scaleX = CANVAS_WIDTH / tex.width;
    const scaledH = tex.height * scaleX * scaleMultiplier;

    // Dải trên
    this.spriteTop = new Sprite(tex);
    this.spriteTop.width = CANVAS_WIDTH;
    this.spriteTop.height = scaledH;
    this.spriteTop.x = 0;
    this.spriteTop.y = -scaledH * yOffsetRatio;
    this.container.addChild(this.spriteTop);

    // Dải dưới — flip Y
    this.spriteBottom = new Sprite(tex);
    this.spriteBottom.width = CANVAS_WIDTH;
    this.spriteBottom.height = scaledH;
    this.spriteBottom.anchor.set(0, 1);
    this.spriteBottom.scale.y = -1;
    this.spriteBottom.x = 0;
    this.spriteBottom.y = CANVAS_HEIGHT + scaledH * yOffsetRatio;
    this.container.addChild(this.spriteBottom);

    // Dragon logic — chỉ dùng khi có breathEffect
    if (breathEffect) {
      this.dragon = new DragonEntity();
      this.dragon.init(CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.09);
      this.dragon.container.visible = false;
      this.dragon.onBreathStart = (type: DragonBreath) => this.handleBreathStart(type);
      this.dragon.onBreathEnd = () => this.handleBreathEnd();
      this.container.addChild(this.dragon.container);
    }
  }

  private handleBreathStart(type: DragonBreath): void {
    if (type === "fire") {
      this.effects.applyFireTint(this.container);
    } else {
      this.effects.applyWaterTint(this.container);
    }
    this.onBreathEffect?.(type);
  }

  private handleBreathEnd(): void {
    this.effects.clearDragonEffect(this.container);
    this.onBreathEffect?.(null);
  }

  scroll(roadOffset: number): void {
    const parallax = roadOffset * 0.4;
    this.spriteTop.x = parallax % CANVAS_WIDTH;
    this.spriteBottom.x = parallax % CANVAS_WIDTH;
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.dragon?.update(deltaTime);
    this.effects.update(deltaTime);
  }

  destroy(): void {
    this.active = false;
    this.effects.clearDragonEffect(this.container);
    this.effects.destroy();
    this.dragon?.destroy();
    this.container.removeChildren();
  }
}