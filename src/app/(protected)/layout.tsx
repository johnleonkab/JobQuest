"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import OnboardingModal from "@/components/OnboardingModal";
import { ToastProvider } from "@/contexts/ToastContext";
import { CSRFProvider } from "@/components/CSRFProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ErrorBoundary>
      <CSRFProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <Sidebar />
            </aside>

            <main
              id="main-content"
              className="flex-1 overflow-y-auto bg-background-light"
              tabIndex={-1}
            >
              {/* Mobile Header - dentro del main para que no ocupe espacio en el flex */}
              <MobileHeader
                onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isMenuOpen={isMobileMenuOpen}
              />
              <OnboardingModal />
              {children}
            </main>
          </div>
        </ToastProvider>
      </CSRFProvider>
    </ErrorBoundary>
  );
}

