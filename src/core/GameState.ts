export const GameState = {
  START: "START",
  GAMEPLAY: "GAMEPLAY",
  GAME_OVER: "GAME_OVER",
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export class GameStateManager {
  currentState: GameState = GameState.START;

  setState(state: GameState): void {
    this.currentState = state;
  }

  getState(): GameState {
    return this.currentState;
  }
}