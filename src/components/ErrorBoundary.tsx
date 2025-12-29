"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Import error tracker dynamically to avoid SSR issues
    import("@/lib/error-tracking").then(({ errorTracker }) => {
      errorTracker.captureException(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100">
                <span className="material-symbols-outlined text-3xl text-red-600">
                  error
                </span>
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              Algo salió mal
            </h1>
            <p className="mb-6 text-slate-600">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
              recargar la página.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                Recargar página
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-lg">home</span>
                Ir al inicio
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-slate-100 p-4 text-xs text-slate-800">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

