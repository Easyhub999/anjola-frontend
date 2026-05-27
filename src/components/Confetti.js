import { useEffect, useState } from 'react';

const COLORS = ['#e84393', '#a855f7', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f97316'];

const Confetti = ({ trigger, originX, originY }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: (originX || window.innerWidth / 2) + (Math.random() - 0.5) * 200,
      y: (originY || window.innerHeight / 2) - Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      delay: Math.random() * 0.3,
      dx: (Math.random() - 0.5) * 300,
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 2000);
    return () => clearTimeout(timer);
  }, [trigger, originX, originY]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            animationDelay: `${piece.delay}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
