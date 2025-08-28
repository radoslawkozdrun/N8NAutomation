#!/bin/bash

echo "🔧 Naprawiam sieć Docker..."

# Sprawdź obecne kontenery
echo "📋 Obecne kontenery:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Podłącz my-postgres do sieci root_default
echo "🔗 Podłączam my-postgres do sieci root_default..."
docker network connect root_default my-postgres

# Sprawdź nową konfigurację
echo "✅ Nowa konfiguracja sieci:"
docker network inspect root_default --format='{{range $k,$v := .Containers}}{{$v.Name}} - {{$v.IPv4Address}}{{"\n"}}{{end}}'

echo "🎉 Gotowe! Teraz oba kontenery są w tej samej sieci."