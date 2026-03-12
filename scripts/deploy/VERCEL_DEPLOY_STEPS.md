# Vercel Deploy Steps

## 1. Create Projects (Import from GitHub)
Import the same GitHub repo 4 times, each with a different Root Directory:

| Project | Root Directory | Domains to Add |
|---------|----------------|----------------|
| Marketing | apps/marketing | vayva.ng, www.vayva.ng |
| Marketplace | apps/marketplace | marketplace.vayva.ng |
| Merchant Admin | apps/merchant-admin | merchant.vayva.ng |
| Ops Console | apps/ops-console | ops.vayva.ng |

For each project:
- Framework Preset: Next.js
- Root Directory: apps/[name]
- Install Command: pnpm install
- Build Command: pnpm build
- Output Directory: .next
- Enable: Include source files outside of the Root Directory (monorepo)

## 2. Set Environment Variables
Copy/paste the env vars from VERCEL_ENV_VARS.md for each app.

## 3. Deploy
- Trigger a deployment for each project
- Wait for builds and SSL provisioning

## 4. DNS (Vercel as authoritative)
At your registrar, set nameservers to:
- ns1.vercel-dns.com
- ns2.vercel-dns.com

In Vercel DNS settings, add:
- A record: * → 163.245.209.202 (tenant wildcard)
- A record: appserver → 163.245.209.202 (optional)
- A record: dbserver → 163.245.209.203 (optional)

## 5. Verify
- https://vayva.ng (marketing)
- https://marketplace.vayva.ng
- https://merchant.vayva.ng
- https://ops.vayva.ng
- https://storage.vayva.ng (MinIO via proxy)
- https://api.vayva.ng (Evolution API via proxy)
