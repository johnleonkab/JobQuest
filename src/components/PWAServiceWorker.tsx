"use client";

import { useEffect } from "react";

export default function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("Service Worker registrado:", registration.scope);

            // Verificar actualizaciones periódicamente
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Cada hora
          })
          .catch((error) => {
            console.error("Error al registrar Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}


