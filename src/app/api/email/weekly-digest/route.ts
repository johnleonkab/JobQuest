import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, generateWeeklyDigestEmail } from '@/lib/email';
import { logger } from '@/lib/utils/logger';

/**
 * Weekly digest email endpoint
 * Should be called by a cron job every Monday
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a trusted source (cron job, etc.)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
    
    // Allow if: Vercel cron secret is present OR custom cron secret matches
    if (cronSecret && !vercelCronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Get all active users (users who have logged in recently)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, xp, level')
      .not('email', 'is', null);

    if (usersError) {
      logger.error('Error fetching users for weekly digest', usersError);
      return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to send digest to' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of users) {
      try {
        // Get user's activity from the last week
        const { data: events } = await supabase
          .from('gamification_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgoISO);

        // Calculate XP gained this week
        const xpGained = events?.reduce((sum, event) => sum + (event.xp_gained || 0), 0) || 0;

        // Get badges earned this week
        const { data: badges } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .gte('earned_at', oneWeekAgoISO);

        // Get job offers added this week
        const { data: jobOffers } = await supabase
          .from('job_offers')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgoISO);

        // Get interviews this week
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const { data: interviews } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_id', user.id)
          .gte('scheduled_at', now.toISOString())
          .lte('scheduled_at', nextWeek.toISOString());

        // Get CV sections updated this week
        // This is a simplified check - in production you might want to track this more precisely
        const cvSectionsUpdated = 0; // Placeholder

        const userName = user.full_name || user.first_name || user.email?.split('@')[0] || 'Usuario';

        const digestData = {
          xpGained,
          currentLevel: user.level || 1,
          badgesEarned: badges?.length || 0,
          jobOffersAdded: jobOffers?.length || 0,
          interviewsThisWeek: interviews?.length || 0,
          cvSectionsUpdated,
        };

        const emailHtml = generateWeeklyDigestEmail(userName, digestData);

        const emailSent = await sendEmail({
          to: user.email!,
          subject: '📊 Tu Resumen Semanal - JobQuest',
          html: emailHtml,
        });

        if (emailSent) {
          emailsSent++;
        } else {
          emailsFailed++;
        }
      } catch (error) {
        logger.error(`Error sending weekly digest to user ${user.id}`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      message: 'Weekly digest sent',
      emailsSent,
      emailsFailed,
      totalUsers: users.length,
    });
  } catch (error) {
    logger.error('Error in weekly digest endpoint', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

