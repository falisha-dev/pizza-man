
// src/components/game/Game.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import PlayerComponent from './Player';
import ObstacleComponent from './Obstacle';
import PizzaComponent from './Pizza';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PauseIcon, PlayIcon } from 'lucide-react';

const GAME_WIDTH = 700;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const GRAVITY = 0.7;
const JUMP_STRENGTH = -13;
const JUMP_BOOST_STRENGTH = -7;
const STOMP_BOUNCE_STRENGTH = -10;
const PLAYER_HORIZONTAL_SPEED = 5;
const GROUND_Y = GAME_HEIGHT - PLAYER_HEIGHT;

const OBSTACLE_MIN_WIDTH = 24;
const OBSTACLE_MAX_WIDTH = 48;
const OBSTACLE_MIN_HEIGHT = 24;
const OBSTACLE_MAX_HEIGHT = 72;

const PIZZA_WIDTH = 28;
const PIZZA_HEIGHT = 28;

const initialObstacleSpeed = 2.5;
const initialObstacleSpawnInterval = 2200; // ms
const INITIAL_PIZZA_SPAWN_INTERVAL = 2800; // ms
const DIFFICULTY_UPDATE_MILESTONE = 75; // Increase difficulty every 75 miles

interface ObstacleState {
  id: string;
  worldX: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface PizzaState {
  id: string;
  worldX: number;
  y: number;
  width: number;
  height: number;
}

const obstacleColors = [
  'hsl(var(--obstacle-color-1))',
  'hsl(var(--obstacle-color-2))',
  'hsl(var(--obstacle-color-3))',
];

const PLAYER_ANIMATION_INTERVAL = 150; // ms per frame
const PLAYER_TARGET_SCREEN_X = 100;

// Helper functions for spawning, defined outside component to be stable
const createObstacle = (currentWorldScrollX: number): ObstacleState => {
  const width = OBSTACLE_MIN_WIDTH + Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH);
  const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
  const type = Math.random() > 0.3 ? 'ground' : 'floating';
  const floatingObstacleBaseY = GAME_HEIGHT - height - PLAYER_HEIGHT;
  const yPosition = type === 'ground'
    ? GAME_HEIGHT - height
    : floatingObstacleBaseY - Math.random() * PLAYER_HEIGHT * 1.2;

  return {
    id: `obs-${Date.now()}-${Math.random()}`,
    worldX: currentWorldScrollX + GAME_WIDTH,
    y: Math.max(0, yPosition),
    width,
    height,
    color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
  };
};

const createPizza = (currentWorldScrollX: number): PizzaState => {
  const width = PIZZA_WIDTH;
  const height = PIZZA_HEIGHT;
  const minY = PLAYER_HEIGHT * 0.7;
  const maxY = GROUND_Y - height - PLAYER_HEIGHT * 0.5;
  const yPosition = Math.random() * (maxY - minY) + minY;

  return {
    id: `pizza-${Date.now()}-${Math.random()}`,
    worldX: currentWorldScrollX + GAME_WIDTH,
    y: Math.max(minY, Math.min(yPosition, maxY)),
    width,
    height,
  };
};

interface GameProps {
  // onExitGame prop removed
}

