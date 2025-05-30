
// src/app/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react'; 
import Game from '@/components/game/Game';
import StartScreen from '@/components/game/StartScreen'; 
import { useIsMobile } from '@/hooks/use-mobile';

export default function HomePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const isMobile = useIsMobile();

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (isMobile === undefined) {
    // Wait until mobile status is determined to prevent hydration mismatch
    return null; // Or a loading spinner if preferred
  }

  if (isMobile) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center selection:bg-primary selection:text-primary-foreground" style={{ backgroundImage: "url('/background-lab.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="pixel-box bg-card text-card-foreground p-6 md:p-8 rounded-md shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 pixel-text text-primary">Sorry!</h1>
          <p className="text-sm sm:text-base mb-2 pixel-text">This game is currently optimized for PC and larger screens.</p>
          <p className="text-sm sm:text-base pixel-text">A mobile version is coming soon!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground" style={{ backgroundImage: "url('/background-lab.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="game-content-wrapper w-full max-w-5xl p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 pixel-text text-center">Pizza Man</h1>
        {gameStarted ? (
          <Game /> // Removed onExitGame prop
        ) : (
          <StartScreen onStartGame={handleStartGame} />
        )}
      </div>
    </main>
  );
}
