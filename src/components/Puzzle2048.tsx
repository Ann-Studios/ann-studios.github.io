import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const Puzzle2048 = () => {
  const [board, setBoard] = useState<number[][]>(() => Array(4).fill(null).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('2048-best') || '0');
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Add random tile
  const addRandomTile = useCallback((newBoard: number[][]) => {
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
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [addRandomTile]);

  // Check if moves are possible
  const canMove = (board: number[][]) => {
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
  };

  // Move functions
  const moveLeft = (board: number[][]) => {
    const newBoard = board.map(row => [...row]);
    let moved = false;
    let points = 0;

    for (let i = 0; i < 4; i++) {
      let row = newBoard[i].filter(cell => cell !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          points += row[j];
          if (row[j] === 2048) setWon(true);
          row.splice(j + 1, 1);
        }
      }
      
      while (row.length < 4) {
        row.push(0);
      }
      
      if (JSON.stringify(row) !== JSON.stringify(newBoard[i])) {
        moved = true;
      }
      
      newBoard[i] = row;
    }

    return { board: newBoard, moved, points };
  };

  const moveRight = (board: number[][]) => {
    const rotatedBoard = board.map(row => [...row].reverse());
    const result = moveLeft(rotatedBoard);
    result.board = result.board.map(row => [...row].reverse());
    return result;
  };

  const moveUp = (board: number[][]) => {
    const rotatedBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotatedBoard[j][i] = board[i][j];
      }
    }
    
    const result = moveLeft(rotatedBoard);
    
    const finalBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        finalBoard[i][j] = result.board[j][i];
      }
    }
    
    result.board = finalBoard;
    return result;
  };

  const moveDown = (board: number[][]) => {
    const rotatedBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotatedBoard[3 - j][i] = board[i][j];
      }
    }
    
    const result = moveLeft(rotatedBoard);
    
    const finalBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        finalBoard[i][j] = result.board[3 - j][i];
      }
    }
    
    result.board = finalBoard;
    return result;
  };

  // Handle moves
  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;

    let result;
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
    }

    if (result.moved) {
      const newBoard = addRandomTile(result.board);
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
  };

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
  }, [board, gameOver, score, bestScore]);

  // Initialize on mount
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Get tile color
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-200',
      2: 'bg-gray-100 text-gray-700',
      4: 'bg-gray-100 text-gray-700',
      8: 'bg-orange-200 text-orange-800',
      16: 'bg-orange-300 text-orange-900',
      32: 'bg-red-300 text-red-900',
      64: 'bg-red-400 text-white',
      128: 'bg-yellow-300 text-yellow-900',
      256: 'bg-yellow-400 text-yellow-900',
      512: 'bg-yellow-500 text-white',
      1024: 'bg-yellow-600 text-white',
      2048: 'bg-ann-red text-white animate-pulse'
    };
    
    return colors[value] || 'bg-ann-red text-white';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">2048</h1>
            <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
              Puzzle
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-bold text-ann-red">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Best</div>
              <div className="text-xl font-bold text-foreground">{bestScore}</div>
            </div>
            <Button
              onClick={initializeBoard}
              variant="outline"
              className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        <div className="bg-gray-400 p-4 rounded-lg mb-6 relative">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`h-20 w-20 rounded-md flex items-center justify-center font-bold text-lg transition-all duration-150 ${getTileColor(cell)}`}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            )}
          </div>
          
          {(gameOver || won) && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">
                  {won ? 'You Win! 🎉' : 'Game Over!'}
                </h2>
                <p className="mb-4">Final Score: {score}</p>
                <Button
                  onClick={initializeBoard}
                  className="bg-ann-red hover:bg-ann-red-dark text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mb-6 md:hidden">
          <div></div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleMove('up')}
            className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div></div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleMove('left')}
            className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div></div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleMove('right')}
            className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
          
          <div></div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleMove('down')}
            className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
          <div></div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold text-foreground mb-2">How to Play:</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Goal:</strong> Reach the 2048 tile to win!
          </p>
        </div>
      </div>
    </div>
  );
};