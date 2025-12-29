# 🔐 Configuración de OAuth en Vercel (Producción)

## ⚠️ Problema Común

Si después de hacer login con Google te redirige a `localhost:3000` en lugar de tu dominio de Vercel, es porque la variable `NEXT_PUBLIC_APP_URL` no está configurada correctamente.

## ✅ Solución

### Opción 1: Configurar Variable de Entorno en Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel**
2. **Settings > Environment Variables**
3. **Agrega la variable:**
   ```
   NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
   ```
   (Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel)

4. **Selecciona los ambientes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional, para desarrollo local)

5. **Redeploy** tu aplicación para que los cambios surtan efecto

### Opción 2: El código ahora detecta automáticamente la URL

El código ha sido actualizado para detectar automáticamente la URL del request usando los headers de Next.js. Esto significa que:

- **En desarrollo:** Usará `http://localhost:3000`
- **En producción:** Usará la URL del request (tu dominio de Vercel)

Sin embargo, **aún es recomendable** configurar `NEXT_PUBLIC_APP_URL` en Vercel para mayor control.

## 🔧 Configuración CRÍTICA en Supabase

**Este es el paso más importante:** Supabase usa estas URLs para redirigir después de la autenticación.

### Paso 1: Configurar Site URL

1. **Ve a Supabase Dashboard**
2. **Authentication > URL Configuration**
3. **Site URL:** Cambia esto a tu dominio de Vercel (NO localhost)
   ```
   https://tu-app.vercel.app
   ```
   ⚠️ **IMPORTANTE:** Si aquí dice `http://localhost:3000`, Supabase redirigirá a localhost incluso en producción.

### Paso 2: Configurar Redirect URLs

En la misma página, en **Redirect URLs**, agrega:

```
https://tu-app.vercel.app/auth/callback
https://tu-app.vercel.app/**
```

**Para desarrollo local, también puedes agregar:**
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Esto permite que funcione tanto en desarrollo como en producción.

### Paso 3: Verificar que el código use la URL correcta

El código en `src/lib/auth/actions.ts` ahora detecta automáticamente la URL, pero también puedes forzar la URL de producción configurando `NEXT_PUBLIC_APP_URL` en Vercel.

## 🔧 Configuración en Google Cloud Console

Asegúrate de que las URLs de redirección en Google OAuth incluyan:

1. **Ve a Google Cloud Console**
2. **APIs & Services > Credentials**
3. **Edita tus credenciales OAuth 2.0**
4. **Authorized redirect URIs** debe incluir:
   ```
   https://[tu-proyecto-id].supabase.co/auth/v1/callback
   ```
   (Esta es la URL de Supabase, no la de Vercel directamente)

## 📝 Checklist

- [ ] `NEXT_PUBLIC_APP_URL` configurado en Vercel con tu dominio
- [ ] Redeploy realizado después de agregar la variable
- [ ] Site URL en Supabase apunta a tu dominio de Vercel
- [ ] Redirect URLs en Supabase incluyen `/auth/callback`
- [ ] Google OAuth tiene la URL de Supabase en redirect URIs

## 🐛 Troubleshooting

**Sigue redirigiendo a localhost:**
- Verifica que `NEXT_PUBLIC_APP_URL` esté configurado en Vercel
- Asegúrate de haber hecho redeploy después de agregar la variable
- Revisa los logs de Vercel para ver qué URL se está usando

**Error "redirect_uri_mismatch":**
- Verifica que la URL en Supabase Site URL coincida con tu dominio
- Asegúrate de que las Redirect URLs incluyan `/**` para permitir todas las rutas

**No funciona después de redeploy:**
- Limpia la caché del navegador
- Prueba en modo incógnito
- Verifica que el redeploy se completó correctamente

