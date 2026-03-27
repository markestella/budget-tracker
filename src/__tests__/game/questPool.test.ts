import { describe, it, expect } from 'vitest';
import { QUEST_POOL } from '@/lib/game/quests/questPool';

describe('questPool', () => {
  it('has at least 40 quest definitions', () => {
    expect(QUEST_POOL.length).toBeGreaterThanOrEqual(40);
  });

  it('all quests have required fields', () => {
    for (const quest of QUEST_POOL) {
      expect(quest.title).toBeTruthy();
      expect(quest.description).toBeTruthy();
      expect(quest.type).toBeTruthy();
      expect(quest.xpReward).toBeGreaterThan(0);
      expect(quest.category).toBeTruthy();
      expect(quest.conditions).toBeDefined();
      expect(quest.conditions.metric).toBeTruthy();
      expect(quest.conditions.operator).toBeTruthy();
      expect(typeof quest.conditions.value).toBe('number');
    }
  });

  it('covers DAILY, WEEKLY, and MONTHLY types', () => {
    const types = new Set(QUEST_POOL.map((q) => q.type));
    expect(types).toContain('DAILY');
    expect(types).toContain('WEEKLY');
    expect(types).toContain('MONTHLY');
  });

  it('DAILY quests have lower XP than MONTHLY quests on average', () => {
    const daily = QUEST_POOL.filter((q) => q.type === 'DAILY');
    const monthly = QUEST_POOL.filter((q) => q.type === 'MONTHLY');
    const avgDaily = daily.reduce((s, q) => s + q.xpReward, 0) / daily.length;
    const avgMonthly = monthly.reduce((s, q) => s + q.xpReward, 0) / monthly.length;
    expect(avgMonthly).toBeGreaterThan(avgDaily);
  });

  it('has at least 20 DAILY quests', () => {
    const daily = QUEST_POOL.filter((q) => q.type === 'DAILY');
    expect(daily.length).toBeGreaterThanOrEqual(20);
  });

  it('uses valid operators', () => {
    const validOperators = ['>=', '==', '<=', '>'];
    for (const quest of QUEST_POOL) {
      expect(validOperators).toContain(quest.conditions.operator);
    }
  });
});
