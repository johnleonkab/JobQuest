export const metadata = {
  title: "Términos de Servicio",
  description: "Términos y condiciones de uso de JobQuest",
};

export default function TermsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Términos de Servicio
        </h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">
            Última actualización: {new Date().toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              1. Aceptación de los Términos
            </h2>
            <p className="mb-4 text-slate-700">
              Al acceder y utilizar JobQuest, aceptas cumplir con estos Términos
              de Servicio y todas las leyes y regulaciones aplicables. Si no
              estás de acuerdo con alguno de estos términos, no debes utilizar
              nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              2. Descripción del Servicio
            </h2>
            <p className="mb-4 text-slate-700">
              JobQuest es una plataforma web que ayuda a los usuarios a gestionar
              su búsqueda de empleo mediante herramientas de construcción de CV,
              seguimiento de ofertas de trabajo y elementos de gamificación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              3. Cuenta de Usuario
            </h2>
            <p className="mb-4 text-slate-700">
              Para utilizar JobQuest, debes crear una cuenta mediante
              autenticación con Google. Eres responsable de mantener la
              confidencialidad de tu cuenta y de todas las actividades que
              ocurran bajo tu cuenta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              4. Uso Aceptable
            </h2>
            <p className="mb-4 text-slate-700">
              Te comprometes a utilizar JobQuest únicamente para fines legales y
              de manera que no infrinja los derechos de terceros. No debes:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Usar el servicio para actividades ilegales</li>
              <li>Interferir con el funcionamiento del servicio</li>
              <li>Intentar acceder a áreas restringidas del sistema</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              5. Propiedad Intelectual
            </h2>
            <p className="mb-4 text-slate-700">
              Todo el contenido de JobQuest, incluyendo pero no limitado a texto,
              gráficos, logos, iconos, imágenes y software, es propiedad de
              JobQuest y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              6. Privacidad
            </h2>
            <p className="mb-4 text-slate-700">
              Tu privacidad es importante para nosotros. Por favor, revisa
              nuestra{" "}
              <a
                href="/privacy"
                className="text-primary hover:underline"
              >
                Política de Privacidad
              </a>{" "}
              para entender cómo recopilamos, usamos y protegemos tu información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              7. Limitación de Responsabilidad
            </h2>
            <p className="mb-4 text-slate-700">
              JobQuest se proporciona "tal cual" sin garantías de ningún tipo.
              No garantizamos que el servicio esté libre de errores, interrupciones
              o defectos. No seremos responsables de ningún daño indirecto,
              incidental o consecuente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              8. Modificaciones del Servicio
            </h2>
            <p className="mb-4 text-slate-700">
              Nos reservamos el derecho de modificar, suspender o discontinuar
              cualquier aspecto del servicio en cualquier momento sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              9. Contacto
            </h2>
            <p className="mb-4 text-slate-700">
              Si tienes preguntas sobre estos Términos de Servicio, puedes
              contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

