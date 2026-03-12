# Deployment Topology (Vercel + VPS)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
This document describes what runs where in production.

## Vercel
### Projects
Typical Vercel deploys include:
- Merchant Admin (`merchant.vayva.ng`)
- Ops Console (`ops.vayva.ng`)
- Marketing (`vayva.ng`)
- Storefront wildcard (`*.vayva.ng`) (confirm)

### Environment separation
- Production
- Staging

## VPS
### VPS 1 — App Server
- Docker containers:
  - Evolution API (WhatsApp)
  - Redis
  - MinIO
  - Nginx Proxy Manager
- System services:
  - Worker (BullMQ) if not on Vercel

### VPS 2 — DB Server
- PostgreSQL (production database)
- Redis (shared)

## Domains / endpoints
Document canonical endpoints:
- `merchant.vayva.ng`
- `ops.vayva.ng`
- `vayva.ng`
- `storage.vayva.ng` (MinIO proxy)
- `api.vayva.ng` (Evolution API proxy)

## Verification checklist
- Confirm DNS records
- Confirm which project owns which domain
- Confirm webhook callback URLs for Paystack/Kwik/Meta/Evolution
