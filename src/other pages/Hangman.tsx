import { GamePageShell } from "../components/GamePageShell";
import { HangmanGame } from "../components/HangmanGame";

const HangmanPage = () => {
  return (
    <GamePageShell
      title="Hangman"
      category="Word"
      description="A clean, replayable word game with hints, persistent round tracking, and plenty of room for monetized side inventory."
    >
      <HangmanGame />
    </GamePageShell>
  );
};

export default HangmanPage;
