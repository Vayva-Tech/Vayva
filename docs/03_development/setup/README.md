# Development Setup

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This guide will help you set up the Vayva development environment on your local machine.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| pnpm | 9.x | Package manager |
| Git | 2.x+ | Version control |
| Docker | Latest | Local services |

### macOS Setup

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install Docker Desktop
brew install --cask docker
```

### Windows Setup

```powershell
# Install Node.js from nodejs.org
# Download and install pnpm
npm install -g pnpm

# Install Docker Desktop from docker.com
```

### Linux Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
curl -fsSL https://get.docker.com | sh
```

## Repository Setup

### 1. Clone the Repository

```bash
git clone git@github.com:vayva/vayva.git
cd vayva
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vayva"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"

# Paystack (get from Paystack dashboard)
PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_SECRET_KEY="sk_test_..."

# Groq AI (get from Groq console)
GROQ_API_KEY="gsk_..."

# Optional: Evolution WhatsApp
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-api-key"
```

## Local Services

### Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Database Setup

```bash
# Run migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Generate Prisma client
pnpm db:generate
```

## Running Applications

### Marketing Site

```bash
# Terminal 1
cd Frontend/marketing
pnpm dev

# Open http://localhost:3000
```

### Merchant Admin

```bash
# Terminal 2
cd Frontend/merchant-admin
pnpm dev

# Open http://localhost:3001
```

### Storefront

```bash
# Terminal 3
cd Frontend/storefront
pnpm dev

# Open http://localhost:3002
```

### Ops Console

```bash
# Terminal 4
cd Frontend/ops-console
pnpm dev

# Open http://localhost:3003
```

### Core API

```bash
# Terminal 5
cd Backend/core-api
pnpm dev

# API runs on http://localhost:3004
```

### Worker

```bash
# Terminal 6
cd Backend/worker
pnpm dev
```

## Development Workflow

### Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes

3. Run type checking
   ```bash
   pnpm typecheck
   ```

4. Run linting
   ```bash
   pnpm lint
   ```

5. Test your changes
   ```bash
   pnpm test
   ```

6. Commit with conventional commits
   ```bash
   git commit -m "feat: add new feature"
   ```

### Common Commands

```bash
# Clean install
pnpm clean && pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format code
pnpm format
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or change ports in `.env.local`:

```bash
PORT=3005  # Use different port
```

### Database Connection Issues

```bash
# Reset database
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm db:seed
```

### Package Installation Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors

```bash
# Regenerate Prisma client
pnpm db:generate

# Restart TypeScript server in IDE
```

## IDE Setup

### VS Code Extensions

Recommended extensions:

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Importer
- GitLens

### Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Next Steps

1. Read the [Architecture Overview](../architecture/README.md)
2. Review the [API Design](../api-design/README.md)
3. Check out the [Data Model](../data-model/README.md)
4. Join the team Slack channel

---

**Questions?** Contact dev-support@vayva.ng
