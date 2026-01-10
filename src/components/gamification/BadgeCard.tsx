import { Badge } from '@/config/gamification/badges';
import { getBadgeProgressDetails } from '@/config/gamification/badges';
import { useTranslations, useLocale } from 'next-intl';

interface BadgeCardProps {
  badge: Badge;
  isEarned: boolean;
  earnedAt?: string;
  progress: number;
  eventCounts: Record<string, number>;
}

export default function BadgeCard({
  badge,
  isEarned,
  earnedAt,
  progress,
  eventCounts,
}: BadgeCardProps) {
  const t = useTranslations('gamification.card');
  const locale = useLocale();
  const progressDetails = getBadgeProgressDetails(badge, eventCounts);

  if (isEarned) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-8xl text-gray-400">
            {badge.icon}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div
            className="size-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${badge.iconColor || '#db2777'}20`,
              color: badge.iconColor || '#db2777',
            }}
          >
            <span className="material-symbols-outlined text-xl">
              {badge.icon}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-wider">
            {t('earned')}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">
          {badge.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 relative z-10 leading-relaxed">
          {badge.description}
        </p>
        {earnedAt && (
          <div className="text-[10px] text-gray-400 relative z-10">
            {new Date(earnedAt).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )}
      </div>
    );
  }

  // Locked badge with progress
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
      <div className="flex items-center justify-between mb-4">
        <div className="size-10 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{badge.icon}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full uppercase tracking-wider">
          {t('locked')}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-700 mb-1">{badge.name}</h3>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        {badge.description}
      </p>
      <div className="space-y-2">
        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
          {t('progress')}
        </div>
        {progressDetails.map((detail, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{detail.current}/{detail.required}</span>
              <span>{Math.round(detail.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${detail.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