const Game: React.FC<GameProps> = (/* { onExitGame } removed */) => {
  // UI State - directly used for rendering
  const [uiPlayerPositionY, setUiPlayerPositionY] = useState(GROUND_Y);
  const [uiPizzasCollected, setUiPizzasCollected] = useState(0);
  const [uiMilesCovered, setUiMilesCovered] = useState(0);
  const [uiObstacles, setUiObstacles] = useState<ObstacleState[]>([]);
  const [uiPizzas, setUiPizzas] = useState<PizzaState[]>([]);
  const [playerAnimationFrame, setPlayerAnimationFrame] = useState(0);
  const [isMovingHorizontally, setIsMovingHorizontally] = useState(false); // For player animation
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);
  const [scale, setScale] = useState(1);
  const [isPaused, setIsPaused] = useState(false);


  // Refs for game logic state - used inside gameLoop
  const playerWorldXRef = useRef(PLAYER_TARGET_SCREEN_X);
  const playerPositionYRef = useRef(GROUND_Y);
  const playerVelocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const canBoostJumpRef = useRef(false);
  const obstaclesRef = useRef<ObstacleState[]>([]);
  const pizzasRef = useRef<PizzaState[]>([]);
  const pizzasCollectedRef = useRef(0);
  const milesCoveredRef = useRef(0);
  const obstacleSpeedRef = useRef(initialObstacleSpeed);
  const obstacleSpawnIntervalRef = useRef(initialObstacleSpawnInterval);
  const pizzaSpawnIntervalRef = useRef(INITIAL_PIZZA_SPAWN_INTERVAL);
  
  const worldScrollXRef = useRef(0);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const lastObstacleSpawnTimeRef = useRef(0);
  const lastPizzaSpawnTimeRef = useRef(0);
  const milesIntervalTimerRef = useRef<NodeJS.Timeout>();
  const lastDifficultyUpdateMileRef = useRef(0);

  const scalerWrapperRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement>(null);


  useLayoutEffect(() => {
    const calculateScale = () => {
      if (scalerWrapperRef.current && gameAreaRef.current) {
        const availableWidth = scalerWrapperRef.current.offsetWidth;
        const availableHeight = scalerWrapperRef.current.offsetHeight;

        const gameVisualWidth = GAME_WIDTH; 
        const gameVisualHeight = GAME_HEIGHT; 

        let scaleX = availableWidth / gameVisualWidth;
        let scaleY = availableHeight / gameVisualHeight;
        
        let newScale = Math.min(scaleX, scaleY);

        const minScaleDesktop = 0.5; 
        const maxScaleDesktop = 1.75;

        newScale = Math.max(minScaleDesktop, Math.min(newScale, maxScaleDesktop));
        
        if (isNaN(newScale) || !isFinite(newScale)) {
          newScale = 1; // Default scale if calculation fails
        }
        setScale(newScale);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    window.addEventListener('orientationchange', calculateScale); 

    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', calculateScale);
    };
  }, []);


  const resetGame = useCallback(() => {
    playerWorldXRef.current = PLAYER_TARGET_SCREEN_X;
    playerPositionYRef.current = GROUND_Y;
    playerVelocityYRef.current = 0;
    isJumpingRef.current = false;
    canBoostJumpRef.current = false;
    
    obstaclesRef.current = [];
    pizzasRef.current = [];
    
    pizzasCollectedRef.current = 0;
    milesCoveredRef.current = 0;
    
    obstacleSpeedRef.current = initialObstacleSpeed;
    obstacleSpawnIntervalRef.current = initialObstacleSpawnInterval;
    pizzaSpawnIntervalRef.current = INITIAL_PIZZA_SPAWN_INTERVAL;

    setUiPlayerPositionY(GROUND_Y);
    setUiPizzasCollected(0);
    setUiMilesCovered(0);
    setUiObstacles([]);
    setUiPizzas([]);
    
    setGameOver(false);
    setGameRunning(true);
    setIsPaused(false);

    lastObstacleSpawnTimeRef.current = 0;
    lastPizzaSpawnTimeRef.current = 0;
    keysPressed.current = {};
    setPlayerAnimationFrame(0);
    setIsMovingHorizontally(false);
    if (milesIntervalTimerRef.current) clearInterval(milesIntervalTimerRef.current);
    lastDifficultyUpdateMileRef.current = 0;

    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.currentTime = 0;
      backgroundAudioRef.current.play().catch(error => console.warn("Audio play failed on reset:", error));
    }
    if (gameOverAudioRef.current) {
      gameOverAudioRef.current.pause();
      gameOverAudioRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (backgroundAudioRef.current) {
      if (gameRunning && !gameOver && !isPaused) {
        backgroundAudioRef.current.play().catch(error => console.warn("Background audio play failed:", error));
      } else {
        backgroundAudioRef.current.pause();
      }
    }
  }, [gameRunning, gameOver, isPaused]);

  useEffect(() => {
    if (gameOver && gameOverAudioRef.current) {
      gameOverAudioRef.current.currentTime = 0;
      gameOverAudioRef.current.play().catch(error => console.warn("Game over audio play failed:", error));
    }
  }, [gameOver]);

  const handlePauseToggle = useCallback(() => {
    if (gameOver) return;
    setIsPaused(prevPaused => !prevPaused);
  },[gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      handlePauseToggle();
      e.preventDefault(); 
      return;
    }
    if (isPaused) return;

    keysPressed.current[e.code] = true;
    if (e.repeat) return;

    if (e.code === 'Space' && gameOver) {
      resetGame();
      e.preventDefault();
      return;
    }

    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) {
        if (!gameRunning || gameOver) return;

        if (e.code === 'Space') {
            e.preventDefault(); // Prevent space from clicking focused buttons when used for jump
        }

        if (!isJumpingRef.current) {
            playerVelocityYRef.current = JUMP_STRENGTH;
            isJumpingRef.current = true;
            canBoostJumpRef.current = true;
        } else if (canBoostJumpRef.current && playerVelocityYRef.current < 0) {
            playerVelocityYRef.current += JUMP_BOOST_STRENGTH;
            canBoostJumpRef.current = false;
        }
    }
  }, [gameOver, gameRunning, resetGame, isPaused, handlePauseToggle]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.code] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    let animationTimer: NodeJS.Timeout;
    if (isMovingHorizontally && !gameOver && gameRunning && !isPaused) {
      animationTimer = setInterval(() => {
        setPlayerAnimationFrame(prevFrame => {
          if (prevFrame === 0 && !isMovingHorizontally) return 0;
          if (prevFrame === 0 || prevFrame === 2) return 1;
          return 2;
        });
      }, PLAYER_ANIMATION_INTERVAL);
    } else if (!isMovingHorizontally && !isJumpingRef.current) {
      setPlayerAnimationFrame(0);
    }
    return () => clearInterval(animationTimer);
  }, [isMovingHorizontally, gameOver, gameRunning, isPaused]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) {
      if (milesIntervalTimerRef.current) clearInterval(milesIntervalTimerRef.current);
      return;
    }
    milesIntervalTimerRef.current = setInterval(() => {
      milesCoveredRef.current += 1;
      setUiMilesCovered(mc => mc + 1);
    }, 100);
    return () => {
      if (milesIntervalTimerRef.current) clearInterval(milesIntervalTimerRef.current);
    }
  }, [gameRunning, gameOver, isPaused]);


  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRunning || gameOver || isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let currentMovement = false;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      playerWorldXRef.current -= PLAYER_HORIZONTAL_SPEED;
      currentMovement = true;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      playerWorldXRef.current += PLAYER_HORIZONTAL_SPEED;
      currentMovement = true;
    }
    playerWorldXRef.current = Math.max(PLAYER_TARGET_SCREEN_X, playerWorldXRef.current);
    setIsMovingHorizontally(currentMovement);

    worldScrollXRef.current = playerWorldXRef.current - PLAYER_TARGET_SCREEN_X;

    playerVelocityYRef.current += GRAVITY;
    playerPositionYRef.current += playerVelocityYRef.current;

    if (playerPositionYRef.current >= GROUND_Y) {
      playerPositionYRef.current = GROUND_Y;
      playerVelocityYRef.current = 0;
      if (isJumpingRef.current) {
        isJumpingRef.current = false;
        canBoostJumpRef.current = false;
        if (!currentMovement) setPlayerAnimationFrame(0);
      }
    } else if (playerVelocityYRef.current > 0 && isJumpingRef.current) {
      setPlayerAnimationFrame(2); 
    } else if (playerVelocityYRef.current < 0 && isJumpingRef.current) {
      setPlayerAnimationFrame(1);
    }
    setUiPlayerPositionY(playerPositionYRef.current);

    if (timestamp - lastObstacleSpawnTimeRef.current > obstacleSpawnIntervalRef.current) {
      const newObstacle = createObstacle(worldScrollXRef.current);
      obstaclesRef.current = [...obstaclesRef.current, newObstacle];
      lastObstacleSpawnTimeRef.current = timestamp;
    }

    if (timestamp - lastPizzaSpawnTimeRef.current > pizzaSpawnIntervalRef.current) {
      const newPizza = createPizza(worldScrollXRef.current);
      pizzasRef.current = [...pizzasRef.current, newPizza];
      lastPizzaSpawnTimeRef.current = timestamp;
    }
    
    const playerRect = { x: PLAYER_TARGET_SCREEN_X, y: playerPositionYRef.current, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    let newObstacles: ObstacleState[] = [];
    let minionStompedThisFrame = false;

    for (const obs of obstaclesRef.current) {
        const updatedObs = { ...obs, worldX: obs.worldX - obstacleSpeedRef.current };
        const obsScreenX = updatedObs.worldX - worldScrollXRef.current;

        if (obsScreenX + updatedObs.width <= 0) continue;
        if (obsScreenX > GAME_WIDTH) continue;

        let removeThisObstacle = false;
        const obsRect = { x: obsScreenX, y: updatedObs.y, width: updatedObs.width, height: updatedObs.height };

        if (
            playerRect.x < obsRect.x + obsRect.width &&
            playerRect.x + playerRect.width > obsRect.x &&
            playerRect.y < obsRect.y + obsRect.height &&
            playerRect.y + playerRect.height > obsRect.y
        ) {
            const playerIsFalling = playerVelocityYRef.current > 0;
            const playerFeetPreviousFrameY = (playerPositionYRef.current - playerVelocityYRef.current) + PLAYER_HEIGHT;
            const stompVerticalTolerance = updatedObs.height * 0.2;

            if (
                playerIsFalling &&
                playerFeetPreviousFrameY <= updatedObs.y + stompVerticalTolerance &&
                (playerRect.y + playerRect.height) >= updatedObs.y &&
                (playerRect.y + playerRect.height) <= updatedObs.y + updatedObs.height * 0.5 
            ) {
                removeThisObstacle = true;
                minionStompedThisFrame = true;
            } else {
                setGameOver(true);
                setGameRunning(false);
                newObstacles = obstaclesRef.current.map(o => ({ ...o, worldX: o.worldX - obstacleSpeedRef.current })).filter(o => {
                    const screenX = o.worldX - worldScrollXRef.current;
                    return screenX + o.width > 0 && screenX < GAME_WIDTH;
                });
                break; 
            }
        }
        if (!removeThisObstacle && !gameOver) { 
            newObstacles.push(updatedObs);
        }
    }
    if (minionStompedThisFrame) {
        playerVelocityYRef.current = STOMP_BOUNCE_STRENGTH;
        isJumpingRef.current = true;
        canBoostJumpRef.current = true;
    }
    obstaclesRef.current = newObstacles;
    if (!gameOver) setUiObstacles([...newObstacles]);

    if (!gameOver) { 
        let newPizzasCollectedCount = pizzasCollectedRef.current;
        const remainingPizzas = pizzasRef.current
            .map(p => ({ ...p, worldX: p.worldX - obstacleSpeedRef.current }))
            .filter(p => {
                const pizzaScreenX = p.worldX - worldScrollXRef.current;
                if (pizzaScreenX + p.width <= 0) return false; 
                if (pizzaScreenX > GAME_WIDTH) return false;

                const pizzaRect = { x: pizzaScreenX, y: p.y, width: p.width, height: p.height };
                if (
                    playerRect.x < pizzaRect.x + pizzaRect.width &&
                    playerRect.x + playerRect.width > pizzaRect.x &&
                    playerRect.y < pizzaRect.y + pizzaRect.height &&
                    playerRect.y + playerRect.height > pizzaRect.y
                ) {
                    newPizzasCollectedCount++;
                    return false;
                }
                return true;
            });
        
        pizzasRef.current = remainingPizzas;
        setUiPizzas([...remainingPizzas]);

        if (newPizzasCollectedCount !== pizzasCollectedRef.current) {
            pizzasCollectedRef.current = newPizzasCollectedCount;
            setUiPizzasCollected(newPizzasCollectedCount);
        }
    }

    const currentMileMilestone = Math.floor(milesCoveredRef.current / DIFFICULTY_UPDATE_MILESTONE);
    if (milesCoveredRef.current > 0 && currentMileMilestone > lastDifficultyUpdateMileRef.current) {
      obstacleSpeedRef.current += 0.1;
      obstacleSpawnIntervalRef.current = Math.max(600, obstacleSpawnIntervalRef.current - 60);
      pizzaSpawnIntervalRef.current = Math.max(1200, pizzaSpawnIntervalRef.current - 40);
      lastDifficultyUpdateMileRef.current = currentMileMilestone;
    }

    if (gameRunning && !gameOver) { 
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameRunning, gameOver, isPaused]); 

  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameRunning, gameOver, gameLoop]); 

  const scalerWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundImage: `url(/pixelbg.jpg)`,
    backgroundRepeat: 'repeat-x',
    backgroundPositionY: 'center',
    backgroundPositionX: `-${(worldScrollXRef.current * scale)}px`,
    backgroundSize: `auto ${GAME_HEIGHT * scale}px`,
    position: 'relative', // Added for pause button positioning
  };

  const gameAreaDynamicStyle: React.CSSProperties = {
    width: `${GAME_WIDTH}px`,
    height: `${GAME_HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    position: 'relative',
  };

  const gameWrapperClasses = "w-full max-w-4xl mx-auto flex flex-col h-full overflow-hidden";


  return (
    <div className={cn(gameWrapperClasses, "relative")}>
      <audio ref={backgroundAudioRef} src="/backgroundmusic.mp3" loop preload="auto" />
      <audio ref={gameOverAudioRef} src="/restart.mp3" preload="auto" />
      <div className="flex justify-between w-full mb-1 sm:mb-2 text-xs sm:text-sm md:text-base px-1 pt-4">
        <p className="pixel-text">Pizzas: {uiPizzasCollected}</p>
        <p className="pixel-text">Miles: {uiMilesCovered}</p>
      </div>
      <div
        ref={scalerWrapperRef}
        className={cn(
            "flex-grow pixel-box rounded-md", 
        )}
        style={scalerWrapperStyle}
      >
        <Button
            onClick={handlePauseToggle}
            variant="secondary"
            size="icon"
            className="absolute top-1 right-1 z-50 pixel-box rounded-none"
            aria-label={isPaused ? "Resume Game" : "Pause Game"}
        >
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
        </Button>
        <div
          ref={gameAreaRef}
          style={gameAreaDynamicStyle}
          tabIndex={0}
        >
          <PlayerComponent
            x={PLAYER_TARGET_SCREEN_X}
            y={uiPlayerPositionY}
            width={PLAYER_WIDTH}
            height={PLAYER_HEIGHT}
            animationFrame={playerAnimationFrame}
            isMoving={isMovingHorizontally}
          />
          {uiObstacles.map(obs => {
            const screenX = obs.worldX - worldScrollXRef.current;
             if (screenX < GAME_WIDTH && screenX + obs.width > 0) {
                return (
                <ObstacleComponent
                    key={obs.id}
                    x={screenX}
                    y={obs.y}
                    width={obs.width}
                    height={obs.height}
                    color={obs.color}
                />
                );
            }
            return null;
          })}
          {uiPizzas.map(pizza => {
            const screenX = pizza.worldX - worldScrollXRef.current;
            if (screenX < GAME_WIDTH && screenX + pizza.width > 0) {
                return (
                <PizzaComponent
                    key={pizza.id}
                    x={screenX}
                    y={pizza.y}
                    width={pizza.width}
                    height={pizza.height}
                />
                );
            }
            return null;
          })}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
              <h2 className="text-3xl md:text-4xl text-destructive mb-4 pixel-text">Game Over</h2>
              <p className="text-lg md:text-xl mb-2 pixel-text">Pizzas Collected: {uiPizzasCollected}</p>
              <p className="text-lg md:text-xl mb-6 pixel-text">Miles Covered: {uiMilesCovered}</p>
              <Button onClick={resetGame} variant="primary" className="pixel-text text-sm md:text-base">
                Restart (Space)
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 sm:mt-4 text-xs text-center text-muted-foreground pixel-text">
        Controls: Left/Right Arrows or A/D to Move, Space/Up Arrow or W to Jump, Esc to Pause/Resume
      </div>
    </div>
  );
};

export default Game;

