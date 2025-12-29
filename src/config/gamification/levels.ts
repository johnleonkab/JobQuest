/**
 * Configuración de Niveles de Gamificación
 * 
 * Define todos los niveles disponibles en la plataforma.
 * Cada nivel tiene un nombre, descripción, icono y XP requerido.
 */

export interface Level {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbol name
  requiredXp: number;
  order: number;
  color?: string; // Color del icono/badge
}

export const LEVELS: Level[] = [
  {
    id: 'novato',
    name: 'Novato',
    description: 'Completa tu perfil para iniciar tu viaje.',
    icon: 'check_circle',
    requiredXp: 0,
    order: 1,
    color: '#1e8e3e',
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Busca y guarda tus primeras ofertas.',
    icon: 'explore',
    requiredXp: 200,
    order: 2,
    color: '#6366f1',
  },
  {
    id: 'postulante',
    name: 'Postulante',
    description: 'Envía tus primeras solicitudes de empleo.',
    icon: 'person_search',
    requiredXp: 500,
    order: 3,
    color: '#8b5cf6',
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Conecta con reclutadores y empresas.',
    icon: 'connect_without_contact',
    requiredXp: 900,
    order: 4,
    color: '#ec4899',
  },
  {
    id: 'estratega',
    name: 'Estratega',
    description: 'Optimizas cada aplicación para el éxito.',
    icon: 'rocket_launch',
    requiredXp: 2000,
    order: 5,
    color: '#db2777', // primary color
  },
  {
    id: 'entrevistado',
    name: 'Entrevistado',
    description: 'Consigue y asiste a entrevistas.',
    icon: 'handshake',
    requiredXp: 3500,
    order: 6,
    color: '#f59e0b',
  },
  {
    id: 'finalista',
    name: 'Finalista',
    description: 'Llega a las etapas finales de selección.',
    icon: 'trophy',
    requiredXp: 5000,
    order: 7,
    color: '#10b981',
  },
  {
    id: 'contratado',
    name: 'Contratado',
    description: 'Obtén la oferta de trabajo deseada.',
    icon: 'workspace_premium',
    requiredXp: 8000,
    order: 8,
    color: '#fbbf24',
  },
];

/**
 * Obtiene un nivel por su ID
 */
export function getLevel(levelId: string): Level | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

/**
 * Obtiene un nivel por su order
 */
export function getLevelByOrder(order: number): Level | undefined {
  return LEVELS.find((level) => level.order === order);
}

/**
 * Obtiene el nivel actual basado en el XP del usuario
 */
export function getCurrentLevel(userXp: number): Level {
  // Ordenar niveles por XP requerido (descendente)
  const sortedLevels = [...LEVELS].sort((a, b) => b.requiredXp - a.requiredXp);
  
  // Encontrar el nivel más alto que el usuario ha alcanzado
  for (const level of sortedLevels) {
    if (userXp >= level.requiredXp) {
      return level;
    }
  }
  
  // Si no alcanza ningún nivel, devolver el primero
  return LEVELS[0];
}

/**
 * Obtiene el siguiente nivel basado en el XP del usuario
 */
export function getNextLevel(userXp: number): Level | null {
  const currentLevel = getCurrentLevel(userXp);
  const currentIndex = LEVELS.findIndex((level) => level.id === currentLevel.id);
  
  if (currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1];
  }
  
  return null; // Ya está en el nivel máximo
}

/**
 * Calcula el progreso hacia el siguiente nivel (0-100)
 */
export function getLevelProgress(userXp: number): number {
  const currentLevel = getCurrentLevel(userXp);
  const nextLevel = getNextLevel(userXp);
  
  if (!nextLevel) {
    return 100; // Ya está en el nivel máximo
  }
  
  const xpInCurrentLevel = userXp - currentLevel.requiredXp;
  const xpNeededForNext = nextLevel.requiredXp - currentLevel.requiredXp;
  
  return Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);
}

/**
 * Obtiene todos los niveles ordenados
 */
export function getAllLevels(): Level[] {
  return [...LEVELS].sort((a, b) => a.order - b.order);
}

