import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory session store for demo mode
const sessions = new Map<string, {
  id: string;
  user_id: string;
  status: string;
  confidence_score: number | null;
  estimated_refund: number | null;
  updated_at: string;
}>();

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('taxpilot_session')?.value;
  if (!userId) {
    return NextResponse.json({ session: null });
  }

  const session = Array.from(sessions.values()).find(s => s.user_id === userId);
  return NextResponse.json({ session: session || null });
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get('taxpilot_session')?.value || 'demo-user';

  // Find existing session or create new
  let session = Array.from(sessions.values()).find(s => s.user_id === userId);

  if (!session) {
    session = {
      id: uuidv4(),
      user_id: userId,
      status: 'intake',
      confidence_score: null,
      estimated_refund: null,
      updated_at: new Date().toISOString(),
    };
    sessions.set(session.id, session);
  }

  return NextResponse.json({
    session_id: session.id,
    messages: [], // Fresh session
  });
}
