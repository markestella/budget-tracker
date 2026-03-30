import { randomBytes } from 'crypto';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createGuildSchema } from '@/lib/validations/social';
import { awardXP } from '@/lib/game/xpService';
// import { createAchievementEvent } from '@/lib/social/achievementEvents';
import { NextRequest } from 'next/server';

// POST — create guild
export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  const body = await req.json();
  const validation = validateRequest(createGuildSchema, body);
  if ('error' in validation) return validation.error;
  const { name, description, isPublic } = validation.data;

  // Check if user already owns 3 guilds
  const ownedCount = await prisma.guild.count({
    where: { createdById: userId },
  });
  if (ownedCount >= 3) {
    return errorResponse('You can only create up to 3 guilds', 400);
  }

  // Check name uniqueness
  const existing = await prisma.guild.findUnique({ where: { name } });
  if (existing) {
    return errorResponse('A guild with that name already exists', 409);
  }

  const inviteCode = randomBytes(4).toString('hex');

  const guild = await prisma.guild.create({
    data: {
      name,
      description: description ?? null,
      createdById: userId,
      inviteCode,
      isPublic,
      members: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  // Award XP for guild creation
  await awardXP(userId, 'CREATE_GUILD');
  // TODO: Add GUILD_CREATED to AchievementEventType enum before enabling
  // await createAchievementEvent({
  //   userId,
  //   eventType: 'GUILD_CREATED',
  //   displayText: `Created the guild "${name}"`,
  //   metadata: { guildId: guild.id, guildName: name },
  // });

  return jsonResponse(guild, { status: 201 });
}

// GET — list user's guilds
export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  const memberships = await prisma.guildMember.findMany({
    where: { userId },
    include: {
      guild: {
        include: {
          _count: { select: { members: true } },
          challenges: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: { id: true, title: true, currentValue: true, targetValue: true },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const guilds = memberships.map((m) => ({
    id: m.guild.id,
    name: m.guild.name,
    description: m.guild.description,
    isPublic: m.guild.isPublic,
    memberCount: m.guild._count.members,
    myRole: m.role,
    activeChallenge: m.guild.challenges[0] ?? null,
  }));

  return jsonResponse(guilds);
}
