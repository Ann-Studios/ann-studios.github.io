import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Target } from 'lucide-react';

export const BubbleShooter = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'levelComplete'>('playing');
  const gameRef = useRef<any>(null);

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d', '#ff9ff3', '#a8e6cf'];

  const startGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    const bubbleRadius = 20;
    const rows = 8;
    const cols = 12;
    
    // Game state
    let bubbles: Array<Array<{color: string, visible: boolean}>> = [];
    let shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: -Math.PI / 2 };
    let currentBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
    let nextBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
    let projectile: {x: number, y: number, vx: number, vy: number, color: string} | null = null;
    let currentScore = 0;
    
    // Initialize bubbles
    const initBubbles = () => {
      bubbles = [];
      const usedColors = colors.slice(0, Math.min(4 + level, colors.length));
      
      for (let row = 0; row < Math.min(4 + level, rows); row++) {
        bubbles[row] = [];
        const colCount = cols - (row % 2);
        
        for (let col = 0; col < colCount; col++) {
          bubbles[row][col] = {
            color: usedColors[Math.floor(Math.random() * usedColors.length)],
            visible: true
          };
        }
      }
    };
    
    initBubbles();
    
    // Get bubble position
    const getBubblePos = (row: number, col: number) => {
      const offsetX = (row % 2) * bubbleRadius;
      return {
        x: col * bubbleRadius * 2 + bubbleRadius + offsetX,
        y: row * bubbleRadius * 2 + bubbleRadius
      };
    };
    
    // Check collision
    const checkCollision = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x1 - x2;
      const dy = y1 - y2;
      return Math.sqrt(dx * dx + dy * dy) < bubbleRadius * 2;
    };
    
    // Find matching bubbles
    const findMatches = (row: number, col: number, color: string, visited: Set<string> = new Set()) => {
      const key = `${row}-${col}`;
      if (visited.has(key)) return [];
      if (!bubbles[row] || !bubbles[row][col] || !bubbles[row][col].visible || bubbles[row][col].color !== color) {
        return [];
      }
      
      visited.add(key);
      let matches = [{row, col}];
      
      // Check neighbors
      const neighbors = [
        {row: row - 1, col: col - (row % 2)},
        {row: row - 1, col: col + 1 - (row % 2)},
        {row, col: col - 1},
        {row, col: col + 1},
        {row: row + 1, col: col - (row % 2)},
        {row: row + 1, col: col + 1 - (row % 2)}
      ];
      
      for (const neighbor of neighbors) {
        matches = matches.concat(findMatches(neighbor.row, neighbor.col, color, visited));
      }
      
      return matches;
    };
    
    // Remove floating bubbles
    const removeFloatingBubbles = () => {
      const connected = new Set<string>();
      
      // Mark bubbles connected to top
      const markConnected = (row: number, col: number) => {
        const key = `${row}-${col}`;
        if (connected.has(key) || !bubbles[row] || !bubbles[row][col] || !bubbles[row][col].visible) {
          return;
        }
        
        connected.add(key);
        
        // Check neighbors
        const neighbors = [
          {row: row - 1, col: col - (row % 2)},
          {row: row - 1, col: col + 1 - (row % 2)},
          {row, col: col - 1},
          {row, col: col + 1},
          {row: row + 1, col: col - (row % 2)},
          {row: row + 1, col: col + 1 - (row % 2)}
        ];
        
        for (const neighbor of neighbors) {
          markConnected(neighbor.row, neighbor.col);
        }
      };
      
      // Start from top row
      for (let col = 0; col < cols; col++) {
        markConnected(0, col);
      }
      
      // Remove unconnected bubbles
      let removedCount = 0;
      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          const key = `${row}-${col}`;
          if (bubbles[row][col].visible && !connected.has(key)) {
            bubbles[row][col].visible = false;
            removedCount++;
            currentScore += 10;
          }
        }
      }
      
      return removedCount;
    };
    
    // Check level complete
    const checkLevelComplete = () => {
      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          if (bubbles[row][col].visible) return false;
        }
      }
      return true;
    };
    
    // Game loop
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw bubbles
      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          const bubble = bubbles[row][col];
          if (!bubble.visible) continue;
          
          const pos = getBubblePos(row, col);
          
          ctx.fillStyle = bubble.color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Bubble highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(pos.x - 6, pos.y - 6, bubbleRadius / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Draw shooter
      ctx.save();
      ctx.translate(shooter.x, shooter.y);
      ctx.rotate(shooter.angle);
      
      // Shooter base
      ctx.fillStyle = '#333';
      ctx.fillRect(-15, -10, 30, 20);
      
      // Shooter barrel
      ctx.fillStyle = '#555';
      ctx.fillRect(-5, -30, 10, 30);
      
      ctx.restore();
      
      // Draw current bubble
      ctx.fillStyle = currentBubble.color;
      ctx.beginPath();
      ctx.arc(shooter.x, shooter.y - 35, bubbleRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw next bubble
      ctx.fillStyle = nextBubble.color;
      ctx.beginPath();
      ctx.arc(50, canvas.height - 50, bubbleRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('Next:', 10, canvas.height - 20);
      
      // Update projectile
      if (projectile) {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        
        // Wall collision
        if (projectile.x <= bubbleRadius || projectile.x >= canvas.width - bubbleRadius) {
          projectile.vx = -projectile.vx;
        }
        
        // Ceiling collision
        if (projectile.y <= bubbleRadius) {
          // Add bubble to grid
          const col = Math.floor((projectile.x - bubbleRadius) / (bubbleRadius * 2));
          if (bubbles[0] && bubbles[0][col]) {
            bubbles[0][col] = { color: projectile.color, visible: true };
          }
          projectile = null;
        }
        
        // Bubble collision
        for (let row = 0; row < rows && projectile; row++) {
          if (!bubbles[row]) continue;
          for (let col = 0; col < bubbles[row].length && projectile; col++) {
            const bubble = bubbles[row][col];
            if (!bubble.visible) continue;
            
            const pos = getBubblePos(row, col);
            if (checkCollision(projectile.x, projectile.y, pos.x, pos.y)) {
              // Find empty spot to place bubble
              let placed = false;
              const neighbors = [
                {row: row - 1, col: col - (row % 2)},
                {row: row - 1, col: col + 1 - (row % 2)},
                {row, col: col - 1},
                {row, col: col + 1},
                {row: row + 1, col: col - (row % 2)},
                {row: row + 1, col: col + 1 - (row % 2)}
              ];
              
              for (const neighbor of neighbors) {
                if (
                  neighbor.row >= 0 && neighbor.row < rows &&
                  bubbles[neighbor.row] && bubbles[neighbor.row][neighbor.col] &&
                  !bubbles[neighbor.row][neighbor.col].visible
                ) {
                  bubbles[neighbor.row][neighbor.col] = {
                    color: projectile.color,
                    visible: true
                  };
                  
                  // Check for matches
                  const matches = findMatches(neighbor.row, neighbor.col, projectile.color);
                  if (matches.length >= 3) {
                    matches.forEach(match => {
                      bubbles[match.row][match.col].visible = false;
                      currentScore += 50;
                    });
                    
                    // Remove floating bubbles
                    const floatingCount = removeFloatingBubbles();
                    if (floatingCount > 0) {
                      currentScore += floatingCount * 25;
                    }
                  }
                  
                  placed = true;
                  break;
                }
              }
              
              projectile = null;
              
              // Next bubble
              currentBubble = nextBubble;
              nextBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
              
              // Check level complete
              if (checkLevelComplete()) {
                setGameState('levelComplete');
                return;
              }
            }
          }
        }
        
        // Draw projectile
        if (projectile) {
          ctx.fillStyle = projectile.color;
          ctx.beginPath();
          ctx.arc(projectile.x, projectile.y, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      setScore(currentScore);
      gameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
      
      // Limit angle
      if (shooter.angle > -Math.PI / 6) shooter.angle = -Math.PI / 6;
      if (shooter.angle < -Math.PI + Math.PI / 6) shooter.angle = -Math.PI + Math.PI / 6;
    };
    
    const handleClick = () => {
      if (!projectile && gameState === 'playing') {
        const speed = 8;
        projectile = {
          x: shooter.x,
          y: shooter.y - 35,
          vx: Math.cos(shooter.angle) * speed,
          vy: Math.sin(shooter.angle) * speed,
          color: currentBubble.color
        };
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    gameLoop();
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (gameRef.current) {
        cancelAnimationFrame(gameRef.current);
      }
    };
  }, [gameState, level]);

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setGameState('playing');
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameState('playing');
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
            <h1 className="text-2xl font-bold text-foreground">Bubble Shooter</h1>
            <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
              Puzzle
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-xl font-bold text-ann-red">{level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-bold text-foreground">{score}</div>
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
            width={600}
            height={800}
            className="w-full max-h-[70vh] cursor-crosshair"
          />
          
          {gameState === 'levelComplete' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">Level Complete! 🎉</h2>
                <p className="text-lg mb-4">Score: {score}</p>
                <Button
                  onClick={nextLevel}
                  className="bg-ann-red hover:bg-ann-red-dark text-white mr-2"
                >
                  Next Level
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
                >
                  Restart
                </Button>
              </div>
            </div>
          )}
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
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
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-ann-red mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">How to Play:</h3>
              <p className="text-sm text-muted-foreground">
                Aim and click to shoot bubbles. Match 3 or more bubbles of the same color to make them pop. 
                Clear all bubbles to complete the level!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};