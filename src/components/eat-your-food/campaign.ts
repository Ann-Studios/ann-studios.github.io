import type { TileType } from '../match3/engine';

export const CAMPAIGN_STORAGE_KEY = 'eat-your-food-campaign-v1';
export const CAMPAIGN_VERSION = 1;

export interface IngredientInfo {
  readonly name: string;
  readonly symbol: string;
  readonly color: string;
  readonly pale: string;
}

export const INGREDIENTS: Record<TileType, IngredientInfo> = {
  maize: { name: 'Maize', symbol: '🌽', color: '#d89312', pale: '#fff1b8' },
  tomato: { name: 'Tomato', symbol: '🍅', color: '#d94732', pale: '#ffe0d8' },
  pepper: { name: 'Pepper', symbol: '🌶️', color: '#b9362b', pale: '#ffd9d2' },
  onion: { name: 'Onion', symbol: '🧅', color: '#8e5b9b', pale: '#f2e3f4' },
  fish: { name: 'Fish', symbol: '🐟', color: '#247d91', pale: '#d8f0f3' },
  beans: { name: 'Beans', symbol: '🫘', color: '#8c4d31', pale: '#f2ded0' },
  rice: { name: 'Rice', symbol: '🍚', color: '#c28d47', pale: '#fff5df' },
  yam: { name: 'Yam', symbol: '🍠', color: '#8f4d65', pale: '#f6dfe7' },
  cassava: { name: 'Cassava', symbol: '🥔', color: '#8d6a36', pale: '#f3e8cf' },
  plantain: { name: 'Plantain', symbol: '🍌', color: '#9e9b19', pale: '#f4f1bd' },
  peanut: { name: 'Groundnut', symbol: '🥜', color: '#a65d2e', pale: '#f3dfc8' },
  greens: { name: 'Leafy greens', symbol: '🥬', color: '#3d8a52', pale: '#dff2df' },
  palmOil: { name: 'Palm oil', symbol: '🟠', color: '#d55b24', pale: '#ffe1cd' },
  cheese: { name: 'Wagasi cheese', symbol: '🧀', color: '#d8a51f', pale: '#fff0b6' },
  okra: { name: 'Okra', symbol: '🫛', color: '#4d9348', pale: '#e3f3d9' },
  flour: { name: 'Flour', symbol: '🥣', color: '#a97e58', pale: '#f5eadc' },
  apple: { name: 'Apple', symbol: '🍎', color: '#cf4336', pale: '#ffe1dc' },
  carrot: { name: 'Carrot', symbol: '🥕', color: '#df7428', pale: '#ffead6' },
  broccoli: { name: 'Broccoli', symbol: '🥦', color: '#4b8b45', pale: '#e1f1dc' },
  blueberry: { name: 'Blueberry', symbol: '🫐', color: '#6651a2', pale: '#e9e3f8' },
  milk: { name: 'Milk', symbol: '🥛', color: '#328e9c', pale: '#e0f3f5' },
};

export type CookingAction =
  | 'rinse'
  | 'chop'
  | 'mix'
  | 'simmer'
  | 'steam'
  | 'fry'
  | 'pound'
  | 'grill'
  | 'serve';

export const COOKING_ACTIONS: Record<
  CookingAction,
  { readonly label: string; readonly symbol: string }
> = {
  rinse: { label: 'Rinse & sort', symbol: '💧' },
  chop: { label: 'Chop & prep', symbol: '🔪' },
  mix: { label: 'Mix together', symbol: '🥣' },
  simmer: { label: 'Simmer gently', symbol: '🍲' },
  steam: { label: 'Steam', symbol: '♨️' },
  fry: { label: 'Fry carefully', symbol: '🍳' },
  pound: { label: 'Pound smooth', symbol: '🥄' },
  grill: { label: 'Grill', symbol: '🔥' },
  serve: { label: 'Plate & serve', symbol: '🍽️' },
};

export interface IngredientGoal {
  readonly ingredient: TileType;
  readonly amount: number;
}

export interface CookingStep {
  readonly action: CookingAction;
  readonly title: string;
  readonly instruction: string;
}

