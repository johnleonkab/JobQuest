/**
 * Utilidades para el sistema de gamificación
 */

import { getCurrentLevel, getNextLevel, getLevelProgress } from '@/config/gamification/levels';
import { getAllBadges, isBadgeEarned, getBadgeProgress } from '@/config/gamification/badges';
import { getEvent } from '@/config/gamification/events';

/**
 * Calcula el nivel y progreso del usuario basado en su XP
 */
export function calculateUserLevel(userXp: number) {
  const currentLevel = getCurrentLevel(userXp);
  const nextLevel = getNextLevel(userXp);
  const progress = getLevelProgress(userXp);

  return {
    currentLevel,
    nextLevel,
    progress,
    xp: userXp,
    xpForNextLevel: nextLevel ? nextLevel.requiredXp - userXp : 0,
    totalXpForNextLevel: nextLevel ? nextLevel.requiredXp - currentLevel.requiredXp : 0,
  };
}

/**
 * Verifica qué badges ha obtenido el usuario
 */
export function checkUserBadges(eventCounts: Record<string, number>) {
  const allBadges = getAllBadges();
  const earnedBadges: string[] = [];
  const badgeProgress: Record<string, number> = {};

  allBadges.forEach((badge) => {
    const progress = getBadgeProgress(badge, eventCounts);
    badgeProgress[badge.id] = progress;

    if (isBadgeEarned(badge, eventCounts)) {
      earnedBadges.push(badge.id);
    }
  });

  return {
    earnedBadges,
    badgeProgress,
  };
}

/**
 * Obtiene el XP que se otorgará por un evento
 */
export function getXpForEvent(eventId: string): number {
  const event = getEvent(eventId);
  return event?.xpReward || 0;
}


