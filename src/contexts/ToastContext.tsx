"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import LevelUpNotification from "@/components/gamification/LevelUpNotification";
import BadgeEarnedNotification from "@/components/gamification/BadgeEarnedNotification";

export type ToastType = "success" | "error" | "info" | "xp";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  xpGained?: number;
  levelUp?: boolean;
  newLevel?: number;
  duration?: number;
}

interface LevelUpData {
  newLevel: number;
  currentXp: number;
  xpGained: number;
}

interface BadgeEarnedData {
  badgeId: string;
  xpGained?: number;
}

interface ToastContextType {
  toasts: Toast[];
  levelUpData: LevelUpData | null;
  badgeEarnedData: BadgeEarnedData | null;
  showToast: (toast: Omit<Toast, "id">) => void;
  showLevelUp: (data: LevelUpData) => void;
  showBadgeEarned: (data: BadgeEarnedData) => void;
  removeToast: (id: string) => void;
  closeLevelUp: () => void;
  closeBadgeEarned: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [badgeEarnedData, setBadgeEarnedData] = useState<BadgeEarnedData | null>(null);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4000;
    const newToast: Toast = {
      ...toast,
      id,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const showLevelUp = useCallback((data: LevelUpData) => {
    setLevelUpData(data);
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUpData(null);
  }, []);

  const showBadgeEarned = useCallback((data: BadgeEarnedData) => {
    setBadgeEarnedData(data);
    // Auto-close after 8 seconds
    setTimeout(() => {
      setBadgeEarnedData(null);
    }, 8000);
  }, []);

  const closeBadgeEarned = useCallback(() => {
    setBadgeEarnedData(null);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        levelUpData,
        badgeEarnedData,
        showToast,
        showLevelUp,
        showBadgeEarned,
        removeToast,
        closeLevelUp,
        closeBadgeEarned,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {levelUpData && (
        <LevelUpNotification
          newLevel={levelUpData.newLevel}
          currentXp={levelUpData.currentXp}
          xpGained={levelUpData.xpGained}
          onClose={closeLevelUp}
        />
      )}
      {badgeEarnedData && (
        <BadgeEarnedNotification
          badgeId={badgeEarnedData.badgeId}
          xpGained={badgeEarnedData.xpGained}
          onClose={closeBadgeEarned}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "xp":
        return "bg-primary/10 border-primary/30 text-primary";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "xp":
        return "bolt";
      case "info":
      default:
        return "info";
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg min-w-[300px] max-w-[400px] animate-in ${getToastStyles()}`}
    >
      <span className="material-symbols-outlined text-xl flex-shrink-0">
        {getIcon()}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.xpGained && (
          <p className="text-xs mt-0.5 opacity-80">
            +{toast.xpGained} XP ganados
          </p>
        )}
        {toast.levelUp && toast.newLevel && (
          <p className="text-xs mt-0.5 font-bold">
            ¡Subiste al nivel {toast.newLevel}!
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

