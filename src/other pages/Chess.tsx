import { ChessGame } from "../components/ChessGame";
import { GamePageShell } from "../components/GamePageShell";

const Chess = () => {
  return (
    <GamePageShell
      title="3D Chess"
      category="Strategy"
      description="A playable 3D chess demo with a stable scene lifecycle and ad space reserved around the board instead of on top of it."
    >
      <ChessGame />
    </GamePageShell>
  );
};

export default Chess;
