"use client";

import Image from "next/image";
import type { JobOffer, JobOfferStatus } from "@/types/job-offers";

interface JobOffersListViewProps {
  offers: JobOffer[];
  onEdit: (offer: JobOffer) => void;
  onDelete: (id: string) => void;
  onView: (offer: JobOffer) => void;
}

const STATUS_LABELS: Record<JobOfferStatus, string> = {
  saved: "Guardada",
  contacted: "Contactada",
  applied: "Aplicada",
  interview: "Entrevista",
  offer: "Oferta",
  rejected: "Descartada",
  accepted: "Conseguida",
};

const STATUS_COLORS: Record<JobOfferStatus, string> = {
  saved: "bg-slate-400",
  contacted: "bg-primary",
  applied: "bg-primary",
  interview: "bg-amber-500",
  offer: "bg-emerald-500",
  rejected: "bg-red-500",
  accepted: "bg-emerald-600",
};

export default function JobOffersListView({
  offers,
  onEdit,
  onDelete,
  onView,
}: JobOffersListViewProps) {

  // Simple date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("es-ES", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "—";
    }
  };

  const formatSalary = (offer: JobOffer) => {
    if (offer.salary_range_min && offer.salary_range_max) {
      return `€${offer.salary_range_min.toLocaleString()} - €${offer.salary_range_max.toLocaleString()}`;
    }
    if (offer.salary_range_min) {
      return `Desde €${offer.salary_range_min.toLocaleString()}`;
    }
    if (offer.salary_range_max) {
      return `Hasta €${offer.salary_range_max.toLocaleString()}`;
    }
    return "—";
  };

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
          work_off
        </span>
        <p className="text-gray-500 text-lg font-medium">No hay ofertas para mostrar</p>
        <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o crear una nueva oferta</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Empresa / Puesto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Salario
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr
                key={offer.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(offer)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {offer.company_logo_url && offer.company_logo_url.startsWith('http') ? (
                      <Image
                        src={offer.company_logo_url}
                        alt={offer.company_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">
                          business
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{offer.company_name}</div>
                      <div className="text-sm text-gray-500">{offer.position}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[offer.status]}`}
                  >
                    {STATUS_LABELS[offer.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {offer.job_type
                    ? offer.job_type === "full-time"
                      ? "Tiempo Completo"
                      : offer.job_type === "part-time"
                      ? "Medio Tiempo"
                      : offer.job_type === "contract"
                      ? "Contrato"
                      : "Prácticas"
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatSalary(offer)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(offer.application_date || offer.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(offer);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-primary"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("¿Estás seguro de que quieres eliminar esta oferta?")) {
                          onDelete(offer.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

