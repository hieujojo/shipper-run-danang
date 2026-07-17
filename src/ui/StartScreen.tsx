interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.7)",
      color: "white",
      fontFamily: "sans-serif",
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: "#e74c3c" }}>
        🛵 Shipper Run
      </h1>
      <p style={{ fontSize: 14, marginBottom: 4, color: "#aaa" }}>
        Đà Nẵng Edition
      </p>
      <p style={{ fontSize: 12, marginBottom: 32, color: "#666" }}>
        ← → Di chuyển | ↑ Nhảy | ↓ Trượt | Space Tăng tốc
      </p>
      <button onClick={onStart} style={{
        padding: "12px 40px",
        fontSize: 18,
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
      }}>
        BẮT ĐẦU
      </button>
    </div>
  );
}