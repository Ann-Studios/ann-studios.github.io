import { EatYourFoodGame } from '../components/eat-your-food/BeninCampaignGame';
import { GamePageShell } from '../components/GamePageShell';

const EatYourFoodPage = () => {
  return (
    <GamePageShell
      title="Eat Your Food!"
      category="Match-3 adventure"
      description="Play as a lunch lady in Benin: collect ingredients, learn local meal sequences, and serve a new school lunch on every level."
    >
      <EatYourFoodGame />
    </GamePageShell>
  );
};

export default EatYourFoodPage;
