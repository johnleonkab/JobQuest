"use client";

import { useState } from "react";
import type { CVLanguage, CVCertification } from "@/types/cv";
import LanguageModal from "./modals/LanguageModal";
import { useTranslations } from "next-intl";

interface LanguagesSectionProps {
  languages: CVLanguage[];
  certifications: CVCertification[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function LanguagesSection({
  languages,
  certifications,
  onAdd,
  onUpdate,
}: LanguagesSectionProps) {
  const t = useTranslations('CVBuilder.sections.languages');
  const tCommon = useTranslations('CVBuilder.common');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que languages sea siempre un array
  const safeLanguages = Array.isArray(languages) ? languages : [];

  const getLevelPercentage = (level: string) => {
    const levelMap: Record<string, number> = {
      "Nativo": 100,
      "C2": 95,
      "C1": 85,
      "B2": 70,
      "B1": 55,
      "A2": 40,
      "A1": 25,
    };
    return levelMap[level] || 50;
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <span className="material-symbols-outlined">translate</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('title')}</h3>
          </div>
          <button
            onClick={onAdd}
            className="text-primary/70 hover:text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
        <div className="space-y-4">
          {safeLanguages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              {t('empty')}
            </p>
          ) : (
            safeLanguages.map((lang) => {
              const percentage = getLevelPercentage(lang.level);
              return (
                <div key={lang.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                    <span className="text-xs text-gray-500">{lang.level}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-orange-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setEditingId(lang.id)}
                    className="mt-1 text-xs text-primary hover:underline"
                  >
                    {tCommon('edit')}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingId && (
        <LanguageModal
          languageId={editingId}
          certifications={certifications}
          onClose={() => setEditingId(null)}
          onSuccess={() => {
            setEditingId(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

