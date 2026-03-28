import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { leaderboardOptInSchema } from '@/lib/validations/social';

export async function PUT(req: Request) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const result = validateRequest(leaderboardOptInSchema, body);
  if ('error' in result) return result.error;

  const { isOptedIn, displayName } = result.data;

  const optIn = await prisma.leaderboardOptIn.upsert({
    where: { userId: auth.user.id },
    create: {
      userId: auth.user.id,
      isOptedIn,
      displayName: displayName ?? null,
    },
    update: {
      isOptedIn,
      ...(displayName !== undefined ? { displayName } : {}),
    },
  });

  return jsonResponse(optIn);
}

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const optIn = await prisma.leaderboardOptIn.findUnique({
    where: { userId: auth.user.id },
  });

  return jsonResponse(optIn ?? { isOptedIn: false, displayName: null });
}
