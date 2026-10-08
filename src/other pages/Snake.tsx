import { SnakeGame } from "../components/SnakeGame";
import { GamePageShell } from "../components/GamePageShell";

const SnakePage = () => {
  return (
    <GamePageShell
      title="Modern Snake"
      category="Arcade"
      description="A quick, responsive snake remake with fullscreen support and room for monetized ad slots around the play area."
    >
      <SnakeGame />
    </GamePageShell>
  );
};

export default SnakePage;
