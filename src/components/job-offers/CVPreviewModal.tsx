"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { JobOffer, SelectedCVSections } from "@/types/job-offers";
import type { CVData, CVExperience, CVEducation, CVCertification, CVLanguage, CVVolunteering, CVProject } from "@/types/cv";
import { useGamification } from "@/hooks/useGamification";

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: JobOffer;
  cvData: CVData;
  profileData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
    headline?: string;
  } | null;
}

export default function CVPreviewModal({
  isOpen,
  onClose,
  offer,
  cvData,
  profileData,
}: CVPreviewModalProps) {
  const { recordEvent } = useGamification();
  const [filteredCV, setFilteredCV] = useState<CVData>({
    education: [],
    experience: [],
    certifications: [],
    languages: [],
    volunteering: [],
    projects: [],
  });

  useEffect(() => {
    if (isOpen && offer.selected_cv_sections && cvData) {
      const sections = offer.selected_cv_sections;
      setFilteredCV({
        experience: sections.experience
          ? cvData.experience.filter((exp) => sections.experience?.includes(exp.id))
          : [],
        education: sections.education
          ? cvData.education.filter((edu) => sections.education?.includes(edu.id))
          : [],
        certifications: sections.certifications
          ? cvData.certifications.filter((cert) => sections.certifications?.includes(cert.id))
          : [],
        languages: sections.languages
          ? cvData.languages.filter((lang) => sections.languages?.includes(lang.id))
          : [],
        volunteering: sections.volunteering
          ? cvData.volunteering.filter((vol) => sections.volunteering?.includes(vol.id))
          : [],
        projects: sections.projects
          ? cvData.projects.filter((proj) => sections.projects?.includes(proj.id))
          : [],
      });
    }
  }, [isOpen, offer.selected_cv_sections, cvData]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Presente";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  };

  const handleDownloadPDF = async () => {
    const cvElement = document.getElementById('cv-preview');
    if (!cvElement) return;

    // Clone the CV content
    const clonedCV = cvElement.cloneNode(true) as HTMLElement;
    clonedCV.id = 'cv-preview-print';
    clonedCV.className = 'cv-print-content';
    clonedCV.style.position = 'absolute';
    clonedCV.style.left = '0';
    clonedCV.style.top = '0';
    clonedCV.style.width = '210mm';
    clonedCV.style.minHeight = '297mm';
    clonedCV.style.padding = '20mm';
    clonedCV.style.boxSizing = 'border-box';
    clonedCV.style.background = 'white';
    clonedCV.style.margin = '0';
    clonedCV.style.zIndex = '9999';

    // Append to body for printing
    document.body.appendChild(clonedCV);

    // Record gamification event
    await recordEvent("job_offer.cv_downloaded");

    // Trigger print
    window.print();

    // Clean up after printing
    const cleanup = () => {
      const printElement = document.getElementById('cv-preview-print');
      if (printElement) {
        document.body.removeChild(printElement);
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    
    // Fallback cleanup in case afterprint doesn't fire
    setTimeout(cleanup, 1000);
  };

  if (!isOpen) return null;

  const fullName = profileData
    ? `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "Nombre no disponible"
    : "Nombre no disponible";

  // Render CV content function
  const renderCVContent = () => (
    <>
      {/* Header Section */}
      <div className="flex items-start gap-6 mb-8 pb-6 border-b-2 border-primary">
        {profileData?.avatar_url && (
          <div className="shrink-0">
            <Image
              src={profileData.avatar_url}
              alt={fullName}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
          {profileData?.headline && (
            <p className="text-lg text-gray-600 mb-2">{profileData.headline}</p>
          )}
          {profileData?.email && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="material-symbols-outlined text-[16px]">email</span>
              {profileData.email}
            </div>
          )}
        </div>
      </div>

      {/* Experience Section */}
      {filteredCV.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">work</span>
            Experiencia Laboral
          </h2>
          <div className="space-y-4">
            {filteredCV.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-base text-primary font-medium">{exp.company_name}</p>
                  </div>
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(exp.start_date)} - {exp.is_current ? "Presente" : formatDate(exp.end_date)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {filteredCV.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">school</span>
            Educación
          </h2>
          <div className="space-y-3">
            {filteredCV.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{edu.title}</h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(edu.start_date)} - {edu.is_ongoing ? "Presente" : formatDate(edu.end_date)}
                  </p>
                </div>
                {edu.notes && (
                  <p className="text-xs text-gray-500 mt-1">{edu.notes}</p>
                )}
                {edu.skills && edu.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {edu.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {filteredCV.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            Certificaciones
          </h2>
          <div className="space-y-2">
            {filteredCV.certifications.map((cert) => (
              <div key={cert.id} className="mb-2">
                <h3 className="text-base font-semibold text-gray-900">{cert.name}</h3>
                {cert.issuer && (
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                )}
                {cert.description && (
                  <p className="text-xs text-gray-500 mt-1">{cert.description}</p>
                )}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cert.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {filteredCV.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            Proyectos
          </h2>
          <div className="space-y-3">
            {filteredCV.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{proj.name}</h3>
                  {(proj.start_date || proj.end_date) && (
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(proj.start_date)} - {formatDate(proj.end_date)}
                    </p>
                  )}
                </div>
                {proj.description && (
                  <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                )}
                {proj.links && proj.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proj.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline print:text-gray-900 print:no-underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volunteering Section */}
      {filteredCV.volunteering.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            Voluntariado
          </h2>
          <div className="space-y-3">
            {filteredCV.volunteering.map((vol) => (
              <div key={vol.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{vol.title}</h3>
                    <p className="text-sm text-gray-600">{vol.organization}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(vol.start_date)} - {vol.is_ongoing ? "Presente" : formatDate(vol.end_date)}
                  </p>
                </div>
                {vol.description && (
                  <p className="text-sm text-gray-600 mt-1">{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages Section */}
      {filteredCV.languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">language</span>
            Idiomas
          </h2>
          <div className="flex flex-wrap gap-3">
            {filteredCV.languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{lang.language}</span>
                <span className="text-sm text-gray-500">- {lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto no-print" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl print:hidden">
            {/* Header */}
            <div className="no-print bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">description</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Vista Previa del CV</h3>
                  <p className="text-xs text-gray-500">Formato A4 - {offer.position} en {offer.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-pink-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar PDF
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* CV Content - A4 Format */}
            <div className="no-print overflow-y-auto max-h-[80vh] p-8 bg-gray-50">
              <div
                id="cv-preview"
                className="cv-print-content bg-white shadow-lg mx-auto"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "20mm",
                  boxSizing: "border-box",
                }}
              >
                {renderCVContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

