# PRD: Módulo de Gamificación - JobQuest

## 📋 Descripción del Proyecto

**Proyecto:** Gamification Module  
**URL:** https://linear.app/cvpro/project/gamification-module-e3bfece5943d  
**Estado:** Backlog

### Objetivo

Este módulo tiene como objetivo mantener el seguimiento del proceso de gamificación de la plataforma, basándose en los siguientes puntos clave:

1. **Sistema de XP (Puntos de Experiencia)**: Cada acción que realiza el usuario en la plataforma recompensa al usuario con puntos XP. Las acciones más difíciles se recompensan con más XP.

2. **Sistema de Niveles**: Existen niveles en los que el usuario progresa. Cada nivel se completa alcanzando un umbral de puntos. Una vez que el usuario sube de un nivel a otro, debe haber una experiencia de UI realmente gratificante.

3. **Sistema de Badges (Insignias)**: Los badges son los objetivos que mantienen al usuario en movimiento entre los XP y los niveles. Los badges se logran cuando se realiza un conjunto de acciones. Los badges tienen una imagen/icono, nombre y descripción.

**Fundamento del Sistema:** Todo el sistema de gamificación se basa en una serie de eventos o acciones que realiza el usuario en la plataforma, que son las que desencadenan los XP, los badges, y consecuentemente la subida de nivel.

---

## 🎯 Issues del Proyecto

### CVP-19: XP System
**Estado:** Todo

**Descripción:**
Cada acción que se realiza dentro del sistema otorga una serie de puntos al usuario. Estos puntos siempre irán creciendo, no hay forma de perder puntos.

**Ejemplos de acciones:**
- Cuando un usuario añade una nueva sección a su CV, aumentarán sus XP
- Completar su perfil
- Crear una sección en trabajo
- Añadir una nueva oferta
- Adelantar la oferta de estado

**Gestión de XP:**
1. Existe un archivo de configuración donde están descritos los eventos posibles de los usuarios dentro de la plataforma
2. Cada uno de esos eventos se le asigna en ese archivo un número de XP que se otorgarán al usuario en el momento de realizar dicha acción
3. Esos XP quedarán asignados al usuario, que irá avanzando por niveles

---

### CVP-21: Levels System
**Estado:** Todo

**Descripción:**
Se definirán en un archivo de configuración los niveles existentes en la plataforma: nombre, descripción, y URL a la imagen de ese nivel (icono), junto con los puntos que hacen falta para llegar a ese nivel.

**Reglas:**
- Cuando un usuario va acumulando puntos, y supera los puntos para cambiar de nivel, automáticamente se le asigna el nuevo nivel en función de los puntos que tiene
- No es posible bajar de nivel, sólo subir

---

### CVP-20: Badges System
**Estado:** Todo

**Descripción:**
De forma adicional a los puntos y los niveles, existe un sistema de badges o insignias. Este sistema asigna a una serie de hitos, una insignia que recibe el usuario.

**Definición de cada insignia:**
1. Se definirá toda su configuración en un archivo de configuración
2. El usuario verá de cada badge su nombre, icono (URL), descripción
3. La definición de cada badge contiene:
   - Nombre
   - Descripción
   - URL del icono
   - Requisitos para conseguir ese badge: Estos requisitos se definen como un array de parejas de nombre de *evento y número de veces que ha pasado ese evento*
   
**Ejemplo:** El badge A se obtiene cuando se han creado 3 secciones y se ha añadido una oferta de trabajo.

---

### CVP-22: Level Change Animation
**Estado:** Todo

**Descripción:**
Cuando un usuario pasa de nivel, este proceso debe suceder en el background. Al verificar cuándo se pasa de nivel, el usuario verá una animación en la plataforma, que le anime a continuar. Se mostrará un toast notification que mostrará el upgrade de nivel.

---

### CVP-23: Badges Animation
**Estado:** Todo

**Descripción:**
Cuando un usuario obtiene un nuevo badge, este proceso debe suceder en el background. Al verificar cuándo obtiene un badge, el usuario verá una animación en la plataforma específica, que le anime a ver ese badge. Se mostrará un toast notification que mostrará el badge.

---

### CVP-24: Levels Animation
**Estado:** Todo

**Descripción:** (Pendiente de detalle)

---

## 🖥️ Pantallas Necesarias

### 1. Página Principal de Gamificación (XP, Levels and Badges Page)
**Referencia:** CVP-16 - XP, Levels and Badges page  
**Estado:** Todo  
**Proyecto:** Pages Layout (relacionado con Navigation Layout)

**Ruta:** `/gamification` o `/xp-levels-badges`

