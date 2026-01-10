"use client";

import { useState, useEffect } from "react";
import type { CVCertification } from "@/types/cv";
import { useToast } from "@/contexts/ToastContext";
import { useAISectionImprover } from "@/hooks/useAISectionImprover";
import { useGamification } from "@/hooks/useGamification";
import { useTranslations } from "next-intl";

interface CertificationModalProps {
  certificationId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CertificationModal({
  certificationId,
  onClose,
  onSuccess,
}: CertificationModalProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { improveSection, loading: aiLoading } = useAISectionImprover();
  const { recordEvent } = useGamification();
  const tForm = useTranslations('CVBuilder.forms.certification');
  const tCommon = useTranslations('CVBuilder.forms.common');
  const tAI = useTranslations('CVBuilder.forms.ai');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<{
    description: string;
    tags: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    issuer: "",
    name: "",
    description: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (certificationId) {
      fetchCertification();
    }
  }, [certificationId]);

  const fetchCertification = async () => {
    try {
      const response = await fetch("/api/cv/certifications");
      const certifications: CVCertification[] = await response.json();
      const cert = certifications.find((c) => c.id === certificationId);
      if (cert) {
        setFormData({
          issuer: cert.issuer,
          name: cert.name,
          description: cert.description || "",
          skills: cert.skills || [],
        });
      }
    } catch (error) {
      console.error("Error fetching certification:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = certificationId
        ? { id: certificationId, ...formData }
        : formData;

      const response = await fetch("/api/cv/certifications", {
        method: certificationId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save certification");

      showToast({
        type: "success",
        message: certificationId
          ? tForm('toastSuccessUpdate')
          : tForm('toastSuccessAdd'),
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving certification:", error);
      showToast({
        type: "error",
        message: tForm('toastErrorSave'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleImproveWithAI = async () => {
    if (!formData.description || formData.description.trim().length === 0) {
      showToast({
        type: "error",
        message: tAI('toastErrorDesc'),
      });
      return;
    }

    try {
      const result = await improveSection({
        sectionType: "certificacion",
        description: formData.description,
        tags: formData.skills,
        context: {
          emisor: formData.issuer,
          nombre: formData.name,
        },
      });

      if (result) {
        setAISuggestions({
          description: result.description,
          tags: result.tags,
        });
        setShowAISuggestions(true);
        showToast({
          type: "success",
          message: tAI('toastSuccess'),
        });
      } else {
        showToast({
          type: "error",
          message: tAI('toastFail'),
        });
      }
    } catch (error) {
      console.error("Error improving with AI:", error);
      showToast({
        type: "error",
        message: tAI('toastErrorAI'),
      });
    }
  };

  const handleAcceptAISuggestions = async () => {
    if (aiSuggestions) {
      setFormData({
        ...formData,
        description: aiSuggestions.description,
        skills: aiSuggestions.tags,
      });
      setShowAISuggestions(false);
      setAISuggestions(null);

      // Record gamification event
      await recordEvent("ai.section_improved");

      showToast({
        type: "success",
        message: tAI('toastApply'),
      });
    }
  };

  const handleRejectAISuggestions = () => {
    setShowAISuggestions(false);
    setAISuggestions(null);
  };

  // El botón está disponible si hay datos básicos rellenos (emisor y nombre) y hay descripción
  const canImproveWithAI =
    (formData.issuer.trim().length > 0 && formData.name.trim().length > 0) &&
    (formData.description && formData.description.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {certificationId ? tForm('titleEdit') : tForm('titleNew')}
                </h3>
                <p className="text-xs text-gray-500">
                  {tForm('subtitle')}
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
                  {tForm('issuer')} {tCommon('required')}
                </label>
                <input
                  required
                  value={formData.issuer}
                  onChange={(e) =>
                    setFormData({ ...formData, issuer: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {tForm('name')} {tCommon('required')}
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    {tCommon('description')}
                  </label>
                  {canImproveWithAI && (
                    <button
                      type="button"
                      onClick={handleImproveWithAI}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {aiLoading ? "hourglass_empty" : "auto_awesome"}
                      </span>
                      {aiLoading ? tAI('improving') : tAI('improve')}
                    </button>
                  )}
                </div>
                {showAISuggestions && aiSuggestions && (
                  <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">
                          auto_awesome
                        </span>
                        <span className="text-xs font-semibold text-purple-700">
                          {tAI('suggestionsTitle')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRejectAISuggestions}
                        className="text-purple-400 hover:text-purple-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-purple-700 mb-1">
                          {tAI('improvedDesc')}
                        </p>
                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-purple-100">
                          {aiSuggestions.description}
                        </p>
                      </div>
                      {aiSuggestions.tags.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-purple-700 mb-1">
                            {tAI('suggestedTags')}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {aiSuggestions.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white rounded text-[10px] font-medium text-purple-600 border border-purple-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleAcceptAISuggestions}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        {tAI('accept')}
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectAISuggestions}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors"
                      >
                        {tAI('reject')}
                      </button>
                    </div>
                  </div>
                )}
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {tCommon('skills')}
                </label>
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap gap-2 min-h-[50px] items-center">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 pl-2 pr-1.5 py-1 text-xs font-semibold text-primary border border-primary/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
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
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 bg-transparent border-none p-1 focus:ring-0 text-sm placeholder-gray-400 text-gray-900 min-w-[120px]"
                    placeholder={tCommon('skillsPlaceholder')}
                  />
                </div>
              </div>
            </div>
          </form>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl">
            <button
              name="cancel"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {loading ? tCommon('saving') : tForm('saveBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

