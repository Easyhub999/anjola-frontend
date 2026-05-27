import { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const trailRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia('(hover: none)').matches) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverStart = (e) => {
      if (e.target.closest('button, a, [role="button"], input, textarea, select, .cursor-pointer')) {
        setIsHovering(true);
      }
    };
    const handleHoverEnd = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleHoverStart, { passive: true });
    document.addEventListener('mouseout', handleHoverEnd, { passive: true });

    // Smooth trail animation
    const animateTrail = () => {
      trailRef.current.x += (position.x - trailRef.current.x) * 0.15;
      trailRef.current.y += (position.y - trailRef.current.y) * 0.15;
      rafRef.current = requestAnimationFrame(animateTrail);
    };
    rafRef.current = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleHoverStart);
      document.removeEventListener('mouseout', handleHoverEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [position.x, position.y]);

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed pointer-events-none z-[99999] mix-blend-difference hidden md:block"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : isHovering ? 2.5 : 1})`,
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: isHovering
              ? 'radial-gradient(circle, rgba(232,67,147,0.6) 0%, rgba(168,85,247,0.3) 100%)'
              : 'radial-gradient(circle, rgba(232,67,147,0.9) 0%, rgba(168,85,247,0.6) 100%)',
          }}
        />
      </div>

      {/* Trailing glow */}
      <div
        className="fixed pointer-events-none z-[99998] hidden md:block"
        style={{
          left: trailRef.current.x,
          top: trailRef.current.y,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 0.4 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div
          className="w-8 h-8 rounded-full blur-sm"
          style={{
            background: 'radial-gradient(circle, rgba(232,67,147,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Hide default cursor */}
      <style>{`
        @media (hover: hover) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
