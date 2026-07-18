export interface IInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
}

export class InputComponent {
  private state: IInputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  };

  constructor() {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case "ArrowLeft": this.state.left = true; break;
      case "ArrowRight": this.state.right = true; break;
      case "ArrowUp": this.state.up = true; break;
      case "ArrowDown": this.state.down = true; break;
      case "Space": this.state.space = true; break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case "ArrowLeft": this.state.left = false; break;
      case "ArrowRight": this.state.right = false; break;
      case "ArrowUp": this.state.up = false; break;
      case "ArrowDown": this.state.down = false; break;
      case "Space": this.state.space = false; break;
    }
  }

  getState(): IInputState {
    return this.state;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  }
}