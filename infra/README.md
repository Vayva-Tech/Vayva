# `infra/`

This directory holds **database and helper scripts** used alongside the main Prisma schema under `platform/infra/db/`.

- **`db/`** — Prisma-related assets and scripts (see also `platform/infra/db/prisma/` for the canonical schema path used in most docs).
- **`scripts/`** — Operational helpers (e.g. smoke tests, scaffolding).

**Note:** Legacy **AWS Terraform** that previously lived under `infra/terraform/` has been **removed**. Vayva production uses **two VPS servers** plus **Vercel**; see `docs/04_deployment/vps-infrastructure.md`.
