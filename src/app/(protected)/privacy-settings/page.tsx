"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const response = await fetch(`/api/user/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error("Error al exportar datos");
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `jobquest-export-${Date.now()}.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download file
      const blob = format === "json" 
        ? await response.blob()
        : await response.text().then(text => new Blob([text], { type: "text/csv" }));
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        type: "success",
        message: `Datos exportados correctamente en formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast({
        type: "error",
        message: "Error al exportar datos. Por favor, intenta de nuevo.",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "ELIMINAR") {
      showToast({
        type: "error",
        message: 'Debes escribir "ELIMINAR" para confirmar',
      });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar cuenta");
      }

      showToast({
        type: "success",
        message: "Cuenta eliminada correctamente. Serás redirigido...",
      });

      // Sign out and redirect
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      showToast({
        type: "error",
        message: error.message || "Error al eliminar cuenta. Por favor, intenta de nuevo.",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Configuración de Privacidad
          </h1>
          <p className="text-slate-600">
            Gestiona tus datos personales y privacidad según el GDPR
          </p>
        </div>

        {/* Export Data Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Exportar tus Datos
          </h2>
          <p className="text-slate-600 mb-6">
            Puedes descargar todos tus datos personales almacenados en JobQuest.
            Los datos incluyen tu perfil, CV completo, ofertas de trabajo,
            entrevistas, contactos, datos de gamificación y análisis de AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleExportData("json")}
              disabled={exporting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    refresh
                  </span>
                  Exportando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">download</span>
                  Exportar como JSON
                </>
              )}
            </button>

            <button
              onClick={() => handleExportData("csv")}
              disabled={exporting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    refresh
                  </span>
                  Exportando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">table_chart</span>
                  Exportar como CSV
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            El archivo JSON contiene todos tus datos en formato estructurado.
            El archivo CSV contiene una versión simplificada de datos tabulares.
          </p>
        </section>

        {/* Delete Account Section */}
        <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Eliminar Cuenta
          </h2>
          <p className="text-slate-600 mb-6">
            Puedes eliminar permanentemente tu cuenta y todos tus datos
            asociados. Esta acción no se puede deshacer.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">
              ⚠️ Advertencia: Esta acción es permanente
            </h3>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              <li>Se eliminará tu perfil y toda tu información personal</li>
              <li>Se eliminará tu CV completo (experiencia, educación, etc.)</li>
              <li>Se eliminarán todas tus ofertas de trabajo y aplicaciones</li>
              <li>Se eliminarán todas tus entrevistas programadas</li>
              <li>Se eliminarán todos tus contactos y notas</li>
              <li>Se eliminarán tus datos de gamificación (XP, badges, etc.)</li>
              <li>Se eliminarán tus análisis de AI guardados</li>
              <li>Se eliminarán todos los archivos subidos (fotos, imágenes)</li>
              <li>No podrás recuperar esta información después</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            Eliminar mi Cuenta
          </button>
        </section>

        {/* Links to Legal Pages */}
        <section className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Para más información, consulta nuestra{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Política de Privacidad
            </Link>{" "}
            y nuestros{" "}
            <Link
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              Términos de Servicio
            </Link>
            .
          </p>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-red-900 mb-4">
                Confirmar Eliminación de Cuenta
              </h3>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 mb-4">
                  Esta acción eliminará permanentemente tu cuenta y todos tus
                  datos. Esta acción <strong>NO se puede deshacer</strong>.
                </p>
                <p className="text-sm text-red-800 font-semibold">
                  Para confirmar, escribe <strong>"ELIMINAR"</strong> en el
                  campo de abajo:
                </p>
              </div>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Escribe ELIMINAR para confirmar"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-4"
                disabled={deleting}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== "ELIMINAR"}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin inline-block mr-2">
                        refresh
                      </span>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar Permanentemente"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

