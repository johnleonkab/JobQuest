"use client";

import { useState, useEffect } from "react";
import { useGamification } from "@/hooks/useGamification";
import type { CVData } from "@/types/cv";
import SectionSelectorModal from "@/components/cv/SectionSelectorModal";
import AIInsightsModal from "@/components/cv/AIInsightsModal";
import EducationSection from "@/components/cv/EducationSection";
import ExperienceSection from "@/components/cv/ExperienceSection";
import CertificationsSection from "@/components/cv/CertificationsSection";
import LanguagesSection from "@/components/cv/LanguagesSection";
import VolunteeringSection from "@/components/cv/VolunteeringSection";
import ProjectsSection from "@/components/cv/ProjectsSection";

export default function CVBuilderPage() {
  const [cvData, setCvData] = useState<CVData>({
    education: [],
    experience: [],
    certifications: [],
    languages: [],
    volunteering: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{
    first_name?: string;
    last_name?: string;
    gender?: string;
    headline?: string;
  } | null>(null);
  const { recordEvent } = useGamification();

  useEffect(() => {
    fetchCVData();
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          headline: data.headline,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const fetchCVData = async () => {
    try {
      const [educationRes, experienceRes, certificationsRes, languagesRes, volunteeringRes, projectsRes] =
        await Promise.all([
          fetch("/api/cv/education"),
          fetch("/api/cv/experience"),
          fetch("/api/cv/certifications"),
          fetch("/api/cv/languages"),
          fetch("/api/cv/volunteering"),
          fetch("/api/cv/projects"),
        ]);

      const [education, experience, certifications, languages, volunteering, projects] =
        await Promise.all([
          educationRes.ok ? educationRes.json() : [],
          experienceRes.ok ? experienceRes.json() : [],
          certificationsRes.ok ? certificationsRes.json() : [],
          languagesRes.ok ? languagesRes.json() : [],
          volunteeringRes.ok ? volunteeringRes.json() : [],
          projectsRes.ok ? projectsRes.json() : [],
        ]);

      setCvData({
        education: Array.isArray(education) ? education : [],
        experience: Array.isArray(experience) ? experience : [],
        certifications: Array.isArray(certifications) ? certifications : [],
        languages: Array.isArray(languages) ? languages : [],
        volunteering: Array.isArray(volunteering) ? volunteering : [],
        projects: Array.isArray(projects) ? projects : [],
      });
    } catch (error) {
      console.error("Error fetching CV data:", error);
      // Asegurar que siempre hay arrays vacíos en caso de error
      setCvData({
        education: [],
        experience: [],
        certifications: [],
        languages: [],
        volunteering: [],
        projects: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = (sectionType: string | null = null) => {
    setSelectedSection(sectionType);
    setShowSectionModal(true);
  };

  const handleSectionAdded = async (sectionType: string) => {
    await fetchCVData();
    
    // Registrar evento de gamificación
    const eventMap: Record<string, string> = {
      education: "cv.education_added",
      experience: "cv.experience_added",
      certification: "cv.certification_added",
      language: "cv.language_added",
      volunteering: "cv.volunteering_added",
      project: "cv.project_added",
    };

    const eventId = eventMap[sectionType];
    if (eventId) {
      await recordEvent(eventId);
      // También registrar evento genérico de sección agregada
      await recordEvent("cv.section_added");
    }
  };

  const handleSectionUpdated = async (sectionType: string) => {
    await fetchCVData();
    
    // Registrar evento de gamificación para actualizaciones
    const eventMap: Record<string, string> = {
      education: "cv.education_updated",
      experience: "cv.experience_updated",
      certification: "cv.certification_updated",
      language: "cv.language_updated",
      volunteering: "cv.volunteering_updated",
      project: "cv.project_updated",
    };

    const eventId = eventMap[sectionType];
    if (eventId) {
      await recordEvent(eventId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
      <div className="max-w-5xl mx-auto h-full flex flex-col gap-8 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Mi Perfil Profesional
            </h2>
            <p className="text-gray-500">
              Gestiona tu experiencia y habilidades para destacar.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIInsightsModal(true)}
              className="bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:animate-pulse">
                smart_toy
              </span>
              Revisión IA
            </button>
            <button
              onClick={() => handleAddSection(null)}
              className="bg-primary hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Añadir Sección
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ExperienceSection
            experiences={cvData.experience}
            onAdd={() => handleAddSection("experience")}
            onUpdate={() => handleSectionUpdated("experience")}
          />
          <EducationSection
            education={cvData.education}
            onAdd={() => handleAddSection("education")}
            onUpdate={() => handleSectionUpdated("education")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CertificationsSection
              certifications={cvData.certifications}
              onAdd={() => handleAddSection("certification")}
              onUpdate={() => handleSectionUpdated("certification")}
            />
            <LanguagesSection
              languages={cvData.languages}
              certifications={cvData.certifications}
              onAdd={() => handleAddSection("language")}
              onUpdate={() => handleSectionUpdated("language")}
            />
          </div>
          <ProjectsSection
            projects={cvData.projects}
            onAdd={() => handleAddSection("project")}
            onUpdate={() => handleSectionUpdated("project")}
          />
          <VolunteeringSection
            volunteering={cvData.volunteering}
            onAdd={() => handleAddSection("volunteering")}
            onUpdate={() => handleSectionUpdated("volunteering")}
          />
        </div>
      </div>

      {showSectionModal && (
        <SectionSelectorModal
          selectedSection={selectedSection}
          onClose={() => {
            setShowSectionModal(false);
            setSelectedSection(null);
          }}
          onSectionAdded={handleSectionAdded}
        />
      )}

      {showAIInsightsModal && (
        <AIInsightsModal
          isOpen={showAIInsightsModal}
          onClose={() => setShowAIInsightsModal(false)}
          cvData={cvData}
          profileData={profileData || undefined}
        />
      )}
    </div>
  );
}
