import { Puzzle2048 } from "../components/Puzzle2048";
import { GamePageShell } from "../components/GamePageShell";

const Puzzle2048Page = () => {
  return (
    <GamePageShell
      title="2048"
      category="Puzzle"
      description="A clean 2048 board with dedicated ad inventory above, beside, and below the gameplay so sessions stay uninterrupted."
    >
      <Puzzle2048 />
    </GamePageShell>
  );
};

export default Puzzle2048Page;
