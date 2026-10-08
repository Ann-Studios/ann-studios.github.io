import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type Mark = 'X' | 'O' | null;

const getWinner = (board: Mark[]) => {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const getComputerMove = (board: Mark[]) => {
  const openSquares = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((value): value is number => value !== null);

  if (openSquares.length === 0) {
    return null;
  }

  for (const choice of openSquares) {
    const nextBoard = [...board];
    nextBoard[choice] = 'O';
    if (getWinner(nextBoard) === 'O') return choice;
  }

  for (const choice of openSquares) {
    const nextBoard = [...board];
    nextBoard[choice] = 'X';
    if (getWinner(nextBoard) === 'X') return choice;
  }

  if (board[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  return openSquares[Math.floor(Math.random() * openSquares.length)];
};

export function TicTacToeGame() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState({ player: 0, cpu: 0, ties: 0 });
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const resetBoard = () => {
    window.clearTimeout(timerRef.current);
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
  };

  const handleRoundEnd = (nextBoard: Mark[]) => {
    const nextWinner = getWinner(nextBoard);
    if (nextWinner === 'X') {
      setScore((prev) => ({ ...prev, player: prev.player + 1 }));
      return true;
    }
    if (nextWinner === 'O') {
      setScore((prev) => ({ ...prev, cpu: prev.cpu + 1 }));
      return true;
    }
    if (nextBoard.every(Boolean)) {
      setScore((prev) => ({ ...prev, ties: prev.ties + 1 }));
      return true;
    }
    return false;
  };

  const playMove = (index: number) => {
    if (!isPlayerTurn || board[index] || winner || isDraw) {
      return;
    }

    const playerBoard = [...board];
    playerBoard[index] = 'X';
    setBoard(playerBoard);

    if (handleRoundEnd(playerBoard)) {
      return;
    }

    setIsPlayerTurn(false);

    timerRef.current = window.setTimeout(() => {
        const computerMove = getComputerMove(playerBoard);
        if (computerMove === null) {
          setIsPlayerTurn(true);
          return;
        }

        const nextBoard = [...playerBoard];
        nextBoard[computerMove] = 'O';
        handleRoundEnd(nextBoard);
        setIsPlayerTurn(true);
        setBoard(nextBoard);
    }, 350);
  };

  const statusText = winner
    ? winner === 'X'
      ? 'You win this round'
      : 'Computer wins this round'
    : isDraw
      ? 'This round is a draw'
      : isPlayerTurn
        ? 'Your turn'
        : 'Computer is thinking...';

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Tic-Tac-Toe Duel</h2>
          <Badge className="bg-red-500/20 text-red-100">Strategy</Badge>
        </div>
        <div className="flex gap-3 text-sm text-white/80">
          <span>You: {score.player}</span>
          <span>CPU: {score.cpu}</span>
          <span>Ties: {score.ties}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
        {statusText}
      </div>

      <div className="tic-board">
        {board.map((cell, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Square ${index + 1}${cell ? ', ' + cell : ', empty'}`}
            disabled={!isPlayerTurn || !!cell || !!winner || isDraw}
            onClick={() => playMove(index)}
            className="aspect-square rounded-2xl border border-white/10 bg-white/5 text-4xl font-black text-white transition hover:border-red-400/40 hover:bg-red-500/10"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={resetBoard} className="bg-red-600 hover:bg-red-500">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Round
        </Button>
      </div>
    </div>
  );
}
