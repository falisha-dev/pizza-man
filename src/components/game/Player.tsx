// src/components/game/Player.tsx
"use client";

import type React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number; // Overall bounding box width (e.g., 48)
  height: number; // Overall bounding box height (e.g., 48)
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height }) => {
  // Colors based on the previous scientist/pixel character
  const hairColor = 'hsl(10, 70%, 50%)'; // Red-Orange
  const skinColor = 'hsl(30, 60%, 80%)'; // Light Peach
  const eyeWhiteColor = 'hsl(0, 0%, 100%)';
  const eyePupilColor = 'hsl(270, 15%, 20%)'; // Dark Purple (like pants accents)
  
  const jacketColor = 'hsl(180, 50%, 60%)'; // Teal
  // const jacketLinesColor = 'hsl(270, 20%, 30%)'; // Not used in this smooth version

  const pantsColor = 'hsl(270, 20%, 30%)'; // Dark Purple
  const bootsColor = 'hsl(270, 20%, 20%)'; // Darker Purple/Blackish

  const backpackColor = 'hsl(30, 30%, 35%)'; // Brown
  const backpackStrapColor = 'hsl(30, 30%, 25%)'; // Darker Brown

  // ViewBox for easier relative drawing. All coordinates below are % of this.
  const vbw = 100; 
  const vbh = 100;

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
        width="100%"
        height="100%"
        viewBox={`0 0 ${vbw} ${vbh}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Backpack - Drawn first to be behind */}
        <rect x={vbw * 0.58} y={vbh * 0.22} width={vbw * 0.32} height={vbh * 0.48} rx={vbw * 0.06} ry={vbh * 0.06} fill={backpackColor} />
        
        {/* Boots */}
        {/* Left Boot (viewer's left, character's right) */}
        <ellipse cx={vbw * 0.30} cy={vbh * 0.90} rx={vbw * 0.13} ry={vbh * 0.09} fill={bootsColor} />
        {/* Right Boot (viewer's right, character's left) */}
        <ellipse cx={vbw * 0.56} cy={vbh * 0.90} rx={vbw * 0.13} ry={vbh * 0.09} fill={bootsColor} />

        {/* Pants (Legs) */}
        {/* Left Leg */}
        <rect x={vbw * 0.22} y={vbh * 0.55} width={vbw * 0.16} height={vbh * 0.35} rx={vbw * 0.05} ry={vbh * 0.08} fill={pantsColor} />
        {/* Right Leg */}
        <rect x={vbw * 0.48} y={vbh * 0.55} width={vbw * 0.16} height={vbh * 0.35} rx={vbw * 0.05} ry={vbh * 0.08} fill={pantsColor} />
        
        {/* Jacket (Torso) */}
        <ellipse cx={vbw * 0.45} cy={vbh * 0.45} rx={vbw * 0.30} ry={vbh * 0.28} fill={jacketColor} />
        {/* Lower part for a bit of shape */}
        <ellipse cx={vbw * 0.45} cy={vbh * 0.50} rx={vbw * 0.32} ry={vbh * 0.25} fill={jacketColor} />

        {/* Arms */}
        {/* Left Arm (viewer's left, character's right - slightly forward) */}
        <ellipse cx={vbw * 0.12} cy={vbh * 0.50} rx={vbw * 0.10} ry={vbh * 0.20} fill={jacketColor} />
        <circle cx={vbw * 0.10} cy={vbh * 0.65} r={vbw * 0.07} fill={skinColor} /> {/* Hand */}
        
        {/* Right Arm (viewer's right, character's left - slightly back) */}
        <ellipse cx={vbw * 0.78} cy={vbh * 0.50} rx={vbw * 0.10} ry={vbh * 0.20} fill={jacketColor} />
        <circle cx={vbw * 0.80} cy={vbh * 0.65} r={vbw * 0.07} fill={skinColor} /> {/* Hand */}

        {/* Head */}
        <circle cx={vbw * 0.45} cy={vbh * 0.23} r={vbh * 0.19} fill={skinColor} />

        {/* Hair */}
        <path d={`
            M ${vbw * 0.22} ${vbh * 0.25} 
            C ${vbw * 0.15} ${vbh * 0.02}, ${vbw * 0.75} ${vbh * 0.02}, ${vbw * 0.68} ${vbh * 0.25}
            A ${vbh * 0.19} ${vbh * 0.19} 0 0 0 ${vbw * 0.22} ${vbh * 0.25} Z
        `} fill={hairColor} />
        {/* Hair tuft */}
        <path d={`
            M ${vbw * 0.40} ${vbh * 0.03} 
            Q ${vbw * 0.45} ${vbh * -0.02}, ${vbw * 0.50} ${vbh * 0.03} 
            Q ${vbw * 0.45} ${vbh * 0.06}, ${vbw * 0.40} ${vbh * 0.03} Z
        `} fill={hairColor} />
         <path d={`
            M ${vbw * 0.48} ${vbh * 0.01} 
            Q ${vbw * 0.53} ${vbh * -0.04}, ${vbw * 0.58} ${vbh * 0.01} 
            Q ${vbw * 0.53} ${vbh * 0.04}, ${vbw * 0.48} ${vbh * 0.01} Z
        `} fill={hairColor} />


        {/* Eyes */}
        {/* Left Eye */}
        <ellipse cx={vbw * 0.35} cy={vbh * 0.23} rx={vbw * 0.055} ry={vbh * 0.065} fill={eyeWhiteColor} />
        <ellipse cx={vbw * 0.36} cy={vbh * 0.24} rx={vbw * 0.025} ry={vbh * 0.035} fill={eyePupilColor} />
        {/* Right Eye */}
        <ellipse cx={vbw * 0.55} cy={vbh * 0.23} rx={vbw * 0.055} ry={vbh * 0.065} fill={eyeWhiteColor} />
        <ellipse cx={vbw * 0.56} cy={vbh * 0.24} rx={vbw * 0.025} ry={vbh * 0.035} fill={eyePupilColor} />
        
        {/* Mouth - small smile */}
        <path d={`M ${vbw * 0.42} ${vbh * 0.32} Q ${vbw * 0.45} ${vbh * 0.35} ${vbw * 0.48} ${vbh * 0.32}`} stroke={eyePupilColor} strokeWidth={vbw * 0.012} fill="none" />

        {/* Backpack Strap - across chest, drawn on top of jacket */}
         <path 
          d={`M ${vbw * 0.20},${vbh * 0.30} C ${vbw * 0.35},${vbh * 0.38} ${vbw * 0.55},${vbh * 0.60} ${vbw * 0.75},${vbh * 0.55}`} 
          stroke={backpackStrapColor} 
          strokeWidth={vbw * 0.06} 
          fill="none" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Player;
