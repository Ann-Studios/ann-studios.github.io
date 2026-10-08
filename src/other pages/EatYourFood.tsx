import { EatYourFoodGame } from '../components/EatYourFoodGame';
import { GamePageShell } from '../components/GamePageShell';

const EatYourFoodPage = () => {
  return (
    <GamePageShell
      title="Eat Your Food!"
      category="Puzzle"
      description="Swap bright, healthy foods, build tasty cascades, and fill all three lunch stars before your moves run out."
    >
      <EatYourFoodGame />
    </GamePageShell>
  );
};

export default EatYourFoodPage;
