# Vayva Backend API

**Fastify-powered REST API backend for the Vayva commerce platform**

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Version](https://img.shields.io/badge/version-1.0-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue)]()

---

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for setup instructions.

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Start development server
pnpm dev
```

Server runs at `http://localhost:3001`

---

## 📋 What's Included

### ✅ 14 Backend Services
- Authentication (JWT)
- Inventory Management
- Smart Restock (AI predictions)
- POS Sync & Cash Management
- Rental Bookings
- Subscription Boxes
- Dunning (Payment Recovery)
- Fraud Detection
- Meal Kit Recipes
- Fashion Style Quizzes
- Education Courses
- And more...

### ✅ 40+ RESTful Endpoints
- Full CRUD operations
- Authentication required
- CORS configured
- Rate limiting ready

### ✅ Production Ready
- PM2 cluster mode
- Graceful shutdown
- Structured logging
- Error handling
- Health checks

---

## 🏗️ Architecture

```
Frontend (Vercel)
      ↓ HTTPS
Backend (Fastify on VPS)
      ↓
PostgreSQL Database
```

**Key Principles**:
- Clean separation of concerns
- Services contain all DB logic
- Routes handle HTTP only
- Frontend = pure business logic

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Get started in 5 minutes |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [MIGRATION_TRACKER.md](../../MIGRATION_TRACKER.md) | Migration progress |
| [FINAL_MIGRATION_REPORT.md](../../FINAL_MIGRATION_REPORT.md) | Implementation summary |

---

## 🔑 Environment Variables

Create a `.env` file:

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vayva"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"

# Logging
LOG_LEVEL=debug
```

---

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm typecheck    # Type check
pnpm lint         # Lint code
pnpm db:migrate   # Run database migrations
pnpm db:generate  # Generate Prisma client
```

### Project Structure

```
Backend/core-api/
├── src/
│   ├── server-fastify.ts       # Main server
│   ├── config/                 # Configuration
│   ├── services/               # Business logic
│   ├── routes/api/v1/          # API endpoints
│   ├── lib/                    # Utilities
│   └── plugins/                # Fastify plugins
├── ecosystem.config.js         # PM2 config
└── package.json
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Get JWT token

### Inventory (9 endpoints)
- Stock management, adjustments, transfers, cycle counts

### POS System (6 endpoints)
- Device registration, sync, cash management

### Rentals (6 endpoints)
- Product listings, bookings, returns

### Plus Industry Routes
- `/meal-kit/recipes`
- `/fashion/quizzes`
- `/education/courses`

**Full Reference**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔒 Authentication

All endpoints (except login) require JWT Bearer token:

```bash
curl http://localhost:3001/api/v1/inventory/stock/variant-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚢 Deployment

### Production Build

```bash
# Build
pnpm build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### VPS Deployment

Complete guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Steps:
1. Clone repository
2. Install dependencies
3. Configure environment
4. Build application
5. Setup PM2
6. Configure nginx (optional)
7. Setup SSL (recommended)

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@store.com","password":"password"}' \
  | jq -r '.data.token')

# Test endpoint
curl http://localhost:3001/api/v1/inventory/stock/test \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Tests (Coming Soon)
- Unit tests for services
- Integration tests for routes
- E2E tests for critical flows

---

## 📊 Monitoring

### Logs

```bash
# Application logs
pm2 logs vayva-backend

# System logs
journalctl -u pm2-root

# Nginx logs (if configured)
tail -f /var/log/nginx/access.log
```

### Health Check

```bash
curl http://localhost:3001/health
```

---

## 🔐 Security

- JWT authentication
- CORS configuration
- Rate limiting ready
- Input validation with Zod
- SQL injection prevention (Prisma ORM)

---

## 🤝 Contributing

### Adding New Services

1. Create service in `src/services/[domain]/`
2. Create routes in `src/routes/api/v1/[domain]/`
3. Register routes in `api.v1.routes.ts`
4. Update documentation
5. Test thoroughly

### Code Style

- TypeScript strict mode
- ESLint rules enforced
- Prettier formatting
- Conventional commits

---

## 📈 Performance

- Cluster mode (PM2) - scales to all CPU cores
- Connection pooling via Prisma
- Response caching ready
- Async/await throughout

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
lsof -ti:3001 | xargs kill
```

**Database connection error**:
- Verify DATABASE_URL
- Check PostgreSQL is running

**CORS errors**:
- Update ALLOWED_ORIGINS in .env
- Restart server

See [QUICKSTART.md](./QUICKSTART.md) for more help.

---

## 📄 License

Private - Vayva Platform

---

## 🙏 Credits

Built with:
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Pino](https://getpino.io/) - Logger
- [PM2](https://pm2.keymetrics.io/) - Process manager

---

## 📞 Support

- **Documentation**: See docs folder
- **Issues**: Check migration tracker
- **Team**: Contact development team

---

**Last Updated**: 2026-03-27  
**Version**: 1.0  
**Status**: ✅ Production Ready
