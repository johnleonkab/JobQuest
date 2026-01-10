"use client";

import { useState } from "react";
import Image from "next/image";
import type { JobOffer } from "@/types/job-offers";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations, useLocale } from "next-intl";

interface JobOfferCardProps {
  offer: JobOffer;
  onEdit: (offer: JobOffer) => void;
  onDelete: (id: string) => void;
  onView?: (offer: JobOffer) => void;
}

export default function JobOfferCard({
  offer,
  onEdit,
  onDelete,
  onView,
}: JobOfferCardProps) {
  const t = useTranslations('kanban');
  const tToast = useTranslations('toast');
  const locale = useLocale();
  const [showMenu, setShowMenu] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: offer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : "all 0.2s ease-in-out",
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-slate-400";
      case "contacted":
        return "bg-primary";
      case "applied":
        return "bg-primary";
      case "interview":
        return "bg-amber-500";
      case "offer":
        return "bg-emerald-500";
      case "rejected":
        return "bg-red-500";
      case "accepted":
        return "bg-emerald-600";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "interview":
        return offer.interview_date && new Date(offer.interview_date).toDateString() === new Date().toDateString()
          ? { text: t('today'), bg: "bg-amber-50", border: "border-amber-100", textColor: "text-amber-600" }
          : null;
      case "offer":
        return { text: "🎉", bg: "", border: "", textColor: "" };
      default:
        return null;
    }
  };

  const salaryRange =
    offer.salary_range_min && offer.salary_range_max
      ? `$${offer.salary_range_min}k-${offer.salary_range_max}k`
      : offer.salary_range_min
        ? `$${offer.salary_range_min}k+`
        : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onView && onView(offer)}
      className={`bg-white p-4 rounded-xl border border-gray-200 hover:border-primary/40 cursor-pointer group transition-all duration-200 ease-in-out hover:translate-y-[-2px] shadow-sm hover:shadow-md fade-in ${offer.status === "offer" ? "bg-gradient-to-br from-white to-emerald-50/50 border-emerald-300/30" : ""
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="bg-gray-50 p-1.5 rounded-lg size-10 flex items-center justify-center border border-gray-100">
          {offer.company_logo_url && offer.company_logo_url.startsWith('http') ? (
            <Image
              alt={`${offer.company_name} Logo`}
              width={24}
              height={24}
              className="size-6 object-contain"
              src={offer.company_logo_url}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
              unoptimized
            />
          ) : (
            <span className="text-gray-400 font-bold text-sm">
              {offer.company_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {getStatusBadge(offer.status) && (
            <span
              className={`text-[10px] font-bold ${getStatusBadge(offer.status)?.bg} ${getStatusBadge(offer.status)?.textColor} px-2 py-0.5 rounded uppercase tracking-wide border ${getStatusBadge(offer.status)?.border}`}
            >
              {getStatusBadge(offer.status)?.text}
            </span>
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-gray-400 hover:text-gray-600 material-symbols-outlined"
            >
              more_horiz
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(offer);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(tToast('deleteConfirm'))) {
                      onDelete(offer.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  {t('delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <h4 className="text-gray-900 font-bold text-lg leading-tight mb-1">
        {offer.position}
      </h4>
      <p className="text-gray-500 text-sm mb-4">{offer.company_name}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {offer.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-500 font-medium border border-gray-200/50"
          >
            {tag}
          </span>
        ))}
        {salaryRange && (
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold border ${offer.status === "offer"
              ? "bg-emerald-100 text-emerald-600 border-emerald-200"
              : "bg-gray-50 text-gray-500 border-gray-200/50"
              }`}
          >
            {salaryRange}
          </span>
        )}
      </div>
      {offer.status === "interview" && offer.interview_date && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
          <div
            className="bg-amber-500 h-1.5 rounded-full"
            style={{ width: "60%" }}
          />
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">
            {offer.status === "interview" ? "videocam" : "schedule"}
          </span>
          {formatDate(offer.created_at)}
        </span>
        {offer.status === "interview" && (
          <span className="text-amber-500 font-bold">+100 XP</span>
        )}
        {offer.status === "offer" && (
          <span className="text-emerald-600 font-bold text-sm">+500 XP</span>
        )}
        {offer.status === "saved" && (
          <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            +10 XP
          </span>
        )}
      </div>
    </div>
  );
}

