import { describe, it, expect } from 'vitest';
import { getXPForLevel, getLevel, getXPProgress } from '@/lib/game/levelCalculator';

describe('levelCalculator', () => {
  describe('getXPForLevel', () => {
    it('returns 100 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(100);
    });

    it('returns increasing XP for higher levels', () => {
      const level5 = getXPForLevel(5);
      const level10 = getXPForLevel(10);
      expect(level10).toBeGreaterThan(level5);
    });

    it('uses the formula floor(100 * level^1.5)', () => {
      expect(getXPForLevel(4)).toBe(Math.floor(100 * Math.pow(4, 1.5)));
    });
  });

  describe('getLevel', () => {
    it('returns level 1 for 0 XP', () => {
      expect(getLevel(0)).toBe(1);
    });

    it('returns level 1 for XP below level 1 threshold', () => {
      expect(getLevel(50)).toBe(1);
    });

    it('returns level 2 for XP equal to level 1 requirement', () => {
      expect(getLevel(100)).toBe(2);
    });

    it('returns correct level for large XP', () => {
      // Accumulate XP for levels 1-10
      let totalXP = 0;
      for (let i = 1; i <= 10; i++) {
        totalXP += getXPForLevel(i);
      }
      expect(getLevel(totalXP)).toBe(11);
    });
  });

  describe('getXPProgress', () => {
    it('returns level 1 with 0 progress for 0 XP', () => {
      const result = getXPProgress(0);
      expect(result.level).toBe(1);
      expect(result.currentXP).toBe(0);
      expect(result.progress).toBe(0);
    });

    it('returns correct progress for partial XP in a level', () => {
      const result = getXPProgress(50);
      expect(result.level).toBe(1);
      expect(result.currentXP).toBe(50);
      expect(result.xpNeeded).toBe(getXPForLevel(1));
      expect(result.progress).toBe(50); // 50 out of 100
    });

    it('progress is between 0 and 100', () => {
      for (const xp of [0, 50, 100, 500, 1000, 5000]) {
        const result = getXPProgress(xp);
        expect(result.progress).toBeGreaterThanOrEqual(0);
        expect(result.progress).toBeLessThanOrEqual(100);
      }
    });
  });
});
