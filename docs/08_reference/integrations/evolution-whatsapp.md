# Evolution API (WhatsApp Gateway)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Evolution API is the WhatsApp gateway used by Vayva for WhatsApp commerce.

## Where it runs
- VPS 1 (app server) Docker container: `vayva-evolution`
- Exposed via Nginx Proxy Manager as `api.vayva.ng` (proxy to container port 8080)

## Key configuration files
- Docker compose: `platform/scripts/deploy/docker-compose.app.yml`
- App server env template: `platform/scripts/deploy/env.app.example`

## Critical auth rule
Two keys must match:
- `AUTHENTICATION_API_KEY` (Evolution API)
- `EVOLUTION_API_KEY` (worker env)

If they don’t match, WhatsApp actions will fail.

## Redis cache naming
Evolution API v2.x uses:
- `CACHE_REDIS_ENABLED`
- `CACHE_REDIS_URI`

## Instance model
- Primary instance: `vayva-main`
- Multi-tenant instances: `merchant_<storeId>`

Instances are created automatically when merchants link WhatsApp.

## Operational commands
### Check container
```bash
docker ps | grep vayva-evolution
```

### View logs
```bash
docker logs vayva-evolution --tail 200
```

### Create an instance
```bash
curl -s -X POST "http://localhost:8080/instance/create" \
  -H "apikey: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"<NAME>","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

## Common failure modes
- Redis disconnected loop: wrong env var names or missing password
- Baileys restarts: unstable session, check instance storage volume

## Verification
- Manager UI: `https://api.vayva.ng/manager`
- Send a test message through worker outbound flow and confirm delivery.
