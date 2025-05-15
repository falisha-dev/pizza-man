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
  x: number;
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

const Game: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: GROUND_Y });
  const [playerVelocity, setPlayerVelocity] = useState({ vx: 0, vy: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);

  const [obstacleSpeed, setObstacleSpeed] = useState(initialObstacleSpeed);
  const [obstacleSpawnInterval, setObstacleSpawnInterval] = useState(initialObstacleSpawnInterval);

  const [playerAnimationFrame, setPlayerAnimationFrame] = useState(0); // 0: standing, 1: walk1, 2: walk2
  const [isMovingHorizontally, setIsMovingHorizontally] = useState(false);
  const playerAnimationTimerRef = useRef<NodeJS.Timeout>();

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const lastObstacleSpawnTimeRef = useRef(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>();

  const resetGame = useCallback(() => {
    setPlayerPosition({ x: 50, y: GROUND_Y });
    setPlayerVelocity({ vx: 0, vy: 0 });
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
  
  // Player Animation Effect
  useEffect(() => {
    if (isMovingHorizontally && !gameOver && gameRunning) {
      playerAnimationTimerRef.current = setInterval(() => {
        setPlayerAnimationFrame(prevFrame => {
          if (prevFrame === 0) return 1; // From standing to walk1
          return prevFrame === 1 ? 2 : 1; // Toggle between walk1 and walk2
        });
      }, PLAYER_ANIMATION_INTERVAL);
    } else {
      if (playerAnimationTimerRef.current) clearInterval(playerAnimationTimerRef.current);
      setPlayerAnimationFrame(0); // Standing frame
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
    const y = type === 'ground' 
      ? GAME_HEIGHT - height 
      : floatingObstacleBaseY - Math.random() * PLAYER_HEIGHT * 1.2;
    
    setObstacles(prev => [
      ...prev,
      {
        id: `obs-${Date.now()}-${Math.random()}`,
        x: GAME_WIDTH,
        y: Math.max(0, y),
        width,
        height,
        color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
      },
    ]);
  }, []);
  
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

    // Player Horizontal Movement
    let newPlayerX = playerPosition.x;
    let currentlyMovingHorizontally = false;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      newPlayerX -= PLAYER_HORIZONTAL_SPEED;
      currentlyMovingHorizontally = true;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      newPlayerX += PLAYER_HORIZONTAL_SPEED;
      currentlyMovingHorizontally = true;
    }
    newPlayerX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, newPlayerX));
    setIsMovingHorizontally(currentlyMovingHorizontally);


    // Player Vertical Movement (Jumping & Gravity)
    let newPlayerY = playerPosition.y;
    let newPlayerVy = playerVelocity.vy;

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
    
    setPlayerPosition({ x: newPlayerX, y: newPlayerY });
    setPlayerVelocity({ vx: 0, vy: newPlayerVy });

    // Obstacle Management
    if (timestamp - lastObstacleSpawnTimeRef.current > obstacleSpawnInterval) {
      spawnObstacle();
      lastObstacleSpawnTimeRef.current = timestamp;
    }

    setObstacles(prevObstacles =>
      prevObstacles
        .map(obs => ({ ...obs, x: obs.x - obstacleSpeed }))
        .filter(obs => obs.x + obs.width > 0)
    );

    // Collision Detection
    const playerRect = { x: newPlayerX, y: newPlayerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    for (const obs of obstacles) {
      const obsRect = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
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
    
    if (score > 0 && score % LEVEL_UP_SCORE_INTERVAL === 0 && level === Math.floor(score / LEVEL_UP_SCORE_INTERVAL) ) {
        setLevel(l => l + 1);
        setObstacleSpeed(s => s + 0.2);
        setObstacleSpawnInterval(i => Math.max(500, i - 100));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
      gameRunning, gameOver, playerPosition, playerVelocity.vy, isJumping, 
      obstacles, spawnObstacle, obstacleSpeed, obstacleSpawnInterval, score, level
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


  return (
    <div className="flex flex-col items-center p-2 md:p-4 rounded-md pixel-box bg-[hsl(var(--game-area-background))]">
      <div className="flex justify-between w-full mb-2 text-sm md:text-base px-1">
        <p className="pixel-text">Score: {score}</p>
        <p className="pixel-text">Level: {level}</p>
      </div>
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden pixel-box"
        style={{
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          backgroundImage: 'url(/pixelbg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderWidth: '2px',
        }}
        tabIndex={0}
      >
        <PlayerComponent
          x={playerPosition.x}
          y={playerPosition.y}
          width={PLAYER_WIDTH}
          height={PLAYER_HEIGHT}
          animationFrame={playerAnimationFrame}
          isMoving={isMovingHorizontally}
        />
        {obstacles.map(obs => (
          <ObstacleComponent
            key={obs.id}
            x={obs.x}
            y={obs.y}
            width={obs.width}
            height={obs.height}
            color={obs.color}
          />
        ))}
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
