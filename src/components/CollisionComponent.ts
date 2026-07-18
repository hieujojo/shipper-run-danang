export interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICollisionComponent {
  bounds: IBounds;
  checkCollision(other: IBounds): boolean;
}

export class CollisionComponent implements ICollisionComponent {
  bounds: IBounds;

  constructor(x: number, y: number, width: number, height: number) {
    this.bounds = { x, y, width, height };
  }

  checkCollision(other: IBounds): boolean {
    return (
      this.bounds.x < other.x + other.width &&
      this.bounds.x + this.bounds.width > other.x &&
      this.bounds.y < other.y + other.height &&
      this.bounds.y + this.bounds.height > other.y
    );
  }
}