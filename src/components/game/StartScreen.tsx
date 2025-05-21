
// src/components/game/StartScreen.tsx
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8">
      {/* Preloading assets */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <img src="/background-lab.png" alt="Preload background lab" />
        <img src="/pixelbg.jpg" alt="Preload pixel background" />
        <audio src="/backgroundmusic.mp3" preload="auto"></audio>
        <audio src="/restart.mp3" preload="auto"></audio>
      </div>

      <Card className="w-full max-w-lg pixel-box bg-[hsl(var(--game-area-background))]">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl pixel-text text-primary">Bitcoin Pizza Day!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
          Bitcoin Pizza Day commemorates one of the most famous transactions in cryptocurrency history. On May 22, 2010, programmer Laszlo Hanyecz made the first known commercial purchase using Bitcoin when he bought two Papa John's pizzas for 10,000 BTC.
          </p>
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
          </p>
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
            Your mission: Grab as much pizza as you can, dodge the Minions, Crush the Minions by landing on them and cover the most miles to reach the emergency exit. Good luck, Runner!
          </p>
          <Button 
            onClick={onStartGame} 
            variant="primary" 
            className="pixel-box-primary pixel-text text-md sm:text-lg md:text-xl mt-4 md:mt-6 py-2 px-4 sm:py-3 sm:px-6"
            aria-label="Start Game"
          >
            Start Run!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartScreen;
