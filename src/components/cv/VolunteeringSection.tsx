"use client";

import { useState } from "react";
import type { CVVolunteering } from "@/types/cv";
import VolunteeringModal from "./modals/VolunteeringModal";

interface VolunteeringSectionProps {
  volunteering: CVVolunteering[];
  onAdd: () => void;
  onUpdate: () => void;
}

export default function VolunteeringSection({
  volunteering,
  onAdd,
  onUpdate,
}: VolunteeringSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Asegurar que volunteering sea siempre un array
  const safeVolunteering = Array.isArray(volunteering) ? volunteering : [];

  const formatDate = (date: string | null) => {
    if (!date) return "Presente";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
    });
  };

  const formatDateRange = (start: string, end: string | null, isOngoing: boolean) => {
    if (isOngoing || !end) {
      return `${formatDate(start)} - Presente`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined">volunteer_activism</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Voluntariado</h3>
          </div>
          <button
            onClick={onAdd}
            className="text-primary/70 hover:text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
        <div className="space-y-4">
          {safeVolunteering.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay voluntariados. Haz clic en el botón + para agregar uno.
            </p>
          ) : (
            safeVolunteering.map((vol) => (
              <div key={vol.id} className="flex gap-4 items-start">
                <div className="w-1.5 h-full min-h-[40px] bg-teal-100 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">{vol.title}</h4>
                    <span className="text-xs text-gray-400">
                      {formatDateRange(vol.start_date, vol.end_date, vol.is_ongoing)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-teal-600 mb-1">
                    {vol.organization}
                  </p>
                  {vol.description && (
                    <p className="text-sm text-gray-500">{vol.description}</p>
                  )}
                  <button
                    onClick={() => setEditingId(vol.id)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingId && (
        <VolunteeringModal
          volunteeringId={editingId}
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

