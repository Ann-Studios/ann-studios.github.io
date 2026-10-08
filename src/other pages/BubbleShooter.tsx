import { BubbleShooter } from "../components/BubbleShooter";
import { GamePageShell } from "../components/GamePageShell";
import '../css/BubbleShooter.module.css';

const BubbleShooterPage = () => {
  return (
    <GamePageShell
      title="Bubble Shooter"
      category="Puzzle"
      description="A longer-session puzzle game with persistent side and banner ad slots that don’t cover the shooter controls."
    >
      <BubbleShooter />
    </GamePageShell>
  );
};

export default BubbleShooterPage;
