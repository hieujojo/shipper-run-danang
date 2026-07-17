export interface IMovementComponent {
  speedX: number;
  speedY: number;
  move(deltaTime: number): void;
}

export class MovementComponent implements IMovementComponent {
  speedX: number;
  speedY: number;

  constructor(speedX: number = 0, speedY: number = 0) {
    this.speedX = speedX;
    this.speedY = speedY;
  }

  move(_deltaTime: number): void {
    // Override per entity
  }
}