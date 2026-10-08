import { FlappyBird } from "../components/FlappyBird";
import { GamePageShell } from "../components/GamePageShell";

const FlappyBirdPage = () => {
  return (
    <GamePageShell
      title="Flappy Bird"
      category="Arcade"
      description="Players can jump straight into a single-tap run while banner ads stay outside the canvas so the controls remain clean."
    >
      <FlappyBird />
    </GamePageShell>
  );
};

export default FlappyBirdPage;
