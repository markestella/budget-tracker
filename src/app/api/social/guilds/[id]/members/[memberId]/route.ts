import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { updateMemberRoleSchema } from '@/lib/validations/social';

async function requireAdminOrOwner(guildId: string, userId: string) {
  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    return null;
  }
  return membership;
}

// PUT — update member role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId, memberId } = await params;

  const myMembership = await requireAdminOrOwner(guildId, userId);
  if (!myMembership) {
    return errorResponse('Requires OWNER or ADMIN role', 403);
  }

  const body = await req.json();
  const validation = validateRequest(updateMemberRoleSchema, body);
  if ('error' in validation) return validation.error;

  const target = await prisma.guildMember.findUnique({
    where: { id: memberId },
  });

  if (!target || target.guildId !== guildId) {
    return errorResponse('Member not found in this guild', 404);
  }

  if (target.role === 'OWNER') {
    return errorResponse('Cannot change the owner role', 400);
  }

  // Only owners can promote to ADMIN
  if (validation.data.role === 'ADMIN' && myMembership.role !== 'OWNER') {
    return errorResponse('Only the owner can promote to ADMIN', 403);
  }

  const updated = await prisma.guildMember.update({
    where: { id: memberId },
    data: { role: validation.data.role },
  });

  return jsonResponse(updated);
}

// DELETE — remove member
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId, memberId } = await params;

  const myMembership = await requireAdminOrOwner(guildId, userId);
  if (!myMembership) {
    return errorResponse('Requires OWNER or ADMIN role', 403);
  }

  const target = await prisma.guildMember.findUnique({
    where: { id: memberId },
  });

  if (!target || target.guildId !== guildId) {
    return errorResponse('Member not found in this guild', 404);
  }

  if (target.role === 'OWNER') {
    return errorResponse('Cannot remove the guild owner', 400);
  }

  // ADMINs can only remove MEMBERs, not other ADMINs
  if (myMembership.role === 'ADMIN' && target.role === 'ADMIN') {
    return errorResponse('Admins cannot remove other admins', 403);
  }

  await prisma.guildMember.delete({ where: { id: memberId } });

  return jsonResponse({ message: 'Member removed' });
}
