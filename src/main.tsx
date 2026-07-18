import { createRoot } from "react-dom/client";
import { Application } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./core/constants";
import { GameLoop } from "./core/GameLoop";
import { GameState } from "./core/GameState";
import { useState, useEffect, useRef } from "react";
import { StartScreen } from "./ui/StartScreen";
import { LandmarkBanner } from "./ui/LandmarkBanner";
import { HudOverlay } from "./ui/HudOverlay";
import { GameOverScreen } from "./ui/GameOverScreen";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [landmark, setLandmark] = useState("");
  const [hasPackage, setHasPackage] = useState(false);
  const [landmarkVisible, setLandmarkVisible] = useState(false);

  useEffect(() => {
    const app = new Application();
    app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    }).then(() => {
      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      const gameLoop = new GameLoop(app);
      gameLoopRef.current = gameLoop;

      gameLoop.onStateChange = (state: GameState) => setGameState(state);
      gameLoop.onLivesChange = (l: number) => setLives(l);
      gameLoop.onPackageChange = (val: boolean) => setHasPackage(val);
      gameLoop.onLevelChange = (name: string) => {
        setLandmark(name);
        setLandmarkVisible(true);
        setTimeout(() => setLandmarkVisible(false), 3000);
      };
      gameLoop.onScoreUpdate = (s: number) => setScore(s);

      gameLoop.start();
    });

    return () => {
      app.destroy(true);
    };
  }, []);

  const handleStart = () => {
    gameLoopRef.current?.transitionTo(GameState.GAMEPLAY);
  };

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    gameLoopRef.current?.transitionTo(GameState.GAMEPLAY);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div ref={containerRef} />
      {gameState === GameState.START && (
        <StartScreen onStart={handleStart} />
      )}
      {gameState === GameState.GAMEPLAY && (
        <>
          <HudOverlay score={score} lives={lives} hasPackage={hasPackage} />
          <LandmarkBanner name={landmark} visible={landmarkVisible} />
        </>
      )}
      {gameState === GameState.GAME_OVER && (
        <GameOverScreen score={score} onRestart={handleRestart} />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
    <App />
);