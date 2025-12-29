"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  // useToast está disponible porque este componente solo se renderiza dentro de ToastProvider
  const { showToast } = useToast();

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detectar si la app ya está instalada
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Detectar beforeinstallprompt para Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt después de que el usuario haya interactuado
      const hasInteracted = sessionStorage.getItem("pwa-user-interacted") === "true";
      const dismissedBefore = localStorage.getItem("pwa-install-dismissed") === "true";
      
      if (!dismissedBefore) {
        // Esperar un poco antes de mostrar el prompt
        setTimeout(() => {
          if (hasInteracted) {
            setShowAndroidPrompt(true);
          }
        }, 3000);
      }
    };

    // Detectar instalación exitosa
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowAndroidPrompt(false);
      setShowIOSPrompt(false);
      if (showToast) {
        showToast({
          type: "success",
          message: "¡JobQuest instalado correctamente!",
        });
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Marcar interacción del usuario
    const markInteraction = () => {
      sessionStorage.setItem("pwa-user-interacted", "true");
    };

    const events = ["click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, markInteraction, { once: true });
    });

    // Para iOS, mostrar prompt después de interacción
    if (iOS) {
      const hasInteracted = sessionStorage.getItem("pwa-user-interacted") === "true";
      const dismissedBefore = localStorage.getItem("pwa-ios-install-dismissed") === "true";
      
      if (!dismissedBefore && hasInteracted) {
        setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
      } else if (!dismissedBefore) {
        // Si aún no ha interactuado, esperar a que lo haga
        const checkInteraction = setInterval(() => {
          if (sessionStorage.getItem("pwa-user-interacted") === "true") {
            clearInterval(checkInteraction);
            setTimeout(() => {
              setShowIOSPrompt(true);
            }, 3000);
          }
        }, 1000);
        
        // Limpiar después de 30 segundos si no hay interacción
        setTimeout(() => clearInterval(checkInteraction), 30000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      events.forEach((event) => {
        window.removeEventListener(event, markInteraction);
      });
    };
  }, [showToast]);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted" && showToast) {
        showToast({
          type: "success",
          message: "Instalando JobQuest...",
        });
      }
      
      setDeferredPrompt(null);
      setShowAndroidPrompt(false);
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  const handleDismissAndroid = () => {
    setShowAndroidPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleDismissIOS = () => {
    setShowIOSPrompt(false);
    localStorage.setItem("pwa-ios-install-dismissed", "true");
  };

  // No mostrar si ya está instalado
  if (isInstalled) return null;

  return (
    <>
      {/* Android Install Prompt */}
      {showAndroidPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up lg:hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md shadow-primary/20 flex-shrink-0">
                <span className="material-symbols-outlined filled text-2xl">
                  diamond
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">Instala JobQuest</h3>
                <p className="text-sm text-slate-600">
                  Acceso rápido desde tu pantalla de inicio
                </p>
              </div>
              <button
                onClick={handleDismissAndroid}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismissAndroid}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Ahora no
              </button>
              <button
                onClick={handleInstallAndroid}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 transition-colors shadow-lg shadow-primary/25"
              >
                Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 lg:hidden animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined filled text-2xl">
                    diamond
                  </span>
                </div>
                <h3 className="font-bold text-slate-900">Instala JobQuest</h3>
              </div>
              <button
                onClick={handleDismissIOS}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Para instalar JobQuest en tu iPhone:
            </p>
            <ol className="space-y-3 mb-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                  1
                </span>
                <span>Toca el botón <span className="font-semibold">Compartir</span> en la parte inferior</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                  2
                </span>
                <span>Selecciona <span className="font-semibold">"Agregar a pantalla de inicio"</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                  3
                </span>
                <span>Toca <span className="font-semibold">"Agregar"</span> para confirmar</span>
              </li>
            </ol>
            <button
              onClick={handleDismissIOS}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 transition-colors shadow-lg shadow-primary/25"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

