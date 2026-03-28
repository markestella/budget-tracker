import { NextRequest } from 'next/server';

import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { scoreQuiz } from '@/lib/game/personality/quizScorer';
import { PERSONALITY_DEFINITIONS } from '@/lib/game/personality/quizData';
import { quizSubmissionSchema } from '@/lib/validations/personality';
import { awardXP } from '@/lib/game/xpService';

export async function POST(request: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const validation = validateRequest(quizSubmissionSchema, body);
  if ('error' in validation) return validation.error;

  const { answers } = validation.data;
  const { personality, scores } = scoreQuiz(answers);

  // Check if this is the first quiz completion (for XP)
  const existingProfile = await prisma.gameProfile.findUnique({
    where: { userId: auth.user.id },
    select: { moneyPersonality: true },
  });

  const isFirstCompletion = !existingProfile?.moneyPersonality;

  // Store the result
  await prisma.gameProfile.upsert({
    where: { userId: auth.user.id },
    create: { userId: auth.user.id, moneyPersonality: personality },
    update: { moneyPersonality: personality },
  });

  // Award XP on first completion only
  let xpAwarded = 0;
  if (isFirstCompletion) {
    const result = await awardXP(auth.user.id, 'COMPLETE_PERSONALITY_QUIZ');
    xpAwarded = result.xpGained;
  }

  return jsonResponse({
    personality: PERSONALITY_DEFINITIONS[personality],
    scores,
    xpAwarded,
    isFirstCompletion,
  });
}
