
// src/components/game/RotateDevicePrompt.tsx
"use client";
import type React from 'react';
import { RotateCw } from 'lucide-react';

const RotateDevicePrompt: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-5 text-center text-foreground">
      <RotateCw className="mb-4 h-16 w-16 animate-spin text-primary" />
      <p className="pixel-text text-xl md:text-2xl">Please rotate your device</p>
      <p className="pixel-text text-sm md:text-base mt-2">This game is best played in landscape mode.</p>
    </div>
  );
};
export default RotateDevicePrompt;
