"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-5xl text-primary">
              search_off
            </span>
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold text-slate-900">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-slate-700">
          Página no encontrada
        </h2>
        <p className="mb-8 text-slate-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

