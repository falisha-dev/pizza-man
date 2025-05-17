
// src/components/game/Game.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import PlayerComponent from './Player';
import ObstacleComponent from './Obstacle';
import PizzaComponent from './Pizza';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 350;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const GRAVITY = 0.7;
const JUMP_STRENGTH = -13;
const JUMP_BOOST_STRENGTH = -7;
const STOMP_BOUNCE_STRENGTH = -10; // Added for player bouncing off minions
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

// This offset accounts for the 2px border on each side + 2px shadow offset for pixel-box
const BORDER_AND_SHADOW_OFFSET = 6; 

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

const Game: React.FC = () => {
  const isMobile = useIsMobile();
  const [playerWorldX, setPlayerWorldX] = useState(PLAYER_TARGET_SCREEN_X);
  const [playerPositionY, setPlayerPositionY] = useState(GROUND_Y);
  const [playerVelocityY, setPlayerVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [canBoostJump, setCanBoostJump] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [pizzas, setPizzas] = useState<PizzaState[]>([]);
  const [pizzasCollected, setPizzasCollected] = useState(0);
  const [milesCovered, setMilesCovered] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);
  const [obstacleSpeed, setObstacleSpeed] = useState(initialObstacleSpeed);
  const [obstacleSpawnInterval, setObstacleSpawnInterval] = useState(initialObstacleSpawnInterval);
  const [pizzaSpawnInterval, setPizzaSpawnInterval] = useState(INITIAL_PIZZA_SPAWN_INTERVAL);
  const [playerAnimationFrame, setPlayerAnimationFrame] = useState(0);
  const [isMovingHorizontally, setIsMovingHorizontally] = useState(false);

  const [scale, setScale] = useState(1);
  const scalerWrapperRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const lastObstacleSpawnTimeRef = useRef(0);
  const lastPizzaSpawnTimeRef = useRef(0);
  const milesIntervalRef = useRef<NodeJS.Timeout>();
  const lastDifficultyUpdateMileRef = useRef(0);

  const worldScrollX = playerWorldX - PLAYER_TARGET_SCREEN_X;

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (scalerWrapperRef.current && gameAreaRef.current) {
        const availableWidth = scalerWrapperRef.current.offsetWidth;
        const availableHeight = scalerWrapperRef.current.offsetHeight;

        // Consider the game's visual footprint including border/shadow for scaling
        const gameVisualWidth = GAME_WIDTH + (isMobile ? 0 : BORDER_AND_SHADOW_OFFSET);
        const gameVisualHeight = GAME_HEIGHT + (isMobile ? 0 : BORDER_AND_SHADOW_OFFSET);

        let scaleX = availableWidth / gameVisualWidth;
        let scaleY = availableHeight / gameVisualHeight;
        
        let newScale = Math.min(scaleX, scaleY);

        const minScale = 0.3; 
        const maxScale = isMobile ? 1.0 : 1.75;
        
        newScale = Math.max(minScale, Math.min(newScale, maxScale));
        
        if (isNaN(newScale) || !isFinite(newScale)) {
            newScale = isMobile ? minScale : 1;
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
  }, [isMobile]);


  const resetGame = useCallback(() => {
    setPlayerWorldX(PLAYER_TARGET_SCREEN_X);
    setPlayerPositionY(GROUND_Y);
    setPlayerVelocityY(0);
    setIsJumping(false);
    setCanBoostJump(false);
    setObstacles([]);
    setPizzas([]);
    setPizzasCollected(0);
    setMilesCovered(0);
    setGameOver(false);
    setGameRunning(true);
    setObstacleSpeed(initialObstacleSpeed);
    setObstacleSpawnInterval(initialObstacleSpawnInterval);
    setPizzaSpawnInterval(INITIAL_PIZZA_SPAWN_INTERVAL);
    lastObstacleSpawnTimeRef.current = 0;
    lastPizzaSpawnTimeRef.current = 0;
    keysPressed.current = {};
    setPlayerAnimationFrame(0);
    setIsMovingHorizontally(false);
    if (milesIntervalRef.current) clearInterval(milesIntervalRef.current);
    lastDifficultyUpdateMileRef.current = 0;
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.code] = true; 

    if (e.repeat) return; 

    if (e.code === 'Space' && gameOver) {
      resetGame();
      return;
    }

    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !gameOver && gameRunning) {
      if (!isJumping) { 
        setPlayerVelocityY(JUMP_STRENGTH);
        setIsJumping(true);
        setCanBoostJump(true); 
      } else if (canBoostJump && playerVelocityY < 0) { 
        setPlayerVelocityY(v => v + JUMP_BOOST_STRENGTH);
        setCanBoostJump(false); 
      }
    }
  }, [gameOver, resetGame, gameRunning, isJumping, canBoostJump, playerVelocityY]);

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
      const timer = setInterval(() => {
        setPlayerAnimationFrame(prevFrame => {
          if (prevFrame === 0 && !isMovingHorizontally) return 0; // from standing to moving
          if (prevFrame === 0 || prevFrame === 2 ) return 1; // if standing or frame 2, go to 1
          return 2; // if frame 1, go to 2
        });
      }, PLAYER_ANIMATION_INTERVAL);
      return () => clearInterval(timer);
    } else if (!isMovingHorizontally && !isJumping) {
       setPlayerAnimationFrame(0); // Standing frame if not moving and not jumping
    }
  }, [isMovingHorizontally, isJumping, gameOver, gameRunning]);

  const spawnObstacle = useCallback(() => {
    const width = OBSTACLE_MIN_WIDTH + Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH);
    const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    const type = Math.random() > 0.3 ? 'ground' : 'floating';
    const floatingObstacleBaseY = GAME_HEIGHT - height - PLAYER_HEIGHT; // Base for floating obstacles to not be too high
    const yPosition = type === 'ground' 
      ? GAME_HEIGHT - height 
      : floatingObstacleBaseY - Math.random() * PLAYER_HEIGHT * 1.2; // Random height for floating
    
    const spawnWorldX = worldScrollX + GAME_WIDTH + Math.random() * (100 / scale) + (50 /scale) ;

    setObstacles(prev => [
      ...prev,
      {
        id: `obs-${Date.now()}-${Math.random()}`,
        worldX: spawnWorldX,
        y: Math.max(0, yPosition), // Ensure y is not negative
        width,
        height,
        color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
      },
    ]);
  }, [worldScrollX, scale]);

  const spawnPizza = useCallback(() => {
    const width = PIZZA_WIDTH;
    const height = PIZZA_HEIGHT;
    const minY = PLAYER_HEIGHT * 0.7; 
    const maxY = GROUND_Y - height - PLAYER_HEIGHT * 0.5; 
    const yPosition = Math.random() * (maxY - minY) + minY;
    
    const spawnWorldX = worldScrollX + GAME_WIDTH + Math.random() * (200 / scale) + (50 / scale);

    setPizzas(prev => [
      ...prev,
      {
        id: `pizza-${Date.now()}-${Math.random()}`,
        worldX: spawnWorldX,
        y: Math.max(minY, Math.min(yPosition, maxY)),
        width,
        height,
      },
    ]);
  }, [worldScrollX, scale]); 
  
  useEffect(() => { 
    if (!gameRunning || gameOver) {
      if (milesIntervalRef.current) clearInterval(milesIntervalRef.current);
      return;
    }
    
    milesIntervalRef.current = setInterval(() => {
      setMilesCovered(m => m + 1); 
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

    let newVy = playerVelocityY + GRAVITY;
    let newY = playerPositionY + newVy;

    if (newY >= GROUND_Y) {
      newY = GROUND_Y;
      newVy = 0;
      if (isJumping) { // only reset jumping state if it was true
        setIsJumping(false);
        setCanBoostJump(false); 
        if (!isMovingHorizontally) setPlayerAnimationFrame(0); // If landed and not moving, set to standing
      }
    } else if (newVy > 0 && isJumping) { // Player is falling
        setPlayerAnimationFrame(2); // Falling animation frame
    } else if (newVy < 0 && isJumping) { // Player is rising
        setPlayerAnimationFrame(1); // Jumping up animation frame
    }
    
    setPlayerPositionY(newY);
    setPlayerVelocityY(newVy);

    if (timestamp - lastObstacleSpawnTimeRef.current > obstacleSpawnInterval) {
      spawnObstacle();
      lastObstacleSpawnTimeRef.current = timestamp;
    }
    setObstacles(prevObstacles =>
      prevObstacles
        .map(obs => ({ ...obs, worldX: obs.worldX - obstacleSpeed }))
        .filter(obs => (obs.worldX - worldScrollX) + obs.width > (-50 / scale) ) // Keep if visible or slightly off-screen left
    );

    if (timestamp - lastPizzaSpawnTimeRef.current > pizzaSpawnInterval) {
      spawnPizza();
      lastPizzaSpawnTimeRef.current = timestamp;
    }
    setPizzas(prevPizzas =>
      prevPizzas
        .map(p => ({ ...p, worldX: p.worldX - obstacleSpeed })) 
        .filter(p => { 
          const pizzaScreenX = p.worldX - worldScrollX;
          const playerRect = { x: PLAYER_TARGET_SCREEN_X, y: playerPositionY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
          const pizzaRect = { x: pizzaScreenX, y: p.y, width: p.width, height: p.height };

          if (
            playerRect.x < pizzaRect.x + pizzaRect.width &&
            playerRect.x + playerRect.width > pizzaRect.x &&
            playerRect.y < pizzaRect.y + pizzaRect.height &&
            playerRect.y + playerRect.height > pizzaRect.y
          ) {
            setPizzasCollected(pc => pc + 1);
            return false; 
          }
          return (pizzaScreenX + p.width) > (-50 / scale); 
        })
    );

    const playerRectForObstacle = { x: PLAYER_TARGET_SCREEN_X, y: playerPositionY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    const obstaclesToRemove = new Set<string>();

    for (const obs of obstacles) {
      const obsScreenX = obs.worldX - worldScrollX;
      const obsRect = { x: obsScreenX, y: obs.y, width: obs.width, height: obs.height };

      if (
        playerRectForObstacle.x < obsRect.x + obsRect.width &&
        playerRectForObstacle.x + playerRectForObstacle.width > obsRect.x &&
        playerRectForObstacle.y < obsRect.y + obsRect.height &&
        playerRectForObstacle.y + playerRectForObstacle.height > obsRect.y
      ) {
        const playerIsFalling = playerVelocityY > 0;
        // Approximate player's feet Y position in the previous frame's state
        // (Current Y - Current Velocity) + Player Height gives an idea of where feet were before this frame's Y update
        const playerFeetPreviousFrameY = (playerPositionY - playerVelocityY) + PLAYER_HEIGHT; 
        
        // Stomp condition: Player is falling, and their feet were roughly above or at the obstacle's top,
        // and are now intersecting the top portion of the obstacle.
        // A small tolerance (e.g., 20% of obstacle height) makes stomping feel more forgiving.
        const stompVerticalTolerance = obs.height * 0.2; 

        if (
          playerIsFalling &&
          playerFeetPreviousFrameY <= obs.y + stompVerticalTolerance && // Feet were above or slightly into the top
          (playerRectForObstacle.y + playerRectForObstacle.height) >= obs.y // Current feet are at or below obstacle top
        ) {
          // Stomp!
          obstaclesToRemove.add(obs.id);
          setPlayerVelocityY(STOMP_BOUNCE_STRENGTH); // Bounce
          setIsJumping(true); // Allow jump boost after stomp
          setCanBoostJump(true);
        } else {
          // Not a stomp, so it's a game over collision
          setGameOver(true);
          setGameRunning(false);
          break; 
        }
      }
    }

    if (obstaclesToRemove.size > 0) {
      setObstacles(prevObs => prevObs.filter(o => !obstaclesToRemove.has(o.id)));
    }
    
    if (gameOver) { // Check again in case set by collision
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const currentMileMilestone = Math.floor(milesCovered / DIFFICULTY_UPDATE_MILESTONE);
    if (milesCovered > 0 && currentMileMilestone > lastDifficultyUpdateMileRef.current) {
        setObstacleSpeed(s => s + 0.1); 
        setObstacleSpawnInterval(i => Math.max(600, i - 60)); 
        setPizzaSpawnInterval(i => Math.max(1200, i - 40)); 
        lastDifficultyUpdateMileRef.current = currentMileMilestone;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
      gameRunning, gameOver, playerWorldX, playerPositionY, playerVelocityY, isJumping, canBoostJump,
      obstacles, pizzas, obstacleSpeed, obstacleSpawnInterval, pizzaSpawnInterval, 
      milesCovered, worldScrollX, spawnPizza, spawnObstacle, scale // Added scale
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

  const gameAreaDynamicStyle: React.CSSProperties = {
    width: `${GAME_WIDTH}px`,
    height: `${GAME_HEIGHT}px`,
    backgroundImage: 'url(/pixelbg.jpg)',
    backgroundRepeat: 'repeat-x',
    backgroundPositionY: 'center',
    backgroundPositionX: `-${(worldScrollX * scale) % (GAME_WIDTH * scale)}px`, // Adjust scroll by scale
    backgroundSize: `auto ${GAME_HEIGHT * scale}px`, // Adjust size by scale
    transform: `scale(${scale})`,
    transformOrigin: 'center center', // Changed from top left
    // position: 'absolute', // Removed absolute, let flexbox center it
    // top: 0, // Removed
    // left: 0, // Removed
  };

  const gameWrapperClasses = isMobile 
    ? "w-full h-full flex flex-col items-center justify-center overflow-hidden" 
    : "w-full max-w-4xl mx-auto flex flex-col items-center p-2 rounded-md pixel-box h-full overflow-hidden";


  return (
    <div className={gameWrapperClasses}>
      <div className="flex justify-between w-full mb-1 sm:mb-2 text-xs sm:text-sm md:text-base px-1">
        <p className="pixel-text">Pizzas: {pizzasCollected}</p>
        <p className="pixel-text">Miles: {milesCovered}</p>
      </div>
      <div 
        ref={scalerWrapperRef} 
        className="flex-grow w-full flex items-center justify-center overflow-hidden relative"
      >
        <div
          ref={gameAreaRef}
          className={isMobile ? "" : "pixel-box"} // Conditional pixel-box for border
          style={gameAreaDynamicStyle}
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
             // Wider culling range, adjusted by scale
            if (screenX + obs.width > (-50 / scale) && screenX < (GAME_WIDTH + (50 / scale))) {
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
             // Wider culling range, adjusted by scale
            if (screenX + pizza.width > (-50 / scale) && screenX < (GAME_WIDTH + (50 / scale))) {
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
      </div>
      {!isMobile && (
         <div className="mt-2 sm:mt-4 text-xs text-center text-muted-foreground pixel-text">
          Controls: Left/Right Arrows or A/D to Move, Space/Up Arrow or W to Jump
        </div>
      )}
    </div>
  );
};

export default Game;
