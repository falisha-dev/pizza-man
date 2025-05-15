// src/components/game/Player.tsx
"use client";

import type React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number; // Overall bounding box width
  height: number; // Overall bounding box height
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height }) => {
  // Colors based on the reference image
  const hairColor = 'hsl(10, 70%, 50%)'; // Red-Orange
  const skinColor = 'hsl(30, 60%, 80%)'; // Light Peach
  const eyeColor = 'hsl(270, 15%, 20%)'; // Dark Purple (like pants accents)
  
  const jacketColor = 'hsl(180, 50%, 60%)'; // Teal
  const jacketLinesColor = 'hsl(270, 20%, 30%)'; // Darker purple for jacket details

  const pantsColor = 'hsl(270, 20%, 30%)'; // Dark Purple
  const bootsColor = 'hsl(270, 20%, 20%)'; // Darker Purple/Blackish

  const backpackColor = 'hsl(30, 30%, 35%)'; // Brown
  const backpackStrapColor = 'hsl(30, 30%, 25%)'; // Darker Brown

  // Define a "pixel unit" relative to the player's overall size.
  // The reference image character is roughly 16-18 "source pixels" wide and 28-30 "source pixels" tall.
  // We'll scale these units to fit within the `width` and `height`.
  // Let's base our drawing on a conceptual grid of roughly 18 units across for width, and 22 for height to maintain aspect.
  const unitW = width / 18;
  const unitH = height / 22; // Character is taller than wide

  // Helper to make positioning easier, assuming character is centered
  const charOffsetX = 0; // If specific horizontal centering is needed within the box
  const charOffsetY = unitH * 1; // Start drawing a bit lower in the box

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      aria-label="Player character"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges" // Crucial for pixel-art look
      >
        {/* Backpack - Sits on character's left (viewer's right) */}
        <rect x={charOffsetX + unitW * 10} y={charOffsetY + unitH * 6} width={unitW * 4} height={unitH * 9} fill={backpackColor} />
        
        {/* Boots */}
        {/* Left Boot (viewer's left) */}
        <rect x={charOffsetX + unitW * 4} y={charOffsetY + unitH * 18} width={unitW * 3} height={unitH * 3} fill={bootsColor} />
        {/* Right Boot */}
        <rect x={charOffsetX + unitW * 8} y={charOffsetY + unitH * 18} width={unitW * 3} height={unitH * 3} fill={bootsColor} />

        {/* Pants */}
        {/* Left Leg */}
        <rect x={charOffsetX + unitW * 4} y={charOffsetY + unitH * 13} width={unitW * 3} height={unitH * 5} fill={pantsColor} />
        {/* Right Leg */}
        <rect x={charOffsetX + unitW * 8} y={charOffsetY + unitH * 13} width={unitW * 3} height={unitH * 5} fill={pantsColor} />

        {/* Jacket Body */}
        <rect x={charOffsetX + unitW * 3} y={charOffsetY + unitH * 6} width={unitW * 9} height={unitH * 8} fill={jacketColor} />
        
        {/* Jacket Details - Vertical Lines */}
        <rect x={charOffsetX + unitW * 5} y={charOffsetY + unitH * 6} width={unitW * 1} height={unitH * 8} fill={jacketLinesColor} />
        <rect x={charOffsetX + unitW * 9} y={charOffsetY + unitH * 6} width={unitW * 1} height={unitH * 8} fill={jacketLinesColor} />
        {/* Jacket Details - Horizontal Lines/Seams */}
        <rect x={charOffsetX + unitW * 3} y={charOffsetY + unitH * 9} width={unitW * 9} height={unitH * 1} fill={jacketLinesColor} />
         <rect x={charOffsetX + unitW * 3} y={charOffsetY + unitH * 12} width={unitW * 9} height={unitH * 1} fill={jacketLinesColor} />


        {/* Arms - Simple blocks, could be more nuanced if needed */}
        {/* Left Arm (viewer's left) */}
        <rect x={charOffsetX + unitW * 1} y={charOffsetY + unitH * 7} width={unitW * 2} height={unitH * 5} fill={jacketColor} />
        {/* Right Arm - mostly behind backpack strap potentially */}
        <rect x={charOffsetX + unitW * 12} y={charOffsetY + unitH * 7} width={unitW * 2} height={unitH * 5} fill={jacketColor} />
        
        {/* Head */}
        <rect x={charOffsetX + unitW * 4} y={charOffsetY + unitH * 1} width={unitW * 7} height={unitH * 6} fill={skinColor} />

        {/* Hair */}
        {/* Main hair mass */}
        <rect x={charOffsetX + unitW * 3} y={charOffsetY + unitH * 0} width={unitW * 9} height={unitH * 4} fill={hairColor} />
        {/* Sideburns / hair covering ears area */}
        <rect x={charOffsetX + unitW * 3} y={charOffsetY + unitH * 2} width={unitW * 2} height={unitH * 4} fill={hairColor} />
        <rect x={charOffsetX + unitW * 10} y={charOffsetY + unitH * 2} width={unitW * 2} height={unitH * 4} fill={hairColor} />
        {/* Top tuft */}
        <rect x={charOffsetX + unitW * 6} y={charOffsetY + unitH * -1} width={unitW * 2.5} height={unitH * 2} fill={hairColor} />
        <rect x={charOffsetX + unitW * 7} y={charOffsetY + unitH * -2} width={unitW * 1.5} height={unitH * 1} fill={hairColor} />


        {/* Eyes - simple dots */}
        <rect x={charOffsetX + unitW * 5.5} y={charOffsetY + unitH * 3.5} width={unitW * 1} height={unitH * 1.5} fill={eyeColor} />
        <rect x={charOffsetX + unitW * 8.5} y={charOffsetY + unitH * 3.5} width={unitW * 1} height={unitH * 1.5} fill={eyeColor} />

        {/* Backpack Strap - Diagonal across torso */}
        {/* This is tricky with simple rects, might need multiple or a transform. For simplicity, a thicker blocky strap. */}
        <rect x={charOffsetX + unitW * 4} y={charOffsetY + unitH * 6} width={unitW * 6} height={unitH * 1.5} fill={backpackStrapColor} transform={`rotate(15 ${charOffsetX + unitW * 7} ${charOffsetY + unitH * 7})`} />
         {/* Second part of strap for thickness or to connect to backpack */}
        <rect x={charOffsetX + unitW * 9} y={charOffsetY + unitH * 6.5} width={unitW * 1.5} height={unitH * 4} fill={backpackStrapColor} />


      </svg>
    </div>
  );
};

export default Player;
