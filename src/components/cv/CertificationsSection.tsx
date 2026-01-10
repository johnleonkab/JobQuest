"use client";

import { useState } from "react";
import type { CVCertification } from "@/types/cv";
import CertificationModal from "./modals/CertificationModal";
import { useTranslations } from "next-intl";

interface CertificationsSectionProps {
  certifications: CVCertification[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function CertificationsSection({
  certifications,
  onAdd,
  onUpdate,
}: CertificationsSectionProps) {
  const t = useTranslations('CVBuilder.sections.certifications');
  const tCommon = useTranslations('CVBuilder.common');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que certifications sea siempre un array
  const safeCertifications = Array.isArray(certifications) ? certifications : [];

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined">verified</span>
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
        <ul className="space-y-3">
          {safeCertifications.length === 0 ? (
            <li className="text-sm text-gray-400 text-center py-4">
              {t('empty')}
            </li>
          ) : (
            safeCertifications.map((cert) => (
              <li key={cert.id} className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500 text-[18px]">
                  check_circle
                </span>
                <div className="flex-1">
                  <span className="text-gray-700">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-gray-400 ml-2">- {cert.issuer}</span>
                  )}
                </div>
                <button
                  onClick={() => setEditingId(cert.id)}
                  className="text-xs text-primary hover:underline"
                >
                  {tCommon('edit')}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {editingId && (
        <CertificationModal
          certificationId={editingId}
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

