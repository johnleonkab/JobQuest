# 🔍 Verificación de Variables de Entorno en Vercel

## ⚠️ Problema: 404 en `/auth/v1/authorize`

Si ves un error 404 en `job-quest-bice.vercel.app/auth/v1/authorize`, significa que `NEXT_PUBLIC_SUPABASE_URL` está configurada incorrectamente en Vercel.

## ✅ Solución

### Paso 1: Verificar Variables de Entorno en Vercel

1. **Ve a tu proyecto en Vercel**
2. **Settings → Environment Variables**
3. **Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea:**
   ```
   https://[tu-proyecto-id].supabase.co
   ```
   ⚠️ **NO debe ser:**
   - `https://job-quest-bice.vercel.app` ❌
   - `http://localhost:3000` ❌
   - Cualquier URL que no sea de Supabase ❌

### Paso 2: Obtener la URL Correcta de Supabase

1. **Ve a Supabase Dashboard**
2. **Settings → API**
3. **Copia el "Project URL"** (debe ser algo como `https://abcdefghijklmnop.supabase.co`)
4. **Esta es la URL que debe estar en `NEXT_PUBLIC_SUPABASE_URL`**

### Paso 3: Configurar en Vercel

1. **En Vercel → Settings → Environment Variables**
2. **Busca `NEXT_PUBLIC_SUPABASE_URL`**
3. **Si no existe o está mal:**
   - Agrega/Edita la variable
   - Valor: `https://[tu-proyecto-id].supabase.co` (tu URL real de Supabase)
   - Ambientes: ✅ Production, ✅ Preview, ✅ Development
4. **Guarda y haz Redeploy**

### Paso 4: Verificar Todas las Variables

Asegúrate de tener estas variables configuradas en Vercel:

```env
# Supabase (CRÍTICO - debe ser la URL de Supabase, no Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (tu clave anon)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)

# App URL (debe ser tu dominio de Vercel)
NEXT_PUBLIC_APP_URL=https://job-quest-bice.vercel.app

# Otros servicios
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
LOGO_DEV_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 🔍 Cómo Verificar

Después de hacer redeploy, la URL de OAuth debería ser:
```
https://[tu-proyecto-id].supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fjob-quest-bice.vercel.app%2Fauth%2Fcallback...
```

**NO debería ser:**
```
https://job-quest-bice.vercel.app/auth/v1/authorize... ❌
```

## 🐛 Si Sigue Sin Funcionar

1. **Verifica los logs de Vercel** durante el build para ver qué valores tienen las variables
2. **Asegúrate de hacer redeploy** después de cambiar variables
3. **Limpia la caché del navegador** o prueba en incógnito
4. **Verifica que `NEXT_PUBLIC_SUPABASE_URL` no tenga trailing slash**


