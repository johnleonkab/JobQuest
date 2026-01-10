import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('Navigation');
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

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {t('features')}
            </Link>
            <Link
              href="#how-to-play"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {t('howToPlay')}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {t('pricing')}
            </Link>
          </nav>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

