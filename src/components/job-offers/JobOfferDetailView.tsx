"use client";

import { useState, useEffect } from "react";
import type { JobOffer, SelectedCVSections } from "@/types/job-offers";
import type { CVData } from "@/types/cv";
import type { Interview, InterviewFormData } from "@/types/interviews";
import type { JobOfferContact, ContactFormData } from "@/types/contacts";
import { useToast } from "@/contexts/ToastContext";
import { useGamification } from "@/hooks/useGamification";
import JobOfferModal from "./JobOfferModal";
import CVSectionSelectorModal from "./CVSectionSelectorModal";
import CVPreviewModal from "./CVPreviewModal";
import InterviewCalendarModal from "../interviews/InterviewCalendarModal";
import ContactModal from "../contacts/ContactModal";

interface JobOfferDetailViewProps {
  offerId: string;
  onClose: () => void;
}

export default function JobOfferDetailView({
  offerId,
  onClose,
}: JobOfferDetailViewProps) {
  const { showToast } = useToast();
  const { recordEvent } = useGamification();
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCVSelectorModal, setShowCVSelectorModal] = useState(false);
  const [showCVPreviewModal, setShowCVPreviewModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<JobOfferContact | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [contacts, setContacts] = useState<JobOfferContact[]>([]);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [profileData, setProfileData] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
    headline?: string;
  } | null>(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    fetchOffer();
    fetchCVData();
    fetchProfileData();
    fetchInterviews();
    fetchContacts();
  }, [offerId]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/contacts?job_offer_id=${offerId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSaveContact = async (contactData: ContactFormData) => {
    try {
      const method = editingContact ? "PUT" : "POST";
      const url = editingContact
        ? `/api/contacts?id=${editingContact.id}`
        : "/api/contacts";
      const body = editingContact
        ? { id: editingContact.id, ...contactData }
        : {
            job_offer_id: offerId,
            ...contactData,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save contact");

      showToast({
        type: "success",
        message: editingContact
          ? "Contacto actualizado correctamente"
          : "Contacto añadido correctamente",
      });

      await fetchContacts();
      setShowContactModal(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      showToast({
        type: "error",
        message: "Error al guardar el contacto",
      });
      throw error;
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este contacto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      showToast({
        type: "success",
        message: "Contacto eliminado correctamente",
      });

      await fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      showToast({
        type: "error",
        message: "Error al eliminar el contacto",
      });
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`/api/interviews?job_offer_id=${offerId}`);
      if (response.ok) {
        const data = await response.json();
        setInterviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  const handleSaveInterview = async (interviewData: InterviewFormData) => {
    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_offer_id: offerId,
          title: interviewData.title,
          scheduled_at: interviewData.scheduled_at.toISOString(),
          notes: interviewData.notes,
          location: interviewData.location,
          interview_type: interviewData.interview_type,
          status: interviewData.status,
        }),
      });

      if (!response.ok) throw new Error("Failed to save interview");

      // Record gamification event
      await recordEvent("application.interview_scheduled");

      showToast({
        type: "success",
        message: "Entrevista programada correctamente",
      });

      await fetchInterviews();
      setShowInterviewModal(false);
    } catch (error) {
      console.error("Error saving interview:", error);
      showToast({
        type: "error",
        message: "Error al programar la entrevista",
      });
      throw error;
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          avatar_url: data.avatar_url,
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
    }
  };

  const fetchOffer = async () => {
    try {
      const response = await fetch(`/api/job-offers?id=${offerId}`);
      if (!response.ok) throw new Error("Failed to fetch offer");
      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error("Error fetching offer:", error);
      showToast({
        type: "error",
        message: "Error al cargar la oferta",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteInput.trim() || !offer) return;

    try {
      const updatedNotes = offer.notes
        ? `${offer.notes}\n\n${new Date().toLocaleString("es-ES")}: ${noteInput.trim()}`
        : `${new Date().toLocaleString("es-ES")}: ${noteInput.trim()}`;

      const response = await fetch("/api/job-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: offer.id,
          notes: updatedNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      // Record gamification event
      await recordEvent("job_offer.note_added");

      showToast({
        type: "success",
        message: "Nota añadida correctamente",
      });

      setNoteInput("");
      await fetchOffer();
    } catch (error) {
      console.error("Error saving note:", error);
      showToast({
        type: "error",
        message: "Error al guardar la nota",
      });
    }
  };

  const handleUpdate = async (offerData: Partial<JobOffer>) => {
    try {
      const response = await fetch("/api/job-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) throw new Error("Failed to update offer");

      // Record gamification event
      await recordEvent("job_offer.updated");

      showToast({
        type: "success",
        message: "Oferta actualizada correctamente",
      });

      await fetchOffer();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  };

  const handleSaveCVSections = async (sections: SelectedCVSections) => {
    if (!offer) return;

    try {
      const response = await fetch("/api/job-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: offer.id,
          selected_cv_sections: sections,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save CV sections";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedOffer = await response.json();
      setOffer(updatedOffer);
      
      // Record gamification event
      await recordEvent("job_offer.cv_sections_selected");
      
      showToast({
        type: "success",
        message: "Secciones de CV guardadas correctamente",
      });
    } catch (error) {
      console.error("Error saving CV sections:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar las secciones";
      showToast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      saved: "Guardada",
      contacted: "Contactada",
      applied: "Aplicada",
      interview: "Entrevista",
      offer: "Oferta",
      rejected: "Descartada",
      accepted: "Conseguida",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "contacted":
      case "applied":
        return "bg-purple-50 text-primary border-purple-200";
      case "interview":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "offer":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      case "accepted":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusTimeline = (): {
    statuses: Array<{ status: string; label: string; order: number }>;
    progress: number;
    currentIndex: number;
  } => {
    const statuses: Array<{ status: string; label: string; order: number }> = [
      { status: "saved", label: "Guardada", order: 1 },
      { status: "applied", label: "Aplicada", order: 2 },
      { status: "contacted", label: "Contactada", order: 3 },
      { status: "interview", label: "Entrevista", order: 4 },
      { status: "offer", label: "Oferta", order: 5 },
      { status: "accepted", label: "Conseguida", order: 6 },
    ];

    if (!offer) {
      return { statuses, progress: 0, currentIndex: -1 };
    }

    const currentStatusIndex = statuses.findIndex((s) => s.status === offer.status);
    const progress = currentStatusIndex >= 0 ? (currentStatusIndex + 1) / statuses.length : 0;

    return { statuses, progress, currentIndex: currentStatusIndex };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getDaysOpen = () => {
    if (!offer) return 0;
    const created = new Date(offer.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getXPForStatus = (status: string) => {
    const xpMap: Record<string, number> = {
      saved: 10,
      contacted: 15,
      applied: 25,
      interview: 100,
      offer: 500,
      accepted: 1000,
    };
    return xpMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-4">
              hourglass_empty
            </span>
            <p className="text-gray-500">Cargando oferta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Oferta no encontrada</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeline = getStatusTimeline();
  const salaryRange =
    offer.salary_range_min && offer.salary_range_max
      ? `$${offer.salary_range_min}k - $${offer.salary_range_max}k`
      : offer.salary_range_min
        ? `$${offer.salary_range_min}k+`
        : "No especificado";

  const jobTypeLabels: Record<string, string> = {
    "full-time": "Tiempo completo",
    "part-time": "Tiempo parcial",
    contract: "Contrato",
    internship: "Prácticas",
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#fdf4ff]">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver a Ofertas
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-gray-900 font-semibold">{offer.position}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-5">
                <div className="bg-white p-2 rounded-2xl size-20 md:size-24 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                  {offer.company_logo_url && offer.company_logo_url.startsWith('http') ? (
                    <img
                      alt={`${offer.company_name} Logo`}
                      className="w-full h-full object-contain"
                      src={offer.company_logo_url}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/200x200/fce7f3/db2777?text=${offer.company_name.charAt(0).toUpperCase()}`;
                      }}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {offer.company_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-gray-900 text-2xl md:text-3xl font-bold tracking-tight">
                      {offer.position}
                    </h1>
                    <span
                      className={`bg-purple-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20 ${getStatusColor(offer.status)}`}
                    >
                      {getStatusLabel(offer.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-base md:text-lg font-medium">
                    {offer.company_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500 text-sm">
                    {offer.job_type && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">work</span>
                        {jobTypeLabels[offer.job_type] || offer.job_type}
                      </span>
                    )}
                    {offer.application_date && (
                      <>
                        <span className="hidden md:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">schedule</span>
                          Aplicada {formatDate(offer.application_date)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[140px]">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 md:flex-none h-10 px-4 bg-primary hover:bg-pink-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-200"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Editar Oferta
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 md:flex-none h-10 px-4 bg-white hover:bg-slate-50 text-gray-700 hover:text-gray-900 border border-slate-200 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Volver
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="relative flex justify-between w-full">
                <div className="absolute top-[14px] left-0 w-full h-0.5 bg-slate-100 -z-0" />
                <div
                  className="absolute top-[14px] left-0 h-0.5 bg-gradient-to-r from-primary to-pink-300 -z-0 transition-all duration-500"
                  style={{ width: `${timeline.progress * 100}%` }}
                />
                {timeline.statuses.map((status, index) => {
                  const isCompleted = index <= timeline.currentIndex;
                  const isCurrent = index === timeline.currentIndex;
                  return (
                    <div
                      key={status.status}
                      className="flex flex-col items-center gap-2 z-10 group cursor-pointer"
                    >
                      <div
                        className={`size-8 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white transition-all ${
                          isCompleted
                            ? "bg-primary text-white"
                            : isCurrent
                              ? "bg-white border-2 border-primary text-primary animate-pulse"
                              : "bg-slate-50 border-2 border-slate-200 text-gray-500 group-hover:border-primary/50"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        ) : isCurrent ? (
                          <span className="material-symbols-outlined text-sm">videocam</span>
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isCompleted || isCurrent
                            ? "text-primary"
                            : "text-gray-500 group-hover:text-primary transition-colors"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Job Description */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-gray-900 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Descripción del Trabajo
                </h3>
                <div className="text-gray-500 text-sm leading-relaxed">
                  {offer.job_description ? (
                    <div className="whitespace-pre-wrap">{offer.job_description}</div>
                  ) : (
                    <p className="text-gray-400 italic">No hay descripción disponible.</p>
                  )}
                </div>
                {offer.tags && offer.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {offer.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-slate-50 text-xs font-medium text-gray-500 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-primary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Rango Salarial</p>
                    <p className="text-gray-900 font-bold">{salaryRange}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-primary">
                    <span className="material-symbols-outlined">work_history</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Tipo de Trabajo</p>
                    <p className="text-gray-900 font-bold">
                      {offer.job_type ? jobTypeLabels[offer.job_type] : "No especificado"}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-primary">
                    <span className="material-symbols-outlined">domain</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Empresa</p>
                    <p className="text-gray-900 font-bold">{offer.company_name}</p>
                  </div>
                </div>
              </div>

              {/* CV Sections Selection */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    CV Personalizado para esta Oferta
                  </h3>
                  <div className="flex items-center gap-2">
                    {offer.selected_cv_sections &&
                    Object.keys(offer.selected_cv_sections).length > 0 && (
                      <button
                        onClick={() => setShowCVPreviewModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-sm font-semibold rounded-xl transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Ver CV Completo
                      </button>
                    )}
                    <button
                      onClick={() => setShowCVSelectorModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-pink-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      {offer.selected_cv_sections &&
                      Object.keys(offer.selected_cv_sections).length > 0
                        ? "Editar Selección"
                        : "Seleccionar Secciones"}
                    </button>
                  </div>
                </div>
                {offer.selected_cv_sections &&
                Object.keys(offer.selected_cv_sections).length > 0 ? (
                  <div className="space-y-3">
                    {offer.selected_cv_sections.experience &&
                      offer.selected_cv_sections.experience.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Experiencia ({offer.selected_cv_sections.experience.length})
                          </p>
                          <div className="space-y-1">
                            {cvData?.experience
                              ?.filter((exp) =>
                                offer.selected_cv_sections?.experience?.includes(exp.id)
                              )
                              .map((exp) => (
                                <div
                                  key={exp.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <p className="text-sm font-semibold text-gray-900">
                                    {exp.position}
                                  </p>
                                  <p className="text-xs text-gray-500">{exp.company_name}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {offer.selected_cv_sections.education &&
                      offer.selected_cv_sections.education.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Educación ({offer.selected_cv_sections.education.length})
                          </p>
                          <div className="space-y-1">
                            {cvData?.education
                              ?.filter((edu) =>
                                offer.selected_cv_sections?.education?.includes(edu.id)
                              )
                              .map((edu) => (
                                <div
                                  key={edu.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <p className="text-sm font-semibold text-gray-900">
                                    {edu.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{edu.institution}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {offer.selected_cv_sections.certifications &&
                      offer.selected_cv_sections.certifications.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Certificaciones ({offer.selected_cv_sections.certifications.length})
                          </p>
                          <div className="space-y-1">
                            {cvData?.certifications
                              ?.filter((cert) =>
                                offer.selected_cv_sections?.certifications?.includes(cert.id)
                              )
                              .map((cert) => (
                                <div
                                  key={cert.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <p className="text-sm font-semibold text-gray-900">
                                    {cert.name}
                                  </p>
                                  {cert.issuer && (
                                    <p className="text-xs text-gray-500">{cert.issuer}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {offer.selected_cv_sections.projects &&
                      offer.selected_cv_sections.projects.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Proyectos ({offer.selected_cv_sections.projects.length})
                          </p>
                          <div className="space-y-1">
                            {cvData?.projects
                              ?.filter((proj) =>
                                offer.selected_cv_sections?.projects?.includes(proj.id)
                              )
                              .map((proj) => (
                                <div
                                  key={proj.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <p className="text-sm font-semibold text-gray-900">
                                    {proj.name}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {offer.selected_cv_sections.languages &&
                      offer.selected_cv_sections.languages.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Idiomas ({offer.selected_cv_sections.languages.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cvData?.languages
                              ?.filter((lang) =>
                                offer.selected_cv_sections?.languages?.includes(lang.id)
                              )
                              .map((lang) => (
                                <span
                                  key={lang.id}
                                  className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-gray-700"
                                >
                                  {lang.language} ({lang.level})
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    {offer.selected_cv_sections.volunteering &&
                      offer.selected_cv_sections.volunteering.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Voluntariado ({offer.selected_cv_sections.volunteering.length})
                          </p>
                          <div className="space-y-1">
                            {cvData?.volunteering
                              ?.filter((vol) =>
                                offer.selected_cv_sections?.volunteering?.includes(vol.id)
                              )
                              .map((vol) => (
                                <div
                                  key={vol.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <p className="text-sm font-semibold text-gray-900">
                                    {vol.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{vol.organization}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">description</span>
                    <p className="text-sm mb-1">No hay secciones seleccionadas</p>
                    <p className="text-xs">Personaliza tu CV para esta oferta</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* XP and Days */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    XP Ganado
                  </p>
                  <p className="text-2xl font-black text-primary mt-1">
                    +{getXPForStatus(offer.status)} XP
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Días Abierta
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {getDaysOpen()} Días
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                    Notas
                  </h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-900 text-sm resize-none focus:ring-0 placeholder:text-gray-400"
                    placeholder="Escribe preguntas de entrevista o pensamientos..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={!noteInput.trim()}
                      className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-lg hover:bg-pink-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Añadir Nota (+5 XP)
                    </button>
                  </div>
                </div>
                {offer.notes && (
                  <div className="flex flex-col gap-2 mt-1">
                    {offer.notes
                      .split("\n\n")
                      .filter((note) => note.trim())
                      .slice(-3)
                      .map((note, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors cursor-pointer group"
                        >
                          <p className="text-gray-900 text-xs mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {note.split(": ").slice(1).join(": ")}
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            {note.split(": ")[0]}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Interviews */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">videocam</span>
                    Entrevistas
                  </h3>
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nueva Entrevista
                  </button>
                </div>
                {interviews.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">
                    No hay entrevistas programadas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {interviews.map((interview) => {
                      const scheduledDate = new Date(interview.scheduled_at);
                      const isPast = scheduledDate < new Date();
                      const isToday =
                        scheduledDate.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={interview.id}
                          className={`p-4 rounded-xl border ${
                            isPast
                              ? "bg-gray-50 border-gray-200"
                              : isToday
                              ? "bg-amber-50 border-amber-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {interview.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">
                                    calendar_today
                                  </span>
                                  {scheduledDate.toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">
                                    schedule
                                  </span>
                                  {scheduledDate.toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {interview.location && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="material-symbols-outlined text-base align-middle mr-1">
                                    location_on
                                  </span>
                                  {interview.location}
                                </p>
                              )}
                              {interview.notes && (
                                <p className="text-sm text-gray-500 mt-2">{interview.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  interview.status === "scheduled"
                                    ? "bg-amber-100 text-amber-700"
                                    : interview.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : interview.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {interview.status === "scheduled"
                                  ? "Programada"
                                  : interview.status === "completed"
                                  ? "Completada"
                                  : interview.status === "cancelled"
                                  ? "Cancelada"
                                  : "Reagendada"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                    Personas de Contacto
                  </h3>
                  <button
                    onClick={() => {
                      setEditingContact(null);
                      setShowContactModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nuevo Contacto
                  </button>
                </div>
                {contacts.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">
                    No hay contactos añadidos
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 rounded-xl border bg-white border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {contact.name}
                              </h4>
                              {contact.role && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  {contact.role}
                                </span>
                              )}
                            </div>
                            {contact.email && (
                              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">
                                  email
                                </span>
                                {contact.email}
                              </p>
                            )}
                            {contact.contact_channels && contact.contact_channels.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {contact.contact_channels.map((channel, idx) => {
                                  const channelIcons: Record<string, string> = {
                                    email: "email",
                                    linkedin: "link",
                                    phone: "phone",
                                    whatsapp: "chat",
                                    other: "more_horiz",
                                  };
                                  return (
                                    <a
                                      key={idx}
                                      href={
                                        channel.type === "email"
                                          ? `mailto:${channel.value}`
                                          : channel.type === "phone" || channel.type === "whatsapp"
                                          ? `tel:${channel.value}`
                                          : channel.value.startsWith("http")
                                          ? channel.value
                                          : `https://${channel.value}`
                                      }
                                      target={channel.type !== "email" && channel.type !== "phone" && channel.type !== "whatsapp" ? "_blank" : undefined}
                                      rel={channel.type !== "email" && channel.type !== "phone" && channel.type !== "whatsapp" ? "noopener noreferrer" : undefined}
                                      className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {channelIcons[channel.type] || "link"}
                                      </span>
                                      {channel.value}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                            {contact.notes && (
                              <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingContact(contact);
                                setShowContactModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-gray-900 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">history</span>
                  Historial
                </h3>
                <div className="relative pl-2 space-y-6 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 before:content-['']">
                  <div className="relative flex gap-3">
                    <span className="absolute -left-2 top-1 size-2 rounded-full border-2 border-white ring-2 ring-primary bg-primary box-content" />
                    <div className="flex flex-col">
                      <p className="text-xs text-gray-500">{formatDate(offer.updated_at)}</p>
                      <p className="text-sm text-gray-900 font-medium">
                        Estado actualizado a{" "}
                        <span className="text-primary font-bold">
                          {getStatusLabel(offer.status)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {offer.created_at && (
                    <div className="relative flex gap-3">
                      <span className="absolute -left-2 top-1 size-2 rounded-full border-2 border-white ring-2 ring-slate-200 bg-slate-400 box-content" />
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-500">{formatDate(offer.created_at)}</p>
                        <p className="text-sm text-gray-900 font-medium">Oferta creada</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && offer && (
        <JobOfferModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
          offer={offer}
        />
      )}

      {/* CV Section Selector Modal */}
      {showCVSelectorModal && offer && cvData && (
        <CVSectionSelectorModal
          isOpen={showCVSelectorModal}
          onClose={() => setShowCVSelectorModal(false)}
          onSave={handleSaveCVSections}
          offer={offer}
          cvData={cvData}
        />
      )}

      {/* CV Preview Modal */}
      {showCVPreviewModal && offer && cvData && (
        <CVPreviewModal
          isOpen={showCVPreviewModal}
          onClose={() => setShowCVPreviewModal(false)}
          offer={offer}
          cvData={cvData}
          profileData={profileData}
        />
      )}

      {/* Interview Modal */}
      {offer && (
        <InterviewCalendarModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          onSave={handleSaveInterview}
          defaultTitle={`Entrevista ${offer.position} ${offer.company_name}`}
          jobOfferId={offer.id}
        />
      )}

      {/* Contact Modal */}
      {offer && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setEditingContact(null);
          }}
          onSave={handleSaveContact}
          jobOfferId={offer.id}
          contact={editingContact}
        />
      )}
    </>
  );
}

