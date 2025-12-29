"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Empezando
  {
    question: "¿Cómo creo mi cuenta?",
    answer: "Puedes crear tu cuenta usando tu email y contraseña, o iniciar sesión con Google. Simplemente ve a la página de inicio y completa el formulario de registro.",
    category: "empezando",
  },
  {
    question: "¿Cómo completo mi perfil?",
    answer: "Después de registrarte, verás un modal de onboarding donde puedes completar tu información básica (nombre, apellidos, género, fecha de nacimiento). También puedes editar tu perfil desde la página de Perfil en cualquier momento.",
    category: "empezando",
  },
  {
    question: "¿Cómo cambio mi contraseña?",
    answer: "Actualmente, puedes cambiar tu contraseña desde tu cuenta de Google si usaste OAuth, o contactando a soporte si usaste email/password. Estamos trabajando en una funcionalidad para cambiar contraseña directamente desde la app.",
    category: "empezando",
  },
  // CV Builder
  {
    question: "¿Cómo creo mi CV?",
    answer: "Ve a 'Mi Perfil Profesional' en el menú lateral. Allí puedes agregar secciones como Experiencia Laboral, Educación, Certificaciones, Idiomas, Proyectos y Voluntariado. Cada sección tiene un botón '+' para agregar nuevos elementos.",
    category: "cv-builder",
  },
  {
    question: "¿Cómo exporto mi CV?",
    answer: "Cuando estés en la sección de Job Offers, puedes seleccionar secciones específicas de tu CV para cada oferta. Luego, en la vista de detalle de la oferta, encontrarás un botón para 'Ver CV Personalizado' que te permite descargar un PDF.",
    category: "cv-builder",
  },
  {
    question: "¿Puedo usar AI para mejorar mi CV?",
    answer: "¡Sí! En cada sección del CV (Experiencia, Educación, etc.), cuando estés editando, verás un botón 'Mejorar con IA' que te ayudará a mejorar las descripciones, corregir errores y agregar tags relevantes.",
    category: "cv-builder",
  },
  {
    question: "¿Cómo uso AI Insights?",
    answer: "En la página de CV Builder, encontrarás un botón 'Análisis de IA' que analiza tu CV completo y te da recomendaciones personalizadas. También puedes chatear con el asistente de IA para hacer preguntas específicas sobre tu CV.",
    category: "cv-builder",
  },
  // Job Offers
  {
    question: "¿Cómo agrego una oferta de trabajo?",
    answer: "Ve a 'Job Openings' en el menú lateral y haz clic en el botón '+' en cualquier columna del Kanban, o en 'Agregar Oferta' en la vista de lista. Completa el formulario con los detalles de la oferta.",
    category: "job-offers",
  },
  {
    question: "¿Cómo cambio el estado de una oferta?",
    answer: "Puedes arrastrar y soltar las ofertas entre columnas en el Kanban, o hacer clic en una oferta para abrirla y cambiar el estado desde el menú desplegable.",
    category: "job-offers",
  },
  {
    question: "¿Cómo programo una entrevista?",
    answer: "Cuando cambies el estado de una oferta a 'Entrevista', se abrirá automáticamente un modal donde puedes programar la entrevista con fecha, hora, tipo y ubicación. También puedes agregar entrevistas desde la vista de detalle de la oferta.",
    category: "job-offers",
  },
  {
    question: "¿Cómo agrego un contacto?",
    answer: "Cuando cambies el estado de una oferta a 'Contactada', se abrirá un modal para agregar información del contacto (nombre, email, rol, canales de contacto). También puedes gestionar contactos desde la vista de detalle de la oferta.",
    category: "job-offers",
  },
  {
    question: "¿Cómo filtro mis ofertas?",
    answer: "En la vista de Job Openings, encontrarás filtros en la parte superior para filtrar por estado, tipo de trabajo, y rango de salario. También puedes buscar por nombre de empresa o posición.",
    category: "job-offers",
  },
  // Gamificación
  {
    question: "¿Cómo funcionan los puntos (XP)?",
    answer: "Ganas puntos de experiencia (XP) al completar acciones en la plataforma: agregar secciones a tu CV, actualizar tu perfil, agregar ofertas, programar entrevistas, etc. Cada acción tiene un valor de XP diferente.",
    category: "gamificacion",
  },
  {
    question: "¿Cómo subo de nivel?",
    answer: "A medida que ganas XP, subirás de nivel automáticamente. Cada nivel requiere más XP que el anterior. Puedes ver tu progreso en el Dashboard o en la barra lateral.",
    category: "gamificacion",
  },
  {
    question: "¿Qué son los badges?",
    answer: "Los badges son logros especiales que desbloqueas al completar ciertas acciones o alcanzar hitos. Por ejemplo, 'Primer CV' al completar tu primera sección, o 'Entrevistador Experto' al programar 10 entrevistas.",
    category: "gamificacion",
  },
  {
    question: "¿Dónde veo mis badges?",
    answer: "Puedes ver todos tus badges en la página 'Logros' del menú lateral. Allí verás los badges que has desbloqueado y los que aún puedes conseguir.",
    category: "gamificacion",
  },
  // AI Features
  {
    question: "¿Qué es AI Insights?",
    answer: "AI Insights es un análisis completo de tu CV que usa inteligencia artificial para darte recomendaciones personalizadas sobre cómo mejorar tu CV, qué secciones fortalecer, y qué habilidades destacar.",
    category: "ai-features",
  },
  {
    question: "¿Cómo uso AI Recommender?",
    answer: "En cada sección del CV (Experiencia, Educación, etc.), cuando estés editando, verás un botón 'Mejorar con IA'. Este asistente mejorará tus descripciones, corregirá errores y sugerirá mejoras.",
    category: "ai-features",
  },
  // Troubleshooting
  {
    question: "No puedo iniciar sesión",
    answer: "Verifica que estés usando el email correcto. Si usaste Google OAuth, asegúrate de usar la misma cuenta de Google. Si el problema persiste, contacta a soporte.",
    category: "troubleshooting",
  },
  {
    question: "No se guardan mis cambios",
    answer: "Asegúrate de hacer clic en 'Guardar' después de hacer cambios. Si el problema persiste, verifica tu conexión a internet y recarga la página. Si sigue sin funcionar, contacta a soporte.",
    category: "troubleshooting",
  },
  {
    question: "¿Cómo elimino mi cuenta?",
    answer: "Ve a 'Privacidad' en el menú lateral, y luego a la sección 'Eliminar Cuenta'. Lee las advertencias cuidadosamente y escribe 'ELIMINAR' para confirmar. Esta acción es permanente e irreversible.",
    category: "troubleshooting",
  },
  {
    question: "¿Cómo exporto mis datos?",
    answer: "Ve a 'Privacidad' en el menú lateral. Allí encontrarás botones para exportar todos tus datos en formato JSON o CSV. Esto incluye tu perfil, CV completo, ofertas, entrevistas y más.",
    category: "troubleshooting",
  },
  {
    question: "¿Cómo contacto soporte?",
    answer: "Puedes contactarnos a través del email de soporte que encontrarás en la página de Privacidad o Términos de Servicio. También puedes usar el formulario de feedback en esta página de ayuda.",
    category: "troubleshooting",
  },
];

