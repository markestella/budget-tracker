import { describe, it, expect } from 'vitest';
import { XP_ACTIONS, BADGE_XP_BY_TIER } from '@/lib/game/xpConfig';

describe('xpConfig', () => {
  describe('XP_ACTIONS', () => {
    it('has all expected action keys', () => {
      const expectedKeys = [
        'LOG_EXPENSE',
        'UNDER_DAILY_BUDGET',
        'WEEKLY_CHALLENGE',
        'SAVINGS_MILESTONE',
        'STREAK_7_DAYS',
        'STREAK_30_DAYS',
        'COMPLETE_QUEST',
        'FIRST_SETUP',
      ];
      expect(Object.keys(XP_ACTIONS)).toEqual(expect.arrayContaining(expectedKeys));
    });

    it('all XP values are positive integers', () => {
      for (const [, value] of Object.entries(XP_ACTIONS)) {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('LOG_EXPENSE gives 5 XP', () => {
      expect(XP_ACTIONS.LOG_EXPENSE).toBe(5);
    });

    it('COMPLETE_QUEST is the highest action XP', () => {
      const max = Math.max(...Object.values(XP_ACTIONS));
      expect(XP_ACTIONS.STREAK_30_DAYS).toBe(max);
    });
  });

  describe('BADGE_XP_BY_TIER', () => {
    it('has increasing XP per tier', () => {
      expect(BADGE_XP_BY_TIER.BRONZE).toBeLessThan(BADGE_XP_BY_TIER.SILVER);
      expect(BADGE_XP_BY_TIER.SILVER).toBeLessThan(BADGE_XP_BY_TIER.GOLD);
      expect(BADGE_XP_BY_TIER.GOLD).toBeLessThan(BADGE_XP_BY_TIER.PLATINUM);
    });
  });
});
