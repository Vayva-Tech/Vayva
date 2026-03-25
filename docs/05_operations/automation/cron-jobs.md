# Cron Jobs (Runbook)

> **Audience:** Engineering + Ops  
> **Goal:** Document scheduled jobs, authentication, and troubleshooting.

---

## How cron is implemented

Cron jobs are implemented as HTTP routes and are intended to be called by a scheduler (Vercel Cron, GitHub Actions, or a VPS scheduler).

### Authentication

Most cron routes are protected with a shared secret:
- **Env var**: `CRON_SECRET`
- **Expected behavior (implemented)**: `Authorization: Bearer ${CRON_SECRET}`  
  - Enforced in **production** (`NODE_ENV=production`) for:
    - `Backend/core-api/src/app/api/jobs/cron/autopilot-evaluate/route.ts`
    - `Backend/core-api/src/app/api/jobs/cron/trial-reminders/route.ts`

---

## Current cron routes (known)

| Job | Route (code) | Purpose | Key env vars |
|---|---|---|---|
| Autopilot evaluate | `Backend/core-api/src/app/api/jobs/cron/autopilot-evaluate/route.ts` | Periodic AI/autopilot evaluation loop | `CRON_SECRET`, `AUTOPILOT_CRON_MAX_*` |
| Trial reminders | `Backend/core-api/src/app/api/jobs/cron/trial-reminders/route.ts` | Notify merchants about trial lifecycle | `CRON_SECRET`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` |

Add additional cron jobs here as they’re introduced.

---

## Troubleshooting checklist

- Confirm scheduler is running and calling the route.
- Confirm `CRON_SECRET` is set correctly in the environment.
- Check worker/queue health if the route enqueues jobs.
- Verify Evolution API connectivity if the job sends WhatsApp messages.

