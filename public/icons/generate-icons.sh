#!/bin/bash
# Script para generar iconos PWA desde un icono fuente
# Uso: ./generate-icons.sh icon-source.png

SOURCE=$1

if [ -z "$SOURCE" ]; then
  echo "Uso: ./generate-icons.sh <icon-source.png>"
  echo "El icono fuente debe ser al menos 512x512px"
  exit 1
fi

if [ ! -f "$SOURCE" ]; then
  echo "Error: Archivo $SOURCE no encontrado"
  exit 1
fi

# Requiere ImageMagick (install: brew install imagemagick)
if ! command -v convert &> /dev/null; then
  echo "Error: ImageMagick no está instalado"
  echo "Instala con: brew install imagemagick"
  exit 1
fi

echo "Generando iconos PWA desde $SOURCE..."

sizes=(72 96 128 144 152 180 192 384 512)

for size in "${sizes[@]}"; do
  convert "$SOURCE" -resize ${size}x${size} "icon-${size}x${size}.png"
  echo "✓ Generado icon-${size}x${size}.png"
done

echo "¡Iconos generados exitosamente!"
