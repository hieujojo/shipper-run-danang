import { useEffect, useState } from "react";

interface LandmarkBannerProps {
  name: string;
  visible: boolean;
}

export function LandmarkBanner({ name, visible }: LandmarkBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, name]);

  if (!show) return null;

  return (
    <div style={{
      position: "absolute",
      top: "20%",
      left: 0, right: 0,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
      animation: "fadeInOut 3s ease",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.75)",
        color: "white",
        padding: "10px 24px",
        borderRadius: 8,
        textAlign: "center",
        fontFamily: "sans-serif",
        border: "1px solid rgba(231,76,60,0.5)",
      }}>
        <div style={{ fontSize: 11, color: "#e74c3c", marginBottom: 4 }}>
          ĐỊA DANH
        </div>
        <div style={{ fontSize: 18, fontWeight: "bold" }}>
          📍 {name}
        </div>
      </div>
    </div>
  );
}