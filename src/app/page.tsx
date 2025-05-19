
// src/app/page.tsx
"use client"; 

import React, { useState } from 'react'; 
import Game from '@/components/game/Game';
import StartScreen from '@/components/game/StartScreen'; 

export default function HomePage() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground" style={{ backgroundImage: "url('/background-lab.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="game-content-wrapper w-full max-w-5xl p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 pixel-text text-center">Pizza Man</h1>
        {gameStarted ? (
          <Game />
        ) : (
          <StartScreen onStartGame={handleStartGame} />
        )}
      </div>
    </main>
  );
}
