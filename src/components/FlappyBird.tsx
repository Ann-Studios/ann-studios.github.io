import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause } from 'lucide-react';

export const FlappyBird = () => {
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
    
    const pipes: Array<{x: number, topHeight: number, bottomHeight: number, passed: boolean}> = [];
    let currentScore = 0;
    let frame = 0;
    
    const pipeWidth = 60;
    const pipeGap = 150;
    
    // Generate pipes
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
    
    // Game loop
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      // Clear canvas
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
      
      // Update and draw pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= 3;
        
        // Draw pipes
        ctx.fillStyle = '#228B22';
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
        ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottomHeight, pipeWidth + 10, 30);
        
        // Score detection
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
          pipe.passed = true;
          currentScore++;
          setScore(currentScore);
        }
        
        // Collision detection
        if (
          bird.x + bird.radius > pipe.x &&
          bird.x - bird.radius < pipe.x + pipeWidth &&
          (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > canvas.height - pipe.bottomHeight)
        ) {
          setGameState('gameOver');
          if (currentScore > highScore) {
            setHighScore(currentScore);
          }
          return;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
          pipes.splice(i, 1);
        }
      }
      
      // Check boundaries
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
    
    // Jump function
    const jump = () => {
      if (gameState === 'playing') {
        bird.velocity = bird.jump;
      }
    };
    
    // Event listeners
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Flappy Bird</h1>
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
            className="w-full bg-gradient-to-b from-sky-300 to-green-300"
          />
          
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Flappy Bird</h2>
                <p className="mb-6">Click or press Space to flap!</p>
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
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Score: {score}</p>
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
            Click or press the spacebar to make the bird flap and fly through the gaps between pipes. 
            Avoid hitting the pipes or the ground!
          </p>
        </div>
      </div>
    </div>
  );
};