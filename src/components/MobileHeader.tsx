"use client";

import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

import { useTranslations } from "next-intl";

interface MobileHeaderProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export default function MobileHeader({ onMenuClick, isMenuOpen }: MobileHeaderProps) {
  const t = useTranslations('mobile');

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 w-full border-b border-border-light bg-white shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={isMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md shadow-primary/20">
              <span className="material-symbols-outlined filled text-[18px]">
                diamond
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              JobQuest
            </span>
          </div>
          <div className="w-10" /> {/* Spacer para centrar */}
        </div>
      </header>
      <MobileSidebar isOpen={isMenuOpen} onClose={onMenuClick} />
    </>
  );
}

