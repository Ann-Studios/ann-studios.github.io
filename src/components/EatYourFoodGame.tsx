import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Star,
  Utensils,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  BOARD_SIZE,
  attemptSwap,
  createInitialBoard,
  findLegalMoves,
  resolveBoard,
  type Board,
  type Position,
  type TileType,
} from './match3/engine';
import styles from '../css/EatYourFood.module.css';

const STARTING_MOVES = 25;
const STAR_TARGETS = [3000, 5000, 7000] as const;
const BEST_SCORE_KEY = 'eat-your-food-best-score';
const SOUND_KEY = 'eat-your-food-sound';
const TUTORIAL_KEY = 'eat-your-food-tutorial-seen';

const FOOD_INFO: Record<TileType, { name: string; color: string }> = {
  apple: { name: 'Apple', color: '#ef4444' },
  carrot: { name: 'Carrot', color: '#f97316' },
  broccoli: { name: 'Broccoli', color: '#4f9d4a' },
  blueberry: { name: 'Blueberries', color: '#7753c7' },
  cheese: { name: 'Cheese', color: '#f6c945' },
  milk: { name: 'Milk', color: '#34b9c8' },
};

type SoundName = 'select' | 'swap' | 'match' | 'invalid' | 'win';

function readStoredNumber(key: string): number {
  try {
    const value = window.localStorage.getItem(key);
    return value ? Number(value) || 0 : 0;
  } catch {
    return 0;
  }
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function storeValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The game remains fully playable when storage is unavailable.
  }
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function indexToPosition(index: number): Position {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  };
}

function positionToIndex(position: Position): number {
  return position.row * BOARD_SIZE + position.col;
}

function scoreStars(score: number): number {
  return STAR_TARGETS.filter((target) => score >= target).length;
}

