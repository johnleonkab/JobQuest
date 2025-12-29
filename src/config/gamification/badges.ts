/**
 * Configuración de Badges de Gamificación
 * 
 * Define todos los badges disponibles en la plataforma.
 * Cada badge tiene requisitos basados en eventos que deben ocurrir cierta cantidad de veces.
 */

export interface BadgeRequirement {
  eventId: string;
  count: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbol name
  iconColor?: string;
  requirements: BadgeRequirement[];
  category?: string;
}

export const BADGES: Badge[] = [
  {
    id: 'perfil_completo',
    name: 'Perfil Completo',
    description: 'Completaste todas las secciones de información de tu perfil profesional.',
    icon: 'shield',
    iconColor: '#db2777',
    requirements: [
      { eventId: 'profile.completed', count: 1 },
    ],
    category: 'profile',
  },
  {
    id: 'racha_7_dias',
    name: 'Racha de 7 Días',
    description: 'Visitaste la plataforma durante 7 días consecutivos.',
    icon: 'local_fire_department',
    iconColor: '#f97316',
    requirements: [
      { eventId: 'streak.7_days', count: 1 },
    ],
    category: 'streak',
  },
  {
    id: 'primer_postulante',
    name: 'Primer Postulante',
    description: 'Enviaste tu primera solicitud de empleo con éxito.',
    icon: 'send',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'application.created', count: 1 },
    ],
    category: 'application',
  },
  {
    id: 'entrevistado',
    name: 'Entrevistado',
    description: 'Completa al menos 3 entrevistas simuladas en la plataforma.',
    icon: 'chat_bubble',
    iconColor: '#6366f1',
    requirements: [
      { eventId: 'application.interview_completed', count: 3 },
    ],
    category: 'application',
  },
  {
    id: 'aprendiz_continuo',
    name: 'Aprendiz Continuo',
    description: 'Completa 5 cursos de habilidades recomendados.',
    icon: 'school',
    iconColor: '#10b981',
    requirements: [
      // Este evento se agregará cuando se implemente el sistema de cursos
      { eventId: 'cv.certification_added', count: 5 },
    ],
    category: 'learning',
  },
  {
    id: 'super_conector',
    name: 'Super Conector',
    description: 'Conecta con 10 profesionales de tu industria.',
    icon: 'person_add',
    iconColor: '#ec4899',
    requirements: [
      { eventId: 'social.connection_made', count: 10 },
    ],
    category: 'social',
  },
  {
    id: 'critico_experto',
    name: 'Crítico Experto',
    description: 'Deja 3 reseñas detalladas sobre empresas.',
    icon: 'rate_review',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'social.review_left', count: 3 },
    ],
    category: 'social',
  },
  {
    id: 'innovador',
    name: 'Innovador',
    description: 'Propón una idea que reciba 10 votos positivos.',
    icon: 'lightbulb',
    iconColor: '#fbbf24',
    requirements: [
      // Este evento se agregará cuando se implemente el sistema de ideas
      { eventId: 'social.connection_made', count: 10 }, // Placeholder
    ],
    category: 'social',
  },
  {
    id: 'cv_maestro',
    name: 'CV Maestro',
    description: 'Agrega 5 secciones diferentes a tu CV.',
    icon: 'description',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'cv.section_added', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'experiencia_pro',
    name: 'Experiencia Pro',
    description: 'Agrega 3 experiencias laborales a tu perfil.',
    icon: 'work',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'cv.experience_added', count: 3 },
    ],
    category: 'cv',
  },
  {
    id: 'poliglota',
    name: 'Políglota',
    description: 'Agrega 3 idiomas a tu perfil.',
    icon: 'translate',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'cv.language_added', count: 3 },
    ],
    category: 'cv',
  },
  {
    id: 'postulante_activo',
    name: 'Postulante Activo',
    description: 'Crea 10 postulaciones de trabajo.',
    icon: 'assignment',
    iconColor: '#f97316',
    requirements: [
      { eventId: 'application.created', count: 10 },
    ],
    category: 'application',
  },
  
  // ========== NUEVOS BADGES (50) ==========
  
  // CV Builder Badges
  {
    id: 'cv_constructor',
    name: 'Constructor de CV',
    description: 'Agrega 10 secciones a tu CV.',
    icon: 'build',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'cv.section_added', count: 10 },
    ],
    category: 'cv',
  },
  {
    id: 'cv_perfeccionista',
    name: 'CV Perfeccionista',
    description: 'Actualiza 20 secciones de tu CV.',
    icon: 'edit',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'cv.education_updated', count: 5 },
      { eventId: 'cv.experience_updated', count: 5 },
      { eventId: 'cv.certification_updated', count: 5 },
      { eventId: 'cv.project_updated', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'experiencia_veterano',
    name: 'Experiencia Veterano',
    description: 'Agrega 10 experiencias laborales.',
    icon: 'business_center',
    iconColor: '#6366f1',
    requirements: [
      { eventId: 'cv.experience_added', count: 10 },
    ],
    category: 'cv',
  },
  {
    id: 'educacion_completa',
    name: 'Educación Completa',
    description: 'Agrega 5 entradas de educación.',
    icon: 'school',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'cv.education_added', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'certificado_profesional',
    name: 'Certificado Profesional',
    description: 'Agrega 10 certificaciones.',
    icon: 'verified',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'cv.certification_added', count: 10 },
    ],
    category: 'cv',
  },
  {
    id: 'poliglota_avanzado',
    name: 'Políglota Avanzado',
    description: 'Agrega 5 idiomas a tu perfil.',
    icon: 'language',
    iconColor: '#ec4899',
    requirements: [
      { eventId: 'cv.language_added', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'voluntario_dedicado',
    name: 'Voluntario Dedicado',
    description: 'Agrega 5 experiencias de voluntariado.',
    icon: 'volunteer_activism',
    iconColor: '#f97316',
    requirements: [
      { eventId: 'cv.volunteering_added', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'proyectos_creativos',
    name: 'Proyectos Creativos',
    description: 'Agrega 10 proyectos personales.',
    icon: 'code',
    iconColor: '#06b6d4',
    requirements: [
      { eventId: 'cv.project_added', count: 10 },
    ],
    category: 'cv',
  },
  
  // Job Offers Badges
  {
    id: 'cazador_ofertas',
    name: 'Cazador de Ofertas',
    description: 'Guarda 20 ofertas de trabajo.',
    icon: 'bookmark',
    iconColor: '#db2777',
    requirements: [
      { eventId: 'job_offer.created', count: 20 },
    ],
    category: 'application',
  },
  {
    id: 'organizador_pro',
    name: 'Organizador Pro',
    description: 'Actualiza 50 ofertas de trabajo.',
    icon: 'tune',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'job_offer.updated', count: 50 },
    ],
    category: 'application',
  },
  {
    id: 'seguimiento_activo',
    name: 'Seguimiento Activo',
    description: 'Actualiza el estado de 30 ofertas.',
    icon: 'trending_up',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'job_offer.status_updated', count: 30 },
    ],
    category: 'application',
  },
  {
    id: 'notas_detalladas',
    name: 'Notas Detalladas',
    description: 'Añade 20 notas a ofertas de trabajo.',
    icon: 'note_add',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'job_offer.note_added', count: 20 },
    ],
    category: 'application',
  },
  {
    id: 'cv_personalizado',
    name: 'CV Personalizado',
    description: 'Personaliza CV para 10 ofertas diferentes.',
    icon: 'content_paste',
    iconColor: '#6366f1',
    requirements: [
      { eventId: 'job_offer.cv_sections_selected', count: 10 },
    ],
    category: 'application',
  },
  {
    id: 'descargador_pro',
    name: 'Descargador Pro',
    description: 'Descarga 15 CVs personalizados.',
    icon: 'download',
    iconColor: '#ec4899',
    requirements: [
      { eventId: 'job_offer.cv_downloaded', count: 15 },
    ],
    category: 'application',
  },
  {
    id: 'aplicante_serio',
    name: 'Aplicante Serio',
    description: 'Mueve 10 ofertas al estado "Aplicadas".',
    icon: 'send',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'job_offer.status_updated', count: 10 },
    ],
    category: 'application',
  },
  {
    id: 'entrevistado_exitoso',
    name: 'Entrevistado Exitoso',
    description: 'Llega a entrevista con 5 ofertas.',
    icon: 'video_call',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'application.interview_scheduled', count: 5 },
    ],
    category: 'application',
  },
  {
    id: 'oferta_recibida',
    name: 'Oferta Recibida',
    description: 'Recibe una oferta de trabajo.',
    icon: 'card_giftcard',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'application.offer_received', count: 1 },
    ],
    category: 'application',
  },
  {
    id: 'trabajo_conseguido',
    name: 'Trabajo Conseguido',
    description: 'Acepta una oferta de trabajo.',
    icon: 'celebration',
    iconColor: '#fbbf24',
    requirements: [
      { eventId: 'application.offer_accepted', count: 1 },
    ],
    category: 'application',
  },
  
  // AI Badges
  {
    id: 'ai_explorador',
    name: 'Explorador de IA',
    description: 'Genera 5 análisis de CV con IA.',
    icon: 'psychology',
    iconColor: '#a855f7',
    requirements: [
      { eventId: 'ai.insights_generated', count: 5 },
    ],
    category: 'ai',
  },
  {
    id: 'ai_mejorador',
    name: 'Mejorador con IA',
    description: 'Mejora 10 secciones de CV con IA.',
    icon: 'auto_awesome',
    iconColor: '#ec4899',
    requirements: [
      { eventId: 'ai.section_improved', count: 10 },
    ],
    category: 'ai',
  },
  {
    id: 'ai_estratega',
    name: 'Estratega de IA',
    description: 'Usa IA para sugerir secciones 5 veces.',
    icon: 'lightbulb',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'ai.cv_sections_suggested', count: 5 },
    ],
    category: 'ai',
  },
  {
    id: 'ai_maestro',
    name: 'Maestro de IA',
    description: 'Usa todas las funciones de IA 20 veces.',
    icon: 'stars',
    iconColor: '#fbbf24',
    requirements: [
      { eventId: 'ai.insights_generated', count: 5 },
      { eventId: 'ai.section_improved', count: 10 },
      { eventId: 'ai.cv_sections_suggested', count: 5 },
    ],
    category: 'ai',
  },
  
  // Profile Badges
  {
    id: 'perfil_actualizado',
    name: 'Perfil Actualizado',
    description: 'Actualiza tu perfil 10 veces.',
    icon: 'update',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'profile.updated', count: 10 },
    ],
    category: 'profile',
  },
  {
    id: 'foto_profesional',
    name: 'Foto Profesional',
    description: 'Sube una foto de perfil.',
    icon: 'camera_alt',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'profile.avatar_uploaded', count: 1 },
    ],
    category: 'profile',
  },
  {
    id: 'red_profesional',
    name: 'Red Profesional',
    description: 'Añade tu perfil de LinkedIn.',
    icon: 'link',
    iconColor: '#0ea5e9',
    requirements: [
      { eventId: 'profile.linkedin_added', count: 1 },
    ],
    category: 'profile',
  },
  
  // Streak Badges
  {
    id: 'racha_30_dias',
    name: 'Racha de 30 Días',
    description: 'Visita la plataforma 30 días consecutivos.',
    icon: 'local_fire_department',
    iconColor: '#f97316',
    requirements: [
      { eventId: 'streak.30_days', count: 1 },
    ],
    category: 'streak',
  },
  {
    id: 'visitante_diario',
    name: 'Visitante Diario',
    description: 'Inicia sesión 7 días seguidos.',
    icon: 'calendar_today',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'daily.login', count: 7 },
    ],
    category: 'streak',
  },
  {
    id: 'fiel_usuario',
    name: 'Usuario Fiel',
    description: 'Inicia sesión 30 días.',
    icon: 'loyalty',
    iconColor: '#6366f1',
    requirements: [
      { eventId: 'daily.login', count: 30 },
    ],
    category: 'streak',
  },
  
  // Combination Badges
  {
    id: 'cv_completo',
    name: 'CV Completo',
    description: 'Completa todas las secciones de CV (experiencia, educación, certificaciones, idiomas, proyectos, voluntariado).',
    icon: 'check_circle',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'cv.experience_added', count: 1 },
      { eventId: 'cv.education_added', count: 1 },
      { eventId: 'cv.certification_added', count: 1 },
      { eventId: 'cv.language_added', count: 1 },
      { eventId: 'cv.project_added', count: 1 },
      { eventId: 'cv.volunteering_added', count: 1 },
    ],
    category: 'cv',
  },
  {
    id: 'postulante_completo',
    name: 'Postulante Completo',
    description: 'Crea 5 ofertas y personaliza CV para cada una.',
    icon: 'assignment_turned_in',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'job_offer.created', count: 5 },
      { eventId: 'job_offer.cv_sections_selected', count: 5 },
    ],
    category: 'application',
  },
  {
    id: 'perfeccionista_cv',
    name: 'Perfeccionista de CV',
    description: 'Agrega y actualiza 20 secciones de CV.',
    icon: 'edit_note',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'cv.section_added', count: 10 },
      { eventId: 'cv.experience_updated', count: 5 },
      { eventId: 'cv.education_updated', count: 5 },
    ],
    category: 'cv',
  },
  {
    id: 'estratega_busqueda',
    name: 'Estratega de Búsqueda',
    description: 'Guarda 10 ofertas, actualiza estados y añade notas.',
    icon: 'search',
    iconColor: '#6366f1',
    requirements: [
      { eventId: 'job_offer.created', count: 10 },
      { eventId: 'job_offer.status_updated', count: 5 },
      { eventId: 'job_offer.note_added', count: 5 },
    ],
    category: 'application',
  },
  {
    id: 'innovador_ia',
    name: 'Innovador con IA',
    description: 'Usa todas las funciones de IA al menos una vez.',
    icon: 'smart_toy',
    iconColor: '#a855f7',
    requirements: [
      { eventId: 'ai.insights_generated', count: 1 },
      { eventId: 'ai.section_improved', count: 1 },
      { eventId: 'ai.cv_sections_suggested', count: 1 },
    ],
    category: 'ai',
  },
  
  // Milestone Badges
  {
    id: 'primer_paso',
    name: 'Primer Paso',
    description: 'Completa tu primera acción en la plataforma.',
    icon: 'flag',
    iconColor: '#10b981',
    requirements: [
      { eventId: 'profile.first_name_added', count: 1 },
    ],
    category: 'milestone',
  },
  {
    id: 'cv_inicial',
    name: 'CV Inicial',
    description: 'Agrega tu primera sección al CV.',
    icon: 'add_circle',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'cv.section_added', count: 1 },
    ],
    category: 'milestone',
  },
  {
    id: 'primera_oferta',
    name: 'Primera Oferta',
    description: 'Guarda tu primera oferta de trabajo.',
    icon: 'bookmark_add',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'job_offer.created', count: 1 },
    ],
    category: 'milestone',
  },
  {
    id: 'primer_analisis_ia',
    name: 'Primer Análisis IA',
    description: 'Genera tu primer análisis de CV con IA.',
    icon: 'insights',
    iconColor: '#a855f7',
    requirements: [
      { eventId: 'ai.insights_generated', count: 1 },
    ],
    category: 'milestone',
  },
  
  // Quantity Milestones
  {
    id: 'cv_50_secciones',
    name: 'CV de 50 Secciones',
    description: 'Agrega 50 secciones a tu CV.',
    icon: 'description',
    iconColor: '#3b82f6',
    requirements: [
      { eventId: 'cv.section_added', count: 50 },
    ],
    category: 'cv',
  },
  {
    id: '100_ofertas',
    name: '100 Ofertas',
    description: 'Guarda 100 ofertas de trabajo.',
    icon: 'inventory_2',
    iconColor: '#8b5cf6',
    requirements: [
      { eventId: 'job_offer.created', count: 100 },
    ],
    category: 'application',
  },
  {
    id: '50_mejoras_ia',
    name: '50 Mejoras con IA',
    description: 'Mejora 50 secciones de CV con IA.',
    icon: 'auto_fix_high',
    iconColor: '#a855f7',
    requirements: [
      { eventId: 'ai.section_improved', count: 50 },
    ],
    category: 'ai',
  },
  
  // Special Achievement Badges
  {
    id: 'coleccionista_badges',
    name: 'Coleccionista de Badges',
    description: 'Obtén 10 badges diferentes.',
    icon: 'emoji_events',
    iconColor: '#fbbf24',
    requirements: [
      // Este badge se otorgará manualmente o con lógica especial
      { eventId: 'profile.completed', count: 1 }, // Placeholder
    ],
    category: 'achievement',
  },
  {
    id: 'nivel_alto',
    name: 'Nivel Alto',
    description: 'Alcanza el nivel 10.',
    icon: 'trending_up',
    iconColor: '#10b981',
    requirements: [
      // Este badge se otorgará basado en el nivel del usuario
      { eventId: 'profile.completed', count: 1 }, // Placeholder
    ],
    category: 'achievement',
  },
  {
    id: 'experto_plataforma',
    name: 'Experto de la Plataforma',
    description: 'Realiza 200 acciones en total.',
    icon: 'workspace_premium',
    iconColor: '#f59e0b',
    requirements: [
      { eventId: 'cv.section_added', count: 50 },
      { eventId: 'job_offer.created', count: 50 },
      { eventId: 'profile.updated', count: 50 },
      { eventId: 'ai.insights_generated', count: 50 },
    ],
    category: 'achievement',
  },
];

