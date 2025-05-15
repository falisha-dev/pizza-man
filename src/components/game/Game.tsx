
// src/components/game/Game.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PlayerComponent from './Player';
import ObstacleComponent from './Obstacle';
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

const LEVEL_UP_SCORE_INTERVAL = 50;

interface ObstacleState {
  id: string;
  worldX: number; // X position in the game world
  y: number;
  width: number;
  height: number;
  color: string;
}

const initialObstacleSpeed = 2.5;
const initialObstacleSpawnInterval = 2200; // ms

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
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);

  const [obstacleSpeed, setObstacleSpeed] = useState(initialObstacleSpeed);
  const [obstacleSpawnInterval, setObstacleSpawnInterval] = useState(initialObstacleSpawnInterval);

  const [playerAnimationFrame, setPlayerAnimationFrame] = useState(0);
  const [isMovingHorizontally, setIsMovingHorizontally] = useState(false);
  const playerAnimationTimerRef = useRef<NodeJS.Timeout>();

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const lastObstacleSpawnTimeRef = useRef(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>();

  // Calculate how much the world has scrolled based on player's world position
  // Ensures player appears at PLAYER_TARGET_SCREEN_X
  const worldScrollX = playerWorldX - PLAYER_TARGET_SCREEN_X;

  const resetGame = useCallback(() => {
    setPlayerWorldX(PLAYER_TARGET_SCREEN_X);
    setPlayerPositionY(GROUND_Y);
    setPlayerVelocityY(0);
    setIsJumping(false);
    setObstacles([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setGameRunning(true);
    setObstacleSpeed(initialObstacleSpeed);
    setObstacleSpawnInterval(initialObstacleSpawnInterval);
    lastObstacleSpawnTimeRef.current = 0;
    keysPressed.current = {};
    setPlayerAnimationFrame(0);
    setIsMovingHorizontally(false);
    if (playerAnimationTimerRef.current) clearInterval(playerAnimationTimerRef.current);
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
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
    
    const spawnWorldX = worldScrollX + GAME_WIDTH + Math.random() * 100; // Spawn off-screen to the right

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
  
  useEffect(() => {
    if (!gameRunning || gameOver) {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
      return;
    }
    
    scoreIntervalRef.current = setInterval(() => {
      setScore(s => s + 1);
    }, 100);

    return () => {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    }
  }, [gameRunning, gameOver]);


  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRunning || gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Player Horizontal Movement (updates playerWorldX)
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
    // Prevent player from moving left past their target screen X (worldScrollX won't go < 0)
    newPlayerWorldX = Math.max(PLAYER_TARGET_SCREEN_X, newPlayerWorldX);
    setPlayerWorldX(newPlayerWorldX);
    setIsMovingHorizontally(currentlyMovingHorizontally);


    // Player Vertical Movement (Jumping & Gravity)
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
        .map(obs => ({ ...obs, worldX: obs.worldX - obstacleSpeed })) // Move obstacles in the world
        .filter(obs => (obs.worldX - worldScrollX) + obs.width > 0) // Filter obstacles off-screen to the left
    );

    // Collision Detection
    // Player's screen rectangle is fixed at PLAYER_TARGET_SCREEN_X
    const playerRect = { x: PLAYER_TARGET_SCREEN_X, y: newPlayerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    for (const obs of obstacles) {
      const obsScreenX = obs.worldX - worldScrollX; // Calculate obstacle's screen X
      const obsRect = { x: obsScreenX, y: obs.y, width: obs.width, height: obs.height };
      if (
        playerRect.x < obsRect.x + obsRect.width &&
        playerRect.x + playerRect.width > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.height &&
        playerRect.y + playerRect.height > obsRect.y
      ) {
        setGameOver(true);
        setGameRunning(false);
        break;
      }
    }
    
    const expectedLevelBasedOnScore = Math.floor(score / LEVEL_UP_SCORE_INTERVAL) + 1;
    if (score > 0 && score % LEVEL_UP_SCORE_INTERVAL === 0 && level < expectedLevelBasedOnScore ) {
        setLevel(l => l + 1);
        setObstacleSpeed(s => s + 0.2);
        setObstacleSpawnInterval(i => Math.max(500, i - 100));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
      gameRunning, gameOver, playerWorldX, playerPositionY, playerVelocityY, isJumping, 
      obstacles, spawnObstacle, obstacleSpeed, obstacleSpawnInterval, score, level, worldScrollX
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

  // Style for the game area to enable background scrolling
  const gameAreaStyle: React.CSSProperties = {
    width: `${GAME_WIDTH}px`,
    height: `${GAME_HEIGHT}px`,
    backgroundImage: 'url(/pixelbg.jpg)',
    backgroundRepeat: 'repeat-x', // Tile the background image horizontally
    backgroundPositionY: 'center', // Keep vertical position centered (or '0' if top aligned)
    backgroundPositionX: `-${worldScrollX % GAME_WIDTH}px`, // Scroll horizontally, loop the background image
    backgroundSize: `auto ${GAME_HEIGHT}px`, // Scale image height to game height, auto width for tiling
    borderWidth: '2px', // From pixel-box class
  };

  return (
    <div className="flex flex-col items-center p-2 md:p-4 rounded-md pixel-box bg-[hsl(var(--game-area-background))]">
      <div className="flex justify-between w-full mb-2 text-sm md:text-base px-1">
        <p className="pixel-text">Score: {score}</p>
        <p className="pixel-text">Level: {level}</p>
      </div>
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden pixel-box" // pixel-box for border
        style={gameAreaStyle}
        tabIndex={0}
      >
        <PlayerComponent
          x={PLAYER_TARGET_SCREEN_X} // Player's X is now fixed on screen
          y={playerPositionY}
          width={PLAYER_WIDTH}
          height={PLAYER_HEIGHT}
          animationFrame={playerAnimationFrame}
          isMoving={isMovingHorizontally}
        />
        {obstacles.map(obs => {
          const screenX = obs.worldX - worldScrollX;
          // Optimization: Only render obstacles that are potentially visible on screen
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
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
            <h2 className="text-3xl md:text-4xl text-destructive mb-4 pixel-text">Game Over</h2>
            <p className="text-lg md:text-xl mb-2 pixel-text">Final Score: {score}</p>
            <p className="text-lg md:text-xl mb-6 pixel-text">Level: {level}</p>
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

    