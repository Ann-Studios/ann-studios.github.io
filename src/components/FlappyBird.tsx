import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import styles from '../css/FlappyBird.module.css';
import { FullscreenButton } from './ui/FullscreenButton';

export const FlappyBird = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const gameRef = useRef<any>(null);

  const startGame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Game state
    const bird = {
      x: 80,
      y: canvas.height / 2,
      velocity: 0,
      gravity: 0.5,
      jump: -8,
      radius: 20
    };

    const pipes: Array<{ x: number; topHeight: number; bottomHeight: number; passed: boolean }> = [];
    let currentScore = 0;
    let frame = 0;

    const pipeWidth = 60;
    const pipeGap = 150;

    const generatePipe = () => {
      const minHeight = 50;
      const maxHeight = canvas.height - pipeGap - minHeight;
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

      pipes.push({
        x: canvas.width,
        topHeight,
        bottomHeight: canvas.height - topHeight - pipeGap,
        passed: false
      });
    };

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update bird
      bird.velocity += bird.gravity;
      bird.y += bird.velocity;

      // Draw bird
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bird beak
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(bird.x + bird.radius, bird.y);
      ctx.lineTo(bird.x + bird.radius + 15, bird.y - 5);
      ctx.lineTo(bird.x + bird.radius + 15, bird.y + 5);
      ctx.fill();

      // Generate pipes
      if (frame % 90 === 0) {
        generatePipe();
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= 3;

        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);

        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
        ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottomHeight, pipeWidth + 10, 30);

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
          pipe.passed = true;
          currentScore++;
          setScore(currentScore);
        }

        if (
          bird.x + bird.radius > pipe.x &&
          bird.x - bird.radius < pipe.x + pipeWidth &&
          (bird.y - bird.radius < pipe.topHeight ||
            bird.y + bird.radius > canvas.height - pipe.bottomHeight)
        ) {
          setGameState('gameOver');
          if (currentScore > highScore) {
            setHighScore(currentScore);
          }
          return;
        }

        if (pipe.x + pipeWidth < 0) {
          pipes.splice(i, 1);
        }
      }

      if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        setGameState('gameOver');
        if (currentScore > highScore) {
          setHighScore(currentScore);
        }
        return;
      }

      frame++;
      gameRef.current = requestAnimationFrame(gameLoop);
    };

    const jump = () => {
      if (gameState === 'playing') {
        bird.velocity = bird.jump;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => jump();

    canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);

    gameLoop();

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyPress);
      if (gameRef.current) {
        cancelAnimationFrame(gameRef.current);
      }
    };
  }, [gameState, highScore]);

  const resetGame = () => {
    setScore(0);
    setGameState('menu');
    if (gameRef.current) {
      cancelAnimationFrame(gameRef.current);
    }
  };

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      startGame();
    }
  }, [gameState, startGame]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Flappy Bird</h1>
            <span className={styles.badge}>Arcade</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
            </div>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Best</div>
              <div className={styles.highscoreValue}>{highScore}</div>
            </div>
            <FullscreenButton containerRef={containerRef} className={styles.button} />
            <button onClick={resetGame} className={styles.button}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} width={800} height={600} className={styles.canvas} />

          {gameState === 'menu' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className={styles.overlayTitle}>Flappy Bird</h2>
                <p className={styles.overlayText}>Click or press Space to flap!</p>
                <button onClick={handleStart} className={styles.button}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className={styles.overlayTitle}>Game Over!</h2>
                <p className={styles.overlayScore}>Score: {score}</p>
                {score > 0 && score === highScore && (
                  <p className={styles.highScoreText}>New High Score! 🎉</p>
                )}
                <button onClick={resetGame} className={styles.button}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>How to Play:</h3>
          <p className={styles.instructionsText}>
            Click or press the spacebar to make the bird flap and fly through the gaps between pipes.
            Avoid hitting the pipes or the ground!
          </p>
        </div>
      </div>
    </div>
  );
};