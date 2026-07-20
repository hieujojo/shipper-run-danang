import { Container, BlurFilter, ColorMatrixFilter } from "pixi.js";

interface HitEffect {
  container: Container;
  timer: number;
  maxTimer: number;
}

export class EffectsManager {
  private hitEffects: HitEffect[] = [];
  private dragonColorMatrix: ColorMatrixFilter | null = null;
  private dragonTarget: Container | null = null;

  applyHitEffect(container: Container, durationFrames: number = 120): void {
    this.clearHitEffect(container);
    const blur = new BlurFilter({ strength: 2, quality: 2 });
    container.filters = [blur];
    this.hitEffects.push({ container, timer: durationFrames, maxTimer: durationFrames });
  }

  clearHitEffect(container: Container): void {
    const idx = this.hitEffects.findIndex((e) => e.container === container);
    if (idx !== -1) this.hitEffects.splice(idx, 1);
    container.filters = [];
    container.alpha = 1;
  }

  applyFireTint(container: Container): void {
    this.dragonTarget = container;
    if (!this.dragonColorMatrix) this.dragonColorMatrix = new ColorMatrixFilter();
    this.dragonColorMatrix.matrix = [
      1.5, 0, 0, 0, 0.05,
      0, 0.7, 0, 0, 0,
      0, 0, 0.4, 0, 0,
      0, 0, 0, 1, 0,
    ];
    container.filters = [this.dragonColorMatrix];
  }

  applyWaterTint(container: Container): void {
    this.dragonTarget = container;
    if (!this.dragonColorMatrix) this.dragonColorMatrix = new ColorMatrixFilter();
    this.dragonColorMatrix.matrix = [
      0.6, 0, 0, 0, 0,
      0, 0.8, 0, 0, 0,
      0, 0, 1.6, 0, 0.05,
      0, 0, 0, 1, 0,
    ];
    container.filters = [this.dragonColorMatrix];
  }

  clearDragonEffect(container: Container): void {
    container.filters = [];
    this.dragonColorMatrix = null;
    this.dragonTarget = null;
  }

  update(deltaTime: number): void {
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const effect = this.hitEffects[i];
      effect.timer -= deltaTime;
      const blink = Math.sin((effect.maxTimer - effect.timer) * 0.4);
      effect.container.alpha = blink > 0 ? 1.0 : 0.25;
      const ratio = effect.timer / effect.maxTimer;
      const filterList = effect.container.filters as BlurFilter[];
      if (filterList && filterList[0] instanceof BlurFilter) {
        filterList[0].strength = 2 * ratio;
      }
      if (effect.timer <= 0) this.clearHitEffect(effect.container);
    }
  }

  isInvincible(container: Container): boolean {
    return this.hitEffects.some((e) => e.container === container);
  }

  destroy(): void {
    for (const e of this.hitEffects) { e.container.filters = []; e.container.alpha = 1; }
    this.hitEffects = [];
    if (this.dragonTarget) { this.dragonTarget.filters = []; this.dragonTarget = null; }
    this.dragonColorMatrix = null;
  }
}
