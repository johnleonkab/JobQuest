"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBadge } from "@/config/gamification/badges";
import { useTranslations } from "next-intl";

interface BadgeEarnedNotificationProps {
  badgeId: string;
  xpGained?: number;
  onClose: () => void;
}

export default function BadgeEarnedNotification({
  badgeId,
  xpGained,
  onClose,
}: BadgeEarnedNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const badge = getBadge(badgeId);
  const t = useTranslations('gamification.notifications');

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleViewBadges = () => {
    router.push("/gamification");
    onClose();
  };

  if (!badge) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9998] w-full max-w-[420px] transition-all duration-500 transform translate-y-0 opacity-100 hover:-translate-y-1 ${isVisible ? "" : "hidden"
        }`}
    >
      <div className="relative flex flex-col bg-white dark:bg-[#2d1b22] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden border border-primary/20 dark:border-gray-700">
        {/* Progress / Status Bar at top */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-primary to-pink-400 w-full animate-pulse" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Header with Close Button */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md">
              <span
                className="material-symbols-outlined text-sm animate-spin"
                style={{ animationDuration: "3s" }}
              >
                star
              </span>
              {t('badgeEarned')}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Main Content Row */}
          <div className="flex gap-4 items-start">
            {/* Badge Icon */}
            <div className="shrink-0 relative">
              <div
                className="size-16 rounded-xl bg-gradient-to-tr from-primary/10 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: badge.iconColor ? `${badge.iconColor}20` : undefined }}
              >
                <span
                  className="material-symbols-outlined text-[36px] drop-shadow-sm"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    color: badge.iconColor || "#f0427c",
                  }}
                >
                  {badge.icon}
                </span>
              </div>
              {/* Sparkle decoration */}
              <span className="absolute -top-2 -right-2 text-yellow-400 material-symbols-outlined text-lg animate-bounce">
                auto_awesome
              </span>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t('badgeUnlocked')}{" "}
                <span className="text-primary">{badge.name}</span>!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-normal">
                {badge.description}
              </p>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800 mt-1">
            {xpGained && (
              <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-base">bolt</span>
                +{xpGained} XP
              </div>
            )}
            <button
              onClick={handleViewBadges}
              className="group flex items-center gap-2 bg-primary hover:bg-pink-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/30 ml-auto"
            >
              {t('viewBadges')}
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Background Glow Effect (Subtle) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

