// src/components/game/Obstacle.tsx
"use client";

import type React from 'react';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, color }) => {
  // Define a viewBox that allows for a typical minion proportion (taller than wide)
  // Let's use a conceptual 24 units wide by 30 units tall for drawing
  const viewBoxWidth = 24;
  const viewBoxHeight = 30;

  // Colors for goggle and eye (these will be standard for all minions)
  const goggleStrapColor = 'hsl(0, 0%, 20%)'; // Dark gray
  const goggleLensFrameColor = 'hsl(0, 0%, 75%)'; // Silver/Light gray
  const eyeScleraColor = 'hsl(0, 0%, 100%)'; // White
  const eyePupilColor = 'hsl(0, 0%, 10%)';   // Black
  const mouthColor = 'hsl(0, 0%, 10%)'; // Black

  // Calculate unit sizes based on the viewBox and actual component dimensions
  // This helps in scaling the drawing if width/height props change
  // However, for consistent minion shape, we might primarily use the viewBox
  // and let the SVG scale within the div.

  // For positioning legs to imply walking, one leg might be slightly forward
  // We'll simplify this for a static pose that still suggests legs.

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        // The existing box shadow creates a pixel-style border around the smooth SVG
        boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px -1px 0px hsl(var(--background))',
        imageRendering: 'pixelated', // Applies to the container, SVG content can be smooth
      }}
      aria-label="Minion obstacle"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet" // Ensures minion scales nicely
      >
        {/* Minion Legs (simple rounded rectangles) */}
        {/* Left Leg */}
        <rect x={viewBoxWidth * 0.25 - 2} y={viewBoxHeight * 0.75} width="4" height="8" rx="2" ry="2" fill={color} />
        {/* Right Leg */}
        <rect x={viewBoxWidth * 0.75 - 2} y={viewBoxHeight * 0.75} width="4" height="8" rx="2" ry="2" fill={color} />

        {/* Minion Body (Ellipse) */}
        <ellipse cx={viewBoxWidth / 2} cy={viewBoxHeight / 2} rx={viewBoxWidth / 2 * 0.9} ry={viewBoxHeight / 2 * 0.85} fill={color} />

        {/* Goggle Strap */}
        <rect x="0" y={viewBoxHeight * 0.32} width={viewBoxWidth} height={viewBoxHeight * 0.15} fill={goggleStrapColor} />
        
        {/* Goggle Lens Frame (Centered) */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.4} r={viewBoxWidth * 0.22} fill={goggleLensFrameColor} />
        
        {/* Eye Sclera (White part) */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.4} r={viewBoxWidth * 0.18} fill={eyeScleraColor} />
        
        {/* Eye Pupil */}
        <circle cx={viewBoxWidth / 2} cy={viewBoxHeight * 0.42} r={viewBoxWidth * 0.09} fill={eyePupilColor} />

        {/* Mouth (simple curve) */}
        <path d={`M ${viewBoxWidth * 0.35} ${viewBoxHeight * 0.62} Q ${viewBoxWidth / 2} ${viewBoxHeight * 0.70} ${viewBoxWidth * 0.65} ${viewBoxHeight * 0.62}`} stroke={mouthColor} strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export default Obstacle;
