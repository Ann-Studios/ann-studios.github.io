import { GamePageShell } from "../components/GamePageShell";
import { MemoryMatchGame } from "../components/MemoryMatchGame";

const MemoryMatchPage = () => {
  return (
    <GamePageShell
      title="Memory Match"
      category="Puzzle"
      description="A simple concentration game that rewards quick recognition and keeps players engaged for short repeatable sessions."
    >
      <MemoryMatchGame />
    </GamePageShell>
  );
};

export default MemoryMatchPage;
