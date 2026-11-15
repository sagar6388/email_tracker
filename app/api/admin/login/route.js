// app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import { verifyPassword, getExpectedToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { password } = await req.json().catch(() => ({}));

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    const token = getExpectedToken();
    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

    response.cookies.set('admin_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