/**
 * Obtiene un badge por su ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === badgeId);
}

/**
 * Obtiene todos los badges
 */
export function getAllBadges(): Badge[] {
  return BADGES;
}

/**
 * Obtiene badges por categoría
 */
export function getBadgesByCategory(category: string): Badge[] {
  return BADGES.filter((badge) => badge.category === category);
}

/**
 * Verifica si un badge ha sido obtenido basado en el conteo de eventos
 */
export function isBadgeEarned(
  badge: Badge,
  eventCounts: Record<string, number>
): boolean {
  return badge.requirements.every((requirement) => {
    const count = eventCounts[requirement.eventId] || 0;
    return count >= requirement.count;
  });
}

/**
 * Calcula el progreso hacia un badge (0-100)
 */
export function getBadgeProgress(
  badge: Badge,
  eventCounts: Record<string, number>
): number {
  if (isBadgeEarned(badge, eventCounts)) {
    return 100;
  }

  let totalProgress = 0;
  let totalWeight = 0;

  badge.requirements.forEach((requirement) => {
    const count = eventCounts[requirement.eventId] || 0;
    const progress = Math.min((count / requirement.count) * 100, 100);
    totalProgress += progress;
    totalWeight += 1;
  });

  return totalWeight > 0 ? totalProgress / totalWeight : 0;
}

/**
 * Obtiene los detalles de progreso de un badge
 */
export function getBadgeProgressDetails(
  badge: Badge,
  eventCounts: Record<string, number>
): Array<{ eventId: string; current: number; required: number; progress: number }> {
  return badge.requirements.map((requirement) => {
    const count = eventCounts[requirement.eventId] || 0;
    const progress = Math.min((count / requirement.count) * 100, 100);
    return {
      eventId: requirement.eventId,
      current: count,
      required: requirement.count,
      progress,
    };
  });
}

