import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FullscreenButton } from '../components/ui/FullscreenButton';
import { RotateCcw, Target } from 'lucide-react';
import styles from '../css/BubbleShooter.module.css';

export const BubbleShooter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'levelComplete'>('playing');
  const gameRef = useRef<any>(null);

  const startGame = useCallback(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d', '#ff9ff3', '#a8e6cf'];
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const bubbleRadius = 20;
    const rows = 10;
    const cols = 12;
    const topMargin = 50;

    // Game state
    let bubbles: Array<Array<{ color: string, visible: boolean }>> = [];
    let shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: -Math.PI / 2 };
    let currentBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
    let nextBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
    let projectile: { x: number, y: number, vx: number, vy: number, color: string } | null = null;
    let currentScore = 0;
    let isGameRunning = true;

    // Initialize bubbles
    const initBubbles = () => {
      bubbles = [];
      const usedColors = colors.slice(0, Math.min(3 + level, colors.length));
      const startingRows = Math.min(3 + Math.floor(level / 2), 6);

      for (let row = 0; row < startingRows; row++) {
        bubbles[row] = [];
        const colCount = cols - (row % 2);

        for (let col = 0; col < colCount; col++) {
          if (Math.random() > 0.2) {
            bubbles[row][col] = {
              color: usedColors[Math.floor(Math.random() * usedColors.length)],
              visible: true
            };
          } else {
            bubbles[row][col] = { color: '#000', visible: false };
          }
        }
      }
    };

    initBubbles();

    // Get bubble position
    const getBubblePos = (row: number, col: number) => {
      const offsetX = (row % 2) * bubbleRadius;
      return {
        x: col * bubbleRadius * 2 + bubbleRadius + offsetX,
        y: row * bubbleRadius * 1.8 + bubbleRadius + topMargin
      };
    };

    // Find closest bubble to attach to
    const findClosestBubble = (x: number, y: number) => {
      let closestDistance = Infinity;
      let closestBubble = { row: -1, col: -1 };

      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          if (bubbles[row][col].visible) {
            const pos = getBubblePos(row, col);
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));

            if (distance < closestDistance && distance < bubbleRadius * 2.5) {
              closestDistance = distance;
              closestBubble = { row, col };
            }
          }
        }
      }

      return closestBubble;
    };

    // Find empty spot near position
    const findEmptySpot = (x: number, y: number) => {
      const row = Math.round((y - bubbleRadius - topMargin) / (bubbleRadius * 1.8));
      const isOddRow = row % 2 === 1;
      const col = Math.round((x - bubbleRadius - (isOddRow ? bubbleRadius : 0)) / (bubbleRadius * 2));

      if (row >= 0 && row < rows && col >= 0 && col < (cols - (row % 2))) {
        if (!bubbles[row] || !bubbles[row][col] || !bubbles[row][col].visible) {
          return { row, col };
        }
      }

      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        const colCount = cols - (r % 2);
        for (let c = Math.max(0, col - 1); c <= Math.min(colCount - 1, col + 1); c++) {
          if (!bubbles[r] || !bubbles[r][c] || !bubbles[r][c].visible) {
            return { row: r, col: c };
          }
        }
      }

      return null;
    };

    // Find matching bubbles
    const findMatches = (row: number, col: number, color: string, visited: Set<string> = new Set()) => {
      const key = `${row}-${col}`;
      if (visited.has(key)) return [];
      if (row < 0 || row >= rows || col < 0 || col >= (cols - (row % 2)) ||
        !bubbles[row] || !bubbles[row][col] || !bubbles[row][col].visible || bubbles[row][col].color !== color) {
        return [];
      }

      visited.add(key);
      let matches = [{ row, col }];

      const isOddRow = row % 2 === 1;
      const neighbors = [
        { row: row - 1, col: isOddRow ? col : col - 1 },
        { row: row - 1, col: isOddRow ? col + 1 : col },
        { row, col: col - 1 },
        { row, col: col + 1 },
        { row: row + 1, col: isOddRow ? col : col - 1 },
        { row: row + 1, col: isOddRow ? col + 1 : col }
      ];

      for (const neighbor of neighbors) {
        matches = matches.concat(findMatches(neighbor.row, neighbor.col, color, visited));
      }

      return matches;
    };

    // Remove floating bubbles
    const removeFloatingBubbles = () => {
      const connected = new Set<string>();

      const markConnected = (row: number, col: number) => {
        const key = `${row}-${col}`;
        if (connected.has(key) || row < 0 || row >= rows || col < 0 || col >= (cols - (row % 2)) ||
          !bubbles[row] || !bubbles[row][col] || !bubbles[row][col].visible) {
          return;
        }

        connected.add(key);

        const isOddRow = row % 2 === 1;
        const neighbors = [
          { row: row - 1, col: isOddRow ? col : col - 1 },
          { row: row - 1, col: isOddRow ? col + 1 : col },
          { row, col: col - 1 },
          { row, col: col + 1 },
          { row: row + 1, col: isOddRow ? col : col - 1 },
          { row: row + 1, col: isOddRow ? col + 1 : col }
        ];

        for (const neighbor of neighbors) {
          markConnected(neighbor.row, neighbor.col);
        }
      };

      for (let col = 0; col < (cols - (0 % 2)); col++) {
        if (bubbles[0] && bubbles[0][col] && bubbles[0][col].visible) {
          markConnected(0, col);
        }
      }

      let removedCount = 0;
      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          const key = `${row}-${col}`;
          if (bubbles[row][col].visible && !connected.has(key)) {
            bubbles[row][col].visible = false;
            removedCount++;
            currentScore += 15;
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

    // Check game over
    const checkGameOver = () => {
      for (let row = Math.max(0, rows - 3); row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          if (bubbles[row][col].visible) {
            return true;
          }
        }
      }
      return false;
    };

    // Draw game elements
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let row = 0; row < rows; row++) {
        if (!bubbles[row]) continue;
        for (let col = 0; col < bubbles[row].length; col++) {
          const bubble = bubbles[row][col];
          if (!bubble.visible) continue;

          const pos = getBubblePos(row, col);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = bubble.color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(pos.x - 5, pos.y - 5, bubbleRadius / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.translate(shooter.x, shooter.y);
      ctx.rotate(shooter.angle);

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-18, -12, 36, 24);

      ctx.fillStyle = '#34495e';
      ctx.fillRect(-6, -35, 12, 35);

      ctx.restore();

      ctx.fillStyle = currentBubble.color;
      ctx.beginPath();
      ctx.arc(shooter.x, shooter.y - 40, bubbleRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nextBubble.color;
      ctx.beginPath();
      ctx.arc(50, canvas.height - 50, bubbleRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Next:', 15, canvas.height - 60);

      if (projectile) {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, bubbleRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Score: ${currentScore}`, canvas.width - 120, 30);
      ctx.fillText(`Level: ${level}`, canvas.width - 120, 55);
    };

    // Game loop
    const gameLoop = () => {
      if (!isGameRunning || gameState !== 'playing') return;

      draw();

      if (projectile) {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        if (projectile.x <= bubbleRadius || projectile.x >= canvas.width - bubbleRadius) {
          projectile.vx = -projectile.vx;
        }

        if (projectile.y <= bubbleRadius + topMargin) {
          const emptySpot = findEmptySpot(projectile.x, projectile.y);
          if (emptySpot) {
            if (!bubbles[emptySpot.row]) {
              bubbles[emptySpot.row] = [];
            }
            while (bubbles[emptySpot.row].length <= emptySpot.col) {
              bubbles[emptySpot.row].push({ color: '#000', visible: false });
            }

            bubbles[emptySpot.row][emptySpot.col] = {
              color: projectile.color,
              visible: true
            };

            const matches = findMatches(emptySpot.row, emptySpot.col, projectile.color);
            if (matches.length >= 3) {
              matches.forEach(match => {
                if (bubbles[match.row] && bubbles[match.row][match.col]) {
                  bubbles[match.row][match.col].visible = false;
                  currentScore += 50;
                }
              });

              const floatingCount = removeFloatingBubbles();
              currentScore += floatingCount * 20;
            }

            if (checkGameOver()) {
              setGameState('gameOver');
              setScore(currentScore);
              isGameRunning = false;
              return;
            }

            if (checkLevelComplete()) {
              setGameState('levelComplete');
              setScore(currentScore);
              isGameRunning = false;
              return;
            }
          }

          projectile = null;
          currentBubble = nextBubble;
          nextBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
        }

        // Bubble collision - Added null check for projectile
        if (projectile) {
          const closestBubble = findClosestBubble(projectile.x, projectile.y);
          if (closestBubble.row !== -1) {
            const emptySpot = findEmptySpot(projectile.x, projectile.y);
            if (emptySpot) {
              if (!bubbles[emptySpot.row]) {
                bubbles[emptySpot.row] = [];
              }
              while (bubbles[emptySpot.row].length <= emptySpot.col) {
                bubbles[emptySpot.row].push({ color: '#000', visible: false });
              }

              bubbles[emptySpot.row][emptySpot.col] = {
                color: projectile.color,
                visible: true
              };

              const matches = findMatches(emptySpot.row, emptySpot.col, projectile.color);
              if (matches.length >= 3) {
                matches.forEach(match => {
                  if (bubbles[match.row] && bubbles[match.row][match.col]) {
                    bubbles[match.row][match.col].visible = false;
                    currentScore += 50;
                  }
                });

                const floatingCount = removeFloatingBubbles();
                currentScore += floatingCount * 20;
              }

              if (checkGameOver()) {
                setGameState('gameOver');
                setScore(currentScore);
                isGameRunning = false;
                return;
              }

              if (checkLevelComplete()) {
                setGameState('levelComplete');
                setScore(currentScore);
                isGameRunning = false;
                return;
              }
            }

            projectile = null;
            currentBubble = nextBubble;
            nextBubble = { color: colors[Math.floor(Math.random() * colors.length)] };
          }
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

      const minAngle = -Math.PI;
      const maxAngle = 0;
      shooter.angle = Math.max(minAngle, Math.min(maxAngle, shooter.angle));
    };

    const handleClick = () => {
      if (!projectile && gameState === 'playing' && isGameRunning) {
        const speed = 10;
        projectile = {
          x: shooter.x,
          y: shooter.y - 40,
          vx: Math.cos(shooter.angle) * speed,
          vy: Math.sin(shooter.angle) * speed,
          color: currentBubble.color
        };
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    draw();
    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (gameRef.current) {
        cancelAnimationFrame(gameRef.current);
      }
      isGameRunning = false;
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
    <div className={styles.container} ref={containerRef}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>Bubble Shooter</h1>
            <Badge className={styles.badge}>
              Puzzle
            </Badge>
          </div>
          <div className={styles.scores}>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Level</div>
              <div className={styles.levelValue}>{level}</div>
            </div>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
            </div>
            <FullscreenButton containerRef={containerRef} className={styles.button} />
            <Button
              onClick={resetGame}
              className={styles.button}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={600}
            height={800}
            className={styles.canvas}
          />

          {gameState === 'levelComplete' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-2xl font-bold mb-2">Level Complete! 🎉</h2>
                <p className="mb-4">Score: {score}</p>
                <Button
                  onClick={nextLevel}
                  className={styles.button}
                >
                  Next Level
                </Button>
                <Button
                  onClick={resetGame}
                  className={styles.button}
                  variant="outline"
                >
                  Restart
                </Button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Final Score: {score}</p>
                <Button
                  onClick={resetGame}
                  className={styles.button}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <div className={styles.instructionsContent}>
            <Target className={styles.instructionsIcon} />
            <div>
              <h3 className={styles.instructionsTitle}>How to Play:</h3>
              <p className={styles.instructionsText}>
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