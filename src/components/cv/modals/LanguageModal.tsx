"use client";

import { useState, useEffect } from "react";
import type { CVLanguage, CVCertification } from "@/types/cv";
import { useToast } from "@/contexts/ToastContext";

interface LanguageModalProps {
  languageId?: string;
  certifications?: CVCertification[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function LanguageModal({
  languageId,
  certifications = [],
  onClose,
  onSuccess,
}: LanguageModalProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    language: "",
    level: "",
    certification_id: "",
  });

  useEffect(() => {
    if (languageId) {
      fetchLanguage();
    }
  }, [languageId]);

  const fetchLanguage = async () => {
    try {
      const response = await fetch("/api/cv/languages");
      const languages: CVLanguage[] = await response.json();
      const lang = languages.find((l) => l.id === languageId);
      if (lang) {
        setFormData({
          language: lang.language,
          level: lang.level,
          certification_id: lang.certification_id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching language:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = languageId
        ? {
            id: languageId,
            language: formData.language,
            level: formData.level,
            certification_id: formData.certification_id || null,
          }
        : {
            language: formData.language,
            level: formData.level,
            certification_id: formData.certification_id || null,
          };

      const response = await fetch("/api/cv/languages", {
        method: languageId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save language");

      showToast({
        type: "success",
        message: languageId
          ? "Idioma actualizado correctamente"
          : "Idioma agregado correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving language:", error);
      showToast({
        type: "error",
        message: "Error al guardar el idioma",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">translate</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Idioma</h3>
                <p className="text-xs text-gray-500">
                  {languageId ? "Edita" : "Añade"} un idioma
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Idioma *
                </label>
                <input
                  required
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Inglés, Español, Francés..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nivel *
                </label>
                <input
                  required
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Nativo, C1, B2, Intermedio..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Certificación (opcional)
                </label>
                <select
                  value={formData.certification_id}
                  onChange={(e) =>
                    setFormData({ ...formData, certification_id: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                >
                  <option value="">Sin certificación</option>
                  {certifications.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Idioma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

