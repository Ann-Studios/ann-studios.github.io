import {
  BOARD_SIZE,
  TILE_TYPES,
  attemptSwap,
  collapseAndRefill,
  createInitialBoard,
  findLegalMoves,
  findMatchGroups,
  findMatches,
  hasLegalMove,
  isValidSwap,
  reshuffleBoard,
  resolveBoard,
  type Board,
  type Tile,
} from './engine';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sequenceRandom(
  values: number[],
  fallback: () => number,
): () => number {
  let index = 0;
  return () => (index < values.length ? values[index++] : fallback());
}

function boardFromTypeIndexes(indexes: number[][]): Board {
  return indexes.map((row, rowIndex) =>
    row.map(
      (typeIndex, colIndex): Tile => ({
        id: `fixture-${rowIndex}-${colIndex}`,
        type: TILE_TYPES[typeIndex],
      }),
    ),
  );
}

function latinBoard(): Board {
  return boardFromTypeIndexes(
    Array.from({ length: BOARD_SIZE }, (_, row) =>
      Array.from(
        { length: BOARD_SIZE },
        (_, col) => (row + col) % TILE_TYPES.length,
      ),
    ),
  );
}

function playableFixture(): Board {
  const indexes = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from(
      { length: BOARD_SIZE },
      (_, col) => (row + col) % TILE_TYPES.length,
    ),
  );
  indexes[0][2] = 0;
  indexes[1][1] = 0;
  return boardFromTypeIndexes(indexes);
}

function intersectingMatchFixture(): Board {
  const indexes = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from(
      { length: BOARD_SIZE },
      (_, col) => (row + col) % TILE_TYPES.length,
    ),
  );

  indexes[3][2] = 5;
  indexes[3][3] = 5;
  indexes[3][4] = 5;
  indexes[2][3] = 5;
  indexes[4][3] = 5;
  return boardFromTypeIndexes(indexes);
}

function bottomMatchFixture(): Board {
  const indexes = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from(
      { length: BOARD_SIZE },
      (_, col) => (row + col) % TILE_TYPES.length,
    ),
  );
  indexes[7][0] = 0;
  indexes[7][1] = 0;
  indexes[7][2] = 0;
  return boardFromTypeIndexes(indexes);
}

function typesOf(board: Board): string[][] {
  return board.map((row) => row.map((tile) => tile.type));
}

describe('match-3 engine', () => {
  it('creates a deterministic, unique, match-free, playable 8x8 board', () => {
    let id = 0;
    const board = createInitialBoard({
      rng: seededRandom(42),
      idFactory: () => `generated-${id++}`,
    });

    expect(board).toHaveLength(BOARD_SIZE);
    expect(board.every((row) => row.length === BOARD_SIZE)).toBe(true);
    expect(new Set(board.flat().map((tile) => tile.id)).size).toBe(
      BOARD_SIZE * BOARD_SIZE,
    );
    expect(findMatches(board)).toEqual([]);
    expect(hasLegalMove(board)).toBe(true);
    expect(findLegalMoves(board).length).toBeGreaterThan(0);
  });

  it('keeps generation and refills inside a level-specific ingredient set', () => {
    const ingredients = ['maize', 'tomato', 'fish', 'rice', 'beans', 'greens'] as const;
    const board = createInitialBoard({
      rng: seededRandom(314),
      tileTypes: ingredients,
    });
    const matchedBoard = board.map((row, rowIndex) => row.map((tile, colIndex) => (
      rowIndex === BOARD_SIZE - 1 && colIndex < 3
        ? { ...tile, type: ingredients[0] }
        : tile
    )));
    const result = resolveBoard(matchedBoard, {
      rng: seededRandom(2718),
      tileTypes: ingredients,
    });

    expect(board.flat().every((tile) => ingredients.includes(tile.type as typeof ingredients[number]))).toBe(true);
    expect(result.board.flat().every((tile) => ingredients.includes(tile.type as typeof ingredients[number]))).toBe(true);
    expect(findMatches(board)).toEqual([]);
    expect(hasLegalMove(board)).toBe(true);
  });

  it('validates only adjacent swaps that create a match', () => {
    const board = playableFixture();
    const valid = attemptSwap(board, { row: 0, col: 1 }, { row: 1, col: 1 });

    expect(valid.valid).toBe(true);
    expect(valid.matches).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);
    expect(isValidSwap(board, { row: 0, col: 0 }, { row: 7, col: 7 })).toBe(
      false,
    );

    const invalid = attemptSwap(
      board,
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.board).toBe(board);
  });

  it('finds horizontal and vertical groups and de-duplicates intersections', () => {
    const board = intersectingMatchFixture();
    const groups = findMatchGroups(board);
    const matches = findMatches(board);

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.orientation).sort()).toEqual([
      'horizontal',
      'vertical',
    ]);
    expect(matches).toEqual([
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 3 },
    ]);
  });

  it('collapses columns, preserves survivors, and refills with unique ids', () => {
    const board = bottomMatchFixture();
    const matched = findMatches(board);
    let id = 0;
    const refilled = collapseAndRefill(board, matched, {
      rng: seededRandom(7),
      idFactory: () => `refill-${id++}`,
    });

    expect(matched).toHaveLength(3);
    expect(refilled).toHaveLength(BOARD_SIZE);
    expect(new Set(refilled.flat().map((tile) => tile.id)).size).toBe(64);
    expect(refilled[7][0].id).toBe(board[6][0].id);
    expect(refilled[7][1].id).toBe(board[6][1].id);
    expect(refilled[7][2].id).toBe(board[6][2].id);
  });

  it('resolves cascades deterministically and leaves a stable playable board', () => {
    const first = resolveBoard(bottomMatchFixture(), {
      // The first refill creates three apples across the top, guaranteeing a
      // second cascade; the seeded fallback handles subsequent refills.
      rng: sequenceRandom([0, 0, 0], seededRandom(1234)),
    });
    const second = resolveBoard(bottomMatchFixture(), {
      rng: sequenceRandom([0, 0, 0], seededRandom(1234)),
    });

    expect(first.cascades.length).toBeGreaterThanOrEqual(2);
    expect(first.totalRemoved).toBeGreaterThanOrEqual(6);
    expect(findMatches(first.board)).toEqual([]);
    expect(hasLegalMove(first.board)).toBe(true);
    expect(typesOf(first.board)).toEqual(typesOf(second.board));
    expect(new Set(first.board.flat().map((tile) => tile.id)).size).toBe(64);
  });

  it('detects a dead board and reshuffles it into a playable one', () => {
    const dead = latinBoard();

    expect(findMatches(dead)).toEqual([]);
    expect(hasLegalMove(dead)).toBe(false);

    const repaired = reshuffleBoard(dead, {
      rng: seededRandom(99),
      maxAttempts: 500,
    });

    expect(repaired.reshuffled).toBe(true);
    expect(findMatches(repaired.board)).toEqual([]);
    expect(hasLegalMove(repaired.board)).toBe(true);
    expect(new Set(repaired.board.flat().map((tile) => tile.id)).size).toBe(64);
  });
});
