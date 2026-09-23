#!/bin/bash
# ⚔️ Estudio Kids — Deploy rápido a Railway
# Uso: ./deploy.sh "descripción del cambio"
# Ejemplo: ./deploy.sh "nuevo ejercicio de matemática"

set -e  # Detener si hay algún error

MSG=${1:-"actualización de la app"}

echo ""
echo "⚔️  ESTUDIO KIDS — DEPLOY"
echo "─────────────────────────────────"

# Verificar que hay cambios para subir
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No hay cambios nuevos para subir."
  echo "   La app en Railway ya está actualizada."
  exit 0
fi

echo "📦 Archivos modificados:"
git diff --name-only
git diff --cached --name-only
echo ""

echo "✅ Guardando cambios: \"$MSG\""
git add .
git commit -m "$MSG"

echo "🚀 Subiendo a GitHub..."
git push

echo ""
echo "─────────────────────────────────"
echo "✅ ¡Listo! Railway está deployando."
echo "🌐 Tu app estará actualizada en ~2 minutos."
echo "─────────────────────────────────"
echo ""
