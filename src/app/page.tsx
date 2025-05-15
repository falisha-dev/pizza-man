
// src/app/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react'; 
import Game from '@/components/game/Game';
import StartScreen from '@/components/game/StartScreen'; 
import RotateDevicePrompt from '@/components/game/RotateDevicePrompt';
import { useIsMobile } from '@/hooks/use-mobile';

export default function HomePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = (e: MediaQueryListEvent | Event) => {
      // Type guard for MediaQueryListEvent
      if ('matches' in e) {
        setIsPortrait(e.matches);
      }
    };
    
    setIsPortrait(portraitQuery.matches);
    // addEventListener has a different signature for MediaQueryList
    if (portraitQuery.addEventListener) {
      portraitQuery.addEventListener('change', handleChange);
    } else if ((portraitQuery as any).addListener) { // For older browsers
      (portraitQuery as any).addListener(handleChange);
    }
    
    return () => {
      if (portraitQuery.removeEventListener) {
        portraitQuery.removeEventListener('change', handleChange);
      } else if ((portraitQuery as any).removeListener) { // For older browsers
        (portraitQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (isMobile && isPortrait) {
    return <RotateDevicePrompt />;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground" style={{ backgroundImage: "url('/background-lab.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="game-content-wrapper w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 pixel-text text-center">Pizza Man</h1>
        {gameStarted ? (
          <Game />
        ) : (
          <StartScreen onStartGame={handleStartGame} />
        )}
      </div>
    </main>
  );
}
