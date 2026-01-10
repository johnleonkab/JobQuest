"use client";

import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import { signOut } from "@/lib/auth/actions";
import { useEffect, useState } from "react";
import Tooltip from "@/components/Tooltip";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  level?: number;
  xp?: number;
}

interface GamificationData {
  xp: number;
  level: {
    order: number;
  };
  nextLevel: {
    requiredXp: number;
  } | null;
  progress: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const tGamification = useTranslations('gamification.sidebar');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [userResponse, gamificationResponse] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/gamification/progress"),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      if (gamificationResponse.ok) {
        const gamificationData = await gamificationResponse.json();
        setGamification(gamificationData);
      }
    } catch (error) {
      const { logger } = await import("@/lib/utils/logger");
      logger.error("Error fetching sidebar data", error);

      // Track error
      if (typeof window !== "undefined") {
        import("@/lib/error-tracking").then(({ errorTracker }) => {
          errorTracker.captureException(
            error instanceof Error ? error : new Error(String(error)),
            { component: "Sidebar" }
          );
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Escuchar eventos de actualización de gamificación
    const handleGamificationUpdate = () => {
      fetchData();
    };

    window.addEventListener("gamification:updated", handleGamificationUpdate);

    return () => {
      window.removeEventListener("gamification:updated", handleGamificationUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { href: "/dashboard", label: t('dashboard'), icon: "home" },
    { href: "/job-openings", label: t('jobOffers'), icon: "work" },
    { href: "/cv-builder", label: t('cvBuilder'), icon: "description" },
    { href: "/gamification", label: t('gamification'), icon: "emoji_events" },
    { href: "/help", label: t('help'), icon: "help" },
    { href: "/privacy-settings", label: t('privacy'), icon: "privacy_tip" },
  ];


  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border-light bg-white lg:relative lg:translate-x-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border-light px-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md shadow-primary/20">
          <span className="material-symbols-outlined filled text-[20px]">
            diamond
          </span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          JobQuest
        </span>
      </div>

      {/* User Profile */}
      <div className="border-b border-border-light p-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
          >
            <div className="relative">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    person
                  </span>
                </div>
              )}
              {gamification?.level && (
                <Tooltip
                  content={tGamification('levelTooltip', { level: gamification.level.order, xp: gamification.xp.toLocaleString() })}
                  position="right"
                >
                  <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white cursor-help">
                    {gamification.level.order}
                  </div>
                </Tooltip>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.full_name || "Usuario"}
              </p>
              {user.headline && (
                <p className="truncate text-xs text-slate-500">
                  {user.headline}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div className="text-sm text-slate-500">No user data</div>
        )}
      </div>

      {/* Level Progress */}
      <div className="border-b border-border-light p-4">
        {gamification ? (
          <>
            <Tooltip
              content={
                gamification.nextLevel
                  ? tGamification('progress', {
                    percent: gamification.progress.toFixed(0),
                    nextLevel: gamification.level.order + 1,
                    needed: (gamification.nextLevel.requiredXp - gamification.xp).toLocaleString()
                  })
                  : tGamification('maxLevel', { xp: gamification.xp.toLocaleString() })
              }
              position="top"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                  {tGamification('level', { level: gamification.level.order })}
                </span>
                <span className="text-slate-500">
                  {gamification.xp.toLocaleString()}{" "}
                  {gamification.nextLevel
                    ? `/ ${gamification.nextLevel.requiredXp.toLocaleString()} XP`
                    : "XP"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 cursor-help">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
                  style={{ width: `${gamification.progress}%` }}
                />
              </div>
            </Tooltip>
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-2 w-full rounded bg-slate-200 animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] ${isActive
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
                }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-border-light p-4">
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
          aria-label={t('logout')}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">logout</span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

