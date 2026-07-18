interface HudOverlayProps {
  score: number;
  lives: number;
}

export function HudOverlay({ score, lives }: HudOverlayProps) {
  return (
    <div style={{
      position: "absolute",
      top: 12,
      left: 0, right: 0,
      display: "flex",
      justifyContent: "space-between",
      padding: "0 16px",
      fontFamily: "sans-serif",
      pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "4px 12px",
        borderRadius: 6,
        fontSize: 14,
      }}>
        ⭐ {score}
      </div>
      <div style={{
        background: "rgba(0,0,0,0.6)",
        color: "#e74c3c",
        padding: "4px 12px",
        borderRadius: 6,
        fontSize: 14,
      }}>
        {"❤️".repeat(lives)}
      </div>
    </div>
  );
}