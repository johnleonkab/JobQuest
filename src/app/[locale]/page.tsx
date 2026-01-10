import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DashboardPreview from "@/components/DashboardPreview";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light text-slate-800 antialiased">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-pink-50 to-transparent -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl -z-10" />

      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Hero />
        <Features />
        <DashboardPreview />
      </main>
      <Footer />
    </div>
  );
}
