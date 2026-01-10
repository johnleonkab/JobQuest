"use client";

import { useState } from "react";
import type { CVEducation } from "@/types/cv";
import EducationModal from "./modals/EducationModal";
import { useTranslations } from "next-intl";

interface EducationSectionProps {
  education: CVEducation[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function EducationSection({
  education,
  onAdd,
  onUpdate,
}: EducationSectionProps) {
  const t = useTranslations('CVBuilder.sections.education');
  const tCommon = useTranslations('CVBuilder.common');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que education sea siempre un array
  const safeEducation = Array.isArray(education) ? education : [];

  const formatDate = (date: string | null) => {
    if (!date) return tCommon('present');
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
    });
  };

  const formatDateRange = (start: string, end: string | null, isOngoing: boolean) => {
    if (isOngoing || !end) {
      return `${formatDate(start)} - ${tCommon('present')}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getInitials = (institution: string) => {
    return institution
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined">school</span>
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
          {safeEducation.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              {t('empty')}
            </p>
          ) : (
            safeEducation.map((edu, idx) => (
              <div
                key={edu.id}
                className={`flex gap-4 items-start ${idx > 0 ? "pt-4 border-t border-gray-50" : ""
                  }`}
              >
                <div className="size-12 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center border border-gray-100">
                  <span className="text-lg font-bold text-gray-400">
                    {getInitials(edu.institution)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{edu.title}</h4>
                    <span className="text-xs text-gray-400">
                      {formatDateRange(edu.start_date, edu.end_date, edu.is_ongoing)}
                    </span>
                  </div>
                  <p className="text-sm text-purple-500 font-medium">{edu.institution}</p>
                  {edu.notes && (
                    <p className="text-sm text-gray-500 mt-1">{edu.notes}</p>
                  )}
                  {edu.skills && edu.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {edu.skills.map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setEditingId(edu.id)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    {tCommon('edit')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingId && (
        <EducationModal
          educationId={editingId}
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

