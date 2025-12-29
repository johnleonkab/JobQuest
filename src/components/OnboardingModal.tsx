"use client";

import { useState, useEffect } from "react";

interface OnboardingData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  headline?: string;
}

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    headline: "",
  });

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const profile = await response.json();
          // Check if required fields are missing
          const needsOnboarding =
            !profile.first_name ||
            !profile.last_name ||
            !profile.gender ||
            !profile.birth_date;

          setIsOpen(needsOnboarding);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      } finally {
        setLoading(false);
      }
    }
    checkOnboarding();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          birth_date: formData.birthDate,
          headline: formData.headline || null,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error updating profile:", errorData.error || "Unknown error");
        alert("Error al actualizar el perfil. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Completa tu perfil
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Necesitamos algunos datos básicos para personalizar tu experiencia.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nombre *
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Apellidos *
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Género *
            </label>
            <select
              id="gender"
              required
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecciona...</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer_not_to_say">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Fecha de nacimiento *
            </label>
            <input
              id="birthDate"
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Título (opcional)
            </label>
            <input
              id="headline"
              type="text"
              value={formData.headline}
              onChange={(e) =>
                setFormData({ ...formData, headline: e.target.value })
              }
              placeholder="Ej: Desarrollador Full Stack"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

