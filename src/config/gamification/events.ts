/**
 * Configuración de Eventos de Gamificación
 * 
 * Cada evento representa una acción del usuario que otorga XP.
 * Los eventos se usan para:
 * - Otorgar XP cuando ocurren
 * - Verificar requisitos de badges
 */

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  category: 'cv' | 'application' | 'profile' | 'social' | 'other';
}

export const GAME_EVENTS: Record<string, GameEvent> = {
  // Profile Events
  'profile.completed': {
    id: 'profile.completed',
    name: 'Perfil Completado',
    description: 'Completaste todas las secciones de tu perfil',
    xpReward: 50,
    category: 'profile',
  },
  'profile.first_name_added': {
    id: 'profile.first_name_added',
    name: 'Nombre Agregado',
    description: 'Agregaste tu nombre al perfil',
    xpReward: 10,
    category: 'profile',
  },
  'profile.avatar_uploaded': {
    id: 'profile.avatar_uploaded',
    name: 'Foto de Perfil',
    description: 'Subiste una foto de perfil',
    xpReward: 15,
    category: 'profile',
  },
  'profile.linkedin_added': {
    id: 'profile.linkedin_added',
    name: 'LinkedIn Agregado',
    description: 'Agregaste tu perfil de LinkedIn',
    xpReward: 20,
    category: 'profile',
  },

  // CV Builder Events
  'cv.section_added': {
    id: 'cv.section_added',
    name: 'Sección Agregada',
    description: 'Agregaste una nueva sección a tu CV',
    xpReward: 25,
    category: 'cv',
  },
  'cv.education_added': {
    id: 'cv.education_added',
    name: 'Educación Agregada',
    description: 'Agregaste información de educación',
    xpReward: 30,
    category: 'cv',
  },
  'cv.experience_added': {
    id: 'cv.experience_added',
    name: 'Experiencia Agregada',
    description: 'Agregaste una experiencia laboral',
    xpReward: 40,
    category: 'cv',
  },
  'cv.certification_added': {
    id: 'cv.certification_added',
    name: 'Certificación Agregada',
    description: 'Agregaste una certificación',
    xpReward: 35,
    category: 'cv',
  },
  'cv.language_added': {
    id: 'cv.language_added',
    name: 'Idioma Agregado',
    description: 'Agregaste un idioma a tu perfil',
    xpReward: 20,
    category: 'cv',
  },
  'cv.volunteering_added': {
    id: 'cv.volunteering_added',
    name: 'Voluntariado Agregado',
    description: 'Agregaste una experiencia de voluntariado',
    xpReward: 30,
    category: 'cv',
  },
  'cv.project_added': {
    id: 'cv.project_added',
    name: 'Proyecto Agregado',
    description: 'Agregaste un proyecto personal',
    xpReward: 35,
    category: 'cv',
  },
  'cv.education_updated': {
    id: 'cv.education_updated',
    name: 'Educación Actualizada',
    description: 'Actualizaste información de educación',
    xpReward: 15,
    category: 'cv',
  },
  'cv.experience_updated': {
    id: 'cv.experience_updated',
    name: 'Experiencia Actualizada',
    description: 'Actualizaste una experiencia laboral',
    xpReward: 20,
    category: 'cv',
  },
  'cv.certification_updated': {
    id: 'cv.certification_updated',
    name: 'Certificación Actualizada',
    description: 'Actualizaste una certificación',
    xpReward: 18,
    category: 'cv',
  },
  'cv.language_updated': {
    id: 'cv.language_updated',
    name: 'Idioma Actualizado',
    description: 'Actualizaste un idioma en tu perfil',
    xpReward: 10,
    category: 'cv',
  },
  'cv.volunteering_updated': {
    id: 'cv.volunteering_updated',
    name: 'Voluntariado Actualizado',
    description: 'Actualizaste una experiencia de voluntariado',
    xpReward: 15,
    category: 'cv',
  },
  'cv.project_updated': {
    id: 'cv.project_updated',
    name: 'Proyecto Actualizado',
    description: 'Actualizaste un proyecto personal',
    xpReward: 18,
    category: 'cv',
  },
  'profile.updated': {
    id: 'profile.updated',
    name: 'Perfil Actualizado',
    description: 'Actualizaste información de tu perfil',
    xpReward: 15,
    category: 'profile',
  },

  // Application Events (Job Offers)
  'application.created': {
    id: 'application.created',
    name: 'Postulación Creada',
    description: 'Creaste una nueva postulación de trabajo',
    xpReward: 50,
    category: 'application',
  },
  'application.status_updated': {
    id: 'application.status_updated',
    name: 'Estado Actualizado',
    description: 'Actualizaste el estado de una postulación',
    xpReward: 25,
    category: 'application',
  },
  'application.interview_scheduled': {
    id: 'application.interview_scheduled',
    name: 'Entrevista Programada',
    description: 'Programaste una entrevista',
    xpReward: 100,
    category: 'application',
  },
  'application.interview_completed': {
    id: 'application.interview_completed',
    name: 'Entrevista Completada',
    description: 'Completaste una entrevista',
    xpReward: 150,
    category: 'application',
  },
  'application.offer_received': {
    id: 'application.offer_received',
    name: 'Oferta Recibida',
    description: 'Recibiste una oferta de trabajo',
    xpReward: 500,
    category: 'application',
  },
  'application.offer_accepted': {
    id: 'application.offer_accepted',
    name: 'Oferta Aceptada',
    description: 'Aceptaste una oferta de trabajo',
    xpReward: 1000,
    category: 'application',
  },
  
  // Job Offers Events
  'job_offer.created': {
    id: 'job_offer.created',
    name: 'Oferta Guardada',
    description: 'Guardaste una nueva oferta de trabajo',
    xpReward: 30,
    category: 'application',
  },
  'job_offer.updated': {
    id: 'job_offer.updated',
    name: 'Oferta Actualizada',
    description: 'Actualizaste información de una oferta',
    xpReward: 15,
    category: 'application',
  },
  'job_offer.status_updated': {
    id: 'job_offer.status_updated',
    name: 'Estado de Oferta Actualizado',
    description: 'Cambiaste el estado de una oferta de trabajo',
    xpReward: 20,
    category: 'application',
  },
  'job_offer.note_added': {
    id: 'job_offer.note_added',
    name: 'Nota Añadida',
    description: 'Añadiste una nota a una oferta de trabajo',
    xpReward: 5,
    category: 'application',
  },
  'job_offer.cv_sections_selected': {
    id: 'job_offer.cv_sections_selected',
    name: 'CV Personalizado',
    description: 'Seleccionaste secciones de CV para una oferta',
    xpReward: 25,
    category: 'application',
  },
  'job_offer.cv_downloaded': {
    id: 'job_offer.cv_downloaded',
    name: 'CV Descargado',
    description: 'Descargaste el CV personalizado para una oferta',
    xpReward: 10,
    category: 'application',
  },
  
  // AI Events
  'ai.insights_generated': {
    id: 'ai.insights_generated',
    name: 'Análisis IA Generado',
    description: 'Generaste un análisis de tu CV con IA',
    xpReward: 30,
    category: 'cv',
  },
  'ai.section_improved': {
    id: 'ai.section_improved',
    name: 'Sección Mejorada con IA',
    description: 'Mejoraste una sección de tu CV usando IA',
    xpReward: 20,
    category: 'cv',
  },
  'ai.cv_sections_suggested': {
    id: 'ai.cv_sections_suggested',
    name: 'Secciones Sugeridas por IA',
    description: 'Usaste IA para sugerir secciones de CV para una oferta',
    xpReward: 15,
    category: 'application',
  },

  // Social Events
  'social.connection_made': {
    id: 'social.connection_made',
    name: 'Conexión Realizada',
    description: 'Te conectaste con un profesional',
    xpReward: 30,
    category: 'social',
  },
  'social.review_left': {
    id: 'social.review_left',
    name: 'Reseña Dejada',
    description: 'Dejaste una reseña sobre una empresa',
    xpReward: 40,
    category: 'social',
  },

  // Daily/Streak Events
  'daily.login': {
    id: 'daily.login',
    name: 'Login Diario',
    description: 'Iniciaste sesión hoy',
    xpReward: 10,
    category: 'other',
  },
  'streak.7_days': {
    id: 'streak.7_days',
    name: 'Racha de 7 Días',
    description: 'Visitaste la plataforma 7 días consecutivos',
    xpReward: 100,
    category: 'other',
  },
  'streak.30_days': {
    id: 'streak.30_days',
    name: 'Racha de 30 Días',
    description: 'Visitaste la plataforma 30 días consecutivos',
    xpReward: 500,
    category: 'other',
  },
};

/**
 * Obtiene un evento por su ID
 */
export function getEvent(eventId: string): GameEvent | undefined {
  return GAME_EVENTS[eventId];
}

/**
 * Obtiene todos los eventos
 */
export function getAllEvents(): GameEvent[] {
  return Object.values(GAME_EVENTS);
}

/**
 * Obtiene eventos por categoría
 */
export function getEventsByCategory(category: GameEvent['category']): GameEvent[] {
  return getAllEvents().filter((event) => event.category === category);
}

