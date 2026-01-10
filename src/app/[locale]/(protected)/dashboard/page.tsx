"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JobOffer } from "@/types/job-offers";
import type { Interview } from "@/types/interviews";
import type { JobOfferContact } from "@/types/contacts";
import type { Badge } from "@/config/gamification/badges";
import { useToast } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

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
        message: t('errorLoading'),
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
    return t(`status.${status}`);
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
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-8">
            <div className="h-10 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-5 bg-slate-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-16 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="text-center">
          <p className="text-gray-500">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-500 text-base">
            {t('subtitle')}
          </p>
        </div>

        {/* Level and XP Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('levelAndPoints')}</h2>
            <button
              onClick={() => router.push("/gamification")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {tCommon('viewDetails')}
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">
                  {data.gamification.level}
                </div>
                <div className="text-xs text-gray-500 font-medium">{t('level')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {data.gamification.xp.toLocaleString()} XP
                  </span>
                  {data.gamification.nextLevel && (
                    <span className="text-xs text-gray-500">
                      {t('xpForLevel', {
                        xp: data.gamification.nextLevel.xpRequired.toLocaleString(),
                        level: data.gamification.nextLevel.order
                      })}
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
              <h2 className="text-xl font-bold text-gray-900">{t('recentBadges')}</h2>
              <button
                onClick={() => router.push("/gamification")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {tCommon('viewAll')}
              </button>
            </div>
            {data.recentBadges.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{t('noBadges')}</p>
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
              <h2 className="text-xl font-bold text-gray-900">{t('closestBadges')}</h2>
              <button
                onClick={() => router.push("/gamification")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {tCommon('viewAll')}
              </button>
            </div>
            {data.closestBadges.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{t('noClosestBadges')}</p>
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
            <h2 className="text-xl font-bold text-gray-900">{t('interviewsThisWeek')}</h2>
            <button
              onClick={() => router.push("/job-openings")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {tCommon('viewAll')}
            </button>
          </div>
          {data.interviewsThisWeek.length === 0 ? (
            <p className="text-gray-400 text-sm italic">{t('noInterviews')}</p>
          ) : (
            <div className="space-y-3">
              {data.interviewsThisWeek.map((interview) => {
                const scheduledDate = new Date(interview.scheduled_at);
                const isToday = scheduledDate.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={interview.id}
                    className={`p-4 rounded-xl border ${isToday
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
                          {tCommon('today')}
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
            <h2 className="text-xl font-bold text-gray-900">{t('notAppliedOffers')}</h2>
            <button
              onClick={() => router.push("/job-openings")}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {tCommon('viewAll')}
            </button>
          </div>
          {data.notAppliedOffers.length === 0 ? (
            <p className="text-gray-400 text-sm italic">{t('noNotApplied')}</p>
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
              <h2 className="text-xl font-bold text-gray-900">{t('contactsToReview')}</h2>
              <button
                onClick={() => router.push("/job-openings")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {tCommon('viewAll')}
              </button>
            </div>
            {data.contactsToReview.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{t('noContacts')}</p>
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
              <h2 className="text-xl font-bold text-gray-900">{t('recentNotes')}</h2>
              <button
                onClick={() => router.push("/job-openings")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {tCommon('viewAll')}
              </button>
            </div>
            {data.recentNotes.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{t('noNotes')}</p>
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
