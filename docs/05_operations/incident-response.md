# Incident Response (Runbook)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Provide a repeatable process to detect, triage, mitigate, and resolve production incidents.

## Severity levels
- **SEV1**: Revenue down / payments broken / data loss / security incident
- **SEV2**: Major feature degraded
- **SEV3**: Minor bug with workaround

## On-call responsibilities
- Acknowledge alerts
- Start an incident log
- Communicate status updates

## Step-by-step
1. **Identify**
   - What is broken?
   - Who is impacted (merchant, customer, ops)?
2. **Stabilize**
   - Stop the bleeding (disable feature flags, rollback, rate-limit)
3. **Mitigate**
   - Apply safest mitigation first
4. **Diagnose**
   - Check logs
   - Check DB health
   - Check queue backlog
5. **Resolve**
   - Deploy fix
   - Validate
6. **Postmortem**
   - Root cause
   - Action items

## Quick checks
- Vercel deployment status
- VPS container status (Evolution/MinIO/Redis)
- Postgres connectivity
- Redis connectivity
- Worker queue backlog

## Communication template
- Impact:
- Start time:
- Current status:
- Mitigation:
- Next update time:

## References
- `platform/scripts/doctor.js` (diagnostics)
