import { getUserProfile, getUser } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get email from auth user if not in profile
    const user = await getUser();
    const profileWithEmail = {
      ...profile,
      email: profile.email || user?.email || null,
    };
    
    return NextResponse.json(profileWithEmail);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

