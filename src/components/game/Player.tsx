// src/components/game/Player.tsx
"use client";

import type React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'hsl(var(--player-color))',
        boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px -1px 0px hsl(var(--background))', // Basic pixelated depth
        imageRendering: 'pixelated',
      }}
      aria-label="Player character"
    />
  );
};

export default Player;