const categories = [
  { id: "all", label: "Todas", icon: "apps" },
  { id: "empezando", label: "Empezando", icon: "rocket_launch" },
  { id: "cv-builder", label: "CV Builder", icon: "description" },
  { id: "job-offers", label: "Ofertas de Trabajo", icon: "work" },
  { id: "gamificacion", label: "Gamificación", icon: "emoji_events" },
  { id: "ai-features", label: "Funciones AI", icon: "smart_toy" },
  { id: "troubleshooting", label: "Solución de Problemas", icon: "help" },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Centro de Ayuda
          </h1>
          <p className="text-lg text-slate-600">
            Encuentra respuestas a tus preguntas y aprende a usar JobQuest
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/cv-builder"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">
                description
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">CV Builder</div>
              <div className="text-sm text-slate-600">Crea tu CV</div>
            </div>
          </Link>

          <Link
            href="/job-openings"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-2xl">work</span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Job Openings</div>
              <div className="text-sm text-slate-600">Gestiona ofertas</div>
            </div>
          </Link>

          <Link
            href="/gamification"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <span className="material-symbols-outlined text-2xl">
                emoji_events
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Gamificación</div>
              <div className="text-sm text-slate-600">Ver logros</div>
            </div>
          </Link>

          <Link
            href="/privacy-settings"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <span className="material-symbols-outlined text-2xl">
                privacy_tip
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Privacidad</div>
              <div className="text-sm text-slate-600">Gestiona datos</div>
            </div>
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {category.icon}
                </span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                  search_off
                </span>
                <p className="text-slate-600">
                  No se encontraron preguntas que coincidan con tu búsqueda.
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </h3>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform ${
                        expandedFAQ === index ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-slate-600 mb-6">
            Si tienes más preguntas o necesitas ayuda adicional, no dudes en
            contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <span className="material-symbols-outlined">description</span>
              Ver Política de Privacidad
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <span className="material-symbols-outlined">gavel</span>
              Ver Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

