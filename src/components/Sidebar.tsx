"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { useEffect, useState } from "react";

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
      console.error("Error fetching data:", error);
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
    { href: "/dashboard", label: "Inicio", icon: "home" },
    { href: "/job-openings", label: "Job Openings", icon: "work" },
    { href: "/cv-builder", label: "Mi Perfil Profesional", icon: "description" },
    { href: "/gamification", label: "Logros", icon: "emoji_events" },
  ];


  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border-light bg-white">
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
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    person
                  </span>
                </div>
              )}
              {gamification?.level && (
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {gamification.level.order}
                </div>
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
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                Nivel {gamification.level.order}
              </span>
              <span className="text-slate-500">
                {gamification.xp.toLocaleString()}{" "}
                {gamification.nextLevel
                  ? `/ ${gamification.nextLevel.requiredXp.toLocaleString()} XP`
                  : "XP"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
                style={{ width: `${gamification.progress}%` }}
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-2 w-full rounded bg-slate-200 animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-border-light p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

