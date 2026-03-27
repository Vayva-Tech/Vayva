# 🚀 Quick Start Guide - Vayva Backend

## Development Setup (5 minutes)

### 1. Install Dependencies
```bash
cd Backend/core-api
pnpm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/vayva"
JWT_SECRET="dev-secret-key-min-32-characters-long"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
LOG_LEVEL=debug
```

### 3. Start Development Server
```bash
pnpm dev
```

Server starts at: `http://localhost:3001`

---

## Testing the API

### 1. Login to Get Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@store.com","password":"password"}'
```

Save the token from response.

### 2. Test Protected Endpoint
```bash
curl http://localhost:3001/api/v1/inventory/stock/test-variant \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Production Deployment (Quick)

### 1. Build
```bash
pnpm build
```

### 2. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 3. View Logs
```bash
pm2 logs vayva-backend
```

---

## Available Endpoints

### Authentication
- `POST /api/v1/auth/login` - Get JWT token

### Inventory (9 endpoints)
- `GET /api/v1/inventory/stock/:variantId`
- `POST /api/v1/inventory/adjust`
- `POST /api/v1/inventory/deplete`
- `POST /api/v1/inventory/receive`
- `POST /api/v1/inventory/transfer`
- `POST /api/v1/inventory/cycle-count`
- `GET /api/v1/inventory/low-stock`
- `GET /api/v1/inventory/movements/:variantId`

### POS System (6 endpoints)
- `GET /api/v1/pos/devices`
- `POST /api/v1/pos/devices/register`
- `POST /api/v1/pos/devices/:deviceId/sync`
- `PUT /api/v1/pos/devices/:deviceId/settings`
- `GET /api/v1/pos/devices/:deviceId/history`
- `DELETE /api/v1/pos/devices/:deviceId`

### Rentals (6 endpoints)
- `GET /api/v1/rentals/products`
- `POST /api/v1/rentals/products`
- `POST /api/v1/rentals/bookings`
- `POST /api/v1/rentals/bookings/:id/return`
- `GET /api/v1/rentals/customers/:id/active`
- `POST /api/v1/rentals/bookings/:id/extend`

### Plus: Meal Kit, Fashion, Education routes

**Full Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm typecheck        # Type check

# Production
pm2 start ecosystem.config.js
pm2 restart vayva-backend
pm2 logs vayva-backend

# Database
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate Prisma client
```

---

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:3001 | xargs kill
```

### Database Connection Error
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running: `systemctl status postgresql`

### CORS Errors
- Update ALLOWED_ORIGINS in .env
- Restart server after changes

---

## Next Steps

1. ✅ **Development**: Follow steps above
2. 📖 **Full Setup**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. 🔌 **API Reference**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. 📊 **Progress**: See [MIGRATION_TRACKER.md](./MIGRATION_TRACKER.md)

---

**Need Help?** Check the comprehensive guides:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Full VPS setup
- [API Documentation](./API_DOCUMENTATION.md) - Complete endpoint reference
- [Final Report](./FINAL_MIGRATION_REPORT.md) - Migration summary

**Status**: ✅ Production Ready  
**Last Updated**: 2026-03-27
