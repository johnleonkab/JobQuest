"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-4">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Uso de Cookies
          </h3>
          <p className="text-sm text-slate-600">
            Utilizamos cookies para mejorar tu experiencia, mantener tu sesión
            activa y proteger tu seguridad. Al continuar, aceptas nuestro uso
            de cookies.{" "}
            <a
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Más información
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

