import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FullscreenButton } from './ui/FullscreenButton';

type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'won';

export function BreakoutGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('menu');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [session, setSession] = useState(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!canvasRef.current || session === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const paddle = {
      width: 120,
      height: 14,
      x: canvas.width / 2 - 60,
      speed: 8,
      movingLeft: false,
      movingRight: false,
    };

    let currentLives = 3;
    let currentScore = 0;
    const brickRowCount = 6;
    const brickColumnCount = 9;
    const brickWidth = 70;
    const brickHeight = 22;
    const brickPadding = 10;
    const brickOffsetTop = 60;
    const brickOffsetLeft = 25;
    const bricks = Array.from({ length: brickColumnCount }, (_, col) =>
      Array.from({ length: brickRowCount }, (_, row) => ({
        x: brickOffsetLeft + col * (brickWidth + brickPadding),
        y: brickOffsetTop + row * (brickHeight + brickPadding),
        status: 1,
      }))
    );

    const ball = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      dx: 4,
      dy: -4,
      radius: 10,
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.fillStyle = '#e51b23';
      ctx.fillRect(paddle.x, canvas.height - 32, paddle.width, paddle.height);
    };

    const drawBricks = () => {
      bricks.forEach((column, col) => {
        column.forEach((brick, row) => {
          if (!brick.status) return;
          const hue = 350 - row * 12 - col * 2;
          ctx.fillStyle = `hsl(${hue} 82% 52%)`;
          ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        });
      });
    };

    const drawHud = () => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Poppins, sans-serif';
      ctx.fillText(`Score: ${currentScore}`, 24, 28);
      ctx.fillText(`Lives: ${currentLives}`, canvas.width - 96, 28);
    };

    const resetBall = () => {
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 80;
      ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -4;
      paddle.x = canvas.width / 2 - paddle.width / 2;
    };

    const collisionDetection = () => {

      bricks.forEach((column) => {
        column.forEach((brick) => {
          if (!brick.status) return;

          if (
            ball.x > brick.x &&
            ball.x < brick.x + brickWidth &&
            ball.y > brick.y &&
            ball.y < brick.y + brickHeight
          ) {
            ball.dy = -ball.dy;
            brick.status = 0;
            currentScore += 100;
            setScore(currentScore);
          }
        });
      });

      if (bricks.every(column => column.every(brick => !brick.status))) {
        gameStateRef.current = 'won';
        setGameState('won');
        return true;
      }
      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('button, input, a')) return;
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') paddle.movingLeft = true;
      if (event.key === 'ArrowRight') paddle.movingRight = true;
      if (event.key === ' ') {
        if (event.repeat) return;
        event.preventDefault();
        setGameState((current) => (current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') paddle.movingLeft = false;
      if (event.key === 'ArrowRight') paddle.movingRight = false;
    };

    const handleMouseMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) * canvas.width / rect.width;
      paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, relativeX - paddle.width / 2));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    const handlePointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      handleMouseMove(event);
    };
    canvas.addEventListener('pointermove', handleMouseMove);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const render = () => {
      if (gameStateRef.current === 'paused') {
        frameRef.current = requestAnimationFrame(render);
        return;
      }
      if (gameStateRef.current !== 'playing') return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawBricks();
      drawBall();
      drawPaddle();
      drawHud();
      if (collisionDetection()) return;

      if (paddle.movingLeft) paddle.x = Math.max(0, paddle.x - paddle.speed);
      if (paddle.movingRight) paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed);

      if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
      }

      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
      } else if (ball.dy > 0 && ball.y + ball.dy > canvas.height - ball.radius - 32) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
          const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          ball.dx = hitPoint * 6;
          ball.dy = -Math.abs(ball.dy);
        } else {
          currentLives -= 1;
          setLives(currentLives);
          if (currentLives <= 0) {
            gameStateRef.current = 'gameOver';
            setGameState('gameOver');
            return;
          }
          resetBall();
        }
      }

      ball.x += ball.dx;
      ball.y += ball.dy;
      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [session]);

  const startGame = () => {
    gameStateRef.current = 'playing';
    setSession(current => current + 1);
    setScore(0);
    setLives(3);
    setGameState('playing');
  };

  const resetGame = () => {
    gameStateRef.current = 'menu';
    setSession(0);
    cancelAnimationFrame(frameRef.current);
    setScore(0);
    setLives(3);
    setGameState('menu');
  };

  return (
    <div className="arcade-game" ref={containerRef}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Breakout Neon</h2>
          <Badge className="bg-red-500/20 text-red-100">Arcade</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/80">Score: {score}</span>
          <span className="text-sm text-white/80">Lives: {lives}</span>
          {(gameState === 'playing' || gameState === 'paused') && <Button onClick={() => setGameState(current => current === 'playing' ? 'paused' : 'playing')}>{gameState === 'playing' ? 'Pause' : 'Resume'}</Button>}
          <FullscreenButton containerRef={containerRef} className="bg-red-600 hover:bg-red-500" />
          <Button onClick={resetGame} className="bg-red-600 hover:bg-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="breakout-field">
        <canvas ref={canvasRef} width={760} height={520} className="w-full" style={{ touchAction: 'none' }} aria-label="Breakout play area" />

        {gameState === 'menu' && (
          <div className="play-overlay">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold">Break every brick</h3>
              <p className="mt-3 text-white/70">Move with the mouse or arrow keys and press space to pause.</p>
              <Button onClick={startGame} className="mt-6 bg-red-600 hover:bg-red-500">
                <Play className="mr-2 h-4 w-4" />
                Start Game
              </Button>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="play-overlay">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold">Paused</h3>
              <Button onClick={() => setGameState('playing')} className="mt-6 bg-red-600 hover:bg-red-500">
                Resume
              </Button>
            </div>
          </div>
        )}

        {(gameState === 'gameOver' || gameState === 'won') && (
          <div className="play-overlay">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold">{gameState === 'won' ? 'You cleared the board' : 'Game Over'}</h3>
              <p className="mt-3 text-white/70">Final score: {score}</p>
              <Button onClick={startGame} className="mt-6 bg-red-600 hover:bg-red-500">
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
