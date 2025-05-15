// src/components/game/Player.tsx
"use client";

import type React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number; // Overall bounding box width (e.g., PLAYER_WIDTH = 24)
  height: number; // Overall bounding box height (e.g., PLAYER_HEIGHT = 24)
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height }) => {
  // Simple pixel human proportions within the given width and height
  // These proportions aim to create a discernible head and body
  const headHeightRatio = 0.35; // Head is ~35% of total height
  const headWidthRatio = 0.6;  // Head is ~60% of player width

  // Body height will be the remainder, body width will be slightly wider than head
  const bodyWidthRatio = 0.8; // Body is ~80% of player width

  const calculatedHeadHeight = Math.round(height * headHeightRatio);
  const calculatedHeadWidth = Math.round(width * headWidthRatio);

  // Ensure total height is met by calculating body height as the remainder
  const calculatedBodyHeight = height - calculatedHeadHeight; 
  const calculatedBodyWidth = Math.round(width * bodyWidthRatio);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Horizontally center head and body within the player's bounding box
        justifyContent: 'flex-start', // Align parts to the top of the bounding box
        imageRendering: 'pixelated',
      }}
      aria-label="Player character"
    >
      {/* Head */}
      <div
        style={{
          width: `${calculatedHeadWidth}px`,
          height: `${calculatedHeadHeight}px`,
          backgroundColor: 'hsl(var(--player-color))',
          // Using a shadow similar to obstacles for consistency
          boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px 0px 0px hsl(var(--background))',
        }}
        aria-label="Player head"
      />
      {/* Body */}
      <div
        style={{
          width: `${calculatedBodyWidth}px`,
          height: `${calculatedBodyHeight}px`,
          backgroundColor: 'hsl(var(--player-color))',
          boxShadow: '1px 1px 0px hsl(var(--foreground)), -1px 0px 0px hsl(var(--background))',
        }}
        aria-label="Player body"
      />
    </div>
  );
};

export default Player;
