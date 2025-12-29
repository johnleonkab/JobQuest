"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function TestRateLimitPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const testRateLimit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-rate-limit");
      const data = await response.json();

      if (response.status === 429) {
        setResults((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            status: "RATE_LIMITED",
            message: "✅ Rate limit funcionando - Request bloqueado",
            data: data,
          },
        ]);
        showToast({
          type: "info",
          message: `Rate limit alcanzado. Intenta de nuevo en ${data.retryAfter} segundos`,
        });
      } else if (response.ok) {
        setResults((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            status: "SUCCESS",
            message: "✅ Request exitoso",
            data: data,
          },
        ]);
        showToast({
          type: "success",
          message: `Requests restantes: ${data.rateLimit.remaining}`,
        });
      } else {
        setResults((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            status: "ERROR",
            message: "❌ Error en el request",
            data: data,
          },
        ]);
        showToast({
          type: "error",
          message: "Error al probar rate limit",
        });
      }
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          status: "ERROR",
          message: "❌ Error de red",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
      showToast({
        type: "error",
        message: "Error de conexión",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Prueba de Rate Limiting</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información</h2>
        <p className="text-gray-700 mb-4">
          Este endpoint permite probar el sistema de rate limiting. Haz múltiples
          requests rápidos para ver cómo se aplica el límite.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Límite de prueba:</strong> 5 requests por minuto
          </li>
          <li>
            <strong>Endpoint:</strong> <code>/api/test-rate-limit</code>
          </li>
          <li>
            <strong>Upstash Redis:</strong> Se usará si está configurado, sino
            usará memoria
          </li>
        </ul>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testRateLimit}
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Probando..." : "Hacer Request de Prueba"}
        </button>
        <button
          onClick={clearResults}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
        >
          Limpiar Resultados
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados ({results.length})</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                result.status === "SUCCESS"
                  ? "border-green-500 bg-green-50"
                  : result.status === "RATE_LIMITED"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{result.message}</span>
                <span className="text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {result.data && (
                <div className="mt-3 space-y-2">
                  {result.data.rateLimit && (
                    <div className="text-sm">
                      <strong>Rate Limit:</strong>{" "}
                      {result.data.rateLimit.remaining} de{" "}
                      {result.data.rateLimit.limit} requests restantes
                    </div>
                  )}
                  {result.data.configuration && (
                    <div className="text-sm">
                      <strong>Configuración:</strong>{" "}
                      {result.data.configuration.usingUpstash
                        ? "✅ Usando Upstash Redis"
                        : "⚠️ Usando memoria (solo desarrollo)"}
                    </div>
                  )}
                  {result.data.upstash && (
                    <div className="text-sm">
                      <strong>Upstash:</strong> {result.data.upstash.url},{" "}
                      {result.data.upstash.token}
                    </div>
                  )}
                  {result.data.retryAfter && (
                    <div className="text-sm text-yellow-700">
                      <strong>Retry After:</strong> {result.data.retryAfter}{" "}
                      segundos
                    </div>
                  )}
                </div>
              )}
              {result.error && (
                <div className="mt-2 text-sm text-red-700">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Haz clic en "Hacer Request de Prueba" para comenzar
        </div>
      )}
    </div>
  );
}

