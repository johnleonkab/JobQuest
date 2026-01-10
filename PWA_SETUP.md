# PWA Setup - JobQuest

## Estado de Implementación

La PWA básica ha sido implementada con las siguientes características:

### ✅ Completado:

1. **Manifest.json** ✅
   - Configurado en `public/manifest.json`
   - Incluye nombre, descripción, colores, iconos
   - Display mode: standalone

2. **Service Worker** ✅
   - Implementado en `public/sw.js`
   - Cache básico (Network First)
   - Registrado automáticamente vía `PWAServiceWorker` component

3. **Meta Tags iOS** ✅
   - Agregados en `src/app/layout.tsx`
   - apple-mobile-web-app-capable
   - apple-touch-icon
   - theme-color

4. **Prompt de Instalación** ✅
   - Componente `PWAInstallPrompt.tsx`
   - Android: Usa `beforeinstallprompt` event
   - iOS: Muestra instrucciones visuales
   - No intrusivo, con opción de cerrar
   - Guarda preferencia del usuario

5. **Integración Next.js** ✅
   - Service worker registrado automáticamente
   - Funciona en producción (Vercel)

### 📝 Pendiente:

**Iconos PWA**: Los iconos necesitan ser generados

Los iconos requeridos son:
- `/public/icons/icon-72x72.png`
- `/public/icons/icon-96x96.png`
- `/public/icons/icon-128x128.png`
- `/public/icons/icon-144x144.png`
- `/public/icons/icon-152x152.png`
- `/public/icons/icon-180x180.png` (iOS - crítico)
- `/public/icons/icon-192x192.png` (Android - crítico)
- `/public/icons/icon-384x384.png`
- `/public/icons/icon-512x512.png` (Android splash - crítico)

### Cómo Generar los Iconos:

1. **Opción 1: PWA Asset Generator (Recomendado)**
   ```bash
   npx @vite-pwa/assets-generator public/icon-source.png
   ```
   Necesitas un icono fuente (512x512px mínimo) con el logo de JobQuest.

2. **Opción 2: Manual**
   - Crear un icono 512x512px con el diamond logo de JobQuest
   - Usar herramienta online como https://realfavicongenerator.net/
   - O usar ImageMagick/Photoshop para generar todos los tamaños

3. **Especificaciones del Icono:**
   - Fondo: Color primario (#ec4899) o transparente
   - Logo: Diamond icon centrado
   - Formato: PNG
   - Sin bordes redondeados (el sistema los aplica)

### Testing:

1. **Android (Chrome/Edge):**
   - Abrir la app en Chrome/Edge Android
   - El prompt debería aparecer después de interactuar
   - Tocar "Instalar" debería instalar la PWA

2. **iOS (Safari):**
   - Abrir la app en Safari iOS
   - El prompt con instrucciones debería aparecer
   - Seguir las instrucciones para agregar a pantalla de inicio

3. **Verificar Service Worker:**
   - Chrome DevTools > Application > Service Workers
   - Debería estar registrado y activo

4. **Verificar Manifest:**
   - Chrome DevTools > Application > Manifest
   - Debería mostrar toda la información correctamente

### Notas:

- El service worker está deshabilitado en desarrollo
- Solo funciona en producción o con `npm run build && npm start`
- Los iconos son críticos para que la PWA funcione correctamente
- El prompt solo aparece en mobile (< 1024px)


