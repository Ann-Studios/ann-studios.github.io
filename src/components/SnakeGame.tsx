import styles from '../css/SnakeGame.module.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { RotateCcw, Play, Pause, Maximize, Minimize } from 'lucide-react';

export const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameRef = useRef<any>(null);
  const gameStateRef = useRef(gameState);
  const highScoreRef = useRef(highScore);

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
    highScoreRef.current = highScore;
  }, [gameState, highScore]);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Your existing startGame code unchanged...
  const startGame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let direction = { x: 0, y: 0 };
    let food = { x: 15, y: 15 };
    let currentScore = 0;
    let isGameRunning = true;

    const generateFood = () => {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
      for (const segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
          generateFood();
          return;
        }
      }
    };

    generateFood();

    const gameLoop = () => {
      if (gameStateRef.current !== 'playing') {
        isGameRunning = false;
        return;
      }

      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        setGameState('gameOver');
        if (currentScore > highScoreRef.current) setHighScore(currentScore);
        return;
      }

      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          setGameState('gameOver');
          if (currentScore > highScoreRef.current) setHighScore(currentScore);
          return;
        }
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        currentScore += 10;
        setScore(currentScore);
        generateFood();
      } else {
        snake.pop();
      }

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const isHead = i === 0;
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
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
      }

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
      ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
      ctx.fill();

      if (isGameRunning) {
        gameRef.current = setTimeout(gameLoop, 150);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': if (direction.y !== 1) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y !== -1) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x !== 1) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x !== -1) direction = { x: 1, y: 0 }; break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    gameLoop();

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, []);

  // Start the game when gameState changes to 'playing'
  useEffect(() => {
    if (gameState === 'playing') {
      const cleanup = startGame();
      return cleanup;
    }
    // Clean up when leaving 'playing' state
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [gameState, startGame]);

  const resetGame = () => {
    setScore(0);
    setGameState('menu');
    if (gameRef.current) clearTimeout(gameRef.current);
  };

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
  };

  const togglePause = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>Modern Snake</h1>
            <Badge className={styles.badge}>Arcade</Badge>
          </div>
          <div className={styles.scores}>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
            </div>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Best</div>
              <div className={styles.highscoreValue}>{highScore}</div>
            </div>
            {gameState === 'playing' && (
              <Button onClick={togglePause} className={styles.button}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={toggleFullscreen} className={styles.button}>
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 mr-2" /> Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 mr-2" /> Fullscreen
                </>
              )}
            </Button>
            <Button onClick={resetGame} className={styles.button}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} width={800} height={600} className={styles.canvas} />
          {/* overlays unchanged */}
          {gameState === 'menu' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-3xl font-bold mb-4">Modern Snake</h2>
                <p className="mb-6">Use arrow keys to control the snake!</p>
                <Button onClick={handleStart} className={styles.button}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </div>
            </div>
          )}
          {gameState === 'paused' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-3xl font-bold mb-4">Paused</h2>
                <Button onClick={togglePause} className={styles.button}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
          )}
          {gameState === 'gameOver' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
                {score > 0 && score === highScore && (
                  <p className={styles.scoreValue}>New High Score! 🎉</p>
                )}
                <Button onClick={resetGame} className={styles.button}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>How to Play:</h3>
          <p className={styles.instructionsText}>
            Use the arrow keys to control the snake. Eat the red food to grow longer and increase your score.
            Avoid hitting the walls or your own tail!
          </p>
        </div>
      </div>
    </div>
  );
};
