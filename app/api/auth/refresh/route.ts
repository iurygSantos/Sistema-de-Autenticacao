import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/contexts/AuthContext';
import { signAccessToken, verifyRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken) as { userId: string } | null;

    if (!payload) {
      cookieStore.delete('refreshToken');
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.userId !== payload.userId) {
      cookieStore.delete('refreshToken');
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const user = session.user;

    // Generate new Access Token
    const accessToken = signAccessToken({ userId: user.id, role: user.role as Role });

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
