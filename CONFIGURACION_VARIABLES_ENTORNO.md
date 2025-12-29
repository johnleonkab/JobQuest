# 🔐 Configuración de Variables de Entorno

Esta guía te explica paso a paso cómo configurar las variables de entorno necesarias para que JobQuest funcione correctamente.

## 📍 Dónde se Configuran

Las variables de entorno se configuran en un archivo llamado `.env.local` en la raíz del proyecto.

**⚠️ IMPORTANTE:** Este archivo NO debe subirse a Git (ya está en `.gitignore`).

## 🚀 Pasos para Configurar

### 1. Crear el archivo `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local`:

```bash
# Desde la raíz del proyecto
touch .env.local
```

O simplemente copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

### 2. Obtener las Credenciales de Supabase

#### Paso 1: Crear o Acceder a tu Proyecto Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto o selecciona uno existente

#### Paso 2: Obtener la URL y la Clave Anónima

1. En tu proyecto de Supabase, ve a **Settings** (Configuración) en el menú lateral
2. Haz clic en **API**
3. Encontrarás dos valores importantes:

   - **Project URL**: Esta es tu `NEXT_PUBLIC_SUPABASE_URL`
     - Ejemplo: `https://abcdefghijklmnop.supabase.co`
   
   - **anon public key**: Esta es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Es una clave larga que comienza con `eyJ...`

#### Paso 3: Obtener la Service Role Key (Opcional pero Recomendado)

1. En la misma página de **Settings > API**
2. Busca la sección **Project API keys**
3. Haz clic en **Reveal** junto a `service_role` key
4. **⚠️ ADVERTENCIA:** Esta clave es muy sensible, nunca la expongas en el frontend
5. Copia esta clave como `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar Google OAuth (Opcional pero Necesario para Login)

Para que el login con Google funcione:

1. En Supabase, ve a **Authentication > Providers**
2. Habilita **Google**
3. Necesitarás crear credenciales OAuth en Google Cloud Console:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto o selecciona uno existente
   - Ve a **APIs & Services > Credentials**
   - Crea credenciales OAuth 2.0
   - Agrega como URL de redirección autorizada:
     ```
     https://[tu-proyecto-id].supabase.co/auth/v1/callback
     ```
   - Copia el **Client ID** y **Client Secret** a Supabase

### 4. Llenar el archivo `.env.local`

Abre el archivo `.env.local` y completa con tus valores:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1LXByb3llY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.tu-clave-aqui
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1LXByb3llY3RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.tu-clave-service-role-aqui

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=tu-clave-de-gemini-aqui
GEMINI_MODEL=gemini-2.0-flash-exp

# Logo.dev API Configuration
LOGO_DEV_API_KEY=tu-clave-de-logo-dev-aqui
```

**Ejemplo real (no uses estos valores, son solo ejemplos):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.ejemplo-de-clave-anon
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1MTkyMDAwLCJleHAiOjE5NjA3NjgwMDB9.ejemplo-de-clave-service-role
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Configurar la Base de Datos

Después de configurar las variables de entorno, necesitas ejecutar el script SQL:

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `supabase_setup.sql`
4. Ejecuta el script
5. Esto creará:
   - La tabla `profiles`
   - El bucket de storage `avatars`
   - Las políticas de seguridad (RLS)
   - Los triggers necesarios

### 6. Verificar la Configuración

Después de configurar todo, reinicia el servidor de desarrollo:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

Si todo está bien configurado, deberías poder:
- Ver la landing page sin errores
- Hacer clic en "Iniciar sesión con Google" sin errores en la consola

## 🔍 Verificar que las Variables Están Cargadas

Puedes verificar que las variables se están cargando correctamente revisando la consola del navegador. Si hay errores relacionados con Supabase, probablemente las variables no están configuradas correctamente.

## 📝 Variables de Entorno Explicadas

### `NEXT_PUBLIC_SUPABASE_URL`
- **Qué es:** La URL de tu proyecto Supabase
- **Dónde se usa:** En el cliente (navegador) y servidor
- **Por qué `NEXT_PUBLIC_`:** Next.js solo expone variables que empiezan con `NEXT_PUBLIC_` al navegador

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Qué es:** La clave pública/anónima de tu proyecto
- **Dónde se usa:** En el cliente (navegador) y servidor
- **Seguridad:** Es segura de exponer en el frontend, tiene permisos limitados

