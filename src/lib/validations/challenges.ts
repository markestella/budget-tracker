import { z } from 'zod';

export const challengeJoinSchema = z.object({});

export const challengeTrackSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

export type ChallengeTrackInput = z.infer<typeof challengeTrackSchema>;

export const challengeLeaderboardQuerySchema = z.object({
  period: z.enum(['MONTHLY', 'ALL_TIME']).optional().default('MONTHLY'),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type ChallengeLeaderboardQueryInput = z.infer<typeof challengeLeaderboardQuerySchema>;
