import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { name, role } = await req.json();
    const userId = uuidv4();

    // In demo mode, just set a cookie — no DB needed initially
    const response = NextResponse.json({
      user: {
        id: userId,
        name: name || 'Demo User',
        email: `${(name || 'demo').toLowerCase().replace(/\s+/g, '.')}@demo.taxpilot.ai`,
        role: role || 'filer',
      },
    });

    response.cookies.set('taxpilot_session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('taxpilot_name', name || 'Demo User', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
