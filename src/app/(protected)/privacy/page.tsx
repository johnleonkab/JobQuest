export const metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de JobQuest",
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Política de Privacidad
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
              1. Información que Recopilamos
            </h2>
            <p className="mb-4 text-slate-700">
              Recopilamos información que nos proporcionas directamente cuando
              utilizas JobQuest, incluyendo:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Información de tu cuenta (nombre, email, foto de perfil)</li>
              <li>Datos de tu CV (experiencia, educación, certificaciones, etc.)</li>
              <li>Información sobre ofertas de trabajo que gestionas</li>
              <li>Datos de gamificación (XP, niveles, badges)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              2. Cómo Utilizamos tu Información
            </h2>
            <p className="mb-4 text-slate-700">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Procesar tus solicitudes y gestionar tu cuenta</li>
              <li>Enviar notificaciones relacionadas con el servicio</li>
              <li>Analizar el uso de la plataforma para mejoras</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              3. Compartir Información
            </h2>
            <p className="mb-4 text-slate-700">
              No vendemos, alquilamos ni compartimos tu información personal con
              terceros, excepto en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Con proveedores de servicios que nos ayudan a operar (Supabase, Vercel)</li>
              <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
              <li>Con tu consentimiento explícito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              4. Seguridad de los Datos
            </h2>
            <p className="mb-4 text-slate-700">
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger tu información personal, incluyendo:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Cifrado de datos en tránsito (HTTPS)</li>
              <li>Autenticación segura mediante OAuth</li>
              <li>Row Level Security (RLS) en la base de datos</li>
              <li>Validación y sanitización de entradas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              5. Tus Derechos (GDPR)
            </h2>
            <p className="mb-4 text-slate-700">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Exportar tus datos en formato estructurado</li>
            </ul>
            <p className="mb-4 text-slate-700">
              Para ejercer estos derechos, puedes contactarnos a través de la
              plataforma o eliminar tu cuenta desde la configuración de perfil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              6. Cookies y Tecnologías Similares
            </h2>
            <p className="mb-4 text-slate-700">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside mb-4 text-slate-700 space-y-2">
              <li>Mantener tu sesión activa</li>
              <li>Recordar tus preferencias</li>
              <li>Proteger contra ataques CSRF</li>
            </ul>
            <p className="mb-4 text-slate-700">
              Puedes gestionar las preferencias de cookies desde la configuración
              de tu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              7. Retención de Datos
            </h2>
            <p className="mb-4 text-slate-700">
              Conservamos tu información personal mientras tu cuenta esté activa
              o según sea necesario para proporcionar nuestros servicios. Puedes
              solicitar la eliminación de tu cuenta en cualquier momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              8. Cambios a esta Política
            </h2>
            <p className="mb-4 text-slate-700">
              Podemos actualizar esta Política de Privacidad ocasionalmente.
              Te notificaremos de cambios significativos mediante una notificación
              en la plataforma o por email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              9. Contacto
            </h2>
            <p className="mb-4 text-slate-700">
              Si tienes preguntas sobre esta Política de Privacidad, puedes
              contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

