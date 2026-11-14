import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminCredentials, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const auth = await authenticateAdminCredentials(username, password);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({
      success: true,
      username,
      message: 'Admin authenticated successfully',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
