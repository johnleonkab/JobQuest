# JobQuest

Tu búsqueda de empleo gamificada. Convierte tu búsqueda de empleo en una aventura épica.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd JobQuest
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Luego edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🐳 Desarrollo con Docker

### Usando Docker Compose (Recomendado)

1. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales
   ```

2. **Iniciar el contenedor de desarrollo**
   ```bash
   docker-compose up dev
   ```

   O en modo detached:
   ```bash
   docker-compose up -d dev
   ```

3. **Detener el contenedor**
   ```bash
   docker-compose down
   ```

### Construir imagen de producción

```bash
docker build -t jobquest:latest .
docker run -p 3000:3000 --env-file .env.local jobquest:latest
```

## 📁 Estructura del Proyecto

```
JobQuest/
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── supabase/     # Clientes de Supabase
│           ├── client.ts  # Cliente para uso en cliente
│           └── server.ts # Cliente para uso en servidor
├── public/               # Archivos estáticos
├── .env.example          # Ejemplo de variables de entorno
├── Dockerfile            # Dockerfile para producción
├── Dockerfile.dev        # Dockerfile para desarrollo
├── docker-compose.yml    # Configuración de Docker Compose
└── package.json
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint

## 🔐 Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API
3. Copia la URL del proyecto y la clave anónima (anon key)
4. Para la clave de servicio (service role key), ve a Settings > API > Service Role Key
5. Agrega estas credenciales a tu archivo `.env.local`

### Configurar Base de Datos

1. Ve a SQL Editor en tu proyecto de Supabase
2. Ejecuta el script `supabase_setup.sql` que está en la raíz del proyecto
3. Ejecuta el script `supabase_gamification.sql` para el sistema de gamificación
4. Esto creará:
   - La tabla `profiles` con Row Level Security
   - El bucket de storage `avatars` para las fotos de perfil
   - Las tablas `user_events` y `user_badges` para gamificación
   - Los triggers necesarios para crear perfiles automáticamente
   - El trigger para actualizar XP y nivel automáticamente

### Configurar Google OAuth

1. Ve a Authentication > Providers en Supabase
2. Habilita Google como proveedor
3. Configura las credenciales de Google OAuth:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto OAuth 2.0
   - Agrega `https://[tu-proyecto].supabase.co/auth/v1/callback` como URL de redirección autorizada
   - Copia el Client ID y Client Secret a Supabase

## 📝 Notas

- El proyecto usa Next.js 16 con App Router
- TypeScript está configurado con strict mode
- Tailwind CSS está configurado con los colores del tema de JobQuest
- El proyecto está preparado para autenticación con Google a través de Supabase

## ✅ Funcionalidades Implementadas

### Autenticación (CVP-8)
- ✅ Login/Registro con Google OAuth a través de Supabase
- ✅ Página de perfil de usuario (CVP-13)
- ✅ Modal de onboarding (CVP-14)
- ✅ Middleware de protección de rutas
- ✅ Gestión de sesiones con cookies

### Navegación (CVP-15)
- ✅ Sidebar con navegación completa
- ✅ Display de perfil de usuario en sidebar
- ✅ Barra de progreso de nivel
- ✅ Navegación a: Dashboard, Job Openings, CV Builder, Gamificación

### Landing Page (CVP-27)
- ✅ Landing page completa con diseño moderno
- ✅ Formulario de registro integrado con Google OAuth

### Gamificación (CVP-19, CVP-20, CVP-21)
- ✅ Sistema de XP con eventos configurables
- ✅ Sistema de niveles (8 niveles de carrera)
- ✅ Sistema de badges con requisitos basados en eventos
- ✅ Página de gamificación con tabs (Niveles y Badges)
- ✅ Cálculo automático de nivel basado en XP
- ✅ Verificación automática de badges
- ✅ Progreso visual hacia siguiente nivel y badges

## 🎯 Próximos Pasos

- [ ] CVP-19: Sistema de XP
- [ ] CVP-20: Sistema de Badges
- [ ] CVP-21: Sistema de Niveles
- [ ] CVP-25: CV Builder layout
- [ ] CVP-17: CRM Homepage

