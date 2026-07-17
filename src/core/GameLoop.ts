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

  constructor(app: Application) {
    this.app = app;
    this.stateManager = new GameStateManager();
    this.startScene = new StartScene(app);
    this.gameplayScene = new GameplayScene(app);
    this.gameOverScene = new GameOverScene(app);

    // Callbacks
    this.gameplayScene.onGameOver = () => this.transitionTo(GameState.GAME_OVER);
    this.startScene.onStart = () => this.transitionTo(GameState.GAMEPLAY);
    this.gameOverScene.onRestart = () => this.transitionTo(GameState.GAMEPLAY);
  }

  start(): void {
    this.loadScene(GameState.GAMEPLAY);
    this.app.ticker.add(this.update.bind(this));
  }

  private update(ticker: { deltaTime: number }): void {
    switch (this.stateManager.getState()) {
      case GameState.START:
        this.startScene.update(ticker.deltaTime);
        break;
      case GameState.GAMEPLAY:
        this.gameplayScene.update(ticker.deltaTime);
        break;
      case GameState.GAME_OVER:
        this.gameOverScene.update(ticker.deltaTime);
        break;
    }
  }

  private loadScene(state: GameState): void {
    this.app.stage.removeChildren();
    this.stateManager.setState(state);
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

  transitionTo(state: GameState): void {
    this.loadScene(state);
  }
}