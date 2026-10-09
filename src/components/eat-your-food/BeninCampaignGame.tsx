import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChefHat,
  ChevronRight,
  CircleCheck,
  Flag,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Map,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Utensils,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import beninCanteenArt from '../../assets/game-eat-your-food-benin.png';
import {
  BOARD_SIZE,
  TILE_TYPES,
  attemptSwap,
  createInitialBoard,
  findLegalMoves,
  resolveBoard,
  type Board,
  type Position,
  type TileType,
} from '../match3/engine';
import {
  BENIN_LEVELS,
  BENIN_STOPS,
  CAMPAIGN_STORAGE_KEY,
  COOKING_ACTIONS,
  DEFAULT_PROGRESS,
  INGREDIENTS,
  WORLD_LOCATIONS,
  completeLevel,
  sanitizeProgress,
  starsForMoves,
  type CampaignProgress,
  type CookingAction,
  type MealLevel,
} from './campaign';
import styles from '../../css/EatYourFoodCampaign.module.css';

const SOUND_KEY = 'eat-your-food-sound';
const TUTORIAL_KEY = 'eat-your-food-campaign-tutorial-seen';

type Screen = 'map' | 'briefing' | 'match' | 'cook' | 'served' | 'book';
type SoundName = 'select' | 'swap' | 'match' | 'invalid' | 'win';
type Collection = Record<TileType, number>;

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function readProgress(): CampaignProgress {
  try {
    const saved = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    return saved ? sanitizeProgress(JSON.parse(saved)) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function storeValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage is optional; the current play session still works without it.
  }
}