function FoodIcon({ type }: { type: TileType }) {
  const commonProps = {
    className: styles.foodIcon,
    viewBox: '0 0 64 64',
    'aria-hidden': true,
  } as const;

  if (type === 'apple') {
    return (
      <svg {...commonProps}>
        <path d="M34 16c1-6 5-10 11-11-1 6-4 10-10 12" fill="#5f8f3a" stroke="#3d5e2a" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 17c-2-6-2-9 0-12" fill="none" stroke="#69402f" strokeWidth="4" strokeLinecap="round" />
        <path d="M31 17c-7-4-18-1-21 9-4 14 8 30 18 31 3 0 5-2 7-2s5 2 8 1c9-3 18-19 13-31-4-9-14-12-25-8Z" fill="#ef4444" stroke="#a91f31" strokeWidth="3" strokeLinejoin="round" />
        <path d="M19 27c2-4 5-6 9-6" fill="none" stroke="#ff9b91" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'carrot') {
    return (
      <svg {...commonProps}>
        <path d="M31 18c-8-6-11-12-8-15 5 1 9 5 11 12 1-8 5-13 9-14 2 5-1 11-6 17" fill="#62a84a" stroke="#39713a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M17 19c8-6 25-5 29 1 1 3-4 13-8 20L25 60c-2 3-6 1-6-3l-2-24c-1-7-2-11 0-14Z" fill="#f47b20" stroke="#b5481f" strokeWidth="3" strokeLinejoin="round" />
        <path d="m21 31 10 3M22 41l9 3" fill="none" stroke="#ffb055" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'broccoli') {
    return (
      <svg {...commonProps}>
        <path d="M26 33c0 9-3 15-8 21h29c-5-7-8-13-8-22" fill="#8acb5a" stroke="#417a35" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 35c-4 5-6 10-6 16M36 35c3 5 4 10 4 16" fill="none" stroke="#5a9a42" strokeWidth="3" strokeLinecap="round" />
        <circle cx="18" cy="28" r="11" fill="#4f9d4a" stroke="#2f6b35" strokeWidth="3" />
        <circle cx="28" cy="18" r="13" fill="#58ad4d" stroke="#2f6b35" strokeWidth="3" />
        <circle cx="42" cy="19" r="12" fill="#4d9f47" stroke="#2f6b35" strokeWidth="3" />
        <circle cx="47" cy="30" r="10" fill="#62b852" stroke="#2f6b35" strokeWidth="3" />
        <circle cx="32" cy="31" r="12" fill="#5caf4e" />
      </svg>
    );
  }

  if (type === 'blueberry') {
    return (
      <svg {...commonProps}>
        <path d="M31 16c2-7 7-10 14-9-2 6-7 9-13 10M31 16c-5-5-10-6-15-4 3 5 8 7 15 6" fill="#6fae43" stroke="#427331" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="24" cy="28" r="12" fill="#7655c7" stroke="#493b96" strokeWidth="3" />
        <circle cx="41" cy="28" r="12" fill="#845ed3" stroke="#493b96" strokeWidth="3" />
        <circle cx="18" cy="43" r="11" fill="#684ab8" stroke="#493b96" strokeWidth="3" />
        <circle cx="33" cy="45" r="12" fill="#8059cf" stroke="#493b96" strokeWidth="3" />
        <circle cx="47" cy="43" r="10" fill="#684ab8" stroke="#493b96" strokeWidth="3" />
        <path d="m21 24 3-2M38 24l3-2" stroke="#c6b5ff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'cheese') {
    return (
      <svg {...commonProps}>
        <path d="M8 43 36 11c2-2 5-1 7 1l13 13v27H8Z" fill="#f6c945" stroke="#bb7a22" strokeWidth="3" strokeLinejoin="round" />
        <path d="M8 43h48M8 43l30-7 18-11" fill="none" stroke="#d99927" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="37" cy="24" r="5" fill="#dc9824" />
        <circle cx="25" cy="43" r="4" fill="#dc9824" />
        <path d="M56 40a6 6 0 0 0 0 12" fill="#dc9824" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="m20 7 23 2 8 13-5 36H16l-4-39Z" fill="#f8f3df" stroke="#227e91" strokeWidth="3" strokeLinejoin="round" />
      <path d="m20 7 23 2-8 10-23 0Z" fill="#7ed9df" stroke="#227e91" strokeWidth="3" strokeLinejoin="round" />
      <path d="m35 19 8-10 8 13-5 36H35Z" fill="#34b9c8" stroke="#227e91" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 31c5 4 10 4 15 0v20H20Z" fill="#ffffff" />
      <circle cx="27" cy="39" r="5" fill="#9fe3e3" />
      <path d="M23 13h14" stroke="#e9ffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StarMeter({ score }: { score: number }) {
  const earned = scoreStars(score);
  return (
    <div className={styles.starMeter} aria-label={`${earned} of 3 stars earned`}>
      {STAR_TARGETS.map((target, index) => (
        <div className={styles.starStep} key={target}>
          <Star className={index < earned ? styles.starEarned : styles.starEmpty} aria-hidden="true" />
          <span>{target / 1000}k</span>
        </div>
      ))}
    </div>
  );
}

export function EatYourFoodGame() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(STARTING_MOVES);
  const [bestScore, setBestScore] = useState(() => readStoredNumber(BEST_SCORE_KEY));
  const [soundOn, setSoundOn] = useState(() => readStoredBoolean(SOUND_KEY, true));
  const [showHelp, setShowHelp] = useState(() => !readStoredBoolean(TUTORIAL_KEY, false));
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [invalidIds, setInvalidIds] = useState<Set<string>>(() => new Set());
  const [hintIds, setHintIds] = useState<Set<string>>(() => new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('Choose a food and swap it with a neighbor.');
  const [toast, setToast] = useState('');
  const [finalStars, setFinalStars] = useState(0);

  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef(0);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const suppressClickRef = useRef(false);
  const dragStartRef = useRef<{ index: number; x: number; y: number } | null>(null);

  const flatBoard = useMemo(() => board.flat(), [board]);
  const progress = Math.min(100, (score / STAR_TARGETS[2]) * 100);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    return () => {
      sessionRef.current += 1;
      if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current);
      if (audioContext && audioContext.state !== 'closed') void audioContext.close();
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setSelectedIndex(null);
        setStatus('Game paused while this tab is hidden.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const announceToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const playSound = useCallback((name: SoundName, level = 0) => {
    if (!soundOn) return;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();

    const frequencies: Record<SoundName, number> = {
      select: 330,
      swap: 420,
      match: 620 + Math.min(level, 4) * 90,
      invalid: 150,
      win: 780,
    };
    const duration = name === 'win' ? 0.24 : 0.09;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = name === 'invalid' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[name], context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }, [soundOn]);

  const finishGame = useCallback((finalScore: number) => {
    const stars = scoreStars(finalScore);
    setFinalStars(stars);
    setShowResults(true);
    setStatus(`Round complete with ${finalScore.toLocaleString()} points and ${stars} stars.`);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      storeValue(BEST_SCORE_KEY, String(finalScore));
    }
    playSound('win');
  }, [bestScore, playSound]);

  const restart = useCallback(() => {
    sessionRef.current += 1;
    setBoard(createInitialBoard());
    setScore(0);
    setMoves(STARTING_MOVES);
    setSelectedIndex(null);
    setMatchedIds(new Set());
    setInvalidIds(new Set());
    setHintIds(new Set());
    setIsBusy(false);
    setShowResults(false);
    setFinalStars(0);
    setStatus('Fresh tray! Choose a food and swap it with a neighbor.');
    announceToast('Fresh tray!');
  }, [announceToast]);

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
        ? 'Foods must be next to each other.'
        : 'No match there—try another snack.');
      playSound('invalid');
      window.setTimeout(() => setInvalidIds(new Set()), prefersReducedMotion() ? 40 : 320);
      return;
    }

    const session = sessionRef.current;
    const nextMoves = moves - 1;
    const resolved = resolveBoard(result.board);
    const turnScore = resolved.cascades.reduce(
      (total, cascade) => total + cascade.removedCount * 100 * Math.min(cascade.index + 1, 4),
      0,
    );
    const nextScore = score + turnScore;
    const popDelay = prefersReducedMotion() ? 30 : 220;
    const fallDelay = prefersReducedMotion() ? 30 : 170;

    setIsBusy(true);
    setMoves(nextMoves);
    setBoard(result.board);
    setStatus('Great swap! Clearing your match.');
    playSound('swap');

    for (const cascade of resolved.cascades) {
      if (sessionRef.current !== session) return;
      const ids = cascade.matches.map(
        (position) => cascade.boardBefore[position.row][position.col].id,
      );
      setBoard(cascade.boardBefore);
      setMatchedIds(new Set(ids));
      setStatus(cascade.index === 0
        ? `${cascade.removedCount} foods matched!`
        : `Tasty combo ×${cascade.index + 1}!`);
      playSound('match', cascade.index);
      await new Promise<void>((resolve) => window.setTimeout(resolve, popDelay));
      if (sessionRef.current !== session) return;
      setMatchedIds(new Set());
      setBoard(cascade.boardAfter);
      await new Promise<void>((resolve) => window.setTimeout(resolve, fallDelay));
    }

    if (sessionRef.current !== session) return;
    setBoard(resolved.board);
    setScore(nextScore);
    setIsBusy(false);
    if (resolved.reshuffled) {
      announceToast('Fresh tray! No moves, so we shuffled.');
      setStatus('No swaps left, so the tray was shuffled.');
    } else {
      setStatus(`Delicious! +${turnScore.toLocaleString()} points.`);
    }
    if (nextMoves === 0) finishGame(nextScore);
  }, [announceToast, board, finishGame, isBusy, moves, playSound, score]);

  const selectTile = useCallback((index: number) => {
    if (isBusy || moves <= 0) return;
    setFocusIndex(index);
    if (selectedIndex === null) {
      setSelectedIndex(index);
      setStatus(`${FOOD_INFO[flatBoard[index].type].name} selected. Choose a neighboring food.`);
      playSound('select');
      return;
    }
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setStatus('Selection cleared.');
      return;
    }

    const selected = indexToPosition(selectedIndex);
    const next = indexToPosition(index);
    const adjacent = Math.abs(selected.row - next.row) + Math.abs(selected.col - next.col) === 1;
    if (adjacent) {
      void trySwap(selectedIndex, index);
    } else {
      setSelectedIndex(index);
      setStatus(`${FOOD_INFO[flatBoard[index].type].name} selected. Choose a neighboring food.`);
      playSound('select');
    }
  }, [flatBoard, isBusy, moves, playSound, selectedIndex, trySwap]);

  const handleTileClick = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    selectTile(index);
  };

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

    const position = indexToPosition(start.index);
    const target = { ...position };
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
    const legalMoves = findLegalMoves(board);
    if (legalMoves.length === 0) return;
    const hint = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const first = board[hint.from.row][hint.from.col];
    const second = board[hint.to.row][hint.to.col];
    setHintIds(new Set([first.id, second.id]));
    setStatus(`Hint: swap the ${FOOD_INFO[first.type].name.toLowerCase()} with the ${FOOD_INFO[second.type].name.toLowerCase()}.`);
    window.setTimeout(() => setHintIds(new Set()), prefersReducedMotion() ? 400 : 1600);
  };

  const closeHelp = () => {
    setShowHelp(false);
    storeValue(TUTORIAL_KEY, 'true');
    setStatus('Choose a food and swap it with a neighbor.');
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    storeValue(SOUND_KEY, String(next));
    if (next) window.setTimeout(() => playSound('select'), 0);
  };

  return (
    <div className={styles.game}>
      <div className={styles.backdropOrbOne} aria-hidden="true" />
      <div className={styles.backdropOrbTwo} aria-hidden="true" />

      <div className={styles.masthead}>
        <div className={styles.brandLockup}>
          <div className={styles.brandIcon} aria-hidden="true"><Utensils /></div>
          <div>
            <p className={styles.eyebrow}>A tiny lunch-break puzzle</p>
            <h2>Eat your food!</h2>
          </div>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.iconButton} onClick={toggleSound} aria-label={soundOn ? 'Mute game sounds' : 'Turn on game sounds'} title={soundOn ? 'Mute sounds' : 'Turn on sounds'}>
            {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
          <button type="button" className={styles.iconButton} onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play">
            <HelpCircle aria-hidden="true" />
          </button>
          <button type="button" className={styles.iconButton} onClick={restart} aria-label="Restart game" title="Restart game">
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span>Score</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.movesCard}`}>
          <span>Moves</span>
          <strong>{moves}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Best</span>
          <strong>{bestScore.toLocaleString()}</strong>
        </div>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <StarMeter score={score} />
      </div>

      <div className={styles.gameLayout}>
        <section className={styles.trayWrap} aria-label="Match-3 game board">
          <div className={styles.trayRim}>
            <div className={styles.board} aria-busy={isBusy}>
              {flatBoard.map((tile, index) => {
                const position = indexToPosition(index);
                const selected = selectedIndex === index;
                const classNames = [
                  styles.tile,
                  styles[`tile_${tile.type}`],
                  selected ? styles.selected : '',
                  matchedIds.has(tile.id) ? styles.matched : '',
                  invalidIds.has(tile.id) ? styles.invalid : '',
                  hintIds.has(tile.id) ? styles.hinted : '',
                ].filter(Boolean).join(' ');
                return (
                  <button
                    type="button"
                    className={classNames}
                    key={tile.id}
                    ref={(element) => { tileRefs.current[index] = element; }}
                    tabIndex={focusIndex === index ? 0 : -1}
                    aria-pressed={selected}
                    aria-label={`${FOOD_INFO[tile.type].name}, row ${position.row + 1}, column ${position.col + 1}`}
                    disabled={isBusy || moves <= 0}
                    onClick={() => handleTileClick(index)}
                    onFocus={() => setFocusIndex(index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPointerDown={(event) => handlePointerDown(event, index)}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={() => { dragStartRef.current = null; }}
                  >
                    <FoodIcon type={tile.type} />
                    <span className={styles.tileShine} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
          <p className={styles.boardHint}>Tap two neighbors or swipe a food to make a row of 3.</p>
        </section>

        <aside className={styles.sidePanel}>
          <div className={styles.goalCard}>
            <span className={styles.miniLabel}>Today’s goal</span>
            <h3>Fill your lunch stars</h3>
            <p>Score 3,000 points before your 25 moves run out. Combos are worth even more.</p>
            <div className={styles.goalScore}><Star aria-hidden="true" /><span>{Math.max(0, STAR_TARGETS[0] - score).toLocaleString()} to first star</span></div>
          </div>

          <div className={styles.legend} aria-label="Food pieces">
            {Object.entries(FOOD_INFO).map(([type, info]) => (
              <div className={styles.legendItem} key={type}>
                <span style={{ background: info.color }} aria-hidden="true" />
                {info.name}
              </div>
            ))}
          </div>

          <button type="button" className={styles.hintButton} onClick={showHint} disabled={isBusy || moves <= 0}>
            <Lightbulb aria-hidden="true" /> Show me a move
          </button>
          <p className={styles.keyboardTip}>Keyboard: use arrow keys to move, Enter to select, and Escape to cancel.</p>
        </aside>
      </div>

      <p className={styles.liveStatus} role="status" aria-live="polite">{status}</p>
      {toast && <div className={styles.toast} role="status">{toast}</div>}

      {showHelp && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="food-help-title">
            <button type="button" className={styles.modalClose} onClick={closeHelp} aria-label="Close how to play"><X aria-hidden="true" /></button>
            <span className={styles.modalKicker}>How to play</span>
            <h3 id="food-help-title">Make a delicious match.</h3>
            <div className={styles.demoMatch} aria-hidden="true">
              <FoodIcon type="apple" /><FoodIcon type="apple" /><FoodIcon type="apple" />
            </div>
            <ol>
              <li><strong>Swap neighbors.</strong> Tap two foods beside each other, or swipe one.</li>
              <li><strong>Match 3 or more.</strong> Foods pop, new ones fall, and combos multiply your points.</li>
              <li><strong>Chase the stars.</strong> You have 25 valid moves to set a new best score.</li>
            </ol>
            <button type="button" className={styles.primaryButton} onClick={closeHelp}>Let’s eat!</button>
          </section>
        </div>
      )}

      {showResults && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="food-results-title">
            <span className={styles.modalKicker}>Tray cleared</span>
            <h3 id="food-results-title">{finalStars > 0 ? 'Lunch well done!' : 'Still room for seconds!'}</h3>
            <div className={styles.resultStars} aria-label={`${finalStars} of 3 stars`}>
              {[0, 1, 2].map((index) => <Star key={index} className={index < finalStars ? styles.starEarned : styles.starEmpty} aria-hidden="true" />)}
            </div>
            <strong className={styles.finalScore}>{score.toLocaleString()}</strong>
            <span className={styles.finalLabel}>points · best {bestScore.toLocaleString()}</span>
            <button type="button" className={styles.primaryButton} onClick={restart}><RotateCcw aria-hidden="true" /> Play again</button>
          </section>
        </div>
      )}
    </div>
  );
}
