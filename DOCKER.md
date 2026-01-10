# Guía de Docker para JobQuest

Esta guía explica cómo usar Docker para desarrollo y producción en JobQuest.

## 🐳 Desarrollo Local con Docker

### Opción 1: Docker Compose (Recomendado)

1. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales de Supabase
   ```

2. **Iniciar el contenedor de desarrollo**
   ```bash
   docker-compose up dev
   ```
   
   Esto iniciará el servidor de desarrollo en `http://localhost:3000` con hot-reload habilitado.

3. **Ver logs**
   ```bash
   docker-compose logs -f dev
   ```

4. **Detener el contenedor**
   ```bash
   docker-compose down
   ```

### Opción 2: Dockerfile.dev directamente

```bash
docker build -f Dockerfile.dev -t jobquest-dev .
docker run -p 3000:3000 --env-file .env.local -v $(pwd):/app jobquest-dev
```

## 🚀 Producción con Docker

### Construir la imagen

```bash
docker build -t jobquest:latest .
```

### Ejecutar el contenedor

```bash
docker run -p 3000:3000 --env-file .env.local jobquest:latest
```

### Con Docker Compose

```bash
docker-compose up app
```

## 📝 Notas Importantes

- El Dockerfile de producción usa multi-stage build para optimizar el tamaño de la imagen
- El modo `standalone` de Next.js está habilitado para reducir el tamaño de la imagen
- Las variables de entorno se cargan desde `.env.local`
- El contenedor de desarrollo monta el código como volumen para hot-reload

## 🔧 Troubleshooting

### El contenedor no inicia

1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que el puerto 3000 no esté en uso
3. Revisa los logs: `docker-compose logs dev`

### Cambios no se reflejan en desarrollo

1. Verifica que el volumen esté montado correctamente
2. Reinicia el contenedor: `docker-compose restart dev`

### Error de permisos

Si tienes problemas de permisos, puedes ejecutar:
```bash
sudo docker-compose up dev
```


