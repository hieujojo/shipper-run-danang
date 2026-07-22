import { createRoot } from "react-dom/client";
import { Application, Assets } from "pixi.js";
import Stats from "stats.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./core/constants";
import { GameLoop } from "./core/GameLoop";
import { GameState } from "./core/GameState";
import { useState, useEffect, useRef, useCallback } from "react";
import { GameStartScreen } from "./ui/GameStartScreen";
import { LandmarkBanner } from "./ui/LandmarkBanner";
import { HudOverlay } from "./ui/HudOverlay";
import { GameOverScreen } from "./ui/GameOverScreen";
import { MobileControls } from "./ui/MobileControls";
import type { IInputState } from "./components/InputComponent";
function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [landmark, setLandmark] = useState("");
  const [hasPackage, setHasPackage] = useState(false);
  const [landmarkVisible, setLandmarkVisible] = useState(false);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const landmarkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLevelChangeRef = useRef<(name: string) => void>(() => { });
  onLevelChangeRef.current = (name: string) => {
    if (landmarkTimerRef.current) clearTimeout(landmarkTimerRef.current);
    setLandmark(name);
    setLandmarkVisible(true);
    landmarkTimerRef.current = setTimeout(() => {
      setLandmarkVisible(false);
    }, 3000);
  };
  useEffect(() => {
    const app = new Application();
    // Expose app to global scope for PixiJS DevTools
    if (import.meta.env.DEV) {
      (globalThis as any).__PIXI_APP__ = app;
    }

    const stats = new Stats();
    stats.showPanel(0);
    if (window.location.search.includes('debug=1')) {
      document.body.appendChild(stats.dom);
    }

    (async () => {
      await app.init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      app.ticker.add(() => {
        stats.update();
      });

      // Tải trước các ảnh Pixel Art
      await Assets.load([
        "/assets/player_shipper.png",
        "/assets/vehicle_car.png",
        "/assets/vehicle_motorbike.png",
        "/assets/vehicle_bus.png",
        "/assets/package_box.png",
        "/assets/cau-rong-landmark.png",
        "/assets/cau-song-han_landmark.png",
        "/assets/cau-tran-thi-ly_landmark.png",
      ]);

      if (containerRef.current) {
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.objectFit = "contain";
        containerRef.current.appendChild(canvas);
      }

      const gameLoop = new GameLoop(app);
      gameLoopRef.current = gameLoop;

      gameLoop.onStateChange = (state: GameState) => setGameState(state);
      gameLoop.onLivesChange = (l: number) => setLives(l);
      gameLoop.onPackageChange = (val: boolean) => setHasPackage(val);
      gameLoop.onLevelChange = (name: string) => {
        onLevelChangeRef.current(name);
      };
      gameLoop.onScoreUpdate = (s: number) => setScore(s);
      gameLoop.onDeliveredCountChange = (c: number) => setDeliveredCount(c);

      gameLoop.start();
    })();

    return () => {
      if (document.body.contains(stats.dom)) {
        document.body.removeChild(stats.dom);
      }
      app.destroy(true);
    };
  }, []);

  const handleStart = () => {
    gameLoopRef.current?.transitionTo(GameState.GAMEPLAY);
  };

  const handleTouchInput = useCallback((partial: Partial<IInputState>) => {
    gameLoopRef.current?.setTouchInput(partial);
  }, []);

 const handleRestart = () => {
    // Clear mọi timeout landmark đang pending từ lần chơi trước
    if (landmarkTimerRef.current) {
      clearTimeout(landmarkTimerRef.current);
      landmarkTimerRef.current = null;
    }

    // Force reset state về đúng trạng thái ban đầu TRƯỚC khi GameLoop callback chạy
    setScore(0);
    setLives(3);
    setDeliveredCount(0);
    setHasPackage(false);
    setLandmark("Cầu Rồng");
    setLandmarkVisible(false);
    gameLoopRef.current?.transitionTo(GameState.GAMEPLAY);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#000", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} />
      {gameState === GameState.START && (
        <GameStartScreen onStart={handleStart} />
      )}
     {gameState === GameState.GAMEPLAY && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `min(100vw, ${100 * (16/9)}vh)`,
          height: `min(100vh, ${100 * (9/16)}vw)`,
          pointerEvents: "none",
        }}>
          <HudOverlay score={score} lives={lives} hasPackage={hasPackage} />
          <LandmarkBanner name={landmark} visible={landmarkVisible} />
          {isMobile && <MobileControls onInput={handleTouchInput} />}
        </div>
      )}
      {gameState === GameState.GAME_OVER && (
        <GameOverScreen score={score} region={landmark} packageCount={deliveredCount} onRestart={handleRestart} />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <App />
);