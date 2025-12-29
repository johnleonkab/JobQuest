"use client";

import { useState, useEffect, useMemo } from "react";
import type { JobOffer, JobOfferStatus, JobOfferStats } from "@/types/job-offers";
import JobOffersKanban from "@/components/job-offers/JobOffersKanban";
import JobOffersListView from "@/components/job-offers/JobOffersListView";
import JobOffersFilters, { type FilterState } from "@/components/job-offers/JobOffersFilters";
import JobOfferModal from "@/components/job-offers/JobOfferModal";
import JobOfferDetailView from "@/components/job-offers/JobOfferDetailView";
import InterviewCalendarModal from "@/components/interviews/InterviewCalendarModal";
import ContactModal from "@/components/contacts/ContactModal";
import { useToast } from "@/contexts/ToastContext";
import { useGamification } from "@/hooks/useGamification";
import type { InterviewFormData } from "@/types/interviews";
import type { ContactFormData } from "@/types/contacts";
import { KanbanSkeleton } from "@/components/LoadingSkeleton";

export default function JobOpeningsPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [stats, setStats] = useState<JobOfferStats>({
    active: 0,
    interviews: 0,
    responseRate: 0,
    weeklyStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null);
  const [modalStatus, setModalStatus] = useState<JobOfferStatus | undefined>();
  const [viewingOfferId, setViewingOfferId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [pendingInterviewOffer, setPendingInterviewOffer] = useState<JobOffer | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [pendingContactOffer, setPendingContactOffer] = useState<JobOffer | null>(null);
  const [previousStatus, setPreviousStatus] = useState<Record<string, JobOfferStatus>>({});
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    jobTypes: [],
    salaryMin: undefined,
    salaryMax: undefined,
    hasNotes: null,
    hasCVSections: null,
  });
  const { showToast } = useToast();
  const { recordEvent } = useGamification();

  useEffect(() => {
    fetchOffers();
    fetchStats();

    // Listen for viewJobOffer events from dashboard
    const handleViewJobOffer = (event: CustomEvent<{ offerId: string }>) => {
      setViewingOfferId(event.detail.offerId);
    };

    window.addEventListener('viewJobOffer', handleViewJobOffer as EventListener);
    return () => {
      window.removeEventListener('viewJobOffer', handleViewJobOffer as EventListener);
    };
  }, []);

  const fetchOffers = async () => {
    try {
      const url = searchQuery
        ? `/api/job-offers?search=${encodeURIComponent(searchQuery)}`
        : "/api/job-offers";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch offers");
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      showToast({
        type: "error",
        message: "Error al cargar las ofertas",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/job-offers/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOffers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSave = async (offerData: Partial<JobOffer>) => {
    try {
      // Check if status changed to "interview" or "contacted" BEFORE updating
      // This is needed when editing an existing offer
      let statusChangedToInterview = false;
      let statusChangedToContacted = false;
      
      if (offerData.id && offerData.status) {
        const previousOffer = offers.find((o) => o.id === offerData.id);
        if (previousOffer) {
          statusChangedToInterview = 
            previousOffer.status !== "interview" && 
            offerData.status === "interview";
          statusChangedToContacted = 
            previousOffer.status !== "contacted" && 
            offerData.status === "contacted";
        }
      }

      const method = offerData.id ? "PUT" : "POST";
      const response = await fetch("/api/job-offers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) throw new Error("Failed to save offer");

      const savedOffer = await response.json();

      // Record gamification event
      if (offerData.id) {
        await recordEvent("job_offer.updated");
        // Also record status update if status changed
        if (statusChangedToInterview || statusChangedToContacted) {
          await recordEvent("job_offer.status_updated");
        }
      } else {
        await recordEvent("job_offer.created");
      }

      await fetchOffers();
      await fetchStats();

      // Show modals AFTER fetching if status changed
      if (statusChangedToInterview) {
        setPendingInterviewOffer(savedOffer);
        setShowInterviewModal(true);
      }

      if (statusChangedToContacted) {
        setPendingContactOffer(savedOffer);
        setShowContactModal(true);
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      throw error;
    }
  };

  const handleUpdate = async (offer: JobOffer) => {
    try {
      // Check if status changed to "interview" or "contacted" BEFORE updating
      // We need to check this before fetchOffers() updates the state
      const previousOffer = offers.find((o) => o.id === offer.id);
      const statusChangedToInterview = 
        previousOffer && 
        previousOffer.status !== "interview" && 
        offer.status === "interview";
      const statusChangedToContacted = 
        previousOffer && 
        previousOffer.status !== "contacted" && 
        offer.status === "contacted";

      const response = await fetch("/api/job-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
      });

      if (!response.ok) throw new Error("Failed to update offer");

      // Record gamification event for status update if status changed
      await recordEvent("job_offer.status_updated");

      // Update the offers list
      await fetchOffers();
      await fetchStats();

      // Show modals AFTER fetching (use the offer parameter, not the updated state)
      // If status changed to interview, show the interview modal
      if (statusChangedToInterview) {
        setPendingInterviewOffer(offer);
        setShowInterviewModal(true);
      }

      // If status changed to contacted, show the contact modal
      if (statusChangedToContacted) {
        setPendingContactOffer(offer);
        setShowContactModal(true);
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  };

  const handleSaveInterview = async (interviewData: InterviewFormData) => {
    if (!pendingInterviewOffer) return;

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_offer_id: pendingInterviewOffer.id,
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

      setShowInterviewModal(false);
      setPendingInterviewOffer(null);
    } catch (error) {
      console.error("Error saving interview:", error);
      throw error;
    }
  };

  const handleSaveContact = async (contactData: ContactFormData) => {
    if (!pendingContactOffer) return;

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_offer_id: pendingContactOffer.id,
          name: contactData.name,
          email: contactData.email,
          role: contactData.role,
          contact_channels: contactData.contact_channels,
          notes: contactData.notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to save contact");

      showToast({
        type: "success",
        message: "Contacto añadido correctamente",
      });

      setShowContactModal(false);
      setPendingContactOffer(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/job-offers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete offer");

      showToast({
        type: "success",
        message: "Oferta eliminada correctamente",
      });

      await fetchOffers();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting offer:", error);
      showToast({
        type: "error",
        message: "Error al eliminar la oferta",
      });
    }
  };

  const handleAdd = (status?: JobOfferStatus) => {
    setEditingOffer(null);
    setModalStatus(status);
    setShowModal(true);
  };

  const handleEdit = (offer: JobOffer) => {
    setEditingOffer(offer);
    setModalStatus(undefined);
    setShowModal(true);
  };

  // Filter offers based on search query and filters
  const filteredOffers = useMemo(() => {
    let filtered = [...offers];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.company_name.toLowerCase().includes(query) ||
          offer.position.toLowerCase().includes(query) ||
          offer.job_description?.toLowerCase().includes(query) ||
          offer.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((offer) => filters.statuses.includes(offer.status));
    }

    // Apply job type filters
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(
        (offer) => offer.job_type && filters.jobTypes.includes(offer.job_type)
      );
    }

    // Apply salary filters
    if (filters.salaryMin !== undefined) {
      filtered = filtered.filter(
        (offer) => offer.salary_range_min && offer.salary_range_min >= filters.salaryMin!
      );
    }
    if (filters.salaryMax !== undefined) {
      filtered = filtered.filter(
        (offer) => offer.salary_range_max && offer.salary_range_max <= filters.salaryMax!
      );
    }

    // Apply notes filter
    if (filters.hasNotes === true) {
      filtered = filtered.filter((offer) => offer.notes && offer.notes.trim().length > 0);
    }

    // Apply CV sections filter
    if (filters.hasCVSections === true) {
      filtered = filtered.filter(
        (offer) =>
          offer.selected_cv_sections &&
          Object.keys(offer.selected_cv_sections).length > 0 &&
          Object.values(offer.selected_cv_sections).some((sections) => sections && sections.length > 0)
      );
    }

    return filtered;
  }, [offers, searchQuery, filters]);

  const activeFiltersCount =
    filters.statuses.length +
    filters.jobTypes.length +
    (filters.salaryMin !== undefined ? 1 : 0) +
    (filters.salaryMax !== undefined ? 1 : 0) +
    (filters.hasNotes === true ? 1 : 0) +
    (filters.hasCVSections === true ? 1 : 0);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="h-10 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded w-40 animate-pulse"></div>
          </div>
          <KanbanSkeleton columns={7} />
        </div>
      </div>
    );
  }

  // Si hay una oferta seleccionada, mostrar la vista detallada
  if (viewingOfferId) {
    return (
      <JobOfferDetailView
        offerId={viewingOfferId}
        onClose={() => {
          setViewingOfferId(null);
          fetchOffers();
          fetchStats();
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden kanban-scroll">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Gestión de Ofertas
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Rastrea tus postulaciones y sube de nivel.
            </p>
          </div>
          <button
            onClick={() => handleAdd()}
            className="flex items-center justify-center gap-2 h-11 px-4 sm:px-6 bg-primary hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 group w-full sm:w-auto min-h-[44px]"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
              add
            </span>
            <span className="text-sm sm:text-base">Nueva Oferta</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-gray-900">work</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Ofertas Activas</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-gray-900">forum</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Entrevistas</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.interviews}</span>
              <span className="text-primary text-sm font-bold mb-1.5 bg-purple-50 px-1.5 py-0.5 rounded">
                Esta semana
              </span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-gray-900">check_circle</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tasa de Respuesta</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.responseRate}%</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-gray-900">local_fire_department</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Racha Semanal</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.weeklyStreak} Días</span>
              <span className="text-orange-500 text-sm font-bold mb-1.5 flex items-center bg-orange-50 px-1.5 py-0.5 rounded">
                🔥 On Fire
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Buscar por empresa, puesto o palabra clave..."
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeFiltersCount > 0
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap font-medium ${
                viewMode === "kanban"
                  ? "bg-purple-50 border border-primary/20 text-primary"
                  : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">view_kanban</span>
              Tablero
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap font-medium ${
                viewMode === "list"
                  ? "bg-purple-50 border border-primary/20 text-primary"
                  : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">table_rows</span>
              Lista
            </button>
          </div>
        </div>

        {/* Kanban Board or List View */}
        {viewMode === "kanban" ? (
          <JobOffersKanban
            offers={filteredOffers}
            onUpdate={handleUpdate}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(offer) => setViewingOfferId(offer.id)}
          />
        ) : (
          <JobOffersListView
            offers={filteredOffers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(offer) => setViewingOfferId(offer.id)}
          />
        )}
      </div>

      {/* Filters Modal */}
      <JobOffersFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Edit Modal */}
      {showModal && (
        <JobOfferModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingOffer(null);
            setModalStatus(undefined);
          }}
          onSave={handleSave}
          initialStatus={modalStatus}
          offer={editingOffer}
        />
      )}

      {/* Interview Modal */}
      {pendingInterviewOffer && (
        <InterviewCalendarModal
          isOpen={showInterviewModal}
          onClose={() => {
            setShowInterviewModal(false);
            setPendingInterviewOffer(null);
          }}
          onSave={handleSaveInterview}
          defaultTitle={`Entrevista ${pendingInterviewOffer.position} ${pendingInterviewOffer.company_name}`}
          jobOfferId={pendingInterviewOffer.id}
        />
      )}

      {/* Contact Modal */}
      {pendingContactOffer && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setPendingContactOffer(null);
          }}
          onSave={handleSaveContact}
          jobOfferId={pendingContactOffer.id}
        />
      )}
    </div>
  );
}
