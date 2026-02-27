import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { query, getOne } from './db';
import { User } from './types';

const DEMO_MODE = process.env.DEMO_MODE !== 'false';
const REVIEWER_PIN = process.env.REVIEWER_PIN || '1040';

export async function getCurrentUser(): Promise<User | null> {
  if (DEMO_MODE) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('taxpilot_session')?.value;
    if (!sessionId) return null;

    return getOne<User>('SELECT * FROM users WHERE id = $1', [sessionId]);
  }
  return null;
}

export async function createDemoUser(name: string, role: 'filer' | 'reviewer' = 'filer'): Promise<User> {
  const id = uuidv4();
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@demo.taxpilot.ai`;

  await query(
    'INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
    [id, name, email, role]
  );

  return { id, name, email, role, created_at: new Date().toISOString() };
}

export function verifyReviewerPin(pin: string): boolean {
  return pin === REVIEWER_PIN;
}
