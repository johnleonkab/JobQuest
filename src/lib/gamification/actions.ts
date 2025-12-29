'use server';

import { createClient } from '@/lib/supabase/server';
import { getXpForEvent } from '@/lib/gamification/utils';
import { getEvent } from '@/config/gamification/events';
import { calculateUserLevel, checkUserBadges } from '@/lib/gamification/utils';
import { getAllBadges, getBadge } from '@/config/gamification/badges';
import { sendEmail, generateAchievementEmail } from '@/lib/email';

/**
 * Registra un evento de gamificación y otorga XP al usuario
 */
export async function recordEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const event = getEvent(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const xpReward = event.xpReward;

    // Insert event record
    const { error: eventError } = await supabase.from('user_events').insert({
      user_id: user.id,
      event_id: eventId,
      xp_earned: xpReward,
    });

    if (eventError) {
      throw eventError;
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(user.id);

    // Check for level up
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();

    if (profile) {
      const levelInfo = calculateUserLevel(profile.xp || 0);
      const oldLevel = profile.level || 1;
      const newLevel = levelInfo.currentLevel.order;

      if (newLevel > oldLevel) {
        // Level up occurred - send email notification
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, first_name, xp')
              .eq('id', user.id)
              .single();

            const userName = profileData?.full_name || profileData?.first_name || user.email.split('@')[0];
            const nextLevelInfo = calculateUserLevel(profileData?.xp || 0);
            
            const emailHtml = generateAchievementEmail(userName, {
              type: 'level_up',
              level: newLevel,
              nextLevelXp: nextLevelInfo.nextLevel?.requiredXp,
              currentXp: profileData?.xp || 0,
            });

            await sendEmail({
              to: user.email,
              subject: `🎉 ¡Subiste al Nivel ${newLevel}! - JobQuest`,
              html: emailHtml,
            });
          }
        } catch (error) {
          // Don't block the level up if email fails
          console.error('Error sending level up email:', error);
        }

        // Level up occurred - this will be handled by the frontend with animation
        return {
          success: true,
          xpEarned: xpReward,
          levelUp: true,
          newLevel: newLevel,
          newBadges: newBadges || [],
        };
      }
    }

    return {
      success: true,
      xpEarned: xpReward,
      levelUp: false,
      newBadges: newBadges || [],
    };
  } catch (error) {
    console.error('Error recording event:', error);
    throw error;
  }
}

/**
 * Verifica y otorga badges al usuario
 */
async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient();

  // Get all events for user grouped by event_id
  const { data: events, error: eventsError } = await supabase
    .from('user_events')
    .select('event_id')
    .eq('user_id', userId);

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
    return;
  }

  // Count events by type
  const eventCounts: Record<string, number> = {};
  events?.forEach((event) => {
    eventCounts[event.event_id] = (eventCounts[event.event_id] || 0) + 1;
  });

  // Get already earned badges
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

  // Get user profile and email for notifications
  const { data: profileData } = await supabase
    .from('profiles')
    .select('email, full_name, first_name')
    .eq('id', userId)
    .single();

  // Check all badges
  const allBadges = getAllBadges();
  const newBadges: string[] = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) {
      continue; // Already earned
    }

    // Check if badge requirements are met
    const isEarned = badge.requirements.every((req) => {
      const count = eventCounts[req.eventId] || 0;
      return count >= req.count;
    });

    if (isEarned) {
      // Award badge
      const { error: badgeError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
        });

      if (!badgeError) {
        newBadges.push(badge.id);
        
        // Send email notification for new badge
        if (profileData?.email) {
          try {
            const userName = profileData.full_name || profileData.first_name || profileData.email.split('@')[0];
            const badgeData = getBadge(badge.id);
            
            const emailHtml = generateAchievementEmail(userName, {
              type: 'badge_earned',
              badgeName: badgeData?.name || badge.id,
              badgeDescription: badgeData?.description,
              badgeIcon: badgeData?.icon,
            });

            await sendEmail({
              to: profileData.email,
              subject: `🏆 ¡Nuevo Badge Desbloqueado: ${badgeData?.name || badge.id}! - JobQuest`,
              html: emailHtml,
            });
          } catch (error) {
            // Don't block the badge award if email fails
            console.error('Error sending badge email:', error);
          }
        }
      }
    }
  }

  return newBadges;
}

/**
 * Obtiene el progreso completo de gamificación del usuario
 */
export async function getUserGamificationProgress() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile (XP and level)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const userXp = profile?.xp || 0;
    const levelInfo = calculateUserLevel(userXp);

    // Get all events for user
    const { data: events } = await supabase
      .from('user_events')
      .select('event_id')
      .eq('user_id', user.id);

    // Count events by type
    const eventCounts: Record<string, number> = {};
    events?.forEach((event) => {
      eventCounts[event.event_id] = (eventCounts[event.event_id] || 0) + 1;
    });

    // Get earned badges
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    const badgeInfo = checkUserBadges(eventCounts);

    // Create map of badge_id to earned_at
    const earnedBadgesMap: Record<string, string> = {};
    earnedBadges?.forEach((badge) => {
      earnedBadgesMap[badge.badge_id] = badge.earned_at;
    });

    return {
      xp: userXp,
      level: levelInfo.currentLevel,
      nextLevel: levelInfo.nextLevel,
      progress: levelInfo.progress,
      earnedBadges: earnedBadges?.map((b) => b.badge_id) || [],
      earnedBadgesData: earnedBadgesMap,
      badgeProgress: badgeInfo.badgeProgress,
      eventCounts,
    };
  } catch (error) {
    console.error('Error getting gamification progress:', error);
    throw error;
  }
}