export interface MealLevel {
  readonly id: number;
  readonly stop: string;
  readonly meal: string;
  readonly origin: 'Benin' | 'West Africa';
  readonly mealSymbol: string;
  readonly description: string;
  readonly lunchNote: string;
  readonly moves: number;
  readonly targets: ReadonlyArray<IngredientGoal>;
  readonly activeIngredients: ReadonlyArray<TileType>;
  readonly steps: ReadonlyArray<CookingStep>;
}

function goal(ingredient: TileType, amount: number): IngredientGoal {
  return { ingredient, amount };
}

function step(
  action: CookingAction,
  title: string,
  instruction: string,
): CookingStep {
  return { action, title, instruction };
}

function makeLevel(level: MealLevel): MealLevel {
  return level;
}

export const BENIN_LEVELS: ReadonlyArray<MealLevel> = [
  makeLevel({
    id: 1,
    stop: 'Cotonou Canteen',
    meal: 'Amiwo (Djèwo)',
    origin: 'Benin',
    mealSymbol: '🥣',
    description: 'A savory red maize dish colored by a tomato-rich sauce.',
    lunchNote: 'The first bell is ringing—make a bright tray for the Cotonou class.',
    moves: 24,
    targets: [goal('maize', 7), goal('tomato', 6), goal('palmOil', 4)],
    activeIngredients: ['maize', 'tomato', 'palmOil', 'pepper', 'onion', 'fish'],
    steps: [
      step('chop', 'Build the flavor base', 'Prepare the tomato, onion, and pepper for the pot.'),
      step('simmer', 'Cook the red sauce', 'Let the vegetables soften and the flavors come together.'),
      step('mix', 'Work in the maize', 'Stir the maize gradually until the dish is smooth and firm.'),
      step('serve', 'Fill the lunch bowls', 'Plate the amiwo while it is warm and ready to share.'),
    ],
  }),
  makeLevel({
    id: 2,
    stop: 'Cotonou Canteen',
    meal: 'Atassi (Watché)',
    origin: 'Benin',
    mealSymbol: '🍛',
    description: 'Rice and beans cooked into a hearty everyday favorite.',
    lunchNote: 'A busy study group needs a filling rice-and-bean lunch.',
    moves: 24,
    targets: [goal('rice', 7), goal('beans', 7), goal('onion', 4)],
    activeIngredients: ['rice', 'beans', 'onion', 'tomato', 'fish', 'greens'],
    steps: [
      step('rinse', 'Sort the staples', 'Rinse the rice and sort the beans before cooking.'),
      step('simmer', 'Cook until tender', 'Give the beans enough time, then cook them with the rice.'),
      step('mix', 'Fold the pot together', 'Combine the grains gently so each scoop has rice and beans.'),
      step('serve', 'Make balanced plates', 'Add a colorful side and serve the students.'),
    ],
  }),
  makeLevel({
    id: 3,
    stop: 'Cotonou Canteen',
    meal: 'Akassa & Fish Sauce',
    origin: 'Benin',
    mealSymbol: '🐟',
    description: 'A smooth fermented maize dough served with a lively fish sauce.',
    lunchNote: 'Today the class explores the tangy taste of fermented maize.',
    moves: 25,
    targets: [goal('maize', 8), goal('tomato', 5), goal('fish', 5)],
    activeIngredients: ['maize', 'tomato', 'fish', 'pepper', 'onion', 'greens'],
    steps: [
      step('mix', 'Prepare the maize base', 'Blend the prepared fermented maize mixture until smooth.'),
      step('simmer', 'Cook the akassa', 'Stir patiently as the maize thickens over gentle heat.'),
      step('simmer', 'Finish the fish sauce', 'Cook the fish with tomato, onion, and pepper.'),
      step('serve', 'Pair and plate', 'Serve a neat portion of akassa beside the sauce.'),
    ],
  }),
  makeLevel({
    id: 4,
    stop: 'Cotonou Canteen',
    meal: 'Ablo & Seasoned Fish',
    origin: 'Benin',
    mealSymbol: '♨️',
    description: 'Soft steamed rice-and-maize cakes with a savory fish side.',
    lunchNote: 'The canteen needs soft ablo cakes for an end-of-week lunch.',
    moves: 25,
    targets: [goal('rice', 7), goal('maize', 5), goal('fish', 5)],
    activeIngredients: ['rice', 'maize', 'fish', 'tomato', 'onion', 'pepper'],
    steps: [
      step('mix', 'Make the batter', 'Combine the grain mixture into a light, even batter.'),
      step('steam', 'Steam the cakes', 'Portion the batter and steam until the cakes are soft.'),
      step('grill', 'Season the fish', 'Cook the fish with the prepared aromatics.'),
      step('serve', 'Build the plate', 'Set the warm ablo beside the seasoned fish.'),
    ],
  }),
  makeLevel({
    id: 5,
    stop: 'Ouidah Courtyard',
    meal: 'Maize Paste & Okra Sauce',
    origin: 'Benin',
    mealSymbol: '🌿',
    description: 'Comforting maize paste with a green okra-and-fish sauce.',
    lunchNote: 'The Ouidah courtyard tables are ready for their first shared meal.',
    moves: 25,
    targets: [goal('maize', 8), goal('okra', 6), goal('fish', 4)],
    activeIngredients: ['maize', 'okra', 'fish', 'tomato', 'onion', 'pepper'],
    steps: [
      step('chop', 'Prepare the okra', 'Trim and cut the okra with the aromatics.'),
      step('simmer', 'Cook the green sauce', 'Simmer the okra gently, then add the fish.'),
      step('mix', 'Shape the maize paste', 'Stir the maize until smooth and spoonable.'),
      step('serve', 'Bring both together', 'Serve the sauce beside a tidy mound of maize paste.'),
    ],
  }),
  makeLevel({
    id: 6,
    stop: 'Ouidah Courtyard',
    meal: 'Akara Bean Fritters',
    origin: 'West Africa',
    mealSymbol: '🫘',
    description: 'Crisp bean fritters with a soft, savory center.',
    lunchNote: 'Make a crunchy snack tray for students rehearsing after class.',
    moves: 25,
    targets: [goal('beans', 9), goal('onion', 5), goal('pepper', 4)],
    activeIngredients: ['beans', 'onion', 'pepper', 'tomato', 'peanut', 'greens'],
    steps: [
      step('rinse', 'Sort and soak', 'Clean and soften the beans before blending.'),
      step('mix', 'Whip the bean batter', 'Mix in the onion and pepper until the batter is airy.'),
      step('fry', 'Cook the fritters', 'Fry small spoonfuls carefully until golden.'),
      step('serve', 'Share the akara', 'Drain well and portion the fritters for the students.'),
    ],
  }),
  makeLevel({
    id: 7,
    stop: 'Ouidah Courtyard',
    meal: 'Monyo Fish Plate',
    origin: 'Benin',
    mealSymbol: '🐠',
    description: 'Grilled fish paired with a bright onion-and-pepper table sauce.',
    lunchNote: 'A fresh, colorful plate will cool down a sunny lunch break.',
    moves: 26,
    targets: [goal('fish', 7), goal('onion', 6), goal('pepper', 5)],
    activeIngredients: ['fish', 'onion', 'pepper', 'palmOil', 'maize', 'greens'],
    steps: [
      step('chop', 'Cut the aromatics', 'Slice the onion and pepper finely for the sauce.'),
      step('mix', 'Make the monyo', 'Mix the aromatics with the sauce base.'),
      step('grill', 'Cook the fish', 'Grill the seasoned fish until safely cooked.'),
      step('serve', 'Spoon and serve', 'Add the bright monyo beside the fish.'),
    ],
  }),
  makeLevel({
    id: 8,
    stop: 'Ouidah Courtyard',
    meal: 'Dahomey Fish Stew',
    origin: 'Benin',
    mealSymbol: '🍲',
    description: 'A tomato, onion, and fish stew made for sharing.',
    lunchNote: 'The history club needs a warming stew before its afternoon walk.',
    moves: 26,
    targets: [goal('fish', 8), goal('tomato', 7), goal('onion', 5)],
    activeIngredients: ['fish', 'tomato', 'onion', 'pepper', 'palmOil', 'rice'],
    steps: [
      step('chop', 'Prep the stew base', 'Cut the tomato, onion, and pepper.'),
      step('simmer', 'Deepen the sauce', 'Cook the vegetables until the sauce becomes rich.'),
      step('simmer', 'Add the fish', 'Nestle in the fish and simmer it gently.'),
      step('serve', 'Ladle the stew', 'Serve an even share of fish and sauce in each bowl.'),
    ],
  }),
  makeLevel({
    id: 9,
    stop: 'Porto-Novo School Yard',
    meal: 'Crin-Crin & Maize Paste',
    origin: 'Benin',
    mealSymbol: '🥬',
    description: 'A leafy jute-style sauce served with smooth maize paste.',
    lunchNote: 'Start the Porto-Novo stop with a deep-green lunch.',
    moves: 26,
    targets: [goal('greens', 8), goal('fish', 6), goal('maize', 7)],
    activeIngredients: ['greens', 'fish', 'maize', 'tomato', 'onion', 'pepper'],
    steps: [
      step('rinse', 'Wash the leaves', 'Rinse and sort the leafy greens carefully.'),
      step('simmer', 'Cook the sauce', 'Simmer the leaves with aromatics and fish.'),
      step('mix', 'Stir the maize paste', 'Work the maize until it becomes smooth.'),
      step('serve', 'Make a green plate', 'Spoon the sauce beside the maize paste.'),
    ],
  }),
  makeLevel({
    id: 10,
    stop: 'Porto-Novo School Yard',
    meal: 'Groundnut Sauce & Rice',
    origin: 'West Africa',
    mealSymbol: '🥜',
    description: 'A creamy groundnut sauce over a warm bed of rice.',
    lunchNote: 'The science class is comparing textures—creamy sauce meets fluffy rice.',
    moves: 27,
    targets: [goal('peanut', 8), goal('rice', 8), goal('tomato', 5)],
    activeIngredients: ['peanut', 'rice', 'tomato', 'onion', 'pepper', 'fish'],
    steps: [
      step('rinse', 'Start the rice', 'Rinse the rice and set it to cook.'),
      step('mix', 'Blend the groundnut base', 'Combine the groundnut paste with the tomato mixture.'),
      step('simmer', 'Thicken the sauce', 'Simmer slowly and stir so the sauce stays smooth.'),
      step('serve', 'Spoon over rice', 'Add the creamy sauce to each rice bowl.'),
    ],
  }),
  makeLevel({
    id: 11,
    stop: 'Porto-Novo School Yard',
    meal: 'Dékounoun Sounnou',
    origin: 'Benin',
    mealSymbol: '🟠',
    description: 'A rich palm-nut-style sauce served here with rice and fish.',
    lunchNote: 'A rainy-day lunch calls for a rich, warming sauce.',
    moves: 27,
    targets: [goal('palmOil', 7), goal('rice', 8), goal('fish', 6)],
    activeIngredients: ['palmOil', 'rice', 'fish', 'tomato', 'onion', 'pepper'],
    steps: [
      step('rinse', 'Prepare the rice', 'Rinse the rice and cook it until tender.'),
      step('simmer', 'Build the palm sauce', 'Simmer the palm base with the prepared aromatics.'),
      step('simmer', 'Finish with fish', 'Cook the fish gently in the sauce.'),
      step('serve', 'Fill the bowls', 'Serve the sauce with a measured scoop of rice.'),
    ],
  }),
  makeLevel({
    id: 12,
    stop: 'Porto-Novo School Yard',
    meal: 'Pounded Yam & Groundnut Sauce',
    origin: 'West Africa',
    mealSymbol: '🍠',
    description: 'Smooth pounded yam with a savory groundnut-and-greens sauce.',
    lunchNote: 'Make a celebration lunch for the school debate team.',
    moves: 28,
    targets: [goal('yam', 10), goal('peanut', 6), goal('greens', 5)],
    activeIngredients: ['yam', 'peanut', 'greens', 'fish', 'onion', 'tomato'],
    steps: [
      step('simmer', 'Cook the yam', 'Boil the yam pieces until completely tender.'),
      step('pound', 'Make it smooth', 'Pound and turn the yam into a stretchy, smooth mound.'),
      step('simmer', 'Finish the sauce', 'Cook the groundnut sauce with greens and aromatics.'),
      step('serve', 'Portion and share', 'Serve a neat mound with sauce around the side.'),
    ],
  }),
  makeLevel({
    id: 13,
    stop: 'Abomey Garden School',
    meal: 'Wagasi Tomato Plate',
    origin: 'Benin',
    mealSymbol: '🧀',
    description: 'Beninese cow-milk cheese in a bright tomato sauce.',
    lunchNote: 'The garden club has brought herbs to finish today’s wagasi plate.',
    moves: 28,
    targets: [goal('cheese', 8), goal('tomato', 7), goal('onion', 5)],
    activeIngredients: ['cheese', 'tomato', 'onion', 'rice', 'pepper', 'greens'],
    steps: [
      step('chop', 'Prepare the sauce', 'Cut the tomato, onion, pepper, and greens.'),
      step('simmer', 'Cook the tomato base', 'Let the sauce become thick and fragrant.'),
      step('fry', 'Brown the wagasi', 'Cook the cheese pieces carefully until lightly golden.'),
      step('serve', 'Coat and plate', 'Spoon the tomato sauce over the wagasi.'),
    ],
  }),
  makeLevel({
    id: 14,
    stop: 'Abomey Garden School',
    meal: 'Cassava-Plantain Fufu',
    origin: 'Benin',
    mealSymbol: '🥄',
    description: 'A smooth cassava-and-plantain fufu with vegetable sauce.',
    lunchNote: 'The students are learning how roots and fruit become one smooth staple.',
    moves: 28,
    targets: [goal('cassava', 8), goal('plantain', 7), goal('greens', 6)],
    activeIngredients: ['cassava', 'plantain', 'greens', 'fish', 'tomato', 'onion'],
    steps: [
      step('simmer', 'Cook until tender', 'Cook the cassava and plantain pieces thoroughly.'),
      step('pound', 'Join the textures', 'Pound and turn them together until smooth.'),
      step('simmer', 'Make the vegetable sauce', 'Cook the greens with tomato and onion.'),
      step('serve', 'Shape the fufu', 'Portion the fufu and add sauce at the side.'),
    ],
  }),
  makeLevel({
    id: 15,
    stop: 'Abomey Garden School',
    meal: 'Gari Foto',
    origin: 'West Africa',
    mealSymbol: '🥔',
    description: 'Toasted cassava granules folded through a savory tomato mixture.',
    lunchNote: 'A quick lunch challenge: turn pantry gari into a colorful plate.',
    moves: 28,
    targets: [goal('cassava', 9), goal('tomato', 6), goal('onion', 5)],
    activeIngredients: ['cassava', 'tomato', 'onion', 'fish', 'pepper', 'greens'],
    steps: [
      step('chop', 'Ready the vegetables', 'Prepare the tomato, onion, pepper, and greens.'),
      step('simmer', 'Cook the savory mix', 'Soften the vegetables into a flavorful base.'),
      step('mix', 'Fold in the gari', 'Add the prepared cassava granules and mix evenly.'),
      step('serve', 'Finish the bowls', 'Top and portion the gari foto.'),
    ],
  }),
  makeLevel({
    id: 16,
    stop: 'Abomey Garden School',
    meal: 'Talé Talé Fritters',
    origin: 'Benin',
    mealSymbol: '🍌',
    description: 'Sweet-savory ripe plantain fritters with a golden edge.',
    lunchNote: 'Use ripe plantain wisely for an after-school treat.',
    moves: 29,
    targets: [goal('plantain', 10), goal('maize', 6), goal('peanut', 5)],
    activeIngredients: ['plantain', 'maize', 'peanut', 'palmOil', 'pepper', 'onion'],
    steps: [
      step('mix', 'Mash the plantain', 'Mash the ripe plantain into a soft base.'),
      step('mix', 'Make the batter', 'Fold in the dry ingredients and seasoning.'),
      step('fry', 'Cook small fritters', 'Fry spoonfuls carefully until golden on both sides.'),
      step('serve', 'Drain and share', 'Let excess oil drain, then portion the fritters.'),
    ],
  }),
  makeLevel({
    id: 17,
    stop: 'Parakou Lunch Hall',
    meal: 'Kuli-Kuli Crunch',
    origin: 'Benin',
    mealSymbol: '🥜',
    description: 'Crunchy groundnut bites seasoned for a lively snack.',
    lunchNote: 'The Parakou athletics club needs a small crunchy side.',
    moves: 29,
    targets: [goal('peanut', 12), goal('pepper', 5), goal('maize', 5)],
    activeIngredients: ['peanut', 'pepper', 'maize', 'onion', 'beans', 'rice'],
    steps: [
      step('mix', 'Work the groundnuts', 'Prepare a smooth, seasoned groundnut paste.'),
      step('mix', 'Shape the bites', 'Form even pieces so they cook at the same rate.'),
      step('fry', 'Cook until crisp', 'Fry carefully until the pieces are dry and crunchy.'),
      step('serve', 'Cool before sharing', 'Let the kuli-kuli cool, then portion it.'),
    ],
  }),
  makeLevel({
    id: 18,
    stop: 'Parakou Lunch Hall',
    meal: 'Yovo Doko',
    origin: 'Benin',
    mealSymbol: '🍩',
    description: 'Light, golden street-style dough fritters.',
    lunchNote: 'Prepare a festival-day treat for the music class.',
    moves: 29,
    targets: [goal('flour', 11), goal('palmOil', 6), goal('peanut', 5)],
    activeIngredients: ['flour', 'palmOil', 'peanut', 'maize', 'rice', 'plantain'],
    steps: [
      step('mix', 'Mix the dough', 'Combine the flour mixture until no dry pockets remain.'),
      step('mix', 'Let it become airy', 'Rest the dough so it can grow light and soft.'),
      step('fry', 'Fry the doko', 'Cook small portions carefully until evenly golden.'),
      step('serve', 'Cool and portion', 'Let the fritters cool slightly before serving.'),
    ],
  }),
  makeLevel({
    id: 19,
    stop: 'Parakou Lunch Hall',
    meal: 'West African Mafé Bowl',
    origin: 'West Africa',
    mealSymbol: '🍛',
    description: 'Rice topped with a velvety groundnut-and-tomato sauce.',
    lunchNote: 'Neighboring flavors visit the canteen for a regional food lesson.',
    moves: 30,
    targets: [goal('peanut', 9), goal('rice', 8), goal('tomato', 6)],
    activeIngredients: ['peanut', 'rice', 'tomato', 'onion', 'pepper', 'greens'],
    steps: [
      step('rinse', 'Cook the rice', 'Rinse and cook the rice until fluffy.'),
      step('simmer', 'Start the sauce', 'Cook the tomato, onion, and pepper base.'),
      step('mix', 'Add the groundnut', 'Stir in the groundnut paste and simmer until smooth.'),
      step('serve', 'Build the bowls', 'Spoon the sauce over rice and add greens.'),
    ],
  }),
  makeLevel({
    id: 20,
    stop: 'Parakou Lunch Hall',
    meal: 'Grand Benin Canteen Plate',
    origin: 'Benin',
    mealSymbol: '🎉',
    description: 'A celebratory maize, fish, tomato, and greens plate for the whole school.',
    lunchNote: 'Every class is coming to the final table—make the route’s biggest lunch.',
    moves: 31,
    targets: [goal('maize', 8), goal('fish', 8), goal('greens', 7), goal('tomato', 7)],
    activeIngredients: ['maize', 'fish', 'greens', 'tomato', 'palmOil', 'onion'],
    steps: [
      step('chop', 'Prepare every color', 'Ready the tomato, onion, and greens for the final meal.'),
      step('simmer', 'Cook the maize and sauce', 'Stir the maize base and simmer the vegetable sauce.'),
      step('grill', 'Finish the fish', 'Season and grill the fish until safely cooked.'),
      step('serve', 'Open the celebration table', 'Build balanced plates and serve the whole school.'),
    ],
  }),
];

