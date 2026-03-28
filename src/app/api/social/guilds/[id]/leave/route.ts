import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!membership) {
    return errorResponse('Not a member of this guild', 404);
  }

  if (membership.role === 'OWNER') {
    // Transfer ownership to the next admin, or oldest member
    const nextOwner = await prisma.guildMember.findFirst({
      where: {
        guildId,
        userId: { not: userId },
      },
      orderBy: [
        { role: 'asc' }, // ADMIN comes before MEMBER alphabetically
        { joinedAt: 'asc' },
      ],
    });

    if (!nextOwner) {
      // Last member — delete the guild
      await prisma.guildMessage.deleteMany({ where: { guildId } });
      await prisma.guildChallenge.deleteMany({ where: { guildId } });
      await prisma.guildMember.deleteMany({ where: { guildId } });
      await prisma.guild.delete({ where: { id: guildId } });
      return jsonResponse({ message: 'Guild disbanded (you were the last member)' });
    }

    // Transfer ownership and remove the leaving member
    await prisma.$transaction([
      prisma.guildMember.update({
        where: { id: nextOwner.id },
        data: { role: 'OWNER' },
      }),
      prisma.guildMember.delete({
        where: { guildId_userId: { guildId, userId } },
      }),
    ]);

    return jsonResponse({ message: 'Left guild. Ownership transferred.' });
  }

  // Non-owner just leaves
  await prisma.guildMember.delete({
    where: { guildId_userId: { guildId, userId } },
  });

  return jsonResponse({ message: 'Left guild' });
}
