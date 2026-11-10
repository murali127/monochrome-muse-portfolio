import { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const rafId = useRef<number | null>(null);
  const targetPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          const { x, y } = targetPos.current;
          if (dotRef.current) {
            dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          }
          if (ringRef.current) {
            ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          }
          rafId.current = null;
        });
      }
    };

    const handleMouseDown = () => setClicking(true);
    const handleMouseUp = () => setClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('a, button, [role="button"], input, textarea, [data-cursor-hover]')) {
        setHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('a, button, [role="button"], input, textarea, [data-cursor-hover]')) {
        setHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div className="hidden md:block">
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: hovering ? 12 : 8,
          height: hovering ? 12 : 8,
          borderRadius: '50%',
          background: 'white',
          transition: 'width 0.2s, height 0.2s',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: hovering ? 54 : 36,
          height: hovering ? 54 : 36,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.5)',
          borderColor: clicking || hovering ? 'white' : 'rgba(255,255,255,0.4)',
          transition: 'width 0.2s, height 0.2s, border-color 0.2s',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default CustomCursor;
