// src/components/game/Player.tsx
"use client";

import type React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number; // Overall bounding box width (e.g., 48)
  height: number; // Overall bounding box height (e.g., 48)
  animationFrame: number; // 0 for standing, 1 for walk frame 1, 2 for walk frame 2
  isMoving: boolean;
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height, animationFrame, isMoving }) => {
  const hairColor = 'hsl(10, 70%, 50%)';
  const skinColor = 'hsl(30, 60%, 80%)';
  const eyeWhiteColor = 'hsl(0, 0%, 100%)';
  const eyePupilColor = 'hsl(270, 15%, 20%)';
  const jacketColor = 'hsl(180, 50%, 60%)';
  const pantsColor = 'hsl(270, 20%, 30%)';
  const bootsColor = 'hsl(270, 20%, 20%)';
  const backpackColor = 'hsl(30, 30%, 35%)';
  const backpackStrapColor = 'hsl(30, 30%, 25%)';

  const vbw = 100;
  const vbh = 100;

  // Animation parameters
  const armSwingAngle = 15; // degrees
  const legStride = vbw * 0.08;

  // Default standing positions
  let leftArmTransform = `rotate(0, ${vbw * 0.12}, ${vbh * 0.50})`;
  let rightArmTransform = `rotate(0, ${vbw * 0.78}, ${vbh * 0.50})`;
  let leftHandCx = vbw * 0.10;
  let rightHandCx = vbw * 0.80;
  let leftLegX = vbw * 0.22;
  let rightLegX = vbw * 0.48;
  
  if (isMoving) {
    if (animationFrame === 1) {
      // Frame 1: Left leg forward, right arm forward
      leftLegX += legStride / 2;
      rightLegX -= legStride / 2;
      leftArmTransform = `rotate(${armSwingAngle}, ${vbw * 0.12}, ${vbh * 0.45})`;
      rightArmTransform = `rotate(-${armSwingAngle}, ${vbw * 0.78}, ${vbh * 0.45})`;
      leftHandCx -= vbw * 0.02; // Adjust hand position with arm swing
      rightHandCx += vbw * 0.02;
    } else if (animationFrame === 2) {
      // Frame 2: Right leg forward, left arm forward
      leftLegX -= legStride / 2;
      rightLegX += legStride / 2;
      leftArmTransform = `rotate(-${armSwingAngle}, ${vbw * 0.12}, ${vbh * 0.45})`;
      rightArmTransform = `rotate(${armSwingAngle}, ${vbw * 0.78}, ${vbh * 0.45})`;
      leftHandCx += vbw * 0.02;
      rightHandCx -= vbw * 0.02;
    }
  }


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
        <ellipse cx={leftLegX + vbw * 0.08} cy={vbh * 0.90} rx={vbw * 0.13} ry={vbh * 0.09} fill={bootsColor} />
        <ellipse cx={rightLegX + vbw * 0.08} cy={vbh * 0.90} rx={vbw * 0.13} ry={vbh * 0.09} fill={bootsColor} />

        {/* Pants (Legs) */}
        <rect x={leftLegX} y={vbh * 0.55} width={vbw * 0.16} height={vbh * 0.35} rx={vbw * 0.05} ry={vbh * 0.08} fill={pantsColor} />
        <rect x={rightLegX} y={vbh * 0.55} width={vbw * 0.16} height={vbh * 0.35} rx={vbw * 0.05} ry={vbh * 0.08} fill={pantsColor} />
        
        {/* Jacket (Torso) */}
        <ellipse cx={vbw * 0.45} cy={vbh * 0.45} rx={vbw * 0.30} ry={vbh * 0.28} fill={jacketColor} />
        <ellipse cx={vbw * 0.45} cy={vbh * 0.50} rx={vbw * 0.32} ry={vbh * 0.25} fill={jacketColor} />

        {/* Arms */}
        <g transform={leftArmTransform}>
          <ellipse cx={vbw * 0.12} cy={vbh * 0.50} rx={vbw * 0.10} ry={vbh * 0.20} fill={jacketColor} />
          <circle cx={leftHandCx} cy={vbh * 0.65} r={vbw * 0.07} fill={skinColor} /> {/* Hand */}
        </g>
        <g transform={rightArmTransform}>
          <ellipse cx={vbw * 0.78} cy={vbh * 0.50} rx={vbw * 0.10} ry={vbh * 0.20} fill={jacketColor} />
          <circle cx={rightHandCx} cy={vbh * 0.65} r={vbw * 0.07} fill={skinColor} /> {/* Hand */}
        </g>

        {/* Head */}
        <circle cx={vbw * 0.45} cy={vbh * 0.23} r={vbh * 0.19} fill={skinColor} />

        {/* Hair */}
        <path d={`
            M ${vbw * 0.22} ${vbh * 0.25} 
            C ${vbw * 0.15} ${vbh * 0.02}, ${vbw * 0.75} ${vbh * 0.02}, ${vbw * 0.68} ${vbh * 0.25}
            A ${vbh * 0.19} ${vbh * 0.19} 0 0 0 ${vbw * 0.22} ${vbh * 0.25} Z
        `} fill={hairColor} />
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
        <ellipse cx={vbw * 0.35} cy={vbh * 0.23} rx={vbw * 0.055} ry={vbh * 0.065} fill={eyeWhiteColor} />
        <ellipse cx={vbw * 0.36} cy={vbh * 0.24} rx={vbw * 0.025} ry={vbh * 0.035} fill={eyePupilColor} />
        <ellipse cx={vbw * 0.55} cy={vbh * 0.23} rx={vbw * 0.055} ry={vbh * 0.065} fill={eyeWhiteColor} />
        <ellipse cx={vbw * 0.56} cy={vbh * 0.24} rx={vbw * 0.025} ry={vbh * 0.035} fill={eyePupilColor} />
        
        {/* Mouth */}
        <path d={`M ${vbw * 0.42} ${vbh * 0.32} Q ${vbw * 0.45} ${vbh * 0.35} ${vbw * 0.48} ${vbh * 0.32}`} stroke={eyePupilColor} strokeWidth={vbw * 0.012} fill="none" />

        {/* Backpack Strap */}
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
