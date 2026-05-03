import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload) {
        // Clear the token in the DB
        await prisma.session.deleteMany({
          where: { 
            userId: payload.userId,
            refreshToken: refreshToken 
          },
        });
      }
      
      // Clear the cookie
      cookieStore.delete('refreshToken');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
