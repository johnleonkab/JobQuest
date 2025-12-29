# JobQuest 🎯

**Plataforma integral de gestión de carrera profesional con gamificación, construcción de CV personalizado y seguimiento de ofertas de trabajo.**

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Objetivo](#objetivo)
- [Características Principales](#características-principales)
- [Módulos](#módulos)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad](#seguridad)
- [Desarrollo](#desarrollo)

---

## 🎯 Visión General

JobQuest es una plataforma web moderna diseñada para ayudar a profesionales a gestionar su carrera de manera integral. Combina herramientas prácticas de gestión de CV y seguimiento de ofertas laborales con elementos de gamificación que motivan y recompensan el progreso del usuario.

---

## 🎯 Objetivo

El objetivo principal de JobQuest es proporcionar una solución completa para profesionales que buscan trabajo, permitiéndoles:

1. **Construir CVs personalizados** adaptados a cada oferta de trabajo
2. **Gestionar ofertas laborales** de manera organizada con un sistema Kanban
3. **Obtener insights de IA** sobre su CV y mejoras sugeridas
4. **Mantener la motivación** a través de un sistema de gamificación con XP, niveles y badges
5. **Seguir el progreso** de sus aplicaciones con entrevistas, contactos y notas

---

## ✨ Características Principales

### 🎮 Gamificación
- Sistema de puntos de experiencia (XP) por acciones realizadas
- Niveles progresivos con recompensas
- Sistema de badges (insignias) con más de 50 logros diferentes
- Notificaciones en tiempo real de progreso
- Dashboard con estadísticas de gamificación

### 📝 Constructor de CV
- Múltiples secciones: Experiencia, Educación, Certificaciones, Idiomas, Voluntariado, Proyectos
- Edición intuitiva con modales
- Mejora automática de textos con IA
- Análisis de CV con insights de IA
- Chat interactivo con IA para consultas sobre el CV
- Exportación a PDF personalizada por oferta

### 💼 Gestión de Ofertas de Trabajo
- Vista Kanban con drag & drop
- Vista de lista con filtros avanzados
- Estados personalizables: Guardada, Contactada, Aplicada, Entrevista, Oferta, Descartada, Conseguida
- Detalle completo de cada oferta
- Selección de secciones de CV por oferta
- Generación de CV personalizado por oferta
- Extracción automática de logos de empresas
- Gestión de entrevistas con calendario
- Gestión de contactos por oferta

### 🤖 Inteligencia Artificial
- Análisis completo del CV con Gemini AI
- Recomendaciones de mejora por sección
- Chat interactivo sobre el CV
- Sugerencias automáticas de secciones de CV para ofertas
- Mejora de textos con corrección ortográfica y sugerencias

### 📊 Dashboard
- Vista general del progreso
- Nivel actual y puntos
- Próximos badges
- Entrevistas de la semana
- Ofertas pendientes de aplicar
- Contactos a revisar
- Notas importantes

---

## 🧩 Módulos

### 1. Módulo de Autenticación y Perfil (`/profile`)
- Autenticación con Google OAuth vía Supabase
- Gestión de perfil de usuario
- Onboarding inicial
- Avatar personalizado
- Información personal y profesional

**Archivos principales:**
- `src/app/(protected)/profile/page.tsx`
- `src/app/api/profile/route.ts`
- `src/app/api/user/route.ts`
- `src/components/OnboardingModal.tsx`

### 2. Módulo de Gamificación (`/gamification`)
- Sistema de XP y niveles
- Sistema de badges
- Eventos y recompensas
- Progreso y estadísticas

**Archivos principales:**
- `src/app/(protected)/gamification/page.tsx`
- `src/app/api/gamification/route.ts`
- `src/config/gamification/`
- `src/hooks/useGamification.ts`
- `supabase_gamification.sql`

**Eventos principales:**
- `profile.updated` - Actualización de perfil
- `cv.*` - Eventos de CV (añadir, actualizar secciones)
- `job_offer.*` - Eventos de ofertas de trabajo
- `ai.*` - Eventos de uso de IA
- Y muchos más...

### 3. Módulo Constructor de CV (`/cv-builder`)
- Gestión de todas las secciones del CV
- Modales de edición por sección
- Mejora con IA por sección
- Vista previa del CV

**Archivos principales:**
- `src/app/(protected)/cv-builder/page.tsx`
- `src/components/cv/` (todos los componentes de secciones)
- `src/app/api/cv/*/route.ts` (endpoints por sección)
- `supabase_cv_builder.sql`

**Secciones:**
- Experiencia Laboral
- Educación
- Certificaciones
- Idiomas
- Voluntariado
- Proyectos

### 4. Módulo de Ofertas de Trabajo (`/job-openings`)
- Vista Kanban con drag & drop
- Vista de lista con filtros
- Modal de creación/edición
- Vista detallada de oferta
- Gestión de entrevistas
- Gestión de contactos
- Selección de secciones de CV
- Generación de CV personalizado

**Archivos principales:**
- `src/app/(protected)/job-openings/page.tsx`
- `src/components/job-offers/`
- `src/app/api/job-offers/route.ts`
- `src/app/api/interviews/route.ts`
- `src/app/api/contacts/route.ts`
- `supabase_job_offers.sql`
- `supabase_interviews.sql`
- `supabase_job_offer_contacts.sql`

### 5. Módulo de IA (`/cv-builder` - AI Insights)
- Análisis completo del CV
- Chat interactivo
- Mejora de textos por sección
- Sugerencias automáticas

**Archivos principales:**
- `src/components/cv/AIInsightsModal.tsx`
- `src/hooks/useAIInsights.ts`
- `src/hooks/useAISectionImprover.ts`
- `src/lib/ai/gemini.ts`
- `src/config/ai/prompts.ts`
- `src/app/api/ai/insights/route.ts`
- `supabase_ai_insights.sql`

### 6. Módulo Dashboard (`/dashboard`)
- Vista general del estado
- Estadísticas de gamificación
- Ofertas pendientes
- Entrevistas próximas
- Contactos a revisar
- Notas importantes

**Archivos principales:**
- `src/app/(protected)/dashboard/page.tsx`
- `src/app/api/dashboard/route.ts`

### 7. Módulo de Extracción de Logos (`/job-openings`)
- Extracción automática de logos de empresas
- Integración con logo.dev API
- Fallback a website de empresa

**Archivos principales:**
- `src/lib/logo-extraction.ts`
- `src/app/api/logo-extraction/route.ts`

---

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **React Hooks** - Gestión de estado
- **Material Symbols** - Iconografía

### Backend
- **Next.js API Routes** - Endpoints del servidor
- **Supabase** - Backend como servicio
  - PostgreSQL - Base de datos
  - Row Level Security (RLS) - Seguridad a nivel de fila
  - Storage - Almacenamiento de archivos (avatars)
  - Auth - Autenticación OAuth

### Base de Datos
- **PostgreSQL** (vía Supabase)
- **Triggers y Funciones** - Lógica de negocio en BD
- **RLS Policies** - Seguridad a nivel de fila

### Servicios Externos
- **Google Gemini AI** - Análisis y mejora de CV
- **Logo.dev API** - Extracción de logos de empresas
- **Upstash Redis** - Rate limiting y cache

### Herramientas de Desarrollo
- **Docker & Docker Compose** - Contenedorización
- **ESLint** - Linting de código
- **Turbopack** - Bundler rápido

### Seguridad
- **CSRF Protection** - Protección contra CSRF
- **Rate Limiting** - Limitación de requests
- **Input Validation** - Validación de entradas
- **XSS Protection** - Sanitización con DOMPurify
- **UUID Validation** - Validación de IDs
- **Error Handling** - Manejo seguro de errores

---

## 🏗 Arquitectura

### Estructura de Carpetas

```
JobQuest/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (protected)/              # Rutas protegidas
│   │   │   ├── dashboard/           # Dashboard principal
│   │   │   ├── profile/             # Perfil de usuario
│   │   │   ├── cv-builder/          # Constructor de CV
│   │   │   ├── job-openings/        # Ofertas de trabajo
│   │   │   ├── gamification/       # Gamificación
│   │   │   └── layout.tsx           # Layout protegido
│   │   ├── api/                     # API Routes
│   │   │   ├── user/                # Usuario
│   │   │   ├── profile/             # Perfil
│   │   │   ├── gamification/        # Gamificación
│   │   │   ├── cv/                  # CV (todas las secciones)
│   │   │   ├── job-offers/          # Ofertas
│   │   │   ├── interviews/          # Entrevistas
│   │   │   ├── contacts/            # Contactos
│   │   │   ├── ai/                  # IA
│   │   │   ├── logo-extraction/     # Logos
│   │   │   └── dashboard/           # Dashboard
│   │   ├── auth/                    # Autenticación
│   │   └── layout.tsx               # Layout raíz
│   ├── components/                  # Componentes React
│   │   ├── cv/                      # Componentes de CV
│   │   ├── job-offers/              # Componentes de ofertas
│   │   ├── Sidebar.tsx              # Barra lateral
│   │   ├── OnboardingModal.tsx      # Modal de onboarding
│   │   └── CSRFProvider.tsx         # Provider CSRF
│   ├── contexts/                    # Contextos React
│   │   └── ToastContext.tsx         # Sistema de notificaciones
│   ├── hooks/                       # Custom Hooks
│   │   ├── useGamification.ts       # Hook de gamificación
│   │   ├── useAIInsights.ts         # Hook de IA insights
│   │   └── useAISectionImprover.ts  # Hook de mejora con IA
│   ├── lib/                         # Utilidades y servicios
│   │   ├── supabase/                # Cliente Supabase
│   │   ├── ai/                      # Servicio de IA
│   │   ├── auth/                    # Acciones de autenticación
│   │   ├── logo-extraction.ts       # Extracción de logos
│   │   └── utils/                   # Utilidades
│   │       ├── csrf.ts              # CSRF
│   │       ├── rate-limit.ts        # Rate limiting
│   │       ├── error-handler.ts     # Manejo de errores
│   │       ├── uuid-validator.ts    # Validación UUID
│   │       ├── input-validator.ts   # Validación de inputs
│   │       └── request-validator.ts # Validación de requests
│   ├── config/                      # Configuraciones
│   │   ├── gamification/            # Config de gamificación
│   │   └── ai/                      # Prompts de IA
│   ├── middleware.ts                # Middleware de Next.js
│   └── middleware/                  # Middlewares personalizados
│       ├── csrf.ts                  # Middleware CSRF
│       └── rate-limit.ts            # Middleware rate limit
├── supabase_*.sql                   # Scripts SQL de Supabase
├── docker-compose.yml                # Docker Compose
├── Dockerfile                        # Dockerfile
├── package.json                      # Dependencias
└── README.md                         # Este archivo
```

### Flujo de Autenticación

1. Usuario inicia sesión con Google OAuth
2. Supabase maneja la autenticación
3. Middleware verifica la sesión en cada request
4. Rutas protegidas requieren autenticación
5. API routes validan usuario con Supabase

### Flujo de Datos

```
Cliente (React)
    ↓
Next.js API Routes
    ↓
Supabase Client (Server)
    ↓
PostgreSQL (con RLS)
```

### Seguridad

1. **Middleware Layer**
   - CSRF protection
   - Rate limiting
   - Session validation

2. **API Layer**
   - Authentication checks
   - Input validation
   - UUID validation
   - Ownership validation
   - Error sanitization

3. **Database Layer**
   - Row Level Security (RLS)
   - Policies por tabla
   - Triggers para lógica de negocio

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Logo.dev
LOGO_DEV_API_KEY=your_logo_dev_api_key

# Upstash Redis (para rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

Ver `CONFIGURACION_VARIABLES_ENTORNO.md` para más detalles.

### Base de Datos

Ejecuta los siguientes scripts SQL en Supabase (en orden):

1. `supabase_setup.sql` - Configuración inicial
2. `supabase_gamification.sql` - Módulo de gamificación
3. `supabase_cv_builder.sql` - Constructor de CV
4. `supabase_job_offers.sql` - Ofertas de trabajo
5. `supabase_interviews.sql` - Entrevistas
6. `supabase_job_offer_contacts.sql` - Contactos
7. `supabase_ai_insights.sql` - Insights de IA
8. `supabase_job_offers_website_migration.sql` - Migración de website

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint
```

### Docker

```bash
# Construir imagen
docker-compose build

# Ejecutar contenedor
docker-compose up

# Ejecutar en background
docker-compose up -d
```

---

## 🔒 Seguridad

### Medidas Implementadas

1. **CSRF Protection**
   - Tokens CSRF en cookies
   - Validación en middleware
   - Headers requeridos en mutaciones

2. **Rate Limiting**
   - Upstash Redis para rate limiting
   - Límites por tipo de endpoint
   - Fallback a memoria en desarrollo

3. **Input Validation**
   - Validación de tipos
   - Validación de longitud
   - Validación de UUIDs
   - Validación de URLs y emails
   - Validación de enums

4. **XSS Protection**
   - DOMPurify para sanitización
   - Validación de HTML antes de renderizar

5. **Error Handling**
   - Mensajes genéricos en producción
   - Logging seguro
   - No exposición de información sensible

6. **Row Level Security (RLS)**
   - Políticas por tabla
   - Usuarios solo acceden a sus datos
   - Validación de ownership en API

7. **File Upload Security**
   - Validación de tipos MIME
   - Validación de tamaño
   - Nombres de archivo aleatorios

---

## 🚀 Desarrollo

### Estructura de Componentes

Los componentes siguen una estructura modular:

- **Páginas**: `src/app/(protected)/*/page.tsx`
- **Componentes**: `src/components/*/`
- **Hooks**: `src/hooks/*.ts`
- **API Routes**: `src/app/api/*/route.ts`

### Agregar Nueva Sección de CV

1. Crear tabla en Supabase
2. Crear API route en `src/app/api/cv/[section]/route.ts`
3. Crear componente en `src/components/cv/[Section]Section.tsx`
4. Crear modal en `src/components/cv/[Section]Modal.tsx`
5. Agregar a `src/app/(protected)/cv-builder/page.tsx`
6. Agregar eventos de gamificación

### Agregar Nuevo Evento de Gamificación

1. Agregar evento en `src/config/gamification/events.ts`
2. Agregar recompensa de XP
3. Llamar `recordEvent` en el lugar apropiado

### Testing

- **Rate Limiting**: `/test-rate-limit`
- **Toasts**: `/test-toasts`

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Gemini AI](https://ai.google.dev/docs)
- [Documentación de Upstash](https://docs.upstash.com/)

---

## 📝 Licencia

Este proyecto es privado y de uso personal.

---

## 👤 Autor

Desarrollado como proyecto personal para gestión de carrera profesional.

---

**Última actualización**: Diciembre 2024
