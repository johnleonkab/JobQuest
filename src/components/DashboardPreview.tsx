import { useTranslations } from 'next-intl';

export default function DashboardPreview() {
  const t = useTranslations('DashboardPreview');

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6 md:grid-rows-2 h-auto md:h-[600px]">
        {/* Kanban Board */}
        <div className="group relative md:col-span-4 md:row-span-2 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -z-0 opacity-50" />
          <div className="p-8 relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-bold text-slate-900">
              {t('kanbanTitle')}
            </h3>
            <p className="mt-2 max-w-sm text-slate-500">
              {t('kanbanDesc')}
            </p>
            <div className="mt-8 flex-1 w-full rounded-t-2xl bg-slate-50 border border-slate-100 p-5 flex gap-4 overflow-hidden mask-bottom shadow-inner">
              <div className="w-1/3 flex flex-col gap-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {t('todo')}
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="h-1.5 w-8 rounded-full bg-orange-300 mb-3" />
                  <div className="h-2 w-3/4 rounded bg-slate-100 mb-2" />
                  <div className="h-2 w-1/2 rounded bg-slate-100" />
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="h-1.5 w-8 rounded-full bg-blue-300 mb-3" />
                  <div className="h-2 w-2/3 rounded bg-slate-100 mb-2" />
                </div>
              </div>
              <div className="w-1/3 flex flex-col gap-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {t('interview')}
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm border border-primary/20 ring-1 ring-primary/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-1.5 w-8 rounded-full bg-green-300" />
                    <span className="text-[10px] text-primary font-bold bg-pink-50 px-2 py-0.5 rounded-full">
                      +50 XP
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-100 mb-2" />
                  <div className="h-2 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
              <div className="w-1/3 flex flex-col gap-3 opacity-40">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {t('offer')}
                </div>
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-3 flex items-center justify-center h-24 bg-slate-50">
                  <span className="material-symbols-outlined text-slate-300">
                    add
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20" />
        </div>

        {/* Daily Missions */}
        <div className="md:col-span-2 md:row-span-1 overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative">
          <div className="flex items-start justify-between relative z-10">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              {t('dailyMissionsActive')}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 relative z-10">
            {t('dailyMissionsTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-500 relative z-10">
            {t('dailyMissionsDesc')}
          </p>
          <div className="mt-5 h-2.5 w-full rounded-full bg-slate-100 relative z-10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-purple-400" />
          </div>
          <p className="mt-2 text-right text-xs font-medium text-slate-500 relative z-10">
            {t('dailyMissionsProgress')}
          </p>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-2xl z-0" />
        </div>

        {/* Statistics */}
        <div className="md:col-span-2 md:row-span-1 overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-slate-900 to-slate-800 p-6 relative text-white shadow-lg">
          <div className="absolute right-0 top-0 size-40 bg-primary/30 blur-[50px]" />
          <div className="absolute bottom-0 left-0 size-32 bg-purple-500/20 blur-[40px]" />
          <h3 className="relative z-10 text-lg font-bold text-white/90">
            {t('statsTitle')}
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-3xl font-black text-white">12</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {t('statsInterviews')}
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-primary">85%</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {t('statsResponse')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


