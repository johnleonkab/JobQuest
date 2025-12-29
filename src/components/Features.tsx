export default function Features() {
  return (
    <section
      id="features"
      className="border-y border-border-light bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex items-center gap-4 group">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">XP por Progreso</h3>
              <p className="text-sm text-slate-500">
                Visualiza tu avance con métricas reales.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-primary transition-colors group-hover:bg-pink-100">
              <span className="material-symbols-outlined">
                workspace_premium
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Logros Desbloqueables
              </h3>
              <p className="text-sm text-slate-500">
                Gana medallas por consistencia y éxito.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Comunidad Activa</h3>
              <p className="text-sm text-slate-500">
                Comparte misiones con otros candidatos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

