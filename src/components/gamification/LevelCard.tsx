import { Level, getNextLevel } from '@/config/gamification/levels';

interface LevelCardProps {
  level: Level;
  isCurrent: boolean;
  isUnlocked: boolean;
  currentXp: number;
}

export default function LevelCard({
  level,
  isCurrent,
  isUnlocked,
  currentXp,
}: LevelCardProps) {
  const nextLevel = getNextLevel(currentXp);
  const progress = isCurrent && nextLevel
    ? Math.min(((currentXp - level.requiredXp) / (nextLevel.requiredXp - level.requiredXp)) * 100, 100)
    : 0;

  if (isCurrent) {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-xl shadow-primary/10 relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <div className="absolute -right-8 -top-8 bg-primary/5 size-40 rounded-full blur-3xl" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div
            className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30"
            style={{ backgroundColor: level.color || '#db2777' }}
          >
            <span className="material-symbols-outlined text-2xl">
              {level.icon}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-primary text-white rounded-full uppercase tracking-wider animate-pulse shadow-sm">
            Nivel Actual
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1 relative z-10">
          {level.name}
        </h3>
        <p className="text-sm text-slate-500 mb-5 relative z-10 leading-relaxed">
          {level.description}
        </p>
        {nextLevel && nextLevel.requiredXp > level.requiredXp && (
          <>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 relative z-10 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-primary uppercase tracking-wide relative z-10">
              <span>{currentXp.toLocaleString()} XP</span>
              <span className="text-gray-300">
                {nextLevel ? `${nextLevel.requiredXp.toLocaleString()} XP Meta` : 'Nivel Máximo'}
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  if (isUnlocked) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-8xl text-gray-400">
            {level.icon}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div
            className="size-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${level.color || '#6366f1'}20`,
              color: level.color || '#6366f1',
            }}
          >
            <span className="material-symbols-outlined text-xl">
              {level.icon}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-wider">
            Desbloqueado
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">
          {level.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 relative z-10 leading-relaxed">
          {level.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 relative z-10">
          <span className="material-symbols-outlined text-sm">star</span>
          <span>{level.requiredXp.toLocaleString()} XP</span>
        </div>
      </div>
    );
  }

  // Locked level
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden opacity-60 hover:opacity-80 transition-opacity">
      <div className="flex items-center justify-between mb-4">
        <div className="size-10 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{level.icon}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full uppercase tracking-wider">
          Bloqueado
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-700 mb-1">{level.name}</h3>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        {level.description}
      </p>
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span>{level.requiredXp.toLocaleString()} XP</span>
      </div>
    </div>
  );
}


