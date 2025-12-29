"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLevelByOrder } from "@/config/gamification/levels";

interface LevelUpNotificationProps {
  newLevel: number;
  currentXp: number;
  xpGained: number;
  onClose: () => void;
}

export default function LevelUpNotification({
  newLevel,
  currentXp,
  xpGained,
  onClose,
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const level = getLevelByOrder(newLevel);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleViewDetails = () => {
    router.push("/gamification");
    onClose();
  };

  if (!level) return null;

  return (
    <div
      className={`fixed top-24 right-4 z-[9998] w-full max-w-[380px] sm:right-8 animate-[slideIn_0.5s_ease-out_forwards] ${
        isVisible ? "" : "hidden"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_10px_40px_-5px_rgba(240,66,124,0.25)] ring-1 ring-black/5 dark:bg-[#2d151d] dark:ring-white/10">
        {/* Confetti / Decoration Layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Static confetti elements */}
          <div className="absolute top-[10%] left-[10%] size-2 bg-[#FFD700] rotate-[15deg] rounded-sm opacity-80" />
          <div className="absolute top-[15%] right-[20%] size-[6px_10px] bg-primary -rotate-[30deg] rounded opacity-80" />
          <div className="absolute bottom-[30%] left-[5%] size-[5px] bg-[#4ADE80] rotate-45 rounded-full opacity-80" />
          <div className="absolute top-[5%] right-[10%] size-2 bg-[#60A5FA] rotate-[10deg] opacity-80" />
          <div className="absolute bottom-[20%] right-[5%] size-[6px] bg-[#F472B6] -rotate-[15deg] rounded-full opacity-80" />
          <div className="absolute top-[50%] left-[2%] size-[4px_8px] bg-[#A78BFA] rotate-[60deg] opacity-80" />

          {/* Radial gradient glow */}
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          {/* Header with Close Button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-white shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                  ¡Felicidades!
                </h4>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Subiste de nivel
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="rounded-xl bg-background-light p-4 dark:bg-black/20">
            <p className="mb-3 text-sm text-slate-900 dark:text-gray-200">
              Has alcanzado el{" "}
              <span className="font-bold text-primary">
                Nivel {level.order}: {level.name}
              </span>
              . Tu dedicación está dando frutos.
            </p>

            {/* Progress Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-900 dark:text-white">
                  {currentXp.toLocaleString()} XP Totales
                </span>
                <span className="text-primary">+{xpGained} XP</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7cfd7] dark:bg-white/10">
                <div
                  className="h-full w-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleViewDetails}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Ver detalles</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

