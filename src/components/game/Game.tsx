
// src/components/game/Game.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PlayerComponent from './Player';
import ObstacleComponent from './Obstacle';
import PizzaComponent from './Pizza'; // Import PizzaComponent
import { Button } from '@/components/ui/button';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 350;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const GRAVITY = 0.7;
const JUMP_STRENGTH = -13;
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
const PLAYER_TARGET_SCREEN_X = 100; // Player's fixed X position on the screen

const Game: React.FC = () => {
  const [playerWorldX, setPlayerWorldX] = useState(PLAYER_TARGET_SCREEN_X);
  const [playerPositionY, setPlayerPositionY] = useState(GROUND_Y);
  const [playerVelocityY, setPlayerVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [pizzas, setPizzas] = useState<PizzaState[]>([]); // New state for pizzas

  const [pizzasCollected, setPizzasCollected] = useState(0); // Score is now pizzas collected
  const [milesCovered, setMilesCovered] = useState(0); // Level is now miles covered

  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);

  const [obstacleSpeed, setObstacleSpeed] = useState(initialObstacleSpeed);
  const [obstacleSpawnInterval, setObstacleSpawnInterval] = useState(initialObstacleSpawnInterval);
  const [pizzaSpawnInterval, setPizzaSpawnInterval] = useState(INITIAL_PIZZA_SPAWN_INTERVAL); // New state

  const [playerAnimationFrame, setPlayerAnimationFrame] = useState(0);
  const [isMovingHorizontally, setIsMovingHorizontally] = useState(false);
  const playerAnimationTimerRef = useRef<NodeJS.Timeout>();

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const lastObstacleSpawnTimeRef = useRef(0);
  const lastPizzaSpawnTimeRef = useRef(0); // New ref for pizza spawning
  const milesIntervalRef = useRef<NodeJS.Timeout>(); // Renamed from scoreIntervalRef
  const lastDifficultyUpdateMileRef = useRef(0); // For difficulty scaling

  const worldScrollX = playerWorldX - PLAYER_TARGET_SCREEN_X;

  const resetGame = useCallback(() => {
    setPlayerWorldX(PLAYER_TARGET_SCREEN_X);
    setPlayerPositionY(GROUND_Y);
    setPlayerVelocityY(0);
    setIsJumping(false);
    setObstacles([]);
    setPizzas([]); // Reset pizzas
    setPizzasCollected(0); // Reset pizza score
    setMilesCovered(0); // Reset miles
    setGameOver(false);
    setGameRunning(true);
    setObstacleSpeed(initialObstacleSpeed);
    setObstacleSpawnInterval(initialObstacleSpawnInterval);
    setPizzaSpawnInterval(INITIAL_PIZZA_SPAWN_INTERVAL); // Reset pizza spawn interval
    lastObstacleSpawnTimeRef.current = 0;
    lastPizzaSpawnTimeRef.current = 0; // Reset pizza spawn time
    keysPressed.current = {};
    setPlayerAnimationFrame(0);
    setIsMovingHorizontally(false);
    if (playerAnimationTimerRef.current) clearInterval(playerAnimationTimerRef.current);
    if (milesIntervalRef.current) clearInterval(milesIntervalRef.current);
    lastDifficultyUpdateMileRef.current = 0; // Reset difficulty tracker
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.code] = true;
    if (e.code === 'Space' && gameOver) {
      resetGame();
    }
  }, [gameOver, resetGame]);

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
    if (isMovingHorizontally && !gameOver && gameRunning) {
      playerAnimationTimerRef.current = setInterval(() => {
        setPlayerAnimationFrame(prevFrame => {
          if (prevFrame === 0) return 1; 
          return prevFrame === 1 ? 2 : 1; 
        });
      }, PLAYER_ANIMATION_INTERVAL);
    } else {
      if (playerAnimationTimerRef.current) clearInterval(playerAnimationTimerRef.current);
      setPlayerAnimationFrame(0); 
    }
    return () => {
      if (playerAnimationTimerRef.current) clearInterval(playerAnimationTimerRef.current);
    };
  }, [isMovingHorizontally, gameOver, gameRunning]);

  const spawnObstacle = useCallback(() => {
    const width = OBSTACLE_MIN_WIDTH + Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH);
    const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    const type = Math.random() > 0.3 ? 'ground' : 'floating';
    const floatingObstacleBaseY = GAME_HEIGHT - height - PLAYER_HEIGHT;
    const yPosition = type === 'ground' 
      ? GAME_HEIGHT - height 
      : floatingObstacleBaseY - Math.random() * PLAYER_HEIGHT * 1.2;
    
    const spawnWorldX = worldScrollX + GAME_WIDTH + Math.random() * 100;

    setObstacles(prev => [
      ...prev,
      {
        id: `obs-${Date.now()}-${Math.random()}`,
        worldX: spawnWorldX,
        y: Math.max(0, yPosition),
        width,
        height,
        color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
      },
    ]);
  }, [worldScrollX]);

  const spawnPizza = useCallback(() => {
    const width = PIZZA_WIDTH;
    const height = PIZZA_HEIGHT;
    const minY = PLAYER_HEIGHT * 0.7; // Pizzas spawn at a reachable height
    const maxY = GROUND_Y - height - PLAYER_HEIGHT * 0.5; // Not too high, not on ground
    const yPosition = Math.random() * (maxY - minY) + minY;
    
    const spawnWorldX = worldScrollX + GAME_WIDTH + Math.random() * 200 + 50; // Spawn off-screen right, slightly further than obstacles

    setPizzas(prev => [
      ...prev,
      {
        id: `pizza-${Date.now()}-${Math.random()}`,
        worldX: spawnWorldX,
        y: Math.max(minY, Math.min(yPosition, maxY)), // Ensure Y is within reasonable bounds
        width,
        height,
      },
    ]);
  }, [worldScrollX]); 
  
  useEffect(() => { // For Miles Covered
    if (!gameRunning || gameOver) {
      if (milesIntervalRef.current) clearInterval(milesIntervalRef.current);
      return;
    }
    
    milesIntervalRef.current = setInterval(() => {
      setMilesCovered(m => m + 1); // Each increment is a "mile"
    }, 100);

    return () => {
      if (milesIntervalRef.current) clearInterval(milesIntervalRef.current);
    }
  }, [gameRunning, gameOver]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRunning || gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let newPlayerWorldX = playerWorldX;
    let currentlyMovingHorizontally = false;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      newPlayerWorldX -= PLAYER_HORIZONTAL_SPEED;
      currentlyMovingHorizontally = true;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      newPlayerWorldX += PLAYER_HORIZONTAL_SPEED;
      currentlyMovingHorizontally = true;
    }
    newPlayerWorldX = Math.max(PLAYER_TARGET_SCREEN_X, newPlayerWorldX);
    setPlayerWorldX(newPlayerWorldX);
    setIsMovingHorizontally(currentlyMovingHorizontally);

    let newPlayerY = playerPositionY;
    let newPlayerVy = playerVelocityY;

    if ((keysPressed.current['Space'] || keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) && !isJumping) {
      newPlayerVy = JUMP_STRENGTH;
      setIsJumping(true);
    }

    newPlayerVy += GRAVITY;
    newPlayerY += newPlayerVy;

    if (newPlayerY >= GROUND_Y) {
      newPlayerY = GROUND_Y;
      newPlayerVy = 0;
      setIsJumping(false);
    }
    
    setPlayerPositionY(newPlayerY);
    setPlayerVelocityY(newPlayerVy);

    // Obstacle Management
    if (timestamp - lastObstacleSpawnTimeRef.current > obstacleSpawnInterval) {
      spawnObstacle();
      lastObstacleSpawnTimeRef.current = timestamp;
    }
    setObstacles(prevObstacles =>
      prevObstacles
        .map(obs => ({ ...obs, worldX: obs.worldX - obstacleSpeed }))
        .filter(obs => (obs.worldX - worldScrollX) + obs.width > 0)
    );

    // Pizza Management
    if (timestamp - lastPizzaSpawnTimeRef.current > pizzaSpawnInterval) {
      spawnPizza();
      lastPizzaSpawnTimeRef.current = timestamp;
    }
    setPizzas(prevPizzas =>
      prevPizzas
        .map(p => ({ ...p, worldX: p.worldX - obstacleSpeed })) // Pizzas move with obstacles
        .filter(p => { 
          const pizzaScreenX = p.worldX - worldScrollX;
          const playerRect = { x: PLAYER_TARGET_SCREEN_X, y: newPlayerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
          const pizzaRect = { x: pizzaScreenX, y: p.y, width: p.width, height: p.height };

          if (
            playerRect.x < pizzaRect.x + pizzaRect.width &&
            playerRect.x + playerRect.width > pizzaRect.x &&
            playerRect.y < pizzaRect.y + pizzaRect.height &&
            playerRect.y + playerRect.height > pizzaRect.y
          ) {
            setPizzasCollected(pc => pc + 1);
            return false; // Remove collected pizza
          }
          return (pizzaScreenX + p.width) > 0; 
        })
    );

    // Collision Detection (Player vs Obstacles)
    const playerRectForObstacle = { x: PLAYER_TARGET_SCREEN_X, y: newPlayerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    for (const obs of obstacles) {
      const obsScreenX = obs.worldX - worldScrollX;
      const obsRect = { x: obsScreenX, y: obs.y, width: obs.width, height: obs.height };
      if (
        playerRectForObstacle.x < obsRect.x + obsRect.width &&
        playerRectForObstacle.x + playerRectForObstacle.width > obsRect.x &&
        playerRectForObstacle.y < obsRect.y + obsRect.height &&
        playerRectForObstacle.y + playerRectForObstacle.height > obsRect.y
      ) {
        setGameOver(true);
        setGameRunning(false);
        break;
      }
    }
    
    // Difficulty scaling based on miles covered
    const currentMileMilestone = Math.floor(milesCovered / DIFFICULTY_UPDATE_MILESTONE);
    if (milesCovered > 0 && currentMileMilestone > lastDifficultyUpdateMileRef.current) {
        setObstacleSpeed(s => s + 0.1); 
        setObstacleSpawnInterval(i => Math.max(600, i - 60)); 
        setPizzaSpawnInterval(i => Math.max(1200, i - 40)); 
        lastDifficultyUpdateMileRef.current = currentMileMilestone;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
      gameRunning, gameOver, playerWorldX, playerPositionY, playerVelocityY, isJumping, 
      obstacles, spawnObstacle, pizzas, spawnPizza, 
      obstacleSpeed, obstacleSpawnInterval, pizzaSpawnInterval, 
      milesCovered, // pizzasCollected is not a dependency for gameLoop, it's a result
      worldScrollX, spawnPizza, spawnObstacle // Ensure spawn functions are stable or listed
  ]);

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

  const gameAreaStyle: React.CSSProperties = {
    width: `${GAME_WIDTH}px`,
    height: `${GAME_HEIGHT}px`,
    backgroundImage: 'url(/pixelbg.jpg)',
    backgroundRepeat: 'repeat-x',
    backgroundPositionY: 'center',
    backgroundPositionX: `-${worldScrollX % GAME_WIDTH}px`,
    backgroundSize: `auto ${GAME_HEIGHT}px`,
    borderWidth: '2px',
  };

  return (
    <div className="flex flex-col items-center p-2 md:p-4 rounded-md pixel-box bg-[hsl(var(--game-area-background))]">
      <div className="flex justify-between w-full mb-2 text-sm md:text-base px-1">
        <p className="pixel-text">Pizzas: {pizzasCollected}</p>
        <p className="pixel-text">Miles: {milesCovered}</p>
      </div>
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden pixel-box"
        style={gameAreaStyle}
        tabIndex={0}
      >
        <PlayerComponent
          x={PLAYER_TARGET_SCREEN_X}
          y={playerPositionY}
          width={PLAYER_WIDTH}
          height={PLAYER_HEIGHT}
          animationFrame={playerAnimationFrame}
          isMoving={isMovingHorizontally}
        />
        {obstacles.map(obs => {
          const screenX = obs.worldX - worldScrollX;
          if (screenX + obs.width > 0 && screenX < GAME_WIDTH) {
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
        {pizzas.map(pizza => {
          const screenX = pizza.worldX - worldScrollX;
          if (screenX + pizza.width > 0 && screenX < GAME_WIDTH) {
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
            <p className="text-lg md:text-xl mb-2 pixel-text">Pizzas Collected: {pizzasCollected}</p>
            <p className="text-lg md:text-xl mb-6 pixel-text">Miles Covered: {milesCovered}</p>
            <Button onClick={resetGame} variant="primary" className="pixel-text text-sm md:text-base">
              Restart (Space)
            </Button>
          </div>
        )}
      </div>
       <div className="mt-4 text-xs text-center text-muted-foreground pixel-text">
        Controls: Left/Right Arrows or A/D to Move, Space/Up Arrow or W to Jump
      </div>
    </div>
  );
};

export default Game;
