import {
  BENIN_LEVELS,
  DEFAULT_PROGRESS,
  completeLevel,
  sanitizeProgress,
  starsForMoves,
  validateCampaign,
} from './campaign';

describe('Eat Your Food campaign', () => {
  it('defines a valid 20-level Benin route', () => {
    expect(BENIN_LEVELS).toHaveLength(20);
    expect(BENIN_LEVELS.map((level) => level.id)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
    expect(validateCampaign()).toEqual([]);
  });

  it('unlocks only the next level and keeps the best star result', () => {
    const afterOne = completeLevel(DEFAULT_PROGRESS, 1, 2);
    expect(afterOne.unlockedLevel).toBe(2);
    expect(afterOne.completed).toEqual([1]);
    expect(afterOne.stars['1']).toBe(2);

    const skipped = completeLevel(afterOne, 4, 3);
    expect(skipped).toBe(afterOne);

    const replayed = completeLevel(afterOne, 1, 1);
    expect(replayed.unlockedLevel).toBe(2);
    expect(replayed.completed).toEqual([1]);
    expect(replayed.stars['1']).toBe(2);
  });

  it('sanitizes malformed saved progress', () => {
    expect(sanitizeProgress(null)).toEqual(DEFAULT_PROGRESS);
    expect(sanitizeProgress({
      version: 1,
      unlockedLevel: 99,
      completed: [2, 2, -1, 21, 1],
      stars: { 1: 7, 2: -3, 99: 2 },
    })).toEqual({
      version: 1,
      unlockedLevel: 20,
      completed: [1, 2],
      stars: { 1: 3, 2: 0 },
    });
  });

  it('awards one to three stars from remaining moves', () => {
    expect(starsForMoves(10, 24)).toBe(3);
    expect(starsForMoves(5, 24)).toBe(2);
    expect(starsForMoves(0, 24)).toBe(1);
  });
});
