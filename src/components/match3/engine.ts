/**
 * UI-agnostic match-3 rules for Eat Your Food.
 *
 * Every exported operation returns a new board (or leaves the supplied board
 * untouched), which keeps the module safe to use from React state updates.
 */

export const BOARD_SIZE = 8;

export const TILE_TYPES = [
  'maize',
  'tomato',
  'pepper',
  'onion',
  'fish',
  'beans',
  'rice',
  'yam',
  'cassava',
  'plantain',
  'peanut',
  'greens',
  'palmOil',
  'cheese',
  'okra',
  'flour',
  // Legacy identifiers retained for the original standalone component, which
  // remains in the source tree for backwards compatibility.
  'apple',
  'carrot',
  'broccoli',
  'blueberry',
  'milk',
] as const;

export type TileType = (typeof TILE_TYPES)[number];

export interface Tile {
  readonly id: string;
  readonly type: TileType;
}

export interface Position {
  readonly row: number;
  readonly col: number;
}

export type Board = ReadonlyArray<ReadonlyArray<Tile>>;
export type RandomSource = () => number;
export type IdFactory = () => string;

export interface RandomizedOptions {
  readonly rng?: RandomSource;
  readonly idFactory?: IdFactory;
  /** Ingredient types that may appear while generating or refilling tiles. */
  readonly tileTypes?: ReadonlyArray<TileType>;
}

export interface GenerateBoardOptions extends RandomizedOptions {
  readonly maxAttempts?: number;
}

export type MatchOrientation = 'horizontal' | 'vertical';

export interface MatchGroup {
  readonly type: TileType;
  readonly orientation: MatchOrientation;
  readonly positions: ReadonlyArray<Position>;
}

export interface LegalMove {
  readonly from: Position;
  readonly to: Position;
}

export type InvalidSwapReason =
  | 'out-of-bounds'
  | 'not-adjacent'
  | 'same-type'
  | 'no-match';

export type SwapResult =
  | {
      readonly valid: true;
      readonly board: Board;
      readonly matches: ReadonlyArray<Position>;
    }
  | {
      readonly valid: false;
      readonly board: Board;
      readonly matches: readonly [];
      readonly reason: InvalidSwapReason;
    };

export interface CascadeStep {
  readonly index: number;
  readonly matches: ReadonlyArray<Position>;
  readonly removedCount: number;
  readonly boardBefore: Board;
  readonly boardAfter: Board;
}

export interface ResolveOptions extends RandomizedOptions {
  /** Safety valve for deliberately pathological RNGs used by callers/tests. */
  readonly maxCascades?: number;
  /** Defaults to true, so a completed turn cannot leave the UI soft-locked. */
  readonly ensurePlayable?: boolean;
}

export interface ResolveResult {
  readonly board: Board;
  readonly cascades: ReadonlyArray<CascadeStep>;
  readonly totalRemoved: number;
  readonly reshuffled: boolean;
  readonly regenerated: boolean;
}

export interface PlayableBoardResult {
  readonly board: Board;
  /** True when the tile order changed. */
  readonly reshuffled: boolean;
  /** True when reshuffling failed and a fresh board had to be generated. */
  readonly regenerated: boolean;
}

let tileSequence = 0;

const defaultIdFactory: IdFactory = () => `match3-tile-${tileSequence++}`;

function randomIndex(length: number, rng: RandomSource): number {
  if (length <= 0) {
    throw new RangeError('Cannot select from an empty collection.');
  }

  const sampled = rng();
  const value = Number.isFinite(sampled) ? sampled : 0;
  const normalized = Math.max(0, Math.min(0.9999999999999999, value));
  return Math.floor(normalized * length);
}

function dimensions(board: Board): { rows: number; cols: number } {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  if (rows === 0 || cols === 0 || board.some((row) => row.length !== cols)) {
    throw new Error('A match-3 board must be a non-empty rectangle.');
  }

  return { rows, cols };
}

function positionKey(position: Position): string {
  return `${position.row}:${position.col}`;
}

