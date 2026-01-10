"use client";

import { useState } from "react";
import type { CVProject } from "@/types/cv";
import ProjectModal from "./modals/ProjectModal";
import { useTranslations } from "next-intl";

interface ProjectsSectionProps {
  projects: CVProject[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function ProjectsSection({
  projects,
  onAdd,
  onUpdate,
}: ProjectsSectionProps) {
  const t = useTranslations('CVBuilder.sections.projects');
  const tCommon = useTranslations('CVBuilder.common');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que projects sea siempre un array
  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
              <span className="material-symbols-outlined">rocket_launch</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeProjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 col-span-2">
              {t('empty')}
            </p>
          ) : (
            safeProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer group/card"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 group-hover/card:text-primary transition-colors">
                    {project.name}
                  </h4>
                  {project.links && project.links.length > 0 && (
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">
                      open_in_new
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.links && project.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-white rounded text-[10px] font-medium text-gray-600 border border-gray-100 hover:border-primary/30 transition-colors"
                      >
                        {tCommon('viewProject')}
                      </a>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setEditingId(project.id)}
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
        <ProjectModal
          projectId={editingId}
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

