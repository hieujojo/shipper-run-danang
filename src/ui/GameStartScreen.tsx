import React from 'react';
import { FaTruck, FaFire } from 'react-icons/fa';
import { GiPalmTree } from 'react-icons/gi';
import { MdScreenRotation } from 'react-icons/md';

interface GameStartScreenProps {
  onStart: () => void;
}

export function GameStartScreen({ onStart }: GameStartScreenProps) {
  const cssAnimations = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes drive {
      0% { transform: translateX(-5px) rotate(-2deg); }
      50% { transform: translateX(5px) rotate(2deg); }
      100% { transform: translateX(-5px) rotate(-2deg); }
    }
    @keyframes pulse-btn {
      0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); transform: scale(1); }
      70% { box-shadow: 0 0 0 15px rgba(231, 76, 60, 0); transform: scale(1.03); }
      100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); transform: scale(1); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Base styles - Desktop large (>1200px) */
    .ss-title {
      font-size: clamp(2rem, 6vw, 5rem);
      margin: 0.3em 0;
      color: #fff;
      text-transform: uppercase;
      font-weight: 900;
      text-shadow: 3px 3px 0 #e74c3c, 6px 6px 0 rgba(0,0,0,0.5);
      animation: float 3s ease-in-out infinite;
      text-align: center;
      letter-spacing: clamp(1px, 0.3vw, 3px);
      line-height: 1.1;
    }
    
    .ss-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: clamp(10px, 2vw, 20px) clamp(18px, 3.5vw, 36px);
      border-radius: clamp(14px, 2.5vw, 22px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: clamp(16px, 2.5vh, 28px);
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      max-width: min(90vw, 600px);
      box-sizing: border-box;
    }
    
    .ss-badge {
      font-size: clamp(0.85rem, 2.5vw, 1.6rem);
      margin: 0 0 clamp(8px, 1.5vh, 14px) 0;
      color: #f1c40f;
      font-weight: 800;
      text-transform: uppercase;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      display: flex;
      gap: clamp(6px, 1.5vw, 12px);
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      line-height: 1.2;
    }
    
    .ss-controls {
      font-size: clamp(0.65rem, 1.6vw, 1rem);
      color: #ecf0f1;
      display: flex;
      gap: clamp(6px, 1.5vw, 14px);
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      line-height: 1.4;
    }

    .ss-rotate-hint {
      font-size: clamp(0.6rem, 1.6vw, 0.95rem);
      color: #f1c40f;
      display: flex;
      gap: clamp(5px, 1.2vw, 10px);
      align-items: center;
      justify-content: center;
      font-weight: 700;
      line-height: 1.3;
      margin-top: clamp(6px, 1.2vh, 12px);
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    }
    
    .ss-button {
      padding: clamp(10px, 2.2vh, 16px) clamp(28px, 5.5vw, 56px);
      font-size: clamp(0.9rem, 2.2vw, 1.5rem);
      font-weight: 900;
      background: linear-gradient(to bottom, #ff6b6b, #e74c3c);
      color: white;
      border: clamp(2px, 0.5vw, 4px) solid #c0392b;
      border-radius: 50px;
      cursor: pointer;
      text-transform: uppercase;
      animation: pulse-btn 2s infinite;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 8px 20px rgba(231, 76, 60, 0.5);
      letter-spacing: clamp(0.5px, 0.2vw, 2px);
    }

    /* Desktop standard (992px - 1200px) */
    @media (max-width: 1200px) {
      .ss-title { 
        text-shadow: 2px 2px 0 #e74c3c, 5px 5px 0 rgba(0,0,0,0.5);
      }
    }

    /* Tablet landscape (768px - 992px) */
    @media (max-width: 992px) {
      .ss-card {
        max-width: min(85vw, 550px);
      }
      .ss-title {
        text-shadow: 2px 2px 0 #e74c3c, 4px 4px 0 rgba(0,0,0,0.4);
      }
    }

    /* Tablet portrait (600px - 768px) */
    @media (max-width: 768px) {
      .ss-card {
        max-width: 90vw;
        padding: clamp(8px, 1.8vw, 16px) clamp(16px, 3vw, 28px);
        margin-bottom: clamp(14px, 2vh, 20px);
      }
      .ss-controls {
        gap: clamp(5px, 1.2vw, 10px);
      }
    }

    /* Mobile landscape / Small tablet (481px - 600px) */
    @media (max-width: 600px) {
      .ss-title {
        margin: 0.15em 0;
      }
      .ss-card {
        padding: clamp(8px, 1.8vw, 14px) clamp(14px, 2.8vw, 20px);
        margin-bottom: clamp(12px, 2vh, 18px);
      }
      .ss-badge {
        margin-bottom: clamp(6px, 1.2vh, 10px);
      }
      .ss-controls {
        gap: clamp(5px, 1.2vw, 8px);
      }
    }

    /* Mobile portrait (376px - 480px) */
    @media (max-width: 480px) {
      .ss-title {
        text-shadow: 2px 2px 0 #e74c3c, 3px 3px 0 rgba(0,0,0,0.4);
      }
      .ss-card {
        padding: 8px 14px;
        margin-bottom: 12px;
      }
      .ss-controls {
        gap: 5px;
      }
      .ss-button {
        padding: 10px 28px;
      }
    }

    /* Small mobile (321px - 375px) */
    @media (max-width: 375px) {
      .ss-card {
        padding: 7px 12px;
        margin-bottom: 10px;
      }
      .ss-badge {
        margin-bottom: 6px;
      }
      .ss-controls {
        gap: 4px;
      }
      .ss-button {
        padding: 9px 24px;
      }
    }

    /* Very small mobile (<= 320px) */
    @media (max-width: 320px) {
      .ss-title {
        margin: 0.12em 0;
      }
      .ss-card {
        padding: 6px 10px;
        margin-bottom: 8px;
      }
      .ss-badge {
        margin-bottom: 5px;
        gap: 4px;
      }
      .ss-controls {
        gap: 3px;
        font-size: clamp(0.58rem, 3vw, 0.7rem);
      }
      .ss-button {
        padding: 8px 20px;
      }
    }

    /* Landscape orientation - Low height */
    @media (max-height: 500px) and (orientation: landscape) {
      .ss-title {
        margin: 0.12em 0;
        text-shadow: 2px 2px 0 #e74c3c, 3px 3px 0 rgba(0,0,0,0.4);
      }
      .ss-card {
        padding: 6px 14px;
        margin-bottom: 10px;
      }
      .ss-badge {
        margin-bottom: 5px;
      }
      .ss-controls {
        gap: 4px;
      }
      .ss-button {
        padding: 7px 22px;
      }
      .ss-rotate-hint {
        display: none;
      }
    }

    /* Extra low height landscape */
    @media (max-height: 400px) and (orientation: landscape) {
      .ss-title {
        margin: 0.08em 0;
      }
      .ss-card {
        padding: 5px 12px;
        margin-bottom: 6px;
      }
      .ss-badge {
        margin-bottom: 4px;
      }
      .ss-controls {
        gap: 3px;
      }
      .ss-button {
        padding: 5px 18px;
      }
    }

    /* Large desktop (> 1920px) */
    @media (min-width: 1921px) {
      .ss-card {
        max-width: 700px;
      }
    }
  `;

  const kbdStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "clamp(4px, 0.8vw, 6px)",
    padding: "clamp(2px, 0.5vw, 4px) clamp(6px, 1.2vw, 10px)",
    margin: "0 clamp(2px, 0.4vw, 4px)",
    boxShadow: "0 2px 0 rgba(0,0,0,0.8)",
    fontFamily: "monospace",
    fontSize: "clamp(0.75em, 1.5vw, 0.95em)",
    display: "inline-block",
    whiteSpace: "nowrap"
  };

  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "url('/assets/background.png') center/cover no-repeat",
      color: "white",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      overflow: "hidden",
      padding: "clamp(12px, 2vh, 20px) clamp(12px, 2vw, 20px)",
      boxSizing: "border-box",
    }}>
      <style>{cssAnimations}</style>

      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)",
        zIndex: 1
      }}></div>

      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "slideIn 0.8s ease-out",
        maxWidth: "100%",
        width: "100%",
        padding: "clamp(8px, 2vw, 16px)",
      }}>

        <div style={{
          fontSize: "clamp(2rem, 6vw, 5rem)",
          animation: "drive 0.6s infinite ease-in-out",
          marginBottom: "clamp(-2px, -0.5vw, -8px)",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
          display: "flex",
          gap: "clamp(6px, 1.2vw, 12px)",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <FaTruck style={{ fontSize: "1em" }} />
          <h1 className="ss-title">Shipper Run</h1>
        </div>

        <div className="ss-card">
          <p className="ss-badge">
            <GiPalmTree /> Đà Nẵng Edition <span style={{ fontSize: "0.9em" }}>🌉</span>
          </p>

          <div className="ss-controls">
             <span style={{ whiteSpace: "nowrap" }}><kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> Chạy</span>
             <span style={{ whiteSpace: "nowrap" }}><kbd style={kbdStyle}>↑</kbd> Lên</span>
             <span style={{ whiteSpace: "nowrap" }}><kbd style={kbdStyle}>↓</kbd> Xuống</span>
             <span style={{ whiteSpace: "nowrap" }}><kbd style={kbdStyle}>Space</kbd> Phóng!</span>
          </div>

          <p className="ss-rotate-hint">
            <MdScreenRotation style={{ fontSize: "1.2em" }} />
            Xoay ngang màn hình khi chơi bằng điện thoại
          </p>
        </div>

        <button className="ss-button" onClick={onStart}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9) translateY(4px)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1) translateY(-4px)"}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1) translateY(-4px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) translateY(0)"}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 12px)", justifyContent: "center", flexWrap: "wrap" }}>
            <FaFire /> CHƠI THÔI NÀO
          </span>
        </button>
      </div>
    </div>
  );
}