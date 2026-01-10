'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (newLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: newLocale });
        });
    };

    return (
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
                onClick={() => onSelectChange('es')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${locale === 'es'
                        ? 'bg-white dark:bg-slate-600 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                disabled={isPending}
                aria-label="Cambiar a Español"
            >
                ES
            </button>
            <button
                onClick={() => onSelectChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${locale === 'en'
                        ? 'bg-white dark:bg-slate-600 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                disabled={isPending}
                aria-label="Switch to English"
            >
                EN
            </button>
        </div>
    );
}
