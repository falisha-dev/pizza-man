
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-2 md:p-4 selection:bg-primary selection:text-primary-foreground" style={{ backgroundImage: "url('/background-lab.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 pixel-text text-center">Pizza Man</h1>
      {gameStarted ? (
        <Game />
      ) : (
        <StartScreen onStartGame={handleStartGame} />
      )}
    </main>
  );
}
