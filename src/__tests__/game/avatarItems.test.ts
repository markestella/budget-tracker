import { describe, it, expect } from 'vitest';
import { AVATAR_ITEMS } from '@/lib/game/avatar/avatarItems';

describe('avatarItems', () => {
  it('has at least 50 avatar items', () => {
    expect(AVATAR_ITEMS.length).toBeGreaterThanOrEqual(50);
  });

  it('all items have required fields', () => {
    for (const item of AVATAR_ITEMS) {
      expect(item.name).toBeTruthy();
      expect(item.type).toBeTruthy();
      expect(item.unlockCondition).toBeTruthy();
      expect(item.imageUrl).toBeTruthy();
    }
  });

  it('covers all item types', () => {
    const types = new Set(AVATAR_ITEMS.map((i) => i.type));
    expect(types).toContain('BASE');
    expect(types).toContain('HAT');
    expect(types).toContain('BACKGROUND');
    expect(types).toContain('FRAME');
    expect(types).toContain('ACCESSORY');
  });

  it('most BASE items are FREE', () => {
    const bases = AVATAR_ITEMS.filter((i) => i.type === 'BASE');
    const freeBases = bases.filter((b) => b.unlockCondition === 'FREE');
    expect(freeBases.length).toBeGreaterThanOrEqual(8);
  });

  it('has at least 10 BASE items (default avatars)', () => {
    const bases = AVATAR_ITEMS.filter((i) => i.type === 'BASE');
    expect(bases.length).toBeGreaterThanOrEqual(10);
  });

  it('LEVEL unlock items have valid unlockValue format', () => {
    const levelItems = AVATAR_ITEMS.filter((i) => i.unlockCondition === 'LEVEL');
    for (const item of levelItems) {
      expect(item.unlockValue).toMatch(/^level:\d+$/);
    }
  });

  it('BADGE unlock items have valid unlockValue format', () => {
    const badgeItems = AVATAR_ITEMS.filter((i) => i.unlockCondition === 'BADGE');
    for (const item of badgeItems) {
      expect(item.unlockValue).toMatch(/^badge:.+$/);
    }
  });
});
