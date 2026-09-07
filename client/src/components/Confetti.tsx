import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const PIECE_COUNT = 70;
const COLORS = ["#5ec8f0", "#f5d547", "#ffb450", "#ffffff"];
const CLEANUP_MS = 3400;

type Piece = {
  id: number;
  style: CSSProperties;
};

function createPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, index) => {
    const horizontalDrift = (Math.random() - 0.5) * 260;
    const verticalDrift = 105 + Math.random() * 30;
    const rotation = (Math.random() - 0.5) * 1200;
    const duration = 1.7 + Math.random() * 1;
    const delay = Math.random() * 0.6;
    const color = COLORS[index % COLORS.length];
    const width = 6 + Math.random() * 6;
    const height = 9 + Math.random() * 10;
    const style = {
      "--dx": `${horizontalDrift}px`,
      "--dy": `${verticalDrift}vh`,
      "--rot": `${rotation}deg`,
      "--dur": `${duration}s`,
      "--delay": `${delay}s`,
      left: `${Math.random() * 100}%`,
      top: `${-12 - Math.random() * 12}vh`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
      borderRadius: index % 3 === 0 ? "50%" : "1px",
    } as CSSProperties;

    return { id: index, style };
  });
}

// Rains across the whole viewport, then removes itself so it never blocks taps.
// Portalled to <body> so no transformed ancestor can trap the fixed layer.
export function Confetti() {
  const pieces = useMemo(() => createPieces(), []);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), CLEANUP_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute block"
          style={piece.style}
        />
      ))}
    </div>,
    document.body,
  );
}
