import type { BadgeCategory, BadgeTier } from '@prisma/client';

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  xpReward: number;
  event: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ─── STARTER ──────────────────────────────────────────
  { key: 'first_step', name: 'First Step', description: 'Log your first expense', icon: '👣', category: 'STARTER', tier: 'BRONZE', xpReward: 25, event: 'EXPENSE_LOGGED' },
  { key: 'first_save', name: 'First Save', description: 'Create your first savings goal', icon: '🌱', category: 'STARTER', tier: 'BRONZE', xpReward: 25, event: 'SAVINGS_UPDATED' },
  { key: 'data_driven', name: 'Data Driven', description: 'Log 10 expenses', icon: '📊', category: 'STARTER', tier: 'BRONZE', xpReward: 50, event: 'EXPENSE_LOGGED' },
  { key: 'account_keeper', name: 'Account Keeper', description: 'Link a financial account', icon: '🏦', category: 'STARTER', tier: 'BRONZE', xpReward: 25, event: 'ACCOUNT_LINKED' },
  { key: 'getting_started', name: 'Getting Started', description: 'Complete profile setup', icon: '🚀', category: 'STARTER', tier: 'BRONZE', xpReward: 50, event: 'FIRST_SETUP' },
  { key: 'habit_forming', name: 'Habit Forming', description: 'Log expenses 3 days in a row', icon: '🔄', category: 'STARTER', tier: 'BRONZE', xpReward: 30, event: 'STREAK_MILESTONE' },
  { key: 'explorer', name: 'Explorer', description: 'Visit all app sections', icon: '🗺️', category: 'STARTER', tier: 'BRONZE', xpReward: 25, event: 'PAGE_VISITED' },
  { key: 'twenty_entries', name: 'Twenty Entries', description: 'Log 20 expenses', icon: '✏️', category: 'STARTER', tier: 'SILVER', xpReward: 50, event: 'EXPENSE_LOGGED' },
  { key: 'fifty_entries', name: 'Fifty Entries', description: 'Log 50 expenses', icon: '📝', category: 'STARTER', tier: 'SILVER', xpReward: 75, event: 'EXPENSE_LOGGED' },
  { key: 'centurion', name: 'Centurion', description: 'Log 100 expenses', icon: '💯', category: 'STARTER', tier: 'GOLD', xpReward: 100, event: 'EXPENSE_LOGGED' },

  // ─── SAVINGS ──────────────────────────────────────────
  { key: 'safety_net', name: 'Safety Net', description: 'Save 1 month of expenses in emergency fund', icon: '🛡️', category: 'SAVINGS', tier: 'BRONZE', xpReward: 50, event: 'SAVINGS_UPDATED' },
  { key: 'fortress', name: 'Fortress', description: 'Save 3 months of expenses in emergency fund', icon: '🏰', category: 'SAVINGS', tier: 'SILVER', xpReward: 100, event: 'SAVINGS_UPDATED' },
  { key: 'citadel', name: 'Citadel', description: 'Save 6 months of expenses in emergency fund', icon: '⛰️', category: 'SAVINGS', tier: 'GOLD', xpReward: 200, event: 'SAVINGS_UPDATED' },
  { key: 'sovereign', name: 'Sovereign', description: 'Save 12 months of expenses in emergency fund', icon: '👑', category: 'SAVINGS', tier: 'PLATINUM', xpReward: 500, event: 'SAVINGS_UPDATED' },
  { key: 'penny_pincher', name: 'Penny Pincher', description: 'Save ₱1,000', icon: '🪙', category: 'SAVINGS', tier: 'BRONZE', xpReward: 25, event: 'SAVINGS_UPDATED' },
  { key: 'savings_starter', name: 'Savings Starter', description: 'Save ₱5,000', icon: '💰', category: 'SAVINGS', tier: 'BRONZE', xpReward: 50, event: 'SAVINGS_UPDATED' },
  { key: 'nest_egg', name: 'Nest Egg', description: 'Save ₱10,000', icon: '🥚', category: 'SAVINGS', tier: 'SILVER', xpReward: 75, event: 'SAVINGS_UPDATED' },
  { key: 'wealth_builder', name: 'Wealth Builder', description: 'Save ₱50,000', icon: '🏗️', category: 'SAVINGS', tier: 'GOLD', xpReward: 150, event: 'SAVINGS_UPDATED' },

  // ─── DISCIPLINE ───────────────────────────────────────
  { key: 'on_fire', name: 'On Fire', description: '7-day streak', icon: '🔥', category: 'DISCIPLINE', tier: 'BRONZE', xpReward: 75, event: 'STREAK_MILESTONE' },
  { key: 'lightning', name: 'Lightning', description: '30-day streak', icon: '⚡', category: 'DISCIPLINE', tier: 'SILVER', xpReward: 300, event: 'STREAK_MILESTONE' },
  { key: 'supernova', name: 'Supernova', description: '90-day streak', icon: '💫', category: 'DISCIPLINE', tier: 'GOLD', xpReward: 500, event: 'STREAK_MILESTONE' },
  { key: 'diamond_hands', name: 'Diamond Hands', description: '365-day streak', icon: '💎', category: 'DISCIPLINE', tier: 'PLATINUM', xpReward: 500, event: 'STREAK_MILESTONE' },
  { key: 'two_week_warrior', name: 'Two Week Warrior', description: '14-day streak', icon: '⚔️', category: 'DISCIPLINE', tier: 'BRONZE', xpReward: 100, event: 'STREAK_MILESTONE' },
  { key: 'sixty_day_legend', name: 'Sixty Day Legend', description: '60-day streak', icon: '🌟', category: 'DISCIPLINE', tier: 'SILVER', xpReward: 400, event: 'STREAK_MILESTONE' },
  { key: 'half_year_hero', name: 'Half Year Hero', description: '180-day streak', icon: '🦸', category: 'DISCIPLINE', tier: 'GOLD', xpReward: 500, event: 'STREAK_MILESTONE' },
  { key: 'consistency_king', name: 'Consistency King', description: 'Log every day for a full month', icon: '📅', category: 'DISCIPLINE', tier: 'SILVER', xpReward: 200, event: 'STREAK_MILESTONE' },

  // ─── BUDGET ───────────────────────────────────────────
  { key: 'under_budget', name: 'Under Budget', description: 'Stay under budget for 1 month', icon: '✅', category: 'BUDGET', tier: 'BRONZE', xpReward: 50, event: 'BUDGET_UNDER' },
  { key: 'budget_champion', name: 'Budget Champion', description: 'Stay under budget for 3 months', icon: '🏆', category: 'BUDGET', tier: 'SILVER', xpReward: 150, event: 'BUDGET_UNDER' },
  { key: 'budget_legend', name: 'Budget Legend', description: 'Stay under budget for 6 months', icon: '🌈', category: 'BUDGET', tier: 'GOLD', xpReward: 300, event: 'BUDGET_UNDER' },
  { key: 'frugal_finder', name: 'Frugal Finder', description: 'Find 5 expenses to cut', icon: '🔍', category: 'BUDGET', tier: 'BRONZE', xpReward: 50, event: 'BUDGET_UNDER' },
  { key: 'category_master', name: 'Category Master', description: 'Stay under budget in all categories', icon: '🎯', category: 'BUDGET', tier: 'SILVER', xpReward: 100, event: 'BUDGET_UNDER' },
  { key: 'zero_waste', name: 'Zero Waste', description: '3 no-overspend months in a row', icon: '♻️', category: 'BUDGET', tier: 'GOLD', xpReward: 200, event: 'BUDGET_UNDER' },
  { key: 'budget_architect', name: 'Budget Architect', description: 'Create budgets for all categories', icon: '📐', category: 'BUDGET', tier: 'BRONZE', xpReward: 50, event: 'BUDGET_UNDER' },

  // ─── MILESTONES ───────────────────────────────────────
  { key: 'first_10k', name: 'First ₱10K', description: 'Reach ₱10,000 in total savings', icon: '🎉', category: 'MILESTONE', tier: 'BRONZE', xpReward: 100, event: 'SAVINGS_UPDATED' },
  { key: '50k_club', name: '₱50K Club', description: 'Reach ₱50,000 in total savings', icon: '🥳', category: 'MILESTONE', tier: 'SILVER', xpReward: 200, event: 'SAVINGS_UPDATED' },
  { key: '100k_club', name: '₱100K Club', description: 'Reach ₱100,000 in total savings', icon: '💫', category: 'MILESTONE', tier: 'GOLD', xpReward: 300, event: 'SAVINGS_UPDATED' },
  { key: 'half_millionaire', name: 'Half Millionaire', description: 'Reach ₱500,000 in total savings', icon: '🌟', category: 'MILESTONE', tier: 'PLATINUM', xpReward: 500, event: 'SAVINGS_UPDATED' },
  { key: 'millionaire', name: 'Millionaire', description: 'Reach ₱1,000,000 in total savings', icon: '👸', category: 'MILESTONE', tier: 'PLATINUM', xpReward: 500, event: 'SAVINGS_UPDATED' },
  { key: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', category: 'MILESTONE', tier: 'BRONZE', xpReward: 50, event: 'LEVEL_UP' },
  { key: 'level_10', name: 'Dedicated Saver', description: 'Reach Level 10', icon: '🌟', category: 'MILESTONE', tier: 'SILVER', xpReward: 100, event: 'LEVEL_UP' },
  { key: 'level_25', name: 'Finance Guru', description: 'Reach Level 25', icon: '🏅', category: 'MILESTONE', tier: 'GOLD', xpReward: 200, event: 'LEVEL_UP' },
  { key: 'level_50', name: 'Money Master', description: 'Reach Level 50', icon: '👑', category: 'MILESTONE', tier: 'PLATINUM', xpReward: 500, event: 'LEVEL_UP' },
  { key: 'quest_novice', name: 'Quest Novice', description: 'Complete 5 quests', icon: '📜', category: 'MILESTONE', tier: 'BRONZE', xpReward: 50, event: 'QUEST_COMPLETED' },
  { key: 'quest_veteran', name: 'Quest Veteran', description: 'Complete 25 quests', icon: '⚔️', category: 'MILESTONE', tier: 'SILVER', xpReward: 150, event: 'QUEST_COMPLETED' },
  { key: 'quest_master', name: 'Quest Master', description: 'Complete 100 quests', icon: '🏆', category: 'MILESTONE', tier: 'GOLD', xpReward: 300, event: 'QUEST_COMPLETED' },

  // ─── SPECIAL ──────────────────────────────────────────
  { key: 'night_owl', name: 'Night Owl', description: 'Log an expense after 11 PM', icon: '🦉', category: 'SPECIAL', tier: 'BRONZE', xpReward: 25, event: 'EXPENSE_LOGGED' },
  { key: 'early_bird', name: 'Early Bird', description: 'Log an expense before 7 AM', icon: '🐦', category: 'SPECIAL', tier: 'BRONZE', xpReward: 25, event: 'EXPENSE_LOGGED' },
  { key: 'no_spend_day', name: 'No Spend Day', description: 'Go a full day without spending', icon: '🧘', category: 'SPECIAL', tier: 'BRONZE', xpReward: 30, event: 'DAILY_CHECK' },
  { key: 'holiday_saver', name: 'Holiday Saver', description: 'Save money during a holiday month', icon: '🎄', category: 'SPECIAL', tier: 'SILVER', xpReward: 75, event: 'SAVINGS_UPDATED' },
  { key: 'weekend_warrior', name: 'Weekend Warrior', description: 'Log expenses on 4 consecutive weekends', icon: '🗡️', category: 'SPECIAL', tier: 'BRONZE', xpReward: 50, event: 'EXPENSE_LOGGED' },
  { key: 'debt_slayer', name: 'Debt Slayer', description: 'Pay off a credit card balance', icon: '🗡️', category: 'SPECIAL', tier: 'SILVER', xpReward: 100, event: 'SAVINGS_UPDATED' },
  { key: 'big_spender_aware', name: 'Big Spender Aware', description: 'Log a single expense over ₱10,000', icon: '💸', category: 'SPECIAL', tier: 'BRONZE', xpReward: 25, event: 'EXPENSE_LOGGED' },
  { key: 'minimalist', name: 'Minimalist', description: 'Keep expenses under 10 for a month', icon: '🍃', category: 'SPECIAL', tier: 'SILVER', xpReward: 75, event: 'DAILY_CHECK' },
  { key: 'diversified', name: 'Diversified', description: 'Have 3+ active savings goals', icon: '🌈', category: 'SPECIAL', tier: 'SILVER', xpReward: 75, event: 'SAVINGS_UPDATED' },
  { key: 'streak_saver', name: 'Streak Saver', description: 'Use a streak freeze successfully', icon: '🧊', category: 'SPECIAL', tier: 'BRONZE', xpReward: 25, event: 'STREAK_FREEZE_USED' },
];