export const BENIN_STOPS = [
  { name: 'Cotonou Canteen', range: 'Levels 1–4', color: '#e85d3f' },
  { name: 'Ouidah Courtyard', range: 'Levels 5–8', color: '#d99a2b' },
  { name: 'Porto-Novo School Yard', range: 'Levels 9–12', color: '#3f8d66' },
  { name: 'Abomey Garden School', range: 'Levels 13–16', color: '#23869a' },
  { name: 'Parakou Lunch Hall', range: 'Levels 17–20', color: '#6d559f' },
] as const;

export const WORLD_LOCATIONS = [
  { id: 'benin', number: 1, name: 'Benin Republic', note: '20 meals', status: 'open' },
  { id: 'location-2', number: 2, name: 'Next location', note: 'Coming later', status: 'locked' },
  { id: 'location-3', number: 3, name: 'Next location', note: 'Coming later', status: 'locked' },
  { id: 'location-4', number: 4, name: 'Next location', note: 'Coming later', status: 'locked' },
  { id: 'location-5', number: 5, name: 'Next location', note: 'Coming later', status: 'locked' },
] as const;

export interface CampaignProgress {
  readonly version: 1;
  readonly unlockedLevel: number;
  readonly completed: ReadonlyArray<number>;
  readonly stars: Readonly<Record<string, number>>;
}

