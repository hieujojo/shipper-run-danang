import { FaBomb } from 'react-icons/fa';

interface GameOverScreenProps {
  score: number;
  region: string;
  packageCount: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, region, packageCount, onRestart }: GameOverScreenProps) {
  const HE = "Đà Nẵng";

  // CSS thật, dùng class thay vì attribute-selector trên inline style
  // (inline style của React không chứa tên biến JS, nên selector kiểu
  // div[style*="detailsBoxStyle"] không bao giờ match được gì)
  const cssAnimations = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-btn {
      0% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0.7); transform: scale(1); }
      70% { box-shadow: 0 0 0 20px rgba(255, 111, 0, 0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0); transform: scale(1); }
    }

    .go-title {
      font-size: clamp(1.8rem, 7vw, 5rem);
      font-weight: bold;
      margin-bottom: 2vw;
      color: #FF4D4D;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255, 77, 77, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
      white-space: nowrap;
      line-height: 1.1;
      padding: 0 12px;
      gap: 10px;
      text-align: center;
    }
    .go-subtitle {
      font-size: clamp(1rem, 1.5vw, 2rem);
      font-weight: 300;
      margin-bottom: clamp(12px, 2vw, 24px);
      color: #EEEEEE;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      padding: 0 12px;
    }
    /* Container tổng: luôn xếp dọc, luôn canh giữa — không phụ thuộc
       việc các khối con có wrap đẹp hay không ở từng độ rộng màn hình */
    .go-details-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(10px, 1.8vw, 16px);
    }

    /* Hàng "Hệ" + "Vùng" — luôn là 1 nhóm, canh giữa như 1 khối duy nhất */
    .go-meta-row {
      display: flex;
      gap: clamp(8px, 2vw, 20px);
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
    }
    .go-details-box {
      border-radius: 12px;
      padding: clamp(0.4rem, 0.8vw, 1rem) clamp(0.6rem, 1.2vw, 1rem);
      display: flex;
      gap: 0.5vw;
      align-items: center;
      font-weight: 700;
      font-size: clamp(1rem, 1.6vw, 1.4rem);
      white-space: nowrap;
    }

    /* Khối điểm số — luôn full-width, riêng biệt, không bao giờ chung dòng
       với Hệ/Vùng, nên không thể bị lệch dòng theo kiểu wrap ngẫu nhiên */
    .go-score-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: clamp(0.5rem, 1vw, 1.5rem) clamp(1.5rem, 5vw, 3vw);
      gap: 0.2vw;
      font-weight: 600;
    }
    .go-score-label {
      font-size: clamp(0.7rem, 0.9vw, 1rem);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .go-score-value {
      font-size: clamp(2.4rem, 12vw, 4.5rem);
      color: #FFC107;
      font-family: monospace;
      line-height: 1;
    }
    .go-restart-btn {
      padding: clamp(14px, 2vw, 25px) clamp(32px, 5vw, 80px);
      font-size: clamp(1rem, 2.5vw, 1.8rem);
      font-weight: 900;
      background: linear-gradient(to bottom, #FF6F00, #FFC400);
      color: #fff;
      border: 4px solid #F57C00;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(255, 111, 0, 0.4);
      text-transform: uppercase;
      animation: pulse-btn 2s infinite;
      transition: transform 0.2s, box-shadow 0.2s;
      letter-spacing: 1px;
    }

    /* Màn hình rất nhỏ, ví dụ iPhone SE 375px, Android nhỏ 320-360px */
    @media (max-width: 400px) {
      .go-title {
        font-size: clamp(1.8rem, 9vw, 2.6rem);
        gap: 10px;
      }
      .go-subtitle {
        font-size: clamp(0.8rem, 3.5vw, 1.1rem);
      }
      .go-score-value {
        font-size: clamp(2.5rem, 16vw, 3.5rem);
      }
      .go-restart-btn {
        font-size: clamp(0.9rem, 4.5vw, 1.2rem);
        padding: 12px 28px;
      }
    }

    /* Màn hình ngang thấp (điện thoại xoay ngang) */
    @media (max-height: 420px) and (orientation: landscape) {
      .go-title { font-size: clamp(1.4rem, 6vw, 2rem); margin-bottom: 4px; }
      .go-subtitle { margin-bottom: 8px; }
      .go-details-row { gap: 8px; }
      .go-restart-btn { padding: 8px 24px; }
    }
  `;

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

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideIn 0.8s ease-out',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <h1 className="go-title">
          <FaBomb style={{ fontSize: '0.8em', flexShrink: 0 }} /> BẠN ĐÃ THUA!
        </h1>

        <p className="go-subtitle">
          Bạn đã giao được:{' '}
          <span style={{ color: '#FFC107', fontWeight: 900 }}>
            {packageCount} gói hàng
          </span>
        </p>

        <div
          className="go-details-row"
          style={{
            padding: '0 4vw',
            marginBottom: 'clamp(16px, 3vw, 32px)',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div className="go-meta-row">
            <div className="go-details-box">
              Hệ: <span style={{ color: '#00BCD4' }}>{HE}</span>
            </div>

            <div className="go-details-box">
              Vùng: <span style={{ color: '#00BCD4' }}>{region}</span>
            </div>
          </div>

          <div className="go-score-box">
            <span className="go-score-label">Điểm</span>
            <strong className="go-score-value">{score}</strong>
          </div>
        </div>

        <button className="go-restart-btn" onClick={onRestart}
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
    </div>
  );
}