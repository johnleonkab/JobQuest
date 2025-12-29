import Sidebar from "@/components/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";
import { ToastProvider } from "@/contexts/ToastContext";
import { CSRFProvider } from "@/components/CSRFProvider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CSRFProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background-light">
            <OnboardingModal />
            {children}
          </main>
        </div>
      </ToastProvider>
    </CSRFProvider>
  );
}

