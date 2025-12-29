"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JobOffer } from "@/types/job-offers";
import type { Interview } from "@/types/interviews";
import type { JobOfferContact } from "@/types/contacts";
import type { Badge } from "@/config/gamification/badges";
import { useToast } from "@/contexts/ToastContext";

interface DashboardData {
  gamification: {
    xp: number;
    level: number;
    nextLevel: {
      order: number;
      xpRequired: number;
    } | null;
    progress: number;
  };
  recentBadges: (Badge & { earnedAt?: string })[];
  closestBadges: (Badge & { progress: number; current: number; required: number; earned: boolean })[];
  interviewsThisWeek: (Interview & { job_offers: { company_name: string; position: string } })[];
  notAppliedOffers: JobOffer[];
  contactsToReview: (JobOfferContact & { job_offers: { company_name: string; position: string; status: string } })[];
  recentNotes: {
    id: string;
    company_name: string;
    position: string;
    status: string;
    last_note: string;
    updated_at: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast({
        type: "error",
        message: "Error al cargar los datos del dashboard",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        return "bg-slate-100 text-slate-600";
      case "contacted":
      case "applied":
        return "bg-purple-50 text-primary";
      case "interview":
        return "bg-amber-50 text-amber-600";
      case "offer":
        return "bg-emerald-50 text-emerald-600";
      case "accepted":
        return "bg-emerald-50 text-emerald-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-4">
              hourglass_empty
            </span>
            <p className="text-gray-500">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="text-center">
          <p className="text-gray-500">Error al cargar los datos del dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 text-base">
            Resumen de tu progreso y actividades
          </p>
        </div>

        {/* Level and XP Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nivel y Puntos</h2>
            <button
              onClick={() => router.push("/gamification")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Ver detalles →
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">
                  {data.gamification.level}
                </div>
                <div className="text-xs text-gray-500 font-medium">Nivel</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {data.gamification.xp.toLocaleString()} XP
                  </span>
                  {data.gamification.nextLevel && (
                    <span className="text-xs text-gray-500">
                      {data.gamification.nextLevel.xpRequired.toLocaleString()} XP para nivel {data.gamification.nextLevel.order}
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${data.gamification.progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Badges */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Últimos Badges</h2>
              <button
                onClick={() => router.push("/gamification")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todos →
              </button>
            </div>
            {data.recentBadges.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Aún no has conseguido badges</p>
            ) : (
              <div className="space-y-3">
                {data.recentBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {badge.icon || "workspace_premium"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{badge.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Closest Badges */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Próximos Badges</h2>
              <button
                onClick={() => router.push("/gamification")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todos →
              </button>
            </div>
            {data.closestBadges.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No hay badges cercanos</p>
            ) : (
              <div className="space-y-3">
                {data.closestBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 opacity-50">
                        <span className="material-symbols-outlined text-xl text-gray-600">
                          {badge.icon || "workspace_premium"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{badge.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{badge.description}</p>
                      </div>
                    </div>
                    <div className="ml-13">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          {badge.current} / {badge.required}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {Math.round(badge.progress * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${badge.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interviews This Week */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Entrevistas Esta Semana</h2>
            <button
              onClick={() => router.push("/job-openings")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Ver todas →
            </button>
          </div>
          {data.interviewsThisWeek.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No hay entrevistas programadas esta semana</p>
          ) : (
            <div className="space-y-3">
              {data.interviewsThisWeek.map((interview) => {
                const scheduledDate = new Date(interview.scheduled_at);
                const isToday = scheduledDate.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={interview.id}
                    className={`p-4 rounded-xl border ${
                      isToday
                        ? "bg-amber-50 border-amber-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {interview.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {interview.job_offers.company_name} - {interview.job_offers.position}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            {formatDate(interview.scheduled_at)}
                          </span>
                          {interview.location && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              {interview.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {isToday && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          Hoy
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Not Applied Offers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Trabajos Sin Aplicar</h2>
            <button
              onClick={() => router.push("/job-openings")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Ver todas →
            </button>
          </div>
          {data.notAppliedOffers.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No hay ofertas pendientes de aplicar</p>
          ) : (
            <div className="space-y-3">
              {data.notAppliedOffers.slice(0, 5).map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 rounded-xl border bg-white border-gray-200 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => {
                      router.push(`/job-openings`);
                      // Small delay to ensure navigation happens, then trigger view
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('viewJobOffer', { detail: { offerId: offer.id } }));
                      }, 100);
                    }}
                  >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{offer.position}</h3>
                      <p className="text-sm text-gray-600 mb-2">{offer.company_name}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {getStatusLabel(offer.status)}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contacts to Review */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Contactos a Revisar</h2>
              <button
                onClick={() => router.push("/job-openings")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todos →
              </button>
            </div>
            {data.contactsToReview.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No hay contactos para revisar</p>
            ) : (
              <div className="space-y-3">
                {data.contactsToReview.slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => {
                      router.push(`/job-openings`);
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('viewJobOffer', { detail: { offerId: contact.job_offer_id } }));
                      }, 100);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {contact.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {contact.job_offers.company_name} - {contact.job_offers.position}
                        </p>
                        {contact.role && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mb-1">
                            {contact.role}
                          </span>
                        )}
                        {contact.email && (
                          <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Notas Recientes</h2>
              <button
                onClick={() => router.push("/job-openings")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todas →
              </button>
            </div>
            {data.recentNotes.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No hay notas recientes</p>
            ) : (
              <div className="space-y-3">
                {data.recentNotes.map((note) => {
                  const noteParts = note.last_note.split(": ");
                  const noteDate = noteParts[0] || "";
                  const noteContent = noteParts.slice(1).join(": ");
                  return (
                    <div
                      key={note.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => {
                        router.push(`/job-openings`);
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('viewJobOffer', { detail: { offerId: note.id } }));
                        }, 100);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {note.company_name} - {note.position}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">{noteDate}</p>
                          <p className="text-xs text-gray-700 line-clamp-2">{noteContent}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
