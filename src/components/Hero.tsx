"use client";

import Link from "next/link";
import { signInWithGoogle } from "@/lib/auth/actions";

export default function Hero() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <section className="relative py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary w-fit mx-auto lg:mx-0 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              verified
            </span>
            <span>Nueva Temporada Disponible</span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
            Convierte tu búsqueda de empleo en una{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              aventura épica
            </span>
            .
          </h1>
          <p className="mx-auto lg:mx-0 max-w-xl text-lg text-slate-600">
            Deja de enviar CVs al vacío. Organiza tus postulaciones, gana
            puntos por cada entrevista y sube de nivel hasta conseguir el
            trabajo de tus sueños.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
            <Link
              href="#register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Empezar Aventura Gratis
            </Link>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300">
              <span className="material-symbols-outlined">play_circle</span>
              Ver Demo
            </button>
          </div>
          <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
            <p className="text-sm font-medium text-slate-500">
              Únete a +10,000 jugadores contratados en:
            </p>
            <div className="flex gap-6 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-80">
              <span className="text-lg font-bold tracking-tighter text-slate-800">
                TechCorp
              </span>
              <span className="text-lg font-bold tracking-tighter text-slate-800">
                Innovate
              </span>
              <span className="text-lg font-bold tracking-tighter text-slate-800">
                FutureSystems
              </span>
            </div>
          </div>
        </div>
        <div
          className="relative w-full max-w-md mx-auto lg:ml-auto"
          id="register"
        >
          <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 opacity-40 blur-2xl animate-pulse" />
          <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-soft">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Crea tu personaje
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Comienza tu viaje en nivel 1 hoy mismo.
              </p>
            </div>
            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z" />
                  </svg>
                  Iniciar sesión con Google
                </button>
              </div>
              <div className="px-2">
                <p className="text-xs text-center text-slate-500 leading-relaxed">
                  Al continuar, aceptas nuestros{" "}
                  <Link
                    href="#"
                    className="font-medium text-primary hover:underline"
                  >
                    Términos de Servicio
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="#"
                    className="font-medium text-primary hover:underline"
                  >
                    Política de Privacidad
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

