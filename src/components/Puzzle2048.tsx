import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FullscreenButton } from './ui/FullscreenButton';
import styles from '../css/Puzzle2048.module.css';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

type Direction = 'left' | 'right' | 'up' | 'down';
type Board = number[][];
type MoveResult = {
  board: Board;
  moved: boolean;
  points: number;
};


export const Puzzle2048 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Board>(() =>
    Array(4).fill(null).map(() => Array(4).fill(0))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('2048-best') || '0');
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Add random tile
  const addRandomTile = useCallback((newBoard: Board): Board => {
    const emptyCells: Array<[number, number]> = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const [row, col] = randomCell;
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    }

    return newBoard;
  }, []);

  // Initialize board
  const initializeBoard = useCallback(() => {
    const newBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    const boardWithTiles = addRandomTile(addRandomTile(newBoard));
    setBoard(boardWithTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [addRandomTile]);

  // Check if moves are possible
  const canMove = useCallback((board: Board): boolean => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j];
        if (
          (j < 3 && board[i][j + 1] === current) ||
          (i < 3 && board[i + 1][j] === current)
        ) {
          return true;
        }
      }
    }

    return false;
  }, []);

  // Move functions
  const moveLeft = useCallback((board: Board): MoveResult => {
    const newBoard = board.map(row => [...row]);
    let moved = false;
    let points = 0;

    for (let i = 0; i < 4; i++) {
      // Remove zeros and merge adjacent equal values
      const row = newBoard[i].filter(cell => cell !== 0);
      const newRow: number[] = [];

      for (let j = 0; j < row.length; j++) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          const mergedValue = row[j] * 2;
          newRow.push(mergedValue);
          points += mergedValue;
          if (mergedValue === 2048) setWon(true);
          j++; // Skip next element
        } else {
          newRow.push(row[j]);
        }
      }

      // Pad with zeros
      while (newRow.length < 4) {
        newRow.push(0);
      }

      if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) {
        moved = true;
      }

      newBoard[i] = newRow;
    }

    return { board: newBoard, moved, points };
  }, []);

  const moveRight = useCallback((board: Board): MoveResult => {
    const rotatedBoard = board.map(row => [...row].reverse());
    const result = moveLeft(rotatedBoard);
    result.board = result.board.map(row => [...row].reverse());
    return result;
  }, [moveLeft]);

  const moveUp = useCallback((board: Board): MoveResult => {
    const rotatedBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotatedBoard[j][i] = board[i][j];
      }
    }

    const result = moveLeft(rotatedBoard);

    const finalBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        finalBoard[i][j] = result.board[j][i];
      }
    }

    return { ...result, board: finalBoard };
  }, [moveLeft]);

  const moveDown = useCallback((board: Board): MoveResult => {
    const rotatedBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotatedBoard[3 - j][i] = board[i][j];
      }
    }

    const result = moveLeft(rotatedBoard);

    const finalBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        finalBoard[i][j] = result.board[3 - j][i];
      }
    }

    return { ...result, board: finalBoard };
  }, [moveLeft]);

  // Handle moves
  const handleMove = useCallback((direction: Direction) => {
    if (gameOver) return;

    let result: MoveResult;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
      default:
        result = { board, moved: false, points: 0 };
    }

    if (result.moved) {
      const newBoard = addRandomTile([...result.board.map(row => [...row])]);
      setBoard(newBoard);

      const newScore = score + result.points;
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best', newScore.toString());
      }

      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, score, bestScore, moveLeft, moveRight, moveUp, moveDown, addRandomTile, canMove]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove('down');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // Initialize on mount
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Get tile class based on value
  const getTileClass = (value: number) => {
    return styles[`tile${value}`] || styles.tile0;
  };

  return (
    <div className={styles.container} ref={containerRef}>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>2048</h1>
            <Badge className={styles.badge}>
              Puzzle
            </Badge>
          </div>

          <div className={styles.scores}>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
            </div>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Best</div>
              <div className={styles.highscoreValue}>{bestScore}</div>
            </div>
            <FullscreenButton containerRef={containerRef} className={styles.button} />
            <Button
              onClick={initializeBoard}
              className={styles.button}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        <div className={styles.board}>
          <div className={styles.grid}>
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${styles.tile} ${getTileClass(cell)}`}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            )}
          </div>

          {(gameOver || won) && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2 className="text-2xl font-bold mb-4">
                  {won ? 'You Win! 🎉' : 'Game Over!'}
                </h2>
                <p className="mb-4">Final Score: {score}</p>
                <Button
                  onClick={initializeBoard}
                  className={styles.button}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className={styles.controls}>
          <div></div>
          <Button
            onClick={() => handleMove('up')}
            className={styles.controlButton}
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div></div>

          <Button
            onClick={() => handleMove('left')}
            className={styles.controlButton}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div></div>
          <Button
            onClick={() => handleMove('right')}
            className={styles.controlButton}
          >
            <ArrowRight className="w-6 h-6" />
          </Button>

          <div></div>
          <Button
            onClick={() => handleMove('down')}
            className={styles.controlButton}
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
          <div></div>
        </div>

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>How to Play:</h3>
          <p className={styles.instructionsText}>
            Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!
          </p>
          <p className={styles.instructionsText}>
            <strong>Goal:</strong> Reach the 2048 tile to win!
          </p>
        </div>
      </div>
    </div>
  );
};