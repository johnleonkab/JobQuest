"use client";

import { useState } from "react";
import type { JobOfferStatus, JobType } from "@/types/job-offers";

interface JobOffersFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  statuses: JobOfferStatus[];
  jobTypes: JobType[];
  salaryMin?: number;
  salaryMax?: number;
  hasNotes: boolean | null;
  hasCVSections: boolean | null;
}

const STATUS_OPTIONS: { value: JobOfferStatus; label: string }[] = [
  { value: "saved", label: "Guardadas" },
  { value: "applied", label: "Aplicadas" },
  { value: "contacted", label: "Contactadas" },
  { value: "interview", label: "Entrevista" },
  { value: "offer", label: "Oferta hecha" },
  { value: "rejected", label: "Descartada" },
  { value: "accepted", label: "Conseguida" },
];

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Tiempo Completo" },
  { value: "part-time", label: "Medio Tiempo" },
  { value: "contract", label: "Contrato" },
  { value: "internship", label: "Prácticas" },
];

export default function JobOffersFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: JobOffersFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleStatusToggle = (status: JobOfferStatus) => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleJobTypeToggle = (jobType: JobType) => {
    setLocalFilters((prev) => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter((t) => t !== jobType)
        : [...prev.jobTypes, jobType],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      statuses: [],
      jobTypes: [],
      salaryMin: undefined,
      salaryMax: undefined,
      hasNotes: null,
      hasCVSections: null,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters =
    localFilters.statuses.length > 0 ||
    localFilters.jobTypes.length > 0 ||
    localFilters.salaryMin !== undefined ||
    localFilters.salaryMax !== undefined ||
    localFilters.hasNotes !== null ||
    localFilters.hasCVSections !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    localFilters.statuses.includes(option.value)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tipo de Trabajo
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleJobTypeToggle(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    localFilters.jobTypes.includes(option.value)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rango Salarial
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={localFilters.salaryMin || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      salaryMin: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                <input
                  type="number"
                  value={localFilters.salaryMax || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      salaryMax: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Sin límite"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Filtros Adicionales
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hasNotes === true}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      hasNotes: e.target.checked ? true : null,
                    }))
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Solo con notas</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hasCVSections === true}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      hasCVSections: e.target.checked ? true : null,
                    }))
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Solo con CV personalizado</span>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpiar
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

