"use client";

import { useDroppable } from "@dnd-kit/core";
import type { JobOffer, JobOfferStatus } from "@/types/job-offers";
import JobOfferCard from "./JobOfferCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  status: string;
  offers: JobOffer[];
  count: number;
  color: string;
  onEdit: (offer: JobOffer) => void;
  onDelete: (id: string) => void;
  onAdd: (status: JobOfferStatus) => void;
  onView?: (offer: JobOffer) => void;
}

export default function KanbanColumn({
  id,
  title,
  status,
  offers,
  count,
  color,
  onEdit,
  onDelete,
  onAdd,
  onView,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-slate-100 text-gray-600 border-slate-200";
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

  return (
    <div className="flex flex-col gap-4 min-w-[280px]">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <div className={`size-2 rounded-full ${color}`} />
          {title}
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-medium border ${getStatusBadgeColor(status)}`}
          >
            {count}
          </span>
        </h3>
        <button
          onClick={() => onAdd(status as JobOfferStatus)}
          className="text-gray-400 hover:text-primary material-symbols-outlined text-xl transition-colors"
        >
          add
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-4 min-h-[200px] transition-colors ${
          isOver ? "bg-primary/5 rounded-xl p-2" : ""
        }`}
      >
        {offers.map((offer) => (
          <JobOfferCard
            key={offer.id}
            offer={offer}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
        {offers.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No hay ofertas
          </div>
        )}
      </div>
    </div>
  );
}

