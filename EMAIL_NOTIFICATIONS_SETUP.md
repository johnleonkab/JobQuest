# 📧 Configuración de Email Notifications

Este documento explica cómo configurar el sistema de notificaciones por email de JobQuest.

## ✅ Implementación Completada

El sistema de notificaciones por email está completamente implementado con:

- ✅ Email de bienvenida al registrarse
- ✅ Notificaciones de logros (level ups y badges)
- ✅ Endpoint para resumen semanal (weekly digest)
- ✅ Endpoint para recordatorios de entrevistas
- ✅ Templates HTML responsive
- ✅ Soporte para servicios de email externos

## 🔧 Configuración

### 1. Configurar Resend

#### Paso 1: Crear cuenta en Resend
1. Ve a [Resend](https://resend.com) y crea una cuenta
2. Verifica tu email

#### Paso 2: Obtener API Key
1. En el dashboard de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre (ej: "JobQuest Production")
4. Copia la API Key (comienza con `re_`)

#### Paso 3: Verificar dominio (Opcional pero recomendado para producción)
1. En Resend, ve a **Domains**
2. Haz clic en **Add Domain**
3. Agrega tu dominio (ej: `tudominio.com`)
4. Sigue las instrucciones para verificar el dominio (agregar registros DNS)
5. Una vez verificado, podrás usar emails como `noreply@tudominio.com`

#### Paso 4: Configurar Variables de Entorno

Agrega estas variables a tu `.env.local` y a Vercel:

```bash
# Resend API Key (Requerido para producción)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email remitente (Opcional - por defecto usa onboarding@resend.dev)
RESEND_FROM_EMAIL=JobQuest <noreply@tudominio.com>

# Cron Jobs Security (Opcional pero recomendado)
CRON_SECRET=tu-secret-super-seguro-aqui
```

**Nota:** 
- En desarrollo sin `RESEND_API_KEY`, los emails se loguearán en la consola
- Resend ofrece 3,000 emails gratis al mes
- Para producción, se recomienda verificar un dominio y usar `RESEND_FROM_EMAIL`

## 📅 Configuración de Cron Jobs

### Opción 1: Vercel Cron Jobs (Recomendado)

Crea un archivo `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/email/weekly-digest",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/email/interview-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Y actualiza los endpoints para aceptar requests de Vercel:

```typescript
// En ambos endpoints, agregar verificación de Vercel Cron
const authHeader = request.headers.get('authorization');
const cronSecret = process.env.CRON_SECRET;
const vercelCronSecret = request.headers.get('x-vercel-cron-secret');

if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !vercelCronSecret) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Opción 2: GitHub Actions

Crea `.github/workflows/email-cron.yml`:

```yaml
name: Email Notifications Cron

on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly digest - Lunes 9 AM
    - cron: '0 8 * * *'   # Interview reminders - Diario 8 AM
  workflow_dispatch:  # Permite ejecución manual

jobs:
  weekly-digest:
    if: github.event.schedule == '0 9 * * 1'
    runs-on: ubuntu-latest
    steps:
      - name: Send Weekly Digest
        run: |
          curl -X POST https://tu-app.vercel.app/api/email/weekly-digest \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  interview-reminders:
    if: github.event.schedule == '0 8 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Send Interview Reminders
        run: |
          curl -X POST https://tu-app.vercel.app/api/email/interview-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Opción 3: Servicio Externo (cron-job.org)

1. Crea cuenta en [cron-job.org](https://cron-job.org)
2. Crea dos cron jobs:

   **Weekly Digest:**
   - URL: `https://tu-app.vercel.app/api/email/weekly-digest`
   - Method: POST
   - Headers: `Authorization: Bearer ${CRON_SECRET}`
   - Schedule: Cada lunes a las 9:00 AM

   **Interview Reminders:**
   - URL: `https://tu-app.vercel.app/api/email/interview-reminders`
   - Method: POST
   - Headers: `Authorization: Bearer ${CRON_SECRET}`
   - Schedule: Diario a las 8:00 AM

## 📧 Tipos de Emails

### 1. Email de Bienvenida
- **Cuándo:** Automáticamente al registrarse
- **Trigger:** En `/auth/callback` cuando se detecta un usuario nuevo
- **No requiere configuración adicional**

### 2. Notificaciones de Logros
- **Cuándo:** Automáticamente cuando:
  - Usuario sube de nivel
  - Usuario obtiene un badge nuevo
- **Trigger:** En `recordEvent()` de gamificación
- **No requiere configuración adicional**

### 3. Resumen Semanal
- **Cuándo:** Cada lunes a las 9 AM
- **Endpoint:** `/api/email/weekly-digest`
- **Requiere:** Cron job configurado

### 4. Recordatorios de Entrevistas
- **Cuándo:** Diario a las 8 AM (para entrevistas 24h después)
- **Endpoint:** `/api/email/interview-reminders`
- **Requiere:** Cron job configurado

## 🧪 Testing

### Testing Local

1. **Email de Bienvenida:**
   - Registra un nuevo usuario
   - Revisa la consola para ver el log del email

2. **Notificaciones de Logros:**
   - Completa acciones que den XP
   - Sube de nivel o obtén un badge
   - Revisa la consola para ver el log del email

3. **Weekly Digest:**
   ```bash
   curl -X POST http://localhost:3000/api/email/weekly-digest \
     -H "Authorization: Bearer tu-cron-secret"
   ```

4. **Interview Reminders:**
   ```bash
   curl -X POST http://localhost:3000/api/email/interview-reminders \
     -H "Authorization: Bearer tu-cron-secret"
   ```

### Testing en Producción

1. Configura `RESEND_API_KEY` en Vercel
2. (Opcional) Configura `RESEND_FROM_EMAIL` con un dominio verificado
3. Configura el cron job (o usa Vercel Cron con `vercel.json`)
4. Monitorea los logs de Vercel para ver los emails enviados
5. Revisa el dashboard de Resend para ver estadísticas de envío
6. Verifica que los emails lleguen correctamente

## 📊 Monitoreo

- Los emails se loguean en la consola en desarrollo
- En producción, revisa los logs de Vercel
- Considera agregar analytics para trackear:
  - Emails enviados
  - Emails abiertos
  - Clicks en links

## 🔒 Seguridad

- Los endpoints de cron están protegidos con `CRON_SECRET`
- Solo requests con el header `Authorization: Bearer ${CRON_SECRET}` son aceptados
- En Vercel, también se aceptan requests con `x-vercel-cron-secret`

## 📝 Próximos Pasos

- [ ] Implementar preferencias de usuario para desactivar notificaciones
- [ ] Agregar queue system para emails masivos
- [ ] Testing de templates en diferentes clientes de email
- [ ] Analytics de emails (opens, clicks)

