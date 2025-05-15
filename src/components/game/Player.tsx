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
  // Colors
  const skinColor = 'hsl(35, 70%, 75%)'; 
  const hairColor = 'hsl(30, 50%, 30%)'; // Dark Brown hair
  const shirtColor = 'hsl(var(--primary))'; 
  const pantsColor = 'hsl(220, 40%, 35%)'; // Denim Blue
  const backpackColor = 'hsl(120, 35%, 45%)'; // Forest Green
  const shoeColor = 'hsl(0, 0%, 25%)'; // Dark Gray/Black

  // Proportions based on overall width and height
  // These are tuned for a character facing roughly right.

  // Backpack (drawn first, so it's behind)
  const bpW = width * 0.5;
  const bpH = height * 0.6;
  const bpX = width * 0.1;
  const bpY = height * 0.15;
  const bpRx = width * 0.08;

  // "Far" Leg (slightly behind torso)
  const legW = width * 0.22;
  const legH = height * 0.45;
  const shoeH = legH * 0.2;
  const pantsH = legH - shoeH;
  
  const farLegX = width * 0.3;
  const legY = height * 0.5; // Starts roughly at bottom of torso

  // "Far" Arm (slightly behind torso)
  const armW = width * 0.18;
  const armH = height * 0.38;
  const handR = armW * 0.6; // Radius for hand

  const farArmX = width * 0.25;
  const farArmY = height * 0.25; // Starts from shoulder area

  // Torso
  const torsoW = width * 0.45;
  const torsoH = height * 0.4;
  const torsoX = width * 0.28; // Positioned to align with limbs and backpack
  const torsoY = height * 0.2;
  const torsoRx = width * 0.05;

  // "Near" Leg (in front of torso from this perspective)
  const nearLegX = width * 0.5;

  // Head
  const headR = width * 0.18;
  const headCx = torsoX + torsoW * 0.6; // Positioned towards the front of torso
  const headCy = torsoY - headR * 0.1 + headR; // Sits on top of torso

  // Hair (simple rounded cap style)
  const hairW = headR * 2.2;
  const hairH = headR * 1.5;
  const hairX = headCx - hairW / 2;
  const hairY = headCy - headR * 1.2; // Sits on top of head
  const hairRx = headR * 0.5;

  // "Near" Arm (in front of torso)
  const nearArmX = torsoX + torsoW - armW * 0.7;
  const nearArmY = height * 0.28;


  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        // No imageRendering: 'pixelated' for a smoother look
      }}
      aria-label="Player character"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }} 
      >
        {/* Backpack */}
        <rect
          x={bpX}
          y={bpY}
          width={bpW}
          height={bpH}
          fill={backpackColor}
          rx={bpRx}
          ry={bpRx}
        />

        {/* Far Leg - Pants */}
        <rect
          x={farLegX}
          y={legY}
          width={legW}
          height={pantsH}
          fill={pantsColor}
          rx={width*0.03} ry={width*0.03}
        />
        {/* Far Leg - Shoe */}
        <rect
          x={farLegX}
          y={legY + pantsH}
          width={legW}
          height={shoeH}
          fill={shoeColor}
          rx={width*0.03} ry={width*0.03}
        />
        
        {/* Far Arm - Sleeve */}
        <rect
          x={farArmX}
          y={farArmY}
          width={armW}
          height={armH}
          fill={shirtColor}
          rx={width*0.03} ry={width*0.03}
        />
        {/* Far Arm - Hand */}
        <circle 
          cx={farArmX + armW / 2} 
          cy={farArmY + armH} 
          r={handR/2} 
          fill={skinColor} 
        />

        {/* Torso */}
        <rect
          x={torsoX}
          y={torsoY}
          width={torsoW}
          height={torsoH}
          fill={shirtColor}
          rx={torsoRx}
          ry={torsoRx}
        />

        {/* Near Leg - Pants */}
        <rect
          x={nearLegX}
          y={legY}
          width={legW}
          height={pantsH}
          fill={pantsColor}
          rx={width*0.03} ry={width*0.03}
        />
        {/* Near Leg - Shoe */}
        <rect
          x={nearLegX}
          y={legY + pantsH}
          width={legW}
          height={shoeH}
          fill={shoeColor}
          rx={width*0.03} ry={width*0.03}
        />

        {/* Head */}
        <circle
          cx={headCx}
          cy={headCy}
          r={headR}
          fill={skinColor}
        />

        {/* Hair */}
        <rect
          x={hairX}
          y={hairY}
          width={hairW}
          height={hairH}
          fill={hairColor}
          rx={hairRx}
          ry={hairRx}
        />
        
        {/* Near Arm - Sleeve */}
        <rect
          x={nearArmX}
          y={nearArmY}
          width={armW}
          height={armH}
          fill={shirtColor}
          rx={width*0.03} ry={width*0.03}
        />
        {/* Near Arm - Hand */}
        <circle 
          cx={nearArmX + armW / 2} 
          cy={nearArmY + armH} 
          r={handR/2} 
          fill={skinColor} 
        />
      </svg>
    </div>
  );
};

export default Player;
