import type { AvatarItemType, AvatarUnlockCondition } from '@prisma/client';

export interface AvatarItemDef {
  name: string;
  type: AvatarItemType;
  unlockCondition: AvatarUnlockCondition;
  unlockValue: string | null;
  imageUrl: string; // emoji for MVP
}

export const AVATAR_ITEMS: AvatarItemDef[] = [
  // ─── BASE (10, FREE) ──────────────────────────────────
  { name: 'Adventurer', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🧑' },
  { name: 'Warrior', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '⚔️' },
  { name: 'Wizard', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🧙' },
  { name: 'Robot', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🤖' },
  { name: 'Cat', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🐱' },
  { name: 'Dog', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🐶' },
  { name: 'Penguin', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🐧' },
  { name: 'Fox', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🦊' },
  { name: 'Panda', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🐼' },
  { name: 'Owl', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🦉' },

  // ─── HATS (15, LEVEL) ─────────────────────────────────
  { name: 'Party Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:3', imageUrl: '🎉' },
  { name: 'Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:5', imageUrl: '👑' },
  { name: 'Top Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:7', imageUrl: '🎩' },
  { name: 'Cap', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:10', imageUrl: '🧢' },
  { name: 'Helmet', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:12', imageUrl: '⛑️' },
  { name: 'Cowboy Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:15', imageUrl: '🤠' },
  { name: 'Wizard Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:18', imageUrl: '🪄' },
  { name: 'Graduation Cap', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:20', imageUrl: '🎓' },
  { name: 'Chef Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:22', imageUrl: '👨‍🍳' },
  { name: 'Viking Helmet', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:25', imageUrl: '🪖' },
  { name: 'Space Helmet', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:28', imageUrl: '🚀' },
  { name: 'Ice Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:30', imageUrl: '❄️' },
  { name: 'Fire Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:35', imageUrl: '🔥' },
  { name: 'Diamond Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:40', imageUrl: '💎' },
  { name: 'Legendary Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:50', imageUrl: '✨' },

  // ─── BACKGROUNDS (10, BADGE) ──────────────────────────
  { name: 'Forest', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:first_step', imageUrl: '🌲' },
  { name: 'Ocean', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:first_save', imageUrl: '🌊' },
  { name: 'Mountain', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:on_fire', imageUrl: '⛰️' },
  { name: 'City', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:data_driven', imageUrl: '🏙️' },
  { name: 'Space', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:lightning', imageUrl: '🌌' },
  { name: 'Sunset', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:under_budget', imageUrl: '🌅' },
  { name: 'Rainbow', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:budget_champion', imageUrl: '🌈' },
  { name: 'Volcano', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:supernova', imageUrl: '🌋' },
  { name: 'Aurora', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:diamond_hands', imageUrl: '🌠' },
  { name: 'Castle', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:sovereign', imageUrl: '🏰' },

  // ─── FRAMES (8, LEVEL) ─────────────────────────────────
  { name: 'Bronze Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:5', imageUrl: '🥉' },
  { name: 'Silver Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:15', imageUrl: '🥈' },
  { name: 'Gold Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:30', imageUrl: '🥇' },
  { name: 'Platinum Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:50', imageUrl: '💠' },
  { name: 'Diamond Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:75', imageUrl: '💎' },
  { name: 'Wooden Frame', type: 'FRAME', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🪵' },
  { name: 'Stone Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:8', imageUrl: '🪨' },
  { name: 'Crystal Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:40', imageUrl: '🔮' },

  // ─── ACCESSORIES (10, MIX) ────────────────────────────
  { name: 'Sunglasses', type: 'ACCESSORY', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🕶️' },
  { name: 'Monocle', type: 'ACCESSORY', unlockCondition: 'LEVEL', unlockValue: 'level:10', imageUrl: '🧐' },
  { name: 'Bow Tie', type: 'ACCESSORY', unlockCondition: 'LEVEL', unlockValue: 'level:15', imageUrl: '🎀' },
  { name: 'Shield', type: 'ACCESSORY', unlockCondition: 'BADGE', unlockValue: 'badge:safety_net', imageUrl: '🛡️' },
  { name: 'Sword', type: 'ACCESSORY', unlockCondition: 'BADGE', unlockValue: 'badge:budget_legend', imageUrl: '⚔️' },
  { name: 'Wand', type: 'ACCESSORY', unlockCondition: 'LEVEL', unlockValue: 'level:20', imageUrl: '🪄' },
  { name: 'Telescope', type: 'ACCESSORY', unlockCondition: 'LEVEL', unlockValue: 'level:25', imageUrl: '🔭' },
  { name: 'Trophy', type: 'ACCESSORY', unlockCondition: 'BADGE', unlockValue: 'badge:millionaire', imageUrl: '🏆' },
  { name: 'Star Badge', type: 'ACCESSORY', unlockCondition: 'LEVEL', unlockValue: 'level:30', imageUrl: '⭐' },
  { name: 'Lightning Bolt', type: 'ACCESSORY', unlockCondition: 'BADGE', unlockValue: 'badge:supernova', imageUrl: '⚡' },

  // ─── PREMIUM (5) ──────────────────────────────────────
  { name: 'Golden Dragon', type: 'BASE', unlockCondition: 'PREMIUM', unlockValue: null, imageUrl: '🐉' },
  { name: 'Phoenix', type: 'BASE', unlockCondition: 'PREMIUM', unlockValue: null, imageUrl: '🔥' },
  { name: 'Unicorn', type: 'HAT', unlockCondition: 'PREMIUM', unlockValue: null, imageUrl: '🦄' },
  { name: 'Galaxy', type: 'BACKGROUND', unlockCondition: 'PREMIUM', unlockValue: null, imageUrl: '🌀' },
  { name: 'Emerald Frame', type: 'FRAME', unlockCondition: 'PREMIUM', unlockValue: null, imageUrl: '💚' },
];
