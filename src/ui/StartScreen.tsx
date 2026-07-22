import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const cssAnimations = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    @keyframes drive {
      0% { transform: translateX(-5px) rotate(-3deg); }
      50% { transform: translateX(5px) rotate(3deg); }
      100% { transform: translateX(-5px) rotate(-3deg); }
    }
    @keyframes pulse-btn {
      0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); transform: scale(1); }
      70% { box-shadow: 0 0 0 20px rgba(231, 76, 60, 0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); transform: scale(1); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const kbdStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "6px",
    padding: "4px 10px",
    margin: "0 4px",
    boxShadow: "0 3px 0 rgba(0,0,0,0.8)",
    fontFamily: "monospace"
  };

  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      // ĐÃ CẬP NHẬT ĐƯỜNG DẪN ẢNH TẠI ĐÂY
      background: "url('/assets/background.png') center/cover no-repeat",
      color: "white",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      overflow: "hidden"
    }}>
      <style>{cssAnimations}</style>

      {/* Lớp phủ mờ */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)", // Chỉnh mờ nhẹ lại để thấy ảnh rõ hơn
        zIndex: 1
      }}></div>

      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "slideIn 0.8s ease-out"
      }}>
        
        <div style={{
          fontSize: "clamp(4rem, 8vw, 6rem)",
          animation: "drive 0.6s infinite ease-in-out",
          marginBottom: "-10px",
          filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.6))"
        }}>
          🛵💨
        </div>

        <h1 style={{ 
          fontSize: "clamp(3.5rem, 8vw, 6rem)", 
          margin: "10px 0",
          color: "#fff", 
          textTransform: "uppercase",
          fontWeight: 900,
          textShadow: "4px 4px 0 #e74c3c, 8px 8px 0 rgba(0,0,0,0.6)",
          animation: "float 3s ease-in-out infinite",
          textAlign: "center",
          letterSpacing: "2px"
        }}>
          Shipper Run
        </h1>

        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          padding: "20px 40px",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          marginBottom: "40px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <p style={{ 
            fontSize: "clamp(1.2rem, 3vw, 2rem)", 
            margin: "0 0 20px 0", 
            color: "#f1c40f",
            fontWeight: 800,
            textTransform: "uppercase",
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
          }}>
            🌴 Đà Nẵng Edition 🌉
          </p>
          
          <div style={{ 
            fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)", 
            color: "#ecf0f1",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
            fontWeight: 600
          }}>
             <span><kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> Chạy</span>
             <span><kbd style={kbdStyle}>↑</kbd> Lên</span>
             <span><kbd style={kbdStyle}>↓</kbd> Xuống</span>
             <span><kbd style={kbdStyle}>Space</kbd> Phóng!</span>
          </div>
        </div>

        <button onClick={onStart} style={{
          padding: "18px 60px",
          fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
          fontWeight: 900,
          background: "linear-gradient(to bottom, #ff6b6b, #e74c3c)",
          color: "white",
          border: "4px solid #c0392b",
          borderRadius: "50px",
          cursor: "pointer",
          textTransform: "uppercase",
          animation: "pulse-btn 2s infinite",
          transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          boxShadow: "0 10px 25px rgba(231, 76, 60, 0.5)",
          letterSpacing: "1px"
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9) translateY(4px)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1) translateY(-4px)"}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1) translateY(-4px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) translateY(0)"}
        >
          🔥 CHƠI THÔI NÀO
        </button>
      </div>
    </div>
  );
}