function makeUniqueTile(
  type: TileType,
  usedIds: Set<string>,
  idFactory: IdFactory,
): Tile {
  // A custom factory is allowed to be simple, but it must not be able to make
  // a board invalid by accidentally returning the same id repeatedly.
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const id = idFactory();
    if (id && !usedIds.has(id)) {
      usedIds.add(id);
      return { id, type };
    }
  }

  let id = defaultIdFactory();
  while (usedIds.has(id)) {
    id = defaultIdFactory();
  }
  usedIds.add(id);
  return { id, type };
}

function chooseType(
  disallowed: ReadonlySet<TileType>,
  tileTypes: ReadonlyArray<TileType>,
  rng: RandomSource,
): TileType {
  const choices = tileTypes.filter((type) => !disallowed.has(type));
  return choices[randomIndex(choices.length, rng)];
}

function normalizeTileTypes(
  tileTypes: ReadonlyArray<TileType> | undefined,
): ReadonlyArray<TileType> {
  const unique = Array.from(new Set(tileTypes ?? TILE_TYPES));
  if (unique.length < 3) {
    throw new RangeError('A match-3 board needs at least three tile types.');
  }
  return unique;
}

function createCandidateBoard(
  rng: RandomSource,
  idFactory: IdFactory,
  tileTypes: ReadonlyArray<TileType>,
): Board {
  const board: Tile[][] = [];
  const usedIds = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const nextRow: Tile[] = [];

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const disallowed = new Set<TileType>();

      if (
        col >= 2 &&
        nextRow[col - 1].type === nextRow[col - 2].type
      ) {
        disallowed.add(nextRow[col - 1].type);
      }

      if (
        row >= 2 &&
        board[row - 1][col].type === board[row - 2][col].type
      ) {
        disallowed.add(board[row - 1][col].type);
      }

      nextRow.push(
        makeUniqueTile(
          chooseType(disallowed, tileTypes, rng),
          usedIds,
          idFactory,
        ),
      );
    }

    board.push(nextRow);
  }

  return board;
}

/** A known-solvable board used only after repeated RNG generation failures. */
function createFallbackBoard(
  idFactory: IdFactory,
  tileTypes: ReadonlyArray<TileType>,
): Board {
  const typeIndexes = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from(
      { length: BOARD_SIZE },
      (_, col) => (row + col) % tileTypes.length,
    ),
  );

  // Swapping (0, 1) with (1, 1) completes three matching tiles across row zero.
  typeIndexes[0][2] = 0;
  typeIndexes[1][1] = 0;

  const usedIds = new Set<string>();
  return typeIndexes.map((row) =>
    row.map((typeIndex) =>
      makeUniqueTile(tileTypes[typeIndex], usedIds, idFactory),
    ),
  );
}

/**
 * Creates an 8x8 board with no pre-existing matches and at least one legal
 * move. Callers may provide a level-specific ingredient set.
 */
export function createInitialBoard(options: GenerateBoardOptions = {}): Board {
  const rng = options.rng ?? Math.random;
  const idFactory = options.idFactory ?? defaultIdFactory;
  const maxAttempts = Math.max(1, options.maxAttempts ?? 100);
  const tileTypes = normalizeTileTypes(options.tileTypes);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createCandidateBoard(rng, idFactory, tileTypes);
    if (hasLegalMove(candidate)) {
      return candidate;
    }
  }

  return createFallbackBoard(idFactory, tileTypes);
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function isInsideBoard(board: Board, position: Position): boolean {
  const { rows, cols } = dimensions(board);
  return (
    Number.isInteger(position.row) &&
    Number.isInteger(position.col) &&
    position.row >= 0 &&
    position.row < rows &&
    position.col >= 0 &&
    position.col < cols
  );
}

export function areAdjacent(first: Position, second: Position): boolean {
  return (
    Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1
  );
}

/** Low-level immutable swap. Use attemptSwap when validating a player move. */
export function swapTiles(
  board: Board,
  first: Position,
  second: Position,
): Board {
  if (!isInsideBoard(board, first) || !isInsideBoard(board, second)) {
    throw new RangeError('Cannot swap a tile outside the board.');
  }

  const swapped = board.map((row) => row.slice()) as Tile[][];
  const firstTile = swapped[first.row][first.col];
  swapped[first.row][first.col] = swapped[second.row][second.col];
  swapped[second.row][second.col] = firstTile;
  return swapped;
}

