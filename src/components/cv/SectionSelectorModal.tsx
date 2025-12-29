"use client";

import { useState, useEffect } from "react";
import type { CVSectionType } from "@/types/cv";
import EducationModal from "./modals/EducationModal";
import ExperienceModal from "./modals/ExperienceModal";
import CertificationModal from "./modals/CertificationModal";
import LanguageModal from "./modals/LanguageModal";
import VolunteeringModal from "./modals/VolunteeringModal";
import ProjectModal from "./modals/ProjectModal";

interface SectionSelectorModalProps {
  selectedSection: string | null;
  onClose: () => void;
  onSectionAdded: (sectionType: string) => void;
}

const sectionOptions = [
  {
    id: "education",
    name: "Estudios y Formación",
    description: "Añade tus títulos académicos, cursos y formación complementaria.",
    icon: "school",
    color: "bg-purple-50 text-purple-500",
  },
  {
    id: "experience",
    name: "Experiencia Laboral",
    description: "Detalla tu trayectoria profesional, prácticas y puestos anteriores.",
    icon: "work",
    color: "bg-blue-50 text-blue-500",
  },
  {
    id: "certification",
    name: "Certificaciones",
    description: "Muestra tus licencias, diplomas y acreditaciones oficiales.",
    icon: "verified",
    color: "bg-green-50 text-green-600",
  },
  {
    id: "language",
    name: "Idiomas",
    description: "Indica los idiomas que dominas y tu nivel de competencia en cada uno.",
    icon: "translate",
    color: "bg-orange-50 text-orange-500",
  },
  {
    id: "volunteering",
    name: "Voluntariados",
    description: "Añade experiencias de voluntariado, causas benéficas y trabajo social.",
    icon: "volunteer_activism",
    color: "bg-rose-50 text-rose-500",
  },
  {
    id: "project",
    name: "Proyectos Personales",
    description: "Portafolio, trabajos freelance, blogs y otros logros extracurriculares.",
    icon: "rocket_launch",
    color: "bg-indigo-50 text-indigo-500",
  },
];

export default function SectionSelectorModal({
  selectedSection,
  onClose,
  onSectionAdded,
}: SectionSelectorModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentSection, setCurrentSection] = useState<CVSectionType | null>(
    selectedSection as CVSectionType | null
  );

  useEffect(() => {
    if (selectedSection) {
      setCurrentSection(selectedSection as CVSectionType);
      setShowForm(true);
    }
  }, [selectedSection]);

  const handleSectionSelect = (sectionId: string) => {
    setCurrentSection(sectionId as CVSectionType);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCurrentSection(null);
    onClose();
  };

  const handleFormSuccess = (sectionType: string) => {
    onSectionAdded(sectionType);
    handleFormClose();
  };

  if (showForm && currentSection) {
    const modalProps = {
      onClose: handleFormClose,
      onSuccess: () => handleFormSuccess(currentSection),
    };

    switch (currentSection) {
      case "education":
        return <EducationModal {...modalProps} />;
      case "experience":
        return <ExperienceModal {...modalProps} />;
      case "certification":
        return <CertificationModal {...modalProps} />;
      case "language":
        return <LanguageModal {...modalProps} />;
      case "volunteering":
        return <VolunteeringModal {...modalProps} />;
      case "project":
        return <ProjectModal {...modalProps} />;
      default:
        return null;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-background-light/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Añadir nueva sección</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona el tipo de contenido para agregar a tu perfil profesional.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 overflow-y-auto bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSectionSelect(option.id)}
                className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-left"
              >
                <div
                  className={`size-12 rounded-xl ${option.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {option.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {option.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="px-8 py-4 bg-background-light/30 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

