"use client";

import { useState } from "react";
import type { CVExperience } from "@/types/cv";
import ExperienceModal from "./modals/ExperienceModal";
import { useTranslations } from "next-intl";

interface ExperienceSectionProps {
  experiences: CVExperience[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function ExperienceSection({
  experiences,
  onAdd,
  onUpdate,
}: ExperienceSectionProps) {
  const t = useTranslations('CVBuilder.sections.experience');
  const tCommon = useTranslations('CVBuilder.common');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que experiences sea siempre un array
  const safeExperiences = Array.isArray(experiences) ? experiences : [];

  const formatDate = (date: string | null) => {
    if (!date) return tCommon('present');
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
    });
  };

  const formatDateRange = (start: string, end: string | null, isCurrent: boolean) => {
    if (isCurrent || !end) {
      return `${formatDate(start)} - ${tCommon('present')}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined">work</span>
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
        <div className="space-y-6">
          {safeExperiences.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              {t('empty')}
            </p>
          ) : (
            safeExperiences.map((exp) => (
              <div
                key={exp.id}
                className="relative pl-6 border-l-2 border-gray-100"
              >
                <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-white border-2 border-blue-200" />
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-900">{exp.position}</h4>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                  </span>
                </div>
                <p className="text-sm font-medium text-primary mb-2">
                  {exp.company_name}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{exp.description}</p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setEditingId(exp.id)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  {tCommon('edit')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {editingId && (
        <ExperienceModal
          experienceId={editingId}
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

