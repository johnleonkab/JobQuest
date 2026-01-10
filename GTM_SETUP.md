# 🔍 Configuración de Google Tag Manager

Esta guía explica cómo configurar Google Tag Manager (GTM) en JobQuest.

## ✅ Implementación

El sistema está configurado para usar Google Tag Manager. Solo necesitas agregar tu Container ID.

## 🔧 Configuración Rápida

### 1. Obtener tu Container ID

Si ya tienes un Container ID (ej: `GTM-MXDJ2NQV`), salta al paso 2.

Si no tienes uno:
1. Ve a [Google Tag Manager](https://tagmanager.google.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo contenedor:
   - Nombre: `JobQuest` (o el que prefieras)
   - Tipo: Web
   - URL: Tu dominio (ej: `job-quest-bice.vercel.app`)
4. Copia el Container ID (formato: `GTM-XXXXXXX`)

### 2. Configurar Variable de Entorno

Agrega a tu `.env.local`:

```bash
NEXT_PUBLIC_GTM_ID=GTM-MXDJ2NQV
```

Y en Vercel (Environment Variables):
- Key: `NEXT_PUBLIC_GTM_ID`
- Value: `GTM-MXDJ2NQV`

### 3. Verificar que Funciona

1. Inicia la app en desarrollo: `npm run dev`
2. Abre las DevTools del navegador
3. Ve a la pestaña "Network"
4. Busca requests a `googletagmanager.com`
5. O revisa la consola - deberías ver `[Analytics]` logs cuando navegas

## 📊 Eventos Trackeados

El sistema trackea automáticamente estos eventos:

### Eventos de Usuario
- `sign_up` - Registro de nuevo usuario
- `sign_in` - Inicio de sesión
- `sign_out` - Cierre de sesión

### Eventos de CV
- `cv_section_added` - Sección de CV agregada
- `cv_section_updated` - Sección de CV actualizada
- `cv_analyzed` - Análisis de CV con AI
- `cv_improved` - Mejora de sección con AI
- `cv_exported` - Exportación de CV

### Eventos de Ofertas de Trabajo
- `job_offer_created` - Oferta creada
- `job_offer_updated` - Oferta actualizada (con status)
- `job_offer_deleted` - Oferta eliminada
- `job_offer_viewed` - Oferta vista

### Eventos de Entrevistas y Contactos
- `interview_scheduled` - Entrevista programada
- `interview_updated` - Entrevista actualizada
- `contact_added` - Contacto agregado
- `contact_updated` - Contacto actualizado

### Eventos de Gamificación
- `level_up` - Usuario subió de nivel (con level number)
- `badge_earned` - Badge obtenido (con badge_id)
- `xp_earned` - XP ganado (con xp y event_id)

### Eventos de AI
- `ai_insights_generated` - Análisis de AI generado
- `ai_chat_message` - Mensaje en chat de AI
- `ai_section_improved` - Sección mejorada con AI

### Eventos de Errores
- `error` - Error capturado (con error_type y error_message)

### Page Views
- `page_view` - Automáticamente en cada cambio de ruta

## 🎯 Configurar Tags en GTM

Una vez configurado, puedes crear tags en GTM para:

1. **Google Analytics 4:**
   - Crea un tag de tipo "Google Analytics: GA4 Configuration"
   - Agrega tu Measurement ID de GA4
   - Configura triggers para los eventos que quieras trackear

2. **Facebook Pixel:**
   - Crea un tag de tipo "Custom HTML"
   - Agrega el código del pixel
   - Configura triggers

3. **Conversiones:**
   - Crea tags para eventos específicos como `sign_up`, `cv_exported`, etc.

## 📝 Ejemplo de Uso en Código

```typescript
import { analytics } from '@/lib/analytics';

// Trackear evento personalizado
analytics.signUp();
analytics.cvSectionAdded('experience');
analytics.levelUp(5);
analytics.jobOfferCreated();
```

## 🔍 Debugging

### En Desarrollo
- Los eventos se loguean en la consola con `[Analytics]`
- Revisa la consola del navegador para ver qué eventos se están enviando

### En Producción
- Usa GTM Preview Mode para ver eventos en tiempo real
- Revisa Google Analytics Real-Time para ver eventos llegando
- Usa la extensión "Google Tag Assistant" del navegador

## ✅ Verificación

Para verificar que GTM está funcionando:

1. **GTM Preview Mode:**
   - En GTM, haz clic en "Preview"
   - Ingresa tu URL
   - Deberías ver eventos apareciendo en tiempo real

2. **Google Analytics Real-Time:**
   - Si configuraste GA4 en GTM
   - Ve a GA4 → Reports → Real-time
   - Deberías ver actividad cuando navegas por la app

3. **Console del Navegador:**
   - Abre DevTools
   - Escribe: `window.dataLayer`
   - Deberías ver un array con eventos trackeados

## 🎨 Ventajas de GTM

- ✅ Gestiona múltiples herramientas desde un solo lugar
- ✅ No requiere cambios en código para agregar nuevos tags
- ✅ Preview mode para testing
- ✅ Versionado y rollback de cambios
- ✅ Permisos granulares por usuario
- ✅ Variables y triggers reutilizables


