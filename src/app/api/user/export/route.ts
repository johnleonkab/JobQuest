import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/actions';
import { logger } from '@/lib/utils/logger';

/**
 * Export all user data in JSON format (GDPR compliance)
 * GET /api/user/export?format=json
 * GET /api/user/export?format=csv
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();
    const format = request.nextUrl.searchParams.get('format') || 'json';

    // Fetch all user data
    const exportData: any = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
    };

    // 1. Profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logger.error('Error fetching profile for export', profileError);
    }
    exportData.profile = profile || null;

    // 2. CV Data
    const [education, experience, certifications, languages, volunteering, projects] = await Promise.all([
      supabase.from('cv_education').select('*').eq('user_id', user.id),
      supabase.from('cv_experience').select('*').eq('user_id', user.id),
      supabase.from('cv_certifications').select('*').eq('user_id', user.id),
      supabase.from('cv_languages').select('*').eq('user_id', user.id),
      supabase.from('cv_volunteering').select('*').eq('user_id', user.id),
      supabase.from('cv_projects').select('*').eq('user_id', user.id),
    ]);

    exportData.cv = {
      education: education.data || [],
      experience: experience.data || [],
      certifications: certifications.data || [],
      languages: languages.data || [],
      volunteering: volunteering.data || [],
      projects: projects.data || [],
    };

    // 3. Job Offers
    const { data: jobOffers } = await supabase
      .from('job_offers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    exportData.jobOffers = jobOffers || [];

    // 4. Interviews
    const { data: interviews } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false });

    exportData.interviews = interviews || [];

    // 5. Contacts
    const { data: contacts } = await supabase
      .from('job_offer_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    exportData.contacts = contacts || [];

    // 6. Gamification data
    // Check if user_badges table exists (might be named differently)
    const { data: badges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    // Try gamification_events first, fallback to user_events
    let events: any[] = [];
    const { data: gamificationEvents } = await supabase
      .from('gamification_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (gamificationEvents) {
      events = gamificationEvents;
    } else {
      // Fallback to user_events if gamification_events doesn't exist
      const { data: userEvents } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000);
      events = userEvents || [];
    }

    exportData.gamification = {
      currentLevel: profile?.level || 1,
      currentXp: profile?.xp || 0,
      badges: badges || [],
      recentEvents: events || [],
    };

    // 7. AI Insights
    const { data: aiInsights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    exportData.aiInsights = aiInsights || [];

    // Return data in requested format
    if (format === 'csv') {
      // For CSV, we'll return a simplified version of tabular data
      // This is a basic implementation - you might want to expand it
      const csvData = convertToCSV(exportData);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="jobquest-export-${user.id}-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON format
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jobquest-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    logger.error('Error exporting user data', error);
    return NextResponse.json(
      { error: 'Error exporting data' },
      { status: 500 }
    );
  }
}

/**
 * Convert export data to CSV format (simplified)
 */
function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  // Profile
  if (data.profile) {
    lines.push('Section,Field,Value');
    lines.push('Profile,Email,' + (data.profile.email || ''));
    lines.push('Profile,Full Name,' + (data.profile.full_name || ''));
    lines.push('Profile,Level,' + (data.profile.level || ''));
    lines.push('Profile,XP,' + (data.profile.xp || ''));
    lines.push('');
  }

  // CV Sections
  if (data.cv.experience?.length > 0) {
    lines.push('CV Experience');
    lines.push('Company,Position,Start Date,End Date,Description');
    data.cv.experience.forEach((exp: any) => {
      lines.push([
        exp.company_name || '',
        exp.position || '',
        exp.start_date || '',
        exp.end_date || '',
        (exp.description || '').replace(/,/g, ';'),
      ].join(','));
    });
    lines.push('');
  }

  if (data.cv.education?.length > 0) {
    lines.push('CV Education');
    lines.push('Institution,Title,Start Date,End Date');
    data.cv.education.forEach((edu: any) => {
      lines.push([
        edu.institution || '',
        edu.title || '',
        edu.start_date || '',
        edu.end_date || '',
      ].join(','));
    });
    lines.push('');
  }

  // Job Offers
  if (data.jobOffers?.length > 0) {
    lines.push('Job Offers');
    lines.push('Company,Position,Status,Application Date,Notes');
    data.jobOffers.forEach((offer: any) => {
      lines.push([
        offer.company_name || '',
        offer.position || '',
        offer.status || '',
        offer.application_date || '',
        (offer.notes || '').replace(/,/g, ';'),
      ].join(','));
    });
  }

  return lines.join('\n');
}

