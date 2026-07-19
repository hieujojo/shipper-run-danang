import { useState, useRef, useEffect } from "react";
import { audioManager } from "../utils/audioManager";

interface HudOverlayProps {
  score: number;
  lives: number;
  hasPackage: boolean;
}

const VOLUME_STEP = 0.1;

export function HudOverlay({ score, lives, hasPackage }: HudOverlayProps) {
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const rangeRef = useRef<HTMLInputElement>(null);

  // Fix: khi HudOverlay vừa mount (chuyển từ StartScreen sang Gameplay),
  // trình duyệt có thể tự chuyển focus vào <input type="range"> này
  // vì nó là phần tử focusable đầu tiên xuất hiện sau khi nút "Bắt đầu" bị unmount.
  // Nếu để vậy, phím ArrowLeft/ArrowRight sẽ bị trình duyệt "giành" để chỉnh volume
  // thay vì chỉ dùng để di chuyển xe (InputComponent). Chủ động blur ngay khi mount
  // để đảm bảo không có phần tử nào trong HUD giữ focus bàn phím mặc định.
  useEffect(() => {
    if (document.activeElement === rangeRef.current) {
      rangeRef.current?.blur();
    }
  }, []);

  const applyVolume = (val: number) => {
    const clamped = Math.min(1, Math.max(0, val));
    setVolume(clamped);
    setMuted(clamped === 0);
    audioManager.setMasterVolume(clamped);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioManager.setMasterVolume(next ? 0 : volume);
  };

  const adjustVolume = (delta: number) => {
    const base = muted ? 0 : volume;
    applyVolume(base + delta);
  };

  // Sau khi người dùng tương tác trực tiếp với slide (kéo chuột),
  // trả focus ra khỏi input ngay khi nhả chuột, để tránh việc
  // phím mũi tên tiếp tục bị "khoá" vào slide sau khi thao tác xong.
  const handlePointerUp = () => {
    rangeRef.current?.blur();
  };

  const iconButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
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
      {/* Trạng thái giao hàng */}
      {hasPackage && (
        <div style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(243,156,18,0.9)",
          color: "white",
          padding: "6px 16px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: "bold",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          📦 Đang giao hàng — tìm điểm 🟢
        </div>
      )}
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
          style={iconButtonStyle}
          aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
        >
          {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </button>

        <button
          onClick={() => adjustVolume(-VOLUME_STEP)}
          style={iconButtonStyle}
          aria-label="Giảm âm lượng"
        >
          −
        </button>

        <input
          ref={rangeRef}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          onPointerUp={handlePointerUp}
          onFocus={(e) => e.currentTarget.blur()}
          tabIndex={-1}
          style={{
            width: 70,
            accentColor: "#e74c3c",
            cursor: "pointer",
          }}
        />

        <button
          onClick={() => adjustVolume(VOLUME_STEP)}
          style={iconButtonStyle}
          aria-label="Tăng âm lượng"
        >
          +
        </button>
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