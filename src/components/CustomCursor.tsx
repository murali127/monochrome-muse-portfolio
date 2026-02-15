import { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${e.clientX}px`;
        ringRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setClicking(true);
    };
    const handleMouseUp = (e: MouseEvent) => {
      setClicking(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, [data-cursor-hover]')) {
        setHovering(true);
      }
    };
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, [data-cursor-hover]')) {
        setHovering(false);
      }
    };

    // Initialize cursor position
    const initCursor = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${e.clientX}px`;
        ringRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseenter', initCursor, { once: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: hovering ? 12 : 8,
          height: hovering ? 12 : 8,
          borderRadius: '50%',
          background: 'white',
          transition: 'width 0.2s, height 0.2s',
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
        }}
      />
      <div
        ref={ringRef}
        className="fixed z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: hovering ? 60 : 40,
          height: hovering ? 60 : 40,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.5)',
          borderColor: clicking || hovering ? 'white' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.15s ease-out',
          transform: clicking ? 'translate(-50%, -50%) scale(0.8)' : 'translate(-50%, -50%)',
          willChange: 'left, top, transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