### `SUPABASE_SERVICE_ROLE_KEY`
- **Qué es:** La clave de servicio con permisos completos
- **Dónde se usa:** Solo en el servidor (server actions, API routes)
- **Seguridad:** ⚠️ NUNCA la expongas en el frontend, tiene permisos de administrador

### `NEXT_PUBLIC_APP_URL`
- **Qué es:** La URL de tu aplicación
- **Dónde se usa:** Para callbacks de OAuth y redirecciones
- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://tu-dominio.com`

### `GEMINI_API_KEY`
- **Qué es:** La clave de API de Google Gemini
- **Dónde se usa:** Solo en el servidor (API routes) para generar insights de AI
- **Cómo obtenerla:**
  1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Inicia sesión con tu cuenta de Google
  3. Haz clic en "Create API Key"
  4. Copia la clave generada
- **Seguridad:** ⚠️ NUNCA la expongas en el frontend, solo se usa en el servidor

### `GEMINI_MODEL` (Opcional)
- **Qué es:** El modelo de Gemini a usar
- **Valores posibles:**
  - `gemini-2.0-flash-exp` (por defecto, más rápido y económico, versión experimental)
  - `gemini-1.5-flash` (versión estable anterior)
  - `gemini-1.5-pro` (más potente, mejor calidad)
  - `gemini-pro` (versión anterior)
- **Dónde se usa:** Solo en el servidor para configurar qué modelo usar
- **Recomendación:** Usa `gemini-2.0-flash-exp` para la mayoría de casos (por defecto), `gemini-1.5-pro` para análisis más complejos

### `LOGO_DEV_API_KEY`
- **Qué es:** La clave de API pública (publishable key) de Logo.dev para extraer logos de empresas
- **Dónde se usa:** Solo en el servidor (API routes) para extraer logos automáticamente
- **Cómo obtenerla:**
  1. Ve a [Logo.dev](https://www.logo.dev/signup)
  2. Regístrate o inicia sesión
  3. Ve a tu [dashboard de API keys](https://www.logo.dev/dashboard/api-keys)
  4. Usa la clave pública (`pk_`) - es segura para usar en el servidor
  5. Copia la clave generada (debe comenzar con `pk_`)
- **Formato:** La clave debe comenzar con `pk_` (publishable key)
- **Documentación:** 
  - [docs.logo.dev](https://docs.logo.dev)
  - [Logo Images by Name](https://docs.logo.dev/logo-images/name)
- **Uso:** La API busca logos por nombre de empresa usando: `https://img.logo.dev/name/{companyName}?token={api_key}`
- **Seguridad:** Aunque es una clave pública, se usa solo en el servidor para mantener la seguridad

## 🚨 Problemas Comunes

### Error: "Missing Supabase environment variables"
- **Causa:** Las variables no están configuradas o el archivo `.env.local` no existe
- **Solución:** Verifica que el archivo `.env.local` existe y tiene todas las variables

### Error: "Invalid API key"
- **Causa:** Las claves están mal copiadas o son de otro proyecto
- **Solución:** Verifica que copiaste las claves correctas desde Supabase

### Las variables no se cargan después de crearlas
- **Causa:** Next.js necesita reiniciarse para cargar nuevas variables
- **Solución:** Detén el servidor (Ctrl+C) y vuelve a ejecutar `npm run dev`

### Error en producción
- **Causa:** Las variables no están configuradas en la plataforma de hosting
- **Solución:** Configura las variables de entorno en tu plataforma (Vercel, Netlify, etc.)

### Rate Limiting (Opcional - Solo para Producción)

Para usar rate limiting con Redis en producción, necesitas configurar Upstash Redis:

1. **Crear cuenta en Upstash:**
   - Ve a [https://upstash.com](https://upstash.com)
   - Crea una cuenta gratuita
   - Crea una nueva base de datos Redis

2. **Obtener credenciales:**
   - En el dashboard de Upstash, copia:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

3. **Agregar a `.env.local`:**
   ```bash
   # Rate Limiting (Opcional - Solo para producción)
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

**Nota:** Si no configuras estas variables, el sistema usará un store en memoria (solo para desarrollo). En producción, se recomienda usar Upstash Redis.

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js sobre Variables de Entorno](https://nextjs.org/docs/basic-features/environment-variables)
- [Guía de OAuth de Supabase](https://supabase.com/docs/guides/auth/social-login)
- [Documentación de Upstash Redis](https://docs.upstash.com/redis)

