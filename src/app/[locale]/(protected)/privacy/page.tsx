import { useTranslations } from "next-intl";

export const metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de JobQuest",
};

export default function PrivacyPage() {
  const t = useTranslations('CVBuilder.privacyPolicy');
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">
            {t('lastUpdated', {
              date: new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            })}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.0.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.0.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.0.list.0')}</li>
              <li>{t('sections.0.list.1')}</li>
              <li>{t('sections.0.list.2')}</li>
              <li>{t('sections.0.list.3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.1.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.1.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.1.list.0')}</li>
              <li>{t('sections.1.list.1')}</li>
              <li>{t('sections.1.list.2')}</li>
              <li>{t('sections.1.list.3')}</li>
              <li>{t('sections.1.list.4')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.2.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.2.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.2.list.0')}</li>
              <li>{t('sections.2.list.1')}</li>
              <li>{t('sections.2.list.2')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.3.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.3.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.3.list.0')}</li>
              <li>{t('sections.3.list.1')}</li>
              <li>{t('sections.3.list.2')}</li>
              <li>{t('sections.3.list.3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.4.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.4.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.4.list.0')}</li>
              <li>{t('sections.4.list.1')}</li>
              <li>{t('sections.4.list.2')}</li>
              <li>{t('sections.4.list.3')}</li>
              <li>{t('sections.4.list.4')}</li>
            </ul>
            <p className="mb-4 text-slate-700">
              {t('sections.4.footer')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.5.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.5.content')}
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>{t('sections.5.list.0')}</li>
              <li>{t('sections.5.list.1')}</li>
              <li>{t('sections.5.list.2')}</li>
            </ul>
            <p className="mb-4 text-slate-700">
              {t('sections.5.footer')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.6.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.6.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.7.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.7.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.8.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.8.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

