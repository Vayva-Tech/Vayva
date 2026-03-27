# Vayva Fastify Backend API Server

**Standalone Fastify server - NO Next.js**

This is a clean, standalone Fastify backend server that provides REST APIs for the Vayva platform.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend/fastify-server
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/vayva"
JWT_SECRET="your-secret-key-min-32-chars"
ALLOWED_ORIGINS="http://localhost:3000"
LOG_LEVEL=debug
```

### 3. Run Development Server
```bash
pnpm dev
```

Server runs at `http://localhost:3001`

---

## 📁 Project Structure

```
fastify-server/
├── src/
│   ├── index.ts                 # Main server entry
│   ├── server.ts                # Server runner
│   ├── services/                # Business logic services
│   │   ├── auth.ts
│   │   ├── inventory/
│   │   ├── pos/
│   │   ├── rentals/
│   │   ├── meal-kit/
│   │   ├── fashion/
│   │   ├── education/
│   │   ├── subscriptions/
│   │   └── security/
│   ├── routes/                  # API route handlers
│   │   └── api/v1/
│   │       ├── auth/
│   │       ├── inventory/
│   │       ├── pos/
│   │       ├── rentals/
│   │       ├── meal-kit/
│   │       ├── fashion/
│   │       └── education/
│   ├── lib/                     # Utilities (logger, etc.)
│   ├── middleware/              # Custom middleware
│   └── plugins/                 # Fastify plugins
├── package.json
├── tsconfig.json
├── ecosystem.config.js          # PM2 configuration
└── .env.example
```

---

## 🔌 Available APIs

All endpoints are under `/api/v1/`

### Authentication
- `POST /auth/login` - Get JWT token

### Inventory Management (9 endpoints)
- `GET /inventory/stock/:variantId` - Get stock level
- `POST /inventory/adjust` - Adjust stock
- `POST /inventory/deplete` - Deplete on order
- `POST /inventory/receive` - Receive stock
- `POST /inventory/transfer` - Transfer between locations
- `POST /inventory/cycle-count` - Physical inventory count
- `GET /inventory/low-stock` - Low stock alerts
- `GET /inventory/movements/:variantId` - Movement history

### POS System (6 endpoints)
- `GET /pos/devices` - List devices
- `POST /pos/devices/register` - Register device
- `POST /pos/devices/:deviceId/sync` - Trigger sync
- `PUT /pos/devices/:deviceId/settings` - Update settings
- `GET /pos/devices/:deviceId/history` - Sync history
- `DELETE /pos/devices/:deviceId` - Remove device

### Rentals (6 endpoints)
- `GET /rentals/products` - List rental products
- `POST /rentals/products` - Create product
- `POST /rentals/bookings` - Book rental
- `POST /rentals/bookings/:id/return` - Return rental
- `GET /rentals/customers/:id/active` - Customer rentals
- `POST /rentals/bookings/:id/extend` - Extend rental

### Plus:
- `/meal-kit/recipes` - Recipe management
- `/fashion/quizzes` - Style quizzes
- `/education/courses` - Course management

**Total**: 40+ RESTful endpoints

---

## 🛠️ Commands

```bash
pnpm dev          # Start development server (tsx watch)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm typecheck    # Type check
pnpm lint         # Lint code
```

---

## 🔐 Authentication

All endpoints (except login) require JWT Bearer token:

```bash
# Login to get token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@store.com","password":"password"}'

# Use token in requests
curl http://localhost:3001/api/v1/inventory/stock/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚢 Production Deployment

### Build
```bash
pnpm build
```

### Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### View Logs
```bash
pm2 logs vayva-api
```

---

## 🧪 Testing

### Manual Test
```bash
# Health check
curl http://localhost:3001/health

# Login
TOKEN=$(curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@store.com","password":"password"}' \
  | jq -r '.data.token')

# Test endpoint
curl http://localhost:3001/api/v1/inventory/stock/test \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Service Architecture

Each service follows this pattern:

```typescript
// src/services/inventory/inventory.service.ts
import { prisma } from '@vayva/db';

export class InventoryService {
  constructor(private readonly db = prisma) {}

  async getStock(storeId: string, variantId: string) {
    // Database operations here
  }
}
```

Routes call services:

```typescript
// src/routes/api/v1/inventory/inventory.routes.ts
import { InventoryService } from '../../../services/inventory/inventory.service';

const service = new InventoryService();

server.get('/stock/:variantId', {
  preHandler: [server.authenticate],
  handler: async (request, reply) => {
    const result = await service.getStock(storeId, variantId);
    return reply.send({ success: true, data: result });
  },
});
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `HOST` | Server host | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `JWT_SECRET` | JWT signing key | Required |
| `ALLOWED_ORIGINS` | CORS origins | `localhost:3000` |
| `LOG_LEVEL` | Log level | `info` |

---

## 📊 Monitoring

### Logs
```bash
# Application logs
pm2 logs vayva-api

# Health check
curl http://localhost:3001/health
```

### Metrics
- Request count
- Response times
- Error rates
- Active connections

---

## 🤝 Contributing

### Adding New Endpoints

1. Create service in `src/services/[domain]/`
2. Create route file in `src/routes/api/v1/[domain]/`
3. Register route in `src/index.ts`
4. Test thoroughly

Example registration in `src/index.ts`:
```typescript
await server.register(myNewRoutes, { prefix: '/api/v1/my-domain' });
```

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

**Status**: ✅ Production Ready  
**Last Updated**: 2026-03-27  
**Version**: 1.0
