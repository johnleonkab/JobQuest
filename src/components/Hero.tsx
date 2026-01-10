"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from "@/lib/auth/actions";
import { analytics } from "@/lib/analytics";
import { useTranslations } from "next-intl";

type AuthMode = "register" | "login";

export default function Hero() {
  const router = useRouter();
  const t = useTranslations('Hero');
  const [mode, setMode] = useState<AuthMode>("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      analytics.signIn();
    } catch (error) {
      const { logger } = await import("@/lib/utils/logger");
      logger.error("Error signing in", error);

      setError(
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión con Google"
      );

      // Track error
      if (typeof window !== "undefined") {
        import("@/lib/error-tracking").then(({ errorTracker }) => {
          errorTracker.captureException(
            error instanceof Error ? error : new Error(String(error)),
            { action: "sign_in" }
          );
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "register") {
        const result = await signUpWithEmail(formData.email, formData.password, formData.fullName);

        // Check if email confirmation is required
        if (result.user && !result.session) {
          // Email confirmation required
          setSuccess(
            "¡Registro exitoso! 📧 Revisa tu email para confirmar tu cuenta. Haz clic en el enlace que te enviamos para activar tu cuenta."
          );
        } else if (result.session) {
          // User is already logged in (email confirmation disabled)
          setSuccess("¡Bienvenido a JobQuest! 🎉");
          analytics.signUp();
          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1500);
        } else {
          setSuccess("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
        }

        analytics.signUp();
        // Reset form
        setFormData({ email: "", password: "", fullName: "" });
      } else {
        await signInWithEmail(formData.email, formData.password);
        analytics.signIn();
        // Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || `Error al ${mode === "register" ? "registrarse" : "iniciar sesión"}`;
      setError(errorMessage);

      // Track error
      if (typeof window !== "undefined") {
        import("@/lib/error-tracking").then(({ errorTracker }) => {
          errorTracker.captureException(
            error instanceof Error ? error : new Error(String(error)),
            { action: mode === "register" ? "sign_up" : "sign_in" }
          );
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "register" ? "login" : "register");
    setError(null);
    setSuccess(null);
    setFormData({ email: "", password: "", fullName: "" });
  };

  return (
    <section className="relative py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary w-fit mx-auto lg:mx-0 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              verified
            </span>
            <span>{t('newSeason')}</span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
            {t('titlePrefix')}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
            .
          </h1>
          <p className="mx-auto lg:mx-0 max-w-xl text-lg text-slate-600">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
            <Link
              href="#register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Empezar aventura gratis - Registrarse"
            >
              <span className="material-symbols-outlined" aria-hidden="true">rocket_launch</span>
              {t('startAdventure')}
            </Link>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Ver demo de la aplicación"
            >
              <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
              {t('watchDemo')}
            </button>
          </div>
          <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
            <p className="text-sm font-medium text-slate-500">
              {t('joinPlayers')}
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
                {mode === "register" ? t('createCharacter') : t('loginTitle')}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {mode === "register"
                  ? t('registerSubtitle')
                  : t('loginSubtitle')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>

              {/* Full Name Input (only for register) */}
              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-slate-700"
                  >
                    {t('fullName')}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Juan Pérez"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  disabled={loading}
                />
                {mode === "register" && (
                  <p className="text-xs text-slate-500">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Cargando..."
                  : mode === "register"
                    ? t('createAccountBtn')
                    : t('loginBtn')}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-4">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs font-medium text-slate-500">o</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Iniciar sesión con Google"
              >
                <svg
                  className="size-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z" />
                </svg>
                {t('continueGoogle')}
              </button>

              {/* Toggle Mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-slate-600 hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {mode === "register" ? (
                    <>
                      {t('alreadyAccount')}{" "}
                      <span className="font-semibold text-primary">
                        {t('login')}
                      </span>
                    </>
                  ) : (
                    <>
                      {t('noAccount')}{" "}
                      <span className="font-semibold text-primary">
                        {t('register')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Terms */}
              <div className="px-2">
                <p className="text-xs text-center text-slate-500 leading-relaxed">
                  {t('terms')}{" "}
                  {/* Warning: Complex nesting for terms text might need Rich Text features of next-intl or just split strings. I split widely. */}
                  <Link
                    href="/terms"
                    className="font-medium text-primary hover:underline"
                  >
                    {t('termsLink')}
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary hover:underline"
                  >
                    {t('privacyLink')}
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
