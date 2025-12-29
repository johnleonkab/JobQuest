"use client";

import { useToast } from "@/contexts/ToastContext";
import { useGamification } from "@/hooks/useGamification";
import { getAllBadges } from "@/config/gamification/badges";

export default function TestToastsPage() {
  const { showToast, showLevelUp, showBadgeEarned } = useToast();
  const { recordEvent } = useGamification();
  const badges = getAllBadges();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        Prueba de Toasts
      </h1>

      <div className="space-y-6">
        {/* Toast Básicos */}
        <section className="bg-white dark:bg-[#2d1b22] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Toasts Básicos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                showToast({
                  type: "success",
                  message: "¡Operación exitosa!",
                  duration: 4000,
                })
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() =>
                showToast({
                  type: "error",
                  message: "Ha ocurrido un error",
                  duration: 4000,
                })
              }
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() =>
                showToast({
                  type: "info",
                  message: "Esta es una notificación informativa",
                  duration: 4000,
                })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Info Toast
            </button>
            <button
              onClick={() =>
                showToast({
                  type: "xp",
                  message: "Has ganado XP",
                  xpGained: 50,
                  duration: 4000,
                })
              }
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              XP Toast
            </button>
          </div>
        </section>

        {/* Level Up Notification */}
        <section className="bg-white dark:bg-[#2d1b22] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Notificación de Level Up
          </h2>
          <button
            onClick={() =>
              showLevelUp({
                newLevel: 5,
                currentXp: 1250,
                xpGained: 50,
              })
            }
            className="px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Mostrar Level Up
          </button>
        </section>

        {/* Badge Notifications */}
        <section className="bg-white dark:bg-[#2d1b22] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Notificaciones de Badges
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.slice(0, 6).map((badge) => (
              <button
                key={badge.id}
                onClick={() =>
                  showBadgeEarned({
                    badgeId: badge.id,
                    xpGained: 50,
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
              >
                Badge: {badge.name}
              </button>
            ))}
          </div>
        </section>

        {/* Gamification Events */}
        <section className="bg-white dark:bg-[#2d1b22] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Eventos de Gamificación (con toasts automáticos)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => recordEvent("profile.updated")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Profile Updated
            </button>
            <button
              onClick={() => recordEvent("cv.experience_added")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Experience Added
            </button>
            <button
              onClick={() => recordEvent("cv.education_added")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Education Added
            </button>
            <button
              onClick={() => recordEvent("cv.certification_added")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Certification Added
            </button>
          </div>
        </section>

        {/* Instrucciones */}
        <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Instrucciones
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Los toasts básicos aparecen en la esquina superior derecha</li>
            <li>Las notificaciones de Level Up aparecen en la parte superior derecha</li>
            <li>Las notificaciones de Badges aparecen en la esquina inferior derecha</li>
            <li>Los eventos de gamificación mostrarán toasts automáticamente si hay XP ganado</li>
            <li>Todos los toasts se cierran automáticamente después de su duración</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

