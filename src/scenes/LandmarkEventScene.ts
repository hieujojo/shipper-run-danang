import { Container, Sprite, Texture, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, ROAD_TOP, ROAD_BOTTOM } from "../core/constants";
import { DragonEntity, type DragonBreath } from "../entities/DragonEntity";
import { EffectsManager } from "../utils/effectsManager";

export interface LandmarkEventConfig {
  assetPath: string;
  width?: number;
  height?: number;
  scaleMultiplier?: number;
  yOffsetRatio?: number;
  breathEffect?: "fire" | "water" | null;
  flipX?: boolean;
  seamlessTile?: "mirror" | "repeat";
}

export class LandmarkEventScene {
  container: Container;
  private dragon!: DragonEntity;
  private topContainer!: Container;
  private bottomContainer!: Container;
  private bridgeContainer!: Container;
  private maskGraphics!: Graphics;
  private effects: EffectsManager;
  private scaledW: number = CANVAS_WIDTH;
  private loopWidth: number = CANVAS_WIDTH;
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
      yOffsetRatio = 0.25,
      breathEffect = null,
    } = cfg;
    
    const tex = Texture.from(assetPath);
    // Tạm thời coi ảnh gốc của các cầu đều là 1536 x 1024 nếu chưa load xong.
    // Điều này tránh việc chia cho tex.width = 1 (khi chưa load) gây scale cực lớn
    const baseW = tex.width > 1 ? tex.width : 1536;
    const baseH = tex.height > 1 ? tex.height : 1024;

    let scaledW = 0;
    let scaledH = 0;
    
    if (cfg.width && cfg.height) {
      scaledW = cfg.width;
      scaledH = cfg.height;
    } else if (cfg.width) {
      scaledW = cfg.width;
      scaledH = baseH * (cfg.width / baseW);
    } else if (cfg.height) {
      scaledH = cfg.height;
      scaledW = baseW * (cfg.height / baseH);
    } else {
      const uniformScale = (CANVAS_WIDTH / baseW) * (cfg.scaleMultiplier || 1);
      scaledW = baseW * uniformScale;
      scaledH = baseH * uniformScale;
    }
    this.scaledW = scaledW;
    
    const targetScaleX = scaledW / baseW;
    const targetScaleY = scaledH / baseH;

    console.log("LandmarkEventScene Config:", cfg);
    console.log("Texture state:", { width: tex.width, height: tex.height, baseW, baseH });
    console.log("Scaled dimensions:", { scaledW, scaledH, targetScaleX, targetScaleY });

    this.bridgeContainer = new Container();
    this.container.addChild(this.bridgeContainer);

    this.maskGraphics = new Graphics();
    this.maskGraphics.rect(0, ROAD_TOP, CANVAS_WIDTH, ROAD_BOTTOM - ROAD_TOP);
    this.maskGraphics.fill(0xffffff);
    this.bridgeContainer.addChild(this.maskGraphics);
    this.bridgeContainer.mask = this.maskGraphics;

    this.topContainer = new Container();
    this.topContainer.y = -scaledH * (cfg.yOffsetRatio ?? 0.25);
    this.bridgeContainer.addChild(this.topContainer);
    
    this.loopWidth = (cfg.seamlessTile === "mirror") ? this.scaledW * 2 : this.scaledW;
    const spriteCount = Math.ceil((CANVAS_WIDTH + this.loopWidth) / this.scaledW) + 1;

    for (let i = -1; i < spriteCount; i++) {
      const s = new Sprite(tex);
      s.anchor.set(0.5, 0);
      s.scale.set(targetScaleX, targetScaleY);
      if (cfg.flipX) s.scale.x *= -1;
      if (cfg.seamlessTile === "mirror" && Math.abs(i) % 2 === 1) {
        s.scale.x *= -1;
      }
      s.x = i * this.scaledW + this.scaledW / 2;
      this.topContainer.addChild(s);
    }

    // Dải dưới — flip Y
    this.bottomContainer = new Container();
    this.bottomContainer.y = CANVAS_HEIGHT + scaledH * yOffsetRatio;
    this.bridgeContainer.addChild(this.bottomContainer);

    for (let i = -1; i < spriteCount; i++) {
      const s = new Sprite(tex);
      s.anchor.set(0.5, 1);
      s.scale.set(targetScaleX, -targetScaleY); // Lật ngược y
      if (cfg.flipX) s.scale.x *= -1;
      if (cfg.seamlessTile === "mirror" && Math.abs(i) % 2 === 1) {
        s.scale.x *= -1;
      }
      s.x = i * this.scaledW + this.scaledW / 2;
      this.bottomContainer.addChild(s);
    }

    // Dragon logic — chỉ dùng khi có breathEffect
    if (breathEffect) {
      this.dragon = new DragonEntity();
      // Dời vị trí phun lửa sang trái nếu lật ảnh
      const dragonX = cfg.flipX ? CANVAS_WIDTH * 0.25 : CANVAS_WIDTH * 0.75;
      this.dragon.init(dragonX, CANVAS_HEIGHT * 0.09);
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
    this.topContainer.x = parallax % this.loopWidth;
    this.bottomContainer.x = parallax % this.loopWidth;
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
    
    if (this.bridgeContainer) {
      this.bridgeContainer.mask = null;
    }
    this.maskGraphics?.destroy();
    
    this.container.removeChildren();
  }
}