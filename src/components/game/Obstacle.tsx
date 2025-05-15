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
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px -1px 0px hsl(var(--background))',
        imageRendering: 'pixelated',
      }}
      aria-label="Obstacle"
    />
  );
};

export default Obstacle;
