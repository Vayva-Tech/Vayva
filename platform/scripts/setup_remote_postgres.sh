#!/bin/bash

# Configuration
REMOTE_IP="163.245.209.203"
POSTGRES_VER=$(ls /etc/postgresql/ | head -n 1) # Detects 14, 15, 16 etc.

if [ -z "$POSTGRES_VER" ]; then
    echo "❌ Error: Could not detect PostgreSQL version in /etc/postgresql/"
    exit 1
fi

PG_CONF="/etc/postgresql/$POSTGRES_VER/main/postgresql.conf"
PG_HBA="/etc/postgresql/$POSTGRES_VER/main/pg_hba.conf"

echo "Using PostgreSQL version: $POSTGRES_VER"

# 1. Update listen_addresses in postgresql.conf
echo "Updating listen_addresses in $PG_CONF..."
sudo sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
# Also match if it's already set to something else but commented or uncommented
sudo sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# 2. Add entry to pg_hba.conf
echo "Adding remote access entry for $REMOTE_IP to $PG_HBA..."
HBA_ENTRY="host    all             all             $REMOTE_IP/32            md5"

if ! grep -q "$REMOTE_IP" "$PG_HBA"; then
    echo "$HBA_ENTRY" | sudo tee -a "$PG_HBA" > /dev/null
    echo "✅ Added access for $REMOTE_IP"
else
    echo "ℹ️  Entry for $REMOTE_IP already exists in pg_hba.conf"
fi

# 3. Restart PostgreSQL
echo "Restarting PostgreSQL..."
sudo systemctl restart postgresql

echo "✨ PostgreSQL configuration for remote access is complete!"
echo "Summary of changes:"
echo "- listen_addresses = '*'"
echo "- Allowed: $REMOTE_IP"
echo "- Service restarted"
