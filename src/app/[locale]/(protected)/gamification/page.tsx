"use client";

import { useState, useEffect } from "react";
import { getAllLevels } from "@/config/gamification/levels";
import { getAllBadges } from "@/config/gamification/badges";
import { BadgeSkeleton, CardSkeleton } from "@/components/LoadingSkeleton";
import LevelCard from "@/components/gamification/LevelCard";
import BadgeCard from "@/components/gamification/BadgeCard";
import { calculateUserLevel } from "@/lib/gamification/utils";
import { useTranslations } from "next-intl";

interface GamificationProgress {
  xp: number;
  level: {
    id: string;
    name: string;
    description: string;
    icon: string;
    requiredXp: number;
    order: number;
  };
  nextLevel: {
    id: string;
    name: string;
    description: string;
    icon: string;
    requiredXp: number;
    order: number;
  } | null;
  progress: number;
  earnedBadges: string[];
  earnedBadgesData: Record<string, string>;
  badgeProgress: Record<string, number>;
  eventCounts: Record<string, number>;
}

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<"levels" | "badges">("levels");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<GamificationProgress | null>(null);
  const t = useTranslations('gamification');

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch("/api/gamification/progress");
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error("Error fetching gamification progress:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="h-8 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CardSkeleton count={4} />
          </div>
          <div className="mb-8">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
            <BadgeSkeleton count={12} />
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">{t('errorLoading')}</div>
      </div>
    );
  }

  const allLevels = getAllLevels();
  const allBadges = getAllBadges();
  const earnedBadgesSet = new Set(progress.earnedBadges);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab("levels")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "levels"
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-gray-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                stairs
              </span>
              <span>{t('tabs.levels')}</span>
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === "badges"
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-gray-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                military_tech
              </span>
              <span>{t('tabs.badges')}</span>
            </button>
          </div>
        </div>

        {activeTab === "levels" ? (
          <LevelsTab progress={progress} allLevels={allLevels} />
        ) : (
          <BadgesTab
            progress={progress}
            allBadges={allBadges}
            earnedBadgesSet={earnedBadgesSet}
            earnedBadgesData={progress.earnedBadgesData}
          />
        )}
      </div>
    </div>
  );
}

function LevelsTab({
  progress,
  allLevels,
}: {
  progress: GamificationProgress;
  allLevels: any[];
}) {
  const currentLevelOrder = progress.level.order;
  const t = useTranslations('gamification.levels');

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {t('title')}
          </h2>
          <p className="text-gray-500">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">bolt</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('totalXP')}</p>
            <p className="text-sm font-bold text-slate-900">
              {progress.xp.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        {allLevels.map((level) => {
          const isUnlocked = progress.xp >= level.requiredXp;
          const isCurrent = level.order === currentLevelOrder;

          return (
            <LevelCard
              key={level.id}
              level={level}
              isCurrent={isCurrent}
              isUnlocked={isUnlocked}
              currentXp={progress.xp}
            />
          );
        })}
      </div>
    </>
  );
}

function BadgesTab({
  progress,
  allBadges,
  earnedBadgesSet,
  earnedBadgesData,
}: {
  progress: GamificationProgress;
  allBadges: any[];
  earnedBadgesSet: Set<string>;
  earnedBadgesData: Record<string, string>;
}) {
  const earnedCount = progress.earnedBadges.length;
  const lockedCount = allBadges.length - earnedCount;
  const t = useTranslations('gamification.badges');

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {t('title')}
        </h2>
        <p className="text-gray-500 mb-6">
          {t('subtitle')}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-green-600 text-xl">
              emoji_events
            </span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{t('earned')}</p>
              <p className="text-sm font-bold text-slate-900">{earnedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-gray-400 text-xl">
              lock
            </span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{t('locked')}</p>
              <p className="text-sm font-bold text-slate-900">{lockedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        {allBadges.map((badge) => {
          const isEarned = earnedBadgesSet.has(badge.id);
          const badgeProgress = progress.badgeProgress[badge.id] || 0;

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={isEarned}
              earnedAt={earnedBadgesData[badge.id]}
              progress={badgeProgress}
              eventCounts={progress.eventCounts}
            />
          );
        })}
      </div>
    </>
  );
}
