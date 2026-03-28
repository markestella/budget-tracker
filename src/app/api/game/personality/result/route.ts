import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { PERSONALITY_DEFINITIONS, type PersonalityType } from '@/lib/game/personality/quizData';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const profile = await prisma.gameProfile.findUnique({
    where: { userId: auth.user.id },
    select: { moneyPersonality: true },
  });

  if (!profile?.moneyPersonality) {
    return jsonResponse({ personality: null });
  }

  const type = profile.moneyPersonality as PersonalityType;
  const definition = PERSONALITY_DEFINITIONS[type];

  return jsonResponse({
    personality: definition ?? null,
  });
}
