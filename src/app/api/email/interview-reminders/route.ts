import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, generateInterviewReminderEmail } from '@/lib/email';
import { logger } from '@/lib/utils/logger';

/**
 * Interview reminders endpoint
 * Should be called by a cron job daily to check for interviews 24h ahead
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a trusted source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
    
    // Allow if: Vercel cron secret is present OR custom cron secret matches
    if (cronSecret && !vercelCronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Calculate 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    // Range: 23.5 to 24.5 hours from now (1 hour window)
    const startTime = new Date(tomorrow);
    startTime.setMinutes(startTime.getMinutes() - 30);
    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    // Get interviews scheduled in the next 24 hours
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select(`
        *,
        job_offers!inner (
          id,
          company_name,
          position
        )
      `)
      .gte('scheduled_at', startTime.toISOString())
      .lte('scheduled_at', endTime.toISOString())
      .eq('status', 'scheduled');

    if (interviewsError) {
      logger.error('Error fetching interviews for reminders', interviewsError);
      return NextResponse.json({ error: 'Error fetching interviews' }, { status: 500 });
    }

    if (!interviews || interviews.length === 0) {
      return NextResponse.json({ message: 'No interviews to remind about' });
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const interview of interviews) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, first_name')
          .eq('id', interview.user_id)
          .single();

        if (!profile || !profile.email) {
          logger.warn(`No email found for user ${interview.user_id}`);
          continue;
        }

        const userName = profile.full_name || profile.first_name || profile.email.split('@')[0];
        const jobOffer = interview.job_offers as any;

        const emailHtml = generateInterviewReminderEmail(userName, {
          title: interview.title || 'Entrevista',
          scheduledAt: interview.scheduled_at,
          interviewType: interview.interview_type || 'Presencial',
          location: interview.location || undefined,
          jobOfferTitle: jobOffer?.position,
          jobOfferCompany: jobOffer?.company_name,
          jobOfferId: jobOffer?.id,
        });

        const emailSent = await sendEmail({
          to: profile.email,
          subject: `📅 Recordatorio: Entrevista mañana - ${interview.title || 'Entrevista'}`,
          html: emailHtml,
        });

        if (emailSent) {
          emailsSent++;
          
          // Mark interview as reminder sent (optional - you might want to add a field for this)
          // await supabase
          //   .from('interviews')
          //   .update({ reminder_sent: true })
          //   .eq('id', interview.id);
        } else {
          emailsFailed++;
        }
      } catch (error) {
        logger.error(`Error sending interview reminder for interview ${interview.id}`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      message: 'Interview reminders sent',
      emailsSent,
      emailsFailed,
      totalInterviews: interviews.length,
    });
  } catch (error) {
    logger.error('Error in interview reminders endpoint', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

