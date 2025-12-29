import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md shadow-primary/20">
            <span className="material-symbols-outlined filled text-[20px]">
              diamond
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            JobQuest
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            Características
          </Link>
          <Link
            href="#how-to-play"
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            Cómo Jugar
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            Precios
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="#register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}

