# Guía de Uso del Sistema de Gamificación

## 📚 Archivos de Configuración

El sistema de gamificación está completamente basado en archivos de configuración que pueden actualizarse sin cambiar código:

### 1. Eventos (`src/config/gamification/events.ts`)

Define todos los eventos posibles y su recompensa de XP:

```typescript
export const GAME_EVENTS: Record<string, GameEvent> = {
  'cv.section_added': {
    id: 'cv.section_added',
    name: 'Sección Agregada',
    description: 'Agregaste una nueva sección a tu CV',
    xpReward: 25,
    category: 'cv',
  },
  // ... más eventos
};
```

**Para agregar un nuevo evento:**
1. Agrega la entrada en `GAME_EVENTS`
2. El sistema automáticamente lo reconocerá

### 2. Niveles (`src/config/gamification/levels.ts`)

Define todos los niveles disponibles:

```typescript
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
  // ... más niveles
];
```

**Para agregar un nuevo nivel:**
1. Agrega la entrada en `LEVELS` con el `order` correcto
2. El sistema calculará automáticamente el nivel del usuario

### 3. Badges (`src/config/gamification/badges.ts`)

Define todos los badges y sus requisitos:

```typescript
export const BADGES: Badge[] = [
  {
    id: 'perfil_completo',
    name: 'Perfil Completo',
    description: 'Completaste todas las secciones...',
    icon: 'shield',
    iconColor: '#db2777',
    requirements: [
      { eventId: 'profile.completed', count: 1 },
    ],
  },
  // ... más badges
];
```

**Para agregar un nuevo badge:**
1. Agrega la entrada en `BADGES`
2. Define los requisitos como array de `{ eventId, count }`
3. El sistema verificará automáticamente si se cumple

## 🎮 Uso en el Código

### Registrar un Evento

Cuando un usuario completa una acción, registra el evento:

```typescript
import { useGamification } from '@/hooks/useGamification';

function MyComponent() {
  const { recordEvent } = useGamification();

  const handleAddSection = async () => {
    // Tu lógica aquí...
    
    // Registrar el evento
    await recordEvent('cv.section_added');
    
    // El sistema automáticamente:
    // - Otorga XP al usuario
    // - Verifica si subió de nivel
    // - Verifica si obtuvo algún badge
  };
}
```

### Obtener Progreso del Usuario

```typescript
const response = await fetch('/api/gamification/progress');
const progress = await response.json();

// progress contiene:
// - xp: número total de XP
// - level: nivel actual
// - nextLevel: siguiente nivel
// - progress: porcentaje hacia siguiente nivel
// - earnedBadges: array de IDs de badges obtenidos
// - badgeProgress: objeto con progreso de cada badge
// - eventCounts: conteo de cada tipo de evento
```

## 📊 Estructura de la Base de Datos

### Tabla `user_events`
Registra cada evento que ocurre:
- `user_id`: ID del usuario
- `event_id`: ID del evento
- `xp_earned`: XP otorgado
- `created_at`: Fecha del evento

### Tabla `user_badges`
Registra badges obtenidos:
- `user_id`: ID del usuario
- `badge_id`: ID del badge
- `earned_at`: Fecha de obtención

### Tabla `profiles` (actualizada)
- `xp`: XP total del usuario (calculado automáticamente)
- `level`: Nivel actual (calculado automáticamente)

## 🔄 Flujo Automático

1. **Usuario realiza acción** → Se llama `recordEvent('event.id')`
2. **Sistema registra evento** → Se inserta en `user_events`
3. **Trigger actualiza XP** → Se actualiza `profiles.xp` y `profiles.level`
4. **Sistema verifica badges** → Se comparan requisitos con eventos
5. **Si badge obtenido** → Se inserta en `user_badges`
6. **Si level up** → Se retorna `levelUp: true` (para animación)

## 🎨 Personalización

### Agregar un Nuevo Evento

1. Edita `src/config/gamification/events.ts`
2. Agrega el evento con su XP:
```typescript
'new.event.id': {
  id: 'new.event.id',
  name: 'Nombre del Evento',
  description: 'Descripción',
  xpReward: 50,
  category: 'cv',
},
```

### Agregar un Nuevo Nivel

1. Edita `src/config/gamification/levels.ts`
2. Agrega el nivel con su XP requerido:
```typescript
{
  id: 'nuevo_nivel',
  name: 'Nuevo Nivel',
  description: 'Descripción',
  icon: 'icon_name',
  requiredXp: 10000,
  order: 9, // Siguiente número
  color: '#color',
},
```

### Agregar un Nuevo Badge

1. Edita `src/config/gamification/badges.ts`
2. Agrega el badge con sus requisitos:
```typescript
{
  id: 'nuevo_badge',
  name: 'Nuevo Badge',
  description: 'Descripción',
  icon: 'icon_name',
  iconColor: '#color',
  requirements: [
    { eventId: 'event.id', count: 5 },
    { eventId: 'other.event', count: 3 },
  ],
},
```

## 🚀 Próximos Pasos

Las animaciones (CVP-22, CVP-23) se implementarán después para mostrar:
- Toast cuando se obtiene XP
- Animación cuando se sube de nivel
- Animación cuando se obtiene un badge

