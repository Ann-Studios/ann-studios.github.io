import { GamePageShell } from "../components/GamePageShell";
import { TicTacToeGame } from "../components/TicTacToeGame";

const TicTacToePage = () => {
  return (
    <GamePageShell
      title="Tic-Tac-Toe Duel"
      category="Strategy"
      description="A quick head-to-head tic-tac-toe match against the computer, perfect for fast sessions between longer games."
    >
      <TicTacToeGame />
    </GamePageShell>
  );
};

export default TicTacToePage;
