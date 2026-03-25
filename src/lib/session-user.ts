import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function resolveAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return {
      response: NextResponse.json({ error: 'User not found' }, { status: 404 }),
    };
  }

  return { user };
}