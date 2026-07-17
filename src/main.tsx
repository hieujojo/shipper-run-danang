import { Application } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./core/constants";
import { GameLoop } from "./core/GameLoop";

async function main(): Promise<void> {
  const app = new Application();

  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });

  document.getElementById("game-container")!.appendChild(app.canvas);

  const gameLoop = new GameLoop(app);
  gameLoop.start();
}

main();