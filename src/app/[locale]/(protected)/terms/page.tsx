import { useTranslations } from "next-intl";

export const metadata = {
  title: "Términos de Servicio",
  description: "Términos y condiciones de uso de JobQuest",
};

export default function TermsPage() {
  const t = useTranslations('CVBuilder.terms');
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
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.1.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.1.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.2.title')}
            </h2>
            <p className="mb-4 text-slate-700">
              {t('sections.2.content')}
            </p>
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
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              {t('sections.5.title')}
            </h2>
            <p className="mb-4 text-slate-700" dangerouslySetInnerHTML={{ __html: t.raw('sections.5.content') }} />
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

