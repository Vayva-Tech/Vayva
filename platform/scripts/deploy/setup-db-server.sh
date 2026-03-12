#!/bin/bash
# Database Server Initialization Script (VPS 2)
# Usage: ./setup-db-server.sh <APP_SERVER_IP> <REDIS_PASSWORD>

APP_IP=$1
REDIS_PASS=$2

if [ -z "$APP_IP" ]; then
    echo "Usage: ./setup-db-server.sh <APP_SERVER_IP> [REDIS_PASSWORD]"
    exit 1
fi

if [ -z "$REDIS_PASS" ]; then
    REDIS_PASS=$(openssl rand -hex 32)
    echo "Generated Redis password (not displayed)."
    echo "Store it securely in your secret manager before continuing."
fi

echo "=== [1/5] Installing dependencies ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y postgresql-16 postgresql-contrib redis-server ufw

echo "=== [2/5] Configuring Firewall ==="
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow from "$APP_IP" to any port 5432
sudo ufw allow from "$APP_IP" to any port 6379
sudo ufw --force enable

echo "=== [3/5] Configuring PostgreSQL ==="
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
PG_HBA="/etc/postgresql/16/main/pg_hba.conf"

sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
echo "host    all             all             $APP_IP/32            md5" | sudo tee -a "$PG_HBA"

sudo systemctl restart postgresql

echo "=== [4/5] Configuring Redis ==="
REDIS_CONF="/etc/redis/redis.conf"

# Keep Redis private to localhost + app server only (avoid 0.0.0.0 exposure)
if grep -qE '^bind\s+' "$REDIS_CONF"; then
  sudo sed -i "s/^bind .*/bind 127.0.0.1 ::1 $APP_IP/" "$REDIS_CONF"
else
  echo "bind 127.0.0.1 ::1 $APP_IP" | sudo tee -a "$REDIS_CONF" >/dev/null
fi
sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASS/" "$REDIS_CONF"
sudo systemctl restart redis

echo "=== [5/5] Creating databases ==="
sudo -u postgres psql -c "CREATE USER vayva WITH PASSWORD 'CHANGE_ME_TO_STRONG_PASSWORD';" 2>/dev/null || echo "User 'vayva' already exists"
sudo -u postgres psql -c "CREATE DATABASE vayva OWNER vayva;" 2>/dev/null || echo "Database 'vayva' already exists"
sudo -u postgres psql -c "CREATE DATABASE evolution OWNER vayva;" 2>/dev/null || echo "Database 'evolution' already exists"

echo ""
echo "============================================"
echo "DATABASE SERVER INITIALIZED"
echo "============================================"
echo ""
echo "Redis password configured (value intentionally not printed)."
echo ""
echo "Next steps:"
echo "  1) Change the PostgreSQL user password:"
echo "     sudo -u postgres psql -c \"ALTER USER vayva WITH PASSWORD '<STRONG_PASSWORD>';\""
echo "  2) Test connection from app server:"
echo "     psql postgresql://vayva:<PASSWORD>@$(hostname -I | awk '{print $1}'):5432/vayva"
echo "  3) Set up daily backups:"
echo "     crontab -e"
echo "     0 3 * * * pg_dump -U vayva vayva | gzip > /var/backups/postgresql/vayva_\$(date +\\%Y\\%m\\%d).sql.gz"
echo ""
