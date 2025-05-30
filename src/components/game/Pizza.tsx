
// src/components/game/Pizza.tsx
"use client";

import type React from 'react';

interface PizzaProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PizzaComponent: React.FC<PizzaProps> = ({ x, y, width, height }) => {
  const crustColor = "hsl(30, 50%, 60%)"; 
  const cheeseColor = "hsl(50, 90%, 70%)"; 
  const pepperoniColor = "hsl(0, 70%, 50%)"; 

  // Scale factor for details if needed, assuming default width/height are around 28-30
  const pepperoniRadius = width / 9; 

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        imageRendering: 'pixelated', 
      }}
      aria-label="Pizza slice collectible"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 32 32" // A fixed viewBox for easier path definition
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main Pizza Slice (Cheese) - A triangular shape with a curved bottom */}
        <path 
          d="M 5 27 Q 16 30 27 27 L 16 5 Z" 
          fill={cheeseColor} 
        />
        
        {/* Crust - Follows the curve of the pizza base */}
        <path 
          d="M 5 27 Q 16 30 27 27 C 27 25, 25 24, 22 24 Q 16 25 10 24 C 7 24, 5 25, 5 27 Z"
          fill={crustColor}
        />

        {/* Pepperonis - Positioned within the cheese area */}
        <circle cx="16" cy="13" r={pepperoniRadius * 0.9} fill={pepperoniColor} />
        <circle cx="11" cy="18" r={pepperoniRadius * 0.75} fill={pepperoniColor} />
        <circle cx="21" cy="19" r={pepperoniRadius * 0.85} fill={pepperoniColor} />
        <circle cx="17" cy="23" r={pepperoniRadius * 0.7} fill={pepperoniColor} />
      </svg>
    </div>
  );
};

export default PizzaComponent;

