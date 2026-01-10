import { getUserGamificationProgress } from '@/lib/gamification/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const progress = await getUserGamificationProgress();
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


