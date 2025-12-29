"use client";

import { useState, useEffect } from "react";
import type { JobOffer, JobOfferStatus, JobType } from "@/types/job-offers";
import { useToast } from "@/contexts/ToastContext";

interface JobOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Partial<JobOffer>) => Promise<void>;
  initialStatus?: JobOfferStatus;
  offer?: JobOffer | null;
}

export default function JobOfferModal({
  isOpen,
  onClose,
  onSave,
  initialStatus,
  offer,
}: JobOfferModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    position: "",
    job_description: "",
    status: (initialStatus || offer?.status || "saved") as JobOfferStatus,
    salary_range_min: "",
    salary_range_max: "",
    job_type: "" as JobType | "",
    tags: [] as string[],
    notes: "",
    company_website: "",
    company_logo_url: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [extractingLogo, setExtractingLogo] = useState(false);

  useEffect(() => {
    if (offer) {
      setFormData({
        company_name: offer.company_name || "",
        position: offer.position || "",
        job_description: offer.job_description || "",
        status: offer.status,
        salary_range_min: offer.salary_range_min?.toString() || "",
        salary_range_max: offer.salary_range_max?.toString() || "",
        job_type: offer.job_type || "",
        tags: offer.tags || [],
        notes: offer.notes || "",
        company_website: offer.company_website || "",
        company_logo_url: offer.company_logo_url || "",
      });
    } else {
      setFormData({
        company_name: "",
        position: "",
        job_description: "",
        status: initialStatus || "saved",
        salary_range_min: "",
        salary_range_max: "",
        job_type: "",
        tags: [],
        notes: "",
        company_website: "",
        company_logo_url: "",
      });
    }
  }, [offer, initialStatus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave: Partial<JobOffer> = {
        ...formData,
        salary_range_min: formData.salary_range_min
          ? parseInt(formData.salary_range_min)
          : undefined,
        salary_range_max: formData.salary_range_max
          ? parseInt(formData.salary_range_max)
          : undefined,
        job_type: formData.job_type || undefined,
        tags: formData.tags,
        company_website: formData.company_website || undefined,
        // Don't send company_logo_url - it's auto-extracted on the server
        company_logo_url: undefined,
      };

      if (offer) {
        dataToSave.id = offer.id;
      }

      await onSave(dataToSave);
      showToast({
        type: "success",
        message: offer ? "Oferta actualizada correctamente" : "Oferta creada correctamente",
      });
      onClose();
    } catch (error) {
      console.error("Error saving job offer:", error);
      showToast({
        type: "error",
        message: "Error al guardar la oferta",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleExtractLogo = async (showNotification = true) => {
    if (!formData.company_name.trim()) {
      if (showNotification) {
        showToast({
          type: "error",
          message: "Ingresa el nombre de la empresa primero",
        });
      }
      return;
    }

    // Don't extract if logo already exists
    if (formData.company_logo_url && formData.company_logo_url.startsWith('http')) {
      return;
    }

    setExtractingLogo(true);
    try {
      // Build query params with company name and optional website
      const params = new URLSearchParams({
        company: formData.company_name,
      });
      if (formData.company_website.trim()) {
        params.append('website', formData.company_website);
      }

      const response = await fetch(
        `/api/logo-extraction?${params.toString()}`
      );
      const result = await response.json();

      if (result.logoUrl) {
        setFormData({
          ...formData,
          company_logo_url: result.logoUrl,
        });
        if (showNotification) {
          showToast({
            type: "success",
            message: "Logo extraído correctamente",
          });
        }
      } else {
        if (showNotification) {
          showToast({
            type: "error",
            message: "No se pudo encontrar el logo de la empresa",
          });
        }
      }
    } catch (error) {
      console.error("Error extracting logo:", error);
      if (showNotification) {
        showToast({
          type: "error",
          message: "Error al extraer el logo",
        });
      }
    } finally {
      setExtractingLogo(false);
    }
  };

  const handleCompanyNameBlur = async () => {
    // Auto-extract logo when user leaves the company name field
    if (formData.company_name.trim() && (!formData.company_logo_url || !formData.company_logo_url.startsWith('http'))) {
      await handleExtractLogo(false); // Don't show notification for auto-extraction
    }
  };

  const handleCompanyWebsiteBlur = async () => {
    // Auto-extract logo when user leaves the website field (if name exists but no logo)
    if (formData.company_website.trim() && formData.company_name.trim() && 
        (!formData.company_logo_url || !formData.company_logo_url.startsWith('http'))) {
      await handleExtractLogo(false); // Don't show notification for auto-extraction
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">work</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {offer ? "Editar Oferta" : "Nueva Oferta"}
                </h3>
                <p className="text-xs text-gray-500">
                  {offer ? "Modifica" : "Añade"} los detalles de la oferta
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Empresa *
                    {extractingLogo && (
                      <span className="ml-2 text-xs text-primary font-normal">
                        (Extrayendo logo...)
                      </span>
                    )}
                  </label>
                  <input
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    onBlur={handleCompanyNameBlur}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                    placeholder="Ej. Google Inc."
                    disabled={extractingLogo}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Puesto *
                  </label>
                  <input
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                    placeholder="Ej. Senior UX Designer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Web de la Empresa (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.company_website}
                  onChange={(e) =>
                    setFormData({ ...formData, company_website: e.target.value })
                  }
                  onBlur={handleCompanyWebsiteBlur}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="https://www.ejemplo.com"
                  disabled={extractingLogo}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Se usará para mejorar la búsqueda del logo si el nombre no es suficiente
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Descripción del trabajo
                </label>
                <textarea
                  value={formData.job_description}
                  onChange={(e) =>
                    setFormData({ ...formData, job_description: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  rows={4}
                  placeholder="Descripción de la oferta..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Salario Mín (k)
                  </label>
                  <input
                    type="number"
                    value={formData.salary_range_min}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_range_min: e.target.value })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Salario Máx (k)
                  </label>
                  <input
                    type="number"
                    value={formData.salary_range_max}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_range_max: e.target.value })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tipo de trabajo
                  </label>
                  <select
                    value={formData.job_type}
                    onChange={(e) =>
                      setFormData({ ...formData, job_type: e.target.value as JobType })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="full-time">Tiempo completo</option>
                    <option value="part-time">Tiempo parcial</option>
                    <option value="contract">Contrato</option>
                    <option value="internship">Prácticas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tags
                </label>
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap gap-2 min-h-[50px] items-center">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 pl-2 pr-1.5 py-1 text-xs font-semibold text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded-md p-0.5 transition-colors text-primary/70 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[14px] font-bold">
                          close
                        </span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-transparent border-none p-1 focus:ring-0 text-sm placeholder-gray-400 text-gray-900 min-w-[120px]"
                    placeholder="Escribe y presiona Enter..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  rows={3}
                  placeholder="Notas adicionales sobre esta oferta..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl -mx-6 -mb-6 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {loading ? "Guardando..." : offer ? "Actualizar" : "Crear Oferta"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

