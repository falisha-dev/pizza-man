// src/app/page.tsx
import Game from '@/components/game/Game';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-2 md:p-4 selection:bg-primary selection:text-primary-foreground">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 pixel-text text-center">Lab Escape</h1>
      <Game />
    </main>
  );
}
