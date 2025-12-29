"use client";

import { useEffect } from "react";

/**
 * Provider que obtiene y establece el token CSRF en el cliente
 */
export function CSRFProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Obtener el token CSRF del servidor
    // Usar fetch sin CSRF ya que este es el endpoint que establece el token
    fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include", // Incluir cookies
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          // El token se establece automáticamente en las cookies por el servidor
          // Solo necesitamos asegurarnos de que se haya obtenido
        }
      })
      .catch((error) => {
        // No loggear errores de CSRF en producción para no saturar logs
        if (process.env.NODE_ENV === 'development') {
          console.error("Error obteniendo CSRF token:", error);
        }
      });
  }, []);

  return <>{children}</>;
}