export const DEFAULT_PROGRESS: CampaignProgress = {
  version: CAMPAIGN_VERSION,
  unlockedLevel: 1,
  completed: [],
  stars: {},
};

export function sanitizeProgress(value: unknown): CampaignProgress {
  if (!value || typeof value !== 'object') return DEFAULT_PROGRESS;
  const candidate = value as Partial<CampaignProgress>;
  if (candidate.version !== CAMPAIGN_VERSION) return DEFAULT_PROGRESS;

  const completed = Array.isArray(candidate.completed)
    ? Array.from(new Set(candidate.completed.filter(
        (item): item is number => Number.isInteger(item) && item >= 1 && item <= BENIN_LEVELS.length,
      ))).sort((a, b) => a - b)
    : [];
  const rawUnlocked = Number(candidate.unlockedLevel);
  const unlockedLevel = Number.isFinite(rawUnlocked)
    ? Math.max(1, Math.min(BENIN_LEVELS.length, Math.floor(rawUnlocked)))
    : 1;
  const stars: Record<string, number> = {};
  if (candidate.stars && typeof candidate.stars === 'object') {
    for (const [key, value] of Object.entries(candidate.stars)) {
      const level = Number(key);
      if (Number.isInteger(level) && level >= 1 && level <= BENIN_LEVELS.length) {
        stars[key] = Math.max(0, Math.min(3, Math.floor(Number(value) || 0)));
      }
    }
  }

  return { version: CAMPAIGN_VERSION, unlockedLevel, completed, stars };
}