export function findMatchGroups(board: Board): ReadonlyArray<MatchGroup> {
  const { rows, cols } = dimensions(board);
  const groups: MatchGroup[] = [];

  for (let row = 0; row < rows; row += 1) {
    let start = 0;
    while (start < cols) {
      const type = board[row][start].type;
      let end = start + 1;
      while (end < cols && board[row][end].type === type) {
        end += 1;
      }

      if (end - start >= 3) {
        const positions: Position[] = [];
        for (let col = start; col < end; col += 1) {
          positions.push({ row, col });
        }
        groups.push({
          type,
          orientation: 'horizontal',
          positions,
        });
      }
      start = end;
    }
  }

  for (let col = 0; col < cols; col += 1) {
    let start = 0;
    while (start < rows) {
      const type = board[start][col].type;
      let end = start + 1;
      while (end < rows && board[end][col].type === type) {
        end += 1;
      }

      if (end - start >= 3) {
        const positions: Position[] = [];
        for (let row = start; row < end; row += 1) {
          positions.push({ row, col });
        }
        groups.push({
          type,
          orientation: 'vertical',
          positions,
        });
      }
      start = end;
    }
  }

  return groups;
}

/** Returns the row-major union of every horizontal and vertical match. */
export function findMatches(board: Board): ReadonlyArray<Position> {
  const unique = new Map<string, Position>();

  for (const group of findMatchGroups(board)) {
    for (const position of group.positions) {
      unique.set(positionKey(position), position);
    }
  }

  return Array.from(unique.values()).sort(
    (a, b) => a.row - b.row || a.col - b.col,
  );
}

export function attemptSwap(
  board: Board,
  from: Position,
  to: Position,
): SwapResult {
  if (!isInsideBoard(board, from) || !isInsideBoard(board, to)) {
    return {
      valid: false,
      board,
      matches: [],
      reason: 'out-of-bounds',
    };
  }

  if (!areAdjacent(from, to)) {
    return {
      valid: false,
      board,
      matches: [],
      reason: 'not-adjacent',
    };
  }

  if (board[from.row][from.col].type === board[to.row][to.col].type) {
    return { valid: false, board, matches: [], reason: 'same-type' };
  }

  const swapped = swapTiles(board, from, to);
  const matches = findMatches(swapped);
  const touchesSwappedTile = matches.some(
    (position) =>
      positionKey(position) === positionKey(from) ||
      positionKey(position) === positionKey(to),
  );

  if (!touchesSwappedTile) {
    return { valid: false, board, matches: [], reason: 'no-match' };
  }

  return { valid: true, board: swapped, matches };
}

export function isValidSwap(
  board: Board,
  from: Position,
  to: Position,
): boolean {
  return attemptSwap(board, from, to).valid;
}

export function findLegalMoves(board: Board): ReadonlyArray<LegalMove> {
  const { rows, cols } = dimensions(board);
  const moves: LegalMove[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const from = { row, col };
      const right = { row, col: col + 1 };
      const down = { row: row + 1, col };

      if (col + 1 < cols && isValidSwap(board, from, right)) {
        moves.push({ from, to: right });
      }
      if (row + 1 < rows && isValidSwap(board, from, down)) {
        moves.push({ from, to: down });
      }
    }
  }

  return moves;
}

export function hasLegalMove(board: Board): boolean {
  const { rows, cols } = dimensions(board);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const from = { row, col };
      if (
        (col + 1 < cols &&
          isValidSwap(board, from, { row, col: col + 1 })) ||
        (row + 1 < rows &&
          isValidSwap(board, from, { row: row + 1, col }))
      ) {
        return true;
      }
    }
  }

  return false;
}