function emptyCollection(): Collection {
  return Object.fromEntries(TILE_TYPES.map((type) => [type, 0])) as Collection;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function indexToPosition(index: number): Position {
  return { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
}

function positionToIndex(position: Position): number {
  return position.row * BOARD_SIZE + position.col;
}

function hasAllIngredients(level: MealLevel, collection: Collection): boolean {
  return level.targets.every(
    (target) => collection[target.ingredient] >= target.amount,
  );
}

function cookingChoices(correct: CookingAction, seed: number): CookingAction[] {
  const actions = Object.keys(COOKING_ACTIONS) as CookingAction[];
  const alternatives = actions.filter((action) => action !== correct);
  const first = alternatives[seed % alternatives.length];
  let second = alternatives[(seed * 3 + 2) % alternatives.length];
  if (second === first) second = alternatives[(seed * 3 + 3) % alternatives.length];
  const choices = [correct, first, second];
  const rotation = seed % choices.length;
  return [...choices.slice(rotation), ...choices.slice(0, rotation)];
}

function IngredientIcon({ type, compact = false }: { type: TileType; compact?: boolean }) {
  const ingredient = INGREDIENTS[type];
  const style = {
    '--ingredient-color': ingredient.color,
    '--ingredient-pale': ingredient.pale,
  } as CSSProperties;

  return (
    <span
      className={`${styles.ingredientIcon} ${compact ? styles.ingredientIconCompact : ''}`}
      style={style}
      aria-hidden="true"
    >
      <span>{ingredient.symbol}</span>
    </span>
  );
}

function Stars({ count, small = false }: { count: number; small?: boolean }) {
  return (
    <span className={`${styles.stars} ${small ? styles.starsSmall : ''}`} aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((index) => (
        <Star key={index} className={index < count ? styles.starOn : styles.starOff} aria-hidden="true" />
      ))}
    </span>
  );
}

export function EatYourFoodGame() {
  const initialProgress = useMemo(readProgress, []);
  const [progress, setProgress] = useState<CampaignProgress>(initialProgress);
  const [screen, setScreen] = useState<Screen>('map');
  const [selectedLevelId, setSelectedLevelId] = useState(initialProgress.unlockedLevel);
  const level = BENIN_LEVELS[selectedLevelId - 1] ?? BENIN_LEVELS[0];
  const [board, setBoard] = useState<Board>(() => createInitialBoard({
    tileTypes: BENIN_LEVELS[0].activeIngredients,
  }));
  const [moves, setMoves] = useState(level.moves);
  const [score, setScore] = useState(0);
  const [collection, setCollection] = useState<Collection>(emptyCollection);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [invalidIds, setInvalidIds] = useState<Set<string>>(() => new Set());
  const [hintIds, setHintIds] = useState<Set<string>>(() => new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('Choose two neighboring ingredients to make a match.');
  const [showHelp, setShowHelp] = useState(() => !readBoolean(TUTORIAL_KEY, false));
  const [showFailure, setShowFailure] = useState(false);
  const [soundOn, setSoundOn] = useState(() => readBoolean(SOUND_KEY, true));
  const [cookingStep, setCookingStep] = useState(0);
  const [cookingFeedback, setCookingFeedback] = useState('Choose the right kitchen action.');
  const [finalStars, setFinalStars] = useState(0);

  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef(0);
  const dragStartRef = useRef<{ index: number; x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const flatBoard = useMemo(() => board.flat(), [board]);
  const completedCount = progress.completed.length;
  const totalCollected = level.targets.reduce(
    (sum, target) => sum + Math.min(target.amount, collection[target.ingredient]),
    0,
  );
  const totalRequired = level.targets.reduce((sum, target) => sum + target.amount, 0);
  const objectivePercent = Math.round((totalCollected / Math.max(1, totalRequired)) * 100);

  useEffect(() => {
    storeValue(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    return () => {
      sessionRef.current += 1;
      if (audioContext && audioContext.state !== 'closed') void audioContext.close();
    };
  }, []);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && screen === 'match') {
        setSelectedIndex(null);
        setStatus('The canteen is paused while this tab is hidden.');
      }
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, [screen]);

  const playSound = useCallback((name: SoundName, levelIndex = 0) => {
    if (!soundOn) return;
    const AudioContextClass = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();
    const notes: Record<SoundName, number> = {
      select: 340,
      swap: 430,
      match: 600 + Math.min(levelIndex, 4) * 85,
      invalid: 155,
      win: 790,
    };
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = name === 'win' ? 0.28 : 0.09;
    oscillator.type = name === 'invalid' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(notes[name], context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }, [soundOn]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    storeValue(SOUND_KEY, String(next));
  };

  const closeHelp = () => {
    setShowHelp(false);
    storeValue(TUTORIAL_KEY, 'true');
  };

  const goToMap = () => {
    sessionRef.current += 1;
    setIsBusy(false);
    setShowFailure(false);
    setSelectedIndex(null);
    setScreen('map');
  };

  const openBriefing = (levelId: number) => {
    if (levelId > progress.unlockedLevel) return;
    sessionRef.current += 1;
    setSelectedLevelId(levelId);
    setScreen('briefing');
    setShowFailure(false);
    setSelectedIndex(null);
  };

  const beginMatch = useCallback(() => {
    sessionRef.current += 1;
    setBoard(createInitialBoard({ tileTypes: level.activeIngredients }));
    setMoves(level.moves);
    setScore(0);
    setCollection(emptyCollection());
    setSelectedIndex(null);
    setFocusIndex(0);
    setMatchedIds(new Set());
    setInvalidIds(new Set());
    setHintIds(new Set());
    setIsBusy(false);
    setShowFailure(false);
    setCookingStep(0);
    setCookingFeedback('Choose the right kitchen action.');
    setStatus(`Collect the ingredients for ${level.meal}.`);
    setScreen('match');
  }, [level]);

  const trySwap = useCallback(async (fromIndex: number, toIndex: number) => {
    if (isBusy || moves <= 0 || fromIndex === toIndex) return;

    setSelectedIndex(null);
    setHintIds(new Set());
    const from = indexToPosition(fromIndex);
    const to = indexToPosition(toIndex);
    const result = attemptSwap(board, from, to);

    if (!result.valid) {
      const first = board[from.row]?.[from.col];
      const second = board[to.row]?.[to.col];
      setInvalidIds(new Set([first?.id, second?.id].filter(Boolean) as string[]));
      setStatus(result.reason === 'not-adjacent'
        ? 'Those ingredients are not neighbors.'
        : 'That swap does not make a row of three.');
      playSound('invalid');
      window.setTimeout(() => setInvalidIds(new Set()), prefersReducedMotion() ? 30 : 300);
      return;
    }

    const session = sessionRef.current;
    const nextMoves = moves - 1;
    const resolved = resolveBoard(result.board, { tileTypes: level.activeIngredients });
    const turnScore = resolved.cascades.reduce(
      (total, cascade) => total + cascade.removedCount * 100 * Math.min(cascade.index + 1, 4),
      0,
    );
    const nextCollection = { ...collection };
    const popDelay = prefersReducedMotion() ? 25 : 210;
    const fallDelay = prefersReducedMotion() ? 25 : 155;

    setIsBusy(true);
    setMoves(nextMoves);
    setBoard(result.board);
    setStatus('Good swap—packing those ingredients!');
    playSound('swap');

    for (const cascade of resolved.cascades) {
      if (sessionRef.current !== session) return;
      const ids: string[] = [];
      for (const position of cascade.matches) {
        const tile = cascade.boardBefore[position.row][position.col];
        ids.push(tile.id);
        nextCollection[tile.type] += 1;
      }
      setBoard(cascade.boardBefore);
      setMatchedIds(new Set(ids));
      setCollection({ ...nextCollection });
      setStatus(cascade.index === 0
        ? `${cascade.removedCount} ingredients collected!`
        : `Canteen combo ×${cascade.index + 1}!`);
      playSound('match', cascade.index);
      await new Promise<void>((resolve) => window.setTimeout(resolve, popDelay));
      if (sessionRef.current !== session) return;
      setMatchedIds(new Set());
      setBoard(cascade.boardAfter);
      await new Promise<void>((resolve) => window.setTimeout(resolve, fallDelay));
    }

    if (sessionRef.current !== session) return;
    setBoard(resolved.board);
    setScore((current) => current + turnScore);
    setCollection(nextCollection);
    setIsBusy(false);

    if (hasAllIngredients(level, nextCollection)) {
      setStatus('Ingredient basket complete! Time for the cooking lesson.');
      playSound('win');
      await new Promise<void>((resolve) => window.setTimeout(resolve, prefersReducedMotion() ? 60 : 520));
      if (sessionRef.current === session) {
        setCookingStep(0);
        setCookingFeedback('Choose the right kitchen action.');
        setScreen('cook');
      }
      return;
    }

    if (nextMoves === 0) {
      setStatus('The lunch bell rang before the basket was full.');
      setShowFailure(true);
      playSound('invalid');
    } else if (resolved.reshuffled) {
      setStatus('The tray had no swaps left, so it was shuffled.');
    } else {
      setStatus(`Nice work! +${turnScore.toLocaleString()} points.`);
    }
  }, [board, collection, isBusy, level, moves, playSound]);

  const selectTile = useCallback((index: number) => {
    if (isBusy || moves <= 0) return;
    setFocusIndex(index);
    if (selectedIndex === null) {
      setSelectedIndex(index);
      setStatus(`${INGREDIENTS[flatBoard[index].type].name} selected. Choose a neighbor.`);
      playSound('select');
      return;
    }
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setStatus('Selection cleared.');
      return;
    }

    const first = indexToPosition(selectedIndex);
    const second = indexToPosition(index);
    const adjacent = Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
    if (adjacent) void trySwap(selectedIndex, index);
    else {
      setSelectedIndex(index);
      setStatus(`${INGREDIENTS[flatBoard[index].type].name} selected. Choose a neighbor.`);
      playSound('select');
    }
  }, [flatBoard, isBusy, moves, playSound, selectedIndex, trySwap]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (isBusy || moves <= 0) return;
    dragStartRef.current = { index, x: event.clientX, y: event.clientY };
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start || isBusy || moves <= 0) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    const target = { ...indexToPosition(start.index) };
    if (Math.abs(dx) > Math.abs(dy)) target.col += dx > 0 ? 1 : -1;
    else target.row += dy > 0 ? 1 : -1;
    if (target.row < 0 || target.row >= BOARD_SIZE || target.col < 0 || target.col >= BOARD_SIZE) return;
    suppressClickRef.current = true;
    void trySwap(start.index, positionToIndex(target));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const position = indexToPosition(index);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowLeft' && position.col > 0) nextIndex = index - 1;
    if (event.key === 'ArrowRight' && position.col < BOARD_SIZE - 1) nextIndex = index + 1;
    if (event.key === 'ArrowUp' && position.row > 0) nextIndex = index - BOARD_SIZE;
    if (event.key === 'ArrowDown' && position.row < BOARD_SIZE - 1) nextIndex = index + BOARD_SIZE;
    if (nextIndex !== null) {
      event.preventDefault();
      setFocusIndex(nextIndex);
      tileRefs.current[nextIndex]?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTile(index);
    }
    if (event.key === 'Escape') {
      setSelectedIndex(null);
      setStatus('Selection cleared.');
    }
  };

  const showHint = () => {
    if (isBusy || moves <= 0) return;
    const movesAvailable = findLegalMoves(board);
    if (movesAvailable.length === 0) return;
    const hint = movesAvailable[Math.floor(Math.random() * movesAvailable.length)];
    const first = board[hint.from.row][hint.from.col];
    const second = board[hint.to.row][hint.to.col];
    setHintIds(new Set([first.id, second.id]));
    setStatus(`Hint: swap ${INGREDIENTS[first.type].name.toLowerCase()} with ${INGREDIENTS[second.type].name.toLowerCase()}.`);
    window.setTimeout(() => setHintIds(new Set()), prefersReducedMotion() ? 350 : 1500);
  };

  const chooseCookingAction = (action: CookingAction) => {
    const current = level.steps[cookingStep];
    if (action !== current.action) {
      setCookingFeedback(`Try again: ${current.instruction}`);
      playSound('invalid');
      return;
    }

    playSound('match', cookingStep);
    if (cookingStep < level.steps.length - 1) {
      setCookingStep((value) => value + 1);
      setCookingFeedback(`Great! ${current.title} is complete.`);
      return;
    }

    const stars = starsForMoves(moves, level.moves);
    const nextProgress = completeLevel(progress, level.id, stars);
    setProgress(nextProgress);
    setFinalStars(stars);
    setCookingFeedback('Lunch is ready!');
    setScreen('served');
    playSound('win');
  };

  const currentCookingStep = level.steps[Math.min(cookingStep, level.steps.length - 1)];
  const actionOptions = cookingChoices(currentCookingStep.action, level.id * 5 + cookingStep);
  const continueLevel = completedCount === BENIN_LEVELS.length
    ? BENIN_LEVELS.length
    : progress.unlockedLevel;

  return (
    <div className={styles.game}>
      <header className={styles.masthead}>
        <button type="button" className={styles.brandButton} onClick={goToMap} aria-label="Open the Benin route map">
          <span className={styles.brandIcon} aria-hidden="true"><Utensils /></span>
          <span>
            <small>Lunch Lady’s World Route</small>
            <strong>Eat Your Food!</strong>
          </span>
        </button>
        <nav className={styles.topActions} aria-label="Game menu">
          <button type="button" className={styles.iconButton} onClick={goToMap} aria-label="Route map" title="Route map"><Map aria-hidden="true" /></button>
          <button type="button" className={styles.iconButton} onClick={() => setScreen('book')} aria-label="Recipe book" title="Recipe book"><BookOpen aria-hidden="true" /></button>
          <button type="button" className={styles.iconButton} onClick={toggleSound} aria-label={soundOn ? 'Mute sounds' : 'Turn on sounds'} title={soundOn ? 'Mute sounds' : 'Turn on sounds'}>
            {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
          <button type="button" className={styles.iconButton} onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play"><HelpCircle aria-hidden="true" /></button>
          {screen === 'match' && <button type="button" className={styles.iconButton} onClick={beginMatch} aria-label="Restart this level" title="Restart level"><RotateCcw aria-hidden="true" /></button>}
        </nav>
      </header>

      {screen === 'map' && (
        <main className={styles.mapScreen}>
          <section className={styles.campaignHero}>
            <img src={beninCanteenArt} alt="A Beninese lunch lady serving a fresh meal to students in a sunny school canteen" />
            <div className={styles.heroShade} />
            <div className={styles.heroContent}>
              <span className={styles.locationPill}><MapPin aria-hidden="true" /> Location 1 of 5 · Benin Republic</span>
              <h2>Serve joy, one school lunch at a time.</h2>
              <p>Match local ingredients, learn a simplified cooking sequence, and unlock a new meal on every level.</p>
              <button type="button" className={styles.heroButton} onClick={() => openBriefing(continueLevel)}>
                <Play aria-hidden="true" />
                {completedCount === 0 ? 'Start the route' : completedCount === 20 ? 'Replay the finale' : `Continue level ${continueLevel}`}
              </button>
            </div>
            <div className={styles.heroProgress}><strong>{completedCount}<span>/20</span></strong><span>meals served</span></div>
          </section>

          <section className={styles.worldRoute} aria-labelledby="world-route-title">
            <div className={styles.sectionHeading}>
              <div><span className={styles.kicker}>The world route</span><h3 id="world-route-title">Five locations, one lunch apron</h3></div>
              <span className={styles.progressSummary}>{completedCount * 5}% of Benin complete</span>
            </div>
            <div className={styles.locationRail}>
              {WORLD_LOCATIONS.map((location) => (
                <div key={location.id} className={`${styles.locationStop} ${location.status === 'open' ? styles.locationOpen : styles.locationLocked}`}>
                  <span className={styles.locationNumber}>{location.status === 'open' ? <Flag aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}</span>
                  <span><strong>{location.number}. {location.name}</strong><small>{location.note}</small></span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.levelRoute} aria-labelledby="benin-route-title">
            <div className={styles.sectionHeading}>
              <div><span className={styles.kicker}>Benin Republic · First location</span><h3 id="benin-route-title">The 20-meal canteen route</h3></div>
              <button type="button" className={styles.textButton} onClick={() => setScreen('book')}><BookOpen aria-hidden="true" /> View recipe book</button>
            </div>
            <div className={styles.stopList}>
              {BENIN_STOPS.map((stop, stopIndex) => {
                const first = stopIndex * 4 + 1;
                return (
                  <section className={styles.stopSection} key={stop.name} style={{ '--stop-color': stop.color } as CSSProperties}>
                    <div className={styles.stopTitle}><span className={styles.stopPin}><MapPin aria-hidden="true" /></span><div><h4>{stop.name}</h4><p>{stop.range}</p></div></div>
                    <div className={styles.levelGrid}>
                      {BENIN_LEVELS.slice(first - 1, first + 3).map((routeLevel) => {
                        const unlocked = routeLevel.id <= progress.unlockedLevel;
                        const completed = progress.completed.includes(routeLevel.id);
                        const stars = progress.stars[String(routeLevel.id)] ?? 0;
                        const current = unlocked && !completed && routeLevel.id === progress.unlockedLevel;
                        return (
                          <button
                            type="button"
                            key={routeLevel.id}
                            className={`${styles.levelCard} ${completed ? styles.levelComplete : ''} ${current ? styles.levelCurrent : ''}`}
                            onClick={() => openBriefing(routeLevel.id)}
                            disabled={!unlocked}
                            aria-label={unlocked ? `Level ${routeLevel.id}: ${routeLevel.meal}` : `Level ${routeLevel.id} locked`}
                          >
                            <span className={styles.levelNumber}>{unlocked ? routeLevel.id : <LockKeyhole aria-hidden="true" />}</span>
                            <span className={styles.mealSymbol} aria-hidden="true">{unlocked ? routeLevel.mealSymbol : '•'}</span>
                            <span className={styles.levelCopy}><strong>{unlocked ? routeLevel.meal : 'Meal locked'}</strong><small>{current ? 'Next lunch' : completed ? 'Recipe learned' : 'Complete earlier levels'}</small></span>
                            {completed ? <Stars count={stars} small /> : unlocked ? <ChevronRight aria-hidden="true" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {screen === 'briefing' && (
        <main className={styles.briefingScreen}>
          <button type="button" className={styles.backButton} onClick={goToMap}><ArrowLeft aria-hidden="true" /> Back to route</button>
          <div className={styles.briefingGrid}>
            <div className={styles.briefingArt}><img src={beninCanteenArt} alt="The Benin school canteen route" /><div><MapPin aria-hidden="true" /><span>{level.stop}</span></div></div>
            <section className={styles.briefingCard}>
              <div className={styles.levelEyebrow}><span>Level {level.id}</span><span>{level.origin}</span></div>
              <div className={styles.bigMealSymbol} aria-hidden="true">{level.mealSymbol}</div>
              <h2>{level.meal}</h2>
              <p className={styles.mealDescription}>{level.description}</p>
              <blockquote>{level.lunchNote}</blockquote>
              <h3>Pack this ingredient basket</h3>
              <div className={styles.targetPreview}>
                {level.targets.map((target) => <div key={target.ingredient}><IngredientIcon type={target.ingredient} compact /><span><strong>{target.amount}</strong><small>{INGREDIENTS[target.ingredient].name}</small></span></div>)}
              </div>
              <div className={styles.briefingMeta}><span><strong>{level.moves}</strong> moves</span><span><strong>{level.steps.length}</strong> cooking steps</span></div>
              <button type="button" className={styles.primaryButton} onClick={beginMatch}><Play aria-hidden="true" /> Collect ingredients</button>
              {progress.completed.includes(level.id) && <div className={styles.replayNote}><CircleCheck aria-hidden="true" /> Recipe learned · replay for a better score</div>}
            </section>
          </div>
        </main>
      )}

      {screen === 'match' && (
        <main className={styles.matchScreen}>
          <div className={styles.levelBar}>
            <button type="button" onClick={() => setScreen('briefing')}><ArrowLeft aria-hidden="true" /> Level {level.id}</button>
            <div><span>{level.stop}</span><strong>{level.meal}</strong></div>
            <span className={styles.originTag}>{level.origin}</span>
          </div>
          <div className={styles.matchStats}>
            <div><span>Moves</span><strong>{moves}</strong></div>
            <div><span>Score</span><strong>{score.toLocaleString()}</strong></div>
            <div className={styles.basketStat}><span>Basket</span><strong>{objectivePercent}%</strong></div>
          </div>
          <div className={styles.matchLayout}>
            <section className={styles.boardColumn} aria-label="Ingredient match board">
              <div className={styles.trayRim}>
                <div className={styles.board} role="grid" aria-label="8 by 8 ingredient board">
                  {flatBoard.map((tile, index) => {
                    const ingredient = INGREDIENTS[tile.type];
                    const tileStyle = { '--ingredient-color': ingredient.color, '--ingredient-pale': ingredient.pale } as CSSProperties;
                    return (
                      <button
                        type="button"
                        role="gridcell"
                        key={tile.id}
                        ref={(element) => { tileRefs.current[index] = element; }}
                        tabIndex={focusIndex === index ? 0 : -1}
                        className={`${styles.tile} ${selectedIndex === index ? styles.selected : ''} ${matchedIds.has(tile.id) ? styles.matched : ''} ${invalidIds.has(tile.id) ? styles.invalid : ''} ${hintIds.has(tile.id) ? styles.hinted : ''}`}
                        style={tileStyle}
                        disabled={isBusy || moves <= 0}
                        onClick={() => { if (suppressClickRef.current) suppressClickRef.current = false; else selectTile(index); }}
                        onPointerDown={(event) => handlePointerDown(event, index)}
                        onPointerUp={handlePointerUp}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        aria-label={`${ingredient.name}, row ${Math.floor(index / BOARD_SIZE) + 1}, column ${(index % BOARD_SIZE) + 1}${selectedIndex === index ? ', selected' : ''}`}
                        aria-selected={selectedIndex === index}
                      >
                        <IngredientIcon type={tile.type} />
                        <span className={styles.tileShine} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className={styles.boardTip}>Tap two neighbors, drag, or use arrow keys + Enter.</p>
            </section>
            <aside className={styles.objectivePanel}>
              <span className={styles.kicker}>Today’s ingredient basket</span>
              <h2>{level.meal}</h2>
              <div className={styles.objectiveProgress} aria-label={`${objectivePercent}% of ingredients collected`}><span style={{ width: `${objectivePercent}%` }} /></div>
              <div className={styles.goalList}>
                {level.targets.map((target) => {
                  const amount = Math.min(collection[target.ingredient], target.amount);
                  const done = amount >= target.amount;
                  return <div key={target.ingredient} className={done ? styles.goalDone : ''}><IngredientIcon type={target.ingredient} compact /><span><strong>{INGREDIENTS[target.ingredient].name}</strong><small>{amount} / {target.amount} packed</small></span>{done ? <CircleCheck aria-hidden="true" /> : <b>{target.amount - amount}</b>}</div>;
                })}
              </div>
              <button type="button" className={styles.hintButton} onClick={showHint} disabled={isBusy || moves <= 0}><Lightbulb aria-hidden="true" /> Show a swap</button>
              <div className={styles.nextStepCard}><ChefHat aria-hidden="true" /><span><strong>Next: cooking lesson</strong><small>Fill the basket to unlock the kitchen.</small></span></div>
              <p className={styles.liveMessage} aria-live="polite">{status}</p>
            </aside>
          </div>
        </main>
      )}

      {screen === 'cook' && (
        <main className={styles.cookScreen}>
          <div className={styles.cookHeader}><span className={styles.chefBadge}><ChefHat aria-hidden="true" /></span><div><span className={styles.kicker}>Basket complete · Mini-game</span><h2>Learn to cook {level.meal}</h2></div></div>
          <div className={styles.cookLayout}>
            <section className={styles.lessonCard}>
              <div className={styles.lessonProgress}>{level.steps.map((item, index) => <span key={`${item.title}-${index}`} className={index < cookingStep ? styles.stepDone : index === cookingStep ? styles.stepActive : ''}>{index < cookingStep ? <CircleCheck aria-hidden="true" /> : index + 1}</span>)}</div>
              <div className={styles.lessonMeal} aria-hidden="true">{level.mealSymbol}</div>
              <span className={styles.stepCount}>Step {cookingStep + 1} of {level.steps.length}</span>
              <h3>{currentCookingStep.title}</h3>
              <p>{currentCookingStep.instruction}</p>
              <div className={styles.actionGrid}>{actionOptions.map((action) => <button type="button" key={action} onClick={() => chooseCookingAction(action)}><span aria-hidden="true">{COOKING_ACTIONS[action].symbol}</span><strong>{COOKING_ACTIONS[action].label}</strong></button>)}</div>
              <p className={styles.cookingFeedback} aria-live="polite">{cookingFeedback}</p>
            </section>
            <aside className={styles.recipeSteps}>
              <span className={styles.kicker}>Lunch lady’s notebook</span><h3>The meal sequence</h3>
              <ol>{level.steps.map((item, index) => <li key={`${item.title}-${index}`} className={index < cookingStep ? styles.recipeStepDone : index === cookingStep ? styles.recipeStepCurrent : ''}><span>{index < cookingStep ? <CircleCheck aria-hidden="true" /> : index + 1}</span><div><strong>{item.title}</strong><small>{index <= cookingStep ? item.instruction : 'Complete the current step to reveal.'}</small></div></li>)}</ol>
              <p className={styles.cultureNote}>This is a simplified learning sequence. Ingredients and methods vary by family, cook, and region.</p>
            </aside>
          </div>
        </main>
      )}

      {screen === 'served' && (
        <main className={styles.servedScreen}>
          <div className={styles.confetti} aria-hidden="true"><span>●</span><span>◆</span><span>▲</span><span>●</span><span>◆</span></div>
          <span className={styles.servedIcon} aria-hidden="true">{level.mealSymbol}</span>
          <span className={styles.kicker}>Lunch served!</span>
          <h2>{level.meal} is in your recipe book.</h2>
          <p>The students at {level.stop} have their meal, and the lunch lady is ready for the next bell.</p>
          <Stars count={finalStars} />
          <div className={styles.servedStats}><div><strong>{score.toLocaleString()}</strong><span>match score</span></div><div><strong>{moves}</strong><span>moves left</span></div><div><strong>{progress.completed.length}/20</strong><span>meals learned</span></div></div>
          <div className={styles.servedActions}>
            {level.id < BENIN_LEVELS.length ? <button type="button" className={styles.primaryButton} onClick={() => openBriefing(level.id + 1)}>Next meal <ChevronRight aria-hidden="true" /></button> : <button type="button" className={styles.primaryButton} onClick={goToMap}><Trophy aria-hidden="true" /> See completed route</button>}
            <button type="button" className={styles.secondaryButton} onClick={goToMap}><Map aria-hidden="true" /> Route map</button>
          </div>
        </main>
      )}

      {screen === 'book' && (
        <main className={styles.bookScreen}>
          <button type="button" className={styles.backButton} onClick={goToMap}><ArrowLeft aria-hidden="true" /> Back to route</button>
          <div className={styles.bookHeading}><div><span className={styles.kicker}>Lunch lady’s recipe book</span><h2>{completedCount} of 20 meals learned</h2></div><div className={styles.bookSeal}><BookOpen aria-hidden="true" /></div></div>
          <p className={styles.bookIntro}>Every completed match-and-cook level adds a meal card. Replay learned meals whenever you like.</p>
          <div className={styles.recipeGrid}>
            {BENIN_LEVELS.map((recipe) => {
              const learned = progress.completed.includes(recipe.id);
              return <article key={recipe.id} className={`${styles.recipeCard} ${learned ? styles.recipeLearned : styles.recipeLocked}`}><span className={styles.recipeNumber}>#{recipe.id}</span><span className={styles.recipeSymbol} aria-hidden="true">{learned ? recipe.mealSymbol : <LockKeyhole />}</span><div><span>{recipe.origin}</span><h3>{learned ? recipe.meal : 'Mystery meal'}</h3><p>{learned ? recipe.description : `Complete level ${recipe.id} to learn this recipe.`}</p></div>{learned && <button type="button" onClick={() => openBriefing(recipe.id)}>Replay <ChevronRight aria-hidden="true" /></button>}</article>;
            })}
          </div>
        </main>
      )}

      {showHelp && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="help-title">
            <button type="button" className={styles.modalClose} onClick={closeHelp} aria-label="Close instructions"><X aria-hidden="true" /></button>
            <span className={styles.modalBadge}><Sparkles aria-hidden="true" /></span><span className={styles.kicker}>How to play</span><h2 id="help-title">From market basket to lunch table</h2>
            <ol><li><strong>Choose a meal.</strong><span>Follow the Benin route; each completed level unlocks the next dish.</span></li><li><strong>Match ingredients.</strong><span>Swap neighbors to make rows of three and fill every basket goal.</span></li><li><strong>Learn the cooking order.</strong><span>Pick the right action for each simplified kitchen step.</span></li><li><strong>Serve the students.</strong><span>Add the meal to your recipe book and travel to the next school.</span></li></ol>
            <button type="button" className={styles.primaryButton} onClick={closeHelp}>Tie the apron</button>
          </section>
        </div>
      )}

      {showFailure && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="failure-title">
            <span className={styles.modalBadge}><ChefHat aria-hidden="true" /></span><span className={styles.kicker}>The lunch bell rang</span><h2 id="failure-title">The basket needs a few more ingredients.</h2><p>Try the level again—the ingredient layout will be fresh.</p>
            <div className={styles.modalActions}><button type="button" className={styles.primaryButton} onClick={beginMatch}><RotateCcw aria-hidden="true" /> Try again</button><button type="button" className={styles.secondaryButton} onClick={goToMap}>Route map</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
