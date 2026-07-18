import { useState } from "react";
import { audioManager } from "../utils/audioManager";

interface HudOverlayProps {
  score: number;
  lives: number;
}

export function HudOverlay({ score, lives }: HudOverlayProps) {
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    audioManager.setMasterVolume(val);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioManager.setMasterVolume(next ? 0 : volume);
  };

  return (
    <div style={{
      position: "absolute",
      top: 12,
      left: 0, right: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 16px",
      fontFamily: "sans-serif",
      pointerEvents: "none",
    }}>
      {/* Điểm */}
      <div style={{
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "4px 12px",
        borderRadius: 6,
        fontSize: 14,
      }}>
        ⭐ {score}
      </div>

      {/* Volume control */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.6)",
        padding: "4px 10px",
        borderRadius: 6,
        pointerEvents: "all",
      }}>
        <button
          onClick={toggleMute}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{
            width: 70,
            accentColor: "#e74c3c",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Tim */}
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