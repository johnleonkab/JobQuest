"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { JobOffer, JobOfferStatus } from "@/types/job-offers";
import KanbanColumn from "./KanbanColumn";
import JobOfferCard from "./JobOfferCard";
import { useToast } from "@/contexts/ToastContext";

interface JobOffersKanbanProps {
  offers: JobOffer[];
  onUpdate: (offer: JobOffer) => void;
  onAdd: (status: JobOfferStatus) => void;
  onEdit: (offer: JobOffer) => void;
  onDelete: (id: string) => void;
  onView?: (offer: JobOffer) => void;
}

const COLUMNS = [
  { id: "saved", title: "Guardado", status: "saved" as JobOfferStatus, color: "bg-slate-400" },
  { id: "applied", title: "Aplicadas", status: "applied" as JobOfferStatus, color: "bg-primary" },
  { id: "contacted", title: "Contactadas", status: "contacted" as JobOfferStatus, color: "bg-primary" },
  { id: "interview", title: "Entrevista", status: "interview" as JobOfferStatus, color: "bg-amber-500" },
  { id: "offer", title: "Oferta", status: "offer" as JobOfferStatus, color: "bg-emerald-500" },
  { id: "rejected", title: "Descartada", status: "rejected" as JobOfferStatus, color: "bg-red-500" },
  { id: "accepted", title: "Conseguida", status: "accepted" as JobOfferStatus, color: "bg-emerald-600" },
];

export default function JobOffersKanban({
  offers,
  onUpdate,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: JobOffersKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localOffers, setLocalOffers] = useState<JobOffer[]>(offers);
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setLocalOffers(offers);
  }, [offers]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the offer being dragged
    const activeOffer = localOffers.find((o) => o.id === activeId);
    if (!activeOffer) return;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    if (targetColumn && targetColumn.status !== activeOffer.status) {
      // Update status
      const updatedOffer = { ...activeOffer, status: targetColumn.status };
      setLocalOffers((prev) =>
        prev.map((o) => (o.id === activeId ? updatedOffer : o))
      );

      try {
        await onUpdate(updatedOffer);
        showToast({
          type: "success",
          message: "Oferta actualizada correctamente",
        });
      } catch (error) {
        console.error("Error updating offer:", error);
        showToast({
          type: "error",
          message: "Error al actualizar la oferta",
        });
        // Revert on error
        setLocalOffers(offers);
      }
    } else {
      // Reorder within same column
      const activeIndex = localOffers.findIndex((o) => o.id === activeId);
      const overIndex = localOffers.findIndex((o) => o.id === overId);

      if (activeIndex !== overIndex) {
        setLocalOffers((prev) => arrayMove(prev, activeIndex, overIndex));
      }
    }
  };

  const getOffersByStatus = (status: JobOfferStatus) => {
    return localOffers.filter((offer) => offer.status === status);
  };

  const activeOffer = activeId ? localOffers.find((o) => o.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-start pb-10 overflow-x-auto md:overflow-x-visible">
        {COLUMNS.map((column) => {
          const columnOffers = getOffersByStatus(column.status);
          return (
            <SortableContext
              key={column.id}
              id={column.id}
              items={columnOffers.map((o) => o.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                status={column.status}
                offers={columnOffers}
                count={columnOffers.length}
                color={column.color}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdd={onAdd}
                onView={onView}
              />
            </SortableContext>
          );
        })}
      </div>
      <DragOverlay>
        {activeOffer ? (
          <div className="rotate-3 opacity-90">
            <JobOfferCard
              offer={activeOffer}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

