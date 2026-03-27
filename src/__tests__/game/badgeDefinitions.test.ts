import { describe, it, expect } from 'vitest';
import { BADGE_DEFINITIONS } from '@/lib/game/badges/badgeDefinitions';

describe('badgeDefinitions', () => {
  it('has at least 50 badge definitions', () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(50);
  });

  it('all badges have unique keys', () => {
    const keys = BADGE_DEFINITIONS.map((b) => b.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('all badges have required fields', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.key).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.category).toBeTruthy();
      expect(badge.tier).toBeTruthy();
      expect(badge.xpReward).toBeGreaterThan(0);
      expect(badge.event).toBeTruthy();
    }
  });

  it('covers all expected categories', () => {
    const categories = new Set(BADGE_DEFINITIONS.map((b) => b.category));
    expect(categories).toContain('STARTER');
    expect(categories).toContain('SAVINGS');
    expect(categories).toContain('DISCIPLINE');
    expect(categories).toContain('BUDGET');
    expect(categories).toContain('MILESTONE');
    expect(categories).toContain('SPECIAL');
  });

  it('covers all expected tiers', () => {
    const tiers = new Set(BADGE_DEFINITIONS.map((b) => b.tier));
    expect(tiers).toContain('BRONZE');
    expect(tiers).toContain('SILVER');
    expect(tiers).toContain('GOLD');
    expect(tiers).toContain('PLATINUM');
  });

  it('platinum badges have highest XP rewards', () => {
    const platBadges = BADGE_DEFINITIONS.filter((b) => b.tier === 'PLATINUM');
    const bronzeBadges = BADGE_DEFINITIONS.filter((b) => b.tier === 'BRONZE');
    const avgPlat = platBadges.reduce((sum, b) => sum + b.xpReward, 0) / platBadges.length;
    const avgBronze = bronzeBadges.reduce((sum, b) => sum + b.xpReward, 0) / bronzeBadges.length;
    expect(avgPlat).toBeGreaterThan(avgBronze);
  });
});
