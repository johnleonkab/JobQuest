"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";
import { getEvent } from "@/config/gamification/events";

/**
 * Hook para registrar eventos de gamificación
 * 
 * @example
 * const { recordEvent, loading } = useGamification();
 * 
 * // Registrar un evento cuando el usuario completa una acción
 * await recordEvent('cv.section_added');
 */
export function useGamification() {
  const [loading, setLoading] = useState(false);
  const { showToast, showLevelUp, showBadgeEarned } = useToast();

  const recordEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/gamification/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error("Failed to record event");
      }

      const result = await response.json();
      const event = getEvent(eventId);

      // Si hay level up, obtener el progreso actualizado y mostrar notificación especial
      if (result.levelUp && result.newLevel) {
        // Obtener el progreso actualizado para tener el XP total
        const progressResponse = await fetch("/api/gamification/progress");
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          showLevelUp({
            newLevel: result.newLevel,
            currentXp: progress.xp,
            xpGained: result.xpEarned,
          });
        } else {
          // Fallback si no se puede obtener el progreso
          showLevelUp({
            newLevel: result.newLevel,
            currentXp: 0, // Se actualizará cuando se refresque el sidebar
            xpGained: result.xpEarned,
          });
        }
      } else if (event && result.xpEarned) {
        // Mostrar toast normal con XP ganado (sin level up)
        showToast({
          type: "xp",
          message: event.name,
          xpGained: result.xpEarned,
          duration: 4000,
        });
      }

      // Mostrar notificaciones de badges obtenidos
      if (result.newBadges && result.newBadges.length > 0) {
        // Mostrar notificación para cada badge obtenido
        // Si hay múltiples badges, mostrar el primero inmediatamente
        // y los demás después de un delay
        result.newBadges.forEach((badgeId: string, index: number) => {
          setTimeout(() => {
            showBadgeEarned({
              badgeId,
              xpGained: result.xpEarned, // Mostrar XP ganado si aplica
            });
          }, index * 2000); // Delay de 2 segundos entre cada badge
        });
      }

      // Emitir evento personalizado para refrescar el sidebar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("gamification:updated"));
      }

      return result;
    } catch (error) {
      console.error("Error recording event:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast, showLevelUp, showBadgeEarned]);

  return {
    recordEvent,
    loading,
  };
}

