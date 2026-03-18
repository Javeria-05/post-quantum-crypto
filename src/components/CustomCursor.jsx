import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Add trail effect (last 8 positions)
      setTrail(prev => [...prev.slice(-8), { 
        x: e.clientX, 
        y: e.clientY,
        id: Date.now() + Math.random() 
      }]);
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'A' || 
          e.target.classList.contains('feature-item')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div className="custom-cursor" style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isHovering ? '40px' : '28px',
        height: isHovering ? '40px' : '28px'
      }}>
        <div className="cursor-inner"></div>
      </div>

      {/* Trail effect */}
      {trail.map((t, i) => (
        <div key={t.id} className="cursor-trail" style={{
          left: `${t.x}px`,
          top: `${t.y}px`,
          opacity: 0.3 - (i * 0.03),
          transform: `scale(${1 - (i * 0.08)})`
        }} />
      ))}

      <style>{`
        .custom-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s;
        }

        .cursor-inner {
          width: 100%;
          height: 100%;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          animation: pulse 2s infinite;
        }

        .cursor-trail {
          position: fixed;
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: all 0.1s ease;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.8; 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
          50% { 
            transform: scale(1.1); 
            opacity: 1; 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }

        /* Hide default cursor */
        body, * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}