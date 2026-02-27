import { NextRequest, NextResponse } from 'next/server';

// In-memory review store for demo mode
const reviewItems = new Map<string, {
  id: string;
  session_id: string;
  user_name: string;
  field_name: string;
  field_value: string;
  reason: string;
  confidence: number;
  status: string;
  reviewer_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}>();

// Seed demo data
reviewItems.set('1', {
  id: '1', session_id: 'demo-session', user_name: 'Demo User',
  field_name: 'Filing Status Optimization', field_value: 'single',
  reason: 'User may qualify for Head of Household status \u2014 has dependent child',
  confidence: 0.68, status: 'pending', reviewer_notes: null,
  resolved_at: null, created_at: new Date().toISOString(),
});
reviewItems.set('2', {
  id: '2', session_id: 'demo-session', user_name: 'Demo User',
  field_name: 'Charitable Deduction Verification', field_value: '$5,200',
  reason: 'Amount exceeds typical range for income level \u2014 verify receipts',
  confidence: 0.45, status: 'pending', reviewer_notes: null,
  resolved_at: null, created_at: new Date().toISOString(),
});

export async function GET() {
  const items = Array.from(reviewItems.values());
  return NextResponse.json({ items });
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, reviewer_notes } = await req.json();

    const item = reviewItems.get(id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    item.status = status;
    item.reviewer_notes = reviewer_notes || null;
    item.resolved_at = new Date().toISOString();
    reviewItems.set(id, item);

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