/** Removes positions, lets columns fall, and fills the empty cells at the top. */
export function collapseAndRefill(
  board: Board,
  matched: ReadonlyArray<Position>,
  options: RandomizedOptions = {},
): Board {
  const { rows, cols } = dimensions(board);
  const rng = options.rng ?? Math.random;
  const idFactory = options.idFactory ?? defaultIdFactory;
  const tileTypes = normalizeTileTypes(options.tileTypes);
  const removed = new Set(
    matched
      .filter((position) => isInsideBoard(board, position))
      .map(positionKey),
  );
  const usedIds = new Set(board.flat().map((tile) => tile.id));
  const result: Tile[][] = Array.from({ length: rows }, () =>
    Array<Tile>(cols),
  );

  for (let col = 0; col < cols; col += 1) {
    const survivors: Tile[] = [];
    for (let row = rows - 1; row >= 0; row -= 1) {
      if (!removed.has(positionKey({ row, col }))) {
        survivors.push(board[row][col]);
      }
    }

    let writeRow = rows - 1;
    for (const tile of survivors) {
      result[writeRow][col] = tile;
      writeRow -= 1;
    }

    while (writeRow >= 0) {
      const type = tileTypes[randomIndex(tileTypes.length, rng)];
      result[writeRow][col] = makeUniqueTile(type, usedIds, idFactory);
      writeRow -= 1;
    }
  }

  return result;
}

function shuffle<T>(values: ReadonlyArray<T>, rng: RandomSource): T[] {
  const shuffled = values.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1, rng);
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

/**
 * Reorders the existing tiles into a stable playable board. If that cannot be
 * done in the attempt budget, it falls back to a freshly generated board.
 */
export function reshuffleBoard(
  board: Board,
  options: GenerateBoardOptions = {},
): PlayableBoardResult {
  const { rows, cols } = dimensions(board);
  const rng = options.rng ?? Math.random;
  const idFactory = options.idFactory ?? defaultIdFactory;
  const maxAttempts = Math.max(1, options.maxAttempts ?? 200);
  const tileTypes = normalizeTileTypes(options.tileTypes);
  const tiles = board.flat();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = shuffle(tiles, rng);
    const candidate = Array.from({ length: rows }, (_, row) =>
      shuffled.slice(row * cols, (row + 1) * cols),
    );

    if (findMatches(candidate).length === 0 && hasLegalMove(candidate)) {
      return { board: candidate, reshuffled: true, regenerated: false };
    }
  }

  return {
    board: createInitialBoard({ rng, idFactory, tileTypes }),
    reshuffled: true,
    regenerated: true,
  };
}

/** Leaves a stable playable board alone and repairs any other board. */
export function ensurePlayableBoard(
  board: Board,
  options: GenerateBoardOptions = {},
): PlayableBoardResult {
  if (findMatches(board).length === 0 && hasLegalMove(board)) {
    return { board, reshuffled: false, regenerated: false };
  }
  return reshuffleBoard(board, options);
}

/** Resolves every current match, including refill-created cascades. */
export function resolveBoard(
  board: Board,
  options: ResolveOptions = {},
): ResolveResult {
  const rng = options.rng ?? Math.random;
  const idFactory = options.idFactory ?? defaultIdFactory;
  const tileTypes = normalizeTileTypes(options.tileTypes);
  const maxCascades = Math.max(1, options.maxCascades ?? 100);
  const cascades: CascadeStep[] = [];
  let current = cloneBoard(board);
  let regenerated = false;

  for (let index = 0; index < maxCascades; index += 1) {
    const matches = findMatches(current);
    if (matches.length === 0) {
      break;
    }

    const boardBefore = current;
    current = collapseAndRefill(current, matches, {
      rng,
      idFactory,
      tileTypes,
    });
    cascades.push({
      index,
      matches,
      removedCount: matches.length,
      boardBefore,
      boardAfter: current,
    });
  }

  // A constant or adversarial RNG can create matches forever. Recover rather
  // than hanging a game loop, while exposing the fallback to the UI.
  if (findMatches(current).length > 0) {
    current = createInitialBoard({ rng, idFactory, tileTypes });
    regenerated = true;
  }

  let reshuffled = false;
  if (options.ensurePlayable !== false) {
    const playable = ensurePlayableBoard(current, {
      rng,
      idFactory,
      tileTypes,
    });
    current = playable.board;
    reshuffled = playable.reshuffled;
    regenerated = regenerated || playable.regenerated;
  }

  return {
    board: current,
    cascades,
    totalRemoved: cascades.reduce(
      (total, cascade) => total + cascade.removedCount,
      0,
    ),
    reshuffled,
    regenerated,
  };
}
