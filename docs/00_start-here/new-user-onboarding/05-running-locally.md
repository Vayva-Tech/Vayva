# Running Vayva Locally (Step-by-step)

This guide is the exact sequence to get a working local environment.

## Goal
- Install dependencies
- Generate Prisma client
- Start dev servers
- Verify endpoints load

## 0) Confirm Node + pnpm
From repo root:
```bash
node -v
pnpm -v
```
Expected:
- Node version satisfies root `package.json` engines (>= 20)
- Ideally matches `.nvmrc` (Node 22)

## 1) Install dependencies
```bash
pnpm install
```
Expected:
- completes without errors

## 2) Configure environment variables
### 2.1 Create your env file
Use `.env.example` as a starting point.

Recommended local approach:
```bash
cp .env.example .env.local
```

### 2.2 Minimum local variables
At minimum, you need:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`

If you run features that require integrations you will also need:
- Paystack keys
- Resend key
- Groq keys
- Evolution API keys

## 3) Database setup
Vayva uses Prisma.

### 3.1 Generate Prisma client
```bash
pnpm -w db:generate
```
Expected:
- generates Prisma client in workspace outputs

### 3.2 Apply schema to DB (dev)
```bash
pnpm -w db:push
```
Expected:
- push completes

### 3.3 Seed (optional)
```bash
pnpm -w db:seed
```

## 4) Run dev servers
Start all dev tasks (Turbo):
```bash
pnpm -w dev
```

This runs multiple apps in parallel.

## 5) Verify apps
The exact ports may vary by app configuration, but verify that each target app loads.

Common local targets (examples):
- Merchant Admin: http://localhost:3000
- Ops Console: http://localhost:3002

## 6) Run checks
### 6.1 Typecheck
```bash
pnpm -w typecheck
```

### 6.2 Lint
```bash
pnpm -w lint
```

### 6.3 Tests
```bash
pnpm -w test
```

Optional:
```bash
pnpm -w test:e2e
```

## Rollback / cleanup
- Stop dev servers with Ctrl+C
- To reset local DB: depends on your Postgres instance; do not run destructive commands unless you’re sure.

## Common failures
### Prisma generate fails
- Check `DATABASE_URL`
- Ensure `pnpm -w db:generate` runs after install

### Dev server fails due to env
- Confirm the app’s `.env.example` under `Frontend/<app>` if present
- Add missing values to `.env.local`