**Descripción:**
Página dedicada donde el usuario puede ver su progreso completo en el sistema de gamificación.

**Componentes principales:**

#### 1.1. Header de Progreso
- **XP Total del Usuario**
  - Número grande y destacado
  - Animación cuando aumenta
  - Indicador visual de progreso hacia el siguiente nivel
  
- **Nivel Actual**
  - Icono del nivel actual (imagen)
  - Nombre del nivel
  - Descripción del nivel
  - Barra de progreso hacia el siguiente nivel
  - XP necesario para el siguiente nivel

#### 1.2. Sección de Niveles
- **Lista de Niveles**
  - Grid o lista de todos los niveles disponibles
  - Niveles desbloqueados: visibles y destacados
  - Niveles bloqueados: con opacidad reducida o efecto "bloqueado"
  - Para cada nivel mostrar:
    - Icono/imagen
    - Nombre
    - Descripción
    - XP requerido
    - Estado (actual, desbloqueado, bloqueado)
  - Indicador visual del nivel actual del usuario

#### 1.3. Sección de Badges
- **Grid de Badges**
  - Badges obtenidos: visibles con colores completos
  - Badges no obtenidos: en escala de grises o con efecto "bloqueado"
  - Para cada badge mostrar:
    - Icono/imagen
    - Nombre
    - Descripción
    - Estado (obtenido/no obtenido)
    - Fecha de obtención (si está obtenido)
    - Progreso hacia el badge (si no está obtenido)
      - Ejemplo: "2/3 secciones creadas"

#### 1.4. Historial de Actividades (Opcional pero recomendado)
- **Timeline de Eventos**
  - Lista de acciones recientes que otorgaron XP
  - Fecha y hora
  - Acción realizada
  - XP ganado
  - Badge obtenido (si aplica)

---

### 2. Componente de XP en Header/Sidebar
**Ubicación:** Header principal o Sidebar de navegación

**Descripción:**
Componente pequeño que muestra el progreso actual del usuario de forma constante.

**Elementos:**
- Icono de nivel actual (pequeño)
- XP total (número)
- Barra de progreso mini hacia el siguiente nivel
- Click para ir a la página de gamificación

---

### 3. Toast Notifications (Animaciones)

#### 3.1. Toast de Subida de Nivel
**Trigger:** Cuando el usuario alcanza un nuevo nivel

**Elementos:**
- Animación de celebración (confetti, estrellas, etc.)
- Icono del nuevo nivel
- Mensaje: "¡Felicidades! Has alcanzado el nivel [Nombre]"
- XP total actualizado
- Botón para ver detalles del nivel
- Sonido de celebración (opcional)

**Diseño:**
- Modal o toast flotante
- Colores vibrantes y celebratorios
- Animación de entrada (slide, fade, scale)
- Duración: 5-7 segundos o hasta que el usuario lo cierre

#### 3.2. Toast de Badge Obtenido
**Trigger:** Cuando el usuario completa los requisitos para un badge

**Elementos:**
- Animación de badge desbloqueado
- Icono del badge obtenido
- Nombre del badge
- Mensaje: "¡Has desbloqueado el badge [Nombre]!"
- Descripción breve del badge
- Botón para ver todos los badges

**Diseño:**
- Similar al toast de nivel pero con estilo de badge
- Efecto de "brillo" o "resplandor" en el badge
- Animación de entrada impactante

#### 3.3. Toast de XP Ganado
**Trigger:** Cuando el usuario completa una acción que otorga XP

**Elementos:**
- Icono de XP
- Mensaje: "+[Número] XP"
- Descripción de la acción: "Has [acción realizada]"
- Animación de número incrementando

**Diseño:**
- Toast pequeño y discreto
- Posición: esquina superior derecha o inferior
- Duración: 3-5 segundos
- Stack de múltiples toasts si hay varias acciones rápidas

---

### 4. Modal de Detalle de Nivel
**Trigger:** Click en un nivel desde la página de gamificación o desde el toast

**Elementos:**
- Imagen grande del nivel
- Nombre del nivel
- Descripción completa
- XP requerido para alcanzarlo
- XP actual del usuario
- Progreso visual (barra)
- Lista de beneficios o características del nivel
- Botón de cerrar

---

### 5. Modal de Detalle de Badge
**Trigger:** Click en un badge desde la página de gamificación o desde el toast

**Elementos:**
- Icono grande del badge
- Nombre del badge
- Descripción completa
- Estado (obtenido/no obtenido)
- Si está obtenido:
  - Fecha de obtención
  - Mensaje de felicitación
- Si no está obtenido:
  - Progreso actual
  - Requisitos detallados:
    - Lista de eventos necesarios
    - Contador de cada evento (ej: "2/3 secciones creadas")
  - Barra de progreso general

