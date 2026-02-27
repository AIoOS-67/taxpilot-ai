import { NextRequest, NextResponse } from 'next/server';
import { sendToAgent } from '@/lib/agent-client';

export async function POST(req: NextRequest) {
  try {
    const { session_id, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const response = await sendToAgent(session_id || 'demo', message);

    return NextResponse.json({
      message: response.message,
      cards: response.cards || [],
      state: response.state || null,
    });
  } catch {
    return NextResponse.json({
      message: "I'm having trouble processing your request. Please try again.",
      cards: [],
      state: null,
    }, { status: 500 });
  }
}
