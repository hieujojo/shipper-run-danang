import React from 'react';
import { FaBomb } from 'react-icons/fa';

// Định nghĩa kiểu cho Props của Component
interface GameOverScreenProps {
  score: number;
  region: string; // Vùng/địa danh vừa chơi, ví dụ: "Cầu Rồng"
  packageCount: number; // Số gói hàng đã giao thành công (từ GameLoop.deliveredCount)
  onRestart: () => void;
}

export function GameOverScreen({ score, region, packageCount, onRestart }: GameOverScreenProps) {
  // Toàn bộ game chỉ diễn ra ở Đà Nẵng — đây không phải level config nên hardcode là hợp lý
  const HE = "Đà Nẵng";

  // Nhúng trực tiếp CSS Keyframes để tạo Animation
  const cssAnimations = `
    /* Hiệu ứng trượt vào từ phía trên */
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Hiệu ứng nhịp đập tỏa sáng cho nút CHƠI LẠI */
    @keyframes pulse-btn {
      0% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0.7); transform: scale(1); }
      70% { box-shadow: 0 0 0 20px rgba(255, 111, 0, 0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0); transform: scale(1); }
    }
  `;

  // Style cho các box chi tiết nhỏ (Glassmorphism) - Tối hơn cho màn gameover
  const detailsBoxStyle: React.CSSProperties = {
    borderRadius: '12px',
    padding: 'clamp(0.5rem, 1vw, 1.5rem)', // Padding linh hoạt
    display: 'flex',
    gap: '0.5vw',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: 'clamp(0.8rem, 1vw, 1.1rem)', // Font nhỏ hơn cho chi tiết
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `url('/assets/background_over.png') no-repeat center bottom`, 
        backgroundSize: 'cover',
        fontFamily: "'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
        color: '#fff',
        padding: '2vw',
        animation: 'slideIn 0.8s ease-out',
        overflow: 'hidden',
      }}
    >
      <style>{cssAnimations}</style>

      {/* Lớp phủ mờ (Overlay) tối hơn cho Game Over, giúp text nổi bật */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      ></div>

      {/* Box chứa nội dung chính, nằm trên Overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideIn 0.8s ease-out',
          width: '100%',
        }}
      >
        {/* Tựa Game-Over */}
        <h1
          style={{
            fontSize: 'clamp(4rem, 8vw, 6rem)', 
            fontWeight: 'bold',
            marginBottom: '1vw',
            color: '#FF4D4D',
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255, 77, 77, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1.1,
            padding: '0 15px',
            gap: '1vw'
          }}
        >
          <FaBomb style={{ fontSize: '0.8em' }} /> BẠN ĐÃ THUA MẤT RỒI!
        </h1>

        {/* Tiêu đề phụ + số gói đã giao */}
        <p
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 2rem)',
            fontWeight: 'lighter',
            marginBottom: '2.5vw',
            color: '#EEEEEE',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textAlign: 'center',
          }}
        >
          Bạn đã giao được:{' '}
          <span style={{ color: '#FFC107', fontWeight: 900 }}>
            {packageCount} gói hàng
          </span>
        </p>

        {/* Bảng chi tiết điểm số Glassmorphism - đã bỏ border xám bao ngoài */}
        <div
          style={{
            padding: '2vw 4vw',
            marginBottom: '4vw',
            textAlign: 'center',
            maxWidth: '600px',
            boxSizing: 'border-box',
            display: 'flex',
            gap: '1vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Hệ: cố định Đà Nẵng vì toàn bộ game chỉ có 1 thành phố */}
          <div style={detailsBoxStyle}>
            Hệ: <span style={{ color: '#00BCD4' }}>{HE}</span>
          </div>

          {/* Vùng: lấy từ landmark hiện tại (levelData.json → level.name) */}
          <div style={detailsBoxStyle}>
            Vùng: <span style={{ color: '#00BCD4' }}>{region}</span>
          </div>

          {/* Điểm số chính — có chữ "Điểm" ở trên */}
          <div style={{...detailsBoxStyle, flexDirection: 'column', padding: '1vw 3vw', gap: '0.2vw'}}>
            <span style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1rem)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Điểm
            </span>
            <strong style={{ fontSize: 'clamp(3rem, 7vw, 4.5rem)', color: '#FFC107', fontFamily: "monospace" }}>
              {score}
            </strong>
          </div>
        </div>

        {/* Nút CHƠI LẠI - Kích thước lớn, Pulse Tỏa Sáng */}
        <button
          onClick={onRestart}
          style={{
            padding: 'clamp(15px, 2vw, 25px) clamp(40px, 5vw, 80px)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            fontWeight: 900,
            background: 'linear-gradient(to bottom, #FF6F00, #FFC400)',
            color: '#fff',
            border: '4px solid #F57C00',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 111, 0, 0.4)',
            textTransform: 'uppercase',
            animation: 'pulse-btn 2s infinite',
            transition: 'transform 0.2s, box-shadow 0.2s',
            letterSpacing: '1px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 111, 0, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 111, 0, 0.4)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          CHƠI LẠI
        </button>
      </div>

      {/* Media queries responsive */}
      <style>{`
        @media (max-width: 768px) {
          h1 { fontSize: 10vw !important; }
          p:nth-of-type(1) { fontSize: 3vw !important; }
          div[style*="detailsBoxStyle"] { fontSize: 2.5vw !important; }
          strong[style*="font-size: clamp"] { fontSize: 12vw !important; }
          button { fontSize: 4.5vw !important; padding: 3vw 10vw !important; }
        }
        @media (max-width: 480px) {
          h1 { fontSize: 12vw !important; }
          p:nth-of-type(1) { fontSize: 3.5vw !important; }
          strong[style*="font-size: clamp"] { fontSize: 15vw !important; }
          button { fontSize: 5vw !important; padding: 4vw 15vw !important; }
        }
      `}</style>
    </div>
  );
}