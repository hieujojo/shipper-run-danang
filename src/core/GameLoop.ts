import { Application } from "pixi.js";
import { GameStateManager, GameState } from "./GameState";
import { StartScene } from "../scenes/StartScene";
import { GameplayScene } from "../scenes/GameplayScene";
import { GameOverScene } from "../scenes/GameOverScene";

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
  onLivesChange: ((lives: number) => void) | null = null;
  constructor(app: Application) {
    this.app = app;
    this.stateManager = new GameStateManager();
    this.startScene = new StartScene(app);
    this.gameplayScene = new GameplayScene(app);
    this.gameOverScene = new GameOverScene(app);

    this.gameplayScene.onGameOver = () => this.transitionTo(GameState.GAME_OVER);
    this.gameplayScene.onLivesChange = (l: number) => this.onLivesChange?.(l);
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
        break;
      case GameState.GAME_OVER:
        this.gameOverScene.update(ticker.deltaTime);
        break;
    }
  }

  transitionTo(state: GameState): void {
    if (state === GameState.GAMEPLAY) {
      this.score = 0;
      this.scoreTimer = 0;
      this.onScoreUpdate?.(0);
    }
    this.loadScene(state);
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