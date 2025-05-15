
// src/components/game/StartScreen.tsx
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8">
      <Card className="w-full max-w-lg pixel-box bg-[hsl(var(--game-area-background))]">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl pixel-text text-primary">Prepare for Escape!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
            You are a daring scientist, code-named "The Pizza Runner", making a mad dash for freedom from the top-secret "Flavor Labs"!
          </p>
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
            After a miscalculated experiment involving radioactive anchovies and a particle accelerator, you've accidentally created the galaxy's most delicious pizza.
            Naturally, everyone wants a slice - especially the perpetually hungry security Minions!
          </p>
          <p className="text-xs sm:text-sm md:text-base pixel-text text-foreground">
            Your mission: Grab as much pizza as you can, dodge the Minions, and cover the most miles to reach the emergency exit. Good luck, Runner!
          </p>
          <Button 
            onClick={onStartGame} 
            variant="primary" 
            className="pixel-text text-md sm:text-lg md:text-xl mt-4 md:mt-6 py-2 px-4 sm:py-3 sm:px-6"
          >
            Start Run!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartScreen;
