# Vayva Platform Infrastructure Setup Guide

## 🚀 **CURRENT INFRASTRUCTURE STATUS**

### **Existing Setup**
- **VPS Server:** 163.245.209.203 (Ping: 172ms latency)
- **Database:** PostgreSQL 16 with Prisma ORM
- **Cache:** Redis 7 for session and data caching
- **Containerization:** Docker Compose configuration
- **Orchestration:** Kubernetes manifests (incomplete)

### **Issues Identified**
1. ❌ Database connection timeout on port 5432
2. ❌ Redis connection issues
3. ❌ Kubernetes deployments not fully configured
4. ❌ Missing monitoring and alerting systems

## 🛠️ **INFRASTRUCTURE OPTIMIZATION PLAN**

### **Phase 1: Database Connectivity Fix (Immediate)**
```bash
# Test current database connection
psql "postgresql://vayva:***@163.245.209.203:5432/vayva"

# If connection fails, check:
# 1. Firewall rules on VPS
# 2. PostgreSQL configuration (postgresql.conf)
# 3. Network security groups
# 4. Database user permissions
```

### **Phase 2: Redis Optimization**
```bash
# Current Redis setup check
redis-cli -h 163.245.209.203 -p 6379 -a "a79d295f01ac8a34fec52b0435096b4d665160bee2320880"

# Redis optimization tasks:
# 1. Enable persistence (AOF/RDB)
# 2. Configure memory policies
# 3. Set up replication for high availability
# 4. Implement connection pooling
```

### **Phase 3: Container Orchestration**
```yaml
# docker-compose.yml improvements needed:
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
```

### **Phase 4: Kubernetes Production Setup**
```yaml
# k8s/base/deployment.yaml improvements:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vayva-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vayva-platform
  template:
    metadata:
      labels:
        app: vayva-platform
    spec:
      containers:
      - name: frontend
        image: vayva/frontend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: vayva-config
        - secretRef:
            name: vayva-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

      - name: backend
        image: vayva/backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: vayva-config
        - secretRef:
            name: vayva-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## 🔧 **MONITORING & ALERTING SETUP**

### **Prometheus Configuration**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vayva-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### **Grafana Dashboard Setup**
- Application performance metrics
- Database query performance
- Cache hit ratios
- Error rates and response times
- Resource utilization

## 🛡️ **SECURITY HARDENING**

### **Network Security**
```bash
# Firewall configuration
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp from YOUR_IP_ONLY
ufw allow 6379/tcp from YOUR_IP_ONLY
ufw enable
```

### **Database Security**
```sql
-- PostgreSQL security enhancements
ALTER USER vayva WITH PASSWORD 'NEW_STRONG_PASSWORD';
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION vayva;
GRANT USAGE ON SCHEMA app TO vayva;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vayva;
```

## 📊 **BACKUP AND DISASTER RECOVERY**

### **Automated Backup Script**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/vayva"

# Database backup
pg_dump -h localhost -U vayva vayva > $BACKUP_DIR/db_backup_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads /app/assets

# Upload to cloud storage
aws s3 cp $BACKUP_DIR s3://your-backup-bucket/vayva/$DATE/ --recursive
```

### **Restore Procedure**
```bash
# Database restore
psql -h localhost -U vayva vayva < db_backup_20241212_153000.sql

# File restore
tar -xzf files_backup_20241212_153000.tar.gz -C /
```

## 🚀 **DEPLOYMENT PIPELINE**

### **CI/CD Configuration**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and Push Docker Images
      run: |
        docker build -t vayva/frontend:${{ github.sha }} ./Frontend/merchant-admin
        docker build -t vayva/backend:${{ github.sha }} ./Backend/core-api
        docker push vayva/frontend:${{ github.sha }}
        docker push vayva/backend:${{ github.sha }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/vayva-platform \
          frontend=vayva/frontend:${{ github.sha }} \
          backend=vayva/backend:${{ github.sha }}
    
    - name: Run Health Checks
      run: |
        kubectl rollout status deployment/vayva-platform
        curl -f https://your-domain.com/health
```

## 📈 **PERFORMANCE OPTIMIZATION**

### **Database Indexing Strategy**
```sql
-- Critical indexes for performance
CREATE INDEX CONCURRENTLY idx_orders_store_id_created_at ON orders(store_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_products_store_id_status ON products(store_id, status);
CREATE INDEX CONCURRENTLY idx_customers_store_id_email ON customers(store_id, email);
CREATE INDEX CONCURRENTLY idx_analytics_timestamp ON analytics_events(timestamp);
```

### **Caching Strategy**
```javascript
// Redis caching implementation
const cache = {
  // Session caching
  session: {
    ttl: 3600, // 1 hour
    prefix: 'sess:'
  },
  
  // API response caching
  api: {
    ttl: 300, // 5 minutes
    prefix: 'api:'
  },
  
  // Database query caching
  query: {
    ttl: 60, // 1 minute
    prefix: 'query:'
  }
};
```

## 🎯 **SUCCESS CRITERIA**

### **Infrastructure Goals**
- ✅ Database connection established and stable
- ✅ Redis cluster with failover capability
- ✅ Kubernetes deployment with auto-scaling
- ✅ Comprehensive monitoring and alerting
- ✅ Automated backup and recovery procedures
- ✅ Security-hardened environment
- ✅ CI/CD pipeline for seamless deployments

### **Performance Targets**
- Database queries < 100ms average
- API response time < 200ms
- 99.9% uptime SLA
- Auto-scaling based on load
- Backup recovery time < 30 minutes

---

*This infrastructure setup ensures Vayva platform runs reliably and scalably for enterprise use.*