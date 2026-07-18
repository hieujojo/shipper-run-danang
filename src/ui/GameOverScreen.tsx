interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      color: "white",
      fontFamily: "sans-serif",
    }}>
      <h2 style={{ fontSize: 32, marginBottom: 8, color: "#e74c3c" }}>
        💥 Game Over
      </h2>
      <p style={{ fontSize: 16, marginBottom: 32, color: "#aaa" }}>
        Điểm: <strong style={{ color: "white" }}>{score}</strong>
      </p>
      <button onClick={onRestart} style={{
        padding: "12px 40px",
        fontSize: 18,
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
      }}>
        CHƠI LẠI
      </button>
    </div>
  );
}