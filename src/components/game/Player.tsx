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
  // Proportions for a scientist, assuming a 24x24 base for ratio calculations
  // All parts are centered horizontally within the player's bounding box.

  const hairHeight = Math.round(height * (4/24));
  const hairWidth = Math.round(width * (12/24));

  const faceHeight = Math.round(height * (6/24));
  const faceWidth = Math.round(width * (12/24)); // Same width as hair

  const coatHeight = Math.round(height * (10/24));
  const coatWidth = Math.round(width * (16/24)); // Lab coat is wider

  const pantsHeight = Math.round(height * (4/24)); // Remaining height
  const pantsWidth = Math.round(width * (12/24)); // Same width as hair/face

  // Colors
  const hairAndPantsColor = 'hsl(var(--muted-foreground))'; // Dark grey from theme
  const faceColor = 'hsl(30, 60%, 80%)'; // Light skin tone
  const labCoatColor = 'hsl(200, 30%, 95%)'; // Very light grey/off-white, slightly bluish

  const partShadow = '1px 1px 0px hsl(var(--foreground)), -1px 0px 0px hsl(var(--background))';

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
        alignItems: 'center', // Center parts horizontally
        justifyContent: 'flex-start', // Align parts to the top
        imageRendering: 'pixelated',
      }}
      aria-label="Player character (scientist)"
    >
      {/* Hair */}
      <div
        style={{
          width: `${hairWidth}px`,
          height: `${hairHeight}px`,
          backgroundColor: hairAndPantsColor,
          boxShadow: partShadow,
        }}
        aria-label="Scientist hair"
      />
      {/* Face */}
      <div
        style={{
          width: `${faceWidth}px`,
          height: `${faceHeight}px`,
          backgroundColor: faceColor,
          boxShadow: partShadow,
        }}
        aria-label="Scientist face"
      />
      {/* Lab Coat */}
      <div
        style={{
          width: `${coatWidth}px`,
          height: `${coatHeight}px`,
          backgroundColor: labCoatColor,
          boxShadow: partShadow,
        }}
        aria-label="Scientist lab coat"
      />
      {/* Pants */}
      <div
        style={{
          width: `${pantsWidth}px`,
          height: `${pantsHeight}px`,
          backgroundColor: hairAndPantsColor,
          boxShadow: partShadow,
        }}
        aria-label="Scientist pants"
      />
    </div>
  );
};

export default Player;
