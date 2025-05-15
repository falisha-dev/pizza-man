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

  // Proportions for a more defined human look within width x height
  
  // Head Group
  const headR = width * 0.18; 
  const headCx = width * 0.6; 
  const headCy = height * 0.23;

  const neckW = headR * 0.7;
  const neckH = height * 0.08;
  const neckX = headCx - neckW / 2;
  const neckY = headCy + headR * 0.7; // Neck connects below head center

  const hairW = headR * 2.4;
  const hairH = headR * 1.8; 
  const hairX = headCx - hairW / 2;
  const hairY = headCy - headR * 1.2; 
  const hairRx = headR * 0.7;

  // Torso
  const torsoW = width * 0.42;
  const torsoH = height * 0.38;
  const torsoX = headCx - torsoW * 0.65; 
  const torsoY = neckY + neckH * 0.6; 
  const torsoRx = width * 0.08;

  // Arms
  const armW = width * 0.16;
  const armH = height * 0.36;
  const handRadius = armW * 0.55;
  const armRx = width * 0.05;

  // Far Arm (swings slightly back)
  const farArmX = torsoX + armW * 0.1;
  const farArmY = torsoY + torsoH * 0.1;
  const farHandCx = farArmX + armW / 2;
  const farHandCy = farArmY + armH;

  // Near Arm (swings slightly forward)
  const nearArmX = torsoX + torsoW - armW * 1.1;
  const nearArmY = torsoY + torsoH * 0.15;
  const nearHandCx = nearArmX + armW / 2;
  const nearHandCy = nearArmY + armH;
  
  // Legs
  const legW = width * 0.19;
  const legH = height * 0.42;
  const shoeH = legH * 0.22;
  const pantsH = legH - shoeH;
  const legRx = width * 0.05;
  const legTopY = torsoY + torsoH - legH * 0.15;

  // Far Leg
  const farLegX = torsoX + torsoW * 0.2;
  
  // Near Leg
  const nearLegX = torsoX + torsoW * 0.55;

  // Backpack
  const bpW = width * 0.40;
  const bpH = height * 0.50;
  const bpX = torsoX - bpW * 0.45; 
  const bpY = torsoY + torsoH * 0.1;
  const bpRx = width * 0.1;

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
        style={{ overflow: 'visible' }} 
      >
        {/* Backpack */}
        <rect x={bpX} y={bpY} width={bpW} height={bpH} fill={backpackColor} rx={bpRx} ry={bpRx} />

        {/* Far Leg - Pants */}
        <rect x={farLegX} y={legTopY} width={legW} height={pantsH} fill={pantsColor} rx={legRx} ry={legRx}/>
        {/* Far Leg - Shoe */}
        <rect x={farLegX} y={legTopY + pantsH} width={legW} height={shoeH} fill={shoeColor} rx={legRx} ry={legRx}/>
        
        {/* Far Arm - Sleeve */}
        <rect x={farArmX} y={farArmY} width={armW} height={armH} fill={shirtColor} rx={armRx} ry={armRx}/>
        {/* Far Arm - Hand */}
        <circle cx={farHandCx} cy={farHandCy} r={handRadius} fill={skinColor} />

        {/* Torso */}
        <rect x={torsoX} y={torsoY} width={torsoW} height={torsoH} fill={shirtColor} rx={torsoRx} ry={torsoRx}/>
        
        {/* Neck */}
        <rect x={neckX} y={neckY} width={neckW} height={neckH} fill={skinColor} rx={width*0.03} ry={width*0.03}/>

        {/* Near Leg - Pants */}
        <rect x={nearLegX} y={legTopY} width={legW} height={pantsH} fill={pantsColor} rx={legRx} ry={legRx}/>
        {/* Near Leg - Shoe */}
        <rect x={nearLegX} y={legTopY + pantsH} width={legW} height={shoeH} fill={shoeColor} rx={legRx} ry={legRx}/>

        {/* Near Arm - Sleeve */}
        <rect x={nearArmX} y={nearArmY} width={armW} height={armH} fill={shirtColor} rx={armRx} ry={armRx}/>
        {/* Near Arm - Hand */}
        <circle cx={nearHandCx} cy={nearHandCy} r={handRadius} fill={skinColor} />
        
        {/* Head */}
        <circle cx={headCx} cy={headCy} r={headR} fill={skinColor} />

        {/* Hair */}
        <rect x={hairX} y={hairY} width={hairW} height={hairH} fill={hairColor} rx={hairRx} ry={hairRx} />
      </svg>
    </div>
  );
};

export default Player;
