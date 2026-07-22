import React, { useCallback } from "react";
import { FaBolt } from "react-icons/fa";
import type { IInputState } from "../components/InputComponent";

interface MobileControlsProps {
  onInput: (partial: Partial<IInputState>) => void;
}

export function MobileControls({ onInput }: MobileControlsProps) {
  const makeHandlers = useCallback(
    (key: keyof IInputState) => ({
      onPointerDown: (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onInput({ [key]: true });
      },
      onPointerUp: () => onInput({ [key]: false }),
      onPointerCancel: () => onInput({ [key]: false }),
    }),
    [onInput]
  );

  // Kích thước nút tính theo vw (chiều rộng viewport)
  // => width màn hình càng nhỏ thì nút càng nhỏ theo đúng tỉ lệ
  // Cùng logic scale như nút BOOST (hệ số + mức trần/sàn thấp hơn để không "chạm sàn" quá sớm)
  // min 22px (điện thoại nhỏ nhất) — max 40px (tablet/màn rộng)
  const btnSize = "clamp(22px, 7vw, 40px)";
  const boostSize = "clamp(38px, 10.5vw, 60px)";
  const fontSize = "clamp(10px, 3vw, 16px)";

  const BTN_BASE: React.CSSProperties = {
    width: btnSize,
    height: btnSize,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    border: "2px solid rgba(255,255,255,0.45)",
    color: "white",
    fontSize: fontSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    // Feedback khi nhấn
    transition: "background 0.08s ease",
    boxSizing: "border-box",
  };

  // Gap rất nhỏ để các nút gần như dính sát nhau, scale theo vw đồng bộ với btnSize
  const gap = "clamp(1px, 0.6vw, 4px)";

  return (
    <div
      style={{
        position: "absolute",
        // Portrait: gần đáy màn hình
        // Landscape: cách đáy ít hơn vì màn thấp
        bottom: "clamp(12px, 3vh, 32px)",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        // Padding hai bên scale theo vw
        padding: `0 clamp(10px, 4vw, 36px)`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {/* D-PAD bên trái */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, ${btnSize})`,
          gridTemplateRows: `repeat(3, ${btnSize})`,
          gap: gap,
          pointerEvents: "all",
        }}
      >
        {/* Hàng 1 */}
        <div />
        <div style={BTN_BASE} {...makeHandlers("up")}>▲</div>
        <div />

        {/* Hàng 2 */}
        <div style={BTN_BASE} {...makeHandlers("left")}>◀</div>
        <div />
        <div style={BTN_BASE} {...makeHandlers("right")}>▶</div>

        {/* Hàng 3 */}
        <div />
        <div style={BTN_BASE} {...makeHandlers("down")}>▼</div>
        <div />
      </div>

      {/* Nút BOOST bên phải */}
      <div
        style={{
          ...BTN_BASE,
          width: boostSize,
          height: boostSize,
          fontSize: "clamp(7px, 1.9vw, 11px)",
          fontWeight: 900,
          letterSpacing: "-0.3px",
          background: "rgba(231,76,60,0.5)",
          border: "2px solid rgba(231,76,60,0.9)",
          flexDirection: "column",
          gap: "clamp(0px, 0.3vw, 2px)",
          pointerEvents: "all",
        }}
        {...makeHandlers("space")}
      >
        <FaBolt style={{ width: "clamp(11px, 3.8vw, 22px)", height: "clamp(11px, 3.8vw, 22px)" }} />
        <span>BOOST</span>
      </div>
    </div>
  );
}