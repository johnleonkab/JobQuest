import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/auth/actions';
import { sendEmail, generateWelcomeEmail } from '@/lib/email';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'signup' or 'recovery'
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Ensure profile exists
    const profile = await getUserProfile();
    
    // Check if this is a new user (first time login or signup confirmation)
    if (profile) {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Send welcome email for new signups (either from OAuth or email confirmation)
      if (user && user.email) {
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        
        // Send welcome email if:
        // 1. User was created in the last 5 minutes, OR
        // 2. This is an email confirmation (type === 'signup')
        if ((minutesSinceCreation < 5 || type === 'signup') && user.email) {
          try {
            const userName = profile.full_name || profile.first_name || user.email.split('@')[0];
            const welcomeEmailHtml = generateWelcomeEmail(userName, user.email);
            
            await sendEmail({
              to: user.email,
              subject: `¡Bienvenido a JobQuest, ${userName}! 🎉`,
              html: welcomeEmailHtml,
            });
          } catch (error) {
            // Don't block the login flow if email fails
            console.error('Error sending welcome email:', error);
          }
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

