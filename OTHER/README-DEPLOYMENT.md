# 🚀 Deployment Guide - N8N Automation

## Quick Start na VPS

### 1. Wymagania

- VPS z Ubuntu/CentOS/Debian
- Docker i Docker Compose zainstalowane
- Minimum 2GB RAM, 1 vCPU
- Port 80, 443, 8002 otwarte

### 2. Instalacja Docker (jeśli nie masz)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Wdrożenie aplikacji

```bash
# Sklonuj repozytorium
git clone <twoje-repo-url>
cd N8NAutomation

# Nadaj uprawnienia skryptowi
chmod +x deploy.sh

# Uruchom deployment
./deploy.sh
```

### 4. Konfiguracja

1. **Edytuj plik `.env`** (zostanie utworzony automatycznie):
```bash
nano .env
```

Ważne ustawienia do zmiany:
```env
DB_PASSWORD=twoje-bezpieczne-haslo-bazy-danych
JWT_SECRET=twoj-super-sekretny-klucz-minimum-32-znaki
CORS_ORIGIN=https://twoja-domena.com
```

2. **Uruchom ponownie po zmianach**:
```bash
docker-compose restart
```

### 5. Konta administratora

Po pierwszym uruchomieniu zostanie utworzone konto admin:
- **Username**: admin
- **Password**: admin123 (zmień po pierwszym logowaniu!)

### 6. Dostęp do aplikacji

- **Aplikacja**: `http://twoja-domena.com:8002`
- **Health check**: `http://twoja-domena.com:8002/api/health`

## Zarządzanie

### Przydatne komendy Docker

```bash
# Sprawdzenie statusu
docker-compose ps

# Logi aplikacji
docker-compose logs -f

# Restart aplikacji
docker-compose restart

# Zatrzymanie
docker-compose down

# Rebuild i restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup bazy danych

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres rss_review > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres rss_review < backup.sql
```

### Monitoring

```bash
# Sprawdzenie użycia zasobów
docker stats

# Sprawdzenie logów nginx (jeśli używasz)
docker-compose logs nginx

# Sprawdzenie zdrowia kontenerów
docker-compose ps
```

## SSL/HTTPS (Opcjonalne)

### Z Let's Encrypt

```bash
# Zainstaluj certbot
sudo apt install certbot

# Uzyskaj certyfikat
sudo certbot certonly --standalone -d twoja-domena.com

# Skopiuj certyfikaty
sudo cp /etc/letsencrypt/live/twoja-domena.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/twoja-domena.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*.pem

# Uruchom z nginx
docker-compose --profile with-nginx up -d
```

### Aktualizacja certyfikatów (crontab)

```bash
# Dodaj do crontaba
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

## Troubleshooting

### Aplikacja nie startuje

```bash
# Sprawdź logi
docker-compose logs app

# Sprawdź bazę danych
docker-compose logs postgres

# Sprawdź konfigurację sieci
docker network ls
```

### Problemy z bazą danych

```bash
# Restart bazy danych
docker-compose restart postgres

# Dostęp do konsoli PostgreSQL
docker-compose exec postgres psql -U postgres -d rss_review
```

### Porty zajęte

```bash
# Sprawdź jakie porty są używane
sudo netstat -tlnp | grep :8002

# Zmień port w docker-compose.yml
# ports:
#   - "8003:8002"  # Zmień z 8002 na 8003
```

## Bezpieczeństwo

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 8002  # App (jeśli bez nginx)
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8002 -j ACCEPT
```

### Regularne aktualizacje

```bash
# Aktualizuj obrazy Docker
docker-compose pull
docker-compose up -d

# Aktualizuj system
sudo apt update && sudo apt upgrade
```

## Skalowanie

### Dla większego ruchu

```yaml
# W docker-compose.yml dodaj więcej replík
app:
  scale: 3  # 3 instancje aplikacji
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
```

### Load balancer

```bash
# Użyj nginx do load balancingu
upstream backend {
    server app_1:8002;
    server app_2:8002;
    server app_3:8002;
}
```

## Support

- Sprawdź logi: `docker-compose logs -f`
- Health check: `curl http://localhost:8002/api/health`
- Restart: `docker-compose restart`

Powodzenia! 🎉