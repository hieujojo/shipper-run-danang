import { Application } from "pixi.js";
import { GameStateManager, GameState } from "./GameState";
import { StartScene } from "../scenes/StartScene";
import { GameplayScene } from "../scenes/GameplayScene";
import { GameOverScene } from "../scenes/GameOverScene";
import levelData from "../data/levelData.json";

export class GameLoop {
  private app: Application;
  private stateManager: GameStateManager;
  private startScene: StartScene;
  private gameplayScene: GameplayScene;
  private gameOverScene: GameOverScene;
  private scoreTimer: number = 0;
  private score: number = 0;

  onStateChange: ((state: GameState) => void) | null = null;
  onScoreUpdate: ((score: number) => void) | null = null;
  onLevelChange: ((levelName: string) => void) | null = null;
  onPackageChange: ((hasPackage: boolean) => void) | null = null;
  onLivesChange: ((lives: number) => void) | null = null;
  onLandmarkEvent: ((active: boolean) => void) | null = null;
  private levelTimer: number = 0;
  private currentLevelIndex: number = 0;
  private readonly LEVEL_DURATION = 60 * 60; // 60 giây mỗi level
  constructor(app: Application) {
    this.app = app;
    this.stateManager = new GameStateManager();
    this.startScene = new StartScene(app);
    this.gameplayScene = new GameplayScene(app);
    this.gameOverScene = new GameOverScene(app);

    this.gameplayScene.onGameOver = () => this.transitionTo(GameState.GAME_OVER);
    this.gameplayScene.onLivesChange = (l: number) => this.onLivesChange?.(l);
    this.gameplayScene.onPackageChange = (val: boolean) => this.onPackageChange?.(val);
    this.gameplayScene.onScoreDelivery = (bonus: number) => {
      this.score += bonus;
      this.onScoreUpdate?.(this.score);
    };
    this.startScene.onStart = () => this.transitionTo(GameState.GAMEPLAY);
    this.gameOverScene.onRestart = () => this.transitionTo(GameState.GAMEPLAY);
  }

  start(): void {
    this.loadScene(GameState.START);
    this.app.ticker.add(this.update.bind(this));
  }

  private update(ticker: { deltaTime: number }): void {
    try {
      const state = this.stateManager.getState();

      switch (state) {
        case GameState.START:
          this.startScene.update(ticker.deltaTime);
          break;
        case GameState.GAMEPLAY:
          this.gameplayScene.update(ticker.deltaTime);
          // Score tăng theo thời gian
          this.scoreTimer++;
          if (this.scoreTimer >= 60) {
            this.scoreTimer = 0;
            this.score += 10;
            this.onScoreUpdate?.(this.score);
          }
         // Level progression
          this.levelTimer++;
          if (this.levelTimer >= this.LEVEL_DURATION) {
            this.levelTimer = 0;
            this.currentLevelIndex = (this.currentLevelIndex + 1) % levelData.levels.length;
            const level = levelData.levels[this.currentLevelIndex];
            this.onLevelChange?.(level.name);
            this.gameplayScene.setLevel(this.currentLevelIndex);
            this.onLandmarkEvent?.(level.isLandmarkEvent);
            this.gameplayScene.triggerLandmarkEvent(level.isLandmarkEvent);
          }
          break;
        case GameState.GAME_OVER:
          this.gameOverScene.update(ticker.deltaTime);
          break;
      }
    } catch (err: any) {
      console.error("Lỗi trong vòng lặp GameLoop:", err);
      // Dừng ticker để tránh văng log liên tục
      this.app.ticker.stop();
      alert("Lỗi game: " + err.message + "\nXem Console để biết thêm chi tiết.");
    }
  }

  transitionTo(state: GameState): void {
    if (state === GameState.GAMEPLAY) {
      this.levelTimer = 0;
      this.currentLevelIndex = 0;
      const firstLevel = levelData.levels[0];
     this.onLevelChange?.(firstLevel.name);
      this.onLandmarkEvent?.(firstLevel.isLandmarkEvent);
    }
    this.loadScene(state);
    if (state === GameState.GAMEPLAY) {
      const firstLevel = levelData.levels[0];
      this.gameplayScene.triggerLandmarkEvent(firstLevel.isLandmarkEvent);
    }
  }

  private loadScene(state: GameState): void {
    this.app.stage.removeChildren();
    this.stateManager.setState(state);
    this.onStateChange?.(state);

    switch (state) {
      case GameState.START:
        this.startScene.init();
        this.app.stage.addChild(this.startScene.container);
        break;
      case GameState.GAMEPLAY:
        this.gameplayScene.init();
        this.app.stage.addChild(this.gameplayScene.container);
        break;
      case GameState.GAME_OVER:
        this.gameOverScene.init();
        this.app.stage.addChild(this.gameOverScene.container);
        break;
    }
  }
}