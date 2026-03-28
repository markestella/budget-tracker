import { z } from 'zod';

// ─── Leaderboard ───────────────────────────────────────

export const leaderboardOptInSchema = z.object({
  isOptedIn: z.boolean(),
  displayName: z.string().min(2).max(30).optional().nullable(),
});

export type LeaderboardOptInInput = z.infer<typeof leaderboardOptInSchema>;

export const leaderboardQuerySchema = z.object({
  type: z.enum(['XP', 'STREAK', 'HEALTH_SCORE', 'CHALLENGES']),
  period: z.enum(['WEEKLY', 'MONTHLY', 'ALL_TIME']).optional().default('WEEKLY'),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;

// ─── Guild ─────────────────────────────────────────────

export const createGuildSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  isPublic: z.boolean().optional().default(false),
});

export type CreateGuildInput = z.infer<typeof createGuildSchema>;

export const joinGuildSchema = z.object({
  inviteCode: z.string().length(8).optional(),
});

export type JoinGuildInput = z.infer<typeof joinGuildSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const guildMessageSchema = z.object({
  content: z.string().min(1).max(500),
});

export type GuildMessageInput = z.infer<typeof guildMessageSchema>;

export const createGuildChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  targetType: z.enum(['COLLECTIVE_XP', 'COLLECTIVE_SAVINGS_DAYS', 'ALL_MEMBERS_STREAK']),
  targetValue: z.number().int().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  xpReward: z.number().int().min(0).max(1000).optional().default(50),
});

export type CreateGuildChallengeInput = z.infer<typeof createGuildChallengeSchema>;

// ─── Social Feed ───────────────────────────────────────

const ALLOWED_EMOJIS = ['👏', '🔥', '💪', '🎉'] as const;

export const feedReactionSchema = z.object({
  emoji: z.enum(ALLOWED_EMOJIS),
});

export type FeedReactionInput = z.infer<typeof feedReactionSchema>;

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;
