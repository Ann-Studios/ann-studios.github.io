import { GamePageShell } from "../components/GamePageShell";
import { BreakoutGame } from "../components/BreakoutGame";

const BreakoutPage = () => {
  return (
    <GamePageShell
      title="Breakout Neon"
      category="Arcade"
      description="A fast brick-breaker with mouse controls, paddle deflection, and short repeatable sessions that work well with banner ads."
    >
      <BreakoutGame />
    </GamePageShell>
  );
};

export default BreakoutPage;
