export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevel(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;

  while (true) {
    const xpNeeded = getXPForLevel(level);
    if (cumulativeXP + xpNeeded > totalXP) break;
    cumulativeXP += xpNeeded;
    level++;
  }

  return level;
}

export function getXPProgress(totalXP: number) {
  let level = 1;
  let cumulativeXP = 0;

  while (true) {
    const xpNeeded = getXPForLevel(level);
    if (cumulativeXP + xpNeeded > totalXP) {
      const currentXP = totalXP - cumulativeXP;
      return {
        level,
        currentXP,
        xpNeeded,
        progress: Math.min(100, Math.round((currentXP / xpNeeded) * 100)),
      };
    }
    cumulativeXP += xpNeeded;
    level++;
  }
}
