import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  // Verify user is a member
  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!membership) {
    return errorResponse('You are not a member of this guild', 403);
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true },
            },
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' },
        ],
      },
      challenges: {
        where: { status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
      },
      messages: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!guild) {
    return errorResponse('Guild not found', 404);
  }

  return jsonResponse({
    id: guild.id,
    name: guild.name,
    description: guild.description,
    inviteCode: guild.inviteCode,
    isPublic: guild.isPublic,
    maxMembers: guild.maxMembers,
    createdAt: guild.createdAt,
    myRole: membership.role,
    members: guild.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    challenges: guild.challenges,
    messages: guild.messages.reverse().map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      userName: msg.user.name,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  });
}