export function completeLevel(
  progress: CampaignProgress,
  levelId: number,
  starsEarned: number,
): CampaignProgress {
  if (
    !Number.isInteger(levelId) ||
    levelId < 1 ||
    levelId > BENIN_LEVELS.length ||
    levelId > progress.unlockedLevel
  ) {
    return progress;
  }

  const completed = Array.from(new Set([...progress.completed, levelId])).sort((a, b) => a - b);
  const nextUnlocked = Math.min(
    BENIN_LEVELS.length,
    Math.max(progress.unlockedLevel, levelId + 1),
  );
  const stars = {
    ...progress.stars,
    [levelId]: Math.max(progress.stars[String(levelId)] ?? 0, Math.max(1, Math.min(3, starsEarned))),
  };

  return {
    version: CAMPAIGN_VERSION,
    unlockedLevel: nextUnlocked,
    completed,
    stars,
  };
}

export function starsForMoves(movesLeft: number, startingMoves: number): number {
  const ratio = movesLeft / Math.max(1, startingMoves);
  if (ratio >= 0.34) return 3;
  if (ratio >= 0.15) return 2;
  return 1;
}

export function validateCampaign(): ReadonlyArray<string> {
  const errors: string[] = [];
  if (BENIN_LEVELS.length !== 20) errors.push('The Benin route must contain exactly 20 levels.');
  const ids = new Set<number>();
  for (const level of BENIN_LEVELS) {
    if (ids.has(level.id)) errors.push(`Level ${level.id} is duplicated.`);
    ids.add(level.id);
    if (level.activeIngredients.length !== 6) errors.push(`Level ${level.id} needs six active ingredients.`);
    if (new Set(level.activeIngredients).size !== level.activeIngredients.length) {
      errors.push(`Level ${level.id} repeats an active ingredient.`);
    }
    for (const target of level.targets) {
      if (!level.activeIngredients.includes(target.ingredient)) {
        errors.push(`Level ${level.id} target ${target.ingredient} is not on its board.`);
      }
      if (target.amount < 1) errors.push(`Level ${level.id} has an empty target.`);
    }
    if (level.steps.length < 3) errors.push(`Level ${level.id} needs at least three cooking steps.`);
  }
  return errors;
}
