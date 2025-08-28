#!/bin/bash

echo "🧹 Czyszczenie istniejących kontenerów..."

# Zatrzymaj i usuń istniejące kontenery
docker stop my-postgres n8n-automation-app n8n-automation-db 2>/dev/null || true
docker rm my-postgres n8n-automation-app n8n-automation-db 2>/dev/null || true

# Usuń sieci (jeśli nie są używane)
docker network rm n8n-network 2>/dev/null || true

echo "🚀 Uruchamianie nowego stosu..."

# Uruchom nowy stos z docker-compose
docker-compose down
docker-compose up --build -d

echo "✅ Sprawdzanie statusu..."
docker-compose ps
docker-compose logs app