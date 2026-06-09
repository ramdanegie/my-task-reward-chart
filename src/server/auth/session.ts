import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/server/db';
import { verifyChildToken } from './childSession';

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  return session.user.id;
}

/** Throws if the child does not belong to the logged-in parent. */
export async function assertChildOwnership(childId: string, userId: string): Promise<void> {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId: userId } });
  if (!child) throw new Error('FORBIDDEN');
}

export async function getChildSessionId(): Promise<string | null> {
  const token = (await cookies()).get('child_session')?.value;
  if (!token) return null;
  return verifyChildToken(token, process.env.CHILD_SESSION_SECRET ?? '');
}
