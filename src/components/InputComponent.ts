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
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    // Chỉ preventDefault các phím dùng trong game để tránh kẹt focus vào UI/Browser
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) {
      e.preventDefault();
      console.log("InputComponent - KeyDown prevented default:", e.code);
    }
    switch (e.code) {
      case "ArrowLeft": this.state.left = true; break;
      case "ArrowRight": this.state.right = true; break;
      case "ArrowUp": this.state.up = true; break;
      case "ArrowDown": this.state.down = true; break;
      case "Space": this.state.space = true; break;
    }
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) {
      e.preventDefault();
      console.log("InputComponent - KeyUp prevented default:", e.code);
    }
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
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}