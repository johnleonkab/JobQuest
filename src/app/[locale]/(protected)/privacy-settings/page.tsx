"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('CVBuilder.privacySettings');
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const response = await fetch(`/api/user/export?format=${format}`);

      if (!response.ok) {
        throw new Error(t('exportData.error'));
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
        message: t('exportData.success', { format: format.toUpperCase() }),
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast({
        type: "error",
        message: t('exportData.error'),
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "ELIMINAR") {
      showToast({
        type: "error",
        message: t('deleteAccount.errorMatch'),
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
        throw new Error(error.error || t('deleteAccount.error'));
      }

      showToast({
        type: "success",
        message: t('deleteAccount.success'),
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
        message: error.message || t('deleteAccount.error'),
      });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Export Data Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t('exportData.title')}
          </h2>
          <p className="text-slate-600 mb-6">
            {t('exportData.description')}
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
                  {t('exportData.exporting')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">download</span>
                  {t('exportData.jsonBtn')}
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
                  {t('exportData.exporting')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">table_chart</span>
                  {t('exportData.csvBtn')}
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {t('exportData.note')}
          </p>
        </section>

        {/* Delete Account Section */}
        <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            {t('deleteAccount.title')}
          </h2>
          <p className="text-slate-600 mb-6">
            {t('deleteAccount.description')}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">
              {t('deleteAccount.warningTitle')}
            </h3>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              <li>{t('deleteAccount.warningList.profile')}</li>
              <li>{t('deleteAccount.warningList.cv')}</li>
              <li>{t('deleteAccount.warningList.offers')}</li>
              <li>{t('deleteAccount.warningList.interviews')}</li>
              <li>{t('deleteAccount.warningList.contacts')}</li>
              <li>{t('deleteAccount.warningList.gamification')}</li>
              <li>{t('deleteAccount.warningList.ai')}</li>
              <li>{t('deleteAccount.warningList.files')}</li>
              <li>{t('deleteAccount.warningList.irreversible')}</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            {t('deleteAccount.deleteBtn')}
          </button>
        </section>

        {/* Links to Legal Pages */}
        <section className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {t('legalLinks.text')}{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              {t('legalLinks.privacy')}
            </Link>{" "}
            {/* y nuestros{" "} */}
            <Link
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              {t('legalLinks.terms')}
            </Link>
            .
          </p>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-red-900 mb-4">
                {t('deleteAccount.modalTitle')}
              </h3>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('deleteAccount.modalDescription') }} />
                <p className="text-sm text-red-800 font-semibold" dangerouslySetInnerHTML={{ __html: t.raw('deleteAccount.modalConfirm') }} />
              </div>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={t('deleteAccount.placeholder')}
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
                  {t('deleteAccount.cancel')}
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
                      {t('deleteAccount.deleting')}
                    </>
                  ) : (
                    t('deleteAccount.confirmBtn')
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


