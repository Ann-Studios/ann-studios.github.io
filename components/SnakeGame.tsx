import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause } from 'lucide-react';

export const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const gameRef = useRef<any>(null);

  const startGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game state
    const snake = [{ x: 10, y: 10 }];
    let direction = { x: 0, y: 0 };
    let food = { x: 15, y: 15 };
    let currentScore = 0;
    
    // Generate random food position
    const generateFood = () => {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      
      // Make sure food doesn't spawn on snake
      for (const segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
          generateFood();
          return;
        }
      }
    };
    
    // Game loop
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      // Move snake
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      
      // Check wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        setGameState('gameOver');
        if (currentScore > highScore) {
          setHighScore(currentScore);
        }
        return;
      }
      
      // Check self collision
      for (const segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
          setGameState('gameOver');
          if (currentScore > highScore) {
            setHighScore(currentScore);
          }
          return;
        }
      }
      
      snake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        currentScore += 10;
        setScore(currentScore);
        generateFood();
      } else {
        snake.pop();
      }
      
      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }
      
      // Draw snake
      for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const isHead = i === 0;
        
        // Snake body gradient
        const gradient = ctx.createLinearGradient(
          segment.x * gridSize,
          segment.y * gridSize,
          (segment.x + 1) * gridSize,
          (segment.y + 1) * gridSize
        );
        
        if (isHead) {
          gradient.addColorStop(0, '#e51b23');
          gradient.addColorStop(1, '#b71c1c');
        } else {
          gradient.addColorStop(0, '#4caf50');
          gradient.addColorStop(1, '#2e7d32');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
        
        // Snake head eyes
        if (isHead) {
          ctx.fillStyle = '#fff';
          const eyeSize = 3;
          const eyeOffset = 5;
          
          if (direction.x === 1) { // Right
            ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + 4, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + 12, eyeSize, eyeSize);
          } else if (direction.x === -1) { // Left
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 4, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 12, eyeSize, eyeSize);
          } else if (direction.y === -1) { // Up
            ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 2, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 2, eyeSize, eyeSize);
          } else if (direction.y === 1) { // Down
            ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
          }
        }
      }
      
      // Draw food
      const foodGradient = ctx.createRadialGradient(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        0,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2
      );
      foodGradient.addColorStop(0, '#ff5722');
      foodGradient.addColorStop(1, '#d32f2f');
      
      ctx.fillStyle = foodGradient;
      ctx.beginPath();
      ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      
      gameRef.current = setTimeout(gameLoop, 150);
    };
    
    // Controls
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) direction = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (direction.y !== -1) direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) direction = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x !== -1) direction = { x: 1, y: 0 };
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    gameLoop();
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (gameRef.current) {
        clearTimeout(gameRef.current);
      }
    };
  }, [gameState, highScore]);

  const resetGame = () => {
    setScore(0);
    setGameState('menu');
    if (gameRef.current) {
      clearTimeout(gameRef.current);
    }
  };

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
  };

  const togglePause = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      startGame();
    }
  }, [gameState, startGame]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Modern Snake</h1>
            <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
              Arcade
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-bold text-ann-red">{score}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Best</div>
              <div className="text-xl font-bold text-foreground">{highScore}</div>
            </div>
            {gameState === 'playing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full bg-gray-900"
          />
          
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Modern Snake</h2>
                <p className="mb-6">Use arrow keys to control the snake!</p>
                <Button
                  onClick={handleStart}
                  className="bg-ann-red hover:bg-ann-red-dark text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </div>
            </div>
          )}
          
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Paused</h2>
                <Button
                  onClick={togglePause}
                  className="bg-ann-red hover:bg-ann-red-dark text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
          )}
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
                {score > 0 && score === highScore && (
                  <p className="text-ann-red mb-4">New High Score! 🎉</p>
                )}
                <Button
                  onClick={resetGame}
                  className="bg-ann-red hover:bg-ann-red-dark text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">How to Play:</h3>
          <p className="text-sm text-muted-foreground">
            Use the arrow keys to control the snake. Eat the red food to grow longer and increase your score. 
            Avoid hitting the walls or your own tail!
          </p>
        </div>
      </div>
    </div>
  );
};