---

### 6. Página de Configuración de Eventos (Admin/Backend)
**Nota:** Esta pantalla puede ser solo de configuración de archivos, no necesariamente una UI

**Descripción:**
Archivo de configuración donde se definen todos los eventos y sus valores de XP.

**Estructura sugerida:**
```typescript
interface GameEvent {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  category: 'cv' | 'application' | 'profile' | 'other';
}

interface Level {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requiredXp: number;
  order: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requirements: Array<{
    eventId: string;
    count: number;
  }>;
}
```

---

## 🎨 Consideraciones de Diseño

### Colores y Temática
- Usar la paleta de colores de JobQuest (primary: #db2777)
- Colores vibrantes para celebraciones y logros
- Gradientes para niveles y badges especiales
- Efectos de brillo y resplandor para elementos desbloqueados

### Animaciones
- Transiciones suaves para cambios de estado
- Animaciones celebratorias para logros importantes
- Micro-interacciones en hover y click
- Animaciones de progreso (barras que se llenan)

### Responsive
- Todas las pantallas deben ser responsive
- Grid de badges adaptable (2-4 columnas según tamaño de pantalla)
- Toasts adaptables a móvil (posición y tamaño)

---

## 📊 Flujo de Usuario

### Flujo 1: Usuario gana XP
1. Usuario realiza una acción (ej: añade sección al CV)
2. Sistema verifica el evento y otorga XP
3. Se muestra toast de "+X XP" (opcional, puede ser discreto)
4. Se actualiza el XP total en tiempo real
5. Sistema verifica si se alcanzó un nuevo nivel
6. Si hay nuevo nivel → Mostrar toast de nivel
7. Sistema verifica si se desbloqueó un badge
8. Si hay badge → Mostrar toast de badge

### Flujo 2: Usuario visita página de gamificación
1. Usuario hace click en "XP/Levels/Badges" en el sidebar
2. Se carga la página con:
   - Header con XP y nivel actual
   - Lista de niveles (con indicador del nivel actual)
   - Grid de badges (obtenidos y no obtenidos)
3. Usuario puede hacer click en cualquier nivel o badge para ver detalles
4. Modal se abre con información detallada

### Flujo 3: Usuario sube de nivel
1. Usuario completa acción que le da XP suficiente para subir de nivel
2. Sistema detecta el cambio de nivel en background
3. Se muestra toast/modal de celebración con animación
4. Se actualiza el nivel en toda la aplicación
5. Usuario puede hacer click para ver detalles del nuevo nivel

---

## 🔧 Archivos de Configuración Necesarios

### 1. `src/config/gamification/events.ts`
Define todos los eventos posibles y sus recompensas de XP.

### 2. `src/config/gamification/levels.ts`
Define todos los niveles disponibles en la plataforma.

### 3. `src/config/gamification/badges.ts`
Define todos los badges disponibles y sus requisitos.

---

## 📱 Componentes React Necesarios

1. `XPDisplay` - Muestra XP total y barra de progreso
2. `LevelCard` - Tarjeta individual de nivel
3. `BadgeCard` - Tarjeta individual de badge
4. `LevelUpToast` - Toast de subida de nivel
5. `BadgeUnlockedToast` - Toast de badge desbloqueado
6. `XPToast` - Toast de XP ganado
7. `LevelModal` - Modal de detalle de nivel
8. `BadgeModal` - Modal de detalle de badge
9. `GamificationPage` - Página principal de gamificación
10. `ProgressBar` - Barra de progreso reutilizable

---

## 🎯 Priorización de Implementación

### Fase 1: Fundamentos
1. CVP-19: XP System (configuración y lógica)
2. CVP-21: Levels System (configuración y lógica)
3. CVP-20: Badges System (configuración y lógica)

### Fase 2: UI Básica
4. Página de Gamificación (CVP-16)
5. Componente de XP en Header/Sidebar

### Fase 3: Animaciones y Experiencia
6. CVP-22: Level Change Animation
7. CVP-23: Badges Animation
8. CVP-24: Levels Animation (si aplica)

---

## 📝 Notas Adicionales

- El sistema debe ser completamente reactivo y actualizarse en tiempo real
- Las animaciones deben ser performantes y no bloquear la UI
- Los toasts deben poder apilarse si hay múltiples eventos
- El sistema debe persistir el estado del usuario (XP, nivel, badges) en la base de datos
- Considerar implementar un sistema de eventos/observers para detectar acciones del usuario
- Los badges y niveles deben ser fácilmente configurables sin necesidad de cambiar código

---

**Última actualización:** 27 de Diciembre, 2025

