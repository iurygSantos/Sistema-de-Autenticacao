import { cookies } from 'next/headers';
import { verifyRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    redirect('/login');
  }

  const payload = verifyRefreshToken(refreshToken) as { userId: string } | null;
  
  if (!payload) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
