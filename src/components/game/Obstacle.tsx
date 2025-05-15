// src/components/game/Obstacle.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, color }) => {
  const viewBoxWidth = 24;
  const viewBoxHeight = 30;

  const goggleStrapColor = 'hsl(0, 0%, 20%)';
  const goggleLensFrameColor = 'hsl(0, 0%, 75%)';
  const eyeScleraColor = 'hsl(0, 0%, 100%)';
  const eyePupilColor = 'hsl(0, 0%, 10%)';
  const mouthColor = 'hsl(0, 0%, 10%)';

  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame(frame => (frame + 1) % 2); // Cycle between 0 and 1
    }, 250); // Animation speed
    return () => clearInterval(timer);
  }, []);

  // Leg positions for animation
  const legY = viewBoxHeight * 0.75;
  const legWidth = 4;
  const legHeight = 8;
  const legRx = 2;

  let leftLegX = viewBoxWidth * 0.25 - legWidth / 2;
  let rightLegX = viewBoxWidth * 0.75 - legWidth / 2;

  if (animationFrame === 0) {
    // Frame 0: Left leg slightly forward
    leftLegX -= 1;
    rightLegX += 1;
  } else {
    // Frame 1: Right leg slightly forward
    leftLegX += 1;
    rightLegX -= 1;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px -1px 0px hsl(var(--background))',
        imageRendering: 'pixelated',
      }}
      aria-label="Minion obstacle"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Minion Legs */}
        <rect x={leftLegX} y={legY} width={legWidth} height={legHeight} rx={legRx} ry={legRx} fill={color} />
        <rect x={rightLegX} y={legY} width={legWidth} height={legHeight} rx={legRx} ry={legRx} fill={color} />

        {/* Minion Body */}
        <ellipse cx={viewBoxWidth / 2} cy={viewBoxHeight / 2} rx={viewBoxWidth / 2 * 0.9} ry={viewBoxHeight / 2 * 0.85} fill={color} />

        {/* Goggle Strap */}
        <rect x="0" y={viewBoxHeight * 0.32} width={viewBoxWidth} height={viewBoxHeight * 0.15} fill={goggleStrapColor} />
        
        {/* Goggle Lens Frame */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.4} r={viewBoxWidth * 0.22} fill={goggleLensFrameColor} />
        
        {/* Eye Sclera */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.4} r={viewBoxWidth * 0.18} fill={eyeScleraColor} />
        
        {/* Eye Pupil */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.42} r={viewBoxWidth * 0.09} fill={eyePupilColor} />

        {/* Mouth */}
        <path d={`M ${viewBoxWidth * 0.35} ${viewBoxHeight * 0.62} Q ${viewBoxWidth / 2} ${viewBoxHeight * 0.70} ${viewBoxWidth * 0.65} ${viewBoxHeight * 0.62}`} stroke={mouthColor} strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export default Obstacle;
