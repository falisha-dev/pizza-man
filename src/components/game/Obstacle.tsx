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
  // Define conceptual units for drawing the minion, similar to Player.tsx
  // Minion is conceptually 10 units wide and 12 units tall.
  const unitW = width / 10;
  const unitH = height / 12;

  // Colors for eye parts
  const eyeScleraColor = 'hsl(var(--card-foreground))'; // A light color
  const eyePupilColor = 'hsl(var(--background))';    // A dark color

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        // backgroundColor: color, // Removed, SVG will fill the shape
        boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px -1px 0px hsl(var(--background))',
        imageRendering: 'pixelated',
      }}
      aria-label="Minion obstacle"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`} // Use actual width/height for viewBox if units are scaled
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges" // Crucial for pixel-art look
      >
        {/* Minion Body */}
        <rect
          x={unitW * 1}
          y={unitH * 0}
          width={unitW * 8}
          height={unitH * 8.5}
          fill={color}
        />

        {/* Minion Legs */}
        {/* Left Leg */}
        <rect
          x={unitW * 1.5}
          y={unitH * 8.5}
          width={unitW * 3}
          height={unitH * 3.5}
          fill={color}
        />
        {/* Right Leg */}
        <rect
          x={unitW * 5.5}
          y={unitH * 8.5}
          width={unitW * 3}
          height={unitH * 3.5}
          fill={color}
        />

        {/* Minion Eye */}
        {/* Sclera (white part) - slightly larger for a border */}
        <rect
          x={unitW * 3}
          y={unitH * 2}
          width={unitW * 4}
          height={unitH * 3.5}
          fill={eyeScleraColor}
        />
        {/* Pupil (black part) */}
        <rect
          x={unitW * 4}
          y={unitH * 2.5}
          width={unitW * 2}
          height={unitH * 2.5}
          fill={eyePupilColor}
        />
      </svg>
    </div>
  );
};

export default Obstacle